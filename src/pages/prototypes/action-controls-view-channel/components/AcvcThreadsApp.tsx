import { useMemo, useState } from 'react';
import PlaylistCheckIcon from '@mattermost/compass-icons/components/playlist-check';
import { ChannelsSidebar } from '@mattermost/compass-ui/components/channels-sidebar';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { IconButton } from '@mattermost/compass-ui/components/icon-button';
import {
  RightSidebarHeader,
} from '@mattermost/compass-ui/components/right-sidebar-header';
import { Scrollbar } from '@mattermost/compass-ui/components/scrollbar';
import { Tabs } from '@mattermost/compass-ui/components/tabs';
import { ThreadListItem } from '@mattermost/compass-ui/components/thread-list-item';
import {
  ChannelShell,
  MessageInput,
  RightSidebar,
  RightSidebarThread,
  messageStyles,
  shellStyles,
} from '@mattermost/compass-proto';
import avatarAikoTan from '@/assets/avatars/Aiko Tan.png';
import avatarMarco from '@/assets/avatars/Marco Rinaldi.png';
import avatarSofia from '@/assets/avatars/Sofia Bauer.png';
import {
  DEFAULT_DM,
  RESTRICTED_CHANNEL,
  buildSidebarModel,
} from '../channelData';
import { canPostOn, type SessionView } from '../sessionModel';
import AcvcReadOnlyComposer from './AcvcReadOnlyComposer';
import styles from './AcvcThreadsApp.module.scss';

type ThreadsTab = 'all' | 'unreads';

const THREADS = [
  {
    id: 'watchfloor',
    channel: RESTRICTED_CHANNEL,
    author: 'Sofia Bauer',
    preview:
      'Watch turnover complete. Night shift handed over three open items — all logged in the tracker.',
    timestamp: '8 mins ago',
    replyCount: 2,
    participants: [
      { key: 's', name: 'Sofia Bauer', src: avatarSofia },
      { key: 'm', name: 'Marco Rinaldi', src: avatarMarco },
      { key: 'a', name: 'Aiko Tan', src: avatarAikoTan },
    ],
    messages: [
      {
        avatarSrc: avatarSofia,
        avatarAlt: 'Sofia Bauer',
        username: 'Sofia Bauer',
        timestamp: 'Today at 8:12 AM',
        body: (
          <p className={messageStyles['message__body-text']}>
            Watch turnover complete. Night shift handed over three open items —
            all logged in the tracker.
          </p>
        ),
      },
      {
        avatarSrc: avatarMarco,
        avatarAlt: 'Marco Rinaldi',
        username: 'Marco Rinaldi',
        timestamp: 'Today at 8:31 AM',
        body: (
          <p className={messageStyles['message__body-text']}>
            Sensor feed on the eastern array came back up at 07:50. No data gap
            on our side.
          </p>
        ),
      },
      {
        avatarSrc: avatarAikoTan,
        avatarAlt: 'Aiko Tan',
        username: 'Aiko Tan',
        timestamp: 'Today at 8:44 AM',
        body: (
          <p className={messageStyles['message__body-text']}>
            Confirmed. I will fold that into the morning summary before the 0900
            brief.
          </p>
        ),
      },
    ],
  },
  {
    id: 'town',
    channel: 'Town Square',
    author: 'Sofia Bauer',
    preview:
      'Morning everyone. Reminder that the quarterly roadmap review is at 10:30 today.',
    timestamp: '12 mins ago',
    replyCount: 1,
    participants: [{ key: 's', name: 'Sofia Bauer', src: avatarSofia }],
    messages: [
      {
        avatarSrc: avatarSofia,
        avatarAlt: 'Sofia Bauer',
        username: 'Sofia Bauer',
        timestamp: 'Today at 9:02 AM',
        body: (
          <p className={messageStyles['message__body-text']}>
            Morning everyone. Reminder that the quarterly roadmap review is at
            10:30 today.
          </p>
        ),
      },
    ],
  },
  {
    id: 'dm',
    channel: DEFAULT_DM,
    author: 'Aiko Tan',
    preview:
      'Got the shift notes — I will ping you if anything in the tracker needs a second pair of eyes.',
    timestamp: '4 mins ago',
    replyCount: 0,
    participants: [{ key: 'a', name: 'Aiko Tan', src: avatarAikoTan }],
    messages: [
      {
        avatarSrc: avatarAikoTan,
        avatarAlt: 'Aiko Tan',
        username: 'Aiko Tan',
        timestamp: 'Today at 10:14 AM',
        body: (
          <p className={messageStyles['message__body-text']}>
            Got the shift notes — I will ping you if anything in the tracker
            needs a second pair of eyes.
          </p>
        ),
      },
    ],
  },
] as const;

