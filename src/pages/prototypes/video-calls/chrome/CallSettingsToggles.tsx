import PhoneIcon from '@mattermost/compass-icons/components/phone';
import VideoOutlineIcon from '@mattermost/compass-icons/components/video-outline';
import VolumeHighIcon from '@mattermost/compass-icons/components/volume-high';
import { WithTooltip } from '@mattermost/compass-proto';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { IconButton } from '@mattermost/compass-ui/components/icon-button';
import type { CallFeatures } from '@/types/videoCall';
import styles from './CallSettingsToggles.module.scss';

export interface CallSettingsTogglesProps {
  features: CallFeatures;
  onFeaturesChange: (next: Partial<CallFeatures>) => void;
  soundOn: boolean;
  onSoundChange: (on: boolean) => void;
}

/**
 * Prototype chrome (not product UI): the server call settings (video calling,
 * phone calling) and the prototype's call sounds, grouped side by side. Video
 * off gives today's audio-only calls plugin; phone on adds outbound phone
 * calling to the DM Start call menu. Sounds are a prototype convenience (the
 * product uses the person's calls sound setting). Each button has a tooltip
 * that names the setting and its state.
 */
export default function CallSettingsToggles({
  features,
  onFeaturesChange,
  soundOn,
  onSoundChange,
}: CallSettingsTogglesProps) {
  const state = (on: boolean) => (on ? 'on' : 'off');
  return (
    <div
      className={styles['call-settings']}
      role="group"
      aria-label="Call settings"
    >
      <WithTooltip
        placement="bottom"
        label={`Video calls: ${state(features.video)}`}
      >
        <IconButton
          size="x-small"
          aria-label="Video calls"
          active={features.video}
          aria-pressed={features.video}
          icon={<Icon size="12" glyph={<VideoOutlineIcon />} />}
          onClick={() => onFeaturesChange({ video: !features.video })}
        />
      </WithTooltip>
      <WithTooltip
        placement="bottom"
        label={`Phone calls: ${state(features.phone)}`}
      >
        <IconButton
          size="x-small"
          aria-label="Phone calls"
          active={features.phone}
          aria-pressed={features.phone}
          icon={<Icon size="12" glyph={<PhoneIcon />} />}
          onClick={() => onFeaturesChange({ phone: !features.phone })}
        />
      </WithTooltip>
      <WithTooltip placement="bottom" label={`Call sounds: ${state(soundOn)}`}>
        <IconButton
          size="x-small"
          aria-label="Call sounds"
          active={soundOn}
          aria-pressed={soundOn}
          icon={<Icon size="12" glyph={<VolumeHighIcon />} />}
          onClick={() => onSoundChange(!soundOn)}
        />
      </WithTooltip>
    </div>
  );
}
