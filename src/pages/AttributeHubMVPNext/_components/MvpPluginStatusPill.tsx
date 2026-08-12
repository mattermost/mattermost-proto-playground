import CheckCircleIcon from '@mattermost/compass-icons/components/check-circle';
import AlertCircleOutlineIcon from '@mattermost/compass-icons/components/alert-circle-outline';
import Chip from '@/components/ui/Chip/Chip';
import { pluginStatusLabel, type PluginStatus } from './mvpTerms';

export interface MvpPluginStatusPillProps {
  status: PluginStatus;
  size?: 'Small' | 'Medium';
}

/** Whether the plugin is connected for this attribute. */
export default function MvpPluginStatusPill({
  status,
  size = 'Small',
}: MvpPluginStatusPillProps) {
  return (
    <Chip
      size={size}
      tone={status === 'active' ? 'success' : 'danger'}
      leadingIcon={
        status === 'active' ? (
          <CheckCircleIcon />
        ) : (
          <AlertCircleOutlineIcon />
        )
      }
    >
      {pluginStatusLabel(status)}
    </Chip>
  );
}
