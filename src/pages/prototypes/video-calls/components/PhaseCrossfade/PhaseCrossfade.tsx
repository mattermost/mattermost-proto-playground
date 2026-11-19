import { useEffect, useRef, useState, type ReactNode } from 'react';
import styles from './PhaseCrossfade.module.scss';

const FADE_MS = 200;

interface Held {
  key: string;
  node: ReactNode;
}

export interface PhaseCrossfadeProps {
  /** Identity of the current phase; a change triggers the crossfade. */
  phaseKey: string;
  children: ReactNode;
  /** `end` bottom-anchors layers of different heights (widget); `fill` stretches them (window). */
  align?: 'end' | 'fill';
}

/**
 * Crossfades between call phases (pre-join, calling, active). The outgoing
 * phase stays mounted for the fade, stacked under the incoming one in a single
 * grid cell, so the surface never jumps between states.
 */
export default function PhaseCrossfade({
  phaseKey,
  children,
  align = 'end',
}: PhaseCrossfadeProps) {
  const latest = useRef<Held>({ key: phaseKey, node: children });
  const [leaving, setLeaving] = useState<Held | null>(null);
  const [shownKey, setShownKey] = useState(phaseKey);

  if (shownKey !== phaseKey) {
    setShownKey(phaseKey);
    setLeaving(latest.current);
  }

  useEffect(() => {
    latest.current = { key: phaseKey, node: children };
  });

  useEffect(() => {
    if (!leaving) return;
    const t = window.setTimeout(() => setLeaving(null), FADE_MS);
    return () => window.clearTimeout(t);
  }, [leaving]);

  return (
    <div
      className={[
        styles['phase-crossfade'],
        align === 'fill' && styles['phase-crossfade--fill'],
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {leaving && (
        <div
          key={`out-${leaving.key}`}
          className={`${styles['phase-crossfade__layer']} ${styles['phase-crossfade__layer--out']}`}
          aria-hidden="true"
          inert
        >
          {leaving.node}
        </div>
      )}
      <div
        key={`in-${phaseKey}`}
        className={[
          styles['phase-crossfade__layer'],
          leaving && styles['phase-crossfade__layer--in'],
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {children}
      </div>
    </div>
  );
}
