import type { ReactNode } from 'react';
import { ChannelHeader } from '@mattermost/compass-ui/components/channel-header';
import { ChannelShell } from '@mattermost/compass-proto';
import { externalCallParticipantsChannelsSidebarModel } from './channelsSidebar.model';

export interface ExternalCallChannelsShellProps {
  children: ReactNode;
  floating?: ReactNode;
  overlay?: ReactNode;
}

export default function ExternalCallChannelsShell({
  children,
  floating,
  overlay,
}: ExternalCallChannelsShellProps) {
  return (
    <ChannelShell
      channelsSidebarModel={externalCallParticipantsChannelsSidebarModel}
      channelHeader={
        <ChannelHeader
          type="channel"
          name="UX Design"
          description="Design reviews and ongoing work."
          memberCount={24}
          pinnedCount={2}
        />
      }
      floating={floating}
      overlay={overlay}
    >
      {children}
    </ChannelShell>
  );
}
