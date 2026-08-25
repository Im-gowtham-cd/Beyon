import { useState, useEffect } from 'react';
import { communityApi } from '../services/communityApi';
import type { UserFeedback } from '../types/community';
import styles from './Community.module.css';

const FEEDBACK_TYPES = [
  { value: 'BUG', label: '🐛 Report a Bug', desc: 'Something is broken or not working' },
  { value: 'FEATURE', label: '💡 Feature Request', desc: 'Suggest a new feature or improvement' },
  { value: 'UX', label: '🎨 UX Feedback', desc: 'Something is confusing or hard to use' },
  { value: 'PERFORMANCE', label: '⚡ Performance Issue', desc: 'Something is slow or unresponsive' },
  { value: 'GENERAL', label: '💬 General Feedback', desc: 'Any other feedback or thoughts' },
];

const MODULES = ['Auth', 'Profile', 'Practice', 'Coins', 'Opportunities', 'Assessment', 'Community', 'Dashboard', 'Desktop App', 'Other'];
const SEVERITY_MAP: Record<string, string> = { BUG: 'HIGH', PERFORMANCE: 'HIGH', UX: 'NORMAL', FEATURE: 'LOW', GENERAL: 'LOW' };

export function FeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<UserFeedback[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ feedbackType: 'BUG', title: '', description: '', module: 'Other' });
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => { communityApi.getMyFeedback().then(setFeedbacks).catch(() => {}).finally(() => setLoading(false)); }, []);

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.description.trim()) return;
    try {
      const fb = await communityApi.submitFeedback({
        feedbackType: form.feedbackType,
        title: form.title,
        description: form.description,
        module: form.module,
        severity: SEVERITY_MAP[form.feedbackType] || 'NORMAL',
      });
      setFeedbacks([fb, ...feedbacks]);
      setForm({ feedbackType: 'BUG', title: '', description: '', module: 'Other' });
      setShowForm(false);
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
    } catch {}
  };

  const STATUS_COLORS: Record<string, string> = { OPEN: '#ca8a04', IN_REVIEW: '#2563eb', RESOLVED: '#16a34a', CLOSED: '#6b7280' };

  if (loading) return <div className={styles.container}><div className={styles.empty}>Loading feedback...</div></div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Beta Feedback</h1>
          <p className={styles.subtitle}>Help us improve Beyon — report bugs, suggest features, or share your experience</p>
        </div>
        <button className={styles.createBtn} onClick={() => setShowForm(!showForm)}>
          {showForm ? '← Back' : '+ Give Feedback'}
        </button>
      </div>

      {submitted && (
        <div className={styles.successBanner}>✓ Thank you! Your feedback has been submitted.</div>
      )}

      {showForm && (
        <div className={styles.createForm}>
          <div className={styles.feedbackTypeGrid}>
            {FEEDBACK_TYPES.map(ft => (
              <button
                key={ft.value}
                className={`${styles.feedbackTypeCard} ${form.feedbackType === ft.value ? styles.feedbackTypeActive : ''}`}
                onClick={() => setForm({ ...form, feedbackType: ft.value })}
              >
                <div className={styles.feedbackTypeLabel}>{ft.label}</div>
                <div className={styles.feedbackTypeDesc}>{ft.desc}</div>
              </button>
            ))}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Module</label>
            <select className={styles.formSelect} value={form.module} onChange={e => setForm({ ...form, module: e.target.value })}>
              {MODULES.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Title *</label>
            <input className={styles.formInput} placeholder="Brief summary of the issue or suggestion" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Description *</label>
            <textarea className={styles.formTextarea} placeholder="Provide as much detail as possible..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={5} />
          </div>

          <button className={styles.submitBtn} onClick={handleSubmit} disabled={!form.title.trim() || !form.description.trim()}>
            Submit Feedback
          </button>
        </div>
      )}

      <div className={styles.feedbackList}>
        {feedbacks.length === 0 && !showForm ? (
          <div className={styles.empty}>No feedback submitted yet. Be the first to share your thoughts!</div>
        ) : (
          feedbacks.map(fb => (
            <div className={styles.feedbackCard} key={fb.id}>
              <div className={styles.feedbackHeader}>
                <span className={styles.feedbackType}>{fb.feedbackType}</span>
                <span className={styles.statusBadge} style={{ background: STATUS_COLORS[fb.status] || '#6b7280' }}>{fb.status}</span>
              </div>
              <div className={styles.feedbackTitle}>{fb.title}</div>
              <div className={styles.feedbackDesc}>{fb.description}</div>
              <div className={styles.feedbackMeta}>
                {fb.module && <span>📦 {fb.module}</span>}
                <span>🕐 {new Date(fb.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
