import { useEffect, useState, useRef } from 'react';
import DragIcon from '@mattermost/compass-icons/components/drag-vertical';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import AlertOutlineIcon from '@mattermost/compass-icons/components/alert-outline';
import Icon from '@/components/ui/Icon/Icon';
import Modal from '@/components/ui/Modal/Modal';
import Button from '@/components/ui/Button/Button';
import SectionNotice from '@/components/ui/SectionNotice/SectionNotice';
import SchemaProvenanceRibbon from '@/components/ui/SchemaProvenanceRibbon/SchemaProvenanceRibbon';
import type { RankedSchema, RankedValue, ChipColor } from '../shared/types';
import { groupByTiedBand, nextRank, sortByRankDesc } from '../shared/types';
import styles from './D2Modal.module.scss';

interface D2ModalProps {
  schema: RankedSchema;
  open: boolean;
  onClose: () => void;
  onSave: (next: RankedSchema) => void;
}

const COLOR_HEX: Record<ChipColor, string> = {
  red: '#D24B4E',
  orange: '#E07F3C',
  yellow: '#C2A030',
  green: '#3DB887',
  blue: '#1C58D9',
  purple: '#8A5DC2',
  neutral: '#3D3C40',
};

/**
 * D2's authoritative modal-as-workspace.
 *
 * Distinguishing properties:
 *  - Drag-and-drop is the primary reorder primitive (integer auto-derives from position).
 *    R-D2-DRIFT surfaces as a banner: position-as-truth abstracts B-1/B-6 in ways that make
 *    backend-debug harder. The integer column is rendered but de-emphasized.
 *  - Ties require an explicit 2-step affordance: select two rows (checkbox), then "Set as tied".
 *    R-D2-TIE surfaces as a friction note on the tied-band flow.
 *  - Mandatory tabs: Edit / Compare with previous / Audit content preview / Sync history.
 *    Compare + Audit-preview tabs surface R-D2-AUDIT + R-D2-COMPARE-LEAK warning banners
 *    explaining the leak risk + the VP5-1 server-side filter requirement.
 *  - R-D2-DISMISS: modal dismiss with unsaved changes prompts a Discard/Continue/Save overlay.
 */
