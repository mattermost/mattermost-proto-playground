/**
 * DPC V2 A1 — PermalinkUnfurl (refactored May 2026).
 *
 * Renders as a real `Message` post inside the channel feed of a
 * `ChannelShell`. The unfurl card matches the existing Mattermost
 * permalink unfurl pattern (Figma 4888:52863, "Message Attachment"):
 *   - eyebrow "MESSAGE FROM A DISCOVERABLE CHANNEL"
 *   - lock-outline 16px + channel name (Metropolis SemiBold 16/24)
 *   - full-width divider
 *   - italic body "Message contents are hidden until you're a channel
 *     member."
 *   - Tertiary "Request to join" button (light blue bg, blue text)
 *
 * Two states are surfaced via a mode switch above the canvas:
 *
 *   Option A — Visible state (matching ABAC user)
 *     The unfurl card appears beneath the link text in the feed.
 *
 *   Option B — Silent state (non-matching ABAC user)
 *     The same permalink renders as plain inline text; no card, no
 *     fallback, no tooltip — indistinguishable from a permalink to a
 *     deleted channel (FR-18, NIST 800-207 Tenet 1).
 *
 * The silent-state annotation lives in the Review notes block below
 * the canvas (Change 3) — never inside the UI itself.
 */
import { useEffect } from 'react';
import LockOutlineIcon from '@mattermost/compass-icons/components/lock-outline';
import Button from '@/components/ui/Button/Button';
import ChannelHeader from '@/components/ui/ChannelHeader/ChannelHeader';
import Icon from '@/components/ui/Icon/Icon';
import Message from '@/components/ui/Message/Message';
import MessageInput from '@/components/ui/MessageInput';
import MessageSeparator from '@/components/ui/MessageSeparator/MessageSeparator';
import Scrollbars from '@/components/ui/Scrollbars/Scrollbars';
import { SUPPORTING_USERS, usePersona } from '@/pages/dpc/shared';
import DpcAppShell, { shellStyles } from '../_components/DpcAppShell';
import ScreenCanvas from '../_components/ScreenCanvas';
import type { A1V2StoreApi, PermalinkUnfurlMode } from '../useA1V2Store';
import styles from './PermalinkUnfurl.module.scss';

export interface PermalinkUnfurlProps {
  store: A1V2StoreApi;
}

const MODE_OPTIONS: Array<{ key: PermalinkUnfurlMode; label: string }> = [
  { key: 'visible', label: 'Option A — Visible (matching user)' },
  { key: 'silent', label: 'Option B — Silent (non-matching user)' },
];

