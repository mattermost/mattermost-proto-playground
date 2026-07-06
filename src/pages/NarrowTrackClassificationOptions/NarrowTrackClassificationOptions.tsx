// Narrow-track classification/clearance — three-approach comparison harness.
//
// STRUCTURE (HARD BUILD RULE): the product canvas on the right renders pristine
// System Console UI with zero spec residue — no approach labels, decision IDs,
// VERIFY/phase tags, or rationale. Every reviewer annotation (approach name,
// philosophy, V-1/V-4 context, per-surface design notes) lives ONLY in the
// harness chrome on the left, which is visually and structurally outside the
// emulated product viewport.
//
// Deep-linkable via ?approach=a|b|c &surface=s1-link|s2-scope|s3-ceiling|
// s4-roles|s5-removal &state=default|populated|posture.
// Theme switching is provided by the global prototype top nav (all themes).

import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

import ConsoleSidebar, {
  type ConsoleSidebarCategoryData,
} from '@/components/ui/ConsoleSidebar/ConsoleSidebar';
import ConsolePageHeader from '@/components/ui/ConsolePageHeader/ConsolePageHeader';
import ConsoleFooter from '@/components/ui/ConsoleFooter/ConsoleFooter';

import ServerVariantIcon from '@mattermost/compass-icons/components/server-variant';
import ShieldOutlineIcon from '@mattermost/compass-icons/components/shield-outline';
import CogOutlineIcon from '@mattermost/compass-icons/components/cog-outline';

import Surface1Link from './surfaces/Surface1Link';
import Surface2Scope from './surfaces/Surface2Scope';
import Surface3Ceiling from './surfaces/Surface3Ceiling';
import Surface4Roles from './surfaces/Surface4Roles';
import Surface5Removal from './surfaces/Surface5Removal';

import {
  APPROACH_IDS,
  SURFACE_IDS,
  STATE_IDS,
  type ApproachId,
  type SurfaceId,
  type StateId,
} from './shared/types';
import { DEMO_ADMIN } from './shared/fixtures';

import shared from './shared/shared.module.scss';
import styles from './NarrowTrackClassificationOptions.module.scss';

// ── Static harness copy (reviewer-facing; never rendered in the product canvas) ──

const APPROACH_META: Record<
  ApproachId,
  { name: string; philosophy: string; recommended?: boolean }
> = {
  a: {
    name: 'A · Constrained Console',
    philosophy:
      'Maximize admin-visible enforcement state. Every surface shows the rule and the boundary explicitly — correctness-visibility over speed. Densest of the three.',
  },
  b: {
    name: 'B · Guided Guardrail',
    philosophy:
      'Constrain by construction where safety demands it, and guide the admin through the one risky step (system-wide scope save) with a required acknowledgement. Safety without density.',
    recommended: true,
  },
  c: {
    name: 'C · Lightweight Native',
    philosophy:
      'Do the minimum net-new UI. Lean on native Compass / System Console patterns and server-side enforcement; the UI reflects rather than proactively warns.',
  },
};

const SURFACE_META: Record<
  SurfaceId,
  { title: string; console: string; requirements: string; note: string }
> = {
  's1-link': {
    title: 'Classification ↔ clearance link',
    console: 'User Attributes',
    requirements: 'FR-1 · linking, disable-not-delete (Pattern 9), shared scale',
    note: 'Near-identical across A/B/C — density only. V-1 clearance provenance (UAS attribute sync vs LDAP/SAML) is shown as co-equal peer rows; no primary is committed [VERIFY WITH PM · V-1]. Confidential is disabled-for-new to demonstrate disable-not-delete; existing assignments are preserved.',
  },
  's2-scope': {
    title: 'System-wide policy scope + static warning',
    console: 'Access Policies',
    requirements: 'FR-2 (apply-to-all scope) · FR-3 (Option A + static warning)',
    note: 'PRIMARY differentiator. A: dense — adds an inline SM-2 coverage readout beside the static warning (labeled a coverage check, not a list). B: guided — the static warning is a required-acknowledgement guardrail before save. C: minimal — the locked static inline note only. All three: uniform Option A (no Option B toggle), static warning only (the interactive pre-save preview is deliberately deferred — R-1 / TV-6), no "Promote to Global".',
  },
  's3-ceiling': {
    title: 'Constrained ceiling dropdown',
    console: 'Channel classification',
    requirements: 'FR-5 · channel ≤ team ≤ server, server-enforced (E-2)',
    note: 'Near-identical across A/B/C. The selector is constrained to values at/below the effective ceiling with the ceiling source in context ("Server ceiling: Secret"). A adds a "why is this disabled" affordance on capped values; B/C rely on the self-evident label. Over-ceiling is rejected server-side, not just blocked in the UI.',
  },
  's4-roles': {
    title: 'Delegated Attribute Manager role',
    console: 'Roles',
    requirements: 'FR-6 · per-resource-type delegation, platform-enforced',
    note: 'Channel AM vs User AM vs read-only Security Officer, scoped at the platform level. A renders a full capability matrix; B a compact scoped summary; C the plain roles list. V-4 (reconciliation with the delegated-attribute-manager plugin, PR #1 was 404) is carried on the posture state as a neutral "role model under review" product note [VERIFY WITH PM · V-4].',
  },
  's5-removal': {
    title: 'Continuous re-eval / removal notice',
    console: 'Channel access',
    requirements: 'FR-10 · live re-evaluation + membership removal notice',
    note: 'SECONDARY differentiator, and the only field-facing surface. A: verbose explanatory panel (desktop). B: concise, plain-language, aria-live, plain-text fallback — best-tuned for a field operator in low bandwidth (R-3 / WCAG 4.1.3). C: standard system notification. The posture state shows the low-bandwidth legibility of each. Removal semantics (immediate-hard vs grace-notify) depend on ENG-CONFIRM E-3.',
  },
};

