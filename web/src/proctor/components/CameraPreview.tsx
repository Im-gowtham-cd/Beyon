import React, { useRef, useEffect } from 'react';
import styles from '../styles/MobileProctor.module.css';

interface Props {
  stream: MediaStream | null;
  children?: React.ReactNode;
}

export const CameraPreview: React.FC<Props> = ({ stream, children }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className={styles.videoWrapper}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={styles.videoStream}
      />
      {children}
    </div>
  );
};