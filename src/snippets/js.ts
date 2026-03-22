export const code = `\
// Async data fetcher with retry logic
const MAX_RETRIES = 3;
const BASE_URL = \`https://api.example.com\`;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchWithRetry(endpoint, options = {}) {
  const url = \`\${BASE_URL}\${endpoint}\`;
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(url, options);
      if (!response.ok) throw new Error(\`HTTP \${response.status}\`);
      return await response.json();
    } catch (err) {
      if (attempt === MAX_RETRIES - 1) throw err;
      await delay(100 * 2 ** attempt);
    }
  }
}

class EventBus {
  #listeners = new Map();

  on(event, handler) {
    const handlers = this.#listeners.get(event) ?? [];
    this.#listeners.set(event, [...handlers, handler]);
    return () => this.off(event, handler);
  }

  off(event, handler) {
    const handlers = (this.#listeners.get(event) ?? []).filter((h) => h !== handler);
    this.#listeners.set(event, handlers);
  }

  emit(event, ...args) {
    (this.#listeners.get(event) ?? []).forEach((h) => h(...args));
  }
}

const slugify = (text) => text.toLowerCase().replace(/[^\\w]+/g, '-');

export { fetchWithRetry, EventBus, slugify };`;
