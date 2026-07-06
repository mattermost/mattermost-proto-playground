/**
 * DPC V2 A1 — Confirm-and-Commit modal (Wave 2C, LOAD-BEARING).
 *
 * Six scenario templates per §3.2 of `05-flow-review.md`:
 *
 *   1. enable-typical       — Private + no ABAC (Template 1, §3.2.2):
 *                             "All N team members can find..." → Primary
 *                             "Make Discoverable" (generic per 2026-05-18;
 *                             count surfaced in body, not CTA)
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
import ShieldOutlineIcon from '@mattermost/compass-icons/components/shield-outline';
import AccountMultipleOutlineIcon from '@mattermost/compass-icons/components/account-multiple-outline';
import AccountPlusOutlineIcon from '@mattermost/compass-icons/components/account-plus-outline';
import AlertCircleOutlineIcon from '@mattermost/compass-icons/components/alert-circle-outline';
import AlertOutlineIcon from '@mattermost/compass-icons/components/alert-outline';
import EmailOutlineIcon from '@mattermost/compass-icons/components/email-outline';
import Modal from '@/components/ui/Modal/Modal';
import Button from '@/components/ui/Button/Button';
import ChannelHeader from '@/components/ui/ChannelHeader/ChannelHeader';
import Chip from '@/components/ui/Chip/Chip';
import EmptyState from '@/components/ui/EmptyState/EmptyState';
import Icon from '@/components/ui/Icon/Icon';
import Scrollbars from '@/components/ui/Scrollbars/Scrollbars';
import SectionNotice from '@/components/ui/SectionNotice/SectionNotice';
import Spinner from '@/components/ui/Spinner/Spinner';
import UserAvatar from '@/components/ui/UserAvatar/UserAvatar';
import { SUPPORTING_USERS, usePersona } from '@/pages/dpc/shared';
import AppOverlay from '../_components/AppOverlay';
import DpcAppShell, { shellStyles } from '../_components/DpcAppShell';
import ScreenCanvas from '../_components/ScreenCanvas';
import type { A1V2StoreApi, ConfirmScenario } from '../useA1V2Store';
import styles from './ConfirmCommitModal.module.scss';

export interface ConfirmCommitModalProps {
  store: A1V2StoreApi;
  /**
   * When true, the modal is rendered inside a `ScreenCanvas` wrapper with
   * its own `ChannelShell` background — used as a standalone review surface
   * (Wave 2C). When false (default), it renders as a page-level overlay,
   * which is the runtime behavior when the underlying Channel Settings
   * toggle fires `openToggleConfirm`.
   */
  standalone?: boolean;
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

