/**
 * DPC V2 A1 — ChannelSwitcher (NEW in V2; Wave 2D implementation).
 *
 * Mock Cmd+K-style switcher panel demonstrating §3.8 and §3.9.
 *
 *   Option A — Eligible user with DPC results
 *     Two sections: primary "Your channels" (joined) and secondary
 *     "Channels you can request to join" (DPC results with lock-plus
 *     prefix). Hover reveals inline "Request to Join" CTA.
 *
 *   Option B — Non-matching empty results
 *     Same switcher, query "regional". Just "No channels found" — no count
 *     of hidden results, no leakage signal. Annotated with FR-21 / T-11.
 *
 * The current switcher query and audience (driven by permalinkAudience
 * stash) determine which option renders; we expose a local mode toggle for
 * reviewer scrubbing.
 */
import { useState } from 'react';
import LockIcon from '@mattermost/compass-icons/components/lock-outline';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import HashtagIcon from '@mattermost/compass-icons/components/pound';
import MagnifyIcon from '@mattermost/compass-icons/components/magnify';
import Button from '@/components/ui/Button/Button';
import Icon from '@/components/ui/Icon/Icon';
import TextInput from '@/components/ui/TextInput/TextInput';
import EmptyState from '@/components/ui/EmptyState/EmptyState';
import type { A1V2StoreApi } from '../useA1V2Store';
import styles from './ChannelSwitcher.module.scss';

export interface ChannelSwitcherProps {
  store: A1V2StoreApi;
}

type SwitcherOption = 'eligible' | 'non-matching';

const OPTIONS: Array<{ key: SwitcherOption; label: string }> = [
  { key: 'eligible', label: 'Option A — Eligible user (with DPC results)' },
  { key: 'non-matching', label: 'Option B — Non-matching (empty results)' },
];

interface JoinedRow {
  name: string;
  recent?: boolean;
}

interface DpcRow {
  name: string;
  memberCount: number;
}

const JOINED_RESULTS: JoinedRow[] = [
  { name: 'west-region-engineering', recent: true },
  { name: 'region-leads' },
  { name: 'east-region-engineering' },
];

const DPC_RESULTS: DpcRow[] = [
  { name: 'regional-taskforce', memberCount: 47 },
  { name: 'region-policy-review', memberCount: 12 },
  { name: 'west-region-ops', memberCount: 203 },
];

function LockPlus({ size = 16 }: { size?: 12 | 16 }) {
  return (
    <span
      className={styles['v2-channel-switcher__lockplus']}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <LockIcon size={size} />
      <span
        className={styles['v2-channel-switcher__lockplus-plus']}
        style={{ width: Math.round(size * 0.6), height: Math.round(size * 0.6) }}
      >
        <PlusIcon size={Math.round(size * 0.6)} />
      </span>
    </span>
  );
}

