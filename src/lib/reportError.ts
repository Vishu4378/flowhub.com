import { API_URL } from './api';

const BASE_URL = `${API_URL}/api`;
const sent = new Set<string>();

/**
 * Sends a browser crash to the API, which emails it to the team. Best effort:
 * each distinct error is sent once per page load, and failures are ignored.
 */
export function reportError(error: unknown) {
  if (typeof window === 'undefined') return;
  const err = error instanceof Error ? error : new Error(String(error));
  const key = `${err.name}:${err.message}`;
  if (sent.has(key)) return;
  sent.add(key);

  const body = JSON.stringify({
    message: `${err.name}: ${err.message}`.slice(0, 500),
    stack: err.stack?.slice(0, 8000),
    // Path only: query strings can hold reset or invite tokens.
    url: `${window.location.origin}${window.location.pathname}`.slice(0, 500),
    userAgent: navigator.userAgent.slice(0, 300),
  });
  try {
    void fetch(`${BASE_URL}/client-errors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
    }).catch(() => {});
  } catch {
    // Never let reporting cause another error.
  }
}
