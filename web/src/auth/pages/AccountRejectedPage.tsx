import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { OnboardingLayout } from '../../onboarding/components/OnboardingLayout';
import { AlertOctagon, Mail, LogOut, ArrowLeft, ShieldAlert } from 'lucide-react';

export function AccountRejectedPage() {
  const { user, logout, authenticated } = useAuth();
  const location = useLocation();
  const stateMessage = (location.state as { message?: string; email?: string } | undefined)?.message;
  const stateEmail = (location.state as { message?: string; email?: string } | undefined)?.email;

  const displayEmail = user?.email || stateEmail;
  const role = user?.role;

  const getRoleDescription = () => {
    if (role === 'INSTITUTION') {
      return 'The institutional credentials, AISHE / UGC code, accreditation details, or campus leadership records provided did not satisfy platform verification criteria.';
    }
    if (role === 'COMPANY') {
      return 'The corporate entity registration details, official domain records, or university recruitment policies provided did not satisfy enterprise verification criteria.';
    }
    if (role === 'STUDENT') {
      return 'Your student registration was reviewed and rejected by your institution placement administration.';
    }
    return 'Your account registration was reviewed and rejected by the Super Administrator.';
  };

  return (
    <OnboardingLayout currentStep={0} totalSteps={0}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '65vh',
          textAlign: 'center',
          padding: '40px 20px',
          maxWidth: '680px',
          margin: '0 auto',
        }}
      >
        {/* Rejection Icon Badge */}
        <div
          style={{
            width: 84,
            height: 84,
            borderRadius: '50%',
            background: '#fef2f2',
            border: '2px solid #ef4444',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '20px',
            color: '#dc2626',
            boxShadow: '0 4px 14px rgba(239, 68, 68, 0.15)',
          }}
        >
          <AlertOctagon size={44} />
        </div>

        {/* Status Pill */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: '#fee2e2',
            color: '#991b1b',
            padding: '4px 12px',
            borderRadius: '16px',
            fontSize: '0.78rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '16px',
          }}
        >
          <ShieldAlert size={14} />
          <span>Status: Registration Rejected</span>
        </div>

        <h1
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1.9rem',
            fontWeight: 800,
            color: '#0f172a',
            margin: '0 0 12px',
            letterSpacing: '-0.02em',
          }}
        >
          Account Registration Rejected
        </h1>

        <p
          style={{
            color: '#475569',
            fontSize: '1rem',
            lineHeight: 1.6,
            margin: '0 0 24px',
          }}
        >
          {stateMessage || 'Your account registration was reviewed and rejected by the Super Administrator.'}
        </p>

        {/* Detailed Explanation Card */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            padding: '20px',
            width: '100%',
            textAlign: 'left',
            marginBottom: '28px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}
        >
          <h4
            style={{
              margin: '0 0 8px',
              fontSize: '0.9rem',
              fontWeight: 700,
              color: '#991b1b',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            Review Outcome &amp; Governance Policy
          </h4>
          <p style={{ margin: '0 0 12px', fontSize: '0.85rem', color: '#334155', lineHeight: 1.5 }}>
            {getRoleDescription()}
          </p>
          {displayEmail && (
            <div style={{ fontSize: '0.82rem', color: '#64748b', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
              <strong>Registered Account:</strong> <code>{displayEmail}</code>
            </div>
          )}
        </div>

        {/* Support & Appeal Info */}
        <div
          style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '16px',
            width: '100%',
            textAlign: 'center',
            marginBottom: '28px',
            fontSize: '0.84rem',
            color: '#64748b',
          }}
        >
          <div style={{ fontWeight: 600, color: '#1e293b', marginBottom: '4px' }}>
            Believe this decision was made in error?
          </div>
          <div>
            You may appeal by providing corrected official accreditation documents or authorization letters directly to the Super Administration team at{' '}
            <a
              href="mailto:superadmin@beyon.io?subject=Account%20Registration%20Rejection%20Appeal"
              style={{ color: '#1c2d81', fontWeight: 700, textDecoration: 'underline' }}
            >
              superadmin@beyon.io
            </a>.
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {authenticated ? (
            <button
              onClick={() => logout()}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 22px',
                background: '#dc2626',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 700,
                fontSize: '0.88rem',
                cursor: 'pointer',
              }}
            >
              <LogOut size={16} />
              <span>Sign Out &amp; Return to Login</span>
            </button>
          ) : (
            <Link
              to="/login"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 22px',
                background: '#1c2d81',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 700,
                fontSize: '0.88rem',
                textDecoration: 'none',
                cursor: 'pointer',
              }}
            >
              <ArrowLeft size={16} />
              <span>Back to Sign In</span>
            </Link>
          )}

          <a
            href="mailto:superadmin@beyon.io?subject=Account%20Registration%20Rejection%20Appeal"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              background: '#ffffff',
              color: '#334155',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              fontWeight: 600,
              fontSize: '0.88rem',
              textDecoration: 'none',
              cursor: 'pointer',
            }}
          >
            <Mail size={16} />
            <span>Contact Super Admin</span>
          </a>
        </div>
      </div>
    </OnboardingLayout>
  );
}
