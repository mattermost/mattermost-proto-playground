import {
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
} from 'react';
import { IconButton } from '@mattermost/compass-ui/components/icon-button';
import { Icon } from '@mattermost/compass-ui/components/icon';
import {
  UserAvatar,
  type UserAvatarSize,
} from '@mattermost/compass-ui/components/user-avatar';
import AlertOutlineIcon from '@mattermost/compass-icons/components/alert-outline';
import HandRightIcon from '@mattermost/compass-icons/components/hand-right';
import MicrophoneIcon from '@mattermost/compass-icons/components/microphone';
import MicrophoneOffIcon from '@mattermost/compass-icons/components/microphone-off';
import CrownOutlineIcon from '@mattermost/compass-icons/components/crown-outline';
import DotsHorizontalIcon from '@mattermost/compass-icons/components/dots-horizontal';
import SyncIcon from '@mattermost/compass-icons/components/sync';
import {
  ParticipantMenu,
  type ParticipantMenuAnchor,
} from '../ParticipantMenu';
import styles from './VideoTile.module.scss';

/**
 * `default` fills its parent cell (Figma desktop 454x256), `compact` is the
 * filmstrip / mobile square (182), `thumbnail` the widget tile (120x136).
 */
export type VideoTileSize = 'default' | 'compact' | 'thumbnail';
export type VideoTileConnection = 'good' | 'poor' | 'reconnecting';

/** Accessible status copy (screen readers / tooltips). English defaults. */
export interface VideoTileLabels {
  muted?: string;
  unmuted?: string;
  speaking?: string;
  handRaised?: string;
  poorConnection?: string;
  reconnecting?: string;
  cameraOff?: string;
  /** Accessible name / tooltip of the host badge. */
  host?: string;
  /** Accessible name of the host-controls `...` button and its menu. */
  participantActions?: string;
}

/** Host controls: items shown in the tile's menu; `onSelect` gets the item id. */
export interface VideoTileMenu {
  items: {
    id: string;
    label: string;
    destructive?: boolean;
    disabled?: boolean;
  }[];
  onSelect: (id: string) => void;
}

export interface VideoTileProps {
  /** Participant display name (label chip + accessible name). */
  name: string;
  avatarSrc?: string;
  /** Looping remote clip. */
  videoSrc?: string;
  /** Poster frame; shown while paused and before the clip loads. */
  posterSrc?: string;
  /** Live stream (self webcam). Takes precedence over `videoSrc`. */
  stream?: MediaStream | null;
  cameraOn: boolean;
  muted?: boolean;
  speaking?: boolean;
  handRaised?: boolean;
  /** Shows a compact host badge next to the name. */
  host?: boolean;
  /** Emoji shown as a short pop over the tile. Change `reactionKey` to replay the same emoji. */
  reaction?: string;
  reactionKey?: string | number;
  connection?: VideoTileConnection;
  /** Mirror the video horizontally (self webcam). */
  mirrored?: boolean;
  /** Off-screen / overflow: show the poster frame and never decode video. */
  paused?: boolean;
  size?: VideoTileSize;
  /** Shown after the name for the signed-in user, e.g. "You" → "Leonard Riley (You)". */
  selfLabel?: string;
  /**
   * Host controls. When set, hovering / focusing the bottom label strip reveals
   * a `...` button and right-clicking the tile opens the same menu.
   */
  menu?: VideoTileMenu;
  labels?: VideoTileLabels;
  className?: string;
  style?: CSSProperties;
}

const DEFAULT_LABELS: Required<VideoTileLabels> = {
  muted: 'Muted',
  unmuted: 'Microphone on',
  speaking: 'Speaking',
  handRaised: 'Hand raised',
  poorConnection: 'Poor connection',
  reconnecting: 'Reconnecting…',
  cameraOff: 'Camera off',
  host: 'Host',
  participantActions: 'Participant actions',
};

const AVATAR_SIZE: Record<VideoTileSize, UserAvatarSize> = {
  default: '72',
  compact: '56',
  thumbnail: '40',
};

