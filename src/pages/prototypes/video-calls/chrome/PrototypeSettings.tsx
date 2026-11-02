import { useCallback, useEffect, useRef, useState } from 'react';
import CogOutlineIcon from '@mattermost/compass-icons/components/cog-outline';
import LinkVariantIcon from '@mattermost/compass-icons/components/link-variant';
import { WithTooltip } from '@mattermost/compass-proto';
import { Button } from '@mattermost/compass-ui/components/button';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { IconButton } from '@mattermost/compass-ui/components/icon-button';
import {
  PopoverMenu,
  PopoverMenuTitle,
} from '@mattermost/compass-ui/components/popover-menu';
import { Switch } from '@mattermost/compass-ui/components/switch';
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
 * Prototype chrome (not product UI): every prototype setting in one popover,
 * opened from a cog next to the People counter. It holds the person's pre-join
 * setting, the server settings (video calls, SIP phone calls), the prototype's
 * call sounds, and a button that simulates opening a call link. The host owns
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
          size="x-small"
          padding="compact"
          rounded
          aria-label="Prototype settings"
          aria-haspopup="dialog"
          aria-expanded={open}
          active={open}
          icon={<Icon size="12" glyph={<CogOutlineIcon />} />}
          onClick={() => setOpen((o) => !o)}
        />
      </WithTooltip>
      <div className={styles['prototype-settings__popover']}>
        <PopoverMenu open={open} role="dialog" aria-label="Prototype settings">
          <PopoverMenuTitle>Prototype settings</PopoverMenuTitle>

          <fieldset className={styles['prototype-settings__group']}>
            <legend className={styles['prototype-settings__legend']}>
              Calls plugin settings (you)
            </legend>
            <Switch
              size="small"
              checked={skipPreJoin}
              onChange={(e) => onSkipPreJoinChange(e.target.checked)}
              secondaryLabel="Start calls immediately. Call links and joining a running call still show it."
            >
              Skip the pre-join screen
            </Switch>
          </fieldset>

          <fieldset className={styles['prototype-settings__group']}>
            <legend className={styles['prototype-settings__legend']}>
              Server settings
            </legend>
            <Switch
              size="small"
              checked={features.video}
              onChange={(e) => onFeaturesChange({ video: e.target.checked })}
              secondaryLabel="Off: audio-only calls, as today's calls plugin."
            >
              Video calls
            </Switch>
            <Switch
              size="small"
              checked={features.phone}
              onChange={(e) => onFeaturesChange({ phone: e.target.checked })}
              secondaryLabel="Adds a Phone call group to the DM Start call menu."
            >
              SIP phone calls
            </Switch>
          </fieldset>

          <fieldset className={styles['prototype-settings__group']}>
            <legend className={styles['prototype-settings__legend']}>
              Prototype
            </legend>
            <Switch
              size="small"
              checked={soundOn}
              onChange={(e) => onSoundChange(e.target.checked)}
              secondaryLabel="Ring, join and leave sounds."
            >
              Call sounds
            </Switch>
            <Button
              emphasis="tertiary"
              size="small"
              className={styles['prototype-settings__action']}
              leadingIcon={<Icon size="12" glyph={<LinkVariantIcon />} />}
              disabled={!canOpenCallLink}
              onClick={() => {
                setOpen(false);
                onOpenCallLink();
              }}
            >
              Open a call link
            </Button>
            <p className={styles['prototype-settings__hint']}>
              Simulates opening a link that starts a call. It always shows
              pre-join.
            </p>
          </fieldset>
        </PopoverMenu>
      </div>
    </div>
  );
}
