/**
 * DPC V2 A1 — ChannelSwitcher ("Find channels").
 *
 * High-fidelity match for Figma 4888:61083:
 *
 *   - title "Find channels" — Metropolis SemiBold 22/28
 *   - header padded 32H / 24V, 1px center-channel-color/12 bottom border,
 *     24px gap between title and search input
 *   - search: full-width, 1px border center-channel-color/16, 4px radius,
 *     magnify leading icon, "Search" placeholder
 *   - body: 12H / 8V padding around scroll region
 *   - section heading: 28px tall, 6V / 20H padding, Open Sans SemiBold
 *     12/16 uppercase @ 56% (RECENT bumps to wider 0.48px tracking)
 *   - row: 16L / 20R, 8V padding, 4px radius, hover/selected bg
 *     center-channel-color/8; icon 16px @ center-channel-color/64 + 4px
 *     pad + 8px gap + name + 6px gap + ~slug + optional MentionBadge;
 *     right slot: team name (right-aligned, 12/56%)
 *   - DPC rows use the composite lock-plus glyph (sandbox LockPlus
 *     pattern reused from IndicatorShowcase)
 *
 * Hover-reveal Request-to-Join CTA (per stakeholder feedback):
 *   On :hover OR :focus-within of a DPC row, the team-name slot is
 *   hidden and an inline Tertiary X-Small "Request to join" button is
 *   revealed in its place. Pure CSS; keyboard Tab onto the row also
 *   surfaces the CTA. This resolves the prior real-estate conflict
 *   between team name and CTA fighting for the same end-of-row space.
 *
 *   Option A — Eligible user, no query (default state):
 *     Three grouped sections (UNREAD, RECENT, DPC). Rows render in their
 *     natural default state — hover/focus only highlights via real
 *     pointer or keyboard interaction. No forced-hover demo state.
 *
 *   Option B — Non-matching empty results:
 *     Standard "No channels found" empty state. Byte-identical to a
 *     query that matches nothing for anyone. FR-21 / T-11 mitigation.
 *
 *   Option C — Search mode (unified list):
 *     User has typed a query ("ops"). Section grouping collapses — all
 *     matches render as one ranked list with no headings. DPC rows are
 *     intermixed; the lock-plus icon carries the DPC signal at-row
 *     level. Hover-reveal CTA pattern still applies on DPC rows.
 *
 * The FR-21 leakage rationale and the hover-reveal design decision are
 * captured in the Review notes block below the canvas — never inside
 * the product UI itself. A separate "Hover state demo" review item
 * shows the revealed CTA so reviewers don't need to mouse in.
 */
import { useEffect, useState } from 'react';
import LockOutlineIcon from '@mattermost/compass-icons/components/lock-outline';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import LockIcon from '@mattermost/compass-icons/components/lock';
import GlobeIcon from '@mattermost/compass-icons/components/globe';
import MagnifyIcon from '@mattermost/compass-icons/components/magnify';
import CloseIcon from '@mattermost/compass-icons/components/close';
import Button from '@/components/ui/Button/Button';
import ChannelHeader from '@/components/ui/ChannelHeader/ChannelHeader';
import EmptyState from '@/components/ui/EmptyState/EmptyState';
import Icon from '@/components/ui/Icon/Icon';
import IconButton from '@/components/ui/IconButton/IconButton';
import MentionBadge from '@/components/ui/MentionBadge/MentionBadge';
import Scrollbars from '@/components/ui/Scrollbars/Scrollbars';
import TextInput from '@/components/ui/TextInput/TextInput';
import AppOverlay from '../_components/AppOverlay';
import DpcAppShell, { shellStyles } from '../_components/DpcAppShell';
import ScreenCanvas from '../_components/ScreenCanvas';
import type { A1V2StoreApi } from '../useA1V2Store';
import styles from './ChannelSwitcher.module.scss';

export interface ChannelSwitcherProps {
  store: A1V2StoreApi;
}

type SwitcherOption = 'eligible' | 'non-matching' | 'search-mode';

const OPTIONS: Array<{ key: SwitcherOption; label: string }> = [
  { key: 'eligible', label: 'Option A — Eligible user (default, no query)' },
  { key: 'non-matching', label: 'Option B — Non-matching (empty results)' },
  { key: 'search-mode', label: 'Option C — Search mode (unified list)' },
];

