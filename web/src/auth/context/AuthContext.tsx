import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { AuthState, UserInfo } from '../types/auth';
import { authApi } from '../services/authApi';

interface AuthContextValue extends AuthState {
  login: (token: string, user: UserInfo) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const TOKEN_KEY = 'beyon_token';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    loading: true,
    authenticated: false,
  });

  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setState({ user: null, token: null, loading: false, authenticated: false });
      return;
    }

    try {
      const user = await authApi.getMe();
      setState({ user, token, loading: false, authenticated: true });
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      setState({ user: null, token: null, loading: false, authenticated: false });
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = (token: string, user: UserInfo) => {
    localStorage.setItem(TOKEN_KEY, token);
    setState({ user, token, loading: false, authenticated: true });
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setState({ user: null, token: null, loading: false, authenticated: false });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
