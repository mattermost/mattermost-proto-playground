import { Button } from '@mattermost/compass-ui/components/button';
import { UserAvatar } from '@mattermost/compass-ui/components/user-avatar';
import { WidgetFrame } from '../WidgetFrame';
import styles from './WidgetIncoming.module.scss';

export interface WidgetIncomingLabels {
  /** Line under the caller name (the call type). */
  subtitle?: string;
  accept?: string;
  decline?: string;
}

export interface WidgetIncomingProps {
  callerName: string;
  callerAvatarSrc?: string;
  onAccept: () => void;
  /** Turn the call down; the caller sees a declined-call post. */
  onDecline: () => void;
  labels?: WidgetIncomingLabels;
  className?: string;
}

const DEFAULT_LABELS: Required<WidgetIncomingLabels> = {
  subtitle: 'Incoming video call',
  accept: 'Accept',
  decline: 'Decline',
};

/**
 * Incoming-call state of the widget: caller, subtitle and Ignore / Accept. Presentational; the host owns ringing, timeouts and sound.
 */
export default function WidgetIncoming({
  callerName,
  callerAvatarSrc,
  onAccept,
  onDecline,
  labels,
  className,
}: WidgetIncomingProps) {
  const l = { ...DEFAULT_LABELS, ...labels };
  return (
    <WidgetFrame
      role="dialog"
      ariaLabel={`${l.subtitle} from ${callerName}`}
      className={className}
    >
      <div className={styles['widget-incoming__caller']}>
        <span className={styles['widget-incoming__avatar']}>
          <UserAvatar
            src={callerAvatarSrc}
            alt=""
            name={callerName}
            size="48"
          />
        </span>
        <div className={styles['widget-incoming__text']}>
          <p className={styles['widget-incoming__name']}>{callerName}</p>
          <p className={styles['widget-incoming__subtitle']}>{l.subtitle}</p>
        </div>
      </div>
      <div className={styles['widget-incoming__actions']}>
        <Button
          className={styles['widget-incoming__action']}
          emphasis="tertiary"
          size="small"
          onClick={onDecline}
        >
          {l.decline}
        </Button>
        <Button
          className={styles['widget-incoming__action']}
          emphasis="primary"
          size="small"
          onClick={onAccept}
        >
          {l.accept}
        </Button>
      </div>
    </WidgetFrame>
  );
}