type RowKind = 'public' | 'private' | 'dpc';

interface SwitcherRow {
  id: string;
  channelName: string;
  urlSlug: string;
  kind: RowKind;
  team: string;
  unreadCount?: number;
}

const UNREAD_ROWS: SwitcherRow[] = [
  {
    id: 'ask-anything',
    channelName: 'Ask Anything',
    urlSlug: 'announcements',
    kind: 'public',
    team: 'Team',
    unreadCount: 1,
  },
  {
    id: 'ask-r-and-d',
    channelName: 'Ask R&D',
    urlSlug: 'ask-r-and-d',
    kind: 'public',
    team: 'Team Two',
    unreadCount: 3,
  },
  {
    id: 'bugs',
    channelName: 'Bugs',
    urlSlug: 'bugs',
    kind: 'public',
    team: 'Team Two',
  },
];

const RECENT_ROWS: SwitcherRow[] = [
  {
    id: 'contributors',
    channelName: 'Contributors',
    urlSlug: 'contributors',
    kind: 'public',
    team: 'Team',
  },
  {
    id: 'design-challenge',
    channelName: 'Design Challenge',
    urlSlug: 'design-challenge',
    kind: 'private',
    team: 'Team',
  },
  {
    id: 'developers-webapp',
    channelName: 'Developers: Webapp',
    urlSlug: 'developers-web-app',
    kind: 'private',
    team: 'Team',
  },
  {
    id: 'integrations-apps',
    channelName: 'Integrations and Apps',
    urlSlug: 'integrations-and-apps',
    kind: 'private',
    team: 'Team',
  },
  {
    id: 'off-topic',
    channelName: 'Off-Topic',
    urlSlug: 'off-topic',
    kind: 'public',
    team: 'Team',
  },
];

const DPC_ROWS: SwitcherRow[] = [
  {
    id: 'regional-taskforce',
    channelName: 'regional-taskforce',
    urlSlug: 'regional-taskforce',
    kind: 'dpc',
    team: 'Operations',
  },
  {
    id: 'region-policy-review',
    channelName: 'region-policy-review',
    urlSlug: 'region-policy-review',
    kind: 'dpc',
    team: 'Operations',
  },
  {
    id: 'west-region-ops',
    channelName: 'west-region-ops',
    urlSlug: 'west-region-ops',
    kind: 'dpc',
    team: 'Operations',
  },
];

// ── Search-mode (Option C) ──────────────────────────────────────────
// When the user has typed a query (e.g. "ops"), section grouping
// collapses into one ranked list with no headings. Mattermost's
// existing Quick Switcher behaves this way — sections appear only in
// the no-query state. DPC rows stay intermixed; the lock-plus icon
// itself carries the DPC signal at-row level.
const SEARCH_QUERY = 'ops';

const SEARCH_RESULTS_ROWS: SwitcherRow[] = [
  {
    id: 'search-ask-anything',
    channelName: 'Ask Anything',
    urlSlug: 'announcements',
    kind: 'public',
    team: 'Team',
    unreadCount: 1,
  },
  {
    id: 'search-west-region-ops',
    channelName: 'west-region-ops',
    urlSlug: 'west-region-ops',
    kind: 'dpc',
    team: 'Operations',
  },
  {
    id: 'search-off-topic',
    channelName: 'Off-Topic',
    urlSlug: 'off-topic',
    kind: 'public',
    team: 'Team',
  },
  {
    id: 'search-regional-taskforce',
    channelName: 'regional-taskforce',
    urlSlug: 'regional-taskforce',
    kind: 'dpc',
    team: 'Operations',
  },
  {
    id: 'search-integrations-apps',
    channelName: 'Integrations and Apps',
    urlSlug: 'integrations-and-apps',
    kind: 'private',
    team: 'Team',
  },
  {
    id: 'search-region-policy-review',
    channelName: 'region-policy-review',
    urlSlug: 'region-policy-review',
    kind: 'dpc',
    team: 'Operations',
  },
];

interface LockPlusProps {
  size?: number;
}

/**
 * Composite lock-plus glyph for DPC rows: lock-outline base with a
 * small plus glyph overlay at the bottom-right. Compass DS does not
 * ship a single `lock-plus-line` token; this assembles it from
 * existing glyphs and is reused across DPC indicator surfaces in the
 * sandbox (IndicatorShowcase, InChannelAdminSysMsg, etc.).
 */
