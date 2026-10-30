import type { ReactNode } from 'react';
import ArrowExpandIcon from '@mattermost/compass-icons/components/arrow-expand';
import { Button } from '@mattermost/compass-ui/components/button';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { IconButton } from '@mattermost/compass-ui/components/icon-button';
import { UserAvatarGroup } from '@mattermost/compass-ui/components/user-avatar-group';
import { MicLevelMeter } from '../MicLevelMeter';
import { VideoTile } from '../VideoTile';
import { WidgetFrame } from '../WidgetFrame';
import {
  WidgetMediaControls,
  type WidgetMediaControlsLabels,
} from '../WidgetMediaControls';
import styles from './WidgetPreJoin.module.scss';

export interface WidgetPreJoinPerson {
  key: string;
  name: string;
  src?: string;
}

export interface WidgetPreJoinLabels extends WidgetMediaControlsLabels {
  region?: string;
  /** Heading when starting a 1:1 call. */
  titleStart?: string;
  /** Heading when joining a group / channel call. */
  titleJoin?: string;
  expand?: string;
  start?: string;
  join?: string;
  cancel?: string;
  micLevel?: string;
  /** "N people in the call". */
  peopleInCall?: (count: number) => string;
  /** Suffix after the signed-in user's name on the preview, e.g. "You". */
  self?: string;
}

export interface WidgetPreJoinProps {
  /** `start` rings the other person (1:1); `join` enters a call in progress. */
  mode: 'start' | 'join';
  selfName: string;
  selfAvatarSrc?: string;
  /** Live webcam stream for the preview; null shows the avatar-on-dark tile. */
  cameraStream?: MediaStream | null;
  micOn: boolean;
  /** Mic input level 0..1 for the test meter. */
  micLevel: number;
  cameraOn: boolean;
  onToggleMic: () => void;
  onOpenMicMenu: () => void;
  micMenuOpen?: boolean;
  onToggleCamera: () => void;
  onOpenCameraMenu: () => void;
  cameraMenuOpen?: boolean;
  /** Host-rendered device menus, anchored above the card. */
  micMenu?: ReactNode;
  cameraMenu?: ReactNode;
  /** Who is already in the call (join mode). */
  people?: readonly WidgetPreJoinPerson[];
  onPrimary: () => void;
  onCancel: () => void;
  onExpand: () => void;
  labels?: WidgetPreJoinLabels;
  className?: string;
}

const DEFAULT_LABELS: Required<WidgetPreJoinLabels> = {
  region: 'Call setup',
  titleStart: 'Ready to start the call?',
  titleJoin: 'Ready to join?',
  expand: 'Expand call window',
  start: 'Start call',
  join: 'Join call',
  cancel: 'Cancel',
  micLevel: 'Microphone level',
  peopleInCall: (n) => `${n} ${n === 1 ? 'person' : 'people'} in the call`,
  self: 'You',
  mute: 'Mute microphone',
  unmute: 'Unmute microphone',
  micOptions: 'Microphone options',
  cameraOn: 'Turn camera on',
  cameraOff: 'Turn camera off',
  cameraOptions: 'Camera options',
};

/**
 * Lightweight "ready?" step inside the call widget: small self-preview, mic
 * level, segmented mic / camera controls, who is already in the call (join
 * mode) and Start / Join + Cancel. Presentational; the host owns media state,
 * menus and navigation.
 */
export default function WidgetPreJoin({
  mode,
  selfName,
  selfAvatarSrc,
  cameraStream,
  micOn,
  micLevel,
  cameraOn,
  onToggleMic,
  onOpenMicMenu,
  micMenuOpen,
  onToggleCamera,
  onOpenCameraMenu,
  cameraMenuOpen,
  micMenu,
  cameraMenu,
  people = [],
  onPrimary,
  onCancel,
  onExpand,
  labels,
  className,
}: WidgetPreJoinProps) {
  const l = { ...DEFAULT_LABELS, ...labels };
  const title = mode === 'start' ? l.titleStart : l.titleJoin;
  return (
    <WidgetFrame
      ariaLabel={l.region}
      className={className}
      popovers={
        <>
          {micMenu}
          {cameraMenu}
        </>
      }
    >
      <div className={styles['widget-pre-join__header']}>
        <h2 className={styles['widget-pre-join__title']}>{title}</h2>
        <IconButton
          size="small"
          padding="compact"
          aria-label={l.expand}
          title={l.expand}
          icon={<Icon size="16" glyph={<ArrowExpandIcon />} />}
          onClick={onExpand}
        />
      </div>

      <div className={styles['widget-pre-join__content']}>
        <div className={styles['widget-pre-join__preview']}>
          <VideoTile
            name={selfName}
            avatarSrc={selfAvatarSrc}
            stream={cameraStream}
            cameraOn={cameraOn}
            muted={!micOn}
            mirrored
            selfLabel={l.self}
          />
        </div>

        <div className={styles['widget-pre-join__controls']}>
          <WidgetMediaControls
            micOn={micOn}
            onToggleMic={onToggleMic}
            onOpenMicMenu={onOpenMicMenu}
            micMenuOpen={micMenuOpen}
            cameraOn={cameraOn}
            onToggleCamera={onToggleCamera}
            onOpenCameraMenu={onOpenCameraMenu}
            cameraMenuOpen={cameraMenuOpen}
            labels={labels}
          />
          <MicLevelMeter
            className={styles['widget-pre-join__meter']}
            level={micLevel}
            segments={10}
            muted={!micOn}
            label={l.micLevel}
          />
        </div>

        {mode === 'join' && people.length > 0 && (
          <div className={styles['widget-pre-join__people']}>
            <UserAvatarGroup
              avatars={people.map((p) => ({
                key: p.key,
                src: p.src,
                name: p.name,
              }))}
              max={4}
              size="24"
            />
            <span className={styles['widget-pre-join__people-label']}>
              {l.peopleInCall(people.length)}
            </span>
          </div>
        )}

        <div className={styles['widget-pre-join__actions']}>
          <Button emphasis="tertiary" size="small" onClick={onCancel}>
            {l.cancel}
          </Button>
          <Button emphasis="primary" size="small" onClick={onPrimary}>
            {mode === 'start' ? l.start : l.join}
          </Button>
        </div>
      </div>
    </WidgetFrame>
  );
}
