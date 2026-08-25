import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { UserRole } from '../types/auth';

interface Props {
  allowedRoles: UserRole[];
  requireProfile?: boolean;
}

export function RoleGuard({ allowedRoles, requireProfile = false }: Props) {
  const { user, loading, authenticated, profileCompleted } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: 'var(--space-md)' }}>
        <div style={{ width: 40, height: 40, background: 'var(--color-primary)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-heading)', fontWeight: 'var(--font-bold)', color: 'var(--color-black)' }}>B</div>
        <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>Restoring your session...</p>
      </div>
    );
  }

  if (!authenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  if (requireProfile && !profileCompleted) {
    const role = user.role.toLowerCase();
    return <Navigate to={`/onboarding/${role}`} replace />;
  }

  return <Outlet />;
}
