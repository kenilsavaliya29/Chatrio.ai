import { buildSectionPrompts, assembleRagFromSections, validateRagContextShape } from './rag/schema';
import { extractJsonFromMarkdown, tryJsonParseStrict, withTimeout, sleep, hashScrapeReport } from './rag/utils';
import * as gemini from './rag/providers/gemini';
import * as groq from './rag/providers/groq';
import * as huggingface from './rag/providers/huggingface';
import * as cloudflare from './rag/providers/cloudflare';
import * as ollama from './rag/providers/ollama';

const PROVIDERS = [gemini, groq, huggingface, cloudflare, ollama];

// Enhanced logging utility
function logProviderStatus() {
  console.log('\n🔍 === PROVIDER STATUS CHECK ===');
  PROVIDERS.forEach((provider, index) => {
    const isEnabled = provider.isEnabled();
    const status = isEnabled ? '✅ ENABLED' : '❌ DISABLED';
    const reason = isEnabled ? 'API keys configured' : 'Missing API keys or configuration';
    console.log(`${index + 1}. ${provider.name}: ${status} - ${reason}`);
  });
  console.log('================================\n');
}

async function callWithRetries(provider, prompt, { retries = 1, timeoutMs = 30000 }) {
  let lastErr;
  const providerName = provider.name || 'Unknown Provider';
  
  console.log(`\n🚀 Attempting ${providerName}...`);
  console.log(`📝 Prompt length: ${prompt.length} characters`);
  console.log(`⏱️  Timeout: ${timeoutMs}ms, Retries: ${retries}`);
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      console.log(`🔄 ${providerName} - Attempt ${attempt + 1}/${retries + 1}`);
      
      const startTime = Date.now();
      const text = await provider.generateJson(prompt, { timeoutMs });
      const responseTime = Date.now() - startTime;
      
      console.log(`✅ ${providerName} responded in ${responseTime}ms`);
      console.log(`📄 Raw response length: ${text?.length || 0} characters`);
      console.log(`📄 Raw response preview: ${text?.substring(0, 200)}${text?.length > 200 ? '...' : ''}`);
      
      const cleaned = extractJsonFromMarkdown(text);
      console.log(`🧹 Cleaned response length: ${cleaned?.length || 0} characters`);
      console.log(`🧹 Cleaned response preview: ${cleaned?.substring(0, 200)}${cleaned?.length > 200 ? '...' : ''}`);
      
      const parsed = tryJsonParseStrict(cleaned);
      if (!parsed.ok) {
        console.log(`❌ ${providerName} - JSON Parse Error: ${parsed.error}`);
        console.log(`❌ Failed to parse cleaned text: ${cleaned}`);
        throw new Error(`JSON Parse Error: ${parsed.error}`);
      }
      
      console.log(`✅ ${providerName} - Successfully parsed JSON`);
      console.log(`📊 Parsed data keys: ${Object.keys(parsed.value).join(', ')}`);
      return parsed.value;
      
    } catch (e) {
      lastErr = e;
      console.log(`❌ ${providerName} - Attempt ${attempt + 1} failed: ${e.message}`);
      console.log(`❌ Error type: ${e.constructor.name}`);
      console.log(`❌ Full error:`, e);
      
      // retry on 5xx or explicit timeouts
      const transient = /http\s5\d\d|timed out|overloaded|temporarily|unavailable/i.test(String(e?.message || ''));
      if (!transient || attempt === retries) {
        console.log(`❌ ${providerName} - No more retries (transient: ${transient}, attempt: ${attempt}/${retries})`);
        break;
      }
      
      const delay = 300 + Math.floor(Math.random() * 400);
      console.log(`⏳ ${providerName} - Retrying in ${delay}ms...`);
      await sleep(delay);
    }
  }
  
  console.log(`💥 ${providerName} - All attempts failed. Final error: ${lastErr?.message}`);
  throw lastErr;
}

