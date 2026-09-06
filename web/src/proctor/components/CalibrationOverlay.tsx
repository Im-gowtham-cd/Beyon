import React from 'react';
import styles from '../styles/MobileProctor.module.css';

export const CalibrationOverlay: React.FC = () => {
  return (
    <div className={styles.calibrationGrid}>
      <div className={styles.gridBox}>
        <div className={styles.cornerTL} />
        <div className={styles.cornerTR} />
        <div className={styles.cornerBL} />
        <div className={styles.cornerBR} />
        <div style={{ fontWeight: 700, letterSpacing: '0.02em', fontSize: '0.875rem' }}>
          DESK SURVEILLANCE ZONE
        </div>
        <span style={{ fontSize: '0.75rem', opacity: 0.85, maxWidth: '240px', lineHeight: 1.4 }}>
          Position phone 45° to side. Ensure hands, keyboard, and monitor are visible.
        </span>
      </div>
    </div>
  );
};
