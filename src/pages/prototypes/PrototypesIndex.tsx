import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { PROTOTYPES, GROUP_META, getCollectionPrototypes } from '@/manifests/prototypes';
import type { PrototypeEntry, PrototypeGroup } from '@/manifests/prototypes';
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

// All entries grouped, each group sorted by addedAt desc, groups ordered by most recent entry.
function getGrouped(entries: PrototypeEntry[]): Array<[PrototypeGroup, PrototypeEntry[]]> {
  const byGroup = new Map<PrototypeGroup, PrototypeEntry[]>();
  for (const p of entries) {
    if (!byGroup.has(p.group)) byGroup.set(p.group, []);
    byGroup.get(p.group)!.push(p);
  }
  for (const arr of byGroup.values()) {
    arr.sort((a, b) => b.addedAt.localeCompare(a.addedAt));
  }
  return [...byGroup.entries()].sort(([, a], [, b]) =>
    b[0].addedAt.localeCompare(a[0].addedAt),
  );
}

const recentFeatured = getRecentFeatured(PROTOTYPES);
const attributeManagement = getCollectionPrototypes('attribute-management');
const grouped = getGrouped(PROTOTYPES);

export default function PrototypesIndex() {
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

        {/* ── Attribute Management (curated, by creation date) ──────────── */}
        {attributeManagement.length > 0 && (
          <section className={styles['prototypes-index__section']}>
            <div className={styles['prototypes-index__section-header']}>
              <h2 className={styles['prototypes-index__section-heading']}>
                Attribute Management
              </h2>
              <span className={styles['prototypes-index__group-count']}>
                {attributeManagement.length}{' '}
                {attributeManagement.length === 1 ? 'prototype' : 'prototypes'}
                {' · newest first'}
              </span>
            </div>

            <div className={styles['prototypes-index__cards-grid']}>
              {attributeManagement.map((p) => {
                const meta = GROUP_META[p.group];
                return (
                  <Link
                    key={p.id}
                    to={p.path}
                    className={styles['prototypes-index__card']}
                    style={{ '--proto-accent': meta.accentColor } as CSSProperties}
                  >
                    <div className={styles['prototypes-index__card-accent']} />
                    <div className={styles['prototypes-index__card-body']}>
                      <div className={styles['prototypes-index__card-title']}>{p.label}</div>
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
                );
              })}
            </div>
          </section>
        )}

        {/* ── All Prototypes (grouped) ──────────────────────────────────── */}
        <section className={styles['prototypes-index__section']}>
          <h2 className={styles['prototypes-index__section-heading']}>All Prototypes</h2>

          {grouped.map(([group, entries]) => {
            const meta = GROUP_META[group];
            return (
              <div key={group} className={styles['prototypes-index__group']}>
                <div className={styles['prototypes-index__group-header']}>
                  <h3 className={styles['prototypes-index__group-title']}>{meta.label}</h3>
                  <span className={styles['prototypes-index__group-count']}>
                    {entries.length} {entries.length === 1 ? 'prototype' : 'prototypes'}
                  </span>
                </div>

                <div className={styles['prototypes-index__cards-grid']}>
                  {entries.map((p) => (
                    <Link
                      key={p.id}
                      to={p.path}
                      className={styles['prototypes-index__card']}
                      style={{ '--proto-accent': meta.accentColor } as CSSProperties}
                    >
                      <div className={styles['prototypes-index__card-accent']} />
                      <div className={styles['prototypes-index__card-body']}>
                        <div className={styles['prototypes-index__card-title']}>{p.label}</div>
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
            );
          })}
        </section>
      </div>
    </div>
  );
}
