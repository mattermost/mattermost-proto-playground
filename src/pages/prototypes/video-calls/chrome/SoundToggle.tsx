import VolumeHighIcon from '@mattermost/compass-icons/components/volume-high';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { IconButton } from '@mattermost/compass-ui/components/icon-button';

export interface SoundToggleProps {
  on: boolean;
  onChange: (on: boolean) => void;
}

/**
 * Prototype chrome (not product UI): turns the ring and join sounds on or off.
 * Sounds are off by default because browsers also block audio before a gesture.
 */
export default function SoundToggle({ on, onChange }: SoundToggleProps) {
  return (
    <IconButton
      size="small"
      aria-label="Call sounds"
      title={on ? 'Call sounds on' : 'Call sounds off'}
      toggled={on}
      icon={<Icon glyph={<VolumeHighIcon />} />}
      onClick={() => onChange(!on)}
    />
  );
}
