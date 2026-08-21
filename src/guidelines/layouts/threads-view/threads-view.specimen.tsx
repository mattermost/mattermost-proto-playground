import { useMemo, useState } from 'react';
import PlaylistCheckIcon from '@mattermost/compass-icons/components/playlist-check';
import { ChannelShell } from '@mattermost/compass-proto';
import { Icon } from '@mattermost/compass-ui';
import { IconButton } from '@mattermost/compass-ui';
import { MessageInput } from '@mattermost/compass-ui';
import { RightSidebarThread } from '@mattermost/compass-proto';
import {
  RightSidebarHeader,
  RightSidebar
} from '@mattermost/compass-ui';
import { Scrollbar } from '@mattermost/compass-ui';
import { Tabs } from '@mattermost/compass-ui';
import { ThreadListItem } from '@mattermost/compass-ui';
import type { ChannelsSidebarModel } from '@mattermost/compass-ui';
import { buildDefaultChannelsSidebarModel } from '@mattermost/compass-proto';
import { RIGHT_SIDEBAR_THREAD_DEMO_MESSAGES } from '@/fixtures/rightSidebarThreadDemo';
import avatarAikoTan from '@/assets/avatars/Aiko Tan.png';
import avatarArjunPatel from '@/assets/avatars/Arjun Patel.png';
import avatarDanielle from '@/assets/avatars/Danielle Okoro.png';
import avatarDariusCole from '@/assets/avatars/Darius Cole.png';
import avatarDavidLiang from '@/assets/avatars/David Liang.png';
import avatarEmmaNovak from '@/assets/avatars/Emma Novak.png';
import avatarEthanBrooks from '@/assets/avatars/Ethan Brooks.png';
import avatarLeonard from '@/assets/avatars/Leonard Riley.png';
import avatarMarco from '@/assets/avatars/Marco Rinaldi.png';
import avatarSofia from '@/assets/avatars/Sofia Bauer.png';
import { shellStyles } from '@mattermost/compass-proto';
import inboxStyles from './threads-view.specimen.module.scss';

type ThreadsTab = 'all' | 'unreads';

function buildThreadsChannelsSidebarModel(
  input: Parameters<typeof buildDefaultChannelsSidebarModel>[0],
): ChannelsSidebarModel {
  const base = buildDefaultChannelsSidebarModel(input);
  return {
    topGroupItems: base.topGroupItems.map((row) =>
      row.leadingVisual === 'Threads'
        ? { ...row, active: true }
        : { ...row, active: false },
    ),
    groups: base.groups.map((g) => ({
      ...g,
      items: g.items.map((row) => ({ ...row, active: false })),
    })),
  };
}

const PARTICIPANTS_A = [
  { key: '1', name: 'Leonard Riley', src: avatarLeonard },
  { key: '2', name: 'Aiko Tan', src: avatarAikoTan },
  { key: '3', name: 'Marco Rinaldi', src: avatarMarco },
];

const PARTICIPANTS_B = [
  { key: '1', name: 'Sofia Bauer', src: avatarSofia },
  { key: '2', name: 'Arjun Patel', src: avatarArjunPatel },
  { key: '3', name: 'Danielle Okoro', src: avatarDanielle },
];

