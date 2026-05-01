import React, { useState } from 'react';
import Button from '@/components/ui/Button/Button';
import ChannelHeader from '@/components/ui/ChannelHeader/ChannelHeader';
import GlobalHeader from '@/components/ui/GlobalHeader/GlobalHeader';
import MessageInput from '@/components/ui/MessageInput';
import TextInput from '@/components/ui/TextInput/TextInput';
import { Modal } from '@/components/ui/Modal';
import Post from '@/components/ui/Post/Post';
import Divider from '@/components/ui/Divider/Divider';
import ChannelsSidebar from '@/components/ui/ChannelsSidebar/ChannelsSidebar';
import TeamSidebar from '@/components/ui/TeamSidebar/TeamSidebar';
import ProfilePopover from '@/components/ui/ProfilePopover/ProfilePopover';
import CallWidget from '@/components/ui/CallWidget';
import RightSidebar from '@/components/ui/RightSidebar';
import RightSidebarHeader from '@/components/ui/RightSidebarHeader';
import UserAvatar from '@/components/ui/UserAvatar/UserAvatar';
import ActionButton from '@/components/ui/ActionButton/ActionButton';
import MenuItem from '@/components/ui/MenuItem/MenuItem';
import Icon from '@/components/ui/Icon/Icon';
import StarOutlineIcon from '@mattermost/compass-icons/components/star-outline';
import BellOutlineIcon from '@mattermost/compass-icons/components/bell-outline';
import AccountPlusOutlineIcon from '@mattermost/compass-icons/components/account-plus-outline';
import LinkVariantIcon from '@mattermost/compass-icons/components/link-variant';
import CogOutlineIcon from '@mattermost/compass-icons/components/cog-outline';
import AccountMultipleOutlineIcon from '@mattermost/compass-icons/components/account-multiple-outline';
import PinOutlineIcon from '@mattermost/compass-icons/components/pin-outline';
import FileTextOutlineIcon from '@mattermost/compass-icons/components/file-text-outline';
import avatarStaffTeam from '@/assets/avatars/Staff Team.png';
import avatarAikoTan from '@/assets/avatars/Aiko Tan.png';
import avatarLeonard from '@/assets/avatars/Leonard Riley.png';
import avatarDanielle from '@/assets/avatars/Danielle Okoro.png';
import avatarArjunPatel from '@/assets/avatars/Arjun Patel.png';
import avatarDariusCole from '@/assets/avatars/Darius Cole.png';
import avatarDavidLiang from '@/assets/avatars/David Liang.png';
import avatarEmmaNovak from '@/assets/avatars/Emma Novak.png';
import avatarEthanBrooks from '@/assets/avatars/Ethan Brooks.png';
import type { Participant } from '@/types/callParticipant';
import styles from './Patterns.module.scss';

const REMAINING_PATTERNS: string[] = [];

// ── Modal demo ────────────────────────────────────────────────────────────────

const modalFooter = (
  <>
    <Button emphasis="Tertiary">Cancel</Button>
    <Button destructive>Delete Channel</Button>
  </>
);

const modalBody = (
  <div className={styles['patterns__modal-body-content']}>
    <p className={styles['patterns__body-text']}>
      This will permanently delete <strong>#design</strong> and all its
      messages. Members will lose access immediately. This action cannot be
      undone.
    </p>
    <TextInput label='Type "design" to confirm' placeholder="design" />
  </div>
);

function ModalCanvas({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles['patterns__modal-canvas']}>
      <div className={styles['patterns__modal-overlay']}>{children}</div>
    </div>
  );
}

function ModalDemo() {
  return (
    <div className={styles['patterns__modal-variants']}>
      <div>
        <p className={styles['patterns__variant-label']}>With dividers</p>
        <ModalCanvas>
          <Modal title="Delete Channel" size="Small" footer={modalFooter}>
            {modalBody}
          </Modal>
        </ModalCanvas>
      </div>
      <div>
        <p className={styles['patterns__variant-label']}>Without dividers</p>
        <ModalCanvas>
          <Modal
            title="Delete Channel"
            size="Small"
            headerDivider={false}
            footerDivider={false}
            footer={modalFooter}
          >
            {modalBody}
          </Modal>
        </ModalCanvas>
      </div>
    </div>
  );
}

// ── Call Widget demo ───────────────────────────────────────────────────────

const callWidgetParticipants: Participant[] = [
  {
    id: '1',
    name: 'Leonard Riley',
    avatarSrc: avatarLeonard,
    host: true,
    talking: true,
  },
  { id: '2', name: 'Aiko Tan', avatarSrc: avatarAikoTan },
  { id: '3', name: 'Arjun Patel', avatarSrc: avatarArjunPatel, muted: true },
];

