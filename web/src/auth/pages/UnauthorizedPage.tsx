import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { OnboardingLayout } from '../../onboarding/components/OnboardingLayout';

export function UnauthorizedPage() {
  const { user } = useAuth();

  const dashboardPath = user ? `/${user.role.toLowerCase()}/home` : '/';

  return (
    <OnboardingLayout currentStep={0} totalSteps={0}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center', padding: 'var(--space-2xl)' }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(255, 92, 92, 0.15)', border: '2px solid var(--color-error)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', marginBottom: 'var(--space-xl)' }}>
          🔒
        </div>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-3xl)', fontWeight: 'var(--font-bold)', color: 'var(--color-text)', margin: '0 0 var(--space-md)' }}>
          Access Restricted
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-lg)', maxWidth: 500, margin: '0 0 var(--space-2xl)' }}>
          You don't have permission to access this area.
        </p>
        <Link to={dashboardPath} style={{ padding: '12px 32px', background: 'var(--color-primary)', border: 'none', borderRadius: 'var(--radius-sm)', color: 'var(--color-black)', fontSize: 'var(--text-base)', fontWeight: 'var(--font-semibold)', textDecoration: 'none', cursor: 'pointer' }}>
          Go to Dashboard
        </Link>
      </div>
    </OnboardingLayout>
  );
}
