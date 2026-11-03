import { useCallback, useEffect, useRef, useState } from 'react';
import { DEFAULT_SHARE_SOURCE, type ShareSource } from './videoCallsData';
import type { VideoCallActions } from './useVideoCallState';

export interface ScreenShare {
  /** The live capture while you share for real, otherwise null (stand-in content). */
  stream: MediaStream | null;
  /** Stops an active share; otherwise asks the browser to pick what to share. */
  toggle: () => void;
}

/** Name a captured surface so the UI can say what you are sharing. */
function describeTrack(track: MediaStreamTrack): ShareSource {
  const { displaySurface } = track.getSettings() as MediaTrackSettings & {
    displaySurface?: 'monitor' | 'window' | 'browser';
  };
  const label = track.label || 'Shared screen';
  if (displaySurface === 'monitor') {
    return {
      kind: 'screen',
      label: 'Entire screen',
      what: 'your entire screen',
    };
  }
  if (displaySurface === 'browser') {
    return { kind: 'tab', label, what: `the ${label} tab` };
  }
  return { kind: 'window', label, what: label };
}

/**
 * One screen share for the whole prototype (widget and window both read it).
 * Starting is the user gesture that opens the browser's own source picker (a
 * page cannot list or preselect sources), so nothing is captured until the
 * person confirms there. The capture is released whenever the call stops
 * sharing (Stop, leaving, switching phase) and when the person ends it from the
 * browser's own "Stop sharing" bar. The walkthrough, and browsers without
 * screen capture, get the stand-in content instead of a prompt.
 */
export function useScreenShare(
  sharing: boolean,
  actions: VideoCallActions,
  walkthroughActive: boolean,
): ScreenShare {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const requesting = useRef(false);

  const release = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setStream(null);
  }, []);

  useEffect(() => {
    if (!sharing) release();
  }, [sharing, release]);
  useEffect(() => release, [release]);

  const start = useCallback(async () => {
    const supported = !!navigator.mediaDevices?.getDisplayMedia;
    if (walkthroughActive || !supported) {
      if (!walkthroughActive) {
        actions.pushNotice({
          kind: 'info',
          text: 'Screen capture is not available here. Showing a stand-in.',
        });
      }
      actions.startShare(DEFAULT_SHARE_SOURCE);
      return;
    }
    if (requesting.current) return;
    requesting.current = true;
    try {
      const next = await navigator.mediaDevices.getDisplayMedia({
        video: true,
      });
      const track = next.getVideoTracks()[0];
      streamRef.current = next;
      setStream(next);
      // Ended from the browser's own "Stop sharing" control.
      track.addEventListener('ended', () => actions.stopShare());
      actions.startShare(describeTrack(track));
    } catch (err) {
      const name = err instanceof Error ? err.name : '';
      // Closing the browser's picker is not an error.
      if (name !== 'NotAllowedError' && name !== 'AbortError') {
        actions.pushNotice({
          kind: 'device',
          text: 'Could not start screen sharing.',
        });
      }
    } finally {
      requesting.current = false;
    }
  }, [actions, walkthroughActive]);

  const toggle = useCallback(() => {
    if (sharing) actions.stopShare();
    else void start();
  }, [sharing, actions, start]);

  return { stream, toggle };
}
