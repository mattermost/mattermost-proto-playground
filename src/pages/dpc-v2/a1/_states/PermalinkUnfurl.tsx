/**
 * DPC V2 A1 — PermalinkUnfurl (NEW in V2; Wave 2D implementation).
 *
 * Two-option screen for §3.6 (visible) and §3.7 (silent / indistinguishability).
 *
 *   Option A — Visible state (matching user)
 *     Card with lock-plus 16px prefix + channel name + purpose + member
 *     count ("12 members") + help text "Message contents are hidden until
 *     you're a channel member" + Primary "Request to Join" button.
 *
 *   Option B — Silent state (non-matching user)
 *     What the user sees: just the raw URL as plain inline text, no card.
 *     Accompanied by a meta-annotation block (dashed border, monospace,
 *     "Security note" label) explaining FR-18 + NIST 800-207 Tenet 1
 *     indistinguishability contract.
 *
 * The store's `permalinkUnfurlMode` ('visible' | 'silent') and
 * `permalinkAudience` drive option selection. Mode toggle is rendered as
 * a segmented control at the top of the section.
 */
import LockIcon from '@mattermost/compass-icons/components/lock-outline';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import AccountMultipleOutlineIcon from '@mattermost/compass-icons/components/account-multiple-outline';
import Button from '@/components/ui/Button/Button';
import Icon from '@/components/ui/Icon/Icon';
import UserAvatar from '@/components/ui/UserAvatar/UserAvatar';
import { SUPPORTING_USERS } from '@/pages/dpc/shared';
import type { A1V2StoreApi, PermalinkUnfurlMode } from '../useA1V2Store';
import styles from './PermalinkUnfurl.module.scss';

export interface PermalinkUnfurlProps {
  store: A1V2StoreApi;
}

const MODE_OPTIONS: Array<{ key: PermalinkUnfurlMode; label: string }> = [
  { key: 'visible', label: 'Option A — Visible (matching user)' },
  { key: 'silent', label: 'Option B — Silent (non-matching user)' },
];

/** Composite lock-plus glyph per §3.19.4 fallback recipe. */
function LockPlus({ size = 16 }: { size?: 12 | 16 | 20 }) {
  return (
    <span
      className={styles['v2-permalink-unfurl__lockplus']}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <span
        className={styles['v2-permalink-unfurl__lockplus-lock']}
        style={{ width: size, height: size }}
      >
        <LockIcon size={size} />
      </span>
      <span
        className={styles['v2-permalink-unfurl__lockplus-plus']}
        style={{ width: Math.round(size * 0.6), height: Math.round(size * 0.6) }}
      >
        <PlusIcon size={Math.round(size * 0.6)} />
      </span>
    </span>
  );
}

