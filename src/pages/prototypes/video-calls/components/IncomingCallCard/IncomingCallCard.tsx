import { Button } from '@mattermost/compass-ui/components/button';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { UserAvatar } from '@mattermost/compass-ui/components/user-avatar';
import PhoneIcon from '@mattermost/compass-icons/components/phone';
import PhoneHangupIcon from '@mattermost/compass-icons/components/phone-hangup';
import VideoOutlineIcon from '@mattermost/compass-icons/components/video-outline';
import styles from './IncomingCallCard.module.scss';

export interface IncomingCallCardLabels {
  /** Line under the caller name. */
  subtitle?: string;
  accept?: string;
  acceptAudio?: string;
  decline?: string;
}

export interface IncomingCallCardProps {
  callerName: string;
  callerAvatarSrc?: string;
  onAccept: () => void;
  /** Accept without camera. Hidden when omitted. */
  onAcceptAudio?: () => void;
  onDecline: () => void;
  labels?: IncomingCallCardLabels;
  className?: string;
}

const DEFAULT_LABELS: Required<IncomingCallCardLabels> = {
  subtitle: 'Incoming video call',
  accept: 'Accept',
  acceptAudio: 'Audio only',
  decline: 'Decline',
};

/** Ringing card for an incoming call. Presentational: the host owns ringing, timeouts and sound. */
export default function IncomingCallCard({
  callerName,
  callerAvatarSrc,
  onAccept,
  onAcceptAudio,
  onDecline,
  labels,
  className,
}: IncomingCallCardProps) {
  const l = { ...DEFAULT_LABELS, ...labels };
  return (
    <div
      className={[styles['incoming-call-card'], className ?? '']
        .filter(Boolean)
        .join(' ')}
      role="dialog"
      aria-label={`${l.subtitle} from ${callerName}`}
    >
      <div className={styles['incoming-call-card__caller']}>
        <span className={styles['incoming-call-card__avatar']}>
          <UserAvatar
            src={callerAvatarSrc}
            alt=""
            name={callerName}
            size="48"
          />
        </span>
        <div className={styles['incoming-call-card__text']}>
          <p className={styles['incoming-call-card__name']}>{callerName}</p>
          <p className={styles['incoming-call-card__subtitle']} role="status">
            {l.subtitle}
          </p>
        </div>
      </div>
      <div className={styles['incoming-call-card__actions']}>
        <Button
          emphasis="secondary"
          destructive
          size="small"
          leadingIcon={<Icon glyph={<PhoneHangupIcon />} />}
          onClick={onDecline}
        >
          {l.decline}
        </Button>
        {onAcceptAudio && (
          <Button
            emphasis="secondary"
            size="small"
            leadingIcon={<Icon glyph={<PhoneIcon />} />}
            onClick={onAcceptAudio}
          >
            {l.acceptAudio}
          </Button>
        )}
        <Button
          emphasis="primary"
          size="small"
          leadingIcon={<Icon glyph={<VideoOutlineIcon />} />}
          onClick={onAccept}
        >
          {l.accept}
        </Button>
      </div>
    </div>
  );
}
