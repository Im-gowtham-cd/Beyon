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

  if (path.startsWith('/onboarding/')) {
    return <Outlet />;
  }

  if (profileStatus === 'INCOMPLETE') {
    const role = user?.role?.toLowerCase();
    if (role) {
      return <Navigate to={`/onboarding/${role}`} replace />;
    }
    return <Navigate to="/login" replace />;
  }

  if (profileStatus === 'SUSPENDED') {
    return <Navigate to="/account-suspended" replace />;
  }

  if (profileStatus === 'PENDING_INSTITUTION_VERIFICATION' || profileStatus === 'PENDING_COMPANY_VERIFICATION') {
    if (!path.startsWith('/verification-pending')) {
      return <Navigate to="/verification-pending" replace />;
    }
  }

  return <Outlet />;
}
