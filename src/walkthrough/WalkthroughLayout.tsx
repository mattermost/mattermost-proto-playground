import { useEffect, useRef, useState } from 'react';
import CloseIcon from '@mattermost/compass-icons/components/close';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { IconButton } from '@mattermost/compass-ui/components/icon-button';
import { useExitAnimation } from '@/hooks/useExitAnimation';
import { useWalkthrough } from '@/walkthrough/useWalkthrough';
import WalkthroughFocusLayer from '@/walkthrough/WalkthroughFocusLayer';
import WalkthroughJumpList from '@/walkthrough/WalkthroughJumpList';
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
    jumpOpen,
    setJumpOpen,
    goToStep,
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

  if (!rendered || !snapshot) {
    return <>{children}</>;
  }

  const { document: doc, step: currentStep, stepIndex: currentIndex } = snapshot;

  return (
    <div className={styles['wt']}>
      {!exiting && jumpOpen && (
        <div className={styles['wt__jump-layer']}>
          <div className={styles['wt__jump-panel']}>
            <div className={styles['wt__jump-panel-head']}>
              <IconButton
                size="small"
                aria-label="Close jump list"
                icon={<Icon glyph={<CloseIcon />} />}
                onClick={() => setJumpOpen(false)}
              />
            </div>
            <WalkthroughJumpList
              document={doc}
              activeStepId={currentStep.id}
              onSelect={(id) => {
                goToStep(id);
                setJumpOpen(false);
              }}
            />
          </div>
          <button
            type="button"
            className={styles['wt__jump-backdrop']}
            aria-label="Close jump list"
            onClick={() => setJumpOpen(false)}
          />
        </div>
      )}

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
            <WalkthroughNarrative
              document={doc}
              step={currentStep}
              stepIndex={currentIndex}
              onBack={goBack}
              onNext={goNext}
              onExit={exit}
            />
          </div>
        </div>

        <div className={styles['wt__stage']} ref={stageRef}>
          <div className={styles['wt__stage-scroll']}>{children}</div>
          {expanded && !exiting && (
            <WalkthroughFocusLayer
              focus={currentStep.focus ?? null}
              stageRef={stageRef}
            />
          )}
        </div>
      </div>
    </div>
  );
}