async function generateSectionWithCascade(sectionName, prompt) {
  console.log(`\n🎯 === GENERATING SECTION: ${sectionName} ===`);
  
  const enabledProviders = PROVIDERS.filter(p => p.isEnabled());
  console.log(`📋 Available providers: ${enabledProviders.map(p => p.name).join(', ')}`);
  
  if (enabledProviders.length === 0) {
    console.log('❌ No providers are enabled! Check your API keys.');
    throw new Error('No providers configured - check your API keys');
  }
  
  let lastErr;
  let attemptCount = 0;
  
  for (const provider of enabledProviders) {
    attemptCount++;
    const providerName = provider.name || 'Unknown Provider';
    
    try {
      console.log(`\n🔄 === PROVIDER ${attemptCount}/${enabledProviders.length}: ${providerName} ===`);
      const data = await callWithRetries(provider, prompt, { retries: 1, timeoutMs: 30000 });
      
      console.log(`✅ SUCCESS with ${providerName} for section: ${sectionName}`);
      console.log(`📊 Generated data structure:`, {
        type: typeof data,
        isArray: Array.isArray(data),
        keys: typeof data === 'object' && data !== null ? Object.keys(data) : 'N/A',
        size: JSON.stringify(data).length
      });
      
      return data;
      
    } catch (e) {
      lastErr = e;
      console.log(`❌ FAILED with ${providerName} for section: ${sectionName}`);
      console.log(`❌ Error: ${e.message}`);
      
      // If this isn't the last provider, show that we're trying the next one
      if (attemptCount < enabledProviders.length) {
        const nextProvider = enabledProviders[attemptCount]?.name || 'Unknown';
        console.log(`⏭️  Moving to next provider: ${nextProvider}`);
      }
    }
  }
  
  console.log(`💥 ALL PROVIDERS FAILED for section: ${sectionName}`);
  console.log(`💥 Final error: ${lastErr?.message || lastErr}`);
  throw new Error(`All providers failed for ${sectionName}: ${lastErr?.message || lastErr}`);
}

export const processScrapingReport = async (reportData) => {
  console.log('\n🧠 ===========================================');
  console.log('🧠 STARTING RAG PROCESSING WITH CASCADE');
  console.log('🧠 ===========================================\n');
  
  // Log initial provider status
  logProviderStatus();
  
  const jsonString = JSON.stringify(reportData);
  const prompts = buildSectionPrompts(jsonString);

  console.log('📊 Scraping report summary:');
  console.log(`   - Report size: ${jsonString.length} characters`);
  console.log(`   - Sections to generate: ${Object.keys(prompts).length}`);
  console.log(`   - Sections: ${Object.keys(prompts).join(', ')}`);

  const sections = {};
  const sectionResults = {};

  for (const [section, prompt] of Object.entries(prompts)) {
    const sectionStartTime = Date.now();
    
    try {
      console.log(`\n📝 Processing section: ${section}`);
      console.log(`📝 Prompt length: ${prompt.length} characters`);
      
      sections[section] = await generateSectionWithCascade(section, prompt);
      const sectionTime = Date.now() - sectionStartTime;
      
      sectionResults[section] = {
        status: 'success',
        time: sectionTime,
        provider: 'cascade_success'
      };
      
      console.log(`✅ Section ${section} completed in ${sectionTime}ms`);
      
    } catch (error) {
      const sectionTime = Date.now() - sectionStartTime;
      sectionResults[section] = {
        status: 'failed',
        time: sectionTime,
        error: error.message
      };
      
      console.log(`💥 Section ${section} FAILED after ${sectionTime}ms: ${error.message}`);
      throw error; // Re-throw to stop processing
    }
  }

  console.log('\n🔧 Assembling final RAG context...');
  const rag = assembleRagFromSections(sections);
  
  console.log('🔍 Validating RAG context structure...');
  console.log('📊 RAG context keys:', Object.keys(rag));
  console.log('📊 COMPREHENSIVE_FAQ_DATABASE type:', Array.isArray(rag.COMPREHENSIVE_FAQ_DATABASE) ? 'array' : typeof rag.COMPREHENSIVE_FAQ_DATABASE);
  console.log('📊 KNOWLEDGE_CHUNKS type:', Array.isArray(rag.KNOWLEDGE_CHUNKS) ? 'array' : typeof rag.KNOWLEDGE_CHUNKS);
  
  const validation = validateRagContextShape(rag);
  if (!validation.ok) {
    console.log(`❌ RAG validation failed: ${validation.error}`);
    console.log('📊 Generated sections:', Object.keys(sections));
    console.log('📊 Section results:', sectionResults);
    throw new Error(`RAG validation failed: ${validation.error}`);
  }
  
  console.log('\n✅ ===========================================');
  console.log('✅ RAG PROCESSING COMPLETED SUCCESSFULLY!');
  console.log('✅ ===========================================');
  console.log('📊 Final Results:');
  console.log(`   - Total sections: ${Object.keys(sections).length}`);
  console.log(`   - Total processing time: ${Object.values(sectionResults).reduce((sum, r) => sum + r.time, 0)}ms`);
  console.log(`   - Section results:`, sectionResults);
  console.log(`   - RAG context size: ${JSON.stringify(rag).length} characters`);
  console.log('===========================================\n');
  
  return rag;
};