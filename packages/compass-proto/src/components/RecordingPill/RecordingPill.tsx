import type { HTMLAttributes } from 'react';
import { Spinner } from '@mattermost/compass-ui';
import { Icon } from '@mattermost/compass-ui';
import RecordCircleOutlineIcon from '@mattermost/compass-icons/components/record-circle-outline';
import RecordSquareOutlineIcon from '@mattermost/compass-icons/components/record-square-outline';
import styles from './RecordingPill.module.scss';

export type RecordingPillState = 'Initializing' | 'Recording' | 'Hover';

export interface RecordingPillProps extends HTMLAttributes<HTMLDivElement> {
  /** Current recording state. Default: Initializing. */
  state?: RecordingPillState;
  /** Called when the pill is clicked (stop recording). */
  onStop?: () => void;
  /** Optional CSS class name. */
  className?: string;
}

/**
 * Active recording indicator pill shown during calls.
 * Displays 'REC' text with a spinner (initializing), record icon (recording),
 * or stop icon with tooltip (hover/click-to-stop).
 */
export default function RecordingPill({
  state = 'Initializing',
  onStop,
  className = '',
  ...rest
}: RecordingPillProps) {
  const rootClass = [
    styles['recording-pill'],
    styles[`recording-pill--${state.toLowerCase()}`],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={rootClass} {...rest}>
      <button
        type="button"
        className={styles['recording-pill__button']}
        onClick={onStop}
        aria-label={
          state === 'Hover' ? 'Stop recording' : 'Recording in progress'
        }
      >
        <span className={styles['recording-pill__icon']} aria-hidden>
          {state === 'Initializing' && (
            <Spinner size={12} inverted aria-label="Initializing recording" />
          )}
          {state === 'Recording' && (
            <Icon size="12" glyph={<RecordCircleOutlineIcon />} />
          )}
          {state === 'Hover' && (
            <Icon size="12" glyph={<RecordSquareOutlineIcon />} />
          )}
        </span>
        <span className={styles['recording-pill__label']}>REC</span>
      </button>

      {state === 'Hover' && (
        <div className={styles['recording-pill__tooltip']} role="tooltip">
          Click to Stop
        </div>
      )}
    </div>
  );
}
