/**
 * DPC V2 A1 — InChannelAdminSysMsg (refactored May 2026).
 *
 * Renders inside a real ChannelShell channel feed so reviewers can see
 * how the admin-only system message reads in product context. The
 * §3.11.2 "Visible to approvers only" eyebrow stays inside the UI
 * (it IS product UI — per spec, only approvers' clients render the
 * post and the eyebrow narrates that).
 *
 * The "restricted-visibility contract" explanation that previously
 * sat inside the UI as a meta-annotation has been moved into the
 * Review notes below the canvas (Change 3).
 */
import LockIcon from '@mattermost/compass-icons/components/lock-outline';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import Button from '@/components/ui/Button/Button';
import ChannelHeader from '@/components/ui/ChannelHeader/ChannelHeader';
import Message from '@/components/ui/Message/Message';
import MessageInput from '@/components/ui/MessageInput';
import MessageSeparator from '@/components/ui/MessageSeparator/MessageSeparator';
import Scrollbars from '@/components/ui/Scrollbars/Scrollbars';
import UserAvatar from '@/components/ui/UserAvatar/UserAvatar';
import { SUPPORTING_USERS } from '@/pages/dpc/shared';
import avatarLeonard from '@/assets/avatars/Leonard Riley.png';
import DpcAppShell, { shellStyles } from '../_components/DpcAppShell';
import ScreenCanvas from '../_components/ScreenCanvas';
import type { A1V2StoreApi } from '../useA1V2Store';
import styles from './InChannelAdminSysMsg.module.scss';

export interface InChannelAdminSysMsgProps {
  store: A1V2StoreApi;
}

function InlineLockPlus() {
  return (
    <span className={styles['v2-in-channel-sys-msg__glyph']} aria-hidden>
      <LockIcon size={12} />
      <span className={styles['v2-in-channel-sys-msg__glyph-plus']}>
        <PlusIcon size={8} />
      </span>
    </span>
  );
}

export default function InChannelAdminSysMsg({
  store,
}: InChannelAdminSysMsgProps) {
  const requester = SUPPORTING_USERS[2];
  const otherSpeaker = SUPPORTING_USERS[1];
  const requesterUsername = requester.username;
  const seedPendingId = store.state.pendingRequests[0]?.id ?? 'req-seed-1';
  const focusChannelName = store.focusChannel.displayName;
  const focusChannelPurpose = store.focusChannel.purpose;

  // v2.3 §5.6 + V-005 — drive the in-channel admin-only post variant from
  // the store's lifecycle state. `resolved-auto-add` renders the V-005
  // "Auto-add enabled." status stamp (system-attributed).
  const lifecycle = store.state.inChannelPostLifecycle;
  const resolutionActor =
    store.state.inChannelPostResolutionActor ?? 'ops.coord';

  const scrollToRail = () => {
    const target = document.getElementById('dpc-a1-rhs-rail');
    target?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <ScreenCanvas
      eyebrow="§3.11"
      title="Admin-visible in-channel system message"
      subtitle="A system bot post that the channel feed renders only for users with the 'Manage join requests for this channel' permission. Per-viewer feed filtering is novel to the Mattermost system-message vocabulary."
      canvas={
        <DpcAppShell
          focusChannelName={focusChannelName}
          focusIsDiscoverable
          focusHasPendingDot
          channelHeader={
            <ChannelHeader
              type="Channel"
              name={focusChannelName}
              description={focusChannelPurpose}
              memberCount={store.focusChannel.memberCount}
              pinnedCount={2}
            />
          }
        >
          <>
            <div className={shellStyles['channel-shell__messages']}>
              <Scrollbars>
                <div className={shellStyles['channel-shell__messages-list']}>
                  <MessageSeparator type="Date" label="Today" />

                  <Message
                    avatarSrc={otherSpeaker.avatarUrl}
                    avatarAlt={otherSpeaker.displayName}
                    username={otherSpeaker.displayName}
                    timestamp="10:42 AM"
                  >
                    <p className={shellStyles['channel-shell__post-text']}>
                      Pushing the v2 build at noon.
                    </p>
                  </Message>

                  {/* Admin-only system post — state-driven (v2.3 §5.6) */}
                  <AdminSysPost
                    time="10:44 AM"
                    variant={lifecycle}
                    requesterUsername={requesterUsername}
                    resolutionActor={resolutionActor}
                    channelName={focusChannelName}
                    onApprove={() =>
                      store.approveRequest('ops.coord', seedPendingId)
                    }
                    onDecline={() => store.openDeclineModal(seedPendingId)}
                    onScrollToRail={scrollToRail}
                  />

                  <Message
                    avatarSrc={SUPPORTING_USERS[4].avatarUrl}
                    avatarAlt={SUPPORTING_USERS[4].displayName}
                    username={SUPPORTING_USERS[4].displayName}
                    timestamp="10:45 AM"
                  >
                    <p className={shellStyles['channel-shell__post-text']}>
                      Looks good.
                    </p>
                  </Message>
                </div>
              </Scrollbars>
            </div>

            <div className={shellStyles['channel-shell__message-input']}>
              <MessageInput placeholder={`Write to ${focusChannelName}`} />
            </div>
          </>
        </DpcAppShell>
      }
      reviewSummary="Per-viewer rendering contract: non-approver members of this channel never receive these system posts in their feed payload. The post is absent from the response, not hidden client-side."
      reviewItems={[
        {
          heading: 'Restricted-visibility contract (FR-25 surface c)',
          body: (
            <>
              <p>
                Non-approver members never receive this post in their feed
                payload (server-side filter). The post is not hidden behind a
                "show more"; it is absent from the response. On approve/decline
                the same post transitions in place (no duplicate notification).
              </p>
              <p>
                <strong>T-13 mitigation:</strong> ≥5 requests in 1 hour collapse
                to a digest post that omits individual requester names.
              </p>
            </>
          ),
        },
        {
          heading: 'Eyebrow stays in product UI',
          body: (
            <p>
              "Visible to approvers only" is a real product affordance — it
              narrates the restricted visibility to the approver who IS seeing
              the post. It is not a reviewer annotation, so it stays inside
              the message card, not in this Review notes block.
            </p>
          ),
        },
      ]}
    />
  );
}

