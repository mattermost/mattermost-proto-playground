import PhoneIcon from '@mattermost/compass-icons/components/phone';
import VideoOutlineIcon from '@mattermost/compass-icons/components/video-outline';
import { Button } from '@mattermost/compass-ui/components/button';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { UserAvatar } from '@mattermost/compass-ui/components/user-avatar';
import { WidgetFrame } from '../WidgetFrame';
import styles from './WidgetIncoming.module.scss';

export interface WidgetIncomingLabels {
  /** Line under the caller name (the call type). */
  subtitle?: string;
  accept?: string;
  decline?: string;
  /** Line under the caller name once the call is accepted. */
  joining?: string;
  cancel?: string;
}

export interface WidgetIncomingProps {
  /** Shown as the icon on the avatar and in the subtitle. Default: `video`. */
  callType?: 'video' | 'audio';
  callerName: string;
  callerAvatarSrc?: string;
  onAccept: () => void;
  /** Turn the call down; the caller sees a declined-call post. */
  onDecline: () => void;
  /**
   * After Accept, until the call goes live: same layout and height as the
   * incoming card (no pulse), with one Cancel action instead of Decline / Accept.
   */
  joining?: boolean;
  /** Back out while joining. */
  onCancel?: () => void;
  labels?: WidgetIncomingLabels;
  className?: string;
}

const DEFAULT_LABELS: Required<WidgetIncomingLabels> = {
  subtitle: 'Incoming video call',
  accept: 'Accept',
  decline: 'Decline',
  joining: 'Joining call…',
  cancel: 'Cancel',
};

/**
 * Incoming-call state of the widget: caller, subtitle and Ignore / Accept. Presentational; the host owns ringing, timeouts and sound.
 */
export default function WidgetIncoming({
  callType = 'video',
  callerName,
  callerAvatarSrc,
  onAccept,
  onDecline,
  joining = false,
  onCancel,
  labels,
  className,
}: WidgetIncomingProps) {
  const l = {
    ...DEFAULT_LABELS,
    subtitle:
      callType === 'audio' ? 'Incoming audio call' : DEFAULT_LABELS.subtitle,
    ...labels,
  };
  return (
    <WidgetFrame
      role={joining ? 'region' : 'dialog'}
      ariaLabel={
        joining
          ? `Joining call with ${callerName}`
          : `${l.subtitle} from ${callerName}`
      }
      className={className}
    >
      <div className={styles['widget-incoming__caller']}>
        <span
          className={[
            styles['widget-incoming__avatar'],
            joining && styles['widget-incoming__avatar--still'],
          ]
            .filter(Boolean)
            .join(' ')}
        >
          <UserAvatar
            src={callerAvatarSrc}
            alt=""
            name={callerName}
            size="48"
          />
          <span className={styles['widget-incoming__badge']} aria-hidden="true">
            <Icon
              size="12"
              glyph={
                callType === 'audio' ? <PhoneIcon /> : <VideoOutlineIcon />
              }
            />
          </span>
        </span>
        <div className={styles['widget-incoming__text']}>
          <p className={styles['widget-incoming__name']}>{callerName}</p>
          <p
            className={styles['widget-incoming__subtitle']}
            role={joining ? 'status' : undefined}
          >
            {joining ? l.joining : l.subtitle}
          </p>
        </div>
      </div>
      <div className={styles['widget-incoming__actions']}>
        {joining ? (
          <Button
            className={styles['widget-incoming__action']}
            emphasis="tertiary"
            size="small"
            onClick={onCancel}
          >
            {l.cancel}
          </Button>
        ) : (
          <>
            <Button
              className={styles['widget-incoming__action']}
              emphasis="tertiary"
              size="small"
              onClick={onDecline}
            >
              {l.decline}
            </Button>
            <Button
              className={[
                styles['widget-incoming__action'],
                styles['widget-incoming__accept'],
              ].join(' ')}
              emphasis="primary"
              size="small"
              onClick={onAccept}
            >
              {l.accept}
            </Button>
          </>
        )}
      </div>
    </WidgetFrame>
  );
}
