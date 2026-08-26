import { useState, useEffect } from 'react';
import { api } from '../../services/api/client';
import styles from './SettingsPages.module.css';

interface PrivacySettings {
  profileVisibility: string;
  portfolioVisibility: string;
  assessmentDataSharing: boolean;
  searchIndexing: boolean;
  dataSharingAnalytics: boolean;
  marketingConsent: boolean;
}

interface ConsentRecord {
  id: string;
  consentType: string;
  granted: boolean;
  createdAt: string;
}

export function PrivacySettingsPage() {
  const [settings, setSettings] = useState<PrivacySettings>({
    profileVisibility: 'PUBLIC',
    portfolioVisibility: 'PUBLIC',
    assessmentDataSharing: false,
    searchIndexing: true,
    dataSharingAnalytics: false,
    marketingConsent: false,
  });
  const [_consents, setConsents] = useState<ConsentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [s, c] = await Promise.all([
          api.get<PrivacySettings>('/privacy/settings'),
          api.get<ConsentRecord[]>('/privacy/consents'),
        ]);
        setSettings(s);
        setConsents(c);
      } catch { /* */ }
      setLoading(false);
    }
    load();
  }, []);

  async function handleSave() {
    setSaving(true);
    try {
      await api.put('/privacy/settings', settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch { /* */ }
    setSaving(false);
  }

  async function handleExport() {
    try {
      const data = await api.get('/privacy/export');
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'beyon-data-export.json';
      a.click();
      URL.revokeObjectURL(url);
    } catch { /* */ }
  }

  async function handleDeleteRequest() {
    if (confirm('Are you sure you want to request account deletion? This action requires admin review.')) {
      try {
        await api.post('/privacy/delete-request');
        alert('Deletion request submitted. You will be notified when it is processed.');
      } catch { /* */ }
    }
  }

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loadingContainer}>
          {[1, 2, 3].map(i => <div key={i} className={styles.skeleton} style={{ height: 60 }} />)}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Privacy & Data Settings</h1>

      {saved && <div className={styles.successBanner}>Settings saved successfully!</div>}

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Profile Visibility</h2>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Who can see your profile?</label>
          <select
            className={styles.formSelect}
            value={settings.profileVisibility}
            onChange={e => setSettings({ ...settings, profileVisibility: e.target.value })}
          >
            <option value="PUBLIC">Everyone</option>
            <option value="COMPANIES">Companies Only</option>
            <option value="INSTITUTION">Institution Only</option>
            <option value="FOLLOWERS">Followers Only</option>
            <option value="PRIVATE">Private</option>
          </select>
        </div>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Who can see your portfolio?</label>
          <select
            className={styles.formSelect}
            value={settings.portfolioVisibility}
            onChange={e => setSettings({ ...settings, portfolioVisibility: e.target.value })}
          >
            <option value="PUBLIC">Everyone</option>
            <option value="COMPANIES">Companies Only</option>
            <option value="INSTITUTION">Institution Only</option>
            <option value="PRIVATE">Private</option>
          </select>
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Data Sharing</h2>
        <label className={styles.checkboxLabel}>
          <input type="checkbox" checked={settings.assessmentDataSharing}
            onChange={e => setSettings({ ...settings, assessmentDataSharing: e.target.checked })} />
          <span>Share assessment data with companies for matching</span>
        </label>
        <label className={styles.checkboxLabel}>
          <input type="checkbox" checked={settings.searchIndexing}
            onChange={e => setSettings({ ...settings, searchIndexing: e.target.checked })} />
          <span>Allow search engines to index your public profile</span>
        </label>
        <label className={styles.checkboxLabel}>
          <input type="checkbox" checked={settings.dataSharingAnalytics}
            onChange={e => setSettings({ ...settings, dataSharingAnalytics: e.target.checked })} />
          <span>Share anonymized data for platform analytics</span>
        </label>
        <label className={styles.checkboxLabel}>
          <input type="checkbox" checked={settings.marketingConsent}
            onChange={e => setSettings({ ...settings, marketingConsent: e.target.checked })} />
          <span>Receive marketing emails and notifications</span>
        </label>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Your Data</h2>
        <div className={styles.actions}>
          <button className={styles.submitBtn} onClick={handleExport}>Export My Data</button>
          <button className={styles.dangerBtn} onClick={handleDeleteRequest}>Request Account Deletion</button>
        </div>
      </div>

      <button className={styles.submitBtn} onClick={handleSave} disabled={saving}>
        {saving ? 'Saving...' : 'Save Settings'}
      </button>
    </div>
  );
}
