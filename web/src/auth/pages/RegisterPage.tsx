import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../components/AuthLayout';
import { AuthCard } from '../components/AuthCard';
import { AuthInput } from '../components/AuthInput';
import { PasswordInput } from '../components/PasswordInput';
import { AuthButton } from '../components/AuthButton';
import { RoleCard } from '../components/RoleCard';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../services/authApi';
import type { ApiError } from '../../services/api/client';
import type { UserRole } from '../types/auth';
import styles from './RegisterPage.module.css';

type SelectableRole = Exclude<UserRole, 'ADMIN'>;

export function RegisterPage() {
  const navigate = useNavigate();
  useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<SelectableRole | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  function validate(): boolean {
    const errs: Record<string, string> = {};

    if (!name.trim() || name.trim().length < 2) errs.name = 'Name must be at least 2 characters';
    if (!email.trim()) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Invalid email format';
    if (password.length < 8) errs.password = 'Password must be at least 8 characters';
    else {
      if (!/[A-Z]/.test(password)) errs.password = 'Must contain an uppercase letter';
      else if (!/[a-z]/.test(password)) errs.password = 'Must contain a lowercase letter';
      else if (!/[0-9]/.test(password)) errs.password = 'Must contain a number';
    }
    if (password !== confirmPassword) errs.confirmPassword = 'Passwords do not match';
    if (!role) errs.role = 'Please select a role';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setApiError('');
    if (!validate()) return;

    setLoading(true);
    try {
      await authApi.register({ name: name.trim(), email: email.trim(), password, confirmPassword, role: role! });
      navigate('/verify-email', { state: { email: email.trim() } });
    } catch (err) {
      const apiErr = err as ApiError;
      setApiError(apiErr.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <AuthCard
        title="Create your account"
        subtitle="Join Beyon and start your skill journey"
        footer={
          <span>
            Already have an account?{' '}
            <Link to="/login" className={styles.link}>Sign in</Link>
          </span>
        }
      >
        <form className={styles.form} onSubmit={handleSubmit}>
          {apiError && <div className={styles.errorBanner} role="alert">{apiError}</div>}

          <AuthInput
            id="name"
            label="Full name"
            type="text"
            placeholder="Your name"
            value={name}
            onChange={e => setName(e.target.value)}
            error={errors.name}
            required
            autoComplete="name"
          />

          <AuthInput
            id="email"
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            error={errors.email}
            required
            autoComplete="email"
          />

          <PasswordInput
            id="password"
            label="Password"
            placeholder="Min. 8 characters"
            value={password}
            onChange={e => setPassword(e.target.value)}
            error={errors.password}
            required
            autoComplete="new-password"
          />

          <PasswordInput
            id="confirmPassword"
            label="Confirm password"
            placeholder="Re-enter your password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            error={errors.confirmPassword}
            required
            autoComplete="new-password"
          />

          <div>
            <div style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-sm)' }}>
              I am a...
            </div>
            {errors.role && (
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-error)', marginBottom: 'var(--space-sm)' }} role="alert">
                {errors.role}
              </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-sm)' }}>
              <RoleCard
                role="STUDENT"
                icon="🎓"
                title="Student"
                description="Build skills and find opportunities"
                selected={role === 'STUDENT'}
                onSelect={setRole}
              />
              <RoleCard
                role="INSTITUTION"
                icon="🏫"
                title="Institution"
                description="Manage and track talent readiness"
                selected={role === 'INSTITUTION'}
                onSelect={setRole}
              />
              <RoleCard
                role="COMPANY"
                icon="🏢"
                title="Company"
                description="Find and recruit skilled talent"
                selected={role === 'COMPANY'}
                onSelect={setRole}
              />
            </div>
          </div>

          <AuthButton type="submit" loading={loading}>
            Create account
          </AuthButton>
        </form>
      </AuthCard>
    </AuthLayout>
  );
}
