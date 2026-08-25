import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { AuthLayout } from '../components/AuthLayout';
import { AuthCard } from '../components/AuthCard';
import { AuthInput } from '../components/AuthInput';
import { AuthButton } from '../components/AuthButton';
import { authApi } from '../services/authApi';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      setSent(true);
    } catch {
      setSent(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <AuthCard
        title="Reset your password"
        subtitle="Enter your email and we'll send you a reset link"
        footer={
          <Link to="/login" style={{ color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 'var(--font-medium)' }}>
            Back to sign in
          </Link>
        }
      >
        {sent ? (
          <div style={{ background: 'rgba(50,213,131,0.1)', border: '1px solid rgba(50,213,131,0.3)', borderRadius: 'var(--radius-sm)', padding: '12px 16px', color: 'var(--color-success)', fontSize: 'var(--text-sm)', textAlign: 'center' }} role="status">
            If an account exists for this email, a password reset link has been sent.
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            <AuthInput
              id="forgot-email"
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
            <AuthButton type="submit" loading={loading}>
              Send reset link
            </AuthButton>
          </form>
        )}
      </AuthCard>
    </AuthLayout>
  );
}
