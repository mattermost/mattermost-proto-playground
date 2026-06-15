import CreationOutlineIcon from '@mattermost/compass-icons/components/creation-outline';
import CloseIcon from '@mattermost/compass-icons/components/close';
import Button from '@/components/ui/Button/Button';
import Icon from '@/components/ui/Icon/Icon';
import IconButton from '@/components/ui/IconButton/IconButton';
import styles from './AutomationNudge.module.scss';

export interface AutomationNudgeProps {
  onCreate: () => void;
  onDismiss: () => void;
}

/**
 * Alternate entry point: a lightweight in-stream suggestion card prompting the
 * user to automate routine updates with Agents.
 */
export default function AutomationNudge({
  onCreate,
  onDismiss,
}: AutomationNudgeProps) {
  return (
    <div className={styles['nudge']} role="note">
      <span className={styles['nudge__icon']}>
        <Icon size="20" glyph={<CreationOutlineIcon />} />
      </span>
      <div className={styles['nudge__body']}>
        <p className={styles['nudge__title']}>
          Automate routine updates in this channel
        </p>
        <p className={styles['nudge__text']}>
          Agents can post recurring reminders, weekly recaps, and auto-replies —
          just describe what you need.
        </p>
        <div className={styles['nudge__actions']}>
          <Button
            size="Small"
            emphasis="Tertiary"
            leadingIcon={<Icon size="16" glyph={<CreationOutlineIcon />} />}
            onClick={onCreate}
          >
            Create an automation
          </Button>
        </div>
      </div>
      <IconButton
        className={styles['nudge__close']}
        size="Small"
        aria-label="Dismiss suggestion"
        icon={<Icon size="16" glyph={<CloseIcon />} />}
        onClick={onDismiss}
      />
    </div>
  );
}
