import { useState } from 'react';
import EMModalShell, { type EMTab } from '../_components/EMModalShell';
import MyChannelsTab from './MyChannelsTab';

export interface EMChannelsProps {
  /** Called when the EM modal is dismissed. */
  onClose: () => void;
  /** Called when the user clicks "Create Program-Protected Channel". */
  onCreateChannel: () => void;
  /** Called when the user clicks "Manage" on a channel row. */
  onManageChannel: (channelName: string) => void;
  /** Called when the user switches back to the Configurations tab. */
  onNavigateConfigurations: () => void;
}

/**
 * State 3 — EM modal open on the My Channels tab.
 */
export default function EMChannels({
  onClose,
  onCreateChannel,
  onManageChannel,
  onNavigateConfigurations,
}: EMChannelsProps) {
  const [tab, setTab] = useState<EMTab>('channels');

  return (
    <EMModalShell
      activeTab={tab}
      onTabChange={(next) => {
        setTab(next);
        if (next === 'configurations') onNavigateConfigurations();
      }}
      onClose={onClose}
    >
      <MyChannelsTab
        onCreateChannel={onCreateChannel}
        onManageChannel={onManageChannel}
      />
    </EMModalShell>
  );
}
