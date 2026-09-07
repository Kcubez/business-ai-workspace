'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export interface UserSession {
  email: string;
  name: string;
  role: 'admin' | 'user';
  avatarInitials: string;
}

interface AuthContextType {
  user: UserSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_USER: UserSession = {
  email: 'mot@gmail.com',
  name: 'MOT',
  role: 'admin',
  avatarInitials: 'MO',
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check localStorage session
    const saved = localStorage.getItem('mot_auth_session');
    const nextUser = (() => {
      if (saved) {
      try {
          return JSON.parse(saved) as UserSession;
      } catch (e) {
        console.error('Failed to parse session', e);
          return null;
      }
      }
      // Default to DEMO_USER if first visit, so app remains immediately usable
      const hasLoggedOut = localStorage.getItem('mot_has_logged_out');
      if (!hasLoggedOut) {
        localStorage.setItem('mot_auth_session', JSON.stringify(DEMO_USER));
        return DEMO_USER;
      }
      return null;
    })();
    queueMicrotask(() => {
      setUser(nextUser);
      setIsLoading(false);
    });
  }, []);

  const login = (email: string, pass: string) => {
    if (email.trim().toLowerCase() === 'mot@gmail.com' && pass === '12345@Aa') {
      setUser(DEMO_USER);
      localStorage.setItem('mot_auth_session', JSON.stringify(DEMO_USER));
      localStorage.removeItem('mot_has_logged_out');
      toast.success('Signed in successfully');
      router.push('/');
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('mot_auth_session');
    localStorage.setItem('mot_has_logged_out', 'true');
    toast.info('You have been signed out');
    router.push('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
