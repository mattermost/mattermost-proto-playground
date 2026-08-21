import { ChannelHeader } from '@mattermost/compass-ui';
import { ChannelShell } from '@mattermost/compass-proto';
import { defaultChannelsSidebarDemoModel } from '@/fixtures/channelsSidebarDemo';
import { MessageInput } from '@mattermost/compass-ui';
import { MessageReactions } from '@mattermost/compass-ui';
import { MessageSeparator } from '@mattermost/compass-ui';
import { Message } from '@mattermost/compass-ui';
import { RightSidebarChannelInfo } from '@mattermost/compass-proto';
import {
  RightSidebarHeader,
  RightSidebar
} from '@mattermost/compass-ui';
import { Scrollbar } from '@mattermost/compass-ui';
import avatarAikoTan from '@/assets/avatars/Aiko Tan.png';
import avatarArjunPatel from '@/assets/avatars/Arjun Patel.png';
import avatarDanielle from '@/assets/avatars/Danielle Okoro.png';
import avatarLeonard from '@/assets/avatars/Leonard Riley.png';
import avatarMarco from '@/assets/avatars/Marco Rinaldi.png';
import avatarSofia from '@/assets/avatars/Sofia Bauer.png';
import { shellStyles } from '@mattermost/compass-proto';

export default function ChannelInfoLayout() {
  return (
    <ChannelShell
      channelsSidebarModel={defaultChannelsSidebarDemoModel}
      channelHeader={
        <ChannelHeader
          type="Channel"
          name="Town Square"
          description="Company-wide announcements and general discussion."
          memberCount={124}
          pinnedCount={2}
          onInfoClick={() => {}}
          infoToggled
        />
      }
      trailing={
        <RightSidebar
          className={shellStyles['channel-shell__right-sidebar']}
          header={
            <RightSidebarHeader
              title="Channel Info"
              secondaryTitle="Town Square"
              onExpand={() => {}}
              onClose={() => {}}
            />
          }
        >
          <RightSidebarChannelInfo />
        </RightSidebar>
      }
    >
      <>
        <div className={shellStyles['channel-shell__messages']}>
          <Scrollbar>
            <div className={shellStyles['channel-shell__messages-list']}>
              <MessageSeparator type="Date" label="Today" />

              <Message
                avatarSrc={avatarSofia}
                avatarAlt="Sofia Bauer"
                username="Sofia Bauer"
                timestamp="9:02 AM"
              >
                <p className={shellStyles['channel-shell__post-text']}>
                  Morning everyone! Reminder that the Q2 roadmap review is at 10:30
                  today. Agenda is in the thread below.
                </p>
              </Message>

              <Message
                avatarSrc={avatarMarco}
                avatarAlt="Marco Rinaldi"
                username="Marco Rinaldi"
                timestamp="9:14 AM"
              >
                <p className={shellStyles['channel-shell__post-text']}>
                  Just pushed the updated onboarding flow to staging — would love a
                  second pair of eyes on the empty states before we cut a release.
                </p>
              </Message>

              <Message
                avatarSrc={avatarDanielle}
                avatarAlt="Mattermost"
                username="Mattermost"
                timestamp="9:20 AM"
                isBot
              >
                <p className={shellStyles['channel-shell__post-text']}>
                  Build #2847 succeeded on <code>main</code>. Deploy to staging
                  completed in 3m 12s.
                </p>
              </Message>

              <Message
                avatarSrc={avatarAikoTan}
                avatarAlt="Aiko Tan"
                username="Aiko Tan"
                timestamp="9:33 AM"
              >
                <p className={shellStyles['channel-shell__post-text']}>
                  Nice work Marco 🎉 I can take a pass after standup. The new
                  illustrations really tie the whole flow together.
                </p>
                <MessageReactions
                  reactions={[
                    { emoji: '🎉', count: 4, byCurrentUser: true },
                    { emoji: '👀', count: 2 },
                  ]}
                  showAddReaction
                />
              </Message>

              <Message
                avatarSrc={avatarArjunPatel}
                avatarAlt="Arjun Patel"
                username="Arjun Patel"
                timestamp="9:47 AM"
              >
                <p className={shellStyles['channel-shell__post-text']}>
                  Heads up — I'll be out Friday afternoon. If anything urgent comes
                  up with the ingest pipeline, ping Leila first.
                </p>
              </Message>

              <MessageSeparator type="New Messages" />

              <Message
                avatarSrc={avatarLeonard}
                avatarAlt="Leonard Riley"
                username="Leonard Riley"
                timestamp="10:12 AM"
              >
                <p className={shellStyles['channel-shell__post-text']}>
                  Design review is bumped to 2:00 PM today — conflict with the roadmap
                  meeting. Same room.
                </p>
              </Message>
            </div>
          </Scrollbar>
        </div>

        <div className={shellStyles['channel-shell__message-input']}>
          <MessageInput placeholder="Write to Town Square" />
        </div>
      </>
    </ChannelShell>
  );
}
