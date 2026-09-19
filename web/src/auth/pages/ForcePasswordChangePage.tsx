import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../services/authApi';
import {
  ShieldAlert,
  ShieldCheck,
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  Check,
  X,
  ArrowRight,
  Loader2,
  AlertCircle,
  LogOut,
} from 'lucide-react';

export function ForcePasswordChangePage() {
  const { user, login, logout, getDashboardRoute } = useAuth();
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const hasLength = newPassword.length >= 8 && newPassword.length <= 128;
  const hasUpper = /[A-Z]/.test(newPassword);
  const hasLower = /[a-z]/.test(newPassword);
  const hasDigit = /[0-9]/.test(newPassword);
  const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);

  const passwordsMatch = newPassword.length > 0 && confirmPassword.length > 0 && newPassword === confirmPassword;
  const isMismatch = confirmPassword.length > 0 && newPassword !== confirmPassword;

  // Calculate password strength score (0 to 4)
  const strengthScore = [
    hasLength,
    hasUpper && hasLower,
    hasDigit,
    hasSpecial,
  ].filter(Boolean).length;

  const strengthConfig = [
    { label: 'Very Weak', color: '#ef4444', width: '25%' },
    { label: 'Weak', color: '#f97316', width: '50%' },
    { label: 'Moderate', color: '#eab308', width: '75%' },
    { label: 'Strong', color: '#16a34a', width: '100%' },
  ];

  const currentStrength = newPassword.length > 0 ? strengthConfig[Math.max(0, strengthScore - 1)] : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Explicit client validations with helpful error messages
    if (!currentPassword.trim()) {
      setError('Please enter your current temporary password.');
      return;
    }

    if (!newPassword) {
      setError('Please enter your new password.');
      return;
    }

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters long.');
      return;
    }

    if (newPassword.length > 128) {
      setError('New password cannot exceed 128 characters.');
      return;
    }

    if (!hasUpper) {
      setError('New password must contain at least one uppercase letter (A-Z).');
      return;
    }

    if (!hasLower) {
      setError('New password must contain at least one lowercase letter (a-z).');
      return;
    }

    if (!hasDigit) {
      setError('New password must contain at least one numeric digit (0-9).');
      return;
    }

    if (!confirmPassword) {
      setError('Please confirm your new password.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New password and confirmation password do not match.');
      return;
    }

    if (currentPassword === newPassword) {
      setError('New password must be different from your current temporary password.');
      return;
    }

    setLoading(true);
    try {
      const updatedUser = await authApi.forceChangePassword(currentPassword, newPassword, confirmPassword);
      const token = localStorage.getItem('beyon_token') || localStorage.getItem('beyon_access_token') || '';
      login(token, updatedUser);
      setSuccess(true);

      setTimeout(() => {
        if (updatedUser.role === 'STUDENT') {
          if (updatedUser.profileStatus === 'COMPLETED' || updatedUser.profileStatus === 'ACTIVE') {
            navigate('/student/home');
          } else {
            navigate('/onboarding/student');
          }
        } else if (updatedUser.role === 'INSTITUTION') {
          navigate('/institution/home');
        } else if (updatedUser.role === 'COMPANY') {
          navigate('/company/home');
        } else {
          navigate(getDashboardRoute());
        }
      }, 1500);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to update temporary password. Please verify your current temporary password.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        backgroundColor: '#f1f5f9',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
        boxSizing: 'border-box',
        fontFamily: 'inherit',
      }}
    >
      <div style={{ marginBottom: '24px', textAlign: 'center' }}>
        <Link to="/" style={{ display: 'inline-block', textDecoration: 'none' }}>
          <img
            src="/logo-transparent.png"
            alt="Beyon"
            style={{ height: '42px', width: 'auto', maxHeight: '42px', objectFit: 'contain' }}
            onError={(e) => {
              (e.currentTarget as HTMLElement).style.display = 'none';
            }}
          />
        </Link>
      </div>

      <div
        style={{
          width: '100%',
          maxWidth: '520px',
          background: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.08), 0 8px 10px -6px rgba(15, 23, 42, 0.04)',
          border: '1px solid #e2e8f0',
          padding: '36px 32px',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div
            style={{
              width: '54px',
              height: '54px',
              margin: '0 auto 16px auto',
              borderRadius: '50%',
              background: '#eff6ff',
              color: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid #dbeafe',
            }}
          >
            <ShieldAlert size={28} />
          </div>

          <h1
            style={{
              fontSize: '1.5rem',
              fontWeight: 800,
              color: '#0f172a',
              margin: '0 0 8px 0',
              letterSpacing: '-0.02em',
            }}
          >
            Set Permanent Password
          </h1>

          <p style={{ fontSize: '0.875rem', color: '#64748b', margin: '0 0 16px 0', lineHeight: 1.5 }}>
            Your account was provisioned with temporary credentials. Set your permanent secure password to activate your portal.
          </p>

          {user && (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                padding: '6px 14px',
                borderRadius: '9999px',
                fontSize: '0.8rem',
                color: '#334155',
              }}
            >
              <span style={{ color: '#64748b' }}>Account:</span>
              <strong style={{ color: '#0f172a' }}>{user.email}</strong>
              {user.role && (
                <span
                  style={{
                    background: '#e0e7ff',
                    color: '#3730a3',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '9999px',
                    textTransform: 'uppercase',
                  }}
                >
                  {user.role}
                </span>
              )}
            </div>
          )}
        </div>

        {error && (
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#991b1b',
              padding: '12px 14px',
              borderRadius: '8px',
              fontSize: '0.85rem',
              marginBottom: '20px',
              lineHeight: 1.45,
            }}
          >
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px', color: '#dc2626' }} />
            <div>{error}</div>
          </div>
        )}

        {success ? (
          <div
            style={{
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              color: '#166534',
              padding: '28px 20px',
              borderRadius: '12px',
              textAlign: 'center',
            }}
          >
            <CheckCircle2 size={44} style={{ color: '#16a34a', margin: '0 auto 12px auto' }} />
            <h3 style={{ margin: '0 0 6px 0', fontSize: '1.15rem', fontWeight: 700, color: '#15803d' }}>
              Password Set Successfully
            </h3>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#166534', lineHeight: 1.5 }}>
              Your credentials are saved and your portal is now unlocked. Redirecting you to your account...
            </p>
            <div
              style={{
                marginTop: '16px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                color: '#15803d',
                fontSize: '0.82rem',
                fontWeight: 600,
              }}
            >
              <Loader2 size={16} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
              <span>Loading dashboard...</span>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            {/* Current Temporary Password */}
            <div style={{ marginBottom: '16px' }}>
              <label
                htmlFor="current-password"
                style={{
                  display: 'block',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  color: '#334155',
                  marginBottom: '6px',
                }}
              >
                Current Temporary Password
              </label>
              <div style={{ position: 'relative' }}>
                <KeyRound
                  size={17}
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#94a3b8',
                    pointerEvents: 'none',
                  }}
                />
                <input
                  id="current-password"
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter provided temporary password"
                  autoComplete="current-password"
                  style={{
                    width: '100%',
                    padding: '10px 42px 10px 38px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.92rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.15s, box-shadow 0.15s',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#2563eb';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.12)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#cbd5e1';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowCurrentPassword((prev) => !prev)}
                  aria-label={showCurrentPassword ? 'Hide current password' : 'Show current password'}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    padding: '6px',
                    cursor: 'pointer',
                    color: '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '4px',
                  }}
                >
                  {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div style={{ marginBottom: '16px' }}>
              <label
                htmlFor="new-password"
                style={{
                  display: 'block',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  color: '#334155',
                  marginBottom: '6px',
                }}
              >
                New Secure Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={17}
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#94a3b8',
                    pointerEvents: 'none',
                  }}
                />
                <input
                  id="new-password"
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Create new personal password"
                  autoComplete="new-password"
                  style={{
                    width: '100%',
                    padding: '10px 42px 10px 38px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.92rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.15s, box-shadow 0.15s',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#2563eb';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.12)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#cbd5e1';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowNewPassword((prev) => !prev)}
                  aria-label={showNewPassword ? 'Hide new password' : 'Show new password'}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    padding: '6px',
                    cursor: 'pointer',
                    color: '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '4px',
                  }}
                >
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* Password Strength Meter */}
              {newPassword.length > 0 && currentStrength && (
                <div style={{ marginTop: '8px' }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '0.74rem',
                      fontWeight: 600,
                      color: '#64748b',
                      marginBottom: '4px',
                    }}
                  >
                    <span>Password Strength:</span>
                    <span style={{ color: currentStrength.color }}>{currentStrength.label}</span>
                  </div>
                  <div
                    style={{
                      height: '4px',
                      width: '100%',
                      background: '#e2e8f0',
                      borderRadius: '2px',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: currentStrength.width,
                        background: currentStrength.color,
                        transition: 'width 0.25s ease, background-color 0.25s ease',
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Confirm New Password */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label
                  htmlFor="confirm-password"
                  style={{
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    color: '#334155',
                  }}
                >
                  Confirm New Password
                </label>
                {confirmPassword.length > 0 && (
                  <span
                    style={{
                      fontSize: '0.74rem',
                      fontWeight: 600,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      color: passwordsMatch ? '#16a34a' : '#dc2626',
                    }}
                  >
                    {passwordsMatch ? (
                      <>
                        <Check size={13} />
                        Passwords match
                      </>
                    ) : (
                      <>
                        <X size={13} />
                        Passwords do not match
                      </>
                    )}
                  </span>
                )}
              </div>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={17}
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#94a3b8',
                    pointerEvents: 'none',
                  }}
                />
                <input
                  id="confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  autoComplete="new-password"
                  style={{
                    width: '100%',
                    padding: '10px 42px 10px 38px',
                    borderRadius: '8px',
                    border: `1px solid ${isMismatch ? '#f87171' : '#cbd5e1'}`,
                    fontSize: '0.92rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.15s, box-shadow 0.15s',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = isMismatch ? '#ef4444' : '#2563eb';
                    e.currentTarget.style.boxShadow = isMismatch
                      ? '0 0 0 3px rgba(239, 68, 68, 0.12)'
                      : '0 0 0 3px rgba(37, 99, 235, 0.12)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = isMismatch ? '#f87171' : '#cbd5e1';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    padding: '6px',
                    cursor: 'pointer',
                    color: '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '4px',
                  }}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Live Security Requirements Checklist */}
            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '12px 14px',
                marginBottom: '22px',
              }}
            >
              <div
                style={{
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: '#475569',
                  marginBottom: '8px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                Password Requirements
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.76rem',
                    color: hasLength ? '#16a34a' : '#64748b',
                    fontWeight: hasLength ? 600 : 400,
                  }}
                >
                  {hasLength ? <Check size={14} style={{ color: '#16a34a' }} /> : <span style={{ width: 14, textAlign: 'center', color: '#cbd5e1' }}>•</span>}
                  <span>At least 8 characters</span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.76rem',
                    color: hasUpper ? '#16a34a' : '#64748b',
                    fontWeight: hasUpper ? 600 : 400,
                  }}
                >
                  {hasUpper ? <Check size={14} style={{ color: '#16a34a' }} /> : <span style={{ width: 14, textAlign: 'center', color: '#cbd5e1' }}>•</span>}
                  <span>One uppercase letter</span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.76rem',
                    color: hasLower ? '#16a34a' : '#64748b',
                    fontWeight: hasLower ? 600 : 400,
                  }}
                >
                  {hasLower ? <Check size={14} style={{ color: '#16a34a' }} /> : <span style={{ width: 14, textAlign: 'center', color: '#cbd5e1' }}>•</span>}
                  <span>One lowercase letter</span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.76rem',
                    color: hasDigit ? '#16a34a' : '#64748b',
                    fontWeight: hasDigit ? 600 : 400,
                  }}
                >
                  {hasDigit ? <Check size={14} style={{ color: '#16a34a' }} /> : <span style={{ width: 14, textAlign: 'center', color: '#cbd5e1' }}>•</span>}
                  <span>One numeric digit</span>
                </div>
              </div>
            </div>

            {/* Submit Button - ALWAYS CLICKABLE to give feedback, only disabled when loading */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px 16px',
                background: loading ? '#64748b' : '#1e3a8a',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.95rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: loading ? 'none' : '0 4px 12px rgba(30, 58, 138, 0.25)',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.background = '#1d4ed8';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(29, 78, 216, 0.35)';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.background = '#1e3a8a';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(30, 58, 138, 0.25)';
                }
              }}
            >
              {loading ? (
                <>
                  <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                  <span>Setting Password & Activating Account...</span>
                </>
              ) : (
                <>
                  <ShieldCheck size={18} />
                  <span>Set Password & Activate Portal</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        )}

        {/* Footer info & Logout */}
        <div
          style={{
            marginTop: '24px',
            paddingTop: '20px',
            borderTop: '1px solid #f1f5f9',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.78rem',
            color: '#64748b',
          }}
        >
          <span>Need assistance? Contact portal admin.</span>
          <button
            type="button"
            onClick={handleLogout}
            style={{
              background: 'transparent',
              border: 'none',
              padding: 0,
              color: '#475569',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <LogOut size={13} />
            <span>Sign out</span>
          </button>
        </div>
      </div>
    </div>
  );
}

