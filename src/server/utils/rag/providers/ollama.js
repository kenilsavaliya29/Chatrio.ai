import { withTimeout } from '../utils';

export function isEnabled() {
  const baseUrl = process.env.OLLAMA_BASE_URL;
  if (!baseUrl) {
    console.log('🔍 Ollama: Base URL not found in OLLAMA_BASE_URL');
    return false;
  }
  try {
    const url = new URL(baseUrl);
    const isValid = Boolean(url.protocol && url.host);
    if (isValid) {
      console.log('🔍 Ollama: Valid base URL found, provider enabled');
    } else {
      console.log('🔍 Ollama: Invalid base URL format');
    }
    return isValid;
  } catch (error) {
    console.log('🔍 Ollama: Invalid base URL format:', error.message);
    return false;
  }
}

export const name = 'ollama-llama3-8b';

export async function generateJson(prompt, { timeoutMs = 30000 } = {}) {
  console.log('🔧 Ollama: Preparing API request...');
  
  const baseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:3000';
  let url;
  try {
    const parsed = new URL(baseUrl);
    url = `${parsed.origin}/api/generate`;
  } catch (e) {
    console.log('🔧 Ollama: Invalid base URL:', e.message);
    throw new Error('Invalid OLLAMA_BASE_URL');
  }
  
  const headers = { 'Content-Type': 'application/json' };
  const body = {
    model: 'llama3',
    prompt: `Respond ONLY with valid JSON. Do not include markdown fences.\n\n${prompt}`,
    stream: false,
    options: { temperature: 0.2 }
  };
  
  console.log('🔧 Ollama: Sending request to API...');
  console.log(`🔧 Ollama: URL: ${url}`);
  console.log(`🔧 Ollama: Model: ${body.model}`);
  console.log(`🔧 Ollama: Prompt length: ${prompt.length} characters`);
  
  const task = (async () => {
    try {
      const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) });
      console.log(`🔧 Ollama: Response status: ${res.status} ${res.statusText}`);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.log(`🔧 Ollama: Error response body: ${errorText}`);
        throw new Error(`ollama http ${res.status}: ${errorText}`);
      }
      
      const json = await res.json();
      console.log('🔧 Ollama: Response received, extracting content...');
      console.log(`🔧 Ollama: Response structure:`, {
        hasResponse: !!json.response,
        responseLength: json.response?.length || 0,
        hasError: !!json.error
      });
      
      const content = json.response || '';
      console.log(`🔧 Ollama: Content length: ${content.length} characters`);
      return content;
    } catch (error) {
      console.log('🔧 Ollama: Request error:', error.message);
      throw error;
    }
  })();
  
  return withTimeout(task, timeoutMs, 'ollama');
}

