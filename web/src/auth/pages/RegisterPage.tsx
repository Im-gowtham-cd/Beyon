import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../services/authApi';
import { appwriteAuth } from '../services/appwriteAuth';
import type { ApiError } from '../../services/api/client';
import styles from './LoginPage.module.css';

export function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'STUDENT' | 'INSTITUTION' | 'COMPANY'>('STUDENT');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string; terms?: string }>({});
  const [toast, setToast] = useState({ show: false, message: '', isError: false });
  const [loading, setLoading] = useState(false);

  function validate() {
    const nextErrors: typeof errors = {};
    if (!name.trim()) nextErrors.name = 'Full name is required';
    if (!email.trim()) nextErrors.email = 'Email is required';
    if (!password) nextErrors.password = 'Password is required';
    else if (password.length < 8) nextErrors.password = 'Password must be at least 8 characters';
    if (!agreeTerms) nextErrors.terms = 'You must agree to the terms';

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function showToast(message: string, isError = false) {
    setToast({ show: true, message, isError });
    setTimeout(() => setToast({ show: false, message: '', isError: false }), 4000);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);

    try {
      try {
        await appwriteAuth.register(email, password, name);
      } catch {
        // Appwrite register fallback
      }

      await authApi.register({ name, email, password, confirmPassword: password, role });

      try {
        const loginRes = await authApi.login({ email, password });
        login(loginRes.accessToken, loginRes.user);
        showToast('Registration successful! Redirecting to setup...');
        setTimeout(() => {
          navigate(`/onboarding/${role.toLowerCase()}`);
        }, 1000);
      } catch {
        showToast('Registration successful! Please sign in.');
        setTimeout(() => {
          navigate('/login');
        }, 1000);
      }
    } catch (err) {
      const apiErr = err as ApiError;
      showToast(apiErr.message || 'Registration failed. Please try again.', true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.loginPage}>
      <main className={styles.loginMain}>
        <div className={styles.loginCard}>
          {/* Left Aside - Exact same as Login */}
          <aside className={styles.loginAside}>
            <div className={styles.asideBrand}>
              <span className={styles.asideMark} aria-hidden="true" />
              <div className={styles.asideBrandText}>
                <span className={styles.asideName}>Beyon</span>
                <span className={styles.asideSub}>AI Skill Development &amp; Recruitment</span>
              </div>
            </div>

            <div className={styles.asideBody}>
              <h2>Learn, Practice, Prove &amp; Get Hired</h2>
              <p>Create your candidate or organization account to access AI-powered assessments and opportunities.</p>
              <ul className={styles.asideFeatures}>
                <li>
                  <i className="bx bx-chip" /> AI-Powered Learning Paths
                </li>
                <li>
                  <i className="bx bx-brain" /> Proctored Skill Assessments
                </li>
                <li>
                  <i className="bx bx-group" /> Direct Candidate Matching
                </li>
              </ul>
            </div>

            <div className={styles.asideFoot}>
              <i className="bx bx-envelope" /> support@beyon.dev
            </div>
          </aside>

          {/* Right Panel - Register with identical UX */}
          <section className={styles.loginPanel}>
            <span className="section-label">Beyon Portal</span>
            <h1>Create Account</h1>
            <p className={styles.loginIntro}>
              Register for portal access to start learning, taking assessments, and discovering career opportunities.
            </p>

            <form
              className={styles.loginForm}
              id="registerForm"
              onSubmit={handleSubmit}
              autoComplete="off"
              noValidate
            >
              <div className={styles.inputGroup}>
                <label htmlFor="regName">Full Name</label>
                <div className={`${styles.inputWrapper} ${errors.name ? styles.error : ''}`}>
                  <i className={`bx bx-user ${styles.inputIcon}`} />
                  <input
                    id="regName"
                    type="text"
                    value={name}
                    onChange={e => {
                      setName(e.target.value);
                      setErrors(prev => ({ ...prev, name: '' }));
                    }}
                    placeholder="Enter your full name"
                    required
                    autoComplete="name"
                  />
                </div>
                {errors.name && <span className={styles.inputError}>{errors.name}</span>}
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="regEmail">Email Address</label>
                <div className={`${styles.inputWrapper} ${errors.email ? styles.error : ''}`}>
                  <i className={`bx bx-envelope ${styles.inputIcon}`} />
                  <input
                    id="regEmail"
                    type="email"
                    value={email}
                    onChange={e => {
                      setEmail(e.target.value);
                      setErrors(prev => ({ ...prev, email: '' }));
                    }}
                    placeholder="Enter your email"
                    required
                    autoComplete="email"
                  />
                </div>
                {errors.email && <span className={styles.inputError}>{errors.email}</span>}
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="regRole">Account Role</label>
                <div className={styles.inputWrapper}>
                  <i className={`bx bx-badge-check ${styles.inputIcon}`} />
                  <select
                    id="regRole"
                    value={role}
                    onChange={e => setRole(e.target.value as any)}
                  >
                    <option value="STUDENT">Research Scholar / Student</option>
                    <option value="INSTITUTION">Faculty / Institution</option>
                    <option value="COMPANY">Industry Partner / Company</option>
                  </select>
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="regPassword">Password</label>
                <div className={`${styles.inputWrapper} ${errors.password ? styles.error : ''}`}>
                  <i className={`bx bx-lock-alt ${styles.inputIcon}`} />
                  <input
                    id="regPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => {
                      setPassword(e.target.value);
                      setErrors(prev => ({ ...prev, password: '' }));
                    }}
                    placeholder="Create a strong password"
                    required
                    autoComplete="new-password"
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
                    checked={agreeTerms}
                    onChange={e => {
                      setAgreeTerms(e.target.checked);
                      setErrors(prev => ({ ...prev, terms: '' }));
                    }}
                  />
                  <span className={styles.checkmark} />
                  I agree to the Portal Terms &amp; Privacy Policy
                </label>
              </div>
              {errors.terms && <span className={styles.inputError}>{errors.terms}</span>}

              <button type="submit" className={styles.loginBtn} disabled={loading}>
                {!loading ? (
                  <span>Create Account</span>
                ) : (
                  <i className="bx bx-loader-alt bx-spin" />
                )}
              </button>

              <div className={styles.switchAuth}>
                <span>Already registered?</span>
                <Link to="/login" className={styles.switchLink}>
                  Sign In
                </Link>
              </div>
            </form>

            <div className={styles.loginHelp}>
              <i className="bx bx-shield-quarter" />
              <span>
                Protected portal access. For verification or access requests, contact support@beyon.dev.
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
