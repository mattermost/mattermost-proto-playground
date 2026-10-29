import { useEffect, useMemo, useRef } from 'react';
import type { StageView, VideoParticipant } from '@/types/videoCall';
import {
  computeStageLayout,
  type StageLayout,
} from '../layout/computeStageLayout';

export interface UseStageLayoutOptions {
  /** Grid cells incl. self and the overflow chip. Default 9. */
  maxVisible?: number;
  /** Share filmstrip cells incl. the overflow chip. Default 6. */
  maxFilmstrip?: number;
}

/**
 * Memoized stage layout. Derives the active speaker from `talking` (first
 * talking non-self participant, else the previous speaker, so silence never
 * reshuffles tiles) and feeds the previous layout back in for sticky ordering.
 */
export function useStageLayout(
  participants: VideoParticipant[],
  view: StageView,
  sharing: boolean,
  options: UseStageLayoutOptions = {},
): StageLayout {
  const { maxVisible, maxFilmstrip } = options;
  const prevSpeakerRef = useRef<string | undefined>(undefined);
  const prevLayoutRef = useRef<StageLayout | null>(null);

  const talkingId = participants.find((p) => p.talking && !p.self)?.id;
  const prevSpeaker = prevSpeakerRef.current;
  const activeSpeakerId =
    talkingId ??
    (prevSpeaker && participants.some((p) => p.id === prevSpeaker)
      ? prevSpeaker
      : undefined);

  // Only the fields the layout reads, so unrelated changes (muted, reactions)
  // keep the memo hit.
  const shapeKey = participants
    .map((p) => `${p.id}:${p.self ? 1 : 0}${p.sharing ? 1 : 0}`)
    .join('|');

  const layout = useMemo(
    () =>
      computeStageLayout({
        participants,
        view,
        sharing,
        activeSpeakerId,
        maxVisible,
        maxFilmstrip,
        previous: prevLayoutRef.current,
      }),
    // `participants` is intentionally represented by `shapeKey`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [shapeKey, view, sharing, activeSpeakerId, maxVisible, maxFilmstrip],
  );

  useEffect(() => {
    prevLayoutRef.current = layout;
    prevSpeakerRef.current = activeSpeakerId;
  }, [layout, activeSpeakerId]);

  return layout;
}
