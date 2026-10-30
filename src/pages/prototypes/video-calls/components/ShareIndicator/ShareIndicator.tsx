import { Button } from '@mattermost/compass-ui/components/button';
import styles from './ShareIndicator.module.scss';

export interface ShareIndicatorLabels {
  /** Status text. */
  status?: string;
  /** Stop button text. */
  stop?: string;
  /** Stop button accessible name. */
  stopAria?: string;
}

export interface ShareIndicatorProps {
  onStop: () => void;
  labels?: ShareIndicatorLabels;
  className?: string;
}

const DEFAULT_LABELS: Required<ShareIndicatorLabels> = {
  status: 'You are sharing',
  stop: 'Stop',
  stopAria: 'Stop sharing your screen',
};

/**
 * Compact "you are sharing" pill with a text Stop button. Positioning is the
 * host's job (the call window anchors it top-center over the stage).
 */
export function ShareIndicator({
  onStop,
  labels,
  className,
}: ShareIndicatorProps) {
  const l = { ...DEFAULT_LABELS, ...labels };
  return (
    <div
      role="status"
      className={[styles['share-indicator'], className]
        .filter(Boolean)
        .join(' ')}
    >
      <span className={styles['share-indicator__dot']} aria-hidden="true" />
      <span className={styles['share-indicator__text']}>{l.status}</span>
      <Button
        emphasis="link"
        appearance="inverted"
        size="x-small"
        aria-label={l.stopAria}
        onClick={onStop}
      >
        {l.stop}
      </Button>
    </div>
  );
}
