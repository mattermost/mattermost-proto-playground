import { useEffect, useRef, useState, type ReactNode } from 'react';
import PhoneIcon from '@mattermost/compass-icons/components/phone';
import AccountMultipleOutlineIcon from '@mattermost/compass-icons/components/account-multiple-outline';
import AlertOutlineIcon from '@mattermost/compass-icons/components/alert-outline';
import CheckCircleOutlineIcon from '@mattermost/compass-icons/components/check-circle-outline';
import RefreshIcon from '@mattermost/compass-icons/components/refresh';
import SyncIcon from '@mattermost/compass-icons/components/sync';
import VideoOffOutlineIcon from '@mattermost/compass-icons/components/video-off-outline';
import VideoOutlineIcon from '@mattermost/compass-icons/components/video-outline';
import VolumeHighIcon from '@mattermost/compass-icons/components/volume-high';
import CogOutlineIcon from '@mattermost/compass-icons/components/cog-outline';
import LinkVariantIcon from '@mattermost/compass-icons/components/link-variant';
import { WithTooltip } from '@mattermost/compass-proto';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { IconButton } from '@mattermost/compass-ui/components/icon-button';
import { MenuItem } from '@mattermost/compass-ui/components/menu-item';
import { Select } from '@mattermost/compass-ui/components/select';
import {
  PopoverMenu,
  PopoverMenuDivider,
  PopoverMenuGroup,
  PopoverMenuGroupTitle,
} from '@mattermost/compass-ui/components/popover-menu';
import type { CallFeatures } from '@/types/videoCall';
import {
  MY_CONNECTION,
  REMOTE_VIDEO,
  type MyConnection,
  type RemoteVideo,
} from '../videoCalls.scenes';
import styles from './PrototypeSettings.module.scss';

export interface PrototypeSettingsProps {
  /** The person's Calls plugin setting: skip the pre-join interstitial when starting a call. */
  skipPreJoin: boolean;
  onSkipPreJoinChange: (skip: boolean) => void;
  /** Server settings: video calling and SIP phone calling. */
  features: CallFeatures;
  onFeaturesChange: (next: Partial<CallFeatures>) => void;
  /** Prototype call sounds. */
  soundOn: boolean;
  onSoundChange: (on: boolean) => void;
  /**
   * Other people's video: on, off, loading, poor network, reconnecting, or
   * mixed. The in-between states apply to one person (`focusName`).
   */
  remoteVideo: RemoteVideo;
  onRemoteVideoChange: (next: RemoteVideo) => void;
  /** Only while the call is live (also gates My connection). */
  canSetRemoteVideo: boolean;
  /** 1:1 DM: options name "them", and Mixed is hidden. */
  isDm: boolean;
  /** "Mixed" needs a group (3 or more people). */
  canSetMixedVideo: boolean;
  /** First name of the person the in-between states apply to in a group. */
  focusName: string;
  /** Your own connection (sets your tile; poor and reconnecting post a warning). */
  myConnection: MyConnection;
  onMyConnectionChange: (next: MyConnection) => void;
  /** Simulates opening a call link (always shows pre-join). */
  onOpenCallLink: () => void;
  canOpenCallLink: boolean;
}

const REMOTE_VIDEO_ICON: Record<RemoteVideo, ReactNode> = {
  on: <VideoOutlineIcon />,
  off: <VideoOffOutlineIcon />,
  loading: <RefreshIcon />,
  poor: <AlertOutlineIcon />,
  reconnecting: <SyncIcon />,
  mixed: <AccountMultipleOutlineIcon />,
};

