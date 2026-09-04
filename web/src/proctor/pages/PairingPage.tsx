import React, { useState, useEffect } from 'react';
import styles from '../styles/MobileProctor.module.css';

interface Props {
  initialToken?: string | null;
  onPaired: (token: string) => Promise<void>;
  error?: string | null;
}

export const PairingPage: React.FC<Props> = ({ initialToken, onPaired, error }) => {
  const [token, setToken] = useState(initialToken || '');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialToken && !submitting) {
      setToken(initialToken);
      handleSubmitToken(initialToken);
    }
  }, [initialToken]);

  const handleSubmitToken = async (tokenToSubmit: string) => {
    if (!tokenToSubmit.trim()) return;
    setSubmitting(true);
    try {
      await onPaired(tokenToSubmit);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.card}>
      <div>
        <h2 className={styles.title}>Pair Secondary Device</h2>
        <p className={styles.subtitle}>
          Connect this mobile device to pair with your ongoing desktop assessment session.
        </p>
      </div>

      {error && <div className={styles.alertBox}>{error}</div>}

      <div className={styles.inputGroup}>
        <label className={styles.inputLabel}>Pairing Token</label>
        <input
          type="text"
          className={styles.textInput}
          placeholder="Paste or enter 32-char token"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          disabled={submitting}
        />
      </div>

      <button
        className={styles.btnPrimary}
        onClick={() => handleSubmitToken(token)}
        disabled={!token.trim() || submitting}
      >
        {submitting ? 'Authenticating...' : 'Connect to Session'}
      </button>

      <div className={styles.guidelineList}>
        <div className={styles.guidelineItem}>
          <span className={styles.guidelineIcon}>✦</span>
          <span>Ensure your phone is connected to the same network or internet connection.</span>
        </div>
        <div className={styles.guidelineItem}>
          <span className={styles.guidelineIcon}>✦</span>
          <span>Position your mobile device 45° to 90° to your side to capture your workspace.</span>
        </div>
      </div>
    </div>
  );
};