const STATE_META: Record<StateId, string> = {
  default: 'Default — initial render, minimal data, ready for interaction.',
  populated: 'Populated — realistic demo data loaded.',
  posture: 'Posture — the state that expresses this surface’s approach-specific behavior.',
};

// Surface 3 (ceiling) has no meaningful empty "default"; still supports all
// three states via selection changes, so no restriction needed.

// ── Param parsing helpers ──────────────────────────────────────────────────

function coerceApproach(v: string | null): ApproachId {
  return (APPROACH_IDS as string[]).includes(v ?? '') ? (v as ApproachId) : 'b';
}
function coerceSurface(v: string | null): SurfaceId {
  return (SURFACE_IDS as string[]).includes(v ?? '') ? (v as SurfaceId) : 's2-scope';
}
function coerceState(v: string | null): StateId {
  return (STATE_IDS as string[]).includes(v ?? '') ? (v as StateId) : 'populated';
}

// ── Product-canvas router ───────────────────────────────────────────────────

function SurfaceCanvas({
  approach,
  surface,
  state,
}: {
  approach: ApproachId;
  surface: SurfaceId;
  state: StateId;
}) {
  const meta = SURFACE_META[surface];

  // The System Console sidebar categories — pristine chrome. The active item
  // maps to the surface's console location; no approach/spec labels appear.
  const categories: ConsoleSidebarCategoryData[] = useMemo(
    () => [
      {
        id: 'user-management',
        label: 'User Management',
        icon: <ServerVariantIcon />,
        items: [
          { id: 'user-attributes', label: 'User Attributes' },
          { id: 'roles', label: 'Roles' },
        ],
      },
      {
        id: 'access-control',
        label: 'Access Control',
        icon: <ShieldOutlineIcon />,
        items: [
          { id: 'access-policies', label: 'Access Policies' },
          { id: 'channel-classification', label: 'Channel Classification' },
          { id: 'channel-access', label: 'Channel Access' },
        ],
      },
      {
        id: 'site-configuration',
        label: 'Site Configuration',
        icon: <CogOutlineIcon />,
        items: [{ id: 'customization', label: 'Customization' }],
      },
    ],
    [],
  );

  const activeItem: Record<SurfaceId, string> = {
    's1-link': 'user-attributes',
    's2-scope': 'access-policies',
    's3-ceiling': 'channel-classification',
    's4-roles': 'roles',
    's5-removal': 'channel-access',
  };

  let body: React.ReactNode = null;
  switch (surface) {
    case 's1-link':
      body = <Surface1Link approach={approach} state={state} />;
      break;
    case 's2-scope':
      body = <Surface2Scope approach={approach} state={state} />;
      break;
    case 's3-ceiling':
      body = <Surface3Ceiling approach={approach} state={state} />;
      break;
    case 's4-roles':
      body = <Surface4Roles approach={approach} state={state} />;
      break;
    case 's5-removal':
      body = <Surface5Removal approach={approach} state={state} />;
      break;
  }

  return (
    <div className={styles['ntc__console']}>
      <ConsoleSidebar
        avatarSrc={DEMO_ADMIN.avatar}
        avatarAlt={DEMO_ADMIN.name}
        username={DEMO_ADMIN.username}
        categories={categories}
        activeItemId={activeItem[surface]}
        onItemClick={() => {}}
      />
      <div className={styles['ntc__center']}>
        <ConsolePageHeader title={meta.console} tag="Enterprise Advanced" />
        <div className={shared['canvas__scroll']}>
          <div className={shared['canvas__page']}>{body}</div>
        </div>
        <ConsoleFooter saveDisabled={state === 'default'} onSave={() => {}} onCancel={() => {}} />
      </div>
    </div>
  );
}

