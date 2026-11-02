import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import PhoneIcon from '@mattermost/compass-icons/components/phone';
import VideoOutlineIcon from '@mattermost/compass-icons/components/video-outline';
import VolumeHighIcon from '@mattermost/compass-icons/components/volume-high';
import CogOutlineIcon from '@mattermost/compass-icons/components/cog-outline';
import LinkVariantIcon from '@mattermost/compass-icons/components/link-variant';
import { WithTooltip } from '@mattermost/compass-proto';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { IconButton } from '@mattermost/compass-ui/components/icon-button';
import { MenuItem } from '@mattermost/compass-ui/components/menu-item';
import {
  PopoverMenu,
  PopoverMenuDivider,
  PopoverMenuGroup,
  PopoverMenuGroupTitle,
} from '@mattermost/compass-ui/components/popover-menu';
import { useOutsideClose } from '@/hooks/useOutsideClose';
import type { CallFeatures } from '@/types/videoCall';
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
  /** Simulates opening a call link (always shows pre-join). */
  onOpenCallLink: () => void;
  canOpenCallLink: boolean;
}

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
  onOpenCallLink,
  canOpenCallLink,
}: PrototypeSettingsProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);
  useOutsideClose(ref, open, close);
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
    <div ref={ref} className={styles['prototype-settings']}>
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
