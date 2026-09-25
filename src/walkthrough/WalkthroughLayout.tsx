import { useEffect, useRef, useState } from 'react';
import { useExitAnimation } from '@/hooks/useExitAnimation';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useWalkthrough } from '@/walkthrough/useWalkthrough';
import WalkthroughFocusLayer from '@/walkthrough/WalkthroughFocusLayer';
import WalkthroughJumpList from '@/walkthrough/WalkthroughJumpList';
import WalkthroughNarrative from '@/walkthrough/WalkthroughNarrative';
import type { WalkthroughDocument, WalkthroughStep } from '@/walkthrough/types';
import styles from './WalkthroughLayout.module.scss';

/** Match `--duration-moderate` used by the narrative / jump width transition. */
const NARRATIVE_EXIT_MS = 300;

/** Dock Jump to as a left panel when the viewport is 1920px or wider. */
const JUMP_DOCK_QUERY = '(min-width: 1920px)';

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
    goToStep,
    exit,
  } = useWalkthrough();
  const stageRef = useRef<HTMLDivElement>(null);
  const snapshotRef = useRef<ShellSnapshot | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [jumpOpen, setJumpOpen] = useState(false);
  const [jumpEntered, setJumpEntered] = useState(false);
  const jumpDocked = useMediaQuery(JUMP_DOCK_QUERY);

  const shellOpen = Boolean(active && document && step);
  if (shellOpen && document && step) {
    snapshotRef.current = { document, step, stepIndex };
  }

  const { rendered, exiting } = useExitAnimation(shellOpen, NARRATIVE_EXIT_MS);
  const snapshot = snapshotRef.current;

  const jumpPanelOpen = Boolean(jumpDocked && jumpOpen && rendered && !exiting);
  const { rendered: jumpPanelRendered, exiting: jumpPanelExiting } =
    useExitAnimation(jumpPanelOpen, NARRATIVE_EXIT_MS);

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

  // Wide screens: open Jump to by default when entering walkthrough / crossing the breakpoint.
  useEffect(() => {
    if (shellOpen && jumpDocked) setJumpOpen(true);
    if (!shellOpen) setJumpOpen(false);
  }, [shellOpen, jumpDocked]);

  useEffect(() => {
    if (!jumpDocked || !jumpOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setJumpOpen(false);
    };
    window.document.addEventListener('keydown', onKey);
    return () => window.document.removeEventListener('keydown', onKey);
  }, [jumpDocked, jumpOpen]);

  // Jump panel enter: double-rAF so the exit styles paint before --entered.
  useEffect(() => {
    if (!jumpPanelRendered || jumpPanelExiting) {
      setJumpEntered(false);
      return;
    }
    const id = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => setJumpEntered(true));
    });
    return () => window.cancelAnimationFrame(id);
  }, [jumpPanelRendered, jumpPanelExiting]);

  const showNarrative = Boolean(rendered && snapshot);
  // Drive column width from jumpOpen immediately so width + fade run together.
  const withJump = Boolean(jumpDocked && jumpOpen && expanded);
  const jumpVisible = jumpEntered && !jumpPanelExiting;

  return (
    <div className={styles['wt']}>
      <div className={styles['wt__main']}>
        <div
          className={[
            styles['wt__narrative-slot'],
            expanded ? styles['wt__narrative-slot--expanded'] : '',
            withJump ? styles['wt__narrative-slot--with-jump'] : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          <div className={styles['wt__narrative-clip']}>
            {showNarrative && snapshot && jumpPanelRendered && (
              <div
                className={[
                  styles['wt__jump-slot'],
                  jumpVisible ? styles['wt__jump-slot--entered'] : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                <WalkthroughJumpList
                  variant="panel"
                  document={snapshot.document}
                  activeStepId={snapshot.step.id}
                  onSelect={goToStep}
                />
              </div>
            )}
            {showNarrative && snapshot && (
              <WalkthroughNarrative
                document={snapshot.document}
                step={snapshot.step}
                stepIndex={snapshot.stepIndex}
                onBack={goBack}
                onNext={goNext}
                onExit={exit}
                jumpDocked={jumpDocked}
                jumpOpen={jumpOpen}
                onJumpOpenChange={setJumpOpen}
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
