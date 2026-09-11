import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getRoleTier, getRoleDashboardPath, type UserRole } from '../types/auth';

interface Props {
  allowedRoles: UserRole[];
  requireProfile?: boolean;
}

function roleMatches(userRole: UserRole, allowedRoles: UserRole[]): boolean {
  if (allowedRoles.includes(userRole)) return true;

  // Platform Admin subroles satisfy ADMIN / SUPER_ADMIN
  const isPlatformSubrole =
    userRole === 'PLATFORM_ADMIN' ||
    userRole === 'VERIFICATION_ADMIN' ||
    userRole === 'CONTENT_ADMIN' ||
    userRole === 'QUESTION_SETTER' ||
    userRole === 'MODERATION_ADMIN' ||
    userRole === 'ANALYTICS_ADMIN' ||
    userRole === 'SUPER_ADMIN' ||
    userRole === 'ADMIN';

  if (isPlatformSubrole && (allowedRoles.includes('ADMIN') || allowedRoles.includes('SUPER_ADMIN'))) {
    return true;
  }

  // Institution sub-roles satisfy INSTITUTION
  if (allowedRoles.includes('INSTITUTION') && userRole.startsWith('INSTITUTION')) return true;

  // Company sub-roles satisfy COMPANY
  if (allowedRoles.includes('COMPANY') && userRole.startsWith('COMPANY')) return true;

  return false;
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

  if (!roleMatches(user.role, allowedRoles)) {
    const isPlatformSubrole =
      user.role === 'PLATFORM_ADMIN' ||
      user.role === 'VERIFICATION_ADMIN' ||
      user.role === 'CONTENT_ADMIN' ||
      user.role === 'QUESTION_SETTER' ||
      user.role === 'MODERATION_ADMIN' ||
      user.role === 'ANALYTICS_ADMIN' ||
      user.role === 'SUPER_ADMIN' ||
      user.role === 'ADMIN';

    if (isPlatformSubrole) {
      const pathname = window.location.pathname;
      if (pathname === '/skill-graph' || pathname.startsWith('/skill-graph')) {
        return <Navigate to="/admin/skills/graph" replace />;
      }
      if (pathname === '/skill-taxonomy' || pathname.startsWith('/skill-taxonomy') || pathname.startsWith('/student/skills')) {
        return <Navigate to="/admin/skills" replace />;
      }
      if (pathname === '/practice' || pathname.startsWith('/practice')) {
        return <Navigate to="/admin/questions" replace />;
      }
    }

    const dashboardPath = getRoleDashboardPath(user.role, user.tier);
    return <Navigate to={dashboardPath} replace />;
  }

  if (requireProfile && !profileCompleted) {
    const tier = getRoleTier(user.role);
    if (tier === 'SUPER_ADMIN') {
      return <Outlet />;
    }
    const onboardingTier = tier.toLowerCase();
    return <Navigate to={`/onboarding/${onboardingTier}`} replace />;
  }

  return <Outlet />;
}

