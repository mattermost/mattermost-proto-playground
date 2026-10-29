import { PAYFORGE_ALERT_SNAPSHOT } from '../../agentsData';
import ChannelsHome from './ChannelsHome';

/** Pre-seeded snapshot of #service-status after the PayForge alert has fired. */
export default function ChannelsHomeAlert({ onNavigateToIncident }: { onNavigateToIncident?: () => void }) {
  return <ChannelsHome initialSnapshot={PAYFORGE_ALERT_SNAPSHOT} onNavigateToIncident={onNavigateToIncident} />;
}
