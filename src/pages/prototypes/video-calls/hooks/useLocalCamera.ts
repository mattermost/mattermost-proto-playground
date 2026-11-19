import { useCallback, useEffect, useState } from 'react';

export type MediaStreamStatus =
  'idle' | 'requesting' | 'active' | 'denied' | 'unavailable';

export interface MediaStreamState {
  stream: MediaStream | null;
  status: MediaStreamStatus;
  error?: string;
  retry: () => void;
}

export type UseLocalCameraResult = MediaStreamState;

interface RequestOptions {
  kind: 'video' | 'audio';
  enabled: boolean;
  deviceId?: string;
  disconnectedMessage: string;
}

function classifyError(err: unknown): {
  status: 'denied' | 'unavailable';
  error: string;
} {
  const name =
    err instanceof DOMException || err instanceof Error ? err.name : '';
  if (name === 'NotAllowedError' || name === 'SecurityError') {
    return { status: 'denied', error: 'Permission was denied' };
  }
  if (name === 'NotFoundError' || name === 'OverconstrainedError') {
    return { status: 'unavailable', error: 'No device found' };
  }
  return { status: 'unavailable', error: 'Could not start the device' };
}

/**
 * Shared opt-in getUserMedia lifecycle for camera and mic hooks. Nothing is
 * requested until `enabled`; tracks are always stopped on cleanup, and a
 * stream that resolves after cleanup (StrictMode, fast toggles) is discarded.
 */
export function useMediaStreamRequest({
  kind,
  enabled,
  deviceId,
  disconnectedMessage,
}: RequestOptions): MediaStreamState {
  const [state, setState] = useState<Omit<MediaStreamState, 'retry'>>({
    stream: null,
    status: 'idle',
  });
  const [attempt, setAttempt] = useState(0);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  useEffect(() => {
    if (!enabled) {
      setState((s) =>
        s.status === 'idle' && !s.stream ? s : { stream: null, status: 'idle' },
      );
      return;
    }
    const md =
      typeof navigator !== 'undefined' ? navigator.mediaDevices : undefined;
    if (!md || typeof md.getUserMedia !== 'function') {
      setState({
        stream: null,
        status: 'unavailable',
        error: 'Media devices are not supported',
      });
      return;
    }

    let cancelled = false;
    let acquired: MediaStream | null = null;
    const onEnded = () => {
      if (cancelled) return;
      acquired?.getTracks().forEach((t) => t.stop());
      acquired = null;
      setState({
        stream: null,
        status: 'unavailable',
        error: disconnectedMessage,
      });
    };

    setState({ stream: null, status: 'requesting' });
    const constraints: MediaStreamConstraints =
      kind === 'video'
        ? {
            video: deviceId ? { deviceId: { exact: deviceId } } : true,
            audio: false,
          }
        : {
            audio: deviceId ? { deviceId: { exact: deviceId } } : true,
            video: false,
          };

    md.getUserMedia(constraints)
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        acquired = stream;
        stream.getTracks().forEach((t) => t.addEventListener('ended', onEnded));
        setState({ stream, status: 'active' });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setState({ stream: null, ...classifyError(err) });
      });

    return () => {
      cancelled = true;
      if (acquired) {
        acquired.getTracks().forEach((t) => {
          t.removeEventListener('ended', onEnded);
          t.stop();
        });
      }
      acquired = null;
    };
  }, [enabled, deviceId, kind, attempt, disconnectedMessage]);

  return { ...state, retry };
}

/**
 * Opt-in webcam stream for self-view. Host sets `enabled` only after an explicit
 * "Use my camera" click so the browser never prompts unprompted.
 */
export function useLocalCamera({
  enabled,
  deviceId,
}: {
  enabled: boolean;
  deviceId?: string;
}): UseLocalCameraResult {
  return useMediaStreamRequest({
    kind: 'video',
    enabled,
    deviceId,
    disconnectedMessage: 'Camera disconnected',
  });
}
