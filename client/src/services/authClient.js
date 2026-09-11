import { createAuthClient } from 'better-auth/client';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const authClient = createAuthClient({
  baseURL,
});
