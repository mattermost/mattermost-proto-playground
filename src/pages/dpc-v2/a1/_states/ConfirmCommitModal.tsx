/**
 * DPC V2 A1 — Confirm-and-Commit modal (Wave 2C, LOAD-BEARING).
 *
 * Six scenario templates per §3.2 of `05-flow-review.md`:
 *
 *   1. enable-typical       — Private + no ABAC (Template 1, §3.2.2):
 *                             "All N team members can find..." → Primary
 *                             "Make Discoverable for N team members"
 *   2. enable-empty         — Private + ABAC + 0 matches (Template 5, §3.2.6):
 *                             warning + "Make Discoverable anyway"
 *   3. enable-slow          — Slow-path skeleton (Template 6, §3.2.7):
 *                             spinner + "Calculating..." → resolves to a
 *                             Template-2 style render after 800ms
 *   4. enable-large-jump    — auto-add ON (Template 3, §3.2.4): redundancy
 *                             warning + inverted-emphasis CTAs
 *   5. disable-with-pending — Template 4 (§3.2.5): pending-cascade copy
 *   6. policy-change-impact — Template 4 variant when no pending: simple
 *                             disable copy
 *
 * A scenario selector at the top of the modal lets reviewers cycle through
 * all six templates without having to retrigger the modal from the underlying
 * Channel Settings surface. The selector dispatches `setConfirmScenario` so
 * the rest of the render reads from store state and stays consistent with the
 * V2 reducer surface.
 *
 * Cross-cutting affordances preserved from V1:
 *   • Slow-path UX: 800ms setTimeout flips `modalMatchedUsersLoading`; Primary
 *     is disabled until resolved (NFR-5 boundary demo).
 *   • Session-expiry demo control kept under all templates so reviewers can
 *     exercise the V-A1-2 stale-state path.
 *   • Cancel emits `discoverable.toggle.cancelled` audit; Primary path emits
 *     `discoverable.toggle.enabled` or `.disabled` per existing reducer logic.
 *   • No auto-focus on Primary — Phase 4 §7.3 dismissal-fatigue mitigation.
 */
import { useEffect } from 'react';
import LockOutlineIcon from '@mattermost/compass-icons/components/lock-outline';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import ShieldOutlineIcon from '@mattermost/compass-icons/components/shield-outline';
import AccountMultipleOutlineIcon from '@mattermost/compass-icons/components/account-multiple-outline';
import AccountPlusOutlineIcon from '@mattermost/compass-icons/components/account-plus-outline';
import AlertCircleOutlineIcon from '@mattermost/compass-icons/components/alert-circle-outline';
import AlertOutlineIcon from '@mattermost/compass-icons/components/alert-outline';
import EmailOutlineIcon from '@mattermost/compass-icons/components/email-outline';
import Modal from '@/components/ui/Modal/Modal';
import Button from '@/components/ui/Button/Button';
import Icon from '@/components/ui/Icon/Icon';
import UserAvatar from '@/components/ui/UserAvatar/UserAvatar';
import Spinner from '@/components/ui/Spinner/Spinner';
import SectionNotice from '@/components/ui/SectionNotice/SectionNotice';
import Chip from '@/components/ui/Chip/Chip';
import { SUPPORTING_USERS, usePersona } from '@/pages/dpc/shared';
import type { A1V2StoreApi, ConfirmScenario } from '../useA1V2Store';
import styles from './ConfirmCommitModal.module.scss';

export interface ConfirmCommitModalProps {
  store: A1V2StoreApi;
}

const PREVIEW_LIMIT = 10; // §3.2.3 first-10 preview + overflow.

const SCENARIO_OPTIONS: Array<{ key: ConfirmScenario; label: string }> = [
  { key: 'enable-typical', label: '1 · No ABAC' },
  { key: 'enable-empty', label: '5 · 0 matches' },
  { key: 'enable-slow', label: '6 · Slow path' },
  { key: 'enable-large-jump', label: '3 · Auto-add ON' },
  { key: 'disable-with-pending', label: '4 · Disable' },
  { key: 'policy-change-impact', label: '4b · Policy change' },
];

