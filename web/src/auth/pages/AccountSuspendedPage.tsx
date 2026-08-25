import { useAuth } from '../context/AuthContext';
import { OnboardingLayout } from '../../onboarding/components/OnboardingLayout';

export function AccountSuspendedPage() {
  const { logout } = useAuth();

  return (
    <OnboardingLayout currentStep={0} totalSteps={0}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center', padding: 'var(--space-2xl)' }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(255, 92, 92, 0.15)', border: '2px solid var(--color-error)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', marginBottom: 'var(--space-xl)' }}>
          🚫
        </div>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-3xl)', fontWeight: 'var(--font-bold)', color: 'var(--color-text)', margin: '0 0 var(--space-md)' }}>
          Account Suspended
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-lg)', maxWidth: 500, margin: '0 0 var(--space-md)' }}>
          Your account has been suspended.
        </p>
        <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', maxWidth: 500, margin: '0 0 var(--space-2xl)' }}>
          If you believe this is an error, please contact our support team for assistance.
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
