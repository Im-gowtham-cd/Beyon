import React, { useState } from 'react';
import styles from '../styles/MobileProctor.module.css';
import { CameraPreview } from '../components/CameraPreview';
import { CalibrationOverlay } from '../components/CalibrationOverlay';
import { CheckSquare, Square, Volume2, Lock } from 'lucide-react';

interface Props {
  stream: MediaStream | null;
  audioLevel: number;
  onStartExam: () => void;
}

export const CalibrationPage: React.FC<Props> = ({ stream, audioLevel, onStartExam }) => {
  const [checks, setChecks] = useState({
    handsVisible: true,
    phoneStable: true,
    wellLit: true,
  });

  const toggleCheck = (key: keyof typeof checks) => {
    setChecks((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const allChecked = checks.handsVisible && checks.phoneStable && checks.wellLit;
  const audioPercentage = Math.min(100, Math.round((audioLevel / 128) * 100));

  return (
    <div className={styles.card}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 className={styles.title}>Workspace Calibration</h2>
          <p className={styles.subtitle}>
            Position your phone to your side (45°–90°) so your hands, keyboard, and screen are visible.
          </p>
        </div>
      </div>

      <CameraPreview stream={stream} mirrored={false}>
        <CalibrationOverlay />
      </CameraPreview>

      {/* Microphone Activity Meter */}
      <div className={styles.audioMeterWrap}>
        <div className={styles.audioMeterHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#94a3b8' }}>
            <Volume2 size={15} />
            <span>Microphone Sensor</span>
          </div>
          <span style={{
            fontSize: '0.75rem',
            fontWeight: 600,
            color: audioPercentage > 25 ? '#34d399' : '#60a5fa'
          }}>
            {audioPercentage > 25 ? 'Audio Active' : 'Normal / Ambient'}
          </span>
        </div>
        <div className={styles.audioMeterTrack}>
          <div
            className={styles.audioMeterFill}
            style={{
              width: `${Math.max(6, audioPercentage)}%`,
              backgroundColor: audioPercentage > 35 ? '#34d399' : '#3b82f6',
            }}
          />
        </div>
      </div>

      {/* Interactive Alignment Checklist */}
      <div className={styles.guidelineList}>
        <div
          className={styles.guidelineItem}
          style={{ cursor: 'pointer', userSelect: 'none' }}
          onClick={() => toggleCheck('handsVisible')}
        >
          {checks.handsVisible ? (
            <CheckSquare size={18} className={styles.guidelineSuccessIcon} />
          ) : (
            <Square size={18} style={{ color: '#64748b', flexShrink: 0 }} />
          )}
          <span style={{ color: checks.handsVisible ? '#f8fafc' : '#94a3b8' }}>
            Hands, desk, and laptop keyboard are framed inside the guide box.
          </span>
        </div>

        <div
          className={styles.guidelineItem}
          style={{ cursor: 'pointer', userSelect: 'none' }}
          onClick={() => toggleCheck('phoneStable')}
        >
          {checks.phoneStable ? (
            <CheckSquare size={18} className={styles.guidelineSuccessIcon} />
          ) : (
            <Square size={18} style={{ color: '#64748b', flexShrink: 0 }} />
          )}
          <span style={{ color: checks.phoneStable ? '#f8fafc' : '#94a3b8' }}>
            Phone is stably propped on a stand, cup, or charger (no hand-holding).
          </span>
        </div>

        <div
          className={styles.guidelineItem}
          style={{ cursor: 'pointer', userSelect: 'none' }}
          onClick={() => toggleCheck('wellLit')}
        >
          {checks.wellLit ? (
            <CheckSquare size={18} className={styles.guidelineSuccessIcon} />
          ) : (
            <Square size={18} style={{ color: '#64748b', flexShrink: 0 }} />
          )}
          <span style={{ color: checks.wellLit ? '#f8fafc' : '#94a3b8' }}>
            Room is adequately illuminated with no backlight glare.
          </span>
        </div>
      </div>

      <button
        className={styles.btnPrimary}
        onClick={onStartExam}
        disabled={!allChecked}
      >
        <Lock size={16} />
        <span>Confirm Alignment &amp; Activate Stream</span>
      </button>
    </div>
  );
};