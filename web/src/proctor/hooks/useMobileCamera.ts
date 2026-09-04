import { useState, useCallback } from 'react';

export function useMobileCamera() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const startCamera = useCallback(async (facingMode: 'environment' | 'user' = 'environment') => {
    setLoading(true);
    setError(null);
    try {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 640 },
          height: { ideal: 480 },
          frameRate: { max: 15 },
        },
        audio: true,
      });
      setStream(mediaStream);
      return mediaStream;
    } catch (err: any) {
      console.error('Camera access error:', err);
      // Fallback without audio if mic failed
      try {
        const videoOnlyStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: facingMode } },
          audio: false,
        });
        setStream(videoOnlyStream);
        return videoOnlyStream;
      } catch (fallbackErr: any) {
        const msg = fallbackErr.message || 'Failed to access camera. Please allow permissions.';
        setError(msg);
        throw fallbackErr;
      }
    } finally {
      setLoading(false);
    }
  }, [stream]);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      setStream(null);
    }
  }, [stream]);

  return { stream, error, loading, startCamera, stopCamera };
}