export default function ChannelSwitcher({ store }: ChannelSwitcherProps) {
  const [option, setOption] = useState<SwitcherOption>('eligible');
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const query = option === 'eligible' ? 'region' : 'regional';

  return (
    <section
      className={styles['v2-channel-switcher']}
      aria-label="Channel switcher (Cmd+K) preview"
    >
      <header className={styles['v2-channel-switcher__header']}>
        <div>
          <h3 className={styles['v2-channel-switcher__title']}>
            Channel switcher
          </h3>
          <p className={styles['v2-channel-switcher__subtitle']}>
            §3.8 separate &quot;Channels you can request to join&quot; section
            with lock-plus prefix; §3.9 identical empty state for non-matching
            users (FR-21 leakage prevention).
          </p>
        </div>
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
                store.setSwitcherQuery(opt.key === 'eligible' ? 'region' : 'regional');
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </header>

      <div className={styles['v2-channel-switcher__panel']}>
        <div className={styles['v2-channel-switcher__panel-header']}>
          <TextInput
            size="Large"
            placeholder="Find a channel"
            leadingIcon={<Icon size="16" glyph={<MagnifyIcon />} />}
            value={query}
            readOnly
            aria-label="Switcher query (read-only demo)"
          />
        </div>

        {option === 'eligible' ? (
          <div className={styles['v2-channel-switcher__results']}>
            <section
              className={styles['v2-channel-switcher__section']}
              aria-labelledby="switcher-section-joined"
            >
              <h4
                id="switcher-section-joined"
                className={styles['v2-channel-switcher__section-heading']}
              >
                Channels
              </h4>
              <ul className={styles['v2-channel-switcher__list']}>
                {JOINED_RESULTS.map((row, idx) => (
                  <li
                    key={row.name}
                    className={[
                      styles['v2-channel-switcher__row'],
                      idx === 0
                        ? styles['v2-channel-switcher__row--selected']
                        : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    aria-selected={idx === 0 || undefined}
                  >
                    <span className={styles['v2-channel-switcher__row-prefix']}>
                      <Icon size="16" glyph={<HashtagIcon />} />
                    </span>
                    <span className={styles['v2-channel-switcher__row-name']}>
                      {row.name}
                    </span>
                    {row.recent ? (
                      <span className={styles['v2-channel-switcher__row-meta']}>
                        recent
                      </span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </section>

            <section
              className={styles['v2-channel-switcher__section']}
              aria-labelledby="switcher-section-dpc"
            >
              <h4
                id="switcher-section-dpc"
                className={styles['v2-channel-switcher__section-heading']}
              >
                Channels you can request to join
              </h4>
              <ul
                className={styles['v2-channel-switcher__list']}
                role="listbox"
                aria-label="Discoverable channels you can request to join"
              >
                {DPC_RESULTS.map((row, idx) => {
                  const hovered = hoverIdx === idx;
                  return (
                    <li
                      key={row.name}
                      className={[
                        styles['v2-channel-switcher__row'],
                        styles['v2-channel-switcher__row--dpc'],
                        hovered
                          ? styles['v2-channel-switcher__row--hover']
                          : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      onMouseEnter={() => setHoverIdx(idx)}
                      onMouseLeave={() => setHoverIdx(null)}
                      onFocus={() => setHoverIdx(idx)}
                      onBlur={() => setHoverIdx(null)}
                      role="option"
                      tabIndex={0}
                      aria-selected={hovered}
                      aria-label={`Discoverable channel ${row.name}, ${row.memberCount} members. Press Enter to request to join.`}
                    >
                      <span
                        className={styles['v2-channel-switcher__row-prefix']}
                      >
                        <LockPlus size={16} />
                      </span>
                      <span
                        className={styles['v2-channel-switcher__row-name']}
                      >
                        {row.name}
                      </span>
                      <span
                        className={styles['v2-channel-switcher__row-count']}
                      >
                        {row.memberCount} members
                      </span>
                      {hovered ? (
                        <span
                          className={styles['v2-channel-switcher__row-cta']}
                        >
                          <Button emphasis="Primary" size="X-Small">
                            Request to Join
                          </Button>
                        </span>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            </section>
          </div>
        ) : (
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

        <footer className={styles['v2-channel-switcher__panel-footer']}>
          <span>↑↓ navigate</span>
          <span>↵ select</span>
          <span>ESC to close</span>
        </footer>
      </div>

      {option === 'non-matching' ? (
        <aside
          className={styles['v2-channel-switcher__security-note']}
          aria-label="FR-21 leakage prevention note"
        >
          <span
            className={styles['v2-channel-switcher__security-note-label']}
          >
            Security note · FR-21 / T-11 mitigation
          </span>
          <p className={styles['v2-channel-switcher__security-note-body']}>
            Non-matching ABAC users get the <strong>same</strong> empty state
            that a query-with-no-results-for-anyone produces. No count of
            hidden results, no &quot;you don&apos;t have access&quot;
            treatment. ABAC filter applies <strong>before</strong> ranking and
            pagination (NFR-12). Switcher-as-enumeration neutralized at the
            visible-pixel layer.
          </p>
        </aside>
      ) : null}
    </section>
  );
}
