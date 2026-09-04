import React, { useState, useEffect } from 'react';
import styles from '../styles/MobileProctor.module.css';
import { Smartphone, Monitor, ShieldCheck, AlertCircle, ArrowRight, RefreshCw } from 'lucide-react';

interface Props {
  initialToken?: string | null;
  onPaired: (token: string) => Promise<void>;
  error?: string | null;
}

export const PairingPage: React.FC<Props> = ({ initialToken, onPaired, error }) => {
  const [token, setToken] = useState(initialToken || '');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialToken && initialToken !== 'undefined' && !submitting) {
      setToken(initialToken);
      handleSubmitToken(initialToken);
    }
  }, [initialToken]);

  const handleSubmitToken = async (tokenToSubmit: string) => {
    if (!tokenToSubmit.trim() || tokenToSubmit === 'undefined') return;
    setSubmitting(true);
    try {
      await onPaired(tokenToSubmit.trim());
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.card}>
      {/* Handshake Graphic */}
      <div className={styles.placementGraphic}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ padding: '0.75rem', borderRadius: '0.75rem', background: 'rgba(59,130,246,0.15)', color: '#60a5fa' }}>
            <Monitor size={28} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
            <div style={{ width: '40px', height: '2px', background: submitting ? '#3b82f6' : 'rgba(255,255,255,0.2)', position: 'relative' }}>
              {submitting && <div className={styles.pulse} style={{ position: 'absolute', top: '-3px', left: '16px', width: '8px', height: '8px', borderRadius: '50%', background: '#38bdf8' }} />}
            </div>
            <span style={{ fontSize: '0.625rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Sync
            </span>
          </div>
          <div style={{ padding: '0.75rem', borderRadius: '0.75rem', background: 'rgba(16,185,129,0.15)', color: '#34d399' }}>
            <Smartphone size={28} />
          </div>
        </div>
        <div className={styles.placementAngleChip} style={{ marginTop: '0.5rem' }}>
          DualView™ Security Bridge
        </div>
      </div>

      <div>
        <h2 className={styles.title}>Pair Secondary Device</h2>
        <p className={styles.subtitle}>
          Connect this smartphone as an environmental angle camera for your active desktop assessment.
        </p>
      </div>

      {error && (
        <div className={styles.alertBox}>
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <div>{error}</div>
        </div>
      )}

      {submitting && initialToken && initialToken !== 'undefined' ? (
        <div style={{ padding: '1.5rem', textAlign: 'center', background: 'rgba(59,130,246,0.06)', borderRadius: '0.875rem', border: '1px solid rgba(59,130,246,0.2)' }}>
          <RefreshCw size={28} className={styles.pulse} style={{ color: '#60a5fa', margin: '0 auto 0.75rem' }} />
          <div style={{ fontWeight: 600, color: '#ffffff', fontSize: '0.9375rem' }}>
            Verifying Pairing Handshake...
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem', fontFamily: 'monospace' }}>
            Token: {initialToken.slice(0, 8)}...{initialToken.slice(-6)}
          </div>
        </div>
      ) : (
        <>
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>
              <span>Assessment Pairing Token</span>
              <span style={{ color: '#64748b', fontSize: '0.6875rem', textTransform: 'none' }}>From Desktop Screen</span>
            </label>
            <input
              type="text"
              className={styles.textInput}
              placeholder="e.g. 3jSoKsc_C9zKgsqsb1AD..."
              value={token === 'undefined' ? '' : token}
              onChange={(e) => setToken(e.target.value)}
              disabled={submitting}
              autoComplete="off"
              spellCheck="false"
            />
          </div>

          <button
            className={styles.btnPrimary}
            onClick={() => handleSubmitToken(token)}
            disabled={!token.trim() || token === 'undefined' || submitting}
          >
            {submitting ? (
              <>
                <RefreshCw size={16} className={styles.pulse} />
                <span>Pairing Device...</span>
              </>
            ) : (
              <>
                <span>Connect to Session</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </>
      )}

      <div className={styles.guidelineList}>
        <div className={styles.guidelineItem}>
          <ShieldCheck size={16} className={styles.guidelineIcon} />
          <span>Both devices communicate encrypted over local Wi-Fi or secure cloud sync.</span>
        </div>
        <div className={styles.guidelineItem}>
          <ShieldCheck size={16} className={styles.guidelineIcon} />
          <span>Position mobile 45° to 90° from your desk once connected.</span>
        </div>
      </div>
    </div>
  );
};