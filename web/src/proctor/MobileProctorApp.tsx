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

export const MobileProctorApp: React.FC = () => {
  const [tokenParam, setTokenParam] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get('token');
    if (t) setTokenParam(t);
  }, []);

  const {
    procSessionId,
    status,
    setStatus,
    error: proctorError,
    heartbeatCount,
    pairWithToken,
    startMonitoring,
    stopMonitoring,
  } = useMobileProctor(tokenParam);

  const { stream, error: cameraError, loading: cameraLoading, startCamera, stopCamera } = useMobileCamera();
  const { audioLevel, speaking } = useMobileAudio(stream);

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

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.brand}>
          <span className={styles.brandDot} />
          <span className={styles.brandTitle}>Beyon DualView</span>
        </div>
        <span className={styles.brandBadge}>Side Angle Feed</span>
      </header>

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
