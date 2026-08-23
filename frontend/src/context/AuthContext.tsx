import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserProfile } from '../types';
import { ApiClient } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  updateProfile: (profile: Partial<UserProfile>, otherData?: { name?: string; phone?: string }) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('karmix_token'));
  const [loading, setLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    try {
      if (!localStorage.getItem('karmix_token')) {
        setUser(null);
        setLoading(false);
        return;
      }
      const res = await ApiClient.getMe();
      if (res.success && res.user) {
        setUser(res.user);
      } else {
        setUser(null);
        localStorage.removeItem('karmix_token');
      }
    } catch (err) {
      console.warn('Failed to restore session:', err);
      setUser(null);
      localStorage.removeItem('karmix_token');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await ApiClient.login({ email, password });
    if (res.success && res.token) {
      localStorage.setItem('karmix_token', res.token);
      setToken(res.token);
      setUser(res.user);
    }
  };

  const register = async (data: any) => {
    const res = await ApiClient.register(data);
    if (res.success && res.token) {
      localStorage.setItem('karmix_token', res.token);
      setToken(res.token);
      setUser(res.user);
    }
  };

  const logout = () => {
    localStorage.removeItem('karmix_token');
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (profile: Partial<UserProfile>, otherData?: { name?: string; phone?: string }) => {
    const res = await ApiClient.updateProfile({
      profile,
      name: otherData?.name,
      phone: otherData?.phone,
    });
    if (res.success && res.user) {
      setUser(res.user);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'ADMIN',
        loading,
        login,
        register,
        logout,
        updateProfile,
        refreshUser,
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
