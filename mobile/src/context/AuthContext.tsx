import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiFetch, setAuthToken } from '../config/api';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'STUDENT' | 'INSTITUTION' | 'COMPANY' | 'ADMIN';
  avatarUrl?: string;
  headline?: string;
  coins?: number;
  xpPoints?: number;
  streakDays?: number;
  institutionName?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (name: string, email: string, pass: string, role: string) => Promise<void>;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial mock / guest session initialization
    const initGuest = () => {
      const defaultUser: User = {
        id: 'usr-student-01',
        name: 'Gowtham K',
        email: 'gowtham@example.com',
        role: 'STUDENT',
        headline: 'AI & GPU Systems Engineering Student',
        coins: 340,
        xpPoints: 1850,
        streakDays: 7,
        institutionName: 'National Institute of Technology',
      };
      setUser(defaultUser);
      setToken('mock-jwt-token-mobile');
      setAuthToken('mock-jwt-token-mobile');
      setLoading(false);
    };
    initGuest();
  }, []);

  const login = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const res = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password: pass }),
      });
      const jwt = res.data?.accessToken || res.accessToken || 'token-session';
      const usr = res.data?.user || res.user || {
        id: 'usr-mobile',
        email,
        name: email.split('@')[0],
        role: 'STUDENT',
        coins: 200,
        xpPoints: 1200,
        streakDays: 4,
      };
      setToken(jwt);
      setAuthToken(jwt);
      setUser(usr);
    } catch {
      // Fallback for offline / demo testing
      const mockUser: User = {
        id: 'usr-demo',
        email,
        name: email.split('@')[0].toUpperCase(),
        role: 'STUDENT',
        headline: 'Competency Benchmarking Scholar',
        coins: 250,
        xpPoints: 1400,
        streakDays: 5,
      };
      setUser(mockUser);
      setToken('demo-token');
      setAuthToken('demo-token');
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, pass: string, role: string) => {
    setLoading(true);
    try {
      const res = await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password: pass, role }),
      });
      const jwt = res.data?.accessToken || res.accessToken || 'token-session';
      setToken(jwt);
      setAuthToken(jwt);
      setUser({
        id: 'usr-new',
        name,
        email,
        role: role as any,
        coins: 100,
        xpPoints: 500,
        streakDays: 1,
      });
    } catch {
      setUser({
        id: 'usr-new',
        name,
        email,
        role: role as any,
        coins: 100,
        xpPoints: 500,
        streakDays: 1,
      });
      setToken('demo-token');
      setAuthToken('demo-token');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setAuthToken(null);
  };

  const updateUser = (data: Partial<User>) => {
    setUser(prev => (prev ? { ...prev, ...data } : null));
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUser }}>
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
