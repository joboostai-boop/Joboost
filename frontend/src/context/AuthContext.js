import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../lib/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem('joboost_token');
    if (!token) {
      setLoading(false);
      setIsAuthenticated(false);
      return;
    }

    try {
      const response = await authAPI.getMe();
      setUser(response.data);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('joboost_token');
      localStorage.removeItem('joboost_user');
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (email, password) => {
    const response = await authAPI.login({ email, password });
    const { token, user: userData } = response.data;
    localStorage.setItem('joboost_token', token);
    localStorage.setItem('joboost_user', JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
    return userData;
  };

  const register = async (name, email, password) => {
    const response = await authAPI.register({ name, email, password });
    const { token, user: userData } = response.data;
    localStorage.setItem('joboost_token', token);
    localStorage.setItem('joboost_user', JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
    return userData;
  };

  const handleOAuthSession = async (sessionId) => {
    const response = await authAPI.handleSession(sessionId);
    const { token, user: userData } = response.data;
    localStorage.setItem('joboost_token', token);
    localStorage.setItem('joboost_user', JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
    return userData;
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
    localStorage.removeItem('joboost_token');
    localStorage.removeItem('joboost_user');
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateUser = (updates) => {
    setUser((prev) => ({ ...prev, ...updates }));
    const stored = JSON.parse(localStorage.getItem('joboost_user') || '{}');
    localStorage.setItem('joboost_user', JSON.stringify({ ...stored, ...updates }));
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    handleOAuthSession,
    updateUser,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