export default function ThreadsViewLayout() {
  const [tab, setTab] = useState<ThreadsTab>('unreads');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const channelsModel = useMemo(
    () =>
      buildThreadsChannelsSidebarModel({
        showUnreadsCategory: false,
        avatarAikoTan,
        avatarArjunPatel,
        avatarDanielleOkoro: avatarDanielle,
        avatarDariusCole,
        avatarDavidLiang,
        avatarEmmaNovak,
        avatarEthanBrooks,
      }),
    [],
  );

  return (
    <ChannelShell
      channelsSidebarModel={channelsModel}
      innerContent={
        <div className={inboxStyles['threads-view__split']}>
          <div className={inboxStyles['threads-view__inbox']}>
            <header className={inboxStyles['threads-view__tabs']}>
              <Tabs
                className={inboxStyles['threads-view__tabs-strip']}
                tabs={[
                  { key: 'all', label: 'All your threads' },
                  { key: 'unreads', label: 'Unreads' },
                ]}
                activeKey={tab}
                onChange={(key: string) => {
                  if (key === 'all' || key === 'unreads') {
                    setTab(key);
                    setSelectedIndex(0);
                  }
                }}
                controls={
                  <IconButton
                    aria-label="Mark all as read"
                    size="Small"
                    style="Default"
                    padding="Compact"
                    icon={<Icon size="16" glyph={<PlaylistCheckIcon />} />}
                  />
                }
              />
            </header>

            <div className={inboxStyles['threads-view__list']}>
              <Scrollbar>
                <div className={inboxStyles['threads-view__list-inner']}>
                  <ThreadListItem
                    active={selectedIndex === 0}
                    badge="None"
                    authorName="Leonard Riley"
                    channelLabel="UX DESIGN"
                    previewText="Nulla tincidunt eu viverra ultrices vitae enim pharetra in. Neque massa eu commodo elementum congue…"
                    timestamp="5 mins ago"
                    replyCount={3}
                    participants={PARTICIPANTS_A}
                    onClick={() => setSelectedIndex(0)}
                  />
                  <ThreadListItem
                    active={selectedIndex === 1}
                    badge="Unread"
                    authorName="Pauline Burton"
                    channelLabel="ENTERPRISE TEAM"
                    previewText="Tristique lorem est facilisis sed est felis. Ut viverra semper suspendisse lacus mauris dui, sit aliquet nam."
                    timestamp="5 mins ago"
                    replyCount={3}
                    participants={PARTICIPANTS_B}
                    onClick={() => setSelectedIndex(1)}
                  />
                  <ThreadListItem
                    active={selectedIndex === 2}
                    badge="Unread"
                    authorName="Jenny Ball"
                    channelLabel="DESIGN TEAM"
                    previewText="Sed semper scelerisque sit sollicitudin donec nunc, elit at. Maecenas ac sed morbi lectus dolor quis lacus."
                    timestamp="5 mins ago"
                    replyCount={3}
                    onClick={() => setSelectedIndex(2)}
                  />
                  <ThreadListItem
                    active={selectedIndex === 3}
                    badge="Unread"
                    authorName="Martin Newman"
                    channelLabel="MOBILE TEAM"
                    previewText="Tortor quis auctor vel lacus leo, commodo porttitor sit. Diam amet imperdiet arcu sed quis elementum."
                    timestamp="5 mins ago"
                    replyCount={3}
                    onClick={() => setSelectedIndex(3)}
                  />
                  {tab === 'all' && (
                    <>
                      <ThreadListItem
                        active={selectedIndex === 4}
                        badge="None"
                        authorName="Emma Novak"
                        channelLabel="DEVELOPERS"
                        previewText="Ship checklist is updated for the release candidate — please confirm your sections by EOD."
                        timestamp="Yesterday"
                        replyCount={1}
                        participants={[
                          { key: 'e', name: 'Emma Novak', src: avatarEmmaNovak },
                        ]}
                        onClick={() => setSelectedIndex(4)}
                      />
                      <ThreadListItem
                        active={selectedIndex === 5}
                        badge="None"
                        authorName="Ethan Brooks"
                        channelLabel="TOWN SQUARE"
                        previewText="Recording from the town hall is pinned in the channel header for anyone who missed it."
                        timestamp="Mon"
                        replyCount={12}
                        participants={[
                          { key: 'e', name: 'Ethan Brooks', src: avatarEthanBrooks },
                          { key: 'd', name: 'David Liang', src: avatarDavidLiang },
                        ]}
                        onClick={() => setSelectedIndex(5)}
                      />
                    </>
                  )}
                </div>
              </Scrollbar>
            </div>
          </div>

          <RightSidebar
            fill
            alignBody="end"
            className={[
              shellStyles['channel-shell__right-sidebar'],
              shellStyles['channel-shell__right-sidebar--fill'],
            ].join(' ')}
            header={
              <RightSidebarHeader
                title="Thread"
                secondaryTitle="UX Design"
                actionLabel="Following"
                actionActive
              />
            }
            footer={
              <div className={shellStyles['channel-shell__message-input']}>
                <MessageInput
                  placeholder="Reply to thread…"
                  width="narrow"
                />
              </div>
            }
          >
            <RightSidebarThread messages={RIGHT_SIDEBAR_THREAD_DEMO_MESSAGES} />
          </RightSidebar>
        </div>
      }
    />
  );
}
