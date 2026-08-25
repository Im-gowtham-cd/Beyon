import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../components/AuthLayout';
import { AuthCard } from '../components/AuthCard';
import { AuthInput } from '../components/AuthInput';
import { PasswordInput } from '../components/PasswordInput';
import { AuthButton } from '../components/AuthButton';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../services/authApi';
import type { ApiError } from '../../services/api/client';
import styles from './LoginPage.module.css';

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authApi.login({ email, password });
      login(response.accessToken, response.user);

      const roleRoutes: Record<string, string> = {
        STUDENT: '/student/home',
        INSTITUTION: '/institution/home',
        COMPANY: '/company/home',
        ADMIN: '/admin/home',
      };
      navigate(roleRoutes[response.user.role] || '/student/home');
    } catch (err) {
      const apiErr = err as ApiError;
      setError(apiErr.message || 'Email or password is incorrect');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <AuthCard
        title="Welcome back"
        subtitle="Sign in to your Beyon account"
        footer={
          <span>
            Don't have an account?{' '}
            <Link to="/register" className={styles.link}>Create one</Link>
          </span>
        }
      >
        <form className={styles.form} onSubmit={handleSubmit}>
          {error && <div className={styles.errorBanner} role="alert">{error}</div>}

          <AuthInput
            id="email"
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoComplete="email"
          />

          <PasswordInput
            id="password"
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />

          <Link to="/forgot-password" className={styles.forgotLink}>
            Forgot password?
          </Link>

          <AuthButton type="submit" loading={loading}>
            Sign in
          </AuthButton>
        </form>
      </AuthCard>
    </AuthLayout>
  );
}
