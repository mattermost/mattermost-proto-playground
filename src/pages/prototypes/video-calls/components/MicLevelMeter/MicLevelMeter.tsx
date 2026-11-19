import { Icon } from '@mattermost/compass-ui/components/icon';
import MicrophoneIcon from '@mattermost/compass-icons/components/microphone';
import MicrophoneOffIcon from '@mattermost/compass-icons/components/microphone-off';
import styles from './MicLevelMeter.module.scss';

export interface MicLevelMeterProps {
  /** Input level, 0..1. */
  level: number;
  /** Number of segments. Default: 12. */
  segments?: number;
  /** Dims the meter and swaps the glyph (microphone is off). */
  muted?: boolean;
  /** Accessible name. */
  label?: string;
  /** Show the leading microphone glyph. Default: true. */
  showIcon?: boolean;
  className?: string;
}

/** Segmented microphone input meter. Presentational: the host supplies `level`. */
export default function MicLevelMeter({
  level,
  segments = 12,
  muted = false,
  label = 'Microphone level',
  showIcon = true,
  className,
}: MicLevelMeterProps) {
  const clamped = Math.min(1, Math.max(0, level));
  const lit = muted ? 0 : Math.round(clamped * segments);
  const rootClass = [
    styles['mic-level-meter'],
    muted ? styles['mic-level-meter--muted'] : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={rootClass}
      role="meter"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(muted ? 0 : clamped * 100)}
    >
      {showIcon && (
        <Icon
          className={styles['mic-level-meter__icon']}
          glyph={muted ? <MicrophoneOffIcon /> : <MicrophoneIcon />}
          size="16"
        />
      )}
      <div className={styles['mic-level-meter__bars']} aria-hidden="true">
        {Array.from({ length: segments }, (_, i) => (
          <span
            key={i}
            className={`${styles['mic-level-meter__bar']} ${
              i < lit ? styles['mic-level-meter__bar--lit'] : ''
            }`}
          />
        ))}
      </div>
    </div>
  );
}
