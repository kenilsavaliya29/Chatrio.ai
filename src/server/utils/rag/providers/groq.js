import { withTimeout } from '../utils';

export function isEnabled() {
  const hasKey = Boolean(process.env.GROQ_API_KEY);
  if (!hasKey) {
    console.log('🔍 Groq: API key not found in GROQ_API_KEY');
  } else {
    console.log('🔍 Groq: API key found, provider enabled');
  }
  return hasKey;
}

export const name = 'groq-llama-3.1-70b';

export async function generateJson(prompt, { timeoutMs = 30000 } = {}) {
  console.log('🔧 Groq: Preparing API request...');
  
  const url = 'https://api.groq.com/openai/v1/chat/completions';
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
  };
  const body = {
    model: 'llama-3.1-70b-versatile',
    messages: [
      { role: 'system', content: 'Respond ONLY with valid JSON. Do not include markdown fences.' },
      { role: 'user', content: prompt }
    ],
    temperature: 0.2,
    response_format: { type: 'json_object' }
  };
  
  console.log('🔧 Groq: Sending request to API...');
  console.log(`🔧 Groq: URL: ${url}`);
  console.log(`🔧 Groq: Model: ${body.model}`);
  console.log(`🔧 Groq: Prompt length: ${prompt.length} characters`);
  
  const task = (async () => {
    try {
      const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) });
      console.log(`🔧 Groq: Response status: ${res.status} ${res.statusText}`);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.log(`🔧 Groq: Error response body: ${errorText}`);
        throw new Error(`groq http ${res.status}: ${errorText}`);
      }
      
      const json = await res.json();
      console.log('🔧 Groq: Response received, extracting content...');
      console.log(`🔧 Groq: Response structure:`, {
        hasChoices: !!json.choices,
        choicesLength: json.choices?.length || 0,
        hasMessage: !!json.choices?.[0]?.message,
        hasContent: !!json.choices?.[0]?.message?.content
      });
      
      const content = json.choices?.[0]?.message?.content || '';
      console.log(`🔧 Groq: Content length: ${content.length} characters`);
      return content;
    } catch (error) {
      console.log('🔧 Groq: Request error:', error.message);
      throw error;
    }
  })();
  
  return withTimeout(task, timeoutMs, 'groq');
}


