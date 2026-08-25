import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { AuthLayout } from '../components/AuthLayout';
import { AuthCard } from '../components/AuthCard';
import { AuthButton } from '../components/AuthButton';
import { authApi } from '../services/authApi';
import type { ApiError } from '../../services/api/client';

export function VerifyEmailPage() {
  const location = useLocation();
  type Status = 'idle' | 'loading' | 'success' | 'error';
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const stateEmail = (location.state as { email?: string } | null)?.email;

    if (stateEmail) setEmail(stateEmail);

    if (token) {
      setStatus('loading');
      authApi.verifyEmail(token)
        .then(() => {
          setStatus('success');
          setMessage('Your email has been verified. You can now sign in.');
        })
        .catch((err) => {
          setStatus('error');
          const apiErr = err as ApiError;
          setMessage(apiErr.message || 'Invalid or expired verification link.');
        });
    }
  }, [location]);

  async function handleResend() {
    if (!email) return;
    setStatus('loading');
    try {
      await authApi.resendVerification(email);
      setMessage('A new verification link has been sent to your email.');
      setStatus('idle');
    } catch (err) {
      const apiErr = err as ApiError;
      setMessage(apiErr.message || 'Failed to resend verification.');
      setStatus('error');
    }
  }

  return (
    <AuthLayout>
      <AuthCard
        title="Verify your email"
        subtitle="Check your inbox for a verification link"
        footer={
          <Link to="/login" style={{ color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 'var(--font-medium)' }}>
            Back to sign in
          </Link>
        }
      >
        {status === 'success' && (
          <div style={{ background: 'rgba(50,213,131,0.1)', border: '1px solid rgba(50,213,131,0.3)', borderRadius: 'var(--radius-sm)', padding: '12px 16px', color: 'var(--color-success)', fontSize: 'var(--text-sm)' }} role="status">
            {message}
          </div>
        )}

        {status === 'error' && (
          <div style={{ background: 'rgba(255,92,92,0.1)', border: '1px solid rgba(255,92,92,0.3)', borderRadius: 'var(--radius-sm)', padding: '12px 16px', color: 'var(--color-error)', fontSize: 'var(--text-sm)' }} role="alert">
            {message}
          </div>
        )}

        {status === 'idle' && message && (
          <div style={{ background: 'rgba(50,213,131,0.1)', border: '1px solid rgba(50,213,131,0.3)', borderRadius: 'var(--radius-sm)', padding: '12px 16px', color: 'var(--color-success)', fontSize: 'var(--text-sm)' }} role="status">
            {message}
          </div>
        )}

        {status === 'idle' && !message && (
          <div style={{ textAlign: 'center', padding: 'var(--space-lg) 0' }}>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-lg)' }}>
              Enter your email to receive a new verification link.
            </p>
            <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                style={{
                  flex: 1, padding: '12px 16px', background: 'var(--color-bg)', border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)', color: 'var(--color-text)', fontSize: 'var(--text-base)', outline: 'none',
                }}
              />
              <AuthButton onClick={handleResend} style={{ width: 'auto', padding: '12px 24px' }}>
                Send link
              </AuthButton>
            </div>
          </div>
        )}

        {status === 'loading' && (
          <div style={{ textAlign: 'center', padding: 'var(--space-lg)', color: 'var(--color-text-muted)' }}>
            Processing...
          </div>
        )}
      </AuthCard>
    </AuthLayout>
  );
}