export default function ConfirmCommitModal({ store }: ConfirmCommitModalProps) {
  const { state, policy, focusChannel } = store;
  const { personaInfo } = usePersona();

  // Slow-path simulation — preserved from V1.
  useEffect(() => {
    if (
      state.pendingToggle &&
      state.confirmScenario === 'enable-slow' &&
      state.modalMatchedUsersLoading
    ) {
      const timer = window.setTimeout(() => {
        store.resolveMatchedUsers();
      }, 800);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, [
    state.pendingToggle,
    state.confirmScenario,
    state.modalMatchedUsersLoading,
    store,
  ]);

  if (!state.pendingToggle) return null;

  const isDisableScenario =
    state.confirmScenario === 'disable-with-pending' ||
    state.confirmScenario === 'policy-change-impact';

  const handleConfirm = () => {
    if (isDisableScenario) {
      store.disableDiscoverable(personaInfo.username);
    } else {
      store.confirmToggleEnable(personaInfo.username);
    }
  };

  return (
    <div className={styles['v2-confirm-modal__overlay']} role="presentation">
      <Modal
        size="Medium"
        title={renderTitle(state.confirmScenario, policy.matchedCount, focusChannel.memberCount)}
        onClose={() => store.cancelToggle(personaInfo.username)}
        footer={renderFooter({
          scenario: state.confirmScenario,
          policy,
          loading: state.modalMatchedUsersLoading,
          isDisable: isDisableScenario,
          focusChannelMemberCount: focusChannel.memberCount,
          onCancel: () => store.cancelToggle(personaInfo.username),
          onConfirm: handleConfirm,
          onDisableAutoAdd: () => {
            // Reviewer-facing stub: jump to the policy-change-impact template
            // so the reviewer can see the "disable auto-add first" outcome
            // without leaving the modal.
            store.setConfirmScenario('policy-change-impact');
          },
        })}
      >
        {/* Reviewer scenario selector — V2-only affordance. */}
        <div
          className={styles['v2-confirm-modal__scenario-picker']}
          aria-label="Scenario template selector (reviewer aid)"
        >
          <span className={styles['v2-confirm-modal__scenario-picker-label']}>
            Scenario template
          </span>
          <div className={styles['v2-confirm-modal__scenario-picker-chips']}>
            {SCENARIO_OPTIONS.map((opt) => (
              <Chip
                key={opt.key}
                size="Small"
                as="button"
                tone={state.confirmScenario === opt.key ? 'info' : 'neutral'}
                colored={state.confirmScenario === opt.key}
                onClick={() => store.setConfirmScenario(opt.key)}
              >
                {opt.label}
              </Chip>
            ))}
          </div>
        </div>

        {/* Channel identity row — lock-plus composite glyph for enable
            scenarios; plain lock for disable scenarios per §3.2.5. */}
        <div className={styles['v2-confirm-modal__channel-row']}>
          <span className={styles['v2-confirm-modal__channel-icon']}>
            <LockOutlineIcon size={20} />
            {!isDisableScenario && (
              <PlusIcon
                size={12}
                className={styles['v2-confirm-modal__channel-icon-plus']}
              />
            )}
          </span>
          <span className={styles['v2-confirm-modal__channel-name']}>
            {focusChannel.displayName}
          </span>
          <span className={styles['v2-confirm-modal__channel-purpose']}>
            {focusChannel.purpose}
          </span>
        </div>

        {state.modalSessionExpired && (
          <div
            className={styles['v2-confirm-modal__error-banner']}
            role="alert"
          >
            <Icon size="16" glyph={<AlertCircleOutlineIcon />} />
            <span>
              The matched-user set has changed since this modal opened. Submit
              again to record the rejection, or cancel and reopen the flow.
            </span>
          </div>
        )}

        {renderBody({
          scenario: state.confirmScenario,
          policy,
          loading: state.modalMatchedUsersLoading,
          focusChannelMemberCount: focusChannel.memberCount,
          pendingCount: state.pendingRequests.length,
        })}

        {/* Demo control: V-A1-2 stale-state path. */}
        {!state.modalSessionExpired && !isDisableScenario && (
          <div className={styles['v2-confirm-modal__demo-control']}>
            <button
              type="button"
              className={styles['v2-confirm-modal__demo-link']}
              onClick={() => store.simulateSessionExpiry()}
            >
              Demo: simulate session expiry (V-A1-2 stale-state path)
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}

// ── Title resolution ────────────────────────────────────────────────────────

function renderTitle(
  scenario: ConfirmScenario,
  matchedCount: number,
  teamMemberCount: number,
): string {
  switch (scenario) {
    case 'enable-typical':
      return `Make this channel discoverable to ${teamMemberCount} team members?`;
    case 'enable-empty':
      return 'No users currently match the access rules';
    case 'enable-slow':
      return 'Make this channel discoverable';
    case 'enable-large-jump':
      return `Auto-add is on — Discoverable is redundant`;
    case 'disable-with-pending':
      return 'Turn off Discoverable for this channel?';
    case 'policy-change-impact':
      return 'Turn off Discoverable for this channel?';
    default:
      return matchedCount > 0
        ? `Make this channel discoverable to ${matchedCount} matching users?`
        : 'Make this channel discoverable';
  }
}

// ── Body renderers ──────────────────────────────────────────────────────────

interface BodyArgs {
  scenario: ConfirmScenario;
  policy: A1V2StoreApi['policy'];
  loading: boolean;
  focusChannelMemberCount: number;
  pendingCount: number;
}

function renderBody(args: BodyArgs) {
  switch (args.scenario) {
    case 'enable-typical':
      return <TemplateTypical teamMemberCount={args.focusChannelMemberCount} />;
    case 'enable-empty':
      return <TemplateEmpty />;
    case 'enable-slow':
      return <TemplateSlow loading={args.loading} policy={args.policy} />;
    case 'enable-large-jump':
      return <TemplateAutoAdd matchedCount={args.policy.matchedCount} />;
    case 'disable-with-pending':
      return <TemplateDisableWithPending pendingCount={args.pendingCount} />;
    case 'policy-change-impact':
      return <TemplatePolicyChange />;
    default:
      return null;
  }
}

// Template 1 — Private + no ABAC. §3.2.2.
function TemplateTypical({ teamMemberCount }: { teamMemberCount: number }) {
  return (
    <>
      <p className={styles['v2-confirm-modal__lede']}>
        Making this channel Discoverable will let any team member find it in
        Browse Channels, the channel switcher, and linked permalinks. They'll
        see the channel name, purpose, and member count — and can request to
        join.
      </p>
      <Section title="Who can find this channel" icon={<AccountMultipleOutlineIcon />}>
        <div className={styles['v2-confirm-modal__panel']}>
          <p className={styles['v2-confirm-modal__panel-text']}>
            All {teamMemberCount} team members can find this channel. Guests
            excluded (server-side).
          </p>
        </div>
      </Section>
      <Section title="How users get in" icon={<AccountPlusOutlineIcon />}>
        <p className={styles['v2-confirm-modal__section-body']}>
          Non-members can request to join. Requests are routed to{' '}
          <strong>Channel Admins</strong> (configurable in System Console →
          Permission Schemes).
        </p>
      </Section>
    </>
  );
}

// Template 5 — 0 matches edge case. §3.2.6.
function TemplateEmpty() {
  return (
    <>
      <SectionNotice
        type="Warning"
        title="Access rules match no current users"
        description={
          <>
            This channel has an Access Control policy, but right now no users
            in this team match the policy. Discoverable will have no visible
            effect until users match.
          </>
        }
      />
      <Section title="If you make this channel discoverable now" icon={<AccountMultipleOutlineIcon />}>
        <ul className={styles['v2-confirm-modal__bullets']}>
          <li>Nobody can find or join the channel yet.</li>
          <li>
            As soon as a user's attributes match the policy, the channel
            becomes visible to them.
          </li>
          <li>
            You won't get a notification when matches appear — they'll just
            start showing up in their Browse / switcher.
          </li>
        </ul>
        <p className={styles['v2-confirm-modal__section-body']}>
          Review the Access Control rules on the previous tab if this isn't
          what you expect.
        </p>
      </Section>
    </>
  );
}

// Template 6 — Slow path. §3.2.7.
function TemplateSlow({
  loading,
  policy,
}: {
  loading: boolean;
  policy: A1V2StoreApi['policy'];
}) {
  const sample = SUPPORTING_USERS.slice(
    0,
    Math.min(PREVIEW_LIMIT, SUPPORTING_USERS.length, policy.matchedCount),
  );
  const overflow = Math.max(0, policy.matchedCount - sample.length);

  return (
    <Section title="Who can find this channel" icon={<AccountMultipleOutlineIcon />}>
      <div
        className={styles['v2-confirm-modal__panel']}
        aria-live="polite"
        aria-busy={loading}
      >
        {loading ? (
          <div className={styles['v2-confirm-modal__slow']}>
            <div className={styles['v2-confirm-modal__slow-header']}>
              <Spinner size={16} aria-label="Calculating matched users" />
              <span>Calculating who can see this channel…</span>
            </div>
            <div className={styles['v2-confirm-modal__skeleton-rows']}>
              <span className={styles['v2-confirm-modal__skeleton-row']} />
              <span className={styles['v2-confirm-modal__skeleton-row']} />
              <span className={styles['v2-confirm-modal__skeleton-row']} />
              <span className={styles['v2-confirm-modal__skeleton-row']} />
            </div>
          </div>
        ) : (
          <>
            <p className={styles['v2-confirm-modal__panel-text']}>
              <strong>{policy.matchedCount} users</strong> matching access
              rules can find and join this channel directly.
            </p>
            <div className={styles['v2-confirm-modal__matched-grid']}>
              {sample.map((u) => (
                <span
                  key={u.id}
                  className={styles['v2-confirm-modal__matched-user']}
                >
                  <UserAvatar
                    src={u.avatarUrl}
                    alt={u.displayName}
                    name={u.displayName}
                    size="20"
                  />
                  <span className={styles['v2-confirm-modal__matched-name']}>
                    @{u.username}
                  </span>
                </span>
              ))}
              {overflow > 0 && (
                <span className={styles['v2-confirm-modal__overflow']}>
                  + {overflow} more
                </span>
              )}
            </div>
            <p className={styles['v2-confirm-modal__panel-aside']}>
              Guests excluded (server-side).
            </p>
          </>
        )}
      </div>
    </Section>
  );
}

// Template 3 — Auto-add ON redundancy warning. §3.2.4.
function TemplateAutoAdd({ matchedCount }: { matchedCount: number }) {
  const displayCount = matchedCount > 0 ? matchedCount : 47;
  return (
    <>
      <SectionNotice
        type="Warning"
        title={`Auto-add is on — ${displayCount} matching users are already members`}
        description={
          <>
            Marking the channel Discoverable adds no behavior — everyone who
            could discover it is already added. Consider keeping Auto-add and
            leaving Discoverable off.
          </>
        }
      />
      <Section title="If you make this channel discoverable anyway" icon={<ShieldOutlineIcon />}>
        <ul className={styles['v2-confirm-modal__bullets']}>
          <li>Matching users (already members) won't see any change.</li>
          <li>Non-matching users still won't see the channel.</li>
          <li>
            The channel will be marked Discoverable in audit logs and
            channel-state metadata.
          </li>
        </ul>
      </Section>
    </>
  );
}

// Template 4 — Disable with pending requests. §3.2.5.
function TemplateDisableWithPending({
  pendingCount,
}: {
  pendingCount: number;
}) {
  const safeCount = pendingCount > 0 ? pendingCount : 1;
  return (
    <>
      <p className={styles['v2-confirm-modal__lede']}>
        Members can no longer find this channel via Browse Channels, the
        channel switcher, or permalink unfurls. Existing members are
        unaffected.
      </p>
      <Section title="What happens to pending requests" icon={<EmailOutlineIcon />}>
        <div className={styles['v2-confirm-modal__panel']}>
          <p className={styles['v2-confirm-modal__panel-text']}>
            <strong>
              {safeCount} pending request{safeCount === 1 ? '' : 's'}
            </strong>{' '}
            will be withdrawn. Requesters will receive a DM letting them know
            the channel is no longer discoverable.
          </p>
        </div>
      </Section>
      <Section title="What stays the same" icon={<AlertOutlineIcon />}>
        <ul className={styles['v2-confirm-modal__bullets']}>
          <li>Current channel members keep their access.</li>
          <li>Channel content stays private.</li>
          <li>Audit history is preserved (no events deleted).</li>
        </ul>
      </Section>
    </>
  );
}

// Template 4b — Disable, no pending. Policy-change-impact stand-in.
function TemplatePolicyChange() {
  return (
    <>
      <p className={styles['v2-confirm-modal__lede']}>
        Members can no longer find this channel via Browse Channels, the
        channel switcher, or permalink unfurls. Existing members are
        unaffected.
      </p>
      <Section title="What stays the same" icon={<AlertOutlineIcon />}>
        <ul className={styles['v2-confirm-modal__bullets']}>
          <li>Current channel members keep their access.</li>
          <li>Channel content stays private.</li>
          <li>Audit history is preserved (no events deleted).</li>
        </ul>
      </Section>
    </>
  );
}

// ── Footer ──────────────────────────────────────────────────────────────────

interface FooterArgs {
  scenario: ConfirmScenario;
  policy: A1V2StoreApi['policy'];
  loading: boolean;
  isDisable: boolean;
  focusChannelMemberCount: number;
  onCancel: () => void;
  onConfirm: () => void;
  onDisableAutoAdd: () => void;
}

function renderFooter({
  scenario,
  policy,
  loading,
  isDisable,
  focusChannelMemberCount,
  onCancel,
  onConfirm,
  onDisableAutoAdd,
}: FooterArgs) {
  // Template 3 inverts emphasis: Cancel is Primary; "Make Discoverable anyway"
  // is Secondary. Tertiary "Disable auto-add first" is exposed.
  if (scenario === 'enable-large-jump') {
    return (
      <div className={styles['v2-confirm-modal__footer']}>
        <Button emphasis="Tertiary" size="Medium" onClick={onDisableAutoAdd}>
          Disable auto-add first
        </Button>
        <div className={styles['v2-confirm-modal__footer-right']}>
          <Button emphasis="Secondary" size="Medium" onClick={onConfirm}>
            Make Discoverable anyway
          </Button>
          <Button emphasis="Primary" size="Medium" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  if (isDisable) {
    return (
      <div className={styles['v2-confirm-modal__footer']}>
        <Button emphasis="Tertiary" size="Medium" onClick={onCancel}>
          Cancel
        </Button>
        <Button emphasis="Primary" size="Medium" onClick={onConfirm}>
          Disable Discoverable
        </Button>
      </div>
    );
  }

  // Enable scenarios — primary label resolution.
  let primaryLabel = 'Make Discoverable';
  if (scenario === 'enable-typical') {
    primaryLabel = `Make Discoverable for ${focusChannelMemberCount} team members`;
  } else if (scenario === 'enable-slow' && !loading) {
    primaryLabel = `Make Discoverable for ${policy.matchedCount} users`;
  } else if (scenario === 'enable-empty') {
    primaryLabel = 'Make Discoverable anyway';
  }

  return (
    <div className={styles['v2-confirm-modal__footer']}>
      <Button emphasis="Tertiary" size="Medium" onClick={onCancel}>
        Cancel
      </Button>
      <Button
        emphasis="Primary"
        size="Medium"
        disabled={loading}
        onClick={onConfirm}
      >
        {primaryLabel}
      </Button>
    </div>
  );
}

// ── Internal helpers ───────────────────────────────────────────────────────

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className={styles['v2-confirm-modal__section']}>
      <header className={styles['v2-confirm-modal__section-header']}>
        <Icon size="16" glyph={icon} />
        <h3 className={styles['v2-confirm-modal__section-title']}>{title}</h3>
      </header>
      {children}
    </section>
  );
}
