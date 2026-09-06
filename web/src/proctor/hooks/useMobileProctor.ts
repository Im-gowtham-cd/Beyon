import { useState, useEffect, useRef, useCallback } from 'react';

const API_BASE = '/api/v1';

export interface MobileProctorState {
  procSessionId: string | null;
  status: 'pairing' | 'setup' | 'calibrating' | 'active' | 'completed' | 'error';
  paired: boolean;
  error: string | null;
  heartbeatSent: number;
}

export function useMobileProctor(_initialToken?: string | null) {
  const [procSessionId, setProcSessionId] = useState<string | null>(null);
  const [status, setStatus] = useState<MobileProctorState['status']>('pairing');
  const [error, setError] = useState<string | null>(null);
  const [heartbeatCount, setHeartbeatCount] = useState(0);

  const heartbeatIntervalRef = useRef<any>(null);
  const frameUploadIntervalRef = useRef<any>(null);

  const pairWithToken = useCallback(async (token: string) => {
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/proctoring/dualview/pair`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: token.trim(),
          fingerprint: navigator.userAgent,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Failed to pair device');
      }

      const data = await res.json();
      setProcSessionId(data.procSessionId);
      setStatus('setup');
      return data.procSessionId;
    } catch (err: any) {
      console.error('Pairing error:', err);
      setError(err.message || 'Invalid or expired pairing token');
      throw err;
    }
  }, []);

  const sendHeartbeat = useCallback(async (sessionId: string, cameraActive: boolean, micActive: boolean) => {
    try {
      await fetch(`${API_BASE}/proctoring/dualview/${sessionId}/heartbeat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceType: 'MOBILE',
          cameraActive,
          micActive,
        }),
      });
      setHeartbeatCount((c) => c + 1);
    } catch (e) {
      console.warn('Mobile heartbeat error:', e);
    }
  }, []);

  const captureAndSendFrame = useCallback(async (sessionId: string, videoElement: HTMLVideoElement) => {
    if (!videoElement || videoElement.videoWidth === 0) return;
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 480;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(videoElement, 0, 0, 640, 480);

      const base64Data = canvas.toDataURL('image/jpeg', 0.82);
      await fetch(`${API_BASE}/proctoring/dualview/${sessionId}/mobile-frame`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          frameData: base64Data,
          timestamp: Date.now(),
        }),
      });
    } catch (e) {

    }
  }, []);

  const startMonitoring = useCallback((sessionId: string, videoElement: HTMLVideoElement | null) => {
    setStatus('active');

    if (heartbeatIntervalRef.current) clearInterval(heartbeatIntervalRef.current);
    heartbeatIntervalRef.current = setInterval(() => {
      sendHeartbeat(sessionId, true, true);
    }, 5000);

    sendHeartbeat(sessionId, true, true);

    if (frameUploadIntervalRef.current) clearInterval(frameUploadIntervalRef.current);
    if (videoElement) {
      frameUploadIntervalRef.current = setInterval(() => {
        captureAndSendFrame(sessionId, videoElement);
      }, 1500);
    }
  }, [sendHeartbeat, captureAndSendFrame]);

  const stopMonitoring = useCallback(() => {
    if (heartbeatIntervalRef.current) clearInterval(heartbeatIntervalRef.current);
    if (frameUploadIntervalRef.current) clearInterval(frameUploadIntervalRef.current);
    if (procSessionId) {
      fetch(`${API_BASE}/proctoring/dualview/${procSessionId}/mobile-disconnect`, {
        method: 'POST',
      }).catch(() => {});
    }
  }, [procSessionId]);

  useEffect(() => {
    return () => {
      stopMonitoring();
    };
  }, [stopMonitoring]);

  return {
    procSessionId,
    status,
    setStatus,
    error,
    heartbeatCount,
    pairWithToken,
    sendHeartbeat,
    startMonitoring,
    stopMonitoring,
  };
}