function LockPlus({ size = 16 }: LockPlusProps) {
  const overlay = Math.round(size * 0.62);
  return (
    <span
      className={styles['v2-channel-switcher__lockplus']}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <LockOutlineIcon size={size} />
      <span
        className={styles['v2-channel-switcher__lockplus-plus']}
        style={{ width: overlay, height: overlay }}
      >
        <PlusIcon size={overlay - 2} />
      </span>
    </span>
  );
}

interface RowPrefixProps {
  kind: RowKind;
}

function RowPrefix({ kind }: RowPrefixProps) {
  if (kind === 'dpc') {
    return (
      <span className={styles['v2-channel-switcher__row-icon']}>
        <LockPlus size={16} />
      </span>
    );
  }
  return (
    <span className={styles['v2-channel-switcher__row-icon']}>
      <Icon
        size="16"
        glyph={kind === 'private' ? <LockIcon /> : <GlobeIcon />}
      />
    </span>
  );
}

interface RowProps {
  row: SwitcherRow;
  /** Selected (keyboard-focused) row. */
  selected?: boolean;
  /**
   * Used ONLY in the explicit "Hover state demo" review-notes block to
   * statically render a DPC row in its hover-revealed state so
   * reviewers can see the CTA without mousing in. Never used inside
   * the live switcher UI — production rows toggle via real `:hover`
   * and `:focus-within` only.
   */
  demoHover?: boolean;
  /** Click handler on the inline "Request to join" CTA (DPC rows only). */
  onRequest?: () => void;
}

function Row({
  row,
  selected = false,
  demoHover = false,
  onRequest,
}: RowProps) {
  const isDpc = row.kind === 'dpc';
  const rowClass = [
    styles['v2-channel-switcher__row'],
    selected ? styles['v2-channel-switcher__row--selected'] : '',
    demoHover ? styles['v2-channel-switcher__row--demo-hover'] : '',
    isDpc ? styles['v2-channel-switcher__row--dpc'] : '',
  ]
    .filter(Boolean)
    .join(' ');

  const ariaLabel = isDpc
    ? `${row.channelName} (request to join)`
    : row.channelName;

  return (
    <div
      className={rowClass}
      role="option"
      aria-selected={selected}
      aria-label={ariaLabel}
      tabIndex={isDpc ? 0 : -1}
    >
      <RowPrefix kind={row.kind} />
      <span className={styles['v2-channel-switcher__row-name']}>
        {row.channelName}
      </span>
      <span className={styles['v2-channel-switcher__row-slug']}>
        ~{row.urlSlug}
      </span>
      {row.unreadCount != null && row.unreadCount > 0 && (
        <span className={styles['v2-channel-switcher__row-badge']}>
          <MentionBadge
            count={row.unreadCount}
            location="Menu Item"
            size="Small"
          />
        </span>
      )}
      <span className={styles['v2-channel-switcher__row-tail']}>
        <span className={styles['v2-channel-switcher__row-team']}>
          {row.team}
        </span>
        {isDpc && (
          <span className={styles['v2-channel-switcher__row-cta']}>
            <Button
              emphasis="Tertiary"
              size="X-Small"
              onClick={() => onRequest?.()}
            >
              Request to join
            </Button>
          </span>
        )}
      </span>
    </div>
  );
}

interface SectionProps {
  heading: string;
  /** Wider letter-spacing variant for short labels (e.g. "RECENT") per Figma. */
  wideTracking?: boolean;
  children: React.ReactNode;
}

function Section({ heading, wideTracking = false, children }: SectionProps) {
  const headingClass = [
    styles['v2-channel-switcher__section-heading'],
    wideTracking ? styles['v2-channel-switcher__section-heading--wide'] : '',
  ]
    .filter(Boolean)
    .join(' ');
  return (
    <section className={styles['v2-channel-switcher__section']}>
      <h4 className={headingClass}>{heading}</h4>
      <div role="listbox">{children}</div>
    </section>
  );
}

