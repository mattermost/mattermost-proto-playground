import { useState } from 'react';
import { ChannelsSidebar } from '@mattermost/compass-ui/components/channels-sidebar';
import { EmptyState } from '@mattermost/compass-ui/components/empty-state';
import {
  ChannelHeader,
  ChannelShell,
  MessageInput,
  shellStyles,
} from '@mattermost/compass-proto';
import NoChannelsSvg from '@/assets/illustrations/threads-empty.svg?react';
import AcvcMessages from './AcvcMessages';
import { buildSidebarModel } from '../channelData';
import AcvcNoAccessSidebar from './AcvcNoAccessSidebar';
import type { SessionView } from '../sessionModel';
import styles from './AcvcNoAccessApp.module.scss';

const DEFAULT_CHANNEL = 'Town Square';

const CHANNEL_META = {
  'Town Square': {
    type: 'channel' as const,
    description: 'Company-wide announcements and general discussion.',
    members: 124,
    pinned: 2,
  },
};

export interface AcvcNoAccessAppProps {
  session: SessionView;
}

/**
 * Workspace-wide Read Channel denial: every channel and DM is withheld from
 * this session, so the sidebar is empty and the centre explains the boundary.
 */
export default function AcvcNoAccessApp({ session }: AcvcNoAccessAppProps) {
  const { canRead, openChannel } = session;
  const [activeChannel, setActiveChannel] = useState(DEFAULT_CHANNEL);

  const handleOpenChannel = (name: string) => {
    setActiveChannel(name);
    openChannel(name);
  };

  if (!canRead) {
    return (
      <div className={styles['acvc-no-access-app']}>
        <ChannelShell
          channelsSidebar={<AcvcNoAccessSidebar />}
        >
          <div
            className={styles['acvc-no-access-app__centre']}
            role="status"
            tabIndex={-1}
          >
            <EmptyState
              illustration={{
                children: <NoChannelsSvg />,
                width: '200px',
                'aria-label': '',
              }}
              title="You do not have access to any channels"
              description="Contact your system administrator if you believe this is an error."
            />
          </div>
        </ChannelShell>
      </div>
    );
  }

  const meta = CHANNEL_META[DEFAULT_CHANNEL as keyof typeof CHANNEL_META];

  return (
    <div className={styles['acvc-no-access-app']}>
      <ChannelShell
        channelsSidebar={
          <ChannelsSidebar
            teamName="Contributors"
            activeChannelName={activeChannel}
            onItemClick={handleOpenChannel}
            model={buildSidebarModel({
              activeChannelName: activeChannel,
              onItemClick: handleOpenChannel,
            })}
          />
        }
        channelHeader={
          <ChannelHeader
            type={meta.type}
            name={activeChannel}
            description={meta.description}
            memberCount={meta.members}
            pinnedCount={meta.pinned}
          />
        }
      >
        <AcvcMessages variant="general" />
        <div className={shellStyles['channel-shell__message-input']}>
          <MessageInput placeholder={`Write to ${activeChannel}`} />
        </div>
      </ChannelShell>
    </div>
  );
}
