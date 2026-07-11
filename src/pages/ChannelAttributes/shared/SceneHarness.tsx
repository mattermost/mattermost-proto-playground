import type { ReactNode } from 'react';
import { useState } from 'react';
import styles from './harness.module.scss';

/** Context passed to a scene's render fn — currently just the active marking style. */
export interface SceneRenderCtx {
  markingStyle: MarkingStyle;
}

export interface SceneDef {
  id: string;
  label: string;
  /** Grouping heading in the scene picker (playground chrome only). */
  group: string;
  /** Zero-arg callbacks still work; propagation scenes read `ctx.markingStyle`. */
  render: (ctx: SceneRenderCtx) => ReactNode;
}

/** Marking-style rendering forwarded to propagation scenes. */
export type MarkingStyle = 'abbrev' | 'full';

export interface SceneHarnessProps {
  title: string;
  scenes: SceneDef[];
  /** Optional deep-link query param to pre-select a scene by id. */
  initialSceneId?: string;
  /**
   * Whether to show the marking-style segmented control in the picker (playground
   * chrome only — it lives in the harness frame, never inside the product surface).
   * Off by default so existing harnesses (e.g. Primary) are unchanged.
   */
  showMarkingStyleToggle?: boolean;
}

/**
 * Playground scene-picker chrome (NOT product chrome). Lets a reviewer switch
 * between states. The rendered product surface stays clean — no BLUF, decision
 * IDs, phase tags, or [AI DRAFT] leak into the product canvas.
 */
export default function SceneHarness({
  title,
  scenes,
  initialSceneId,
  showMarkingStyleToggle = false,
}: SceneHarnessProps) {
  const url = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const paramScene = url?.get('scene') ?? initialSceneId;
  const startIdx = Math.max(
    0,
    scenes.findIndex((s) => s.id === paramScene),
  );
  const [active, setActive] = useState(startIdx === -1 ? 0 : startIdx);

  // Marking style is deep-linkable via ?style=abbrev|full; default is abbrev (the
  // recommended compact rendering that keeps channel names from being squeezed).
  const paramStyle = url?.get('style');
  const initialStyle: MarkingStyle = paramStyle === 'full' ? 'full' : 'abbrev';
  const [markingStyle, setMarkingStyle] = useState<MarkingStyle>(initialStyle);

  const setStyle = (next: MarkingStyle) => {
    setMarkingStyle(next);
    // Keep the URL in sync so a reviewer can copy a deep link to the exact state.
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      params.set('style', next);
      window.history.replaceState(null, '', `${window.location.pathname}?${params.toString()}`);
    }
  };

  const groups = Array.from(new Set(scenes.map((s) => s.group)));

  return (
    <div className={styles.harness}>
      <aside className={styles.harness__picker} aria-label="Scene picker">
        <div className={styles['harness__title']}>{title}</div>

        {showMarkingStyleToggle ? (
          <div className={styles['harness__group']}>
            <div className={styles['harness__group-title']}>Marking style</div>
            <div className={styles['harness__segmented']} role="group" aria-label="Marking style">
              {(['abbrev', 'full'] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  className={[
                    styles['harness__segment'],
                    markingStyle === s ? styles['harness__segment--active'] : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  aria-pressed={markingStyle === s}
                  onClick={() => setStyle(s)}
                >
                  {s === 'abbrev' ? 'Abbreviated' : 'Full'}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {groups.map((g) => (
          <div key={g} className={styles['harness__group']}>
            <div className={styles['harness__group-title']}>{g}</div>
            {scenes
              .map((s, i) => ({ s, i }))
              .filter(({ s }) => s.group === g)
              .map(({ s, i }) => (
                <button
                  key={s.id}
                  type="button"
                  className={[
                    styles['harness__scene-btn'],
                    i === active ? styles['harness__scene-btn--active'] : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => setActive(i)}
                >
                  {s.label}
                </button>
              ))}
          </div>
        ))}
      </aside>
      <div className={styles.harness__stage}>{scenes[active]?.render({ markingStyle })}</div>
    </div>
  );
}
