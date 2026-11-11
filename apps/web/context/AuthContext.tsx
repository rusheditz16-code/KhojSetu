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
  usersList: User[];
  isLoading: boolean;
  isAuthenticated: boolean;
  isModerator: boolean;
  isLoginModalOpen: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  loginWithGoogle: (data: { email: string; name?: string; avatarUrl?: string; role?: string }) => Promise<void>;
  switchUser: (userId: string) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as any);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const fetchUsersAndProfile = async () => {
    try {
      setIsLoading(true);
      const [usersData, meData] = await Promise.all([
        apiRequest<{ users: User[] }>('/auth/users').catch(() => ({ users: [] })),
        apiRequest<{ user: User | null }>('/auth/me').catch(() => ({ user: null })),
      ]);
      setUsersList(usersData.users || []);

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

      if (meData?.user) {
        setCurrentUser(meData.user);
        setActiveUserId(meData.user.id);
      } else {
        setCurrentUser(null);
        setActiveUserId('');
      }
    } catch (err) {
      console.warn('Auth context init note:', err);
      setCurrentUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsersAndProfile();
  }, []);

  const loginWithGoogle = async (data: { email: string; name?: string; avatarUrl?: string; role?: string }) => {
    try {
      setIsLoading(true);

      // Auto-derive clean display name from email if not given
      let name = data.name?.trim();
      if (!name) {
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
      localStorage.setItem('khojsetu_google_user', JSON.stringify(user));
      setIsLoginModalOpen(false);

      // Refresh users list so new user appears everywhere
      const usersData = await apiRequest<{ users: User[] }>('/auth/users').catch(() => ({ users: [] }));
      setUsersList(usersData.users || []);
    } catch (err) {
      console.error('Google login failed:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const switchUser = async (userId: string) => {
    setActiveUserId(userId);
    const target = usersList.find((u) => u.id === userId);
    if (target) {
      setCurrentUser(target);
      localStorage.setItem('khojsetu_google_user', JSON.stringify(target));
    } else {
      await fetchUsersAndProfile();
    }
  };

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('khojsetu_google_user');
      localStorage.removeItem('khojsetu_user_id');
    }
    setActiveUserId('');
    setCurrentUser(null);
  };

  const isModerator = currentUser?.role === 'MODERATOR' || currentUser?.role === 'ADMIN';
  const isAuthenticated = !!currentUser;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        usersList,
        isLoading,
        isAuthenticated,
        isModerator,
        isLoginModalOpen,
        openLoginModal: () => setIsLoginModalOpen(true),
        closeLoginModal: () => setIsLoginModalOpen(false),
        loginWithGoogle,
        switchUser,
        logout,
        refreshProfile: fetchUsersAndProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
