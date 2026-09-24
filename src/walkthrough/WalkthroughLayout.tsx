import { useEffect, useRef, useState } from 'react';
import { useExitAnimation } from '@/hooks/useExitAnimation';
import { useWalkthrough } from '@/walkthrough/useWalkthrough';
import WalkthroughFocusLayer from '@/walkthrough/WalkthroughFocusLayer';
import WalkthroughNarrative from '@/walkthrough/WalkthroughNarrative';
import type { WalkthroughDocument, WalkthroughStep } from '@/walkthrough/types';
import styles from './WalkthroughLayout.module.scss';

/** Match `--duration-moderate` used by the narrative width transition. */
const NARRATIVE_EXIT_MS = 300;

type ShellSnapshot = {
  document: WalkthroughDocument;
  step: WalkthroughStep;
  stepIndex: number;
};

export default function WalkthroughLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const {
    document,
    active,
    step,
    stepIndex,
    goNext,
    goBack,
    exit,
  } = useWalkthrough();
  const stageRef = useRef<HTMLDivElement>(null);
  const snapshotRef = useRef<ShellSnapshot | null>(null);
  const [expanded, setExpanded] = useState(false);

  const shellOpen = Boolean(active && document && step);
  if (shellOpen && document && step) {
    snapshotRef.current = { document, step, stepIndex };
  }

  const { rendered, exiting } = useExitAnimation(shellOpen, NARRATIVE_EXIT_MS);
  const snapshot = snapshotRef.current;

  // Drive width open/close so the stage flexes with the narrative column.
  useEffect(() => {
    if (!rendered || exiting) {
      setExpanded(false);
      return;
    }
    const id = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => setExpanded(true));
    });
    return () => window.cancelAnimationFrame(id);
  }, [rendered, exiting]);

  const showNarrative = Boolean(rendered && snapshot);

  return (
    <div className={styles['wt']}>
      <div className={styles['wt__main']}>
        <div
          className={[
            styles['wt__narrative-slot'],
            expanded ? styles['wt__narrative-slot--expanded'] : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          <div className={styles['wt__narrative-clip']}>
            {showNarrative && snapshot && (
              <WalkthroughNarrative
                document={snapshot.document}
                step={snapshot.step}
                stepIndex={snapshot.stepIndex}
                onBack={goBack}
                onNext={goNext}
                onExit={exit}
              />
            )}
          </div>
        </div>

        <div className={styles['wt__stage']} ref={stageRef}>
          <div className={styles['wt__stage-scroll']}>{children}</div>
          {expanded && !exiting && snapshot && (
            <WalkthroughFocusLayer
              focus={snapshot.step.focus ?? null}
              stageRef={stageRef}
            />
          )}
        </div>
      </div>
    </div>
  );
}
