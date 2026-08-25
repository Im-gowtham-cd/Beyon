import { useState, type FormEvent } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../components/AuthLayout';
import { AuthCard } from '../components/AuthCard';
import { PasswordInput } from '../components/PasswordInput';
import { AuthButton } from '../components/AuthButton';
import { authApi } from '../services/authApi';
import type { ApiError } from '../../services/api/client';

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (password.length < 8) errs.password = 'Password must be at least 8 characters';
    else if (!/[A-Z]/.test(password)) errs.password = 'Must contain an uppercase letter';
    else if (!/[a-z]/.test(password)) errs.password = 'Must contain a lowercase letter';
    else if (!/[0-9]/.test(password)) errs.password = 'Must contain a number';
    if (password !== confirmPassword) errs.confirmPassword = 'Passwords do not match';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setApiError('');
    if (!validate()) return;

    setLoading(true);
    try {
      await authApi.resetPassword(token, password, confirmPassword);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      const apiErr = err as ApiError;
      setApiError(apiErr.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <AuthLayout>
        <AuthCard title="Invalid link" subtitle="This password reset link is invalid or missing.">
          <Link to="/forgot-password" style={{ color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 'var(--font-medium)' }}>
            Request a new reset link
          </Link>
        </AuthCard>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <AuthCard
        title="Set new password"
        subtitle="Choose a strong password for your account"
        footer={
          <Link to="/login" style={{ color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 'var(--font-medium)' }}>
            Back to sign in
          </Link>
        }
      >
        {success ? (
          <div style={{ background: 'rgba(50,213,131,0.1)', border: '1px solid rgba(50,213,131,0.3)', borderRadius: 'var(--radius-sm)', padding: '12px 16px', color: 'var(--color-success)', fontSize: 'var(--text-sm)', textAlign: 'center' }} role="status">
            Password reset successfully. Redirecting to sign in...
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            {apiError && (
              <div style={{ background: 'rgba(255,92,92,0.1)', border: '1px solid rgba(255,92,92,0.3)', borderRadius: 'var(--radius-sm)', padding: '12px 16px', color: 'var(--color-error)', fontSize: 'var(--text-sm)' }} role="alert">
                {apiError}
              </div>
            )}
            <PasswordInput
              id="new-password"
              label="New password"
              placeholder="Min. 8 characters"
              value={password}
              onChange={e => setPassword(e.target.value)}
              error={errors.password}
              required
              autoComplete="new-password"
            />
            <PasswordInput
              id="confirm-new-password"
              label="Confirm new password"
              placeholder="Re-enter password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              error={errors.confirmPassword}
              required
              autoComplete="new-password"
            />
            <AuthButton type="submit" loading={loading}>
              Reset password
            </AuthButton>
          </form>
        )}
      </AuthCard>
    </AuthLayout>
  );
}
