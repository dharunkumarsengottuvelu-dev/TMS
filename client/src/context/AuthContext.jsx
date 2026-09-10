import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const checkSession = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const sessionData = await authService.getSession();

      if (sessionData && sessionData.user) {
        setUser(sessionData.user);
        setSession(sessionData.session);
      } else {
        setUser(null);
        setSession(null);
      }
    } catch (err) {
      console.warn('Session verification caught:', err);
      setUser(null);
      setSession(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const login = async ({ email, password }) => {
    setError(null);
    try {
      const data = await authService.login({ email, password });
      setUser(data.user);
      setSession(data.session);
      return data.user;
    } catch (err) {
      setError(err.message || 'Login failed');
      throw err;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
      setSession(null);
    }
  };

  const value = {
    user,
    session,
    loading,
    error,
    login,
    logout,
    refreshSession: checkSession,
    isAdmin: user?.role === 'ADMIN',
    isEmployee: user?.role === 'EMPLOYEE',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
