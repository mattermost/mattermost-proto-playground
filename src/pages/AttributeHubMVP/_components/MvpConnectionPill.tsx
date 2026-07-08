import CheckCircleIcon from '@mattermost/compass-icons/components/check-circle';
import AlertCircleOutlineIcon from '@mattermost/compass-icons/components/alert-circle-outline';
import Chip from '@/components/ui/Chip/Chip';
import { connectionLabel, type ConnectionStatus } from './mvpTerms';

export interface MvpConnectionPillProps {
  status: ConnectionStatus;
  size?: 'Small' | 'Medium';
}

/**
 * Connection-health pill (build brief §External source). Sync status is reduced
 * to connected / broken — no sync-time / "Stale" language. State is text +
 * color + a distinct glyph, never color alone.
 */
export default function MvpConnectionPill({
  status,
  size = 'Small',
}: MvpConnectionPillProps) {
  return (
    <Chip
      size={size}
      tone={status === 'connected' ? 'success' : 'danger'}
      leadingIcon={
        status === 'connected' ? (
          <CheckCircleIcon />
        ) : (
          <AlertCircleOutlineIcon />
        )
      }
    >
      {connectionLabel(status)}
    </Chip>
  );
}