const WAVE_BARS = [0, 1, 2, 3, 4];

function VideoTileInner({
  name,
  avatarSrc,
  videoSrc,
  posterSrc,
  stream,
  cameraOn,
  muted = false,
  speaking = false,
  handRaised = false,
  host = false,
  reaction,
  reactionKey,
  connection = 'good',
  mirrored = false,
  paused = false,
  size = 'default',
  selfLabel,
  menu,
  labels,
  className,
  style,
}: VideoTileProps) {
  const l = { ...DEFAULT_LABELS, ...labels };
  const streamRef = useRef<HTMLVideoElement>(null);
  const moreRef = useRef<HTMLButtonElement>(null);
  const [menuState, setMenuState] = useState<{
    id: number;
    anchor: ParticipantMenuAnchor;
    fromButton: boolean;
  } | null>(null);
  const menuSeq = useRef(0);
  const closeMenu = useCallback(() => setMenuState(null), []);

  const openAtPointer = (e: MouseEvent) => {
    if (!menu) return;
    e.preventDefault();
    setMenuState({
      id: ++menuSeq.current,
      anchor: { x: e.clientX, y: e.clientY },
      fromButton: false,
    });
  };
  const openFromButton = (e: MouseEvent<HTMLButtonElement>) => {
    if (menuState) {
      // The menu ignores pointerdown on its trigger, so toggle closed here.
      setMenuState(null);
      return;
    }
    const r = e.currentTarget.getBoundingClientRect();
    setMenuState({
      id: ++menuSeq.current,
      anchor: { x: r.left, y: r.top, width: r.width, height: r.height },
      fromButton: true,
    });
  };

  const hasStream = cameraOn && !!stream;
  const hasClip = cameraOn && !hasStream && !!videoSrc;
  const showStream = hasStream && !paused;
  const showClip = hasClip && !paused;
  const showPoster =
    cameraOn && paused && !!posterSrc && (hasStream || hasClip);
  const showAvatar = !showStream && !showClip && !showPoster;
  const reconnecting = connection === 'reconnecting';

  useEffect(() => {
    const video = streamRef.current;
    if (!video || !showStream) return undefined;
    video.srcObject = stream ?? null;
    video.play().catch(() => {
      /* autoplay can be refused; the muted element retries on user gesture */
    });
    return () => {
      video.srcObject = null;
    };
  }, [stream, showStream]);

  const displayName = selfLabel ? `${name} (${selfLabel})` : name;
  const status = [
    host ? l.host : null,
    muted ? l.muted : l.unmuted,
    speaking && !muted ? l.speaking : null,
    handRaised ? l.handRaised : null,
    !cameraOn ? l.cameraOff : null,
    connection === 'poor' ? l.poorConnection : null,
    reconnecting ? l.reconnecting : null,
  ]
    .filter(Boolean)
    .join(', ');

  const rootClass = [
    styles['video-tile'],
    styles[`video-tile--size-${size}`],
    speaking ? styles['video-tile--speaking'] : '',
    showAvatar ? styles['video-tile--camera-off'] : '',
    reconnecting ? styles['video-tile--reconnecting'] : '',
    mirrored ? styles['video-tile--mirrored'] : '',
    menu ? styles['video-tile--has-menu'] : '',
    menuState ? styles['video-tile--menu-open'] : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  const iconSize = size === 'thumbnail' ? '10' : '12';

  return (
    <figure
      className={rootClass}
      style={style}
      aria-label={`${displayName}: ${status}`}
      onContextMenu={menu ? openAtPointer : undefined}
    >
      {showStream && (
        <video
          ref={streamRef}
          className={styles['video-tile__media']}
          muted
          playsInline
          autoPlay
          aria-hidden="true"
        />
      )}
      {showClip && (
        <video
          key={videoSrc}
          className={styles['video-tile__media']}
          src={videoSrc}
          poster={posterSrc}
          muted
          loop
          playsInline
          autoPlay
          preload="auto"
          aria-hidden="true"
        />
      )}
      {showPoster && (
        <img
          className={styles['video-tile__media']}
          src={posterSrc}
          alt=""
          aria-hidden="true"
        />
      )}
      {showAvatar && (
        <div className={styles['video-tile__avatar']} aria-hidden="true">
          <UserAvatar
            className={styles['video-tile__avatar-image']}
            src={avatarSrc}
            alt=""
            name={name}
            size={AVATAR_SIZE[size]}
          />
        </div>
      )}

      {reconnecting && (
        <div className={styles['video-tile__reconnecting']} aria-hidden="true">
          <Icon
            className={styles['video-tile__spinner']}
            glyph={<SyncIcon />}
            size="24"
          />
          {size !== 'thumbnail' && <span>{l.reconnecting}</span>}
        </div>
      )}

      <div className={styles['video-tile__badges']}>
        {connection === 'poor' && (
          <span
            className={styles['video-tile__badge']}
            title={l.poorConnection}
          >
            <Icon glyph={<AlertOutlineIcon />} size="16" />
          </span>
        )}
        {handRaised && (
          <span
            className={`${styles['video-tile__badge']} ${styles['video-tile__badge--hand']}`}
            title={l.handRaised}
          >
            <Icon glyph={<HandRightIcon />} size="16" />
          </span>
        )}
      </div>

      {reaction && (
        <span
          key={reactionKey ?? reaction}
          className={styles['video-tile__reaction']}
          aria-hidden="true"
        >
          {reaction}
        </span>
      )}

      {size === 'thumbnail' ? (
        <>
          {host && (
            <span
              className={`${styles['video-tile__host']} ${styles['video-tile__host--thumbnail']}`}
              role="img"
              aria-label={l.host}
              title={l.host}
            >
              <Icon glyph={<CrownOutlineIcon />} size="10" />
            </span>
          )}
          {muted && (
            <span
              className={styles['video-tile__muted-dot']}
              aria-hidden="true"
            >
              <Icon glyph={<MicrophoneOffIcon />} size="10" />
            </span>
          )}
        </>
      ) : (
        <div className={styles['video-tile__strip']}>
          <figcaption className={styles['video-tile__label']}>
            <Icon
              className={`${styles['video-tile__mic']} ${muted ? styles['video-tile__mic--muted'] : ''}`}
              glyph={muted ? <MicrophoneOffIcon /> : <MicrophoneIcon />}
              size={iconSize}
            />
            <span className={styles['video-tile__name']}>{displayName}</span>
            {host && (
              <span
                className={styles['video-tile__host']}
                role="img"
                aria-label={l.host}
                title={l.host}
              >
                <Icon glyph={<CrownOutlineIcon />} size={iconSize} />
              </span>
            )}
            {speaking && !muted && (
              <span className={styles['video-tile__wave']} aria-hidden="true">
                {WAVE_BARS.map((i) => (
                  <span key={i} className={styles['video-tile__wave-bar']} />
                ))}
              </span>
            )}
          </figcaption>
          {menu && (
            <IconButton
              ref={moreRef}
              className={styles['video-tile__more']}
              icon={<DotsHorizontalIcon />}
              size="small"
              style="inverted"
              aria-label={l.participantActions}
              aria-haspopup="menu"
              aria-expanded={!!menuState}
              onClick={openFromButton}
            />
          )}
        </div>
      )}
      {menu && menuState && (
        <ParticipantMenu
          key={menuState.id}
          items={menu.items}
          anchor={menuState.anchor}
          label={l.participantActions}
          triggerEl={menuState.fromButton ? moreRef.current : null}
          focusOnOpen={menuState.fromButton}
          onSelect={menu.onSelect}
          onClose={closeMenu}
        />
      )}
    </figure>
  );
}

/** Figma "Video Window": one participant's video or avatar with status overlays. */
export const VideoTile = memo(VideoTileInner);
VideoTile.displayName = 'VideoTile';
