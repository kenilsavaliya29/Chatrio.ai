import { withTimeout } from '../utils';

export function isEnabled() {
  const hasToken = Boolean(process.env.CLOUDFLARE_API_TOKEN);
  const hasAccountId = Boolean(process.env.CLOUDFLARE_ACCOUNT_ID);
  
  if (!hasToken) {
    console.log('🔍 Cloudflare: API token not found in CLOUDFLARE_API_TOKEN');
  }
  if (!hasAccountId) {
    console.log('🔍 Cloudflare: Account ID not found in CLOUDFLARE_ACCOUNT_ID');
  }
  if (hasToken && hasAccountId) {
    console.log('🔍 Cloudflare: Both API token and Account ID found, provider enabled');
  }
  
  return hasToken && hasAccountId;
}

export const name = 'cloudflare-llama-3.1-8b';

export async function generateJson(prompt, { timeoutMs = 30000 } = {}) {
  console.log('🔧 Cloudflare: Preparing API request...');
  
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/@cf/meta/llama-3.1-8b-instruct`;
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`
  };
  const body = { messages: [
    { role: 'system', content: 'Respond ONLY with valid JSON. Do not include markdown fences.' },
    { role: 'user', content: prompt }
  ] };
  
  console.log('🔧 Cloudflare: Sending request to API...');
  console.log(`🔧 Cloudflare: URL: ${url}`);
  console.log(`🔧 Cloudflare: Account ID: ${accountId}`);
  console.log(`🔧 Cloudflare: Prompt length: ${prompt.length} characters`);
  
  const task = (async () => {
    try {
      const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) });
      console.log(`🔧 Cloudflare: Response status: ${res.status} ${res.statusText}`);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.log(`🔧 Cloudflare: Error response body: ${errorText}`);
        throw new Error(`cloudflare http ${res.status}: ${errorText}`);
      }
      
      const json = await res.json();
      console.log('🔧 Cloudflare: Response received, extracting content...');
      console.log(`🔧 Cloudflare: Response structure:`, {
        hasResult: !!json.result,
        hasResponse: !!json.result?.response,
        responseLength: json.result?.response?.length || 0
      });
      
      const content = json.result?.response || '';
      console.log(`🔧 Cloudflare: Content length: ${content.length} characters`);
      return content;
    } catch (error) {
      console.log('🔧 Cloudflare: Request error:', error.message);
      throw error;
    }
  })();
  
  return withTimeout(task, timeoutMs, 'cloudflare');
}


