import React from 'react';
import styles from '../styles/MobileProctor.module.css';
import { CameraPreview } from '../components/CameraPreview';
import { CalibrationOverlay } from '../components/CalibrationOverlay';

interface Props {
  stream: MediaStream | null;
  audioLevel: number;
  onStartExam: () => void;
}

export const CalibrationPage: React.FC<Props> = ({ stream, audioLevel, onStartExam }) => {
  return (
    <div className={styles.card}>
      <div>
        <h2 className={styles.title}>Workspace Calibration</h2>
        <p className={styles.subtitle}>
          Position your phone stably on your desk or on a stand so your hands, keyboard, and screen are visible.
        </p>
      </div>

      <CameraPreview stream={stream}>
        <CalibrationOverlay />
      </CameraPreview>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '0.5rem' }}>
        <span style={{ fontSize: '0.8125rem', color: '#9ca3af' }}>Microphone Sensor Activity</span>
        <div style={{ width: '100px', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '9999px', overflow: 'hidden' }}>
          <div
            style={{
              width: `${Math.min(100, (audioLevel / 128) * 100)}%`,
              height: '100%',
              background: audioLevel > 35 ? '#34d399' : '#3b82f6',
              transition: 'width 0.1s ease',
            }}
          />
        </div>
      </div>

      <div className={styles.guidelineList}>
        <div className={styles.guidelineItem}>
          <span className={styles.guidelineIcon}>✓</span>
          <span>Candidate hands and keyboard must be within camera viewpoint.</span>
        </div>
        <div className={styles.guidelineItem}>
          <span className={styles.guidelineIcon}>✓</span>
          <span>No other persons or secondary communication screens should be visible.</span>
        </div>
        <div className={styles.guidelineItem}>
          <span className={styles.guidelineIcon}>✓</span>
          <span>Keep your phone plugged into a charger or ensure battery &gt; 50%.</span>
        </div>
      </div>

      <button className={styles.btnPrimary} onClick={onStartExam}>
        Lock In &amp; Begin Live Proctoring
      </button>
    </div>
  );
};