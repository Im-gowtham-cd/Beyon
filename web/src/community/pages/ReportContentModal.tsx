import { useState } from 'react';
import { api } from '../../services/api/client';
import styles from './Collaboration.module.css';

interface Props {
  targetType: string;
  targetId: string;
  onClose: () => void;
  onSuccess: () => void;
}

const REASONS = [
  'Spam', 'Harassment', 'Fraud', 'Impersonation',
  'Inappropriate Content', 'Fake Opportunity', 'Misleading Information', 'Other'
];

export function ReportContentModal({ targetType, targetId, onClose, onSuccess }: Props) {
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (!reason) return;
    setSubmitting(true);
    try {
      await api.post('/moderation/report', { targetType, targetId, reason, description });
      onSuccess();
      onClose();
    } catch { /* */ }
    setSubmitting(false);
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <h2 className={styles.modalTitle}>Report Content</h2>
        <p className={styles.emptyText}>Why are you reporting this?</p>

        <div className={styles.reasonGrid}>
          {REASONS.map(r => (
            <button
              key={r}
              className={`${styles.reasonBtn} ${reason === r ? styles.reasonActive : ''}`}
              onClick={() => setReason(r)}
            >
              {r}
            </button>
          ))}
        </div>

        <textarea
          className={styles.textarea}
          placeholder="Additional details (optional)"
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={3}
        />

        <div className={styles.modalActions}>
          <button className={styles.cancelBtn} onClick={onClose}>Cancel</button>
          <button className={styles.submitBtn} onClick={handleSubmit} disabled={!reason || submitting}>
            {submitting ? 'Submitting...' : 'Submit Report'}
          </button>
        </div>
      </div>
    </div>
  );
}
