import { useAuth } from '../context/AuthContext';
import { OnboardingLayout } from '../../onboarding/components/OnboardingLayout';

export function VerificationPendingPage() {
  const { user, logout } = useAuth();

  return (
    <OnboardingLayout currentStep={0} totalSteps={0}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center', padding: 'var(--space-2xl)' }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#fef3c7', border: '2px solid #f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.2rem', marginBottom: 'var(--space-xl)', color: '#d97706' }}>
          <i className="bx bx-time-five" />
        </div>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-3xl)', fontWeight: 'var(--font-bold)', color: 'var(--color-text)', margin: '0 0 var(--space-md)' }}>
          Account Under Verification
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-lg)', maxWidth: 500, margin: '0 0 var(--space-md)' }}>
          Your {user?.role === 'INSTITUTION' ? 'institution' : 'company'} account is being reviewed by our team.
        </p>
        <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', maxWidth: 500, margin: '0 0 var(--space-2xl)' }}>
          You can update your submitted information if permitted. We'll notify you once verification is complete.
        </p>
        <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
          <button onClick={() => logout()} style={{ padding: '12px 24px', background: 'transparent', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', color: 'var(--color-text-secondary)', fontSize: 'var(--text-base)', cursor: 'pointer' }}>
            Sign Out
          </button>
        </div>
      </div>
    </OnboardingLayout>
  );
}