function CallWidgetDemo() {
  const [overlay, setOverlay] = useState<
    'menu' | 'info' | 'participants' | null
  >(null);
  const [muted, setMuted] = useState(false);
  const [handRaised, setHandRaised] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [externalEnabled, setExternalEnabled] = useState(true);

  return (
    <div className={styles['patterns__call-widget-demo']}>
      <p className={styles['patterns__variant-label']}>
        Active call (interactive)
      </p>
      <CallWidget
        participants={callWidgetParticipants}
        currentUserId="1"
        talkerName="Leonard Riley"
        talkerAvatarSrc={avatarLeonard}
        channelName="op-nightingale"
        muted={muted}
        onToggleMute={() => setMuted((m) => !m)}
        handRaised={handRaised}
        onToggleHand={() => setHandRaised((h) => !h)}
        sharing={sharing}
        onToggleShare={() => setSharing((s) => !s)}
        onExpand={() => {}}
        onLeave={() => {}}
        overlay={overlay}
        onToggleMenu={() => setOverlay((o) => (o === 'menu' ? null : 'menu'))}
        onToggleParticipants={() =>
          setOverlay((o) => (o === 'participants' ? null : 'participants'))
        }
        onOpenCallInfo={() => setOverlay('info')}
        onCloseCallInfo={() => setOverlay(null)}
        externalEnabled={externalEnabled}
        onExternalEnabledChange={setExternalEnabled}
        internalLink="https://mattermost.example.com/team/pl/join/abc123"
        externalLink="https://guest.example.com/xyz"
        dialInNumber="+1 669 555 0100"
        dialInPin="123 456"
      />
    </div>
  );
}

// ── Channel Info body (Right Sidebar demo) ───────────────────────────────────

