import React, { useState } from 'react';
import styles from '../styles/MobileProctor.module.css';
import { CameraPreview } from '../components/CameraPreview';
import { Camera, Mic, RefreshCw, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

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

  const hasVideo = !!stream && stream.getVideoTracks().length > 0;
  const hasAudio = !!stream && stream.getAudioTracks().length > 0;

  return (
    <div className={styles.card}>
      <div>
        <h2 className={styles.title}>Sensor Permissions</h2>
        <p className={styles.subtitle}>
          Beyon requires access to your smartphone camera &amp; microphone to capture your secondary desk environment.
        </p>
      </div>

      {error && (
        <div className={styles.alertBox}>
          <AlertTriangle size={18} style={{ flexShrink: 0 }} />
          <div>{error}</div>
        </div>
      )}

      {/* Sensor checklist badges */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.625rem' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.625rem 0.75rem',
          background: hasVideo ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.03)',
          border: `1px solid ${hasVideo ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.08)'}`,
          borderRadius: '0.625rem',
          fontSize: '0.8125rem',
          color: hasVideo ? '#34d399' : '#94a3b8',
        }}>
          <Camera size={16} />
          <span>Camera: {hasVideo ? 'Granted' : 'Pending'}</span>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.625rem 0.75rem',
          background: hasAudio ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.03)',
          border: `1px solid ${hasAudio ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.08)'}`,
          borderRadius: '0.625rem',
          fontSize: '0.8125rem',
          color: hasAudio ? '#34d399' : '#94a3b8',
        }}>
          <Mic size={16} />
          <span>Mic: {hasAudio ? 'Granted' : 'Pending'}</span>
        </div>
      </div>

      {stream ? (
        <CameraPreview stream={stream} mirrored={facing === 'user'} />
      ) : (
        <div style={{
          padding: '2.25rem 1rem',
          textAlign: 'center',
          background: '#f8fafc',
          borderRadius: '8px',
          border: '1.5px dashed #cbd5e1',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.875rem'
        }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '10px',
            background: 'rgba(37, 60, 172, 0.08)',
            color: 'var(--color-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Camera size={26} />
          </div>
          <div>
            <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '1rem' }}>
              Camera &amp; Audio Inactive
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.25rem', maxWidth: '280px', margin: '0.25rem auto 0' }}>
              Tap below to prompt your device for camera and microphone permissions.
            </p>
          </div>
          <button
            className={styles.btnPrimary}
            style={{ maxWidth: '280px' }}
            onClick={() => onRequestCamera(facing)}
            disabled={loading}
          >
            {loading ? (
              <>
                <RefreshCw size={16} className={styles.pulse} />
                <span>Requesting Access...</span>
              </>
            ) : (
              <>
                <CheckCircle2 size={16} />
                <span>Allow Camera &amp; Mic</span>
              </>
            )}
          </button>
        </div>
      )}

      {stream && (
        <div style={{ display: 'flex', gap: '0.75rem', flexDirection: 'column' }}>
          <button className={styles.btnSecondary} onClick={handleToggleFacing}>
            <RefreshCw size={16} />
            <span>Switch to {facing === 'environment' ? 'Front Camera' : 'Rear Camera (Recommended)'}</span>
          </button>
          <button className={styles.btnPrimary} onClick={onProceed}>
            <span>Proceed to Workspace Calibration</span>
            <ArrowRight size={16} />
          </button>
        </div>
      )}

      <div className={styles.guidelineList}>
        <div className={styles.guidelineItem}>
          <Camera size={16} className={styles.guidelineIcon} />
          <span>We recommend using your phone's <strong>Rear Camera</strong> for better focal length and wide field of view.</span>
        </div>
      </div>
    </div>
  );
};