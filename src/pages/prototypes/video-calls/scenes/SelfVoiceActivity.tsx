import { useEffect, useRef } from 'react';
import { useMicStream } from '../hooks/useMicLevel';
import { useVoiceActivity } from '../hooks/useVoiceActivity';
import { useVideoCall } from '../videoCallContext';

export interface SelfVoiceActivityProps {
  /** The walkthrough never asks for the microphone. */
  walkthroughActive: boolean;
}

/**
 * Listens to your microphone while you are in a call and unmuted, and marks
 * you as speaking so your tile gets the same active-speaker border as everyone
 * else's. The browser asks for the microphone when the call goes live (starting
 * or joining is the user gesture). Muting stops the stream. Renders nothing.
 */
export default function SelfVoiceActivity({
  walkthroughActive,
}: SelfVoiceActivityProps) {
  const { state, actions } = useVideoCall();
  const enabled =
    !walkthroughActive && state.phase === 'active' && state.media.micOn;
  const id = state.media.micDeviceId;
  const mic = useMicStream({
    enabled,
    deviceId: id && !id.startsWith('fallback') ? id : undefined,
  });

  useVoiceActivity({
    stream: mic.stream,
    enabled: enabled && mic.status === 'active',
    onChange: actions.setSelfSpeaking,
  });

  // A blocked or missing microphone gets a notice; there is just no highlight.
  const lastStatus = useRef(mic.status);
  useEffect(() => {
    if (lastStatus.current === mic.status) return;
    lastStatus.current = mic.status;
    if (mic.status === 'denied') {
      actions.pushNotice({
        kind: 'permission',
        text: 'Microphone access was blocked. Allow it in your browser settings.',
      });
    } else if (mic.status === 'unavailable') {
      actions.pushNotice({
        kind: 'device',
        text: mic.error ?? 'Your microphone is unavailable.',
      });
    }
  }, [mic.status, mic.error, actions]);

  return null;
}
