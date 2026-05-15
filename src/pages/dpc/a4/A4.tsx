/**
 * DPC A4 — Knock-by-Reference (Stage 2 build).
 *
 * Approach A4 has no discovery surface — the visual story is four
 * reference-acquisition channels (permalink unfurl, @mention interception,
 * member recommendation, prior-membership lookup) plus a knock affordance.
 *
 * A4 was disqualified at Phase 4 because it reproduces Problem Statement
 * failure mode #1 (hidden conversations / word-of-mouth discovery /
 * disadvantage to newer team members). The most important screen in this
 * prototype is the NewerUserEmptyComposite — the visual proof of failure
 * mode #1.
 *
 * Persona-aware layout per §3.4.13:
 *   - end-user-tenured:   four populated reference surfaces + DM preview
 *   - end-user-newer:     NewerUserEmptyComposite (load-bearing failure mode visual)
 *   - channel-admin:      ChannelSettings (Allow Knocks) + PendingKnocksRail
 *   - guest:              vacuous empty state with NFR-2 callout
 *   - system-admin:       AuditPanel with A4-specific events + V-A4-1 trigger
 *
 * Scenario header trailingControl: a tenured ↔ newer toggle so the failure
 * mode is demonstrably interactive (per §3.4.13 prototype-scope notes).
 */
import {
  PrototypeShell,
  usePersona,
  useViewport,
  PERSONAS,
} from '@/pages/dpc/shared';
import LockOffIcon from '@mattermost/compass-icons/components/lock-outline';
import Icon from '@/components/ui/Icon/Icon';
import SectionNotice from '@/components/ui/SectionNotice/SectionNotice';
import Button from '@/components/ui/Button/Button';

import {
  useA4Store,
  A4_DEMO_CHANNEL_ID,
  A4_PLANNING_CHANNEL_ID,
  findChannel,
} from './useA4Store';
import type { Reference } from './useA4Store';

import ScenarioSwitcher from './_states/ScenarioSwitcher';
import PermalinkUnfurl from './_states/PermalinkUnfurl';
import MentionInterceptionNotification from './_states/MentionInterceptionNotification';
import {
  RecipientCard,
  SenderForm,
} from './_states/RecommendationDM';
import ChannelsYouveLeftSurface from './_states/ChannelsYouveLeftSurface';
import NewerUserEmptyComposite from './_states/NewerUserEmptyComposite';
import ChannelSettings from './_states/ChannelSettings';
import PendingKnocksRail from './_states/PendingKnocksRail';
import DmNotificationPreview from './_states/DmNotificationPreview';
import AuditPanel from './_states/AuditPanel';

import styles from './A4.module.scss';

export default function A4() {
  return (
    <PrototypeShell
      label="DPC — A4: Knock-by-Reference"
      initialPersona="end-user-newer"
      trailingControl={<ScenarioSwitcher />}
    >
      <A4Body />
    </PrototypeShell>
  );
}

