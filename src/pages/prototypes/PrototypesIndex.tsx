import { useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import {
  PROTOTYPES,
  GROUP_META,
  INITIATIVE_META,
  getInitiativeGroups,
} from '@/manifests/prototypes';
import type {
  PrototypeEntry,
  PrototypeGroup,
  Initiative,
} from '@/manifests/prototypes';
import PageHero from '@/components/layout/PageHero/PageHero';
import shellStyles from '@/pages/_shell/DocShell.module.scss';
import styles from './PrototypesIndex.module.scss';

function formatDate(iso: string): string {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// One featured entry per group, sorted by group's most recent addedAt. Top 4.
function getRecentFeatured(entries: PrototypeEntry[]): PrototypeEntry[] {
  const byGroup = new Map<PrototypeGroup, PrototypeEntry[]>();
  for (const p of entries) {
    if (!byGroup.has(p.group)) byGroup.set(p.group, []);
    byGroup.get(p.group)!.push(p);
  }

  const featured: PrototypeEntry[] = [];
  for (const groupEntries of byGroup.values()) {
    const sorted = [...groupEntries].sort((a, b) => b.addedAt.localeCompare(a.addedAt));
    featured.push(sorted.find((e) => e.isPrimary) ?? sorted[0]);
  }

  return featured.sort((a, b) => b.addedAt.localeCompare(a.addedAt)).slice(0, 4);
}

// Category filter order — broadest / most-active first.
const CATEGORY_ORDER: PrototypeGroup[] = [
  'zero-trust-abac',
  'data-policy',
  'navigation',
  'encryption-privacy',
  'calls-platform',
];

const recentFeatured = getRecentFeatured(PROTOTYPES);
const initiativeGroups = getInitiativeGroups(PROTOTYPES);

// Categories that actually have prototypes, in the fixed display order.
const activeCategories = CATEGORY_ORDER.filter((cat) =>
  initiativeGroups.some((g) => INITIATIVE_META[g.initiative].group === cat),
);

type CategoryFilter = PrototypeGroup | 'all';

export default function PrototypesIndex() {
  // Default: the most-recently-updated initiative is open, the rest collapsed.
  const [expanded, setExpanded] = useState<Set<Initiative>>(
    () => new Set(initiativeGroups.length ? [initiativeGroups[0].initiative] : []),
  );
  const [category, setCategory] = useState<CategoryFilter>('all');

  const visibleGroups = useMemo(
    () =>
      category === 'all'
        ? initiativeGroups
        : initiativeGroups.filter(
            (g) => INITIATIVE_META[g.initiative].group === category,
          ),
    [category],
  );

  function toggle(initiative: Initiative) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(initiative)) next.delete(initiative);
      else next.add(initiative);
      return next;
    });
  }

  function expandAll() {
    setExpanded(new Set(visibleGroups.map((g) => g.initiative)));
  }

  function collapseAll() {
    setExpanded(new Set());
  }

  const visibleCount = visibleGroups.reduce((n, g) => n + g.entries.length, 0);
  const allVisibleOpen =
    visibleGroups.length > 0 && visibleGroups.every((g) => expanded.has(g.initiative));

  return (
    <div className={shellStyles['doc-shell']}>
      <div className={shellStyles['doc-shell__top']}>
        <PageHero
          breadcrumb="Prototypes"
          title="Prototypes"
          description="End-to-end flow prototypes used for design exploration and stakeholder review."
        />
      </div>

      <div
        className={`${shellStyles['doc-shell__body']} ${shellStyles['doc-shell__body--standalone']}`}
      >
        {PROTOTYPES.length === 0 && (
          <p className={styles['prototypes-index__empty']}>
            No prototypes registered yet. Add entries to <code>PROTOTYPES</code> in{' '}
            <code>src/manifests/prototypes.ts</code>.
          </p>
        )}

        {/* ── Recently Updated ──────────────────────────────────────────── */}
        <section className={styles['prototypes-index__section']}>
          <h2 className={styles['prototypes-index__section-heading']}>Recently Updated</h2>
          <div className={styles['prototypes-index__recent-grid']}>
            {recentFeatured.map((p) => {
              const meta = GROUP_META[p.group];
              return (
                <Link
                  key={p.id}
                  to={p.path}
                  className={styles['prototypes-index__feature-card']}
                  style={{ '--proto-accent': meta.accentColor } as CSSProperties}
                >
                  <div className={styles['prototypes-index__card-accent']} />
                  <div className={styles['prototypes-index__card-body']}>
                    <div className={styles['prototypes-index__card-tag']}>{meta.label}</div>
                    <div className={styles['prototypes-index__card-title']}>{p.label}</div>
                    {p.description && (
                      <div className={styles['prototypes-index__card-desc']}>{p.description}</div>
                    )}
                    <div className={styles['prototypes-index__card-footer']}>
                      <span className={styles['prototypes-index__card-date']}>
                        {formatDate(p.addedAt)}
                      </span>
                      <span className={styles['prototypes-index__card-arrow']} aria-hidden="true">
                        →
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* ── By initiative (filterable accordion) ──────────────────────── */}
        <section className={styles['prototypes-index__section']}>
          <div className={styles['prototypes-index__section-header']}>
            <h2 className={styles['prototypes-index__section-heading']}>Browse by initiative</h2>
            <span className={styles['prototypes-index__group-count']}>
              {visibleCount} {visibleCount === 1 ? 'prototype' : 'prototypes'} ·{' '}
              {visibleGroups.length}{' '}
              {visibleGroups.length === 1 ? 'initiative' : 'initiatives'}
            </span>
          </div>

          {/* Category filter + expand/collapse controls */}
          <div className={styles['prototypes-index__toolbar']}>
            <div
              className={styles['prototypes-index__filters']}
              role="group"
              aria-label="Filter by category"
            >
              <button
                type="button"
                className={styles['prototypes-index__chip']}
                aria-pressed={category === 'all'}
                onClick={() => setCategory('all')}
              >
                All
              </button>
              {activeCategories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={styles['prototypes-index__chip']}
                  aria-pressed={category === cat}
                  onClick={() => setCategory(cat)}
                  style={
                    { '--proto-accent': GROUP_META[cat].accentColor } as CSSProperties
                  }
                >
                  <span
                    className={styles['prototypes-index__chip-dot']}
                    aria-hidden="true"
                  />
                  {GROUP_META[cat].label}
                </button>
              ))}
            </div>

            <button
              type="button"
              className={styles['prototypes-index__expand-toggle']}
              onClick={allVisibleOpen ? collapseAll : expandAll}
            >
              {allVisibleOpen ? 'Collapse all' : 'Expand all'}
            </button>
          </div>

          {/* Initiative accordion */}
          <div className={styles['prototypes-index__accordion']}>
            {visibleGroups.map(({ initiative, entries }) => {
              const meta = INITIATIVE_META[initiative];
              const groupMeta = GROUP_META[meta.group];
              const isOpen = expanded.has(initiative);
              const panelId = `initiative-${initiative}`;

              return (
                <div
                  key={initiative}
                  className={styles['prototypes-index__init']}
                  style={{ '--proto-accent': groupMeta.accentColor } as CSSProperties}
                >
                  <button
                    type="button"
                    className={styles['prototypes-index__init-header']}
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => toggle(initiative)}
                  >
                    <span
                      className={`${styles['prototypes-index__chevron']} ${
                        isOpen ? styles['prototypes-index__chevron--open'] : ''
                      }`}
                      aria-hidden="true"
                    >
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path
                          d="M3 1.5L6.5 5L3 8.5"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                    <span className={styles['prototypes-index__init-heading']}>
                      <span className={styles['prototypes-index__init-title']}>{meta.label}</span>
                      {meta.blurb && (
                        <span className={styles['prototypes-index__init-blurb']}>
                          {meta.blurb}
                        </span>
                      )}
                    </span>
                    <span className={styles['prototypes-index__init-meta']}>
                      <span className={styles['prototypes-index__init-tag']}>
                        {groupMeta.label}
                      </span>
                      <span className={styles['prototypes-index__init-count']}>
                        {entries.length}
                      </span>
                    </span>
                  </button>

                  {isOpen && (
                    <div id={panelId} className={styles['prototypes-index__init-panel']}>
                      <div className={styles['prototypes-index__cards-grid']}>
                        {entries.map((p) => (
                          <Link
                            key={p.id}
                            to={p.path}
                            className={styles['prototypes-index__card']}
                            style={
                              { '--proto-accent': GROUP_META[p.group].accentColor } as CSSProperties
                            }
                          >
                            <div className={styles['prototypes-index__card-accent']} />
                            <div className={styles['prototypes-index__card-body']}>
                              <div className={styles['prototypes-index__card-title']}>
                                {p.label}
                              </div>
                              {p.description && (
                                <div className={styles['prototypes-index__card-desc']}>
                                  {p.description}
                                </div>
                              )}
                              <div className={styles['prototypes-index__card-date']}>
                                {formatDate(p.addedAt)}
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
