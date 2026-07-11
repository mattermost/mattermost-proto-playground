import CloseIcon from '@mattermost/compass-icons/components/close';
import ArrowExpandIcon from '@mattermost/compass-icons/components/arrow-expand';
import RightSidebar, { RightSidebarHeader } from '@/components/ui/RightSidebar';
import Message from '@/components/ui/Message/Message';
import messageStyles from '@/components/ui/Message/Message.module.scss';
import avatarLeonard from '@/assets/avatars/Leonard Riley.png';
import avatarAikoTan from '@/assets/avatars/Aiko Tan.png';
import avatarMarco from '@/assets/avatars/Marco Rinaldi.png';
import avatarSofia from '@/assets/avatars/Sofia Bauer.png';
import avatarDanielle from '@/assets/avatars/Danielle Okoro.png';
import ChannelRowPill from '../shared/ChannelRowPill';
import type { MarkingStyle } from '../shared/SceneHarness';
import { CHANNEL_LIST, type ChannelListItem } from '../shared/channelListData';
import styles from './search.module.scss';

// ─────────────────────────────────────────────────────────────────────────────
// Surface #3 — RHS Search Results panel.
//
// Search is the cross-classification AGGREGATION point: a single query returns
// hits from channels at many classification levels in one flat, date-grouped
// list. Each result carries a channel-attribution row — "[Team] · [Channel]" —
// and the propagation-surface addition is the compact classification pill placed
// right after the channel name on that attribution row.
//
// Masking is modeled in the data, not in the view: a result whose SOURCE channel
// carries `classification: undefined` (the viewer isn't cleared / it's unmarked)
// shows NO pill on its attribution row — no-trace, indistinguishable from an
// unmarked source. We reuse CHANNEL_LIST as the source-channel registry so the
// same masked/unmarked rows proven in the switcher drive results here.
// ─────────────────────────────────────────────────────────────────────────────

function byId(id: string): ChannelListItem {
  const found = CHANNEL_LIST.find((c) => c.id === id);
  if (!found) throw new Error(`Unknown channel id: ${id}`);
  return found;
}

interface SearchResult {
  key: string;
  /** Source channel id in CHANNEL_LIST — drives the attribution pill (incl. masking). */
  sourceChannelId: string;
  /** Team the source channel belongs to (attribution row: "[Team] · [Channel]"). */
  teamName: string;
  authorName: string;
  authorAvatar: string;
  timestamp: string;
  body: string;
}

// The query the user searched for (shown as a chip in the header).
const QUERY = 'threat model';

// Results deliberately span UNCLASSIFIED → CONFIDENTIAL → SECRET → TOP SECRET,
// plus one whose source channel is MASKED (undefined classification → no pill),
// so a single result list mixes levels and proves the aggregation risk + the
// per-result marking mitigation.
const TODAY_RESULTS: SearchResult[] = [
  {
    key: 't1',
    sourceChannelId: 'town-square', // UNCLASSIFIED → pill "U"
    teamName: 'Spec Reviews',
    authorName: 'Leonard Riley',
    authorAvatar: avatarLeonard,
    timestamp: '10:43 AM',
    body: 'Kicking off the threat model review — I dropped the draft attack tree in the doc. Please add abuse cases before the sync so we can prioritise mitigations together.',
  },
  {
    key: 't2',
    sourceChannelId: 'ask-r-and-d', // CONFIDENTIAL → pill "C"
    teamName: 'Spec Reviews',
    authorName: 'Aiko Tan',
    authorAvatar: avatarAikoTan,
    timestamp: '10:31 AM',
    body: 'The threat model for the ingest pipeline assumes a trusted broker — we should revisit that boundary now that partners can publish directly.',
  },
  {
    key: 't3',
    sourceChannelId: 'bugs', // MASKED (undefined) → NO pill (no-trace)
    teamName: 'Platform',
    authorName: 'Marco Rinaldi',
    authorAvatar: avatarMarco,
    timestamp: '9:58 AM',
    body: 'Filed the follow-up from the threat model workshop. Repro steps and the proposed guardrail are in the linked issue.',
  },
];

