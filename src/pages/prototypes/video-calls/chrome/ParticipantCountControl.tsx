import { Icon } from '@mattermost/compass-ui/components/icon';
import { IconButton } from '@mattermost/compass-ui/components/icon-button';
import MinusIcon from '@mattermost/compass-icons/components/minus';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import { MAX_PARTICIPANTS } from '@/types/videoCall';
import styles from './ParticipantCountControl.module.scss';

const MIN_PARTICIPANTS = 2;

export interface ParticipantCountControlProps {
  count: number;
  onChange: (count: number) => void;
  /** DMs are always 1:1, so the control is fixed there. */
  disabled?: boolean;
}

/**
 * Prototype chrome (not product UI): sets how many people are in a GM or
 * channel call so every stage layout from 2 to 10 can be reviewed.
 */
export default function ParticipantCountControl({
  count,
  onChange,
  disabled = false,
}: ParticipantCountControlProps) {
  return (
    <div
      className={styles['participant-count']}
      role="group"
      aria-label="Participants in call"
    >
      <span className={styles['participant-count__label']}>People</span>
      <IconButton
        size="x-small"
        aria-label="Fewer participants"
        icon={<Icon size="12" glyph={<MinusIcon />} />}
        disabled={disabled || count <= MIN_PARTICIPANTS}
        onClick={() => onChange(count - 1)}
      />
      <output
        className={styles['participant-count__value']}
        aria-live="polite"
        aria-label={`${count} participants`}
      >
        {count}
      </output>
      <IconButton
        size="x-small"
        aria-label="More participants"
        icon={<Icon size="12" glyph={<PlusIcon />} />}
        disabled={disabled || count >= MAX_PARTICIPANTS}
        onClick={() => onChange(count + 1)}
      />
    </div>
  );
}
