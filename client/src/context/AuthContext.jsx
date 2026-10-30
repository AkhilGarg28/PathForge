import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import * as api from '../services/api.js';
import { AuthContext } from './authContextDef.js';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const checkSession = useCallback(async () => {
    try {
      const data = await api.getMe();
      setUser(data?.user || null);
      return data?.user || null;
    } catch {
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const data = await api.getMe();
      setUser(data?.user || null);
      return data?.user || null;
    } catch {
      setUser(null);
      return null;
    }
  }, []);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const data = await api.login({ email, password });
      setUser(data?.user || null);
      return data;
    } finally {
      setLoading(false);
    }
  }, []);

  const signup = useCallback(async (name, email, password) => {
    setLoading(true);
    try {
      const data = await api.signup({ name, email, password });
      setUser(data?.user || null);
      return data;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await api.logout();
    } finally {
      setUser(null);
      setLoading(false);
    }
  }, []);

  // Global 401 Unauthorized handler
  useEffect(() => {
    const unsubscribe = api.onUnauthorized(() => {
      setUser(null);
      navigate('/login', {
        replace: true,
        state: {
          message: 'Session expired, please log in again',
        },
      });
    });

    return () => {
      unsubscribe();
    };
  }, [navigate]);

  // Initial session check on application mount
  useEffect(() => {
    let ignore = false;
    api
      .getMe()
      .then((data) => {
        if (!ignore) {
          setUser(data?.user || null);
        }
      })
      .catch(() => {
        if (!ignore) {
          setUser(null);
        }
      })
      .finally(() => {
        if (!ignore) {
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    refreshUser,
    checkSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