const YESTERDAY_RESULTS: SearchResult[] = [
  {
    key: 'y1',
    sourceChannelId: 'operation-aurora', // SECRET → pill "S"
    teamName: 'Operations',
    authorName: 'Sofia Bauer',
    authorAvatar: avatarSofia,
    timestamp: '4:12 PM',
    body: 'Updated the threat model with the new relay path. The residual risk is acceptable if we keep the two-person rule on key rotation.',
  },
  {
    key: 'y2',
    sourceChannelId: 'orion-launch-ops', // TOP SECRET → pill "TS" (black-on-orange)
    teamName: 'Operations',
    authorName: 'Danielle Okoro',
    authorAvatar: avatarDanielle,
    timestamp: '2:47 PM',
    body: 'Threat model sign-off is pending the comms annex. Once that lands we can close the review and move to the readiness checklist.',
  },
];

function ResultRow({ result, variant }: { result: SearchResult; variant: MarkingStyle }) {
  const source = byId(result.sourceChannelId);
  const textClass = messageStyles['message__body-text'];
  return (
    <div className={styles['search__result']}>
      {/* Channel-attribution row: "[Team] · [Channel] [pill]" with a Jump affordance.
          Pill sits right after the channel name; masked/unmarked source → nothing. */}
      <div className={styles['search__attribution']}>
        <span className={styles['search__attribution-team']}>{result.teamName}</span>
        <span className={styles['search__attribution-sep']} aria-hidden>
          ·
        </span>
        <span className={styles['search__attribution-channel']}>{source.name}</span>
        <ChannelRowPill item={source} variant={variant} />
        <button type="button" className={styles['search__jump']}>
          Jump
        </button>
      </div>
      <div className={styles['search__result-message']}>
        <Message
          avatarSrc={result.authorAvatar}
          avatarAlt={result.authorName}
          username={result.authorName}
          timestamp={result.timestamp}
          showMessageActions={false}
        >
          <p className={textClass}>{result.body}</p>
        </Message>
      </div>
    </div>
  );
}

/**
 * Surface #3 — the RHS "Search Results" panel. Reuses the design-system
 * `RightSidebar` + `RightSidebarHeader` chrome and the `Message` component for
 * each hit; the Messages/Files tabs, query chip, and date group headers are
 * recreated locally (no standalone components exist for them). The classification
 * pill is placed on each result's channel-attribution row, right after the
 * channel name, honoring the `?style=` marking-style toggle.
 */
export default function SearchResults({ variant = 'abbrev' }: { variant?: MarkingStyle }) {
  const messagesCount = TODAY_RESULTS.length + YESTERDAY_RESULTS.length;

  return (
    <div className={styles['search__frame']}>
      <RightSidebar
        header={
          <RightSidebarHeader
            title="Search Results"
            onExpand={() => {}}
            onClose={() => {}}
          />
        }
      >
        <div className={styles['search__panel']}>
          {/* Query chip row (mirrors the reference: title + query pill). */}
          <div className={styles['search__query-row']}>
            <span className={styles['search__query-chip']}>
              {QUERY}
              <span className={styles['search__query-chip-x']} aria-hidden>
                <CloseIcon size={12} />
              </span>
            </span>
            <span className={styles['search__expand-hint']} aria-hidden>
              <ArrowExpandIcon size={14} />
            </span>
          </div>

          {/* Messages / Files tabs with counts. */}
          <div className={styles['search__tabs']} role="tablist" aria-label="Search results">
            <button
              type="button"
              role="tab"
              aria-selected
              className={[styles['search__tab'], styles['search__tab--active']].join(' ')}
            >
              Messages
              <span className={styles['search__tab-count']}>{messagesCount}</span>
            </button>
            <button type="button" role="tab" aria-selected={false} className={styles['search__tab']}>
              Files
              <span className={styles['search__tab-count']}>3</span>
            </button>
          </div>

          {/* Date-grouped results. */}
          <div className={styles['search__group-header']}>Today</div>
          {TODAY_RESULTS.map((r) => (
            <ResultRow key={r.key} result={r} variant={variant} />
          ))}

          <div className={styles['search__group-header']}>Yesterday</div>
          {YESTERDAY_RESULTS.map((r) => (
            <ResultRow key={r.key} result={r} variant={variant} />
          ))}
        </div>
      </RightSidebar>
    </div>
  );
}
