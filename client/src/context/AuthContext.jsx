import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { api, setUnauthorizedHandler } from '../services/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session via /api/auth/me on mount
  useEffect(() => {
    let isMounted = true;

    async function restoreSession() {
      try {
        const res = await api.getMe();
        if (isMounted && res?.data?.user) {
          setUser(res.data.user);
        }
      } catch {
        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    restoreSession();

    // Hook unauthorized 401 triggers
    setUnauthorizedHandler(() => {
      if (isMounted) {
        setUser(null);
      }
    });

    return () => {
      isMounted = false;
      setUnauthorizedHandler(null);
    };
  }, []);

  const login = useCallback(async ({ email, password }) => {
    const res = await api.login({ email, password });
    if (res?.data?.user) {
      setUser(res.data.user);
    }
    return res;
  }, []);

  const signup = useCallback(async ({ name, email, password }) => {
    const res = await api.signup({ name, email, password });
    if (res?.data?.user) {
      setUser(res.data.user);
    }
    return res;
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.logout();
    } finally {
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      setUser,
      loading,
      isAuthenticated: !!user,
      login,
      signup,
      logout
    }),
    [user, loading, login, signup, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
