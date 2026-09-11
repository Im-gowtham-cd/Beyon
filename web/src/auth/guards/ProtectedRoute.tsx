import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getRoleTier } from '../types/auth';

export function ProtectedRoute() {
  const { authenticated, loading, user, profileStatus } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: 'var(--space-md)' }}>
        <div style={{ width: 40, height: 40, background: 'var(--color-primary)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-heading)', fontWeight: 'var(--font-bold)', color: 'var(--color-black)' }}>B</div>
        <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>Restoring your session...</p>
      </div>
    );
  }

  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }

  const path = location.pathname;

  if (profileStatus === 'REJECTED' || user?.status === 'REJECTED') {
    if (path !== '/account-rejected') {
      return <Navigate to="/account-rejected" replace />;
    }
    return <Outlet />;
  }

  if (profileStatus === 'SUSPENDED' || user?.status === 'SUSPENDED') {
    if (path !== '/account-suspended') {
      return <Navigate to="/account-suspended" replace />;
    }
    return <Outlet />;
  }

  if (path.startsWith('/onboarding/')) {
    return <Outlet />;
  }

  if (profileStatus === 'INCOMPLETE') {
    const tier = getRoleTier(user?.role);
    if (tier === 'SUPER_ADMIN') {
      return <Outlet />;
    }
    const onboardingTier = tier.toLowerCase();
    return <Navigate to={`/onboarding/${onboardingTier}`} replace />;
  }

  if (
    profileStatus === 'PENDING_SUPER_ADMIN_VERIFICATION' ||
    profileStatus === 'PENDING_INSTITUTION_VERIFICATION' ||
    profileStatus === 'PENDING_COMPANY_VERIFICATION' ||
    profileStatus === 'PENDING_VERIFICATION'
  ) {
    if (!path.startsWith('/verification-pending')) {
      return <Navigate to="/verification-pending" replace />;
    }
    return <Outlet />;
  }

  return <Outlet />;
}

