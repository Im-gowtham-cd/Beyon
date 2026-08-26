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
      setErrors(prev => ({ ...prev, email: 'Email is required' }));
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
        // Appwrite login failed, continue with backend auth
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

      if (profileStatus === 'PENDING_INSTITUTION_VERIFICATION' || profileStatus === 'PENDING_COMPANY_VERIFICATION') {
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
          {/* Side Panel */}
          <aside className={styles.loginAside}>
            <div className={styles.asideBrand}>
              <span className={styles.asideMark} />
              <div className={styles.asideBrandText}>
                <span className={styles.asideName}>Beyon</span>
                <span className={styles.asideSub}>AI Skill Development Platform</span>
              </div>
            </div>

            <div className={styles.asideBody}>
              <h2>Learn, Practice, Prove &amp; Get Hired</h2>
              <p>Access the complete AI-powered skill development, assessment and recruitment platform.</p>
              <ul className={styles.asideFeatures}>
                <li><i className="bx bx-chip" /> AI-Powered Learning</li>
                <li><i className="bx bx-brain" /> Skill Assessment</li>
                <li><i className="bx bx-group" /> Career Matching</li>
              </ul>
            </div>

            <div className={styles.asideFoot}>
              <i className="bx bx-envelope" /> support@beyon.dev
            </div>
          </aside>

          {/* Login Panel */}
          <section className={styles.loginPanel}>
            <span className="section-label">HPC COE Portal</span>
            <h1 className={styles.loginTitle}>Sign In</h1>
            <p className={styles.loginIntro}>Sign in with your registered email and password to access the platform.</p>

            <form className={styles.loginForm} onSubmit={handleSubmit} autoComplete="off" noValidate>
              {toast.show && (
                <div className={`${styles.toast} ${toast.isError ? styles.toastError : ''}`} role="status">
                  <i className={toast.isError ? 'bx bx-x-circle' : 'bx bx-check-circle'} />
                  <span>{toast.message}</span>
                </div>
              )}

              <div className={styles.inputGroup}>
                <label htmlFor="loginEmail">Email</label>
                <div className={`${styles.inputWrapper} ${errors.email ? styles.inputError : ''}`}>
                  <i className="bx bx-envelope input-icon" />
                  <input
                    id="loginEmail"
                    type="email"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setErrors(prev => ({ ...prev, email: '' })); }}
                    onBlur={validateEmail}
                    placeholder="Enter your email"
                    required
                    autoComplete="email"
                  />
                </div>
                {errors.email && <span className={styles.inputErrorMsg}>{errors.email}</span>}
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="loginPassword">Password</label>
                <div className={`${styles.inputWrapper} ${errors.password ? styles.inputError : ''}`}>
                  <i className="bx bx-lock-alt input-icon" />
                  <input
                    id="loginPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => { setPassword(e.target.value); setErrors(prev => ({ ...prev, password: '' })); }}
                    onBlur={validatePassword}
                    placeholder="Enter your password"
                    required
                    autoComplete="current-password"
                  />
                  <button type="button" className={styles.togglePassword} onClick={() => setShowPassword(!showPassword)} aria-label="Toggle password">
                    <i className={showPassword ? 'bx bx-hide' : 'bx bx-show'} />
                  </button>
                </div>
                {errors.password && <span className={styles.inputErrorMsg}>{errors.password}</span>}
              </div>

              <div className={styles.loginOptions}>
                <label className={styles.rememberMe}>
                  <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} />
                  <span className={styles.checkmark} />
                  Remember me
                </label>
                <Link to="/forgot-password" className={styles.forgotLink}>Forgot password?</Link>
              </div>

              <button type="submit" className={styles.loginBtn} disabled={loading}>
                {loading ? <i className="bx bx-loader-alt bx-spin" /> : 'Sign In'}
              </button>
            </form>

            <div className={styles.loginHelp}>
              <i className="bx bx-shield-quarter" />
              <span>Protected portal access. For account issues, contact support at support@beyon.dev.</span>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