export default function ChannelSwitcher({ store }: ChannelSwitcherProps) {
  const [option, setOption] = useState<SwitcherOption>('eligible');

  const query =
    option === 'eligible'
      ? ''
      : option === 'search-mode'
        ? SEARCH_QUERY
        : 'regional-taskforce';

  // v2.3 §6.5 / FR-21 — when the switcher renders the "non-matching" silent
  // empty state, emit the aggregate-only telemetry counter. No per-user
  // audit (NFR-12 carve-out).
  useEffect(() => {
    if (option === 'non-matching') store.recordSwitcherSilent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [option]);

  const onDpcRequest = () => store.openRequestToJoin(store.focusChannel.id);

  const switcherPanel = (
    <div
      className={styles['v2-channel-switcher__panel']}
      role="dialog"
      aria-modal="true"
      aria-label="Find channels"
    >
      <div className={styles['v2-channel-switcher__panel-header']}>
        <div className={styles['v2-channel-switcher__title-row']}>
          <h3 className={styles['v2-channel-switcher__title']}>Find channels</h3>
          <IconButton
            className={styles['v2-channel-switcher__close']}
            icon={<Icon size="20" glyph={<CloseIcon />} />}
            aria-label="Close"
          />
        </div>
        <div className={styles['v2-channel-switcher__search']}>
          <TextInput
            size="Medium"
            placeholder="Search"
            leadingIcon={<Icon size="16" glyph={<MagnifyIcon />} />}
            defaultValue={query}
            aria-label="Search channels"
          />
        </div>
      </div>

      <div className={styles['v2-channel-switcher__body']}>
        <Scrollbars>
          <div className={styles['v2-channel-switcher__body-inner']}>
            {option === 'eligible' && (
              <>
                <Section heading="Unread">
                  {UNREAD_ROWS.map((row) => (
                    <Row
                      key={row.id}
                      row={row}
                      selected={row.id === 'bugs'}
                    />
                  ))}
                </Section>
                <Section heading="Recent" wideTracking>
                  {RECENT_ROWS.map((row) => (
                    <Row key={row.id} row={row} />
                  ))}
                </Section>
                <Section heading="Channels you can request to join">
                  {DPC_ROWS.map((row) => (
                    <Row key={row.id} row={row} onRequest={onDpcRequest} />
                  ))}
                </Section>
              </>
            )}

            {option === 'search-mode' && (
              <div
                className={styles['v2-channel-switcher__unified-list']}
                role="listbox"
                aria-label="Search results"
              >
                {SEARCH_RESULTS_ROWS.map((row, idx) => (
                  <Row
                    key={row.id}
                    row={row}
                    selected={idx === 0}
                    onRequest={onDpcRequest}
                  />
                ))}
              </div>
            )}

            {option === 'non-matching' && (
              <div className={styles['v2-channel-switcher__empty']}>
                <EmptyState
                  title="No channels found."
                  description="Try a different search, or browse all channels you can access."
                  action={{
                    emphasis: 'Secondary',
                    children: 'Open Browse Channels',
                  }}
                />
              </div>
            )}
          </div>
        </Scrollbars>
      </div>
    </div>
  );

  return (
    <ScreenCanvas
      eyebrow="§3.8 · §3.9"
      title="Channel switcher (Cmd+K)"
      subtitle={
        'Cmd+K switcher at canonical top-center position over the channel. Matches the existing "Find channels" pattern; DPC rows use the lock-plus prefix and reveal an inline "Request to join" CTA on hover or keyboard focus.'
      }
      canvas={
        <div className={styles['v2-channel-switcher__container']}>
          <div
            className={styles['v2-channel-switcher__mode-switch']}
            role="tablist"
            aria-label="Switcher audience option"
          >
            {OPTIONS.map((opt) => (
              <button
                type="button"
                key={opt.key}
                role="tab"
                aria-selected={option === opt.key}
                className={[
                  styles['v2-channel-switcher__mode-btn'],
                  option === opt.key
                    ? styles['v2-channel-switcher__mode-btn--active']
                    : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => {
                  setOption(opt.key);
                  store.setSwitcherQuery(
                    opt.key === 'eligible'
                      ? ''
                      : opt.key === 'search-mode'
                        ? SEARCH_QUERY
                        : 'regional-taskforce',
                  );
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <DpcAppShell
            focusChannelName="west-region-engineering"
            focusIsDiscoverable={false}
            channelHeader={
              <ChannelHeader
                type="Channel"
                name="west-region-engineering"
                description="Engineering coordination for the West region."
                memberCount={62}
                pinnedCount={4}
              />
            }
            overlay={
              <AppOverlay align="top" maxWidth={680}>
                {switcherPanel}
              </AppOverlay>
            }
          >
            <div className={shellStyles['channel-shell__messages']}>
              <Scrollbars>
                <div className={shellStyles['channel-shell__messages-list']}>
                  <EmptyState
                    title="Cmd+K opens above"
                    description="The switcher modal is anchored at top-center over this channel."
                  />
                </div>
              </Scrollbars>
            </div>
          </DpcAppShell>
        </div>
      }
      reviewSummary={
        option === 'non-matching'
          ? 'Non-matching ABAC users get the SAME empty state that a query-with-no-results-for-anyone produces. No count of hidden results, no "you don\'t have access" treatment.'
          : option === 'search-mode'
            ? 'When the user types a query, section grouping collapses into one unified ranked list — matching Mattermost\'s existing Quick Switcher behavior. The lock-plus icon (not the section heading) carries the DPC signal at row-level.'
            : 'The DPC subsection "Channels you can request to join" appears only in the no-query default state. Hover or keyboard-focus on a DPC row hides the team-name slot and reveals an inline Tertiary "Request to join" CTA in its place.'
      }
      reviewItems={[
        {
          heading: 'Hover state demo — DPC row with revealed CTA',
          body: (
            <>
              <p>
                Rows in the live switcher (Option A and Option C above) sit in
                their natural default state — no row is forced into a
                hover-painted background. The hover-reveal CTA only appears on
                actual <code>:hover</code> or <code>:focus-within</code>.
                Below is a static demo of the revealed state so reviewers can
                see the CTA without mousing in:
              </p>
              <div className={styles['v2-channel-switcher__demo-row']}>
                <Row
                  row={{
                    id: 'demo-regional-taskforce',
                    channelName: 'regional-taskforce',
                    urlSlug: 'regional-taskforce',
                    kind: 'dpc',
                    team: 'Operations',
                  }}
                  demoHover
                />
              </div>
            </>
          ),
        },
        {
          heading: 'Sections collapse in search mode (Option C)',
          body: (
            <p>
              In the default state (no query), DPC channels appear in their
              own section ("Channels you can request to join"). In search
              mode, all matching channels — public, private, and DPC —
              collapse into a unified ranked list with no section headings.
              The lock-plus icon distinguishes DPCs at-row level, so the
              meaning carries even without the verbal subsection cue. This
              matches Mattermost's existing Quick Switcher behavior, where
              sections appear only in the no-query state.
            </p>
          ),
        },
        {
          heading: 'FR-21 leakage prevention (T-11 mitigation)',
          body: (
            <p>
              ABAC filter applies <strong>before</strong> ranking and pagination
              (NFR-12). The Option B empty state is byte-identical to the empty
              state for queries that match nothing for anyone, queries that
              match only deleted channels, and queries that match
              non-discoverable (S1) private channels the viewer is not a member
              of. No differential count, no "X channels match but are hidden
              from you" hint. A non-matching viewer cannot, by typing queries
              into the switcher, derive which channel names exist that they
              don't qualify for — switcher-as-enumeration is neutralized at
              the visible-pixel layer.
            </p>
          ),
        },
        {
          heading: 'Why a hover-reveal CTA on DPC rows',
          body: (
            <p>
              The end-of-row slot already carries the team name (12px / 56%).
              Earlier iterations placed a persistent "Request to join" button
              next to it; team name and CTA fought for the same real estate
              and pushed channel names into ellipsis. We now hide the team
              name on <code>:hover</code> / <code>:focus-within</code> and
              swap an inline Tertiary X-Small button into its place. Keyboard
              users get the same affordance via Tab focus; mouse users see
              it as soon as they intend to act on the row. Idle rows stay
              calm and scannable.
            </p>
          ),
        },
        {
          heading: 'Why no "Discoverable" label tag on switcher rows',
          body: (
            <p>
              The lock-plus icon alone is the subtle indicator on switcher
              rows. The subsection heading ("Channels you can request to
              join") provides the verbal cue in the no-query state; the icon
              shape provides the visual cue (and is the sole signal in
              search mode). A full LabelTag would be redundant and would
              compete with the channel name for attention in the narrow
              switcher panel.
            </p>
          ),
        },
      ]}
    />
  );
}
