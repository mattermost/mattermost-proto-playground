import { Link } from 'react-router-dom';
import RankedValueChip from '@/components/ui/RankedValueChip/RankedValueChip';
import SchemaProvenanceRibbon from '@/components/ui/SchemaProvenanceRibbon/SchemaProvenanceRibbon';
import { CLEARANCE_SCHEMA, RANK_SCHEMA_UAS, RANK_SCHEMA_UAS_STALE } from './shared/mockData';
import { sortByRankDesc } from './shared/types';
import useQuickSwitch from './shared/useQuickSwitch';
import styles from './StateMatrix.module.scss';

/**
 * Phase 6 state matrix — both D1 and D2 states side-by-side.
 *
 * Per intake P6-Q4: single shared route /hierarchical-attributes/state-matrix.
 * Required states (per Phase 6 directive):
 *   Default · Empty · Loading · Success · Error · Stale-data · Denied
 *   D1-specific: popover-open
 *   D2-specific: modal-with-unsaved-changes
 *   Both: tie-rendering (B-3)
 */
export default function StateMatrix() {
  useQuickSwitch();

  return (
    <div className={styles['matrix']}>
      <header className={styles['matrix__head']}>
        <div className={styles['matrix__eyebrow']}>
          Phase 6 · state matrix · Hierarchical Attributes (Ranked v1.0)
        </div>
        <h1 className={styles['matrix__h1']}>D1 vs D2 — state-by-state comparison</h1>
        <p className={styles['matrix__lead']}>
          Each row shows a critical state rendered in both directions. Use this as the
          decision-support surface for the Phase 6 commit conversation.{' '}
          <Link to="/hierarchical-attributes" className={styles['matrix__back']}>
            ← back to landing
          </Link>{' '}
          ·{' '}
          <Link to="/hierarchical-attributes/d1" className={styles['matrix__link']}>
            Open D1 →
          </Link>{' '}
          ·{' '}
          <Link to="/hierarchical-attributes/d2" className={styles['matrix__link']}>
            Open D2 →
          </Link>
        </p>
      </header>

      <div className={styles['matrix__grid']}>
        <div className={styles['matrix__grid-head']}>State</div>
        <div className={styles['matrix__grid-head']}>D1 — Layered Inline + Modal</div>
        <div className={styles['matrix__grid-head']}>D2 — Modal-as-Authoritative</div>

        {/* DEFAULT — happy path */}
        <Row
          label="Default"
          sublabel="System Console row with chips in priority order"
          d1={
            <div className={styles['demo-chips']}>
              {sortByRankDesc(CLEARANCE_SCHEMA.values).map((v) => (
                <RankedValueChip key={v.id} label={v.label} rank={v.rank} />
              ))}
            </div>
          }
          d2={
            <div className={styles['demo-chips']}>
              {sortByRankDesc(CLEARANCE_SCHEMA.values).map((v) => (
                <RankedValueChip key={v.id} label={v.label} />
              ))}
            </div>
          }
          note="D1: rank badge visible (integer-as-truth). D2: view-only summary chips (no badge, no click). Ranks are unique post 2026-05-22 sync — no tied bands."
        />

        {/* POPOVER-OPEN — D1-specific */}
        <Row
          label="Popover-open"
          sublabel="D1-specific affordance"
          d1={
            <div className={styles['demo-popover']}>
              <div className={styles['demo-popover-card']}>
                <div className={styles['demo-popover-head']}>Edit value</div>
                <div className={styles['demo-popover-body']}>
                  <div className={styles['demo-popover-field']}>
                    <span className={styles['demo-popover-key']}>Label</span>
                    <span className={styles['demo-popover-input']}>Secret</span>
                  </div>
                  <div className={styles['demo-popover-field']}>
                    <span className={styles['demo-popover-key']}>Rank</span>
                    <span className={styles['demo-popover-input']}>2 (stepper)</span>
                  </div>
                </div>
              </div>
              <div className={styles['demo-note']}>
                Focus-trapped, Esc closes (R-D1-FOCUS mitigation). Anchored to clicked chip.
              </div>
            </div>
          }
          d2={
            <div className={styles['demo-na']}>
              <span className={styles['demo-na-tag']}>N/A in D2</span>
              <span className={styles['demo-na-body']}>
                D2 has no per-chip popover — chips are view-only summaries. All editing happens in
                the modal.
              </span>
            </div>
          }
          note="This is D1's distinguishing affordance per Q5-C5 layered model."
        />

        {/* MODAL-WITH-UNSAVED — D2-specific */}
        <Row
          label="Dirty-modal-dismiss"
          sublabel="D2-specific · R-D2-DISMISS surface"
          d1={
            <div className={styles['demo-na']}>
              <span className={styles['demo-na-tag']}>N/A in D1</span>
              <span className={styles['demo-na-body']}>
                D1 modal also has unsaved-confirm but it's a lower-stakes surface (most edits live
                in the popover, not the modal).
              </span>
            </div>
          }
          d2={
            <div className={styles['demo-dismiss']}>
              <div className={styles['demo-dismiss-card']}>
                <div className={styles['demo-dismiss-title']}>Unsaved changes</div>
                <div className={styles['demo-dismiss-body']}>
                  You have unsaved changes in this modal. Discarding will revert all reorderings
                  and label edits.
                </div>
                <div className={styles['demo-dismiss-actions']}>
                  <span className={styles['demo-dismiss-discard']}>Discard</span>
                  <span className={styles['demo-dismiss-continue']}>Continue editing</span>
                  <span className={styles['demo-dismiss-save']}>Save</span>
                </div>
              </div>
            </div>
          }
          note="Wireframe gap from Phase 5; mitigated as confirmation-on-dismiss per R-D2-DISMISS."
        />

        {/* UAS read-only — provenance ribbon */}
        <Row
          label="UAS-sourced (read-only)"
          sublabel="Story 2 · SchemaProvenanceRibbon convergent"
          d1={
            <div className={styles['demo-ribbon-wrap']}>
              <SchemaProvenanceRibbon
                source={RANK_SCHEMA_UAS.provenance!.pluginName}
                lastSyncRelative={RANK_SCHEMA_UAS.provenance!.lastSyncRelative}
                lastSyncAbsolute={RANK_SCHEMA_UAS.provenance!.lastSyncAbsolute}
                lastKnownGoodRelative={RANK_SCHEMA_UAS.provenance!.lastKnownGoodRelative}
                lastKnownGoodAbsolute={RANK_SCHEMA_UAS.provenance!.lastKnownGoodAbsolute}
                syncState="fresh"
              />
              <div className={styles['demo-chips']}>
                {sortByRankDesc(RANK_SCHEMA_UAS.values).slice(0, 4).map((v) => (
                  <RankedValueChip key={v.id} label={v.label} rank={v.rank} />
                ))}
              </div>
            </div>
          }
          d2={
            <div className={styles['demo-ribbon-wrap']}>
              <SchemaProvenanceRibbon
                source={RANK_SCHEMA_UAS.provenance!.pluginName}
                lastSyncRelative={RANK_SCHEMA_UAS.provenance!.lastSyncRelative}
                lastSyncAbsolute={RANK_SCHEMA_UAS.provenance!.lastSyncAbsolute}
                lastKnownGoodRelative={RANK_SCHEMA_UAS.provenance!.lastKnownGoodRelative}
                lastKnownGoodAbsolute={RANK_SCHEMA_UAS.provenance!.lastKnownGoodAbsolute}
                syncState="fresh"
              />
              <div className={styles['demo-chips']}>
                {sortByRankDesc(RANK_SCHEMA_UAS.values).slice(0, 4).map((v) => (
                  <RankedValueChip key={v.id} label={v.label} />
                ))}
              </div>
            </div>
          }
          note="Same SchemaProvenanceRibbon component (VP4-3 resolved). D1 keeps rank badge on read-only chips; D2 omits it (consistent with view-only model)."
        />

        {/* STALE-DATA — no proactive banner per PRD-VPM-1 */}
        <Row
          label="Stale-data (NFR-2 budget exceeded)"
          sublabel="Per resolved PRD-VPM-1: no proactive admin banner"
          d1={
            <div className={styles['demo-ribbon-wrap']}>
              <SchemaProvenanceRibbon
                source={RANK_SCHEMA_UAS_STALE.provenance!.pluginName}
                lastSyncRelative={RANK_SCHEMA_UAS_STALE.provenance!.lastSyncRelative}
                lastSyncAbsolute={RANK_SCHEMA_UAS_STALE.provenance!.lastSyncAbsolute}
                lastKnownGoodRelative={RANK_SCHEMA_UAS_STALE.provenance!.lastKnownGoodRelative}
                lastKnownGoodAbsolute={RANK_SCHEMA_UAS_STALE.provenance!.lastKnownGoodAbsolute}
                syncState="stale"
              />
              <div className={styles['demo-note']}>
                Timestamps shown; no warning chrome. Admin discovers staleness via fail-secure
                denials + support tickets + audit log.
              </div>
            </div>
          }
          d2={
            <div className={styles['demo-ribbon-wrap']}>
              <SchemaProvenanceRibbon
                source={RANK_SCHEMA_UAS_STALE.provenance!.pluginName}
                lastSyncRelative={RANK_SCHEMA_UAS_STALE.provenance!.lastSyncRelative}
                lastSyncAbsolute={RANK_SCHEMA_UAS_STALE.provenance!.lastSyncAbsolute}
                lastKnownGoodRelative={RANK_SCHEMA_UAS_STALE.provenance!.lastKnownGoodRelative}
                lastKnownGoodAbsolute={RANK_SCHEMA_UAS_STALE.provenance!.lastKnownGoodAbsolute}
                syncState="stale"
              />
              <div className={styles['demo-note']}>Identical — convergent contract.</div>
            </div>
          }
          note="Convergent surface. Per resolved PRD-VPM-1: no proactive admin banner."
        />

        {/* EMPTY */}
        <Row
          label="Empty"
          sublabel="Schema with zero values (new attribute, pre-population)"
          d1={
            <div className={styles['demo-empty']}>
              <span className={styles['demo-empty-row']}>
                User.NewAttribute · Ranked · — · 0 policies · Edit schema
              </span>
              <span className={styles['demo-empty-note']}>
                Click "Edit schema" → modal opens with empty value list. "+ Add value" pre-fills
                rank 1 (B-6).
              </span>
            </div>
          }
          d2={
            <div className={styles['demo-empty']}>
              <span className={styles['demo-empty-row']}>
                User.NewAttribute · Ranked · — · 0 policies · Click row to edit
              </span>
              <span className={styles['demo-empty-note']}>
                Click row → modal opens with empty value list (drag-to-reorder stages are empty
                until values are added).
              </span>
            </div>
          }
          note="Convergent contract. Both surfaces present a clean entry into the modal."
        />

        {/* LOADING */}
        <Row
          label="Loading"
          sublabel="Save attempt in flight"
          d1={
            <div className={styles['demo-loading']}>
              <span className={styles['demo-spinner']} aria-hidden />
              <span>Saving popover changes…</span>
            </div>
          }
          d2={
            <div className={styles['demo-loading']}>
              <span className={styles['demo-spinner']} aria-hidden />
              <span>Saving modal (v4 → v5)…</span>
            </div>
          }
          note="Identical interaction; D2 saves the full modal state; D1 saves the per-chip delta."
        />

        {/* SUCCESS */}
        <Row
          label="Success"
          sublabel="Post-save schema version mints (FR-4)"
          d1={
            <div className={styles['demo-toast']} data-tone="success">
              <strong>Schema saved.</strong> v3 → v4 · audit content captured (FR-12).
            </div>
          }
          d2={
            <div className={styles['demo-toast']} data-tone="success">
              <strong>Schema saved.</strong> v3 → v4 · audit content captured (FR-12).
            </div>
          }
          note="Convergent: FR-4 version mint + FR-12 audit content."
        />

        {/* ERROR (schema-aware CEL validation, FR-10) */}
        <Row
          label="Error · schema-aware validation"
          sublabel="Raw CEL references non-existent value (FR-10)"
          d1={
            <div className={styles['demo-toast']} data-tone="danger">
              <strong>Validation failed.</strong> "O-99" is not a value on the User.Rank schema
              (v7). Available values: O-1, O-2, … O-10.
            </div>
          }
          d2={
            <div className={styles['demo-toast']} data-tone="danger">
              <strong>Validation failed.</strong> "O-99" is not a value on the User.Rank schema
              (v7). Available values: O-1, O-2, … O-10.
            </div>
          }
          note="Convergent. Diagnostic announced via aria-live per NFR-10 / WCAG 4.1.3."
        />

        {/* DENIED — end user surface */}
        <Row
          label="Denied (end-user surface)"
          sublabel="Per AC-7.1: generic only · no correlation ID"
          d1={
            <div className={styles['demo-toast']} data-tone="neutral">
              Access denied — contact your administrator.
            </div>
          }
          d2={
            <div className={styles['demo-toast']} data-tone="neutral">
              Access denied — contact your administrator.
            </div>
          }
          note="Convergent. Information-leak hygiene per Phase 1 Q5 lock."
        />
      </div>

      <footer className={styles['matrix__footer']}>
        <strong>Phase 6 commit point</strong> · review both prototypes, then pick D1 or D2 for
        Phase 7 single-direction spec writing. Per Q1=C hybrid, this matrix surfaces the asymmetry
        but does not propose a kill.
      </footer>
    </div>
  );
}

interface RowProps {
  label: string;
  sublabel?: string;
  d1: React.ReactNode;
  d2: React.ReactNode;
  note?: string;
}

function Row({ label, sublabel, d1, d2, note }: RowProps) {
  return (
    <>
      <div className={styles['matrix__row-label']}>
        <span className={styles['matrix__row-label-key']}>{label}</span>
        {sublabel && <span className={styles['matrix__row-label-sub']}>{sublabel}</span>}
        {note && <span className={styles['matrix__row-label-note']}>{note}</span>}
      </div>
      <div className={[styles['matrix__row-cell'], styles['matrix__row-cell--d1']].join(' ')}>
        {d1}
      </div>
      <div className={[styles['matrix__row-cell'], styles['matrix__row-cell--d2']].join(' ')}>
        {d2}
      </div>
    </>
  );
}
