import React from 'react';
import styles from '../styles/MobileProctor.module.css';

export const CalibrationOverlay: React.FC = () => {
  return (
    <div className={styles.calibrationGrid}>
      <div className={styles.gridBox}>
        <span>Align Laptop & Candidate Face in Frame</span>
      </div>
    </div>
  );
};