// ── Harness shell ───────────────────────────────────────────────────────────

export default function NarrowTrackClassificationOptions() {
  const [params, setParams] = useSearchParams();

  const approach = coerceApproach(params.get('approach'));
  const surface = coerceSurface(params.get('surface'));
  const state = coerceState(params.get('state'));

  const update = (patch: Partial<{ approach: string; surface: string; state: string }>) => {
    const next = new URLSearchParams(params);
    Object.entries(patch).forEach(([k, v]) => next.set(k, v));
    setParams(next, { replace: false });
  };

  const surfaceMeta = SURFACE_META[surface];
  const approachMeta = APPROACH_META[approach];

  return (
    <div className={styles['ntc']}>
      {/* ── Harness chrome (reviewer-facing — OUTSIDE the product viewport) ── */}
      <aside className={styles['ntc__harness']} aria-label="Comparison controls and reviewer notes">
        <div className={styles['ntc__harness-head']}>
          <p className={styles['ntc__kicker']}>Comparison harness</p>
          <h2 className={styles['ntc__harness-title']}>
            Classification &amp; clearance — 3 approaches
          </h2>
          <p className={styles['ntc__harness-sub']}>
            Phase 6a · narrow track. Product canvas on the right is shipped-plausible UI. All notes
            below live in the harness only.
          </p>
        </div>

        <div className={styles['ntc__group']}>
          <p className={styles['ntc__group-label']}>Approach</p>
          <div className={styles['ntc__seg']} role="group" aria-label="Approach">
            {APPROACH_IDS.map((a) => (
              <button
                key={a}
                type="button"
                className={[
                  styles['ntc__seg-btn'],
                  a === approach ? styles['ntc__seg-btn--active'] : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => update({ approach: a })}
              >
                {a.toUpperCase()}
                {APPROACH_META[a].recommended && (
                  <span className={styles['ntc__badge']}>Recommended</span>
                )}
              </button>
            ))}
          </div>
          <p className={styles['ntc__philosophy']}>
            <strong>{approachMeta.name}</strong>
            {approachMeta.recommended && (
              <span className={styles['ntc__badge']}>Recommended</span>
            )}
            <br />
            {approachMeta.philosophy}
          </p>
        </div>

        <div className={styles['ntc__group']}>
          <p className={styles['ntc__group-label']}>Surface</p>
          <div className={styles['ntc__list']} role="group" aria-label="Surface">
            {SURFACE_IDS.map((s) => (
              <button
                key={s}
                type="button"
                className={[
                  styles['ntc__list-btn'],
                  s === surface ? styles['ntc__list-btn--active'] : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => update({ surface: s })}
              >
                {SURFACE_META[s].title}
              </button>
            ))}
          </div>
        </div>

        <div className={styles['ntc__group']}>
          <p className={styles['ntc__group-label']}>State</p>
          <div className={styles['ntc__seg']} role="group" aria-label="State">
            {STATE_IDS.map((st) => (
              <button
                key={st}
                type="button"
                className={[
                  styles['ntc__seg-btn'],
                  st === state ? styles['ntc__seg-btn--active'] : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => update({ state: st })}
              >
                {st}
              </button>
            ))}
          </div>
          <p className={styles['ntc__hint']}>{STATE_META[state]}</p>
        </div>

        <div className={styles['ntc__notes']}>
          <p className={styles['ntc__group-label']}>Reviewer notes</p>
          <p className={styles['ntc__note-title']}>{surfaceMeta.title}</p>
          <p className={styles['ntc__note-meta']}>
            Console location: {surfaceMeta.console} · {surfaceMeta.requirements}
          </p>
          <p className={styles['ntc__note-body']}>{surfaceMeta.note}</p>
        </div>

        <p className={styles['ntc__footnote']}>
          Theme switching (all themes) is available in the top navigation bar above.
        </p>
      </aside>

      {/* ── Product viewport (pristine — no spec residue) ── */}
      <main className={styles['ntc__viewport']} aria-label="Product preview">
        <SurfaceCanvas approach={approach} surface={surface} state={state} />
      </main>
    </div>
  );
}
