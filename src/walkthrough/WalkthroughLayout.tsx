import { useRef } from 'react';
import CloseIcon from '@mattermost/compass-icons/components/close';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { IconButton } from '@mattermost/compass-ui/components/icon-button';
import { useWalkthrough } from '@/walkthrough/useWalkthrough';
import WalkthroughFocusLayer from '@/walkthrough/WalkthroughFocusLayer';
import WalkthroughJumpList from '@/walkthrough/WalkthroughJumpList';
import WalkthroughNarrative from '@/walkthrough/WalkthroughNarrative';
import styles from './WalkthroughLayout.module.scss';

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

  if (!active || !document || !step) {
    return <>{children}</>;
  }

  return (
    <div className={styles['wt']}>
      {jumpOpen && (
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
              document={document}
              activeStepId={step.id}
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
        <div className={styles['wt__narrative-slot']}>
          <WalkthroughNarrative
            document={document}
            step={step}
            stepIndex={stepIndex}
            onBack={goBack}
            onNext={goNext}
            onExit={exit}
          />
        </div>

        <div className={styles['wt__stage']} ref={stageRef}>
          {children}
          <WalkthroughFocusLayer focus={step.focus ?? null} stageRef={stageRef} />
        </div>
      </div>
    </div>
  );
}
