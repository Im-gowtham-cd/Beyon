import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../services/authApi';
import { appwriteAuth } from '../services/appwriteAuth';
import type { ApiError } from '../../services/api/client';
import styles from './LoginPage.module.css';

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [toast, setToast] = useState({ show: false, message: '', isError: false });
  const [loading, setLoading] = useState(false);

  function validateEmail() {
    if (!email.trim()) {
      setErrors(prev => ({ ...prev, email: 'Username or email is required' }));
      return false;
    }
    setErrors(prev => ({ ...prev, email: '' }));
    return true;
  }

  function validatePassword() {
    if (!password) {
      setErrors(prev => ({ ...prev, password: 'Password is required' }));
      return false;
    }
    setErrors(prev => ({ ...prev, password: '' }));
    return true;
  }

  function showToast(message: string, isError = false) {
    setToast({ show: true, message, isError });
    setTimeout(() => setToast({ show: false, message: '', isError: false }), 4000);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const emailValid = validateEmail();
    const passValid = validatePassword();
    if (!emailValid || !passValid) return;

    setLoading(true);

    try {
      try {
        await appwriteAuth.login(email, password);
      } catch {
        // Appwrite login fallback
      }

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

      if (
        profileStatus === 'PENDING_INSTITUTION_VERIFICATION' ||
        profileStatus === 'PENDING_COMPANY_VERIFICATION'
      ) {
        navigate('/verification-pending');
        return;
      }

      showToast('Login successful! Redirecting...');
      setTimeout(() => {
        const roleRoutes: Record<string, string> = {
          STUDENT: '/student/home',
          INSTITUTION: '/institution/home',
          COMPANY: '/company/home',
          ADMIN: '/admin/home',
        };
        navigate(roleRoutes[response.user.role] || '/student/home');
      }, 1000);
    } catch (err) {
      const apiErr = err as ApiError;
      showToast(apiErr.message || 'Invalid credentials. Please try again.', true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.loginPage}>
      <main className={styles.loginMain}>
        <div className={styles.loginCard}>
          {/* Left Aside */}
          <aside className={styles.loginAside}>
            <div className={styles.asideBrand}>
              <span className={styles.asideMark} aria-hidden="true" />
              <div className={styles.asideBrandText}>
                <span className={styles.asideName}>HPC COE</span>
                <span className={styles.asideSub}>Centre of Excellence &middot; HPC</span>
              </div>
            </div>

            <div className={styles.asideBody}>
              <h2>High Performance Computing for Innovative Intelligent Solutions</h2>
              <p>Secure portal access for faculty, staff and research scholars of the HPC Centre of Excellence.</p>
              <ul className={styles.asideFeatures}>
                <li>
                  <i className="bx bx-chip" /> NVIDIA H200 GPUs
                </li>
                <li>
                  <i className="bx bx-brain" /> AI Research &amp; Innovation
                </li>
                <li>
                  <i className="bx bx-group" /> Innovation Hub
                </li>
              </ul>
            </div>

            <div className={styles.asideFoot}>
              <i className="bx bx-envelope" /> support@hpc.edu.in
            </div>
          </aside>

          {/* Right Panel */}
          <section className={styles.loginPanel}>
            <span className="section-label">Beyon Portal</span>
            <h1>Sign In</h1>
            <p className={styles.loginIntro}>
              Sign in with your registered email and password to access the platform.
            </p>

            <form
              className={styles.loginForm}
              id="loginForm"
              onSubmit={handleSubmit}
              autoComplete="off"
              noValidate
            >
              <div className={styles.inputGroup}>
                <label htmlFor="loginUsername">Username / Email</label>
                <div className={`${styles.inputWrapper} ${errors.email ? styles.error : ''}`}>
                  <i className={`bx bx-user ${styles.inputIcon}`} />
                  <input
                    id="loginUsername"
                    type="text"
                    value={email}
                    onChange={e => {
                      setEmail(e.target.value);
                      setErrors(prev => ({ ...prev, email: '' }));
                    }}
                    onBlur={validateEmail}
                    placeholder="Enter your username or email"
                    required
                    autoComplete="username"
                  />
                </div>
                {errors.email && <span className={styles.inputError}>{errors.email}</span>}
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="loginPassword">Password</label>
                <div className={`${styles.inputWrapper} ${errors.password ? styles.error : ''}`}>
                  <i className={`bx bx-lock-alt ${styles.inputIcon}`} />
                  <input
                    id="loginPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => {
                      setPassword(e.target.value);
                      setErrors(prev => ({ ...prev, password: '' }));
                    }}
                    onBlur={validatePassword}
                    placeholder="Enter your password"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className={styles.togglePassword}
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label="Toggle password visibility"
                  >
                    <i className={showPassword ? 'bx bx-hide' : 'bx bx-show'} />
                  </button>
                </div>
                {errors.password && <span className={styles.inputError}>{errors.password}</span>}
              </div>

              <div className={styles.loginOptions}>
                <label className={styles.rememberMe}>
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={e => setRemember(e.target.checked)}
                  />
                  <span className={styles.checkmark} />
                  Remember me
                </label>
                <Link to="/forgot-password" className={styles.forgotLink}>
                  Forgot password?
                </Link>
              </div>

              <button type="submit" className={styles.loginBtn} disabled={loading}>
                {!loading ? (
                  <span>Sign In</span>
                ) : (
                  <i className="bx bx-loader-alt bx-spin" />
                )}
              </button>

              <div className={styles.switchAuth}>
                <span>Don't have an account?</span>
                <Link to="/register" className={styles.switchLink}>
                  Sign Up
                </Link>
              </div>
            </form>

            <div className={styles.loginHelp}>
              <i className="bx bx-shield-quarter" />
              <span>
                Protected portal access. For account issues or organization verification, contact support@beyon.dev.
              </span>
            </div>

            <div
              className={`${styles.loginToast} ${toast.show ? styles.show : ''} ${
                toast.isError ? styles.toastError : ''
              }`}
              role="status"
              aria-live="polite"
            >
              <i className={toast.isError ? 'bx bx-x-circle' : 'bx bx-check-circle'} />
              <span>{toast.message}</span>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
