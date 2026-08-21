import type { ImgHTMLAttributes } from 'react';
import { toKebab } from '@mattermost/compass-ui';
import { Icon, type IconSize } from '@mattermost/compass-ui';
import { IconButton, ICON_BUTTON_ICON_SIZES,
  type IconButtonSize, } from '@mattermost/compass-ui';
import MicrophoneOffIcon from '@mattermost/compass-icons/components/microphone-off';
import MicrophoneIcon from '@mattermost/compass-icons/components/microphone';
import HandRightIcon from '@mattermost/compass-icons/components/hand-right';
import AccountIcon from '@mattermost/compass-icons/components/account-outline';
import PhoneIcon from '@mattermost/compass-icons/components/phone';
import DotsHorizontalIcon from '@mattermost/compass-icons/components/dots-horizontal';
import styles from './CallParticipantAvatar.module.scss';

export type CallParticipantAvatarSize =
  | 'X-Small'
  | 'Small'
  | 'Medium'
  | 'Large';

export type CallParticipantMuteState = 'muted' | 'unmuted';

export type CallParticipantKind = 'user' | 'external-link' | 'dial-in';

export interface CallParticipantAvatarProps extends Omit<
  ImgHTMLAttributes<HTMLImageElement>,
  'src' | 'alt' | 'width' | 'height'
> {
  /** Alt text for the participant avatar image. */
  alt: string;
  /** Optional CSS class name. */
  className?: string;
  /** Image URL for the participant. Ignored when `kind` is not 'user'. */
  src?: string;
  /** Participant kind. 'external-link' shows a silhouette fallback; 'dial-in' shows a phone glyph on a green circle. Default: 'user'. */
  kind?: CallParticipantKind;
  /** Size variant. Default: Large. */
  size?: CallParticipantAvatarSize;
  /** Participant's display name shown below the avatar. */
  name?: string;
  /** Mute state: 'muted' | 'unmuted'. When undefined no badge is shown. */
  muteState?: CallParticipantMuteState;
  /** When true, shows the host label. */
  host?: boolean;
  /**
   * When true, shows an overflow actions control on hover / focus. Default: true.
   * Pair with `onHostControlsClick`.
   */
  hostControls?: boolean;
  /** Called when the overflow control is activated. */
  onHostControlsClick?: () => void;
  /** When true, shows the EXTERNAL label (for external-link and dial-in participants). */
  external?: boolean;
  /** When true, shows the talking indicator ring. */
  talking?: boolean;
  /** When true, shows the raised-hand overlay. */
  raisedHand?: boolean;
  /** Emoji reaction string (e.g. "🎉"). When provided, shows reaction overlay. */
  reaction?: string;
}

/** Image pixel sizes per Figma size variant. */
const SIZE_PX: Record<CallParticipantAvatarSize, number> = {
  'X-Small': 56,
  Small: 72,
  Medium: 96,
  Large: 120,
};

/**
 * Call participant avatar with overlays for mute state, host label,
 * reactions, raised hand, and talking indicator.
 * Used in the Calls feature.
 *
 * @see Figma Call Participant Avatar (Source: mWX0LMlr92dl42MBvfhN7V)
 */
export default function CallParticipantAvatar({
  alt,
  className = '',
  external = false,
  host = false,
  hostControls = true,
  onHostControlsClick,
  kind = 'user',
  muteState,
  name,
  raisedHand = false,
  reaction,
  size = 'Large',
  src,
  talking = false,
  ...imgProps
}: CallParticipantAvatarProps) {
  const sizeClass = styles[`call-participant-avatar--size-${toKebab(size)}`];
  const kindClass =
    kind === 'user'
      ? ''
      : styles[`call-participant-avatar--kind-${toKebab(kind)}`];
  const rootClass = [
    styles['call-participant-avatar'],
    sizeClass,
    kindClass,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const px = SIZE_PX[size];

  const glyphSize: IconSize =
    size === 'Large'
      ? '52'
      : size === 'Medium'
        ? '40'
        : size === 'Small'
          ? '32'
          : '28';

  const hostControlsButtonSize: IconButtonSize =
    size === 'Large' || size === 'Medium' ? 'Small' : 'X-Small';
  const hostControlsIconSize = ICON_BUTTON_ICON_SIZES[hostControlsButtonSize];

  const showHostControls = hostControls;

  return (
    <div className={rootClass}>
      {showHostControls && (
        <div className={styles['call-participant-avatar__host-actions']}>
          <IconButton
            aria-label="Participant actions"
            style="Inverted"
            padding="Compact"
            size={hostControlsButtonSize}
            icon={
              <Icon
                size={hostControlsIconSize}
                glyph={<DotsHorizontalIcon />}
              />
            }
            onClick={onHostControlsClick}
          />
        </div>
      )}
      <div className={styles['call-participant-avatar__container']}>
        {talking && (
          <span
            className={styles['call-participant-avatar__talking-ring']}
            aria-hidden
          />
        )}
        {kind === 'user' ? (
          <img
            {...imgProps}
            alt={alt}
            className={styles['call-participant-avatar__image']}
            src={src}
            width={px}
            height={px}
          />
        ) : (
          <span
            role="img"
            aria-label={alt}
            className={styles['call-participant-avatar__fallback']}
            style={{ width: px, height: px }}
          >
            <Icon
              size={glyphSize}
              glyph={kind === 'dial-in' ? <PhoneIcon /> : <AccountIcon />}
            />
          </span>
        )}
        {muteState === 'muted' && (
          <span
            className={[
              styles['call-participant-avatar__badge'],
              styles['call-participant-avatar__badge--muted'],
            ].join(' ')}
            aria-label="Muted"
          >
            <Icon size="16" glyph={<MicrophoneOffIcon />} />
          </span>
        )}
        {muteState === 'unmuted' && (
          <span
            className={[
              styles['call-participant-avatar__badge'],
              styles['call-participant-avatar__badge--unmuted'],
            ].join(' ')}
            aria-label="Unmuted"
          >
            <Icon size="16" glyph={<MicrophoneIcon />} />
          </span>
        )}
        {reaction != null && reaction !== '' && (
          <span
            className={[
              styles['call-participant-avatar__badge'],
              styles['call-participant-avatar__badge--reaction'],
            ].join(' ')}
            aria-label={`Reaction: ${reaction}`}
          >
            {reaction}
          </span>
        )}
        {raisedHand && (
          <span
            className={[
              styles['call-participant-avatar__badge'],
              styles['call-participant-avatar__badge--raised-hand'],
            ].join(' ')}
            aria-label="Raised hand"
          >
            <Icon size="16" glyph={<HandRightIcon />} />
          </span>
        )}
      </div>
      {name != null && name !== '' && (
        <span className={styles['call-participant-avatar__name']}>{name}</span>
      )}
      {host && (
        <span className={styles['call-participant-avatar__host-label']}>
          HOST
        </span>
      )}
      {external && (
        <span className={styles['call-participant-avatar__host-label']}>
          EXTERNAL
        </span>
      )}
    </div>
  );
}
