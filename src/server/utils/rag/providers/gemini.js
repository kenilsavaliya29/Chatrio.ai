import { GoogleGenerativeAI } from '@google/generative-ai';
import { extractJsonFromMarkdown, withTimeout } from '../utils';

export function isEnabled() {
  const hasKey = Boolean(process.env.GOOGLE_GENAI_API_KEY);
  if (!hasKey) {
    console.log('🔍 Gemini: API key not found in GOOGLE_GENAI_API_KEY');
  } else {
    console.log('🔍 Gemini: API key found, provider enabled');
  }
  return hasKey;
}

export const name = 'gemini-2.5-flash';

export async function generateJson(prompt, { timeoutMs = 30000 } = {}) {
  console.log('🔧 Gemini: Initializing Google Generative AI...');
  
  try {
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENAI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    console.log('🔧 Gemini: Model initialized, generating content...');
    
    const task = (async () => {
      try {
        const result = await model.generateContent(prompt);
        console.log('🔧 Gemini: Content generated, processing response...');
        
        const response = await result.response;
        const text = response.text();
        
        console.log('🔧 Gemini: Raw response received, extracting JSON...');
        return extractJsonFromMarkdown(text);
      } catch (error) {
        console.log('🔧 Gemini: Error in content generation:', error.message);
        throw error;
      }
    })();
    
    return withTimeout(task, timeoutMs, 'gemini');
  } catch (error) {
    console.log('🔧 Gemini: Initialization error:', error.message);
    throw error;
  }
}


