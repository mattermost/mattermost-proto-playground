/**
 * DPC V2 A1 — InChannelAdminSysMsg (NEW in V2; Wave 2D implementation).
 *
 * Mocks the §3.11 admin-visible in-channel system message: a system bot
 * post that the channel feed renders only for users with the
 * "Manage join requests for this channel" permission. Per-viewer
 * feed-filtering is novel to the Mattermost system-message vocabulary.
 *
 * Two states are surfaced side-by-side:
 *
 *   Option A — Pending (new request received)
 *     "Visible to approvers only" eyebrow + lock-plus 12px + body copy
 *     "@user has requested to join this Discoverable channel." +
 *     inline Approve / Decline / Open Pending Requests panel buttons.
 *     Decline opens the DeclineModal via store.openDeclineModal().
 *
 *   Option B — Resolved
 *     Same post but action buttons collapsed and a footer line is
 *     appended: "Resolved 11:02 by @admin: Approved." Demonstrates the
 *     in-place transition rather than a new post.
 */
import LockIcon from '@mattermost/compass-icons/components/lock-outline';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import Button from '@/components/ui/Button/Button';
import UserAvatar from '@/components/ui/UserAvatar/UserAvatar';
import LabelTag from '@/components/ui/LabelTag/LabelTag';
import { SUPPORTING_USERS } from '@/pages/dpc/shared';
import type { A1V2StoreApi } from '../useA1V2Store';
import styles from './InChannelAdminSysMsg.module.scss';

export interface InChannelAdminSysMsgProps {
  store: A1V2StoreApi;
}

function InlineLockPlus() {
  // 12px composite per §3.19.4 fallback recipe.
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
  const requesterUsername = requester.username;
  const seedPendingId = store.state.pendingRequests[0]?.id ?? 'req-seed-1';

  return (
    <section
      className={styles['v2-in-channel-sys-msg']}
      aria-label="In-channel admin-visible system message preview"
    >
      <header className={styles['v2-in-channel-sys-msg__header']}>
        <div>
          <h3 className={styles['v2-in-channel-sys-msg__title']}>
            In-channel admin system message
          </h3>
          <p className={styles['v2-in-channel-sys-msg__subtitle']}>
            §3.11 novel per-viewer feed-filtering. Visible only to users
            holding &quot;Manage join requests for this channel&quot;. The
            same post transitions in place when resolved — it&apos;s not a
            second post.
          </p>
        </div>
        <LabelTag
          label="Admin-only feed visibility"
          type="Info"
          size="Small"
          casing="Title Case"
        />
      </header>

      <div className={styles['v2-in-channel-sys-msg__channel']}>
        <div className={styles['v2-in-channel-sys-msg__channel-header']}>
          <span className={styles['v2-in-channel-sys-msg__channel-name']}>
            # {store.focusChannel.displayName}
          </span>
          <span className={styles['v2-in-channel-sys-msg__channel-purpose']}>
            {store.focusChannel.purpose}
          </span>
        </div>

        <div className={styles['v2-in-channel-sys-msg__feed']}>
          <FeedRow
            time="10:42"
            author="@jane.doe"
            body="Pushing the v2 build at noon."
          />

          {/* Option A — Pending state */}
          <PostCard
            time="10:44"
            variant="pending"
            requesterUsername={requesterUsername}
            channelName={store.focusChannel.displayName}
            onApprove={() => store.approveRequest('ops.coord', seedPendingId)}
            onDecline={() => store.openDeclineModal(seedPendingId)}
          />

          <FeedRow
            time="10:45"
            author="@bob.lee"
            body="Looks good."
          />

          {/* Option B — Resolved state */}
          <PostCard
            time="11:02"
            variant="resolved-approved"
            requesterUsername={requesterUsername}
            channelName={store.focusChannel.displayName}
          />
        </div>
      </div>

      <aside
        className={styles['v2-in-channel-sys-msg__note']}
        aria-label="Per-viewer rendering rationale"
      >
        <span className={styles['v2-in-channel-sys-msg__note-label']}>
          Restricted-visibility contract
        </span>
        <p className={styles['v2-in-channel-sys-msg__note-body']}>
          Non-approver members of this channel <strong>never receive</strong>{' '}
          this post in their feed payload (server-side filter, FR-25 surface
          c). The post is not hidden behind a &quot;show more&quot;; it is
          absent from the response. On approve/decline the same post
          transitions in place (no duplicate notification). T-13 mitigation:
          ≥5 requests in 1 hour collapse to a digest post that omits
          individual requester names.
        </p>
      </aside>
    </section>
  );
}

interface FeedRowProps {
  time: string;
  author: string;
  body: string;
}

function FeedRow({ time, author, body }: FeedRowProps) {
  return (
    <div className={styles['v2-in-channel-sys-msg__msg']}>
      <span className={styles['v2-in-channel-sys-msg__msg-time']}>
        [{time}]
      </span>
      <span className={styles['v2-in-channel-sys-msg__msg-author']}>
        {author}:
      </span>
      <span className={styles['v2-in-channel-sys-msg__msg-body']}>{body}</span>
    </div>
  );
}

type PostVariant = 'pending' | 'resolved-approved' | 'resolved-declined';

interface PostCardProps {
  time: string;
  variant: PostVariant;
  requesterUsername: string;
  channelName: string;
  onApprove?: () => void;
  onDecline?: () => void;
}

function PostCard({
  time,
  variant,
  requesterUsername,
  channelName,
  onApprove,
  onDecline,
}: PostCardProps) {
  const isPending = variant === 'pending';
  const resolution =
    variant === 'resolved-approved'
      ? 'Approved.'
      : variant === 'resolved-declined'
        ? 'Declined.'
        : null;

  return (
    <div
      className={[
        styles['v2-in-channel-sys-msg__post'],
        !isPending ? styles['v2-in-channel-sys-msg__post--resolved'] : '',
      ]
        .filter(Boolean)
        .join(' ')}
      role="region"
      aria-label="System message visible to approvers"
    >
      <div className={styles['v2-in-channel-sys-msg__post-rail']}>
        <span className={styles['v2-in-channel-sys-msg__msg-time']}>
          [{time}]
        </span>
        <span className={styles['v2-in-channel-sys-msg__post-author']}>
          System (Admin view)
        </span>
      </div>
      <div className={styles['v2-in-channel-sys-msg__post-card']}>
        <header className={styles['v2-in-channel-sys-msg__post-eyebrow']}>
          <InlineLockPlus />
          <span>Visible to approvers only</span>
        </header>
        <p className={styles['v2-in-channel-sys-msg__post-body']}>
          @{requesterUsername} has requested to join this{' '}
          <span className={styles['v2-in-channel-sys-msg__post-emphasis']}>
            Discoverable
          </span>{' '}
          channel{isPending ? '.' : ` #${channelName}.`}
        </p>
        {isPending ? (
          <div className={styles['v2-in-channel-sys-msg__post-actions']}>
            <Button emphasis="Primary" size="Small" onClick={onApprove}>
              Approve
            </Button>
            <Button emphasis="Secondary" size="Small" onClick={onDecline}>
              Decline…
            </Button>
            <Button emphasis="Tertiary" size="Small">
              Open Pending Requests panel
            </Button>
          </div>
        ) : (
          <footer className={styles['v2-in-channel-sys-msg__post-resolved']}>
            <UserAvatar
              alt="@ops.coord"
              name="ops.coord"
              size="16"
            />
            <span>Resolved 11:02 by @ops.coord: {resolution}</span>
          </footer>
        )}
      </div>
    </div>
  );
}