export default function ConfirmCommitModal({
  store,
  standalone = false,
}: ConfirmCommitModalProps) {
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

  // Page-level overlay mode (default): only render when the toggle was
  // actually triggered via store.openToggleConfirm.
  if (!standalone && !state.pendingToggle) return null;

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

  const modalNode = (
    <Modal
        size="Medium"
        title={renderTitle(state.confirmScenario)}
        // Per Figma 4886:51404 — channel name lives in the Modal header as a
        // subtitle next to the title (separated by a vertical line). The
        // previous in-body lock-plus + name + purpose row has been removed;
        // the body now focuses on consequence message + matched-user preview.
        subtitle={`#${focusChannel.displayName}`}
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
      </Modal>
  );

  const canShowSessionExpiry = !state.modalSessionExpired && !isDisableScenario;

  if (!standalone) {
    // Runtime page-level overlay — render the modal in a fixed backdrop
    // so it floats over the whole prototype canvas (matches the previous
    // behaviour when triggered from Channel Settings → openToggleConfirm).
    return (
      <div
        className={styles['v2-confirm-modal__page-overlay']}
        role="presentation"
      >
        {modalNode}
      </div>
    );
  }

  return (
    <ScreenCanvas
      eyebrow="§3.2"
      title="Confirm-and-Commit modal"
      subtitle="Six scenario templates per §3.2. The chip strip selects which template renders; the modal is the focus surface."
      canvas={
        <div className={styles['v2-confirm-modal__canvas']}>
          {/* Scenario chip selector lives ABOVE the modal canvas — it is
              a reviewer aid, not product UI. */}
          <div
            className={styles['v2-confirm-modal__scenario-picker']}
            aria-label="Scenario template selector (reviewer aid)"
          >
            <span
              className={styles['v2-confirm-modal__scenario-picker-label']}
            >
              Scenario template (reviewer aid — not product UI)
            </span>
            <div
              className={styles['v2-confirm-modal__scenario-picker-chips']}
            >
              {SCENARIO_OPTIONS.map((opt) => (
                <Chip
                  key={opt.key}
                  size="Small"
                  as="button"
                  tone={
                    state.confirmScenario === opt.key ? 'info' : 'neutral'
                  }
                  colored={state.confirmScenario === opt.key}
                  onClick={() => store.setConfirmScenario(opt.key)}
                >
                  {opt.label}
                </Chip>
              ))}
            </div>
          </div>

          <DpcAppShell
            focusChannelName={focusChannel.displayName}
            focusIsDiscoverable
            channelHeader={
              <ChannelHeader
                type="Channel"
                name={focusChannel.displayName}
                description={focusChannel.purpose}
                memberCount={focusChannel.memberCount}
                pinnedCount={2}
              />
            }
            overlay={<AppOverlay maxWidth={760}>{modalNode}</AppOverlay>}
          >
            <div className={shellStyles['channel-shell__messages']}>
              <Scrollbars>
                <div className={shellStyles['channel-shell__messages-list']}>
                  <EmptyState
                    title="Confirm modal is the focus"
                    description="The chip strip above selects which of the six templates renders inside the modal."
                  />
                </div>
              </Scrollbars>
            </div>
          </DpcAppShell>
        </div>
      }
      reviewSummary="No auto-focus on Primary — Phase 4 §7.3 dismissal-fatigue mitigation. Cancel emits discoverable.toggle.cancelled audit; Primary path emits discoverable.toggle.enabled or .disabled."
      reviewItems={[
        {
          heading: 'Channel context moved to Modal header (Figma 4886:51404)',
          body: (
            <p>
              The channel name lives in the Modal <code>subtitle</code> slot
              alongside the title (separated by a vertical line). The previous
              in-body lock-plus + channel-name + purpose row has been removed
              from every template — the body now focuses on the consequence
              message, matched-user preview, and footer buttons.
            </p>
          ),
        },
        {
          heading: 'Slow-path UX (NFR-5 boundary demo)',
          body: (
            <p>
              The <code>enable-slow</code> template shows a spinner +
              "Calculating…" skeleton; Primary is disabled until 800ms after
              open. Once resolved, the matched-user grid renders and Primary
              becomes <code>Make Discoverable</code> (generic — matched-user
              count + carousel live in the body, not the CTA, per 2026-05-18
              feedback).
            </p>
          ),
        },
        {
          heading: 'CTAs simplified (2026-05-18 stakeholder feedback)',
          body: (
            <p>
              CTAs simplified per 2026-05-18 stakeholder feedback —
              matched-user count is shown in the body (carousel + "+N more"
              overflow + cardinality sentence); the CTA stays generic to avoid
              noise. Templates 3 (auto-add ON) and 5 (0 matches) retain{' '}
              <code>Make Discoverable anyway</code> because they're warning
              scenarios where the admin is overriding a guard — the "anyway"
              token carries the override semantics. Template 4 (disable) and
              Template 4b (policy-change) use <code>Disable Discoverable</code>
              {' '}without counts (already correct). Template 6 (slow-path
              loading) shows a disabled <code>Make Discoverable</code> until
              the cohort resolves.
            </p>
          ),
        },
        {
          heading: 'Reviewer demo control — stale state (V-A1-2)',
          body: (
            <>
              <p>
                The session-expiry simulator is intentionally outside the
                modal body in this refactor — it is a reviewer aid, not
                product UI.
              </p>
              {canShowSessionExpiry && (
                <button
                  type="button"
                  className={styles['v2-confirm-modal__demo-link']}
                  onClick={() => store.simulateSessionExpiry()}
                >
                  Simulate session expiry now
                </button>
              )}
            </>
          ),
        },
        {
          heading: 'Lock-plus glyph removed from the modal body',
          body: (
            <p>
              The earlier channel-identity row inside the modal body has been
              retired in favor of the Modal subtitle pattern. The lock-plus
              composite glyph stays in the Channel Settings header, Browse
              channel rows, and the channel switcher per KD-26 subtle-by-
              default — within the modal itself, the title + subtitle and the
              consequence copy are enough to anchor what the channel is.
            </p>
          ),
        },
      ]}
    />
  );
}

