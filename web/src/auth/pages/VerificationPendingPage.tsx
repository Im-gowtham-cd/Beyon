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
          {user?.role === 'STUDENT'
            ? 'Awaiting Institution Academic Verification'
            : user?.role === 'INSTITUTION'
            ? 'Institution Account Under Review'
            : 'Corporate Account Under Review'}
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-lg)', maxWidth: 540, margin: '0 0 var(--space-md)', lineHeight: 1.5 }}>
          {user?.role === 'STUDENT'
            ? "Your student account is currently in the verification queue. Your institution's Placement Office will review your academic CGPA and transcripts."
            : user?.role === 'INSTITUTION'
            ? 'Your institution account and accreditation documents are being reviewed by the platform administration team.'
            : 'Your corporate recruiting account is being verified by our enterprise team.'}
        </p>
        <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', maxWidth: 500, margin: '0 0 var(--space-2xl)' }}>
          {user?.role === 'STUDENT'
            ? 'Once approved by your institution, full access to placement drives, proctored tests, and daily challenges will be activated.'
            : "You will receive an email notification as soon as verification is complete."}
        </p>
        <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
          <button onClick={() => logout()} style={{ padding: '12px 24px', background: '#1c2d81', border: '1px solid #1c2d81', borderRadius: 'var(--radius-sm)', color: '#ffffff', fontWeight: 600, fontSize: 'var(--text-base)', cursor: 'pointer' }}>
            Sign Out
          </button>
        </div>
      </div>
    </OnboardingLayout>
  );
}
