import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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

      const profileStatus = response.user.profileStatus;

      if (profileStatus === 'SUSPENDED') {
        navigate('/account-suspended');
        return;
      }

      if (profileStatus === 'INCOMPLETE') {
        const role = response.user.role.toLowerCase();
        navigate(`/onboarding/${role}`);
        return;
      }

      if (profileStatus === 'PENDING_INSTITUTION_VERIFICATION' || profileStatus === 'PENDING_COMPANY_VERIFICATION') {
        navigate('/verification-pending');
        return;
      }

      const roleRoutes: Record<string, string> = {
        STUDENT: '/student/home',
        INSTITUTION: '/institution/home',
        COMPANY: '/company/home',
        ADMIN: '/admin/home',
      };
      navigate(roleRoutes[response.user.role] || '/student/home');
    } catch (err) {
      const apiErr = err as ApiError;
      setError(apiErr.message || 'Unable to sign in. Please check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.left}>
        <div className={styles.leftContent}>
          <Link to="/" className={styles.logo}>
            <span className={styles.logoIcon}>B</span>
            <span className={styles.logoText}>Beyon</span>
          </Link>
          <h1 className={styles.headline}>Welcome back</h1>
          <p className={styles.sub}>Continue building your skills and opportunities.</p>
        </div>
      </div>

      <div className={styles.right}>
        <div className={styles.formContainer}>
          <h2 className={styles.formTitle}>Sign in</h2>
          <p className={styles.formSubtitle}>Enter your credentials to access your account</p>

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

          <p className={styles.footer}>
            Don't have an account?{' '}
            <Link to="/register" className={styles.link}>Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
