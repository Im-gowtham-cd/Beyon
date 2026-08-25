import { useState, type FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../services/authApi';
import type { ApiError } from '../../services/api/client';
import { OnboardingLayout } from '../../onboarding/components/OnboardingLayout';
import styles from './SettingsPage.module.css';

export function SettingsPage() {
  const { user, refreshUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [nameSaving, setNameSaving] = useState(false);
  const [nameMsg, setNameMsg] = useState('');
  const [nameErr, setNameErr] = useState('');

  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState('');
  const [pwErr, setPwErr] = useState('');
  const [pwErrors, setPwErrors] = useState<Record<string, string>>({});

  async function handleNameSave(e: FormEvent) {
    e.preventDefault();
    setNameMsg('');
    setNameErr('');
    setNameSaving(true);
    try {
      await authApi.updateProfile(name.trim());
      await refreshUser();
      setNameMsg('Name updated successfully.');
    } catch (err) {
      const apiErr = err as ApiError;
      setNameErr(apiErr.message || 'Failed to update name.');
    } finally {
      setNameSaving(false);
    }
  }

  function validatePw(): boolean {
    const errs: Record<string, string> = {};
    if (newPw.length < 8) errs.newPw = 'Password must be at least 8 characters';
    else {
      if (!/[A-Z]/.test(newPw)) errs.newPw = 'Must contain an uppercase letter';
      else if (!/[a-z]/.test(newPw)) errs.newPw = 'Must contain a lowercase letter';
      else if (!/[0-9]/.test(newPw)) errs.newPw = 'Must contain a number';
    }
    if (newPw !== confirmPw) errs.confirmPw = 'Passwords do not match';
    setPwErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handlePasswordChange(e: FormEvent) {
    e.preventDefault();
    setPwMsg('');
    setPwErr('');
    if (!validatePw()) return;
    setPwSaving(true);
    try {
      await authApi.changePassword(currentPw, newPw, confirmPw);
      setPwMsg('Password changed successfully.');
      setCurrentPw('');
      setNewPw('');
      setConfirmPw('');
    } catch (err) {
      const apiErr = err as ApiError;
      setPwErr(apiErr.message || 'Failed to change password.');
    } finally {
      setPwSaving(false);
    }
  }

  return (
    <OnboardingLayout currentStep={0} totalSteps={0}>
      <div className={styles.container}>
        <h1 className={styles.title}>Settings</h1>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Account</h2>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Email</span>
            <span className={styles.fieldValue}>{user?.email}</span>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Role</span>
            <span className={styles.fieldValue}>{user?.role}</span>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Email Verification</span>
            <span className={styles.fieldValue} style={{ color: user?.emailVerified ? 'var(--color-success)' : 'var(--color-warning)' }}>
              {user?.emailVerified ? 'Verified' : 'Not verified'}
            </span>
          </div>
          <form onSubmit={handleNameSave}>
            <div className={styles.field}>
              <label className={styles.fieldLabel} htmlFor="settings-name">Display Name</label>
              <input id="settings-name" className={styles.fieldInput} value={name} onChange={e => setName(e.target.value)} required />
            </div>
            {nameMsg && <div className={styles.success}>{nameMsg}</div>}
            {nameErr && <div className={styles.errorBanner}>{nameErr}</div>}
            <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={nameSaving}>
              {nameSaving ? 'Saving...' : 'Save Name'}
            </button>
          </form>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Security</h2>
          <form onSubmit={handlePasswordChange}>
            <div className={styles.field}>
              <label className={styles.fieldLabel} htmlFor="current-pw">Current Password</label>
              <input id="current-pw" type="password" className={styles.fieldInput} value={currentPw} onChange={e => setCurrentPw(e.target.value)} required autoComplete="current-password" />
            </div>
            <div className={styles.field}>
              <label className={styles.fieldLabel} htmlFor="new-pw">New Password</label>
              <input id="new-pw" type="password" className={styles.fieldInput} value={newPw} onChange={e => setNewPw(e.target.value)} required autoComplete="new-password" />
              {pwErrors.newPw && <span className={styles.error}>{pwErrors.newPw}</span>}
            </div>
            <div className={styles.field}>
              <label className={styles.fieldLabel} htmlFor="confirm-pw">Confirm New Password</label>
              <input id="confirm-pw" type="password" className={styles.fieldInput} value={confirmPw} onChange={e => setConfirmPw(e.target.value)} required autoComplete="new-password" />
              {pwErrors.confirmPw && <span className={styles.error}>{pwErrors.confirmPw}</span>}
            </div>
            {pwMsg && <div className={styles.success}>{pwMsg}</div>}
            {pwErr && <div className={styles.errorBanner}>{pwErr}</div>}
            <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={pwSaving}>
              {pwSaving ? 'Changing...' : 'Change Password'}
            </button>
          </form>
        </div>

        <div className={styles.dangerSection}>
          <h2 className={styles.sectionTitle}>Session</h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-md)' }}>
            Sign out of your account on this device.
          </p>
        </div>
      </div>
    </OnboardingLayout>
  );
}