// ── Title resolution ────────────────────────────────────────────────────────

function renderTitle(scenario: ConfirmScenario): string {
  // Each template gets its own title. The channel name moves to the Modal's
  // subtitle slot (rendered next to the title per Figma 4886:51404).
  switch (scenario) {
    case 'enable-typical':
      // Template 1 — Private + no ABAC.
      return 'Make this channel discoverable?';
    case 'enable-empty':
      // Template 5 — ABAC rules exist but 0 matches.
      return 'Make this channel discoverable?';
    case 'enable-slow':
      // Template 6 — Slow path (large cohort).
      return 'Make this channel discoverable?';
    case 'enable-large-jump':
      // Template 3 — ABAC + auto-add ON (redundancy).
      return 'Discoverable has limited effect here';
    case 'disable-with-pending':
      // Template 4 — Toggle OFF.
      return 'Disable Discoverable?';
    case 'policy-change-impact':
      // Template 4b — Toggle OFF, no pending.
      return 'Disable Discoverable?';
    default:
      return 'Make this channel discoverable?';
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
    <>
      <p className={styles['v2-confirm-modal__lede']}>
        When you make this discoverable,{' '}
        {loading ? (
          <>the users matching</>
        ) : (
          <>
            the <strong>{policy.matchedCount} users</strong> matching
          </>
        )}{' '}
        your access rules will see the channel and can request to join. Since
        this is a private channel, all join requests still require your
        approval.
      </p>
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
                rules can find this channel and request to join.
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
      <Section title="How users get in" icon={<AccountPlusOutlineIcon />}>
        <p className={styles['v2-confirm-modal__section-body']}>
          <strong>Matching users request to join.</strong> Because this is a
          private channel, every join request still needs your approval —
          matching the policy only grants visibility, not direct access.
        </p>
      </Section>
    </>
  );
}

// Template 3 — Auto-add ON redundancy warning. §3.2.4 / v2.3 §5.2 T3.
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
      <Section
        title="If you make this channel discoverable anyway"
        icon={<ShieldOutlineIcon />}
      >
        <ul className={styles['v2-confirm-modal__bullets']}>
          <li>Matching users (already members) won&apos;t see any change.</li>
          <li>Non-matching users still won&apos;t see the channel.</li>
          <li>
            The channel will be marked Discoverable in audit logs and
            channel-state metadata.
          </li>
        </ul>
      </Section>
    </>
  );
}

// Template 4 — Disable with pending requests. §3.2.5 / v2.3 §5.2 T4 cascade.
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
            will be withdrawn. Each requester gets a DM explaining why.
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
    // Inverted emphasis. Cancel is Primary; "Make Discoverable anyway" is
    // Secondary (outlined); "Disable auto-add first" is Tertiary. The override
    // semantics are carried by the "anyway" copy + the Cancel being the
    // emphasized action.
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
          Turn off Discoverable
        </Button>
      </div>
    );
  }

  // Enable scenarios — primary label resolution.
  // Per 2026-05-18 stakeholder feedback: CTAs are generic ("Make Discoverable")
  // rather than count-bearing. The matched-user count + avatar carousel inside
  // the modal body remains the matched-user disclosure surface; the CTA stays
  // generic to avoid noise. Template 5 (enable-empty) keeps "anyway" because
  // it's a warning scenario where the admin is overriding a "0 matches" guard.
  let primaryLabel = 'Make Discoverable';
  if (scenario === 'enable-empty') {
    primaryLabel = 'Make Discoverable anyway';
  }
  // Reference unused args to keep the signature intact; the count + matched
  // count are still surfaced in the body (not the CTA).
  void focusChannelMemberCount;
  void policy;

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
