import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { OnboardingLayout } from '../../onboarding/components/OnboardingLayout';

export function UnauthorizedPage() {
  const { user, logout } = useAuth();

  const roleLabels: Record<string, string> = {
    STUDENT: 'Student Workspace (/student/home)',
    INSTITUTION: 'Institution & TPO Portal (/institution/home)',
    COMPANY: 'Corporate Recruiter Portal (/company/home)',
    ADMIN: 'Super Admin Portal (/admin/home)',
  };

  const dashboardPath = user ? `/${user.role.toLowerCase()}/home` : '/login';

  return (
    <OnboardingLayout currentStep={0} totalSteps={0}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center', padding: 'var(--space-2xl)' }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#fee2e2', border: '2px solid #ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.2rem', marginBottom: 'var(--space-xl)', color: '#ef4444' }}>
          <i className="bx bx-lock-alt" />
        </div>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-3xl)', fontWeight: 'var(--font-bold)', color: 'var(--color-text)', margin: '0 0 var(--space-md)' }}>
          Access Restricted / Unauthorized Portal
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-lg)', maxWidth: 540, margin: '0 0 var(--space-md)', lineHeight: 1.5 }}>
          {user ? (
            <>
              You are logged in as <strong>{user.email}</strong> with role <strong>{user.role}</strong>. This page requires different role permissions or an institution-verified profile.
            </>
          ) : (
            "You don't have permission to access this area."
          )}
        </p>
        <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', maxWidth: 500, margin: '0 0 var(--space-2xl)' }}>
          {user && (
            <>
              Your designated portal is: <strong>{roleLabels[user.role] || user.role}</strong>
            </>
          )}
        </p>
        <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
          <Link to={dashboardPath} style={{ padding: '12px 28px', background: '#1c2d81', border: 'none', borderRadius: 'var(--radius-sm)', color: '#fed601', fontSize: 'var(--text-base)', fontWeight: 'var(--font-semibold)', textDecoration: 'none', cursor: 'pointer' }}>
            Go to My Portal
          </Link>
          <button onClick={() => logout()} style={{ padding: '12px 24px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: 'var(--radius-sm)', color: '#475569', fontWeight: 600, fontSize: 'var(--text-base)', cursor: 'pointer' }}>
            Switch Account
          </button>
        </div>
      </div>
    </OnboardingLayout>
  );
}
