/**
 * NewerUserEmptyComposite — `[FAILURE MODE #1 VISIBLE]`
 *
 * THE load-bearing honesty surface for A4. Per §3.4.2 / §3.4.10, this is the
 * visual proof of A4's disqualification: a newer user with seven days of
 * tenure and no memberships sees all four reference-acquisition surfaces
 * empty. They have no organic path to discover that any private channels
 * exist on the team.
 *
 * Per §3.4.10 anti-pattern: the empty quadrants must NOT be softened with
 * placeholders such as "ask a colleague to recommend a channel" — that
 * placeholder is itself the word-of-mouth mechanism the spec exists to
 * replace. The annotation block makes the meta-commentary explicit so
 * reviewers parse the screen as the disqualification proof, not as a
 * product surface that just needs more populated fixtures.
 *
 * This screen is the central artifact for failure-mode-#1 visualization
 * (Phase 5 §3.4.2 critical visualization + §3.4.13 prototype-scope notes).
 */
import LockIcon from '@mattermost/compass-icons/components/lock-outline';
import AlertIcon from '@mattermost/compass-icons/components/alert-outline';
import Icon from '@/components/ui/Icon/Icon';
import LabelTag from '@/components/ui/LabelTag/LabelTag';
import styles from './NewerUserEmptyComposite.module.scss';

export interface NewerUserEmptyCompositeProps {
  /** Display name of the newer user persona, for the header chip. */
  userDisplay: string;
  /** Username/handle of the newer user, for the header chip. */
  userHandle: string;
  /** Tenure in days; shown in the header chip. */
  tenureDays: number;
}

export default function NewerUserEmptyComposite({
  userDisplay,
  userHandle,
  tenureDays,
}: NewerUserEmptyCompositeProps) {
  return (
    <section
      className={styles['empty-composite']}
      aria-labelledby="empty-composite-title"
    >
      <header className={styles['empty-composite__header']}>
        <div className={styles['empty-composite__header-row']}>
          <h2
            id="empty-composite-title"
            className={styles['empty-composite__title']}
          >
            A4 reference-acquisition surfaces — newer user
          </h2>
          <LabelTag
            label="Failure mode #1 visible"
            type="Danger"
            size="Small"
            casing="All Caps"
          />
        </div>
        <p className={styles['empty-composite__user']}>
          <span className={styles['empty-composite__user-handle']}>
            {userHandle}
          </span>{' '}
          · {userDisplay} · joined team {tenureDays} day
          {tenureDays === 1 ? '' : 's'} ago · no private channel memberships
        </p>
      </header>

      <div
        className={styles['empty-composite__grid']}
        role="list"
        aria-label="Four reference-acquisition surfaces"
      >
        <Quadrant
          n={1}
          title="Permalink unfurls"
          subtitle="Reference channel 1"
          headline="(no unfurled references)"
          body="No permalinks to a private channel have been shared with you, anywhere."
          locationCopy="In DMs and channel posts"
        />
        <Quadrant
          n={2}
          title="@mention interception"
          subtitle="Reference channel 2"
          headline="No mentions yet"
          body="You have not been @mentioned from any private channel you are not a member of."
          locationCopy="Activity · At-mentions"
        />
        <Quadrant
          n={3}
          title="Member recommendation DMs"
          subtitle="Reference channel 3"
          headline="(no recommendation DMs in inbox)"
          body="No member has recommended a private channel to you."
          locationCopy="Direct messages"
        />
        <Quadrant
          n={4}
          title="Channels you've left"
          subtitle="Reference channel 4"
          headline="(list is empty)"
          body="You haven't left any channels yet. There is no prior membership to lean on."
          locationCopy="Account menu · Channels you've left"
        />
      </div>

      <aside
        className={styles['empty-composite__annotation']}
        role="note"
        aria-label="Disqualification annotation"
      >
        <header className={styles['empty-composite__annotation-head']}>
          <span className={styles['empty-composite__annotation-icon']}>
            <Icon size="20" glyph={<AlertIcon />} />
          </span>
          <h3 className={styles['empty-composite__annotation-title']}>
            [FAILURE MODE #1 VISIBLE]
          </h3>
        </header>

        <div className={styles['empty-composite__annotation-body']}>
          <p>
            This is the disqualification proof. A newer user has no organic
            path to acquire references — they cannot discover that any
            private channels exist on this team. The strong OPSEC story (zero
            default visibility) is bought at the cost of reproducing the
            dominant Phase 1 problem: hidden conversations, word-of-mouth
            discovery, disadvantage to newer team members.
          </p>
          <p>
            Per Problem Statement failure mode #1 and Solution Directions §2.4
            (C4 = 2 / 5) and §4 disqualification rationale: any approach that
            solves the atomicity problem but reintroduces the dominant
            failure is the wrong shape, full stop.
          </p>
          <p className={styles['empty-composite__annotation-anti']}>
            Anti-pattern enforcement (§3.4.10): this empty state is{' '}
            <strong>not</strong> softened with &ldquo;ask a colleague to
            recommend a channel&rdquo;. That placeholder is itself the
            word-of-mouth mechanism the spec exists to replace.
          </p>
        </div>

        <dl className={styles['empty-composite__annotation-refs']}>
          <div>
            <dt>Cross-ref</dt>
            <dd>Problem Statement — Documented failure modes #1</dd>
          </div>
          <div>
            <dt>Cross-ref</dt>
            <dd>Solution Directions §2.4 C4 = 2/5</dd>
          </div>
          <div>
            <dt>Cross-ref</dt>
            <dd>Phase 5 Flow Review §3.4.2 / §3.4.10</dd>
          </div>
        </dl>
      </aside>
    </section>
  );
}

interface QuadrantProps {
  n: number;
  title: string;
  subtitle: string;
  headline: string;
  body: string;
  locationCopy: string;
}

function Quadrant({
  n,
  title,
  subtitle,
  headline,
  body,
  locationCopy,
}: QuadrantProps) {
  return (
    <article
      className={styles['empty-composite__quadrant']}
      role="listitem"
    >
      <header className={styles['empty-composite__quadrant-head']}>
        <div className={styles['empty-composite__quadrant-numwrap']}>
          <span className={styles['empty-composite__quadrant-num']}>{n}</span>
        </div>
        <div className={styles['empty-composite__quadrant-titles']}>
          <span className={styles['empty-composite__quadrant-subtitle']}>
            {subtitle}
          </span>
          <h3 className={styles['empty-composite__quadrant-title']}>
            <Icon size="16" glyph={<LockIcon />} />
            <span>{title}</span>
          </h3>
        </div>
      </header>

      <div className={styles['empty-composite__quadrant-empty-frame']}>
        <p className={styles['empty-composite__quadrant-headline']}>
          {headline}
        </p>
        <p className={styles['empty-composite__quadrant-body']}>{body}</p>
      </div>

      <footer className={styles['empty-composite__quadrant-foot']}>
        <span className={styles['empty-composite__quadrant-where-label']}>
          Where
        </span>
        <span className={styles['empty-composite__quadrant-where-value']}>
          {locationCopy}
        </span>
      </footer>
    </article>
  );
}