function A4Body() {
  const { persona, personaInfo } = usePersona();
  const { viewport } = useViewport();
  const isMobile = viewport === 'mobile';
  const { state, actions } = useA4Store();

  // Find references for the demo channel — used by reference-surface panes.
  const refOf = (channelId: string, source: Reference['source']) =>
    state.references.find(
      (r) => r.channelId === channelId && r.source === source,
    );

  const permalinkRef = refOf(A4_DEMO_CHANNEL_ID, 'permalink');
  const mentionRef = refOf(A4_PLANNING_CHANNEL_ID, 'mention');
  const recommendationRef = refOf(A4_DEMO_CHANNEL_ID, 'recommendation');

  const hasPendingKnock = (channelId: string) =>
    state.myPendingKnocks.includes(channelId);

  // ── Newer-user (failure mode #1 visualization) ────────────────────────
  if (persona === 'end-user-newer') {
    return (
      <div className={styles['a4']}>
        <FlashBar flash={state.flash} onDismiss={actions.dismissFlash} />
        <NewerUserEmptyComposite
          userDisplay={personaInfo.displayName}
          userHandle={`@${personaInfo.username}`}
          tenureDays={personaInfo.tenureDays}
        />
      </div>
    );
  }

  // ── Guest ─────────────────────────────────────────────────────────────
  if (persona === 'guest') {
    return (
      <div className={styles['a4']}>
        <FlashBar flash={state.flash} onDismiss={actions.dismissFlash} />
        <div className={styles['a4__guest']}>
          <span className={styles['a4__guest-icon']}>
            <Icon size="40" glyph={<LockOffIcon />} />
          </span>
          <h2 className={styles['a4__guest-title']}>
            Discoverability is not available for guest users
          </h2>
          <p className={styles['a4__guest-body']}>
            A4 reference-acquisition surfaces are filtered server-side for
            guest sessions across all four reference channels:
          </p>
          <ul className={styles['a4__guest-list']}>
            <li>
              <strong>Permalink unfurls</strong> — guest receives a generic
              &ldquo;Access denied&rdquo; card; no channel name, no purpose,
              no knock affordance (NFR-2 / T-1 enumeration-resistant
              response).
            </li>
            <li>
              <strong>@mention notifications</strong> — guests are blocked at
              the notification-generation layer; mentions are never written to
              the guest&apos;s notification stream.
            </li>
            <li>
              <strong>Member recommendations</strong> — recipient search
              filters guests server-side; direct API submission returns a
              generic &ldquo;Recipient not eligible&rdquo; error and emits
              Guest_knock_blocked.
            </li>
            <li>
              <strong>Prior-membership lookup</strong> — guest cannot have
              been a member of non-guest private channels; surface is empty
              by construction.
            </li>
          </ul>

          {permalinkRef && (
            <div className={styles['a4__guest-demo']}>
              <h3 className={styles['a4__guest-demo-title']}>
                Live demonstration — permalink unfurl, guest filter on
              </h3>
              <PermalinkUnfurl
                reference={permalinkRef}
                pending={false}
                guestFiltered
                onSendKnock={() => {}}
                onWithdraw={() => {}}
                onSimulateRevoked={() => {}}
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── System admin: audit-events panel ──────────────────────────────────
  if (persona === 'system-admin') {
    return (
      <div className={styles['a4']}>
        <FlashBar flash={state.flash} onDismiss={actions.dismissFlash} />
        <AuditPanel
          events={state.auditEvents}
          onSimulateFabrication={() =>
            actions.simulateFabricationAttempt(
              A4_DEMO_CHANNEL_ID,
              '@attacker',
            )
          }
        />
      </div>
    );
  }

  // ── Channel admin: ChannelSettings + PendingKnocksRail ────────────────
  if (persona === 'channel-admin') {
    const cfg = state.channelAllowKnocks[A4_DEMO_CHANNEL_ID];
    return (
      <div className={styles['a4']}>
        <FlashBar flash={state.flash} onDismiss={actions.dismissFlash} />
        <div
          className={[
            styles['a4__admin-grid'],
            isMobile ? styles['a4__admin-grid--mobile'] : '',
          ].join(' ')}
        >
          <ChannelSettings
            channelId={A4_DEMO_CHANNEL_ID}
            config={cfg}
            actor={`@${personaInfo.username}`}
            isMobile={isMobile}
            onEnableAllowKnocks={() =>
              actions.enableAllowKnocks(
                A4_DEMO_CHANNEL_ID,
                `@${personaInfo.username}`,
              )
            }
            onDisableAllowKnocks={() =>
              actions.disableAllowKnocks(
                A4_DEMO_CHANNEL_ID,
                `@${personaInfo.username}`,
              )
            }
            onSetSubToggle={(source, value) =>
              actions.setSubToggle(
                A4_DEMO_CHANNEL_ID,
                source,
                value,
                `@${personaInfo.username}`,
              )
            }
            onSetRecommendationPermission={(value) =>
              actions.setRecommendPermission(
                A4_DEMO_CHANNEL_ID,
                value,
                `@${personaInfo.username}`,
              )
            }
          />

          <PendingKnocksRail
            channelId={A4_DEMO_CHANNEL_ID}
            pendingKnocks={state.pendingKnocks}
            isMobile={isMobile}
            onAccept={(knockId) =>
              actions.acceptKnock(knockId, `@${personaInfo.username}`)
            }
            onDecline={(knockId, reason) =>
              actions.declineKnock(knockId, `@${personaInfo.username}`, reason)
            }
          />
        </div>

        <SenderForm
          channelId={A4_DEMO_CHANNEL_ID}
          permission={cfg.recommendationPermission}
          isChannelAdmin
          onSendRecommendation={({ recipientHandle, note }) =>
            actions.sendRecommendation({
              channelId: A4_DEMO_CHANNEL_ID,
              sender: `@${personaInfo.username}`,
              recipientHandle,
              note,
            })
          }
          onSimulateRateLimit={({ recipientHandle }) =>
            actions.rateLimitedRecommendation({
              channelId: A4_DEMO_CHANNEL_ID,
              sender: `@${personaInfo.username}`,
              recipientHandle,
            })
          }
        />

        <DmNotificationPreview notifications={state.dmNotifications} />
      </div>
    );
  }

  // ── Tenured end-user: four populated reference surfaces ───────────────
  const tenuredId = PERSONAS['end-user-tenured'].id;

  return (
    <div className={styles['a4']}>
      <FlashBar flash={state.flash} onDismiss={actions.dismissFlash} />

      <header className={styles['a4__intro']}>
        <h2 className={styles['a4__intro-title']}>
          A4 reference-acquisition surfaces — tenured user
        </h2>
        <p className={styles['a4__intro-body']}>
          The four reference channels populated with realistic references
          this user has acquired over time. Compare with the newer-user
          composite (toggle in scenario header) to see the failure-mode-#1
          visualization that disqualified A4 at Phase 4.
        </p>
      </header>

      <div className={styles['a4__refs-grid']}>
        <div className={styles['a4__ref-pane']}>
          <PaneHead
            n={1}
            title="Permalink unfurl"
            subtitle="Reference channel 1 — [REFERENCE: permalink]"
          />
          {permalinkRef ? (
            <PermalinkUnfurl
              reference={permalinkRef}
              pending={hasPendingKnock(permalinkRef.channelId)}
              onSendKnock={(msg) =>
                actions.submitKnock({
                  channelId: permalinkRef.channelId,
                  source: 'permalink',
                  knocker: {
                    id: personaInfo.id,
                    handle: `@${personaInfo.username}`,
                    display: personaInfo.displayName,
                  },
                  via: `permalink from ${permalinkRef.fromUser ?? '@log.lead'}`,
                  message: msg,
                })
              }
              onWithdraw={() =>
                actions.withdrawKnock(
                  permalinkRef.channelId,
                  `@${personaInfo.username}`,
                )
              }
              onSimulateRevoked={() =>
                actions.simulateFabricationAttempt(
                  permalinkRef.channelId,
                  `@${personaInfo.username}`,
                )
              }
            />
          ) : (
            <PaneEmpty kind="permalink" />
          )}
        </div>

        <div className={styles['a4__ref-pane']}>
          <PaneHead
            n={2}
            title="@mention interception"
            subtitle="Reference channel 2 — [REFERENCE: mention]"
          />
          {mentionRef ? (
            <MentionInterceptionNotification
              reference={mentionRef}
              pending={hasPendingKnock(mentionRef.channelId)}
              onSendKnock={(msg) =>
                actions.submitKnock({
                  channelId: mentionRef.channelId,
                  source: 'mention',
                  knocker: {
                    id: personaInfo.id,
                    handle: `@${personaInfo.username}`,
                    display: personaInfo.displayName,
                  },
                  via: `@mention from ${mentionRef.fromUser ?? '@mission.plan'}`,
                  message: msg,
                })
              }
              onWithdraw={() =>
                actions.withdrawKnock(
                  mentionRef.channelId,
                  `@${personaInfo.username}`,
                )
              }
              onDismiss={() =>
                actions.dismissMention(
                  mentionRef.channelId,
                  `@${personaInfo.username}`,
                )
              }
            />
          ) : (
            <PaneEmpty kind="mention" />
          )}
        </div>

        <div className={styles['a4__ref-pane']}>
          <PaneHead
            n={3}
            title="Member recommendation DM"
            subtitle="Reference channel 3 — [REFERENCE: recommendation]"
          />
          {recommendationRef ? (
            <RecipientCard
              reference={recommendationRef}
              pending={hasPendingKnock(recommendationRef.channelId)}
              onSendKnock={(msg) =>
                actions.submitKnock({
                  channelId: recommendationRef.channelId,
                  source: 'recommendation',
                  knocker: {
                    id: personaInfo.id,
                    handle: `@${personaInfo.username}`,
                    display: personaInfo.displayName,
                  },
                  via: `recommendation from ${recommendationRef.fromUser ?? '@comms.spec'}`,
                  message: msg,
                })
              }
              onWithdraw={() =>
                actions.withdrawKnock(
                  recommendationRef.channelId,
                  `@${personaInfo.username}`,
                )
              }
            />
          ) : (
            <PaneEmpty kind="recommendation" />
          )}
        </div>

        <div className={styles['a4__ref-pane']}>
          <PaneHead
            n={4}
            title="Channels you've left"
            subtitle="Reference channel 4 — [REFERENCE: prior-membership] · also A4's L&R path (§3.4.6)"
          />
          <ChannelsYouveLeftSurface
            channelsLeft={state.channelsLeft}
            personaId={tenuredId}
            myPendingKnocks={state.myPendingKnocks}
            onKnock={({ channelId, channelName, purpose, message }) => {
              const ch = findChannel(channelId);
              const entry = state.channelsLeft.find(
                (c) => c.channelId === channelId,
              );
              actions.submitKnock({
                channelId,
                source: 'prior-membership',
                knocker: {
                  id: personaInfo.id,
                  handle: `@${personaInfo.username}`,
                  display: personaInfo.displayName,
                },
                via: `prior member (left ${entry?.leftDate ?? '—'})`,
                message,
              });
              // ensure store stays consistent
              void ch;
              void channelName;
              void purpose;
            }}
            onWithdraw={(channelId) =>
              actions.withdrawKnock(
                channelId,
                `@${personaInfo.username}`,
              )
            }
          />
        </div>
      </div>

      <section className={styles['a4__leave-demo']}>
        <SectionNotice
          type="Info"
          title="Leave-and-Rejoin demo"
          description="A4's L&R mechanism IS the prior-membership reference channel (§3.4.6). Trigger a 'leave' to add a channel to your Channels-you've-left surface above."
          primaryButtonLabel="Leave #ops-planning-q3"
          onPrimaryAction={() =>
            actions.leaveChannel({
              channelId: A4_PLANNING_CHANNEL_ID,
              channelName: 'ops-planning-q3',
              purpose:
                findChannel(A4_PLANNING_CHANNEL_ID)?.purpose ??
                'Quarterly operational planning working group.',
              actor: `@${personaInfo.username}`,
              personaId: tenuredId,
            })
          }
        />
      </section>

      <DmNotificationPreview notifications={state.dmNotifications} />
    </div>
  );
}

// ── Small helpers ────────────────────────────────────────────────────────

function FlashBar({
  flash,
  onDismiss,
}: {
  flash: string | null;
  onDismiss(): void;
}) {
  if (!flash) return null;
  return (
    <div className={styles['a4__flash']} role="status" aria-live="polite">
      <span>{flash}</span>
      <Button
        emphasis="Link"
        size="X-Small"
        onClick={onDismiss}
      >
        Dismiss
      </Button>
    </div>
  );
}

function PaneHead({
  n,
  title,
  subtitle,
}: {
  n: number;
  title: string;
  subtitle: string;
}) {
  return (
    <header className={styles['a4__pane-head']}>
      <span className={styles['a4__pane-num']}>{n}</span>
      <div className={styles['a4__pane-titles']}>
        <h3 className={styles['a4__pane-title']}>{title}</h3>
        <span className={styles['a4__pane-subtitle']}>{subtitle}</span>
      </div>
    </header>
  );
}

function PaneEmpty({
  kind,
}: {
  kind: 'permalink' | 'mention' | 'recommendation';
}) {
  const copy = {
    permalink:
      'No permalinks to a private channel are currently in this user’s DMs or posts.',
    mention:
      'No outstanding @mentions from a private channel this user is not in.',
    recommendation:
      'No member has recommended a private channel to this user.',
  };
  return (
    <div className={styles['a4__pane-empty']}>
      <p>{copy[kind]}</p>
    </div>
  );
}
