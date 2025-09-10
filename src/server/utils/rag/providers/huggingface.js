import { withTimeout } from '../utils';

export function isEnabled() {
  const hasKey = Boolean(process.env.HUGGINGFACE_API_TOKEN);
  if (!hasKey) {
    console.log('🔍 HuggingFace: API token not found in HUGGINGFACE_API_TOKEN');
  } else {
    console.log('🔍 HuggingFace: API token found, provider enabled');
  }
  return hasKey;
}

export const name = 'huggingface-inference';

// Defaults to a commonly accessible instruct model; can be overridden via env
function getModelId() {
  return process.env.HUGGINGFACE_MODEL_ID || 'mistralai/Mistral-7B-Instruct-v0.2';
}

export async function generateJson(prompt, { timeoutMs = 30000 } = {}) {
  console.log('🔧 HuggingFace: Preparing API request...');
  
  const modelId = getModelId();
  const url = `https://api-inference.huggingface.co/models/${encodeURIComponent(modelId)}`;
  const headers = {
    'Authorization': `Bearer ${process.env.HUGGINGFACE_API_TOKEN}`,
    'Content-Type': 'application/json'
  };
  const body = {
    inputs: `Respond ONLY with valid JSON. Do not include markdown fences.\n\n${prompt}`,
    parameters: {
      max_new_tokens: 1024,
      temperature: 0.2,
      return_full_text: false
    }
  };

  console.log('🔧 HuggingFace: Sending request to API...');
  console.log(`🔧 HuggingFace: URL: ${url}`);
  console.log(`🔧 HuggingFace: Model: ${modelId}`);
  console.log(`🔧 HuggingFace: Prompt length: ${prompt.length} characters`);

  const task = (async () => {
    try {
      const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) });
      console.log(`🔧 HuggingFace: Response status: ${res.status} ${res.statusText}`);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.log(`🔧 HuggingFace: Error response body: ${errorText}`);
        throw new Error(`huggingface http ${res.status}: ${errorText}`);
      }
      
      const json = await res.json();
      console.log('🔧 HuggingFace: Response received, extracting content...');
      console.log(`🔧 HuggingFace: Response structure:`, {
        isArray: Array.isArray(json),
        arrayLength: Array.isArray(json) ? json.length : 'N/A',
        hasGeneratedText: Array.isArray(json) ? !!json[0]?.generated_text : !!json.generated_text
      });
      
      // HF returns array of objects with generated_text for text-generation
      const text = Array.isArray(json) ? (json[0]?.generated_text || '') : (json.generated_text || '');
      console.log(`🔧 HuggingFace: Content length: ${text.length} characters`);
      return text;
    } catch (error) {
      console.log('🔧 HuggingFace: Request error:', error.message);
      throw error;
    }
  })();

  return withTimeout(task, timeoutMs, 'huggingface');
}