type PostVariant =
  | 'pending'
  | 'resolved-approved'
  | 'resolved-declined'
  | 'resolved-auto-add';

interface AdminSysPostProps {
  time: string;
  variant: PostVariant;
  requesterUsername: string;
  resolutionActor: string;
  channelName?: string;
  onApprove?: () => void;
  onDecline?: () => void;
  onScrollToRail?: () => void;
}

function AdminSysPost({
  time,
  variant,
  requesterUsername,
  resolutionActor,
  onApprove,
  onDecline,
  onScrollToRail,
}: AdminSysPostProps) {
  const isPending = variant === 'pending';

  // v2.3 §5.6 + V-005 lifecycle copy. resolved-auto-add is the
  // system-attributed status-stamp transition for T6 cascade.
  let bodyCopy: React.ReactNode = null;
  if (variant === 'pending') {
    bodyCopy = (
      <>
        New join request from @{requesterUsername}.
      </>
    );
  } else if (variant === 'resolved-approved') {
    bodyCopy = (
      <>
        @{requesterUsername}&apos;s request was approved by @{resolutionActor}.
      </>
    );
  } else if (variant === 'resolved-declined') {
    bodyCopy = (
      <>
        @{requesterUsername}&apos;s request was declined by @{resolutionActor}.
      </>
    );
  } else if (variant === 'resolved-auto-add') {
    // V-005 status stamp — system-attributed, no admin actor.
    bodyCopy = <>Auto-add enabled.</>;
  }

  return (
    <Message
      username="Mattermost"
      timestamp={time}
      isBot
      avatarSrc={avatarLeonard}
      avatarAlt="Mattermost"
    >
      <div
        className={[
          styles['v2-in-channel-sys-msg__post-card'],
          !isPending
            ? styles['v2-in-channel-sys-msg__post-card--resolved']
            : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <header className={styles['v2-in-channel-sys-msg__post-eyebrow']}>
          <InlineLockPlus />
          <span>Visible to approvers only</span>
        </header>
        <p className={styles['v2-in-channel-sys-msg__post-body']}>{bodyCopy}</p>
        {isPending && (
          <div className={styles['v2-in-channel-sys-msg__post-actions']}>
            <Button emphasis="Primary" size="Small" onClick={onApprove}>
              Approve
            </Button>
            <Button emphasis="Secondary" size="Small" onClick={onDecline}>
              Decline…
            </Button>
            <Button
              emphasis="Tertiary"
              size="Small"
              onClick={onScrollToRail}
            >
              Open Pending Requests panel
            </Button>
          </div>
        )}
        {variant === 'resolved-approved' && (
          <footer className={styles['v2-in-channel-sys-msg__post-resolved']}>
            <UserAvatar
              alt={`@${resolutionActor}`}
              name={resolutionActor}
              size="16"
            />
            <span>Approved by @{resolutionActor}.</span>
          </footer>
        )}
        {variant === 'resolved-declined' && (
          <footer className={styles['v2-in-channel-sys-msg__post-resolved']}>
            <UserAvatar
              alt={`@${resolutionActor}`}
              name={resolutionActor}
              size="16"
            />
            <span>Declined by @{resolutionActor}.</span>
          </footer>
        )}
      </div>
    </Message>
  );
}
