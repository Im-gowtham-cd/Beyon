import React from 'react';
import styles from '../styles/MobileProctor.module.css';
import { CameraPreview } from '../components/CameraPreview';
import { ConnectionStatus } from '../components/ConnectionStatus';

interface Props {
  stream: MediaStream | null;
  heartbeatCount: number;
  speaking: boolean;
  onFinish: () => void;
}

export const ActiveProctorPage: React.FC<Props> = ({
  stream,
  heartbeatCount,
  speaking,
  onFinish,
}) => {
  return (
    <div className={styles.card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 className={styles.title}>Live Proctoring Active</h2>
          <p className={styles.subtitle}>Streaming environment verification feed.</p>
        </div>
        <ConnectionStatus state="connected" />
      </div>

      <CameraPreview stream={stream} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: '0.5rem' }}>
          <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Sync Pulses</div>
          <div style={{ fontSize: '1.125rem', fontWeight: 700, color: '#60a5fa' }}>
            {heartbeatCount} sent
          </div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: '0.5rem' }}>
          <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Audio Detection</div>
          <div style={{ fontSize: '1.125rem', fontWeight: 700, color: speaking ? '#fbbf24' : '#34d399' }}>
            {speaking ? 'Sound Detected' : 'Quiet'}
          </div>
        </div>
      </div>

      <div className={styles.guidelineList}>
        <div className={styles.guidelineItem}>
          <span className={styles.guidelineIcon}>🔒</span>
          <span>Do not minimize or close this browser tab during your test.</span>
        </div>
        <div className={styles.guidelineItem}>
          <span className={styles.guidelineIcon}>🔒</span>
          <span>Your desktop app is synchronized with this secondary video stream.</span>
        </div>
      </div>

      <button className={styles.btnSecondary} onClick={onFinish} style={{ marginTop: '0.5rem' }}>
        Assessment Complete (Disconnect)
      </button>
    </div>
  );
};