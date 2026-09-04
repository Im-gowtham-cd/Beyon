import React, { useState } from 'react';
import styles from '../styles/MobileProctor.module.css';
import { CameraPreview } from '../components/CameraPreview';

interface Props {
  stream: MediaStream | null;
  loading: boolean;
  error?: string | null;
  onRequestCamera: (facingMode: 'environment' | 'user') => Promise<any>;
  onProceed: () => void;
}

export const CameraSetupPage: React.FC<Props> = ({
  stream,
  loading,
  error,
  onRequestCamera,
  onProceed,
}) => {
  const [facing, setFacing] = useState<'environment' | 'user'>('environment');

  const handleToggleFacing = async () => {
    const next = facing === 'environment' ? 'user' : 'environment';
    setFacing(next);
    await onRequestCamera(next);
  };

  return (
    <div className={styles.card}>
      <div>
        <h2 className={styles.title}>Camera Permissions</h2>
        <p className={styles.subtitle}>
          Grant camera and microphone permissions to capture your side environment angle.
        </p>
      </div>

      {error && <div className={styles.alertBox}>{error}</div>}

      {stream ? (
        <CameraPreview stream={stream} />
      ) : (
        <div style={{ padding: '2rem 1rem', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '0.75rem' }}>
          <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '1rem' }}>
            Camera is currently off. Click below to initialize device sensors.
          </p>
          <button
            className={styles.btnPrimary}
            style={{ margin: '0 auto' }}
            onClick={() => onRequestCamera(facing)}
            disabled={loading}
          >
            {loading ? 'Requesting Access...' : 'Allow Camera & Microphone'}
          </button>
        </div>
      )}

      {stream && (
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className={styles.btnSecondary} style={{ flex: 1 }} onClick={handleToggleFacing}>
            Flip Camera ({facing === 'environment' ? 'Rear' : 'Front'})
          </button>
          <button className={styles.btnPrimary} style={{ flex: 1 }} onClick={onProceed}>
            Proceed to Calibration
          </button>
        </div>
      )}
    </div>
  );
};