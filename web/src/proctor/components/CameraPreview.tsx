import React, { useRef, useEffect, useState } from 'react';
import styles from '../styles/MobileProctor.module.css';

interface Props {
  stream: MediaStream | null;
  mirrored?: boolean;
  showHud?: boolean;
  onVideoElement?: (el: HTMLVideoElement | null) => void;
  children?: React.ReactNode;
}

export const CameraPreview: React.FC<Props> = ({
  stream,
  mirrored = false,
  showHud = true,
  onVideoElement,
  children,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [resolution, setResolution] = useState('640×480');

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      if (onVideoElement) {
        onVideoElement(videoRef.current);
      }

      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        const settings = videoTrack.getSettings();
        if (settings.width && settings.height) {
          setResolution(`${settings.width}×${settings.height}`);
        }
      }
    }
  }, [stream, onVideoElement]);

  return (
    <div className={styles.videoWrapper}>
      {showHud && (
        <div className={styles.hudTopBar}>
          <div className={styles.recBadge}>
            <span className={styles.recDot} />
            <span>LIVE FEED</span>
          </div>
          <div className={styles.hudResolution}>{resolution} • 15 FPS</div>
        </div>
      )}

      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`${styles.videoStream} ${mirrored ? styles.videoStreamMirrored : ''}`}
      />
      {children}
    </div>
  );
};