/** One-line secondary labels; DM copy talks about the other person. */
function remoteVideoSecondary(
  id: RemoteVideo,
  isDm: boolean,
  focusName: string,
): string {
  const who = isDm ? 'Their' : `${focusName} only:`;
  switch (id) {
    case 'on':
      return isDm
        ? 'Their camera is on. Available in a live call.'
        : 'Everyone else has their camera on. Available in a live call.';
    case 'off':
      return isDm
        ? 'Their camera is off (avatar on the dark tile).'
        : 'Everyone else has their camera off (avatars on the dark tile).';
    case 'loading':
      return isDm
        ? 'Their camera is on but the video has not arrived yet.'
        : `${who} camera on, video not arrived yet.`;
    case 'poor':
      return isDm
        ? 'Their video pauses on its last frame.'
        : `${who} video pauses on its last frame.`;
    case 'reconnecting':
      return isDm
        ? 'Their video freezes while they reconnect.'
        : `${who} video freezes while they reconnect.`;
    case 'mixed':
      return 'Every second person has their camera off. Groups only.';
  }
}

const MY_CONNECTION_ICON: Record<MyConnection, ReactNode> = {
  good: <CheckCircleOutlineIcon />,
  poor: <AlertOutlineIcon />,
  reconnecting: <SyncIcon />,
};

const MY_CONNECTION_SECONDARY: Record<MyConnection, string> = {
  good: 'No warning. Available in a live call.',
  poor: 'A warning notice, and a badge on your tile.',
  reconnecting: 'A warning notice; your tile freezes.',
};

/**
 * A setting as a menu row: a checkbox menu item whose check shows when it is
 * on. Toggling keeps the menu open so several settings can be changed.
 */
function SettingItem({
  icon,
  label,
  secondaryLabel,
  on,
  onToggle,
}: {
  icon: ReactNode;
  label: string;
  secondaryLabel: string;
  on: boolean;
  onToggle: () => void;
}) {
  return (
    <MenuItem
      role="menuitemcheckbox"
      aria-checked={on}
      label={label}
      secondaryLabel={secondaryLabel}
      leadingVisual={<Icon size="16" glyph={icon} />}
      trailingElement={on}
      onClick={onToggle}
    />
  );
}

/**
 * Prototype chrome (not product UI): every prototype setting in one popover,
 * opened from a cog next to the People counter. It is a popover menu with the
 * person's pre-join setting, the server settings (video calls, SIP phone
 * calls) and the prototype's call sounds as checkbox rows, and a row that
 * simulates opening a call link. The host owns
 * open state, outside click, Escape and focus return, as for any popover.
 */
