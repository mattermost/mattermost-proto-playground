import { Button } from '@mattermost/compass-ui/components/button';
import { UserAvatar } from '@mattermost/compass-ui/components/user-avatar';
import { WidgetFrame } from '../WidgetFrame';
import styles from './WidgetIncoming.module.scss';

export interface WidgetIncomingLabels {
  /** Line under the caller name. */
  subtitle?: string;
  accept?: string;
  acceptAudio?: string;
  decline?: string;
}

export interface WidgetIncomingProps {
  callerName: string;
  callerAvatarSrc?: string;
  onAccept: () => void;
  /** Accept without camera. Hidden when omitted. */
  onAcceptAudio?: () => void;
  onDecline: () => void;
  labels?: WidgetIncomingLabels;
  className?: string;
}

const DEFAULT_LABELS: Required<WidgetIncomingLabels> = {
  subtitle: 'Incoming video call',
  accept: 'Accept',
  acceptAudio: 'Audio only',
  decline: 'Decline',
};

/**
 * Incoming-call state of the widget: caller, subtitle and Decline / Audio only
 * / Accept. Presentational; the host owns ringing, timeouts and sound.
 */
export default function WidgetIncoming({
  callerName,
  callerAvatarSrc,
  onAccept,
  onAcceptAudio,
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
            size="40"
          />
        </span>
        <div className={styles['widget-incoming__text']}>
          <p className={styles['widget-incoming__name']}>{callerName}</p>
          <p className={styles['widget-incoming__subtitle']}>{l.subtitle}</p>
        </div>
      </div>
      <div className={styles['widget-incoming__actions']}>
        <Button
          emphasis="tertiary"
          destructive
          size="small"
          onClick={onDecline}
        >
          {l.decline}
        </Button>
        {onAcceptAudio && (
          <Button emphasis="secondary" size="small" onClick={onAcceptAudio}>
            {l.acceptAudio}
          </Button>
        )}
        <Button emphasis="primary" size="small" onClick={onAccept}>
          {l.accept}
        </Button>
      </div>
    </WidgetFrame>
  );
}
