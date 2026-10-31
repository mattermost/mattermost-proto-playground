import { useCallback, useEffect, useRef } from 'react';
import type { MediaPrefs } from '@/types/videoCall';
import { useLocalCamera } from './hooks/useLocalCamera';
import { useMediaDevices } from './hooks/useMediaDevices';
import type { VideoCallActions } from './useVideoCallState';

export interface SelfCamera {
  /** Live webcam stream, or null while off, requesting or unavailable. */
  stream: MediaStream | null;
  status: ReturnType<typeof useLocalCamera>['status'];
  /**
   * The camera button handler. Turning the camera ON is the user gesture that
   * opts into the real webcam (and triggers the browser prompt); turning it OFF
   * stops the track. In walkthrough mode it never requests the webcam.
   */
  toggle: () => void;
  retry: () => void;
}

/**
 * One self-camera for the whole prototype (pre-join, widget and window share
 * it), hoisted into context so switching surfaces does not restart it.
 * Opt-in only: nothing is requested until the user turns the camera on.
 */
export function useSelfCamera(
  media: MediaPrefs,
  actions: VideoCallActions,
  walkthroughActive: boolean,
): SelfCamera {
  const devices = useMediaDevices({ enabled: media.useWebcam });
  const realCameraId = devices.cameras.some(
    (c) => c.deviceId === media.cameraDeviceId,
  )
    ? media.cameraDeviceId
    : undefined;

  const camera = useLocalCamera({
    enabled: media.useWebcam && media.cameraOn,
    deviceId: realCameraId,
  });

  // A blocked or missing camera flips the control back off with an explanation.
  const lastStatus = useRef(camera.status);
  useEffect(() => {
    if (lastStatus.current === camera.status) return;
    lastStatus.current = camera.status;
    if (camera.status === 'denied') {
      actions.setMedia({ cameraOn: false });
      actions.pushNotice({
        kind: 'permission',
        text: 'Camera access was blocked. Allow it in your browser settings.',
      });
    } else if (camera.status === 'unavailable') {
      actions.setMedia({ cameraOn: false });
      actions.pushNotice({
        kind: 'device',
        text: camera.error ?? 'Your camera is unavailable.',
      });
    }
  }, [camera.status, camera.error, actions]);

  const toggle = useCallback(() => {
    if (media.cameraOn) {
      actions.setMedia({ cameraOn: false });
    } else {
      actions.setMedia({ cameraOn: true, useWebcam: !walkthroughActive });
    }
  }, [media.cameraOn, actions, walkthroughActive]);

  return {
    stream: camera.stream,
    status: camera.status,
    toggle,
    retry: camera.retry,
  };
}
