'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiRequest, getActiveUserId, setActiveUserId } from '../lib/api';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  studentId?: string;
  phoneContact?: string;
  avatarUrl?: string;
}

interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isModerator: boolean;
  isLoginModalOpen: boolean;
  authModalMode: 'signin' | 'signup';
  openLoginModal: (mode?: 'signin' | 'signup' | any) => void;
  closeLoginModal: () => void;
  loginWithGoogle: (data: { email?: string; name?: string; credential?: string; avatarUrl?: string }) => Promise<void>;
  loginWithEmail: (data: { email: string; password?: string }) => Promise<void>;
  signupWithEmail: (data: { email: string; password?: string; name?: string }) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as any);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin');

  const fetchProfile = async () => {
    try {
      setIsLoading(true);

      const savedStoredUser = typeof window !== 'undefined' ? localStorage.getItem('khojsetu_google_user') : null;
      if (savedStoredUser) {
        try {
          const parsed = JSON.parse(savedStoredUser);
          if (parsed && parsed.id) {
            setCurrentUser(parsed);
            setActiveUserId(parsed.id);
            return;
          }
        } catch (e) {}
      }

      // If active user id is saved in localStorage, query profile
      const activeId = getActiveUserId();
      if (activeId) {
        const meData = await apiRequest<{ user: User | null }>('/auth/me').catch(() => ({ user: null }));
        if (meData?.user) {
          setCurrentUser(meData.user);
          setActiveUserId(meData.user.id);
          localStorage.setItem('khojsetu_google_user', JSON.stringify(meData.user));
          return;
        }
      }

      // Otherwise treat as guest
      setCurrentUser(null);
      setActiveUserId('');
    } catch (err) {
      console.warn('Auth context init note:', err);
      setCurrentUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const loginWithGoogle = async (data: { email?: string; name?: string; credential?: string; avatarUrl?: string }) => {
    try {
      setIsLoading(true);

      // Auto-derive clean display name from email if not given
      let name = data.name?.trim();
      if (!name && data.email) {
        const prefix = data.email.split('@')[0].replace(/[._-]/g, ' ');
        name = prefix
          .split(' ')
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ');
      }

      const res = await apiRequest<{ user: User; token: string }>('/auth/google', {
        method: 'POST',
        body: JSON.stringify({
          ...data,
          name,
        }),
      });

      const user = res.user;
      setCurrentUser(user);
      setActiveUserId(user.id);
      if (typeof window !== 'undefined') {
        localStorage.setItem('khojsetu_google_user', JSON.stringify(user));
      }
      setIsLoginModalOpen(false);
    } catch (err) {
      console.error('Google login failed:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithEmail = async (data: { email: string; password?: string }) => {
    return loginWithGoogle({ email: data.email });
  };

  const signupWithEmail = async (data: { email: string; password?: string; name?: string }) => {
    return loginWithGoogle({ email: data.email, name: data.name });
  };

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('khojsetu_google_user');
      localStorage.removeItem('khojsetu_user_id');
    }
    setActiveUserId('');
    setCurrentUser(null);
  };

  const openLoginModal = (mode?: any) => {
    setAuthModalMode(mode === 'signup' ? 'signup' : 'signin');
    setIsLoginModalOpen(true);
  };

  const isModerator = currentUser?.role === 'MODERATOR' || currentUser?.role === 'ADMIN';
  const isAuthenticated = !!currentUser;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isLoading,
        isAuthenticated,
        isModerator,
        isLoginModalOpen,
        authModalMode,
        openLoginModal,
        closeLoginModal: () => setIsLoginModalOpen(false),
        loginWithGoogle,
        loginWithEmail,
        signupWithEmail,
        logout,
        refreshProfile: fetchProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
