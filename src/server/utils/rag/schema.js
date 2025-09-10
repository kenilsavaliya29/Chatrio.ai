// Minimal schema and validation helpers for the RAG context

export const REQUIRED_TOP_LEVEL_KEYS = [
  'BUSINESS_PROFILE',
  'COMPREHENSIVE_FAQ_DATABASE',
  'CHATBOT_PERSONALITY',
  'RESPONSE_TEMPLATES',
  'KNOWLEDGE_CHUNKS'
];

export function validateRagContextShape(candidate) {
  if (!candidate || typeof candidate !== 'object') return { ok: false, error: 'RAG context is not an object' };
  for (const key of REQUIRED_TOP_LEVEL_KEYS) {
    if (!(key in candidate)) return { ok: false, error: `Missing top-level key: ${key}` };
  }
  if (!Array.isArray(candidate.COMPREHENSIVE_FAQ_DATABASE)) return { ok: false, error: 'COMPREHENSIVE_FAQ_DATABASE must be an array' };
  if (!Array.isArray(candidate.KNOWLEDGE_CHUNKS)) return { ok: false, error: 'KNOWLEDGE_CHUNKS must be an array' };
  return { ok: true };
}

export function buildSectionPrompts(scrapingReportJsonString) {
  return {
    BUSINESS_PROFILE: `Create a JSON object with business profile information based on the provided scraping report. Output ONLY the JSON object, not wrapped in any other structure. Report: ${scrapingReportJsonString}`,
    COMPREHENSIVE_FAQ_DATABASE: `Create a JSON array with at least 20 FAQ items based on the provided scraping report. Each FAQ should have "question" and "answer" fields. Output ONLY the JSON array, not wrapped in any other structure. Report: ${scrapingReportJsonString}`,
    CHATBOT_PERSONALITY: `Create a JSON object with chatbot personality information (tone, style, phrases) based on the provided scraping report. Output ONLY the JSON object, not wrapped in any other structure. Report: ${scrapingReportJsonString}`,
    RESPONSE_TEMPLATES: `Create a JSON object with response templates (welcomes, fallbacks, CTAs) based on the provided scraping report. Output ONLY the JSON object, not wrapped in any other structure. Report: ${scrapingReportJsonString}`,
    KNOWLEDGE_CHUNKS: `Create a JSON array of small knowledge entries with categories and keywords based on the provided scraping report. Each entry should have "category", "keywords", and "text" fields. Output ONLY the JSON array, not wrapped in any other structure. Report: ${scrapingReportJsonString}`
  };
}

export function assembleRagFromSections(sections) {
  const result = {};
  for (const key of REQUIRED_TOP_LEVEL_KEYS) {
    if (sections[key] !== undefined) {
      
      if (key === 'COMPREHENSIVE_FAQ_DATABASE' && sections[key][key]) {
        result[key] = sections[key][key]; // Extract the array from the wrapper
      } else if (key === 'RESPONSE_TEMPLATES' && sections[key][key]) {
        result[key] = sections[key][key]; 
      } else {
        result[key] = sections[key];
      }
    }
  }
  return result;
}


