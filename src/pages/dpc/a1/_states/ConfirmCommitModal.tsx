/**
 * DPC A1 — Confirm-and-Commit modal.
 *
 * THE LOAD-BEARING A1 SURFACE per §3.1.4. Surfaces three things at the
 * user-action boundary before the Discoverable attribute commits:
 *
 *   1. Matched-user set (first-N preview + overflow count, "see all"
 *      affordance for the typical / slow paths)
 *   2. Guest-filter posture (NFR-2 server-side filter — always-on copy)
 *   3. Request-routing behavior (admin queue when no policy match,
 *      direct-join when ABAC matches and auto-add is disabled)
 *
 * Behaviors:
 *   • Slow-path UX: 800ms delay flips `modalMatchedUsersLoading` to false;
 *     primary disabled until resolved (NFR-5 boundary).
 *   • No auto-focus on primary — Phase 4 §7.3 dismissal-fatigue mitigation.
 *   • Primary copy is consequence-bearing ("Make Discoverable" / "Save and
 *     Make Discoverable for 12 users") — never "OK" or "Confirm".
 *   • Cancel emits `discoverable.toggle.cancelled` audit; primary emits
 *     `discoverable.toggle.enabled` with acknowledgment_metadata claim.
 *   • Session-expiry demo path: when `state.modalSessionExpired` is true,
 *     primary commits with `discoverable.toggle.attempt_rejected` instead.
 */
import { useEffect } from 'react';
import LockOutlineIcon from '@mattermost/compass-icons/components/lock-outline';
import ShieldOutlineIcon from '@mattermost/compass-icons/components/shield-outline';
import AccountMultipleOutlineIcon from '@mattermost/compass-icons/components/account-multiple-outline';
import AccountPlusOutlineIcon from '@mattermost/compass-icons/components/account-plus-outline';
import AlertCircleOutlineIcon from '@mattermost/compass-icons/components/alert-circle-outline';
import Modal from '@/components/ui/Modal/Modal';
import Button from '@/components/ui/Button/Button';
import Icon from '@/components/ui/Icon/Icon';
import UserAvatar from '@/components/ui/UserAvatar/UserAvatar';
import Spinner from '@/components/ui/Spinner/Spinner';
import { SUPPORTING_USERS, usePersona } from '@/pages/dpc/shared';
import type { A1StoreApi } from '../useA1Store';
import styles from './ConfirmCommitModal.module.scss';

export interface ConfirmCommitModalProps {
  store: A1StoreApi;
}

const PREVIEW_LIMIT = 10; // OQ-5.1: first-10 matched users on the surface.