export default function D2Modal({ schema, open, onClose, onSave }: D2ModalProps) {
  const [values, setValues] = useState<RankedValue[]>(() => sortByRankDesc(schema.values));
  const [activeTab, setActiveTab] = useState<'edit' | 'compare' | 'audit' | 'sync'>('edit');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showDismissWarn, setShowDismissWarn] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const initialValuesRef = useRef(values);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') attemptClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, values]);

  if (!open) return null;

  const isUas = schema.source === 'uas';
  const groups = groupByTiedBand(values);

  function isDirty() {
    return JSON.stringify(initialValuesRef.current) !== JSON.stringify(values);
  }

  function attemptClose() {
    if (isUas) {
      onClose();
      return;
    }
    if (isDirty()) {
      // R-D2-DISMISS — show the confirm-on-dismiss overlay.
      setShowDismissWarn(true);
    } else {
      onClose();
    }
  }

  function handleDragStart(idx: number) {
    setDragIndex(idx);
  }
  function handleDragOver(e: React.DragEvent, idx: number) {
    e.preventDefault();
    setOverIndex(idx);
  }
  function handleDrop(idx: number) {
    if (dragIndex === null || dragIndex === idx) {
      setDragIndex(null);
      setOverIndex(null);
      return;
    }
    setValues((prev) => {
      const next = [...prev];
      const [moved] = next.splice(dragIndex, 1);
      next.splice(idx, 0, moved);
      // Position-as-truth: integer auto-derives from position. R-D2-DRIFT manifestation.
      const top = next.length;
      return next.map((v, i) => ({ ...v, rank: top - i }));
    });
    setDragIndex(null);
    setOverIndex(null);
  }

  function toggleSelected(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function setAsTied() {
    if (selected.size < 2) return;
    // R-D2-TIE: the 2-step affordance (select rows → Set as tied) backward of B-3's
    // "ties as natural state." We render the friction visibly.
    const selectedValues = values.filter((v) => selected.has(v.id));
    const targetRank = Math.max(...selectedValues.map((v) => v.rank ?? 0));
    setValues((prev) =>
      prev.map((v) => (selected.has(v.id) ? { ...v, rank: targetRank } : v)),
    );
    setSelected(new Set());
  }

  function addValue() {
    setValues((prev) => [
      ...prev,
      { id: `new-${Date.now()}`, label: 'New value', rank: nextRank(prev), color: 'neutral' },
    ]);
  }

  return (
    <div className={styles['modal-backdrop']} onClick={attemptClose}>
      <div className={styles['modal-wrap']} onClick={(e) => e.stopPropagation()}>
        <Modal
          size="Medium"
          title={schema.attributeName}
          subtitle="Ranked Attribute · Modal-as-Authoritative Workspace"
          onClose={attemptClose}
          footer={
            <>
              <Button emphasis="Tertiary" size="Medium" onClick={attemptClose}>
                Cancel
              </Button>
              <Button
                emphasis="Primary"
                size="Medium"
                onClick={() => onSave({ ...schema, values, version: schema.version + 1 })}
                disabled={isUas}
              >
                {isUas ? 'Read-only' : `Save (v${schema.version + 1})`}
              </Button>
            </>
          }
        >
          <div className={styles['ms']}>
            {isUas && schema.provenance && (
              <SchemaProvenanceRibbon
                source={schema.provenance.pluginName}
                lastSyncRelative={schema.provenance.lastSyncRelative}
                lastSyncAbsolute={schema.provenance.lastSyncAbsolute}
                lastKnownGoodRelative={schema.provenance.lastKnownGoodRelative}
                lastKnownGoodAbsolute={schema.provenance.lastKnownGoodAbsolute}
                syncState="fresh"
              />
            )}

            <SectionNotice
              type="Warning"
              icon={<Icon size="16" glyph={<AlertOutlineIcon />} />}
              title="R-D2-DRIFT manifestation — position-as-truth"
              description="In D2, the integer rank is auto-derived from drag position (the column is de-emphasized). Backend-debug-from-policy-error workflows are harder because the integer is one step removed from the admin's mental model. This is direction-inherent — it cannot be designed away without changing the direction."
            />

            <div className={styles['ms__tabs']} role="tablist" aria-label="Modal sections">
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'edit'}
                onClick={() => setActiveTab('edit')}
                className={[styles['ms__tab'], activeTab === 'edit' && styles['ms__tab--active']]
                  .filter(Boolean)
                  .join(' ')}
              >
                Edit values
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'compare'}
                onClick={() => setActiveTab('compare')}
                className={[styles['ms__tab'], activeTab === 'compare' && styles['ms__tab--active']]
                  .filter(Boolean)
                  .join(' ')}
              >
                Compare with v{Math.max(1, schema.version - 1)}{' '}
                <span className={styles['ms__tab-mand']}>(mandatory)</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'audit'}
                onClick={() => setActiveTab('audit')}
                className={[styles['ms__tab'], activeTab === 'audit' && styles['ms__tab--active']]
                  .filter(Boolean)
                  .join(' ')}
              >
                Audit content preview{' '}
                <span className={styles['ms__tab-mand']}>(mandatory)</span>
              </button>
              {isUas && (
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === 'sync'}
                  onClick={() => setActiveTab('sync')}
                  className={[styles['ms__tab'], activeTab === 'sync' && styles['ms__tab--active']]
                    .filter(Boolean)
                    .join(' ')}
                >
                  Sync history
                </button>
              )}
            </div>

            {activeTab === 'edit' && (
              <>
                <div className={styles['ms__hint']}>
                  Drag rows to reorder. Integer auto-derives from position (top = highest).{' '}
                  <strong>To create a tie:</strong> select two rows via checkbox, then click{' '}
                  <em>Set as tied</em> — the 2-step affordance is the R-D2-TIE friction surface
                  (backward of Krauser B-3's "ties as natural state" semantic).
                </div>

                {selected.size >= 2 && !isUas && (
                  <div className={styles['ms__tie-toolbar']}>
                    <span>{selected.size} rows selected</span>
                    <Button emphasis="Secondary" size="Small" onClick={setAsTied}>
                      Set as tied (R-D2-TIE)
                    </Button>
                    <button
                      type="button"
                      className={styles['ms__tie-clear']}
                      onClick={() => setSelected(new Set())}
                    >
                      Clear selection
                    </button>
                  </div>
                )}

                <div className={styles['ms__list']} role="list">
                  {groups.map((group, gIdx) => (
                    <div
                      key={gIdx}
                      className={[styles['ms__group'], group.length > 1 && styles['ms__group--tied']]
                        .filter(Boolean)
                        .join(' ')}
                    >
                      {group.length > 1 && (
                        <div className={styles['ms__tied-label']}>
                          Tied · {group.length} values share rank {group[0].rank ?? 0}
                        </div>
                      )}
                      {group.map((v) => {
                        const idx = values.findIndex((x) => x.id === v.id);
                        return (
                          <div
                            key={v.id}
                            className={[
                              styles['ms__row'],
                              overIndex === idx && styles['ms__row--drop-target'],
                              dragIndex === idx && styles['ms__row--dragging'],
                              selected.has(v.id) && styles['ms__row--selected'],
                            ]
                              .filter(Boolean)
                              .join(' ')}
                            role="listitem"
                            draggable={!isUas}
                            onDragStart={() => !isUas && handleDragStart(idx)}
                            onDragOver={(e) => !isUas && handleDragOver(e, idx)}
                            onDrop={() => !isUas && handleDrop(idx)}
                          >
                            <input
                              type="checkbox"
                              className={styles['ms__select']}
                              checked={selected.has(v.id)}
                              onChange={() => toggleSelected(v.id)}
                              aria-label={`Select ${v.label} for tie operation`}
                              disabled={isUas}
                            />

                            <span
                              className={styles['ms__drag']}
                              aria-hidden="true"
                              title={isUas ? 'Locked — UAS-sourced' : 'Drag to reorder (primary D2 affordance)'}
                            >
                              <Icon size="16" glyph={<DragIcon />} />
                            </span>

                            <span
                              className={styles['ms__color']}
                              style={{ background: COLOR_HEX[v.color ?? 'neutral'] }}
                              aria-hidden="true"
                            />

                            <span className={styles['ms__label']}>{v.label}</span>

                            <span
                              className={styles['ms__rank-deemph']}
                              title="Position-as-truth · integer is auto-derived. (R-D2-DRIFT)"
                            >
                              <span className={styles['ms__rank-deemph-key']}>rank:</span>{' '}
                              <span className={styles['ms__rank-deemph-val']}>{v.rank ?? 0}</span>
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>

                {!isUas && (
                  <button type="button" className={styles['ms__add']} onClick={addValue}>
                    <Icon size="12" glyph={<PlusIcon />} />
                    <span>Add value (auto-rank {nextRank(values)})</span>
                  </button>
                )}
              </>
            )}

            {activeTab === 'compare' && (
              <div className={styles['ms__leak']}>
                <SectionNotice
                  type="Danger"
                  icon={<Icon size="16" glyph={<AlertOutlineIcon />} />}
                  title="R-D2-COMPARE-LEAK — placeholder content (Phase 7 spec concern)"
                  description={
                    'Live rendering of v(N-1) → v(N) diff would risk leaking out-of-scope identifiers ' +
                    'to delegated admins (if v(N-1) contained values v(N) removes). Mitigation requires ' +
                    'server scope-filter the diff per version per value scope at render — VP5-1 (HIGH) ' +
                    'pre-Phase-6 if D2 is carried. This tab renders placeholder content in the prototype.'
                  }
                />
                <div className={styles['ms__placeholder']}>
                  <div className={styles['ms__placeholder-row']}>
                    <span className={styles['ms__placeholder-mark']}>~</span>
                    <span className={styles['ms__placeholder-text']}>
                      [Placeholder] Compared-version diff would render here. <em>Currently stubbed
                      to avoid live leak surface; see VP5-1 above.</em>
                    </span>
                  </div>
                </div>
                <div className={styles['ms__placeholder-affected']}>
                  <div className={styles['ms__placeholder-affected-head']}>
                    "Show policies affected" subsection (D2-specific entry path → policy editor):
                  </div>
                  <div className={styles['ms__placeholder-affected-row']}>
                    <span className={styles['ms__placeholder-affected-policy']}>
                      [Placeholder] Policy name and changed-value list
                    </span>
                    <span className={styles['ms__placeholder-affected-note']}>
                      Same R-D2-COMPARE-LEAK risk applies — server filter required
                    </span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'audit' && (
              <div className={styles['ms__leak']}>
                <SectionNotice
                  type="Danger"
                  icon={<Icon size="16" glyph={<AlertOutlineIcon />} />}
                  title="R-D2-AUDIT — placeholder content (Phase 7 spec concern)"
                  description={
                    'Live rendering would fetch server data including the full value set, which risks ' +
                    'leaking out-of-scope identifiers to delegated admins (NFR-12 violation). Server-side ' +
                    'filter must precede preview rendering (not after fetch). VP5-1 (HIGH) — engineering ' +
                    'coordination required pre-Phase-6 if D2 is carried.'
                  }
                />
                <div className={styles['ms__placeholder']}>
                  <pre className={styles['ms__audit-code']}>
{`{
  "user": "<placeholder>",
  "attribute": "User.Clearance",
  "schema_version": <placeholder>,
  "operator": "<placeholder>",
  "threshold": "<placeholder>",
  "decision": "<placeholder>",
  "timestamp": "<placeholder>",
  "source_identifier": "<placeholder>"
}
// Live audit-content fields stubbed — see VP5-1 above.
// FR-12 / AC-5.1 contract defines the full field list.`}
                  </pre>
                </div>
              </div>
            )}

            {activeTab === 'sync' && (
              <div className={styles['ms__sync']}>
                <div className={styles['ms__sync-entry']}>
                  <span className={styles['ms__sync-time']}>5m ago</span>
                  <span className={styles['ms__sync-state']}>fresh</span>
                  <span className={styles['ms__sync-detail']}>
                    Full sync — {values.length} values. Schema v{schema.version}.
                  </span>
                </div>
                <div className={styles['ms__sync-note']}>
                  FR-13: every sync transition writes a structured audit entry. Per resolved
                  PRD-VPM-1, no proactive admin banner.
                </div>
              </div>
            )}
          </div>
        </Modal>

        {showDismissWarn && (
          <div className={styles['dismiss-overlay']} role="alertdialog" aria-modal="true">
            <div className={styles['dismiss-overlay__card']}>
              <h4 className={styles['dismiss-overlay__title']}>
                Unsaved changes — R-D2-DISMISS surface
              </h4>
              <p className={styles['dismiss-overlay__body']}>
                You have unsaved changes in this modal. Discarding will revert all reorderings, label
                edits, and tie operations. Phase 5 surfaced this as a MUST-FIX wireframe gap; the
                confirmation overlay is the documented mitigation.
              </p>
              <div className={styles['dismiss-overlay__actions']}>
                <Button
                  emphasis="Tertiary"
                  size="Small"
                  destructive
                  onClick={() => {
                    setShowDismissWarn(false);
                    onClose();
                  }}
                >
                  Discard
                </Button>
                <Button
                  emphasis="Secondary"
                  size="Small"
                  onClick={() => setShowDismissWarn(false)}
                >
                  Continue editing
                </Button>
                <Button
                  emphasis="Primary"
                  size="Small"
                  onClick={() => {
                    onSave({ ...schema, values, version: schema.version + 1 });
                    setShowDismissWarn(false);
                  }}
                >
                  Save
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