export default function PermalinkUnfurl({ store }: PermalinkUnfurlProps) {
  const { state, focusChannel } = store;
  const { personaInfo } = usePersona();
  const mode = state.permalinkUnfurlMode;

  const author = SUPPORTING_USERS[0];
  const responder = SUPPORTING_USERS[1];

  // v2.3 §4.1 / NFR-11 — telemetry. Visible mode emits a per-user audit
  // event; silent mode emits aggregate-only counter (no per-user identity).
  useEffect(() => {
    if (mode === 'visible') store.recordPermalinkVisible(personaInfo.username);
    else store.recordPermalinkSilent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  const permalinkUrl = `https://mm.example/team/west-region/channels/${focusChannel.name}`;

  return (
    <ScreenCanvas
      eyebrow="§3.6 · §3.7"
      title="Permalink unfurl in channel feed"
      subtitle="Same URL, two viewers, different rendering. The silent state is the load-bearing security surface."
      canvas={
        <div className={styles['v2-permalink-unfurl']}>
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

          <DpcAppShell
            focusChannelName="general"
            focusIsDiscoverable={false}
            channelHeader={
              <ChannelHeader
                type="Channel"
                name="general"
                description="Team-wide announcements and broad coordination."
                memberCount={142}
                pinnedCount={3}
              />
            }
          >
            <>
              <div className={shellStyles['channel-shell__messages']}>
                <Scrollbars>
                  <div className={shellStyles['channel-shell__messages-list']}>
                    <MessageSeparator type="Date" label="Today" />

                    <Message
                      avatarSrc={responder.avatarUrl}
                      avatarAlt={responder.displayName}
                      username={responder.displayName}
                      timestamp="10:30 AM"
                    >
                      <p className={shellStyles['channel-shell__post-text']}>
                        Quick check — anyone got bandwidth for the west-region
                        rollout this week?
                      </p>
                    </Message>

                    <Message
                      avatarSrc={author.avatarUrl}
                      avatarAlt={author.displayName}
                      username={author.displayName}
                      timestamp="10:43 AM"
                    >
                      <p className={shellStyles['channel-shell__post-text']}>
                        Hey, dropping a link to the working group channel
                        —{' '}
                        <a
                          className={styles['v2-permalink-unfurl__permalink']}
                          href="#"
                          onClick={(e) => e.preventDefault()}
                        >
                          {permalinkUrl}
                        </a>
                      </p>

                      {mode === 'visible' ? (
                        <VisibleUnfurlCard
                          channelName={focusChannel.displayName}
                          onRequest={() =>
                            store.openRequestToJoin(focusChannel.id)
                          }
                        />
                      ) : (
                        <p className={shellStyles['channel-shell__post-text']}>
                          Thumbs up if you can — we need west-coast reps.
                        </p>
                      )}
                    </Message>
                  </div>
                </Scrollbars>
              </div>

              <div className={shellStyles['channel-shell__message-input']}>
                <MessageInput placeholder="Write to general" />
              </div>
            </>
          </DpcAppShell>
        </div>
      }
      reviewSummary={
        mode === 'silent'
          ? 'The Silent state is the load-bearing security surface — the permalink renders as plain text only, indistinguishable from a permalink to a deleted or non-existent channel.'
          : 'Visible card matches the existing Mattermost permalink unfurl pattern (Figma 4888:52863): eyebrow, lock + channel name, full-width divider, italic explanation, Tertiary CTA.'
      }
      reviewItems={[
        {
          heading: 'Indistinguishability contract (FR-18 / NIST 800-207 Tenet 1)',
          body: (
            <>
              <p>
                A non-matching ABAC user sees nothing.{' '}
                <strong>
                  No card, no fallback, no error toast, no tooltip, no per-user
                  audit event.
                </strong>{' '}
                Aggregate counter telemetry only (NFR-11 carve-out).
              </p>
              <ul>
                <li>Case A — channel deleted last week renders identically.</li>
                <li>Case B — channel ID malformed renders identically.</li>
                <li>
                  Case C — channel is non-discoverable (S1) renders identically.
                </li>
                <li>
                  Case D — channel is Discoverable + ABAC, viewer doesn't match,
                  renders identically.
                </li>
              </ul>
              <p>
                T-10 mitigation: permalink-share-as-enumeration neutralized at
                the visible-pixel layer.
              </p>
            </>
          ),
        },
        {
          heading: 'Why the visible card matches the standard unfurl pattern',
          body: (
            <p>
              The DPC unfurl reuses the existing &ldquo;Message Attachment&rdquo;
              anatomy — a plain lock icon plus the eyebrow
              &ldquo;Message from a discoverable channel&rdquo; carries the DPC
              context, and the italic body explains why the contents are hidden.
              No purpose blurb, no member count, no admin list — pre-join
              metadata stays minimal per NFR-1 REVISED. Lock-plus and the
              &ldquo;Discoverable&rdquo; label tag are reserved for the
              cross-surface indicator system (LHS, Browse, Switcher rows).
            </p>
          ),
        },
      ]}
    />
  );
}

interface VisibleUnfurlCardProps {
  channelName: string;
  onRequest?: () => void;
}

/**
 * Permalink unfurl card per Figma 4888:52863. Anatomy:
 *   eyebrow → lock + channel name → full-width divider → italic body → CTA.
 *
 * The divider is a direct child of the card frame so it spans the entire
 * card width. The top + bottom sections own their own inner padding.
 */
function VisibleUnfurlCard({ channelName, onRequest }: VisibleUnfurlCardProps) {
  return (
    <article
      className={styles['v2-permalink-unfurl__card']}
      role="region"
      aria-label={`Message from a discoverable channel: ${channelName}`}
    >
      <div className={styles['v2-permalink-unfurl__card-section']}>
        <span className={styles['v2-permalink-unfurl__card-eyebrow']}>
          Message from a discoverable channel
        </span>
        <header className={styles['v2-permalink-unfurl__card-name-row']}>
          <span
            className={styles['v2-permalink-unfurl__card-lock']}
            aria-hidden
          >
            <Icon size="16" glyph={<LockOutlineIcon />} />
          </span>
          <h4 className={styles['v2-permalink-unfurl__card-name']}>
            {channelName}
          </h4>
        </header>
      </div>
      <hr className={styles['v2-permalink-unfurl__card-divider']} aria-hidden />
      <div className={styles['v2-permalink-unfurl__card-section']}>
        <p className={styles['v2-permalink-unfurl__card-body']}>
          Message contents are hidden until you&apos;re a channel member.
        </p>
        <div className={styles['v2-permalink-unfurl__card-actions']}>
          <Button
            emphasis="Tertiary"
            size="Small"
            onClick={() => onRequest?.()}
          >
            Request to join
          </Button>
        </div>
      </div>
    </article>
  );
}