export default function AcvcThreadsApp({ session }: { session: SessionView }) {
  const [tab, setTab] = useState<ThreadsTab>('all');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { state, channelInSidebar, includeChannels, openChannel } = session;

  const sidebarModel = useMemo(
    () =>
      buildSidebarModel({
        activeChannelName: 'Threads',
        includeChannels,
        restrictedState: channelInSidebar
          ? state.pendingMentions > 0
            ? 'mention'
            : 'read'
          : undefined,
        restrictedMentionCount: state.pendingMentions || undefined,
        onItemClick: openChannel,
      }),
    [
      includeChannels,
      channelInSidebar,
      state.pendingMentions,
      openChannel,
    ],
  );

  const visibleThreads =
    tab === 'all' ? THREADS : THREADS.filter((thread) => thread.id !== 'town');
  const selected = visibleThreads[selectedIndex] ?? visibleThreads[0];
  const replyReadOnly = selected
    ? !canPostOn(
        state.ctx,
        selected.channel,
        state.viewChannelCoverage,
        state.createPostCoverage,
      )
    : false;

  return (
    <div className={styles['threads-app']}>
      <ChannelShell
        channelsSidebar={
          <ChannelsSidebar
            teamName="Contributors"
            activeChannelName="Threads"
            onItemClick={openChannel}
            model={sidebarModel}
          />
        }
        innerContent={
          <div className={styles['threads-app__split']}>
            <div className={styles['threads-app__inbox']}>
              <header className={styles['threads-app__tabs']}>
                <Tabs
                  className={styles['threads-app__tabs-strip']}
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
                      size="small"
                      style="default"
                      padding="compact"
                      icon={<Icon size="16" glyph={<PlaylistCheckIcon />} />}
                    />
                  }
                />
              </header>
              <div className={styles['threads-app__list']}>
                <Scrollbar>
                  <div className={styles['threads-app__list-inner']}>
                    {visibleThreads.map((thread, index) => (
                      <ThreadListItem
                        key={thread.id}
                        active={index === selectedIndex}
                        badge={thread.id === 'watchfloor' ? 'unread' : 'none'}
                        authorName={thread.author}
                        channelLabel={thread.channel}
                        previewText={thread.preview}
                        timestamp={thread.timestamp}
                        replyCount={thread.replyCount}
                        participants={[...thread.participants]}
                        onClick={() => setSelectedIndex(index)}
                      />
                    ))}
                  </div>
                </Scrollbar>
              </div>
            </div>
            {selected ? (
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
                    secondaryTitle={selected.channel}
                    actionLabel="Following"
                    actionActive
                  />
                }
                footer={
                  <div className={shellStyles['channel-shell__message-input']}>
                    {replyReadOnly ? (
                      <AcvcReadOnlyComposer />
                    ) : (
                      <MessageInput
                        placeholder="Reply to thread…"
                        width="narrow"
                      />
                    )}
                  </div>
                }
              >
                <RightSidebarThread
                  messages={[...selected.messages]}
                  replySeparatorLabel={
                    selected.replyCount === 1
                      ? '1 reply'
                      : `${selected.replyCount} replies`
                  }
                />
              </RightSidebar>
            ) : null}
          </div>
        }
      />
    </div>
  );
}
