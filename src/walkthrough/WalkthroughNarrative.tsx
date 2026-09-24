import ChevronLeftIcon from '@mattermost/compass-icons/components/chevron-left';
import ChevronRightIcon from '@mattermost/compass-icons/components/chevron-right';
import FormatListBulletedIcon from '@mattermost/compass-icons/components/format-list-bulleted';
import { Button } from '@mattermost/compass-ui/components/button';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { Scrollbar } from '@mattermost/compass-ui/components/scrollbar';
import type { WalkthroughDocument, WalkthroughStep } from '@/walkthrough/types';
import { useWalkthrough } from '@/walkthrough/useWalkthrough';
import styles from './WalkthroughNarrative.module.scss';

type WalkthroughNarrativeProps = {
  document: WalkthroughDocument;
  step: WalkthroughStep;
  stepIndex: number;
  onBack: () => void;
  onNext: () => void;
  onExit: () => void;
};

function sectionLabel(doc: WalkthroughDocument, step: WalkthroughStep): string {
  if (step.railGroup) return step.railGroup;
  return doc.sections.find((s) => s.id === step.section)?.label ?? step.section;
}

export default function WalkthroughNarrative({
  document,
  step,
  stepIndex,
  onBack,
  onNext,
  onExit,
}: WalkthroughNarrativeProps) {
  const { jumpOpen, setJumpOpen } = useWalkthrough();
  const isFirst = stepIndex <= 0;
  const isLast = stepIndex >= document.steps.length - 1;
  const lookFor = step.lookFor ?? [];
  const bullets = step.bullets ?? [];

  return (
    <aside className={styles['wt-narrative']} aria-label="Walkthrough step">
      <div className={styles['wt-narrative__toolbar']}>
        <Button
          emphasis="tertiary"
          size="small"
          leadingIcon={<Icon glyph={<FormatListBulletedIcon />} />}
          onClick={() => setJumpOpen(!jumpOpen)}
          aria-pressed={jumpOpen}
        >
          Jump to
        </Button>
        <span className={styles['wt-narrative__progress']}>
          Step {stepIndex + 1} of {document.steps.length}
        </span>
      </div>

      <div className={styles['wt-narrative__body']}>
        <Scrollbar className={styles['wt-narrative__scroll']}>
          <p className={styles['wt-narrative__tag']}>{sectionLabel(document, step)}</p>
          <h2 className={styles['wt-narrative__title']}>{step.title}</h2>
          {step.lead != null && (
            <p className={styles['wt-narrative__lead']}>{step.lead}</p>
          )}
          {lookFor.length > 0 && (
            <div className={styles['wt-narrative__look-for']}>
              <p className={styles['wt-narrative__look-for-label']}>On screen</p>
              <ul className={styles['wt-narrative__look-for-list']}>
                {lookFor.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          )}
          {bullets.length > 0 && (
            <ul className={styles['wt-narrative__bullets']}>
              {bullets.map((bullet) =>
                typeof bullet === 'string' ? (
                  <li key={bullet}>{bullet}</li>
                ) : (
                  <li key={bullet.text}>
                    {bullet.text}
                    {bullet.sub != null && bullet.sub.length > 0 && (
                      <ul className={styles['wt-narrative__sub-bullets']}>
                        {bullet.sub.map((sub) => (
                          <li key={sub}>{sub}</li>
                        ))}
                      </ul>
                    )}
                  </li>
                ),
              )}
            </ul>
          )}
          {step.callout != null && (
            <p className={styles['wt-narrative__callout']}>{step.callout}</p>
          )}
        </Scrollbar>
      </div>

      <div className={styles['wt-narrative__footer']}>
        <Button emphasis="tertiary" size="small" onClick={onExit}>
          Exit
        </Button>
        <div className={styles['wt-narrative__stepper']}>
          <Button
            emphasis="tertiary"
            size="small"
            disabled={isFirst}
            onClick={onBack}
            leadingIcon={<Icon glyph={<ChevronLeftIcon />} />}
          >
            Back
          </Button>
          <Button
            emphasis="primary"
            size="small"
            disabled={isLast}
            onClick={onNext}
            trailingIcon={<Icon glyph={<ChevronRightIcon />} />}
          >
            Next
          </Button>
        </div>
      </div>
    </aside>
  );
}
