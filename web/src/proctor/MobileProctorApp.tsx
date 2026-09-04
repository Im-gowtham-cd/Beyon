import React, { useState, useEffect } from 'react';
import styles from './styles/MobileProctor.module.css';
import { PairingPage } from './pages/PairingPage';
import { CameraSetupPage } from './pages/CameraSetupPage';
import { CalibrationPage } from './pages/CalibrationPage';
import { ActiveProctorPage } from './pages/ActiveProctorPage';
import { CompletedPage } from './pages/CompletedPage';
import { useMobileCamera } from './hooks/useMobileCamera';
import { useMobileAudio } from './hooks/useMobileAudio';
import { useMobileProctor } from './hooks/useMobileProctor';
import { Check } from 'lucide-react';

export const MobileProctorApp: React.FC = () => {
  const [tokenParam, setTokenParam] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get('token');
    if (t && t !== 'undefined') setTokenParam(t);
  }, []);

  const {
    procSessionId,
    status,
    setStatus,
    error: proctorError,
    heartbeatCount,
    pairWithToken,
    sendHeartbeat,
    startMonitoring,
    stopMonitoring,
  } = useMobileProctor(tokenParam);

  const { stream, error: cameraError, loading: cameraLoading, startCamera, stopCamera } = useMobileCamera();
  const { audioLevel, speaking } = useMobileAudio(stream);

  // Keep reporting camera active as soon as mobile camera stream starts
  useEffect(() => {
    if (procSessionId && stream && stream.getVideoTracks().length > 0) {
      sendHeartbeat(procSessionId, true, true);
      const interval = setInterval(() => {
        sendHeartbeat(procSessionId, true, true);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [procSessionId, stream, sendHeartbeat]);

  const handlePair = async (token: string) => {
    await pairWithToken(token);
  };

  const handleProceedToCalibration = () => {
    setStatus('calibrating');
  };

  const handleStartExam = () => {
    if (!procSessionId) return;
    const video = document.querySelector('video');
    startMonitoring(procSessionId, video as HTMLVideoElement);
  };

  const handleFinish = () => {
    stopMonitoring();
    stopCamera();
    setStatus('completed');
  };

  // Stepper calculations
  const steps = [
    { key: 'pairing', label: 'Pair' },
    { key: 'setup', label: 'Sensors' },
    { key: 'calibrating', label: 'Align' },
    { key: 'active', label: 'Stream' },
  ];

  const getStepIndex = (st: string) => {
    switch (st) {
      case 'pairing': return 0;
      case 'setup': return 1;
      case 'calibrating': return 2;
      case 'active': return 3;
      case 'completed': return 4;
      default: return 0;
    }
  };

  const currentIndex = getStepIndex(status);

  return (
    <div className={styles.container}>
      {/* Header (Matching Desktop Assessment Header) */}
      <header className={styles.header}>
        <div className={styles.brand}>
          <div className={styles.brandMark} />
          <div>
            <span className={styles.brandName}>BEYON</span>
            <span className={styles.brandSub}>DUALVIEW PROCTOR</span>
          </div>
        </div>

        <div className={styles.kioskPill}>
          <span className={styles.dotLive} />
          <span>KIOSK SECURED</span>
        </div>
      </header>

      {/* Stepper (only visible while setting up / active) */}
      {status !== 'completed' && (
        <div className={styles.stepper}>
          {steps.map((step, idx) => {
            const isDone = currentIndex > idx;
            const isActive = currentIndex === idx;
            return (
              <div
                key={step.key}
                className={`${styles.stepItem} ${isActive ? styles.stepActive : ''} ${isDone ? styles.stepDone : ''}`}
              >
                {idx < steps.length - 1 && (
                  <div
                    className={`${styles.stepConnector} ${currentIndex > idx ? styles.stepConnectorActive : ''}`}
                  />
                )}
                <div className={styles.stepNumber}>
                  {isDone ? <Check size={13} strokeWidth={3} /> : idx + 1}
                </div>
                <span className={styles.stepLabel}>{step.label}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Content Body */}
      <main className={styles.content}>
        {status === 'pairing' && (
          <PairingPage
            initialToken={tokenParam}
            onPaired={handlePair}
            error={proctorError}
          />
        )}

        {status === 'setup' && (
          <CameraSetupPage
            stream={stream}
            loading={cameraLoading}
            error={cameraError}
            onRequestCamera={startCamera}
            onProceed={handleProceedToCalibration}
          />
        )}

        {status === 'calibrating' && (
          <CalibrationPage
            stream={stream}
            audioLevel={audioLevel}
            onStartExam={handleStartExam}
          />
        )}

        {status === 'active' && (
          <ActiveProctorPage
            stream={stream}
            heartbeatCount={heartbeatCount}
            speaking={speaking}
            onFinish={handleFinish}
          />
        )}

        {status === 'completed' && <CompletedPage />}
      </main>
    </div>
  );
};
