import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { AuthState, UserInfo, AccountStatus } from '../types/auth';
import { authApi } from '../services/authApi';

interface AuthContextValue extends AuthState {
  profileStatus: AccountStatus;
  profileCompleted: boolean;
  login: (token: string, user: UserInfo) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
  refreshProfileStatus: () => Promise<void>;
  getDashboardRoute: () => string;
  getOnboardingRoute: () => string;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const TOKEN_KEY = 'beyon_token';

function isProfileCompleted(status: AccountStatus): boolean {
  return status === 'COMPLETED' || status === 'ACTIVE' || status === 'PENDING_INSTITUTION_VERIFICATION' || status === 'PENDING_COMPANY_VERIFICATION';
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    loading: true,
    authenticated: false,
  });
  const [profileStatus, setProfileStatus] = useState<AccountStatus>('INCOMPLETE');

  const refreshProfileStatus = useCallback(async () => {
    try {
      const me = await authApi.getMe();
      setProfileStatus(me.profileStatus || 'INCOMPLETE');
      setState(prev => ({ ...prev, user: me }));
    } catch {
      setProfileStatus('INCOMPLETE');
    }
  }, []);

  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setState({ user: null, token: null, loading: false, authenticated: false });
      setProfileStatus('INCOMPLETE');
      return;
    }

    try {
      const user = await authApi.getMe();
      setState({ user, token, loading: false, authenticated: true });
      setProfileStatus(user.profileStatus || 'INCOMPLETE');
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      setState({ user: null, token: null, loading: false, authenticated: false });
      setProfileStatus('INCOMPLETE');
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = (token: string, user: UserInfo) => {
    localStorage.setItem(TOKEN_KEY, token);
    setState({ user, token, loading: false, authenticated: true });
    setProfileStatus(user.profileStatus || 'INCOMPLETE');
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setState({ user: null, token: null, loading: false, authenticated: false });
    setProfileStatus('INCOMPLETE');
  };

  const getDashboardRoute = (): string => {
    const role = state.user?.role;
    if (!role) return '/';
    return `/${role.toLowerCase()}/home`;
  };

  const getOnboardingRoute = (): string => {
    const role = state.user?.role;
    if (!role) return '/login';
    return `/onboarding/${role.toLowerCase()}`;
  };

  return (
    <AuthContext.Provider value={{
      ...state,
      profileStatus,
      profileCompleted: isProfileCompleted(profileStatus),
      login,
      logout,
      refreshUser,
      refreshProfileStatus,
      getDashboardRoute,
      getOnboardingRoute,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
