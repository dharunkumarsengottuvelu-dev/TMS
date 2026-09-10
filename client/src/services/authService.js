import { authClient } from './authClient.js';

export const authService = {
  async login({ email, password }) {
    const result = await authClient.signIn.email({
      email,
      password,
    });

    if (result.error) {
      throw new Error(result.error.message || 'Authentication failed');
    }

    return result.data;
  },

  async logout() {
    await authClient.signOut();
  },

  async getSession() {
    const session = await authClient.getSession();
    return session.data;
  },
};
