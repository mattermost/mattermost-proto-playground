import { useState } from 'react';
import CloseIcon from '@mattermost/compass-icons/components/close';
import ChannelHeader from '@/components/ui/ChannelHeader/ChannelHeader';
import ChannelsSidebar from '@/components/ui/ChannelsSidebar/ChannelsSidebar';
import GlobalHeader from '@/components/ui/GlobalHeader/GlobalHeader';
import Icon from '@/components/ui/Icon/Icon';
import IconButton from '@/components/ui/IconButton/IconButton';
import MessageInput from '@/components/ui/MessageInput';
import MessageReactions from '@/components/ui/MessageReactions/MessageReactions';
import MessageSeparator from '@/components/ui/MessageSeparator/MessageSeparator';
import Message from '@/components/ui/Message/Message';
import TeamSidebar from '@/components/ui/TeamSidebar/TeamSidebar';
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
import avatarStaffTeam from '@/assets/avatars/Staff Team.png';
import styles from './messaging.specimen.module.scss';

export default function Layouts() {
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);

  return (
    <div className={styles.layouts}>
      <div className={styles['layouts__global-header']}>
        <GlobalHeader
          product="Channels"
          userAvatarSrc={avatarLeonard}
          userAvatarAlt="Leonard Riley"
        />
      </div>

      <div className={styles['layouts__body']}>
        <div className={styles['layouts__team-sidebar']}>
          <TeamSidebar
            activeTeamId="contributors"
            teams={[
              {
                id: 'contributors',
                name: 'Contributors',
                src: avatarStaffTeam,
              },
              { id: 'design', name: 'Design', initials: 'De', unread: true },
              { id: 'acme', name: 'Acme', initials: 'Ac', mentions: 3 },
            ]}
          />
        </div>

        <div className={styles['layouts__outer-panel']}>
          <div className={styles['layouts__channels-sidebar']}>
            <ChannelsSidebar
              teamName="Contributors"
              showFilter
              avatarAikoTan={avatarAikoTan}
              avatarArjunPatel={avatarArjunPatel}
              avatarDanielOkoro={avatarDanielle}
              avatarDariusCole={avatarDariusCole}
              avatarDavidLiang={avatarDavidLiang}
              avatarEmmaNovak={avatarEmmaNovak}
              avatarEthanBrooks={avatarEthanBrooks}
            />
          </div>

          <div className={styles['layouts__inner-panel']}>
            <div className={styles['layouts__center']}>
              <ChannelHeader
                type="Channel"
                name="Town Square"
                description="Company-wide announcements and general discussion."
                memberCount={124}
                pinnedCount={2}
                onInfoClick={() => setRightSidebarOpen((o) => !o)}
                infoToggled={rightSidebarOpen}
              />

              <div className={styles['layouts__messages']}>
                <MessageSeparator type="Date" label="Today" />

                <Message
                  avatarSrc={avatarSofia}
                  avatarAlt="Sofia Bauer"
                  username="Sofia Bauer"
                  timestamp="9:02 AM"
                >
                  <p className={styles['layouts__post-text']}>
                    Morning everyone! Reminder that the Q2 roadmap review is at
                    10:30 today. Agenda is in the thread below.
                  </p>
                </Message>

                <Message
                  avatarSrc={avatarMarco}
                  avatarAlt="Marco Rinaldi"
                  username="Marco Rinaldi"
                  timestamp="9:14 AM"
                >
                  <p className={styles['layouts__post-text']}>
                    Just pushed the updated onboarding flow to staging — would
                    love a second pair of eyes on the empty states before we cut
                    a release.
                  </p>
                </Message>

                <Message
                  avatarSrc={avatarDanielle}
                  avatarAlt="Mattermost"
                  username="Mattermost"
                  timestamp="9:20 AM"
                  isBot
                >
                  <p className={styles['layouts__post-text']}>
                    Build #2847 succeeded on <code>main</code>. Deploy to
                    staging completed in 3m 12s.
                  </p>
                </Message>

                <Message
                  avatarSrc={avatarAikoTan}
                  avatarAlt="Aiko Tan"
                  username="Aiko Tan"
                  timestamp="9:33 AM"
                >
                  <p className={styles['layouts__post-text']}>
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
                  <p className={styles['layouts__post-text']}>
                    Heads up — I'll be out Friday afternoon. If anything urgent
                    comes up with the ingest pipeline, ping Leila first.
                  </p>
                </Message>

                <MessageSeparator type="New Messages" />

                <Message
                  avatarSrc={avatarLeonard}
                  avatarAlt="Leonard Riley"
                  username="Leonard Riley"
                  timestamp="10:12 AM"
                >
                  <p className={styles['layouts__post-text']}>
                    Design review is bumped to 2:00 PM today — conflict with the
                    roadmap meeting. Same room.
                  </p>
                </Message>
              </div>

              <div className={styles['layouts__message-input']}>
                <MessageInput placeholder="Write to Town Square" />
              </div>
            </div>

            {rightSidebarOpen && (
              <aside className={styles['layouts__right-sidebar']}>
                <div className={styles['layouts__right-sidebar-header']}>
                  <span className={styles['layouts__right-sidebar-title']}>
                    Channel Info
                  </span>
                  <IconButton
                    size="Small"
                    aria-label="Close"
                    icon={<Icon size="16" glyph={<CloseIcon />} />}
                    onClick={() => setRightSidebarOpen(false)}
                  />
                </div>
                <div className={styles['layouts__right-sidebar-body']}>
                  <p className={styles['layouts__right-sidebar-placeholder']}>
                    Right sidebar placeholder. This panel is shown or hidden by
                    toggling the info button in the channel header.
                  </p>
                </div>
              </aside>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
