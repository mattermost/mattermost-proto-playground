import PhoneIcon from '@mattermost/compass-icons/components/phone';
import VideoOutlineIcon from '@mattermost/compass-icons/components/video-outline';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { IconButton } from '@mattermost/compass-ui/components/icon-button';
import type { CallFeatures } from '@/types/videoCall';

export interface FeatureTogglesProps {
  features: CallFeatures;
  onChange: (next: Partial<CallFeatures>) => void;
}

/**
 * Prototype chrome (not product UI): the two server settings that decide how
 * a conversation can be called. Video off gives today's audio-only calls
 * plugin; phone on adds outbound phone calling to the DM Start call menu.
 */
export default function FeatureToggles({
  features,
  onChange,
}: FeatureTogglesProps) {
  return (
    <div role="group" aria-label="Server call settings">
      <IconButton
        size="x-small"
        aria-label="Video calls"
        title={features.video ? 'Video calls on' : 'Video calls off'}
        toggled={features.video}
        icon={<Icon size="12" glyph={<VideoOutlineIcon />} />}
        onClick={() => onChange({ video: !features.video })}
      />
      <IconButton
        size="x-small"
        aria-label="Phone calls"
        title={features.phone ? 'Phone calls on' : 'Phone calls off'}
        toggled={features.phone}
        icon={<Icon size="12" glyph={<PhoneIcon />} />}
        onClick={() => onChange({ phone: !features.phone })}
      />
    </div>
  );
}