function ChannelInfoBody() {
  return (
    <>
      <div className={styles['patterns__rsb-info-actions']}>
        <ActionButton
          className={styles['patterns__rsb-info-action']}
          icon={<Icon size="20" glyph={<StarOutlineIcon />} />}
          label="Favorite"
        />
        <ActionButton
          className={styles['patterns__rsb-info-action']}
          icon={<Icon size="20" glyph={<BellOutlineIcon />} />}
          label="Mute"
        />
        <ActionButton
          className={styles['patterns__rsb-info-action']}
          icon={<Icon size="20" glyph={<AccountPlusOutlineIcon />} />}
          label="Add people"
        />
        <ActionButton
          className={styles['patterns__rsb-info-action']}
          icon={<Icon size="20" glyph={<LinkVariantIcon />} />}
          label="Copy Link"
        />
      </div>

      <div className={styles['patterns__rsb-info-about']}>
        <h3 className={styles['patterns__rsb-info-name']}>UX Design</h3>

        <div className={styles['patterns__rsb-info-group']}>
          <span className={styles['patterns__rsb-info-group-title']}>
            Channel Purpose
          </span>
          <p className={styles['patterns__rsb-info-body-text']}>
            Discussion of UX by core contributors and staff.
          </p>
        </div>

        <div className={styles['patterns__rsb-info-group']}>
          <span className={styles['patterns__rsb-info-group-title']}>
            Channel Header
          </span>
          <p className={styles['patterns__rsb-info-header-text']}>
            <a href="#">Spec Template</a>
            {' | '}
            <a href="#">UX Guidelines</a>
            {' | '}
            <a href="#">UX Scratch</a>
            {' | '}
            <a href="#">(Internal) UX Folder</a>
            {' | '}
            <a href="#">Design Checklist</a>
            {' | '}
            <a href="#">Design Checklist</a>
            {' | '}
            <a href="#">Design Meeting Notes</a>
            {' | '}
            <a href="#">OKRs…</a>{' '}
            <a href="#" className={styles['patterns__rsb-info-more']}>
              More
            </a>
          </p>
        </div>

        <p className={styles['patterns__rsb-info-id']}>
          ID: ggq4jzr8o386bpqytigtswjfr
        </p>
      </div>

      <Divider />

      <nav className={styles['patterns__rsb-info-menu']}>
        <MenuItem
          label="Channel Settings"
          leadingVisual={<Icon size="16" glyph={<CogOutlineIcon />} />}
        />
        <MenuItem
          label="Notification Preferences"
          leadingVisual={<Icon size="16" glyph={<BellOutlineIcon />} />}
        />
        <MenuItem
          label="Members"
          leadingVisual={
            <Icon size="16" glyph={<AccountMultipleOutlineIcon />} />
          }
        />
        <MenuItem
          label="Pinned Messages"
          leadingVisual={<Icon size="16" glyph={<PinOutlineIcon />} />}
        />
        <MenuItem
          label="Files"
          leadingVisual={<Icon size="16" glyph={<FileTextOutlineIcon />} />}
        />
      </nav>
    </>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function Patterns() {
  return (
    <div className={styles.patterns}>
      <header className={styles['patterns__header']}>
        <h1 className={styles['patterns__heading']}>Patterns</h1>
        <p className={styles['patterns__subheading']}>
          Larger UI compositions assembled from base components.
        </p>
      </header>

      <section className={styles['patterns__section']}>
        <h2 className={styles['patterns__section-title']}>Modal</h2>
        <ModalDemo />
      </section>

      <section className={styles['patterns__section']}>
        <h2 className={styles['patterns__section-title']}>Global Header</h2>
        <div className={styles['patterns__global-header-demo']}>
          <p className={styles['patterns__variant-label']}>Channels</p>
          <GlobalHeader
            product="Channels"
            userAvatarSrc={avatarLeonard}
            userAvatarAlt="Leonard Riley"
          />
          <p className={styles['patterns__variant-label']}>
            Channels — with Upgrade
          </p>
          <GlobalHeader
            product="Channels"
            showUpgradeButton
            userAvatarSrc={avatarLeonard}
            userAvatarAlt="Leonard Riley"
          />
          <p className={styles['patterns__variant-label']}>Playbooks</p>
          <GlobalHeader
            product="Playbooks"
            userAvatarSrc={avatarLeonard}
            userAvatarAlt="Leonard Riley"
          />
          <p className={styles['patterns__variant-label']}>Boards</p>
          <GlobalHeader
            product="Boards"
            userAvatarSrc={avatarLeonard}
            userAvatarAlt="Leonard Riley"
          />
        </div>
      </section>

      <section className={styles['patterns__section']}>
        <h2 className={styles['patterns__section-title']}>Channel Header</h2>
        <div className={styles['patterns__channel-header-demo']}>
          <p className={styles['patterns__variant-label']}>Channel</p>
          <ChannelHeader
            type="Channel"
            name="UX Design"
            memberCount={48}
            pinnedCount={1}
          />
          <p className={styles['patterns__variant-label']}>
            Channel — favorited, muted
          </p>
          <ChannelHeader
            type="Channel"
            name="UX Design"
            memberCount={48}
            pinnedCount={1}
            favorited
            muted
          />
          <p className={styles['patterns__variant-label']}>Bot</p>
          <ChannelHeader
            type="Bot"
            name="Todo"
            avatarSrc={avatarLeonard}
            description="Created by the Todo Plugin"
            pinnedCount={1}
          />
          <p className={styles['patterns__variant-label']}>DM</p>
          <ChannelHeader
            type="DM"
            name="Aiko Tan"
            avatarSrc={avatarAikoTan}
            avatarStatus
            pinnedCount={1}
          />
          <p className={styles['patterns__variant-label']}>GM</p>
          <ChannelHeader
            type="GM"
            name="Aiko Tan, Arjun Patel, Daniel Okoro"
            memberCount={4}
            pinnedCount={1}
          />
          <p className={styles['patterns__variant-label']}>Threads</p>
          <ChannelHeader
            type="Threads"
            name="Followed Threads"
            description="Threads you're participating in will automatically show here"
          />
          <p className={styles['patterns__variant-label']}>Drafts</p>
          <ChannelHeader
            type="Drafts"
            name="Drafts"
            description="Any messages you've started will show here"
          />
        </div>
      </section>

      <section className={styles['patterns__section']}>
        <h2 className={styles['patterns__section-title']}>Post</h2>
        <div className={styles['patterns__post-demo']}>
          <Post
            avatarSrc={avatarLeonard}
            avatarAlt="Leonard Riley"
            username="Leonard Riley"
            timestamp="Today at 9:41 AM"
          >
            <p className={styles['patterns__body-text']}>
              Hey team, the new components are looking great!
            </p>
          </Post>
          <Divider />
          <Post
            avatarSrc={avatarDanielle}
            avatarAlt="Danielle Okoro"
            username="Mattermost"
            timestamp="Today at 9:45 AM"
            isBot
          >
            <p className={styles['patterns__body-text']}>
              You have 3 unread messages in #general.
            </p>
          </Post>
        </div>
      </section>

      <section className={styles['patterns__section']}>
        <h2 className={styles['patterns__section-title']}>Team Sidebar</h2>
        <div className={styles['patterns__team-sidebar-demo']}>
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
      </section>

      <section className={styles['patterns__section']}>
        <h2 className={styles['patterns__section-title']}>Channel Sidebar</h2>
        <div className={styles['patterns__sidebar-demo']}>
          <div>
            <p className={styles['patterns__variant-label']}>
              Unreads category Off
            </p>
            <ChannelsSidebar
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
          <div>
            <p className={styles['patterns__variant-label']}>
              Unreads category On
            </p>
            <ChannelsSidebar
              showUnreadsCategory
              avatarAikoTan={avatarAikoTan}
              avatarArjunPatel={avatarArjunPatel}
              avatarDanielOkoro={avatarDanielle}
              avatarDariusCole={avatarDariusCole}
              avatarDavidLiang={avatarDavidLiang}
              avatarEmmaNovak={avatarEmmaNovak}
              avatarEthanBrooks={avatarEthanBrooks}
            />
          </div>
        </div>
      </section>

      <section className={styles['patterns__section']}>
        <h2 className={styles['patterns__section-title']}>Message Input</h2>
        <div className={styles['patterns__message-input-demo']}>
          <p className={styles['patterns__variant-label']}>Default</p>
          <MessageInput placeholder="Message #ux-design…" />
          <p className={styles['patterns__variant-label']}>
            With priority indicator
          </p>
          <MessageInput
            placeholder="Message #ux-design…"
            showPriorityIndicator
          />
          <p className={styles['patterns__variant-label']}>With attachments</p>
          <MessageInput placeholder="Message #ux-design…" showAttachments />
          <p className={styles['patterns__variant-label']}>
            With priority + attachments
          </p>
          <MessageInput
            placeholder="Message #ux-design…"
            showPriorityIndicator
            showAttachments
          />
        </div>
      </section>

      <section className={styles['patterns__section']}>
        <h2 className={styles['patterns__section-title']}>Call Widget</h2>
        <CallWidgetDemo />
      </section>

      <section className={styles['patterns__section']}>
        <h2 className={styles['patterns__section-title']}>Profile Popover</h2>
        <div className={styles['patterns__profile-popover-demo']}>
          <div>
            <p className={styles['patterns__variant-label']}>Others — full</p>
            <ProfilePopover
              user="Others"
              avatarSrc={avatarLeonard}
              avatarAlt="Leonard Riley"
              name="Leonard Riley"
              username="@leonard.riley"
              title="Lead Engineer, Enterprise"
              email="leonard.riley@acme.com"
              jobRole="System Admin"
              lastOnline="Last online 6 hrs ago"
              staff
              localTime={{
                time: '10:42 PM',
                timezone: 'EST',
                hourDifference: '3 hrs behind',
              }}
              onClose={() => {}}
            />
          </div>
          <div>
            <p className={styles['patterns__variant-label']}>
              Others — with custom status + extras
            </p>
            <ProfilePopover
              user="Others"
              avatarSrc={avatarLeonard}
              avatarAlt="Leonard Riley"
              name="Leonard Riley"
              username="@leonard.riley"
              title="Lead Engineer, Enterprise"
              email="leonard.riley@acme.com"
              jobRole="System Admin"
              lastOnline="Last online 6 hrs ago"
              sharedOrg="Acme Corp."
              staff
              coreCommitter
              githubHandle="lennyriley"
              localTime={{
                time: '10:42 PM',
                timezone: 'EST',
                hourDifference: '3 hrs behind',
              }}
              customStatus={{
                emoji: '📅',
                text: 'In a meeting',
                expiresLabel: 'Until Tomorrow',
              }}
              onClose={() => {}}
            />
          </div>
          <div>
            <p className={styles['patterns__variant-label']}>You</p>
            <ProfilePopover
              user="You"
              avatarSrc={avatarLeonard}
              avatarAlt="Leonard Riley"
              name="Leonard Riley"
              username="@leonard.riley"
              title="Lead Engineer, Enterprise"
              email="leonard.riley@acme.com"
              jobRole="System Admin"
              lastOnline="Last online 6 hrs ago"
              staff
              localTime={{
                time: '10:42 PM',
                timezone: 'EST',
                hourDifference: '3 hrs behind',
              }}
              onClose={() => {}}
            />
          </div>
          <div>
            <p className={styles['patterns__variant-label']}>
              You — with custom status + extras
            </p>
            <ProfilePopover
              user="You"
              avatarSrc={avatarLeonard}
              avatarAlt="Leonard Riley"
              name="Leonard Riley"
              username="@leonard.riley"
              title="Lead Engineer, Enterprise"
              email="leonard.riley@acme.com"
              jobRole="System Admin"
              lastOnline="Last online 6 hrs ago"
              sharedOrg="Dunder Mifflin"
              staff
              coreCommitter
              githubHandle="lennyriley"
              localTime={{
                time: '10:42 PM',
                timezone: 'EST',
                hourDifference: '3 hrs behind',
              }}
              customStatus={{
                emoji: '📅',
                text: 'In a meeting',
                expiresLabel: 'Until Tomorrow',
              }}
              onClose={() => {}}
            />
          </div>
        </div>
      </section>

      <section className={styles['patterns__section']}>
        <h2 className={styles['patterns__section-title']}>Right Sidebar</h2>

        <div className={styles['patterns__rsb-header-demo']}>
          <p className={styles['patterns__variant-label']}>Header — default</p>
          <RightSidebarHeader title="Thread" onClose={() => {}} />

          <p className={styles['patterns__variant-label']}>
            Header — with secondary title
          </p>
          <RightSidebarHeader
            title="Thread"
            secondaryTitle="UX Design"
            onClose={() => {}}
          />

          <p className={styles['patterns__variant-label']}>
            Header — with back button
          </p>
          <RightSidebarHeader
            title="Edit Profile"
            secondaryTitle="Account Settings"
            onBack={() => {}}
            onClose={() => {}}
          />

          <p className={styles['patterns__variant-label']}>
            Header — with label tag
          </p>
          <RightSidebarHeader title="Apps" labelTag="BETA" onClose={() => {}} />

          <p className={styles['patterns__variant-label']}>
            Header — with leading avatar + action
          </p>
          <RightSidebarHeader
            title="Leonard Riley"
            leadingIcon={
              <UserAvatar src={avatarLeonard} alt="Leonard Riley" size="24" />
            }
            actionLabel="Follow"
            onActionClick={() => {}}
            onClose={() => {}}
          />

          <p className={styles['patterns__variant-label']}>
            Header — without expand
          </p>
          <RightSidebarHeader title="Saved Messages" onClose={() => {}} />
        </div>

        <p
          className={styles['patterns__variant-label']}
          style={{ marginTop: 'var(--spacing-xl)' }}
        >
          Full sidebar — thread example
        </p>
        <div className={styles['patterns__rsb-shell']}>
          <RightSidebar
            header={
              <RightSidebarHeader
                title="Thread"
                secondaryTitle="UX Design"
                onExpand={() => {}}
                onClose={() => {}}
              />
            }
          >
            <div className={styles['patterns__rsb-thread']}>
              <Post
                avatarSrc={avatarLeonard}
                avatarAlt="Leonard Riley"
                username="Leonard Riley"
                timestamp="Today at 9:41 AM"
              >
                <p className={styles['patterns__body-text']}>
                  Quick gut-check: should the sidebar header always show the
                  parent channel as a secondary title, or only when the content
                  is scoped to a channel?
                </p>
              </Post>
              <Post
                avatarSrc={avatarAikoTan}
                avatarAlt="Aiko Tan"
                username="Aiko Tan"
                timestamp="Today at 9:48 AM"
              >
                <p className={styles['patterns__body-text']}>
                  I'd lean on showing it whenever there's a meaningful parent —
                  threads, pinned messages, files. Skip it for global views like
                  Saved Messages.
                </p>
              </Post>
              <Post
                avatarSrc={avatarDanielle}
                avatarAlt="Danielle Okoro"
                username="Danielle Okoro"
                timestamp="Today at 9:52 AM"
              >
                <p className={styles['patterns__body-text']}>
                  +1. The divider treatment also reads as "scoped to" which
                  reinforces the relationship.
                </p>
              </Post>
            </div>
          </RightSidebar>
        </div>

        <p
          className={styles['patterns__variant-label']}
          style={{ marginTop: 'var(--spacing-xl)' }}
        >
          Full sidebar — flexible body (channel info)
        </p>
        <div className={styles['patterns__rsb-shell']}>
          <RightSidebar
            header={
              <RightSidebarHeader
                title="Info"
                secondaryTitle="UX Design"
                onExpand={() => {}}
                onClose={() => {}}
              />
            }
          >
            <ChannelInfoBody />
          </RightSidebar>
        </div>
      </section>

      {REMAINING_PATTERNS.map((name) => (
        <section key={name} className={styles['patterns__section']}>
          <h2 className={styles['patterns__section-title']}>{name}</h2>
          <div className={styles['patterns__placeholder']}>
            <span className={styles['patterns__placeholder-label']}>
              {name}
            </span>
          </div>
        </section>
      ))}
    </div>
  );
}
