import type { ReactNode } from 'react';
import { ChannelShell, ChannelHeader } from '@mattermost/compass-proto';
import { externalCallParticipantsChannelsSidebarModel } from './channelsSidebar.model';
import styles from './ExternalCallParticipantsLayout.module.scss';

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
    <div className={styles.stage}>
      <div className={styles['stage__frame']}>
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
      </div>
    </div>
  );
}
