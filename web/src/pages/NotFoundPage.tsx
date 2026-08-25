import { Link } from 'react-router-dom';
import { OnboardingLayout } from '../onboarding/components/OnboardingLayout';

export function NotFoundPage() {
  return (
    <OnboardingLayout currentStep={0} totalSteps={0}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center' }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '6rem', fontWeight: 'var(--font-bold)', color: 'var(--color-primary)', margin: '0 0 var(--space-md)', lineHeight: 1 }}>404</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-lg)', margin: '0 0 var(--space-2xl)' }}>
          This page doesn't exist.
        </p>
        <Link to="/" style={{ padding: '12px 32px', background: 'var(--color-primary)', border: 'none', borderRadius: 'var(--radius-sm)', color: 'var(--color-black)', fontSize: 'var(--text-base)', fontWeight: 'var(--font-semibold)', textDecoration: 'none' }}>
          Back to Beyon
        </Link>
      </div>
    </OnboardingLayout>
  );
}