export default function PrototypeSettings({
  skipPreJoin,
  onSkipPreJoinChange,
  features,
  onFeaturesChange,
  soundOn,
  onSoundChange,
  remoteVideo,
  onRemoteVideoChange,
  canSetRemoteVideo,
  isDm,
  canSetMixedVideo,
  focusName,
  myConnection,
  onMyConnectionChange,
  onOpenCallLink,
  canOpenCallLink,
}: PrototypeSettingsProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  // Outside click closes the popover, but not a click in a Select's menu: that
  // menu is portaled to the body, so it is outside `ref` in the DOM. React
  // events still bubble through portals, so the wrapper flags those clicks.
  const insideClick = useRef(false);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const inside =
        insideClick.current || !!ref.current?.contains(e.target as Node);
      insideClick.current = false;
      if (!inside) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setOpen(false);
      ref.current?.querySelector<HTMLElement>('button')?.focus();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <div
      ref={ref}
      className={styles['prototype-settings']}
      onMouseDownCapture={() => {
        insideClick.current = true;
      }}
    >
      <WithTooltip placement="bottom" label="Prototype settings">
        <IconButton
          size="small"
          padding="compact"
          rounded
          aria-label="Prototype settings"
          aria-haspopup="menu"
          aria-expanded={open}
          active={open}
          icon={<Icon size="16" glyph={<CogOutlineIcon />} />}
          onClick={() => setOpen((o) => !o)}
        />
      </WithTooltip>
      <div className={styles['prototype-settings__popover']}>
        <PopoverMenu open={open} role="menu" aria-label="Prototype settings">
          <PopoverMenuGroup>
            <PopoverMenuGroupTitle>
              Calls plugin settings (you)
            </PopoverMenuGroupTitle>
            <SettingItem
              icon={<CogOutlineIcon />}
              label="Skip the pre-join screen"
              secondaryLabel="Start calls immediately. Call links and joining a running call still show it."
              on={skipPreJoin}
              onToggle={() => onSkipPreJoinChange(!skipPreJoin)}
            />
          </PopoverMenuGroup>

          <PopoverMenuDivider />

          <PopoverMenuGroup>
            <PopoverMenuGroupTitle>Server settings</PopoverMenuGroupTitle>
            <SettingItem
              icon={<VideoOutlineIcon />}
              label="Video calls"
              secondaryLabel="Off: audio-only calls, as today's calls plugin."
              on={features.video}
              onToggle={() => onFeaturesChange({ video: !features.video })}
            />
            <SettingItem
              icon={<PhoneIcon />}
              label="SIP phone calls"
              secondaryLabel="Adds a Phone call group to the DM Start call menu."
              on={features.phone}
              onToggle={() => onFeaturesChange({ phone: !features.phone })}
            />
          </PopoverMenuGroup>

          <PopoverMenuDivider />

          <PopoverMenuGroup>
            <PopoverMenuGroupTitle>
              Other people&apos;s video
            </PopoverMenuGroupTitle>
            <div className={styles['prototype-settings__field']}>
              <Select
                size="medium"
                aria-label="Other people's video"
                value={remoteVideo}
                disabled={!canSetRemoteVideo}
                zIndex={40}
                onChange={(v) => onRemoteVideoChange(v as RemoteVideo)}
                options={REMOTE_VIDEO.filter(
                  (o) => !(isDm && o.id === 'mixed'),
                ).map((o) => ({
                  value: o.id,
                  label: o.label,
                  leadingVisual: (
                    <Icon size="16" glyph={REMOTE_VIDEO_ICON[o.id]} />
                  ),
                  secondaryLabel: remoteVideoSecondary(o.id, isDm, focusName),
                  disabled: o.id === 'mixed' && !canSetMixedVideo,
                }))}
              />
            </div>
          </PopoverMenuGroup>

          <PopoverMenuDivider />

          <PopoverMenuGroup>
            <PopoverMenuGroupTitle>My connection</PopoverMenuGroupTitle>
            <div className={styles['prototype-settings__field']}>
              <Select
                size="medium"
                aria-label="My connection"
                value={myConnection}
                disabled={!canSetRemoteVideo}
                zIndex={40}
                onChange={(v) => onMyConnectionChange(v as MyConnection)}
                options={MY_CONNECTION.map((o) => ({
                  value: o.id,
                  label: o.label,
                  leadingVisual: (
                    <Icon size="16" glyph={MY_CONNECTION_ICON[o.id]} />
                  ),
                  secondaryLabel: MY_CONNECTION_SECONDARY[o.id],
                }))}
              />
            </div>
          </PopoverMenuGroup>

          <PopoverMenuDivider />

          <PopoverMenuGroup>
            <PopoverMenuGroupTitle>Prototype</PopoverMenuGroupTitle>
            <SettingItem
              icon={<VolumeHighIcon />}
              label="Call sounds"
              secondaryLabel="Ring, join and leave sounds."
              on={soundOn}
              onToggle={() => onSoundChange(!soundOn)}
            />
            <MenuItem
              role="menuitem"
              label="Open a call link"
              secondaryLabel="Simulates a link that starts a call. It always shows pre-join."
              leadingVisual={<Icon size="16" glyph={<LinkVariantIcon />} />}
              disabled={!canOpenCallLink}
              onClick={() => {
                setOpen(false);
                onOpenCallLink();
              }}
            />
          </PopoverMenuGroup>
        </PopoverMenu>
      </div>
    </div>
  );
}
