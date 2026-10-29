import { createContext, useContext } from 'react';
import type { VideoParticipant } from '@/types/videoCall';
import type { VideoCallActions, VideoCallState } from './useVideoCallState';

export interface VideoCallContextValue {
  state: VideoCallState;
  /** Current roster slice with overrides + self media applied. */
  participants: VideoParticipant[];
  actions: VideoCallActions;
}

export const VideoCallContext = createContext<VideoCallContextValue | null>(
  null,
);

/** Scenes and components read call state and dispatch actions through this. */
export function useVideoCall(): VideoCallContextValue {
  const ctx = useContext(VideoCallContext);
  if (!ctx) {
    throw new Error(
      'useVideoCall must be used within the VideoCalls prototype',
    );
  }
  return ctx;
}
