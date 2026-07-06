import { Link } from 'react-router-dom';
import ArrowRightIcon from '@mattermost/compass-icons/components/arrow-right';
import Icon from '@/components/ui/Icon/Icon';
import useQuickSwitch from './shared/useQuickSwitch';
import styles from './Landing.module.scss';

/**
 * Phase 6 dual-direction landing — D1 (leader) and D2 (challenger) side by side.
 * Carries Phase 4 weighting forward (Q4=B). Lands the asymmetry visibly at first click.
 */
export default function Landing() {
  useQuickSwitch();

  return (
    <div className={styles['landing']}>
      <header className={styles['landing__head']}>
        <div className={styles['landing__eyebrow']}>
          Phase 6 prototype · Hierarchical Attributes (Ranked v1.0) · dual direction
        </div>
        <h1 className={styles['landing__h1']}>
          Two prototypes, side by side. Commit at end of Phase 6.
        </h1>
        <p className={styles['landing__lead']}>
          Per user directive 2026-05-22, D1 (leader) and D2 (challenger) ship as parallel
          prototypes. Phase 5 audit reinforced the Phase 4 lead, but the human makes the commit
          call at the end of this phase, not at Gate 5. <strong>Press <code>\</code> (backslash)
          anywhere to quick-switch</strong> between the two routes.
        </p>
        <div className={styles['landing__stats']}>
          <div className={styles['landing__stat']}>
            <span className={styles['landing__stat-key']}>Scope</span>
            <span className={styles['landing__stat-val']}>Ranked v1.0 only</span>
          </div>
          <div className={styles['landing__stat']}>
            <span className={styles['landing__stat-key']}>Stories</span>
            <span className={styles['landing__stat-val']}>1 (schema authoring) + 3 (policy editor)</span>
          </div>
          <div className={styles['landing__stat']}>
            <span className={styles['landing__stat-key']}>Build target</span>
            <span className={styles['landing__stat-val']}>sandboxed mattermost-proto-playground</span>
          </div>
          <div className={styles['landing__stat']}>
            <span className={styles['landing__stat-key']}>Top of list</span>
            <span className={styles['landing__stat-val']}>= highest rank (Phase 1 Q6 lock)</span>
          </div>
        </div>
      </header>

      <div className={styles['landing__cards']}>
        <Card
          to="/hierarchical-attributes/d1"
          tag="D1 — Leader"
          tone="leader"
          score="71 / 75"
          title="Layered Inline + Modal with Explicit-Integer Truth"
          summary="Per-chip inline popover for quick edits; full modal for deep edits. Integer-as-truth — visible as superscript on chips. Top of list = highest rank rendered everywhere."
          musts={[
            { id: 'R-D1-FOCUS', sev: 'HIGH', body: 'Keyboard focus model (focus-trap, Esc-close, focus return) implemented inside the popover.' },
            { id: 'R-D1-1', sev: 'HIGH', body: 'Popover click priority prevents row-overflow activation while open.' },
          ]}
          highlights={[
            '4-operator Simple mode (= ≠ ≥ ≤) with plain English + icons',
            'Drag + arrow-stepper + "move to position N" (NFR-7 / WCAG 2.5.7)',
            'Integer-as-truth model — backend B-1 / B-6 directly debuggable',
            'Single shared SchemaProvenanceRibbon for UAS-sourced schemas (VP4-3)',
          ]}
        />
        <Card
          to="/hierarchical-attributes/d2"
          tag="D2 — Challenger"
          tone="challenger"
          score="66 / 75"
          title="Modal-as-Authoritative Workspace"
          summary="Modal is the editor; the System Console row is view-only. Drag-and-drop primary; integer auto-derives from position. Mandatory Compare + Audit-preview tabs strengthen T-A1 / T-A2 mitigation."
          musts={[
            { id: 'R-D2-DISMISS', sev: 'HIGH', body: 'Modal-dismiss-with-unsaved confirmation overlay.' },
            { id: 'R-D2-AUDIT', sev: 'HIGH', body: 'Audit-preview tab placeholder + VP5-1 warning banner (leak risk).' },
            { id: 'R-D2-COMPARE-LEAK', sev: 'HIGH', body: 'Compare-version tab placeholder + same warning.' },
            { id: 'R-D2-TIE', sev: 'HIGH', body: '2-step tie affordance visible (direction-inherent friction).' },
            { id: 'R-D2-DRIFT', sev: 'HIGH', body: 'Position-as-truth banner surfaces backend-debug friction.' },
          ]}
          highlights={[
            '4-operator Simple mode (= ≠ ≥ ≤) — convergent with D1',
            'Drag-and-drop as the primary reorder primitive',
            'Position-as-truth model — integer auto-derived from drag',
            'Mandatory tabs: Compare + Audit-preview + Sync history',
          ]}
        />
      </div>

      <div className={styles['landing__below']}>
        <Link
          to="/hierarchical-attributes/d1-modal-only"
          className={styles['landing__matrix-link']}
        >
          <span>
            Modal-only D1 variant · A/B with the simplified popover
          </span>
          <Icon size="16" glyph={<ArrowRightIcon />} />
        </Link>
        <Link
          to="/hierarchical-attributes/d3"
          className={styles['landing__matrix-link']}
        >
          <span>D3 — Inline + Per-attribute popover (no modal)</span>
          <Icon size="16" glyph={<ArrowRightIcon />} />
        </Link>
        <Link
          to="/hierarchical-attributes/d1/policy-editor"
          className={styles['landing__matrix-link']}
        >
          <span>Membership Policy editor (D1) · standalone page</span>
          <Icon size="16" glyph={<ArrowRightIcon />} />
        </Link>
        <Link
          to="/hierarchical-attributes/d1/user-config"
          className={styles['landing__matrix-link']}
        >
          <span>User Configuration (D1) · Clearance picker with visibility-rule variants</span>
          <Icon size="16" glyph={<ArrowRightIcon />} />
        </Link>
        <Link to="/hierarchical-attributes/state-matrix" className={styles['landing__matrix-link']}>
          <span>State matrix · side-by-side states for both directions</span>
          <Icon size="16" glyph={<ArrowRightIcon />} />
        </Link>
        <div className={styles['landing__notes']}>
          <div className={styles['landing__note']}>
            <span className={styles['landing__note-key']}>Phase 5 audit findings</span>
            <p>
              D1's risks are about interaction design not yet done (Phase 5 wireframe iteration +
              Phase 6 prototype testing). D2's risks include direction-inherent friction
              (R-D2-OPEN, R-D2-TIE, R-D2-DRIFT) that cannot be designed away without changing the
              direction; modal-tabs leakage risk (R-D2-AUDIT, R-D2-COMPARE-LEAK) requires
              server-side filter pipeline updates beyond just wireframe work.
            </p>
          </div>
          <div className={styles['landing__note']}>
            <span className={styles['landing__note-key']}>Phase 6 commit decision</span>
            <p>
              Per Q1=C hybrid: this prototype set surfaces elimination candidates (D1: 1; D2: 3)
              <em> without</em> proposing a kill. The user reviews both prototypes, picks D1 or D2
              at end of Phase 6, then Phase 7 runs single-direction on the winner. Hierarchical
              v2.0 is a separate later run; D1 has v2.0 hooks documented in
              <code>04-solution-directions.md §5.1</code>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

interface CardProps {
  to: string;
  tag: string;
  tone: 'leader' | 'challenger';
  score: string;
  title: string;
  summary: string;
  musts: { id: string; sev: 'HIGH' | 'CRITICAL'; body: string }[];
  highlights: string[];
}

function Card({ to, tag, tone, score, title, summary, musts, highlights }: CardProps) {
  return (
    <Link
      to={to}
      className={[styles['card'], styles[`card--${tone}`]].join(' ')}
    >
      <div className={styles['card__top']}>
        <span className={styles['card__tag']}>{tag}</span>
        <span className={styles['card__score']}>
          <span className={styles['card__score-key']}>Phase 4 score</span>
          <span className={styles['card__score-val']}>{score}</span>
        </span>
      </div>
      <h2 className={styles['card__title']}>{title}</h2>
      <p className={styles['card__summary']}>{summary}</p>

      <div className={styles['card__highlights']}>
        <div className={styles['card__highlights-head']}>Highlights</div>
        <ul>
          {highlights.map((h, i) => (
            <li key={i}>{h}</li>
          ))}
        </ul>
      </div>

      <div className={styles['card__musts']}>
        <div className={styles['card__musts-head']}>
          MUST-FIX before Phase 6 ({musts.length} {musts.length === 1 ? 'HIGH' : 'HIGH'})
        </div>
        <ul>
          {musts.map((m) => (
            <li key={m.id}>
              <code className={styles['card__musts-id']}>{m.id}</code>{' '}
              <span className={styles['card__musts-sev']}>{m.sev}</span> · {m.body}
            </li>
          ))}
        </ul>
      </div>

      <div className={styles['card__cta']}>
        Open {tag.split(' — ')[0]} prototype <Icon size="16" glyph={<ArrowRightIcon />} />
      </div>
    </Link>
  );
}
