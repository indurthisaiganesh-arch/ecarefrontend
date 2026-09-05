import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService, userService } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('ecare_access_token');
    const savedUser = localStorage.getItem('ecare_user');

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error('Failed to parse saved user credentials', e);
        localStorage.removeItem('ecare_access_token');
        localStorage.removeItem('ecare_user');
      }
    }
    setLoading(false);
  }, []);

  const initiateLogin = async (email, password) => {
    const res = await authService.login({ email, password });
    const data = res.data; // { success, data: { requiresOtp, ... } }

    // If admin bypassed 2FA for this user, complete login immediately
    if (data.success && data.data && data.data.requiresOtp === false) {
      const { accessToken, user: userData } = data.data;
      setToken(accessToken);
      setUser(userData);
      localStorage.setItem('ecare_access_token', accessToken);
      localStorage.setItem('ecare_user', JSON.stringify(userData));
    }

    return data; // caller checks data.data.requiresOtp
  };

  const verifyOtp = async (email, otp, purpose = 'LOGIN') => {
    const res = await authService.verifyOtp({ email, otp, purpose });
    if (res.data.success && res.data.data) {
      const { accessToken, user: userData } = res.data.data;
      setToken(accessToken);
      setUser(userData);
      localStorage.setItem('ecare_access_token', accessToken);
      localStorage.setItem('ecare_user', JSON.stringify(userData));
      return userData;
    }
    throw new Error(res.data.message || 'Verification failed');
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (e) {
      // Continue client cleanup even if network request fails
    }
    setToken(null);
    setUser(null);
    localStorage.removeItem('ecare_access_token');
    localStorage.removeItem('ecare_user');
  };

  const refreshProfile = async () => {
    try {
      const res = await userService.getProfile();
      if (res.data.success && res.data.data) {
        setUser(res.data.data);
        localStorage.setItem('ecare_user', JSON.stringify(res.data.data));
      }
    } catch (e) {
      console.error('Failed to refresh profile', e);
    }
  };

  const value = {
    user,
    token,
    role: user?.role || null,
    isAuthenticated: !!token && !!user,
    loading,
    initiateLogin,
    verifyOtp,
    logout,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
