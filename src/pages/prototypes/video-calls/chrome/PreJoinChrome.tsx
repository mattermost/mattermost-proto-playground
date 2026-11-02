import CogOutlineIcon from '@mattermost/compass-icons/components/cog-outline';
import LinkVariantIcon from '@mattermost/compass-icons/components/link-variant';
import { WithTooltip } from '@mattermost/compass-proto';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { IconButton } from '@mattermost/compass-ui/components/icon-button';
import styles from './PreJoinChrome.module.scss';

export interface PreJoinChromeProps {
  /** The Calls plugin setting: skip the pre-join interstitial when starting a call. */
  skipPreJoin: boolean;
  onSkipPreJoinChange: (skip: boolean) => void;
  /** Simulates opening a call link. */
  onOpenCallLink: () => void;
  canOpenCallLink: boolean;
}

/**
 * Prototype chrome (not product UI) for the pre-join interstitial. It shows
 * by default when starting a call. The cog stands in for the Calls plugin
 * setting that skips it. Opening a call link always shows the interstitial,
 * whatever the setting says (the link button simulates it).
 */
export default function PreJoinChrome({
  skipPreJoin,
  onSkipPreJoinChange,
  onOpenCallLink,
  canOpenCallLink,
}: PreJoinChromeProps) {
  return (
    <div
      className={styles['pre-join-chrome']}
      role="group"
      aria-label="Pre-join settings"
    >
      <WithTooltip
        placement="bottom"
        label={`Calls settings: skip pre-join ${skipPreJoin ? 'on' : 'off'}`}
      >
        <IconButton
          size="x-small"
          aria-label="Skip pre-join"
          active={skipPreJoin}
          aria-pressed={skipPreJoin}
          icon={<Icon size="12" glyph={<CogOutlineIcon />} />}
          onClick={() => onSkipPreJoinChange(!skipPreJoin)}
        />
      </WithTooltip>
      <WithTooltip
        placement="bottom"
        label="Open a call link (always shows pre-join)"
      >
        <IconButton
          size="x-small"
          aria-label="Open a call link"
          disabled={!canOpenCallLink}
          icon={<Icon size="12" glyph={<LinkVariantIcon />} />}
          onClick={onOpenCallLink}
        />
      </WithTooltip>
    </div>
  );
}