export default function ConfirmCommitModal({ store }: ConfirmCommitModalProps) {
  const { state, policy, focusChannel } = store;
  const { personaInfo } = usePersona();

  // Slow-path: kick a setTimeout to flip the loading flag (800ms simulation).
  // Annotation: pendingToggle=true + loading=true → user-action → SET_TIMEOUT
  //             → MATCHED_USERS_RESOLVED → primary enables.
  useEffect(() => {
    if (state.pendingToggle && state.modalMatchedUsersLoading) {
      const timer = window.setTimeout(() => {
        store.resolveMatchedUsers();
      }, 800);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, [state.pendingToggle, state.modalMatchedUsersLoading, store]);

  if (!state.pendingToggle) return null;

  // Compose matched-user previews. The typical preset maps the first 7
  // SUPPORTING_USERS as real avatars; the slow preset maps all 8 plus a
  // large overflow count; the empty preset renders the no-match copy.
  const matchedSample = SUPPORTING_USERS.slice(
    0,
    Math.min(PREVIEW_LIMIT, SUPPORTING_USERS.length, policy.matchedCount),
  );
  const overflow = Math.max(0, policy.matchedCount - matchedSample.length);

  // Consequence-bearing primary copy (Phase 4 §7.3) — never "OK" or "Confirm".
  const primaryLabel = (() => {
    if (state.modalMatchedUsersLoading) return 'Make Discoverable';
    if (policy.matchedCount === 0) return 'Save anyway';
    if (state.abacPolicy === 'typical') {
      return `Save and Make Discoverable for ${policy.matchedCount} users`;
    }
    return 'Make Discoverable';
  })();

  // Matched-user summary text (KD-5 no-ABAC simplicity path is not exercised
  // here — every preset has an ABAC policy by construction. Empty preset
  // serves the no-match edge case per §3.1.13).
  const matchedSummary = (() => {
    if (state.modalMatchedUsersLoading) {
      return 'Calculating who can see this channel…';
    }
    if (policy.matchedCount === 0) {
      return 'No users currently match the access rules. Save anyway? The channel will be discoverable to nobody until a user matches.';
    }
    return `${policy.matchedCount} users matching access rules can find and join this channel.`;
  })();

  // Request-routing copy (FR-6 + KD-5):
  //   • Empty match → admin queue (no qualifying users)
  //   • Typical / slow → ABAC-direct-join with auto-add off
  const routingCopy =
    policy.matchedCount === 0
      ? 'Users without a matching attribute can request to join — their request will land in your Pending Requests queue.'
      : 'Users matching access rules can join directly (auto-add is off). Users without a matching attribute will see "Request to Join" and their request will land in your Pending Requests queue.';

  const primaryDisabled = state.modalMatchedUsersLoading;

  return (
    <div className={styles['confirm-modal__overlay']} role="presentation">
      <Modal
        size="Medium"
        title="Make this channel discoverable?"
        onClose={() => store.cancelToggle(personaInfo.username)}
        footer={
          <div className={styles['confirm-modal__footer']}>
            <Button
              emphasis="Tertiary"
              size="Medium"
              onClick={() => store.cancelToggle(personaInfo.username)}
            >
              Cancel
            </Button>
            <Button
              emphasis="Primary"
              size="Medium"
              disabled={primaryDisabled}
              onClick={() => store.confirmToggleEnable(personaInfo.username)}
            >
              {primaryLabel}
            </Button>
          </div>
        }
      >
        {/* Channel identity row — no member count, no admin list (NFR-1). */}
        <div className={styles['confirm-modal__channel-row']}>
          <Icon size="20" glyph={<LockOutlineIcon />} />
          <span className={styles['confirm-modal__channel-name']}>
            {focusChannel.displayName}
          </span>
          <span className={styles['confirm-modal__channel-purpose']}>
            {focusChannel.purpose}
          </span>
        </div>

        {state.modalSessionExpired && (
          <div
            className={styles['confirm-modal__error-banner']}
            role="alert"
          >
            <Icon size="16" glyph={<AlertCircleOutlineIcon />} />
            <span>
              The matched-user set has changed since this modal opened. Submit
              again to record the rejection, or cancel and reopen the flow.
            </span>
          </div>
        )}

        {/* Section 1 — matched user set (FR-4 inline consequence). */}
        <section className={styles['confirm-modal__section']}>
          <header className={styles['confirm-modal__section-header']}>
            <Icon size="16" glyph={<AccountMultipleOutlineIcon />} />
            <h3 className={styles['confirm-modal__section-title']}>
              Who can find this channel
            </h3>
          </header>
          <div
            className={styles['confirm-modal__matched']}
            aria-live="polite"
          >
            <p className={styles['confirm-modal__matched-summary']}>
              {matchedSummary}
            </p>

            {state.modalMatchedUsersLoading ? (
              <div className={styles['confirm-modal__matched-skeleton']}>
                <Spinner size={16} aria-label="Calculating matched users" />
                <div className={styles['confirm-modal__skeleton-rows']}>
                  <span className={styles['confirm-modal__skeleton-row']} />
                  <span className={styles['confirm-modal__skeleton-row']} />
                  <span className={styles['confirm-modal__skeleton-row']} />
                  <span className={styles['confirm-modal__skeleton-row']} />
                </div>
              </div>
            ) : policy.matchedCount === 0 ? (
              <p className={styles['confirm-modal__matched-empty']}>
                Display names only — no role, no clearance, no attribute values
                that caused the match (NFR-1).
              </p>
            ) : (
              <div className={styles['confirm-modal__matched-grid']}>
                {matchedSample.map((u) => (
                  <span
                    key={u.id}
                    className={styles['confirm-modal__matched-user']}
                  >
                    <UserAvatar
                      src={u.avatarUrl}
                      alt={u.displayName}
                      name={u.displayName}
                      size="20"
                    />
                    <span className={styles['confirm-modal__matched-name']}>
                      @{u.username}
                    </span>
                  </span>
                ))}
                {overflow > 0 && (
                  <button
                    type="button"
                    className={styles['confirm-modal__see-all']}
                    onClick={() =>
                      // Stub — Stage 3 may wire a secondary view. Keep
                      // user-action surface explicit so reviewers can trace.
                      undefined
                    }
                  >
                    + {overflow} more
                  </button>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Section 2 — guest filter posture (NFR-2). */}
        <section className={styles['confirm-modal__section']}>
          <header className={styles['confirm-modal__section-header']}>
            <Icon size="16" glyph={<ShieldOutlineIcon />} />
            <h3 className={styles['confirm-modal__section-title']}>Guests</h3>
          </header>
          <p className={styles['confirm-modal__section-body']}>
            Guests will not see this channel, regardless of access rules
            (server-side filter — NFR-2).
          </p>
        </section>

        {/* Section 3 — request routing (FR-6). */}
        <section className={styles['confirm-modal__section']}>
          <header className={styles['confirm-modal__section-header']}>
            <Icon size="16" glyph={<AccountPlusOutlineIcon />} />
            <h3 className={styles['confirm-modal__section-title']}>
              How users get in
            </h3>
          </header>
          <p className={styles['confirm-modal__section-body']}>{routingCopy}</p>
        </section>

        {/* Demo control: surfaces the V-A1-2 stale-state error path. */}
        {!state.modalSessionExpired && (
          <div className={styles['confirm-modal__demo-control']}>
            <button
              type="button"
              className={styles['confirm-modal__demo-link']}
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
