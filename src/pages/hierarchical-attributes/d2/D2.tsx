import { useMemo, useState } from 'react';
import SectionNotice from '@/components/ui/SectionNotice/SectionNotice';
import ConsoleFrame from '../shared/ConsoleFrame';
import AttributeTable from '../shared/AttributeTable';
import D2Modal from './D2Modal';
import useQuickSwitch from '../shared/useQuickSwitch';
import { ATTRIBUTE_ROWS } from '../shared/mockData';
import type { RankedSchema } from '../shared/types';
import styles from './D2.module.scss';

/**
 * D2 — Modal-as-Authoritative Workspace.
 *
 * Phase 4 challenger (66/75). Position-as-truth cognitive model.
 *
 * Phase 5 MUST-FIX surfacing (5 HIGH):
 *  - R-D2-DISMISS: dismiss-with-unsaved overlay implemented inside D2Modal.
 *  - R-D2-AUDIT: "Audit content preview" tab renders placeholder + warning banner citing VP5-1.
 *  - R-D2-COMPARE-LEAK: "Compare with previous" tab renders placeholder + warning banner.
 *  - R-D2-TIE: 2-step tie affordance is visible (select rows → "Set as tied") with explicit friction note.
 *  - R-D2-DRIFT: position-as-truth banner inside modal; integer column de-emphasized.
 */
export default function D2() {
  useQuickSwitch();

  const [rows, setRows] = useState(() => ATTRIBUTE_ROWS.map((r) => ({ ...r })));
  const [modalAttribute, setModalAttribute] = useState<string | null>(null);

  const modalSchema = useMemo(() => {
    if (!modalAttribute) return null;
    return rows.find((r) => r.attribute === modalAttribute)?.schema ?? null;
  }, [modalAttribute, rows]);

  function handleModalSave(next: RankedSchema) {
    setRows((prev) =>
      prev.map((r) => (r.attribute === next.attributeName ? { ...r, schema: next } : r)),
    );
    setModalAttribute(null);
  }

  return (
    <ConsoleFrame
      title="User Attributes"
      eyebrow="System Console · User Management · System Attributes"
      subtitle={
        <>
          Ranked-attribute extension shipping in <strong>v1.0</strong>. Top of list = highest rank
          (Phase 1 Q6 lock). D2: <em>chips are view-only summaries; click row to open modal.</em>
        </>
      }
      directionTag="D2 (challenger)"
      banner={
        <SectionNotice
          type="Warning"
          title="D2 prototype — Modal-as-Authoritative Workspace"
          description="Click any ranked-attribute row to open the modal. The modal has mandatory Compare + Audit-preview tabs. R-D2-AUDIT and R-D2-COMPARE-LEAK leak risks are surfaced as warning banners inside those tabs (not shipped live). Use \\ (backslash) to quick-switch to D1."
        />
      }
    >
      <div className={styles['page']}>
        <AttributeTable
          rows={rows}
          variant="D2"
          onRowClick={(attr) => setModalAttribute(attr)}
        />

        <section className={styles['page__intro']}>
          <h3 className={styles['page__h3']}>What's different in D2</h3>
          <ul className={styles['page__diffs']}>
            <li>
              <strong>Modal-as-workspace.</strong> Every routine edit (rename a chip, change a
              color, set integer) costs a modal-open. R-D2-OPEN is the friction this trades for
              single-surface accessibility.
            </li>
            <li>
              <strong>Drag is the primary reorder primitive.</strong> Integer auto-derives from
              position. Position-as-truth — R-D2-DRIFT surface.
            </li>
            <li>
              <strong>Ties require a 2-step affordance:</strong> Select two rows via checkbox →
              "Set as tied." Backward of Krauser B-3's "ties as natural state" semantic — R-D2-TIE
              surface.
            </li>
            <li>
              <strong>Mandatory Compare + Audit-preview tabs.</strong> Stronger T-A1 / T-A2
              mitigation than D1, but introduces R-D2-AUDIT + R-D2-COMPARE-LEAK bounded-scope-hygiene
              concerns. Live rendering deferred to Phase 7 spec; placeholder content shown.
            </li>
          </ul>
        </section>

        <section id="policy-editor" className={styles['page__editor']}>
          <h3 className={styles['page__h3']}>
            Policy editor extension (Stories 3, 4 — convergent primitive)
          </h3>
          <p className={styles['page__p']}>
            The policy editor is convergent across D1 and D2. After round 2 it
            lives on its own page under <code>Membership Policies</code> in
            the sidebar (Figma 4208-27399). Switch to D1 with{' '}
            <code>\</code> and open <code>Membership Policies</code> to see
            it.
          </p>
        </section>

        <section className={styles['page__must-fix']}>
          <h3 className={styles['page__h3']}>Phase 5 MUST-FIX surfacing (D2 · 5 HIGH)</h3>
          <ul className={styles['page__must-fix-list']}>
            <li>
              <strong>R-D2-DISMISS (HIGH)</strong> — Modal dismiss with unsaved changes opens a
              confirmation overlay (Discard / Continue editing / Save). Open the modal, edit a
              chip, then click ✕ to see the manifestation.
            </li>
            <li>
              <strong>R-D2-AUDIT (HIGH)</strong> — "Audit content preview" tab renders placeholder
              content with a Danger SectionNotice citing VP5-1 (server-side filter required).
              <strong> Live rendering is intentionally deferred</strong> — see the warning banner
              inside the tab.
            </li>
            <li>
              <strong>R-D2-COMPARE-LEAK (HIGH)</strong> — "Compare with previous version" tab
              renders placeholder content with the same Danger banner. Same VP5-1 dependency.
            </li>
            <li>
              <strong>R-D2-TIE (HIGH)</strong> — 2-step tie affordance is visible. Open the modal,
              check two boxes, click "Set as tied" — the friction surface is explicit. Direction-
              inherent; cannot be designed away without changing the direction.
            </li>
            <li>
              <strong>R-D2-DRIFT (HIGH)</strong> — Position-as-truth banner is rendered at the top
              of the modal. Integer column inside the row list is de-emphasized (small mono text
              with reduced opacity).
            </li>
          </ul>
        </section>
      </div>

      {modalSchema && (
        <D2Modal
          schema={modalSchema}
          open
          onClose={() => setModalAttribute(null)}
          onSave={handleModalSave}
        />
      )}
    </ConsoleFrame>
  );
}