export default function PermalinkUnfurl({ store }: PermalinkUnfurlProps) {
  const { state, focusChannel } = store;
  const mode = state.permalinkUnfurlMode;

  // Use a stable message author from supporting users for the mock chat row.
  const author = SUPPORTING_USERS[0];

  return (
    <section
      className={styles['v2-permalink-unfurl']}
      aria-label="Permalink unfurl preview"
    >
      <header className={styles['v2-permalink-unfurl__header']}>
        <div>
          <h3 className={styles['v2-permalink-unfurl__title']}>
            Permalink unfurl
          </h3>
          <p className={styles['v2-permalink-unfurl__subtitle']}>
            §3.6 visible + §3.7 silent — same URL, two viewers, different
            rendering. The silent state is the load-bearing security surface.
          </p>
        </div>
        <div
          className={styles['v2-permalink-unfurl__mode-switch']}
          role="tablist"
          aria-label="Audience mode"
        >
          {MODE_OPTIONS.map((opt) => (
            <button
              type="button"
              key={opt.key}
              role="tab"
              aria-selected={mode === opt.key}
              className={[
                styles['v2-permalink-unfurl__mode-btn'],
                mode === opt.key
                  ? styles['v2-permalink-unfurl__mode-btn--active']
                  : '',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => store.setPermalinkMode(opt.key)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </header>

      <div className={styles['v2-permalink-unfurl__message']}>
        <UserAvatar
          alt={author.displayName}
          name={author.displayName}
          src={author.avatarUrl}
          size="32"
        />
        <div className={styles['v2-permalink-unfurl__message-body']}>
          <div className={styles['v2-permalink-unfurl__message-meta']}>
            <span className={styles['v2-permalink-unfurl__message-author']}>
              @{author.username}
            </span>
            <span className={styles['v2-permalink-unfurl__message-time']}>
              Today at 10:42
            </span>
          </div>
          <p className={styles['v2-permalink-unfurl__message-text']}>
            Hey, dropping a link to the working group channel —
          </p>
          <p className={styles['v2-permalink-unfurl__permalink']}>
            https://mm.example/team/west-region/channels/
            {focusChannel.name}
          </p>

          {mode === 'visible' ? (
            <VisibleUnfurlCard
              channelName={focusChannel.displayName}
              purpose={focusChannel.purpose}
              memberCount={focusChannel.memberCount}
            />
          ) : null}

          <p className={styles['v2-permalink-unfurl__message-text']}>
            Thumbs up if you can — we need west-coast reps.
          </p>
        </div>
      </div>

      {mode === 'silent' ? (
        <aside
          className={styles['v2-permalink-unfurl__security-note']}
          aria-label="Security rationale annotation"
        >
          <header
            className={styles['v2-permalink-unfurl__security-note-header']}
          >
            <span
              className={styles['v2-permalink-unfurl__security-note-label']}
            >
              Security note · FR-18 / NIST 800-207 Tenet 1
            </span>
          </header>
          <p className={styles['v2-permalink-unfurl__security-note-body']}>
            This is what a non-matching ABAC user sees: nothing. The permalink
            is indistinguishable from a permalink to a deleted channel or a
            non-existent channel.{' '}
            <strong>
              No card, no fallback, no error toast, no tooltip, no per-user
              audit event.
            </strong>{' '}
            Aggregate counter telemetry only (NFR-11 carve-out).
          </p>
          <ul className={styles['v2-permalink-unfurl__security-note-list']}>
            <li>Case A — channel deleted last week renders identically.</li>
            <li>Case B — channel ID malformed renders identically.</li>
            <li>
              Case C — channel is non-discoverable (S1) renders identically.
            </li>
            <li>
              Case D — channel is Discoverable + ABAC, viewer doesn&apos;t match
              renders identically.
            </li>
          </ul>
          <p className={styles['v2-permalink-unfurl__security-note-foot']}>
            T-10 mitigation: permalink-share-as-enumeration neutralized at the
            visible-pixel layer.
          </p>
        </aside>
      ) : null}
    </section>
  );
}

interface VisibleUnfurlCardProps {
  channelName: string;
  purpose: string;
  memberCount: number;
}

function VisibleUnfurlCard({
  channelName,
  purpose,
  memberCount,
}: VisibleUnfurlCardProps) {
  return (
    <article
      className={styles['v2-permalink-unfurl__card']}
      role="region"
      aria-label={`Discoverable private channel preview: ${channelName}, ${memberCount} members.`}
    >
      <header className={styles['v2-permalink-unfurl__card-head']}>
        <LockPlus size={16} />
        <span className={styles['v2-permalink-unfurl__card-eyebrow']}>
          Discoverable
        </span>
      </header>
      <h4 className={styles['v2-permalink-unfurl__card-name']}>
        #{channelName}
      </h4>
      <p className={styles['v2-permalink-unfurl__card-count']}>
        <Icon size="12" glyph={<AccountMultipleOutlineIcon />} />
        {memberCount} members
      </p>
      <p className={styles['v2-permalink-unfurl__card-purpose']}>{purpose}</p>
      <p className={styles['v2-permalink-unfurl__card-help']}>
        Message contents are hidden until you&apos;re a channel member.
      </p>
      <div className={styles['v2-permalink-unfurl__card-actions']}>
        <Button emphasis="Primary" size="Small">
          Request to Join
        </Button>
      </div>
    </article>
  );
}
