import { createAuthClient } from 'better-auth/client';

const baseURL =
  import.meta.env.VITE_API_URL ||
  (typeof window !== 'undefined'
    ? (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:5000'
        : window.location.origin)
    : '');

export const authClient = createAuthClient({
  baseURL,
});
