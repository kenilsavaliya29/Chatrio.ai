import crypto from 'crypto';

export function stableStringify(value) {
  return JSON.stringify(value, Object.keys(value).sort());
}

export function hashScrapeReport(report) {
  const json = typeof report === 'string' ? report : JSON.stringify(report);
  return crypto.createHash('sha256').update(json).digest('hex');
}

export function tryJsonParseStrict(text) {
  try {
    return { ok: true, value: JSON.parse(text) };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

export function extractJsonFromMarkdown(text) {
  const match = text.match(/```json\n([\s\S]*?)\n```/);
  if (match && match[1]) return match[1];
  return text;
}

export function withTimeout(promise, ms, label) {
  let timeoutId;
  const timeout = new Promise((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(`${label || 'operation'} timed out after ${ms}ms`)), ms);
  });
  return Promise.race([promise.finally(() => clearTimeout(timeoutId)), timeout]);
}

export function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}


