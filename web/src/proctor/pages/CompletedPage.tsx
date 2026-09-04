import React from 'react';
import styles from '../styles/MobileProctor.module.css';
import { CheckCircle2, ShieldCheck, Monitor } from 'lucide-react';

export const CompletedPage: React.FC = () => {
  return (
    <div className={styles.card} style={{ textAlign: 'center', padding: '2.5rem 1.5rem', gap: '1.5rem' }}>
      <div style={{
        width: '64px',
        height: '64px',
        background: 'rgba(16, 185, 129, 0.15)',
        color: '#34d399',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto',
        boxShadow: '0 0 20px rgba(16, 185, 129, 0.25)',
      }}>
        <CheckCircle2 size={36} />
      </div>

      <div>
        <h2 className={styles.title}>Session Concluded</h2>
        <p className={styles.subtitle} style={{ marginTop: '0.5rem', maxWidth: '320px', margin: '0.5rem auto 0' }}>
          DualView secondary surveillance feed has been safely stopped and archived.
        </p>
      </div>

      <div className={styles.guidelineList} style={{ textAlign: 'left' }}>
        <div className={styles.guidelineItem}>
          <ShieldCheck size={18} className={styles.guidelineSuccessIcon} />
          <span>All telemetry frames and audio logs have been verified and cryptographically sealed.</span>
        </div>
        <div className={styles.guidelineItem}>
          <Monitor size={18} className={styles.guidelineIcon} />
          <span>You can now return to your desktop lockdown screen or close this mobile tab.</span>
        </div>
      </div>
    </div>
  );
};