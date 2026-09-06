import React, { useState, useEffect, useRef } from 'react';
import styles from '../styles/MobileProctor.module.css';
import { CameraPreview } from '../components/CameraPreview';
import { ConnectionStatus } from '../components/ConnectionStatus';
import { Activity, Clock, Volume2, Battery, Moon, Sun, AlertTriangle, ShieldCheck } from 'lucide-react';

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
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [isDimmed, setIsDimmed] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const wakeLockRef = useRef<any>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator) {
          wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
        }
      } catch (err) {
        console.warn('Wake Lock request error:', err);
      }
    };
    requestWakeLock();

    return () => {
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => {});
        wakeLockRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        setBatteryLevel(Math.round(battery.level * 100));
        battery.addEventListener('levelchange', () => {
          setBatteryLevel(Math.round(battery.level * 100));
        });
      }).catch(() => {});
    }
  }, []);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className={styles.card} style={{ opacity: isDimmed ? 0.4 : 1, transition: 'opacity 0.3s ease' }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 className={styles.title} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>DualView Active</span>
            <span className={styles.recDot} />
          </h2>
          <p className={styles.subtitle}>Environmental angle surveillance feed</p>
        </div>
        <ConnectionStatus state="connected" />
      </div>

      <CameraPreview stream={stream} mirrored={false} />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div className={styles.devicePillGroup}>
          <div className={styles.devicePill}>
            <Clock size={12} color="#60a5fa" />
            <span>{formatTime(elapsedSeconds)}</span>
          </div>

          {batteryLevel !== null && (
            <div className={styles.devicePill}>
              <Battery size={12} color={batteryLevel < 20 ? '#ef4444' : '#34d399'} />
              <span>{batteryLevel}%</span>
            </div>
          )}

          <div className={styles.devicePill} style={{ color: '#34d399' }}>
            <ShieldCheck size={12} />
            <span>Wake Lock Active</span>
          </div>
        </div>

        <button
          className={styles.btnSecondary}
          style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
          onClick={() => setIsDimmed(!isDimmed)}
          title="Toggle battery saving display dimmer"
        >
          {isDimmed ? <Sun size={13} /> : <Moon size={13} />}
          <span>{isDimmed ? 'Undim' : 'Battery Saver'}</span>
        </button>
      </div>

      <div className={styles.statGrid}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Heartbeat Sync</span>
          <div className={styles.statValue}>
            <Activity size={18} color="#60a5fa" />
            <span>{heartbeatCount}</span>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 400 }}>pulses</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <span className={styles.statLabel}>Audio Atmosphere</span>
          <div className={styles.statValue}>
            <Volume2 size={18} color={speaking ? '#fbbf24' : '#34d399'} />
            <span style={{ color: speaking ? '#fbbf24' : '#34d399' }}>
              {speaking ? 'Sound Detected' : 'Quiet'}
            </span>
          </div>
        </div>
      </div>

      <div className={styles.guidelineList}>
        <div className={styles.guidelineItem}>
          <span className={styles.guidelineSuccessIcon}>✓</span>
          <span>Phone is locked into proctoring mode. Do not navigate away from this screen.</span>
        </div>
        <div className={styles.guidelineItem}>
          <span className={styles.guidelineSuccessIcon}>✓</span>
          <span>Desktop lockdown application is actively recording this secondary viewpoint.</span>
        </div>
      </div>

      {showConfirmModal ? (
        <div style={{
          padding: '1rem',
          background: 'rgba(239, 68, 68, 0.12)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '0.875rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fca5a5', fontSize: '0.875rem', fontWeight: 600 }}>
            <AlertTriangle size={18} />
            <span>Disconnect DualView Stream?</span>
          </div>
          <p style={{ fontSize: '0.75rem', color: '#cbd5e1', lineHeight: 1.4 }}>
            Only disconnect if your desktop assessment has been submitted. Premature disconnection may register a proctoring incident flag.
          </p>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              className={styles.btnSecondary}
              style={{ flex: 1 }}
              onClick={() => setShowConfirmModal(false)}
            >
              Cancel (Stay Live)
            </button>
            <button
              className={styles.btnDanger}
              style={{ flex: 1 }}
              onClick={onFinish}
            >
              Yes, Disconnect
            </button>
          </div>
        </div>
      ) : (
        <button
          className={styles.btnSecondary}
          onClick={() => setShowConfirmModal(true)}
          style={{ marginTop: '0.25rem' }}
        >
          Disconnect Stream (Exam Completed)
        </button>
      )}
    </div>
  );
};
