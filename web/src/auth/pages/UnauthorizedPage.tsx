import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { OnboardingLayout } from '../../onboarding/components/OnboardingLayout';
import { getRoleTier, getRoleDashboardPath } from '../types/auth';

export function UnauthorizedPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const roleLabels: Record<string, string> = {
    STUDENT: 'Student Workspace (/student/home)',
    INSTITUTION: 'Institution & TPO Portal (/institution/home)',
    INSTITUTION_ADMIN: 'Institution Admin Portal (/institution/home)',
    INSTITUTION_PLACEMENT_OFFICER: 'Placement Officer Portal (/institution/placements)',
    INSTITUTION_FACULTY: 'Faculty Coordinator Portal (/institution/curriculum)',
    COMPANY: 'Corporate Recruiter Portal (/company/home)',
    COMPANY_ADMIN: 'Company Admin Portal (/company/home)',
    COMPANY_RECRUITER: 'Recruiter Workspace (/company/candidates)',
    ADMIN: 'Super Admin Portal (/admin/home)',
    SUPER_ADMIN: 'Super Admin Governance Portal (/admin/home)',
    PLATFORM_ADMIN: 'Platform Admin Portal (/admin/home)',
    VERIFICATION_ADMIN: 'Verification Admin Portal (/admin/institutions)',
    CONTENT_ADMIN: 'Content & Skill Admin Portal (/admin/questions)',
    QUESTION_SETTER: 'Question Authoring Portal (/admin/questions)',
    MODERATION_ADMIN: 'Moderation & Safety Portal (/admin/moderation)',
    ANALYTICS_ADMIN: 'Analytics Intelligence Portal (/admin/reports)',
  };

  const dashboardPath = user ? getRoleDashboardPath(user.role, user.tier) : '/login';
  const tier = user ? getRoleTier(user.role) : 'STUDENT';

  const handleSwitchAccount = () => {
    logout();
    navigate('/login');
  };

  return (
    <OnboardingLayout currentStep={0} totalSteps={0}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center', padding: 'var(--space-2xl)' }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#fee2e2', border: '2px solid #ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.2rem', marginBottom: 'var(--space-xl)', color: '#ef4444' }}>
          <i className="bx bx-lock-alt" />
        </div>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-3xl)', fontWeight: 'var(--font-bold)', color: 'var(--color-text)', margin: '0 0 var(--space-md)' }}>
          Access Restricted / Unauthorized Portal
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-lg)', maxWidth: 580, margin: '0 0 var(--space-md)', lineHeight: 1.5 }}>
          {user ? (
            <>
              You are currently authenticated as <strong>{user.email}</strong> with active role <strong>{user.role}</strong> ({tier}).
            </>
          ) : (
            "You do not have permission to access this area."
          )}
        </p>
        <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', maxWidth: 540, margin: '0 0 var(--space-2xl)' }}>
          {user && (
            <>
              Your authorized domain workspace is: <strong>{roleLabels[user.role] || user.role}</strong>. Please use the dashboard matching your administrative scope.
            </>
          )}
        </p>
        <div style={{ display: 'flex', gap: 'var(--space-md)', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link
            to={dashboardPath}
            style={{
              padding: '12px 28px',
              background: '#1c2d81',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              color: '#fed601',
              fontSize: 'var(--text-base)',
              fontWeight: 600,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer'
            }}
          >
            <i className="bx bx-grid-alt" />
            <span>Go to My Dashboard ({tier})</span>
          </Link>
          <button
            onClick={handleSwitchAccount}
            style={{
              padding: '12px 24px',
              background: '#f1f5f9',
              border: '1px solid #cbd5e1',
              borderRadius: 'var(--radius-sm)',
              color: '#475569',
              fontWeight: 600,
              fontSize: 'var(--text-base)',
              cursor: 'pointer'
            }}
          >
            Switch Account
          </button>
          <button
            onClick={() => logout()}
            style={{
              padding: '12px 24px',
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: 'var(--radius-sm)',
              color: '#64748b',
              fontWeight: 600,
              fontSize: 'var(--text-base)',
              cursor: 'pointer'
            }}
          >
            Log Out
          </button>
        </div>
      </div>
    </OnboardingLayout>
  );
}
