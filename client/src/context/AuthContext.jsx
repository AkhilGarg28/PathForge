import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api, { setOnUnauthorized } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const clearAuth = useCallback(() => {
    setUser(null);
  }, []);

  useEffect(() => {
    // Register unauthorized listener
    setOnUnauthorized(clearAuth);

    const checkAuth = async () => {
      try {
        const response = await api.get('/auth/me');
        if (response.data && response.data.user) {
          setUser(response.data.user);
        }
      } catch (err) {
        // User not logged in, silent failure for initial check
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [clearAuth]);

  const login = async (credentials) => {
    setError(null);
    try {
      const response = await api.post('/auth/login', credentials);
      const userData = response.data.user;
      setUser(userData);
      return userData;
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to login';
      setError(message);
      throw err;
    }
  };

  const signup = async (formData) => {
    setError(null);
    try {
      const response = await api.post('/auth/signup', formData);
      const userData = response.data.user;
      setUser(userData);
      return userData;
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to sign up';
      setError(message);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
    }
  };

  const loginAsDemo = (role = 'MERN Developer') => {
    const demoUser = {
      id: 'demo-learner-1',
      name: 'Alex Demo Learner',
      email: 'demo@pathforge.local',
      targetRole: role,
    };
    setUser(demoUser);
    return demoUser;
  };

  const updateUserState = (updatedUser) => {
    setUser((prev) => ({ ...prev, ...updatedUser }));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        signup,
        logout,
        loginAsDemo,
        updateUserState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
