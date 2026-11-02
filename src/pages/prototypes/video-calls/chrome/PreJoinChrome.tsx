import CogOutlineIcon from '@mattermost/compass-icons/components/cog-outline';
import LinkVariantIcon from '@mattermost/compass-icons/components/link-variant';
import { WithTooltip } from '@mattermost/compass-proto';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { IconButton } from '@mattermost/compass-ui/components/icon-button';
import SceneSwitcher from '@/components/navigation/SceneSwitcher/SceneSwitcher';
import type { PreJoinPreference } from '@/types/videoCall';
import styles from './PreJoinChrome.module.scss';

export interface PreJoinChromeProps {
  /** System Console default: skip the pre-join interstitial when starting a call. */
  adminSkip: boolean;
  onAdminSkipChange: (skip: boolean) => void;
  /** The person's own Calls plugin setting. */
  preference: PreJoinPreference;
  onPreferenceChange: (preference: PreJoinPreference) => void;
  /** Simulates opening a call link. */
  onOpenCallLink: () => void;
  canOpenCallLink: boolean;
}

const PREFERENCES: { id: PreJoinPreference; label: string }[] = [
  { id: 'default', label: 'Admin default' },
  { id: 'skip', label: 'Skip' },
  { id: 'show', label: 'Show' },
];

/**
 * Prototype chrome (not product UI) for the pre-join interstitial. It shows
 * by default when starting a call. The System Console sets a default for
 * everyone (the cog), and a person overrides it in the Calls plugin settings
 * (the switcher). Opening a call link always shows the interstitial, whatever
 * these say (the link button simulates it).
 */
export default function PreJoinChrome({
  adminSkip,
  onAdminSkipChange,
  preference,
  onPreferenceChange,
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
        label={`System Console default: ${adminSkip ? 'skip' : 'show'} pre-join`}
      >
        <IconButton
          size="x-small"
          aria-label="System Console default: skip pre-join"
          active={adminSkip}
          aria-pressed={adminSkip}
          icon={<Icon size="12" glyph={<CogOutlineIcon />} />}
          onClick={() => onAdminSkipChange(!adminSkip)}
        />
      </WithTooltip>
      <SceneSwitcher
        label="You"
        scenes={PREFERENCES}
        activeId={preference}
        onChange={(id) => onPreferenceChange(id as PreJoinPreference)}
        ariaLabel="Your pre-join setting"
      />
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
