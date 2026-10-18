import { Counter } from './types';

// Vite bakes VITE_API_URL into the bundle at build time. The fallback is for running the frontend locally
// beside the backend, which listens on port 8080.
const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8080/api').replace(/\/+$/, '');

async function request(path: string, init?: RequestInit): Promise<Counter> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });
  if (!response.ok) {
    let message = `The server answered ${response.status}.`;
    try {
      const body = await response.json();
      if (body?.error) message = body.error;
    } catch {
      // The body was not JSON; keep the status message.
    }
    throw new Error(message);
  }
  return (await response.json()) as Counter;
}

export const counterApi = {
  get: () => request('/counter'),
  increment: () => request('/counter/increment', { method: 'POST' }),
  decrement: () => request('/counter/decrement', { method: 'POST' }),
  reset: () => request('/counter/reset', { method: 'POST' }),
  setValue: (value: number) => request('/counter', { method: 'PUT', body: JSON.stringify({ value }) }),
};
