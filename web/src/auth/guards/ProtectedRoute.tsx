import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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

  // Rejection takes absolute priority
  if (profileStatus === 'REJECTED' || user?.status === 'REJECTED') {
    if (path !== '/account-rejected') {
      return <Navigate to="/account-rejected" replace />;
    }
    return <Outlet />;
  }

  // Account Suspension
  if (profileStatus === 'SUSPENDED' || user?.status === 'SUSPENDED') {
    if (path !== '/account-suspended') {
      return <Navigate to="/account-suspended" replace />;
    }
    return <Outlet />;
  }

  // Account Incomplete onboarding
  if (profileStatus === 'INCOMPLETE') {
    if (path.startsWith('/onboarding/')) {
      return <Outlet />;
    }
    const role = user?.role?.toLowerCase();
    if (role) {
      return <Navigate to={`/onboarding/${role}`} replace />;
    }
    return <Navigate to="/login" replace />;
  }

  // Pending Verification (Super Admin or College Placement)
  if (
    profileStatus === 'PENDING_SUPER_ADMIN_VERIFICATION' ||
    user?.status === 'PENDING_SUPER_ADMIN_VERIFICATION' ||
    profileStatus === 'PENDING_INSTITUTION_VERIFICATION' ||
    profileStatus === 'PENDING_COMPANY_VERIFICATION' ||
    user?.status === 'PENDING_VERIFICATION'
  ) {
    if (path.startsWith('/onboarding/complete') || path.startsWith('/verification-pending')) {
      return <Outlet />;
    }
    return <Navigate to="/verification-pending" replace />;
  }

  return <Outlet />;
}
