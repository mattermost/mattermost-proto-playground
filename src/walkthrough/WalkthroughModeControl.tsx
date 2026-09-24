import FormatListBulletedIcon from '@mattermost/compass-icons/components/format-list-bulleted';
import { Button } from '@mattermost/compass-ui/components/button';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { useWalkthrough } from '@/walkthrough/useWalkthrough';
import styles from './WalkthroughModeControl.module.scss';

/** Slim playground chrome for walkthrough mode — enter/exit, progress, jump. */
export default function WalkthroughModeControl() {
  const {
    document,
    active,
    stepIndex,
    jumpOpen,
    setJumpOpen,
    enter,
    exit,
  } = useWalkthrough();

  if (!document) return null;

  if (!active) {
    return (
      <Button emphasis="tertiary" size="small" onClick={enter}>
        Walkthrough
      </Button>
    );
  }

  return (
    <div className={styles['wt-chrome']}>
      <span className={styles['wt-chrome__progress']}>
        Step {stepIndex + 1} of {document.steps.length}
      </span>
      <Button
        emphasis="tertiary"
        size="small"
        leadingIcon={<Icon glyph={<FormatListBulletedIcon />} />}
        onClick={() => setJumpOpen(!jumpOpen)}
        aria-pressed={jumpOpen}
      >
        Jump to
      </Button>
      <Button emphasis="secondary" size="small" onClick={exit}>
        Exit
      </Button>
    </div>
  );
}
