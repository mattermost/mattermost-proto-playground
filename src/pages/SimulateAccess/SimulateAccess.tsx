import { useEffect, useState } from 'react';
import SimulateAccessModal from './shared/SimulateAccessModal';
import IbrahimSimulateModal from './ibrahim/IbrahimSimulateModal';
import {
  sampleUsers,
  sampleNonMember,
  sampleChannelMembers,
  sampleMultiActionUsers,
  directorySamplePool,
  SAMPLE_POLICY_DOWNLOAD,
  SAMPLE_POLICY_DOWNLOAD_UPLOAD,
  SAMPLE_POLICY_NO_SESSIONS_MULTI,
  SAMPLE_POLICY_1_ATTR,
  SAMPLE_POLICY_10_ATTR,
} from './shared/fixtures';
import type { CustomSessionMode } from './shared/UserRow';
import type {
  AdminRole,
  EntryContext,
  PermissionAction,
  PolicyContext,
  UserSimulationRow,
} from './shared/types';
import styles from './shared/SimulateAccess.module.scss';

interface Scenario {
  id: string;
  group:
    | 'Primary surfaces'
    | 'Policy without session attributes'
    | 'Ibrahim variant (May 7 meeting)'
    | 'Custom session — design comparison'
    | 'Edge cases';
  tag: string;
  title: string;
  body: string;
  role: AdminRole;
  context: EntryContext;
  policy?: PolicyContext;
  channelName?: string;
  initialUsers?: UserSimulationRow[];
  pool?: UserSimulationRow[];
  availablePermissions?: PermissionAction[];
  /** Custom-session affordance variant. */
  customSessionMode?: CustomSessionMode;
  /** When true, render the Ibrahim variant modal instead of the main one. */
  variant?: 'ibrahim';
}

const SCENARIOS: Scenario[] = [
  {
    id: 'sys-listing-empty',
    group: 'Primary surfaces',
    tag: 'System Console · Listing · Empty',
    title: 'Empty state — system listing',
    body: 'No users selected yet. Search to add users. The 3-avatar illustration anchors the empty state.',
    role: 'system',
    context: 'system-listing',
    initialUsers: [],
    pool: directorySamplePool,
    availablePermissions: ['download_file_attachment', 'upload_file_attachment'],
  },
  {
    id: 'sys-listing',
    group: 'Primary surfaces',
    tag: 'System Console · Listing · Selected',
    title: 'System Admin — users selected',
    body: 'Mockup #2: rows with verdict pill, sessions count, chevron. Hover any row to reveal the remove icon.',
    role: 'system',
    context: 'system-listing',
    initialUsers: sampleMultiActionUsers,
    pool: directorySamplePool,
    availablePermissions: ['download_file_attachment', 'upload_file_attachment'],
  },
  {
    id: 'sys-editor',
    group: 'Primary surfaces',
    tag: 'System Console · Editor',
    title: 'System Admin — editing a system policy',
    body: 'Multi-action policy. Click any pill to open the per-permission popover. Click chevron / row to expand sessions.',
    role: 'system',
    context: 'system-editor',
    policy: SAMPLE_POLICY_DOWNLOAD_UPLOAD,
    initialUsers: sampleMultiActionUsers,
    pool: directorySamplePool,
  },
  {
    id: 'channel-editor',
    group: 'Primary surfaces',
    tag: 'Channel Settings · Editor',
    title: 'Channel Admin — editing a channel policy',
    body: 'Trusted channel admin context. Per-session verdicts visible; raw attribute values hidden; no edit pencil.',
    role: 'channel',
    context: 'channel-editor',
    policy: SAMPLE_POLICY_DOWNLOAD,
    channelName: 'Operation Aurora',
    initialUsers: [...sampleUsers.slice(0, 4), sampleNonMember],
    pool: directorySamplePool,
  },
  {
    id: 'channel-listing',
    group: 'Primary surfaces',
    tag: 'Channel Settings · Listing',
    title: 'Channel Admin — channel permissions panel',
    body: 'Pre-populated with channel members. Permission filter at top.',
    role: 'channel',
    context: 'channel-listing',
    channelName: 'Operation Aurora',
    initialUsers: sampleChannelMembers,
    pool: directorySamplePool,
    availablePermissions: ['download_file_attachment'],
  },
  // ── Ibrahim variant (May 7 meeting) ──────────────────────────────────
  {
    id: 'ibrahim-empty',
    group: 'Ibrahim variant (May 7 meeting)',
    tag: 'Empty state',
    title: 'Ibrahim variant — empty',
    body: 'Captures the May 7 meeting decisions: "+ Add users" button (right side of header), USER/RESULT columns, "This rule only" toggle, "Re-run" CTA.',
    role: 'system',
    context: 'system-editor',
    policy: SAMPLE_POLICY_NO_SESSIONS_MULTI,
    initialUsers: [],
    pool: directorySamplePool,
    variant: 'ibrahim',
  },
  {
    id: 'ibrahim-results',
    group: 'Ibrahim variant (May 7 meeting)',
    tag: 'Results',
    title: 'Ibrahim variant — users selected',
    body: 'Two-column table. Click any result pill (with permissions count + chevron) to open the Decision details modal.',
    role: 'system',
    context: 'system-editor',
    policy: SAMPLE_POLICY_NO_SESSIONS_MULTI,
    initialUsers: sampleMultiActionUsers,
    pool: directorySamplePool,
    variant: 'ibrahim',
  },
  {
    id: 'ibrahim-add-users',
    group: 'Ibrahim variant (May 7 meeting)',
    tag: 'Add users popover',
    title: 'Add users popover',
    body: 'Click "+ Add users" — a search popover anchors below the button. Search by name or email; add users one at a time without crowding the list.',
    role: 'system',
    context: 'system-editor',
    policy: SAMPLE_POLICY_NO_SESSIONS_MULTI,
    initialUsers: sampleMultiActionUsers.slice(0, 1),
    pool: directorySamplePool,
    variant: 'ibrahim',
  },

  // ── Policy without session attributes ────────────────────────────────
  {
    id: 'no-sessions-empty',
    group: 'Policy without session attributes',
    tag: 'Empty state',
    title: 'No-sessions variant — empty',
    body: 'Same modal shell, but the policy doesn\'t reference session attributes. Subtitle copy changes to remove the "active permission policies" qualifier.',
    role: 'system',
    context: 'system-editor',
    policy: SAMPLE_POLICY_NO_SESSIONS_MULTI,
    initialUsers: [],
    pool: directorySamplePool,
  },
  {
    id: 'no-sessions-results',
    group: 'Policy without session attributes',
    tag: 'Results',
    title: 'No-sessions variant — users selected',
    body: 'Per-row expansion is gone. No chevron, no session count. Each user shows just an aggregate verdict and the remove icon. Click any pill to open the per-permission popover.',
    role: 'system',
    context: 'system-editor',
    policy: SAMPLE_POLICY_NO_SESSIONS_MULTI,
    initialUsers: sampleMultiActionUsers,
    pool: directorySamplePool,
  },
  {
    id: 'no-sessions-listing',
    group: 'Policy without session attributes',
    tag: 'Listing entry',
    title: 'No-sessions — system listing',
    body: 'Same compact rows, available from the System Console permission policies list page header.',
    role: 'system',
    context: 'system-listing',
    initialUsers: sampleMultiActionUsers,
    pool: directorySamplePool,
    availablePermissions: ['download_file_attachment', 'upload_file_attachment'],
  },

  // ── V4: Session chips — real + custom sessions in a single chip row ────────
  {
    id: 'cs4-chips-3attr',
    group: 'Custom session — design comparison',
    tag: 'Chips · 3-attribute policy',
    title: 'Session chips — real + custom in one row',
    body: 'All sessions render as chips: leading verdict-colored icon + label + chevron. Real chips: solid border. Custom chips: dashed border + "Custom · " prefix. Click any chip → detail popover with verdict, per-permission breakdown, failing condition, and attributes (system admin only). Click "+ Add custom session" pseudo-chip → new-custom-session popover with attribute editor + live verdict.',
    role: 'system',
    context: 'system-editor',
    policy: SAMPLE_POLICY_DOWNLOAD,
    initialUsers: [sampleUsers[1] /* Marco */, sampleUsers[5] /* Emma */],
    pool: directorySamplePool,
    customSessionMode: 'custom-session-chips',
  },
  {
    id: 'cs4-chips-multi-action',
    group: 'Custom session — design comparison',
    tag: 'Chips · Multi-action (Mixed)',
    title: 'Session chips with multi-action policy',
    body: 'Multi-action policy (download + upload). Sessions can have a Mixed verdict (yellow leading icon). Click a chip to see per-permission breakdown.',
    role: 'system',
    context: 'system-editor',
    policy: SAMPLE_POLICY_DOWNLOAD_UPLOAD,
    initialUsers: sampleMultiActionUsers,
    pool: directorySamplePool,
    customSessionMode: 'custom-session-chips',
  },
  {
    id: 'cs4-chips-10attr',
    group: 'Custom session — design comparison',
    tag: 'Chips · 10 attributes',
    title: 'Session chips with high attribute count (10)',
    body: 'Same chip mode, but the new-custom-session popover renders 10 attribute fields in a 2-column grid. Once added, the chip just shows verdict + label like all other chips.',
    role: 'system',
    context: 'system-editor',
    policy: SAMPLE_POLICY_10_ATTR,
    initialUsers: [sampleUsers[1] /* Marco */, sampleUsers[5] /* Emma */],
    pool: directorySamplePool,
    customSessionMode: 'custom-session-chips',
  },
  {
    id: 'cs4-chips-channel-admin',
    group: 'Custom session — design comparison',
    tag: 'Chips · Channel admin (gate)',
    title: 'Channel admin: chips show verdict-only popover',
    body: 'Privacy gate verification. Channel admins see real session chips (verdict-only popover — no attribute values, no failing-condition CEL). No "+ Add custom session" affordance. Includes Emma (0 sessions) so the channel admin\'s most common debugging case is testable.',
    role: 'channel',
    context: 'channel-editor',
    policy: SAMPLE_POLICY_DOWNLOAD,
    channelName: 'Operation Aurora',
    initialUsers: [...sampleUsers.slice(0, 4), sampleUsers[5] /* Emma — 0 sessions */, sampleNonMember],
    pool: directorySamplePool,
    customSessionMode: 'custom-session-chips',
  },

  // ── V3: Custom session (single per-user button + auto-clone most recent) ──
  {
    id: 'cs3-3attr',
    group: 'Custom session — design comparison',
    tag: 'Custom session · 3-attribute policy',
    title: 'Custom session — auto-clone most recent (recommended)',
    body: 'Single "Add custom session" button at the bottom of the expanded session list. Auto-clones the user\'s most recent session (or compliant defaults if none). Click attribute chips to edit. One per user. For 0-session users (Emma), placeholder row stays without the explanatory footer note.',
    role: 'system',
    context: 'system-editor',
    policy: SAMPLE_POLICY_DOWNLOAD,
    initialUsers: [sampleUsers[1] /* Marco */, sampleUsers[5] /* Emma */],
    pool: directorySamplePool,
    customSessionMode: 'custom-session',
  },
  {
    id: 'cs3-source-picker',
    group: 'Custom session — design comparison',
    tag: 'Custom session · Source picker variant',
    title: 'Custom session — with source picker',
    body: 'Same as above, but the custom session row carries an inline "Source: …" dropdown so the admin can switch which real session it\'s cloned from (or fall back to compliant defaults).',
    role: 'system',
    context: 'system-editor',
    policy: SAMPLE_POLICY_DOWNLOAD,
    initialUsers: [sampleUsers[1] /* Marco — has 2 real sessions */, sampleUsers[5] /* Emma */],
    pool: directorySamplePool,
    customSessionMode: 'custom-session-source-picker',
  },
  {
    id: 'cs3-1attr',
    group: 'Custom session — design comparison',
    tag: 'Custom session · 1 attribute',
    title: 'Custom session — minimum scale (1 attribute)',
    body: 'Policy references only `vpn_active`. Single chip on the custom session row. Click → 220px popover with one toggle.',
    role: 'system',
    context: 'system-editor',
    policy: SAMPLE_POLICY_1_ATTR,
    initialUsers: [sampleUsers[1] /* Marco */],
    pool: directorySamplePool,
    customSessionMode: 'custom-session',
  },
  {
    id: 'cs3-10attr',
    group: 'Custom session — design comparison',
    tag: 'Custom session · 10 attributes',
    title: 'Custom session — high attribute count (10 attributes)',
    body: 'High-assurance policy with 10 referenced attributes. Chip layout switches to a 2-column grid — no hidden state. All attributes always visible, edited ones are semibold + underlined.',
    role: 'system',
    context: 'system-editor',
    policy: SAMPLE_POLICY_10_ATTR,
    initialUsers: [sampleUsers[1] /* Marco */, sampleUsers[5] /* Emma */],
    pool: directorySamplePool,
    customSessionMode: 'custom-session',
  },
  {
    id: 'cs3-channel-admin',
    group: 'Custom session — design comparison',
    tag: 'Custom session · Channel admin (gate)',
    title: 'Channel admin: custom session affordance is hidden',
    body: 'Privacy gate verification. Channel admins never see the "Add custom session" button — sessions look exactly like the status quo.',
    role: 'channel',
    context: 'channel-editor',
    policy: SAMPLE_POLICY_DOWNLOAD,
    channelName: 'Operation Aurora',
    initialUsers: [...sampleUsers.slice(0, 4), sampleNonMember],
    pool: directorySamplePool,
    customSessionMode: 'custom-session',
  },

  // ── V1: earlier design comparison (kept for reference) ──────────────────
  {
    id: 'cs-status-quo',
    group: 'Custom session — design comparison',
    tag: '0 — Status quo',
    title: '0 · Today: pencil "Edit values" on each session',
    body: 'Current behavior. Pencil icon on each real session opens an override popover. Design team flagged: confusing — feels like editing real data, adds chrome, value unclear.',
    role: 'system',
    context: 'system-editor',
    policy: SAMPLE_POLICY_DOWNLOAD,
    initialUsers: [sampleUsers[1] /* Marco — 2 denied sessions */, sampleUsers[5] /* Emma — 0 sessions */],
    pool: directorySamplePool,
    customSessionMode: 'edit-values',
  },
  {
    id: 'cs-option-c',
    group: 'Custom session — design comparison',
    tag: 'C — Persistent card (recommended)',
    title: 'C · Persistent "Custom session" card under real sessions',
    body: 'For users with sessions: collapsed prompt + Set up button. For 0-session users: card expands by default, replacing the fail-secure-deny placeholder. Synthetic chrome (dashed border, info-tone left bar, CUSTOM SESSION kicker) makes provenance unmistakable.',
    role: 'system',
    context: 'system-editor',
    policy: SAMPLE_POLICY_DOWNLOAD,
    initialUsers: [sampleUsers[1] /* Marco */, sampleUsers[5] /* Emma */],
    pool: directorySamplePool,
    customSessionMode: 'persistent-card',
  },
  {
    id: 'cs-option-b',
    group: 'Custom session — design comparison',
    tag: 'B — Inline ghost row',
    title: 'B · Ghost "+ Add a custom session" row that morphs in place',
    body: 'Lower visual weight than C — a dashed ghost row at the bottom of the session list. On click, morphs into editable fields. After test, collapses to a synthetic-styled session row peer of the real sessions.',
    role: 'system',
    context: 'system-editor',
    policy: SAMPLE_POLICY_DOWNLOAD,
    initialUsers: [sampleUsers[1] /* Marco */, sampleUsers[5] /* Emma */],
    pool: directorySamplePool,
    customSessionMode: 'inline-ghost',
  },
  {
    id: 'cs-option-c-channel-admin',
    group: 'Custom session — design comparison',
    tag: 'C — Channel admin (gating check)',
    title: 'Channel admin: Custom session is hidden',
    body: 'Privacy gate: channel admins cannot see raw session attribute values, so they cannot construct a synthetic session. The card is not rendered for role=channel — sessions look like the status quo.',
    role: 'channel',
    context: 'channel-editor',
    policy: SAMPLE_POLICY_DOWNLOAD,
    channelName: 'Operation Aurora',
    initialUsers: [...sampleUsers.slice(0, 4), sampleNonMember],
    pool: directorySamplePool,
    customSessionMode: 'persistent-card',
  },
  {
    id: 'cs-option-b-channel-admin',
    group: 'Custom session — design comparison',
    tag: 'B — Channel admin (gating check)',
    title: 'Channel admin: Ghost row is hidden',
    body: 'Same gate as C, but for the ghost-row variant. Verifies the privacy gate works identically across both options.',
    role: 'channel',
    context: 'channel-editor',
    policy: SAMPLE_POLICY_DOWNLOAD,
    channelName: 'Operation Aurora',
    initialUsers: [...sampleUsers.slice(0, 4), sampleNonMember],
    pool: directorySamplePool,
    customSessionMode: 'inline-ghost',
  },

  {
    id: 'edge-no-recent-session',
    group: 'Edge cases',
    tag: 'No recent session',
    title: 'User has no session ≤30 days',
    body: 'Fail-secure deny. Expand to a placeholder session row with the explanatory note.',
    role: 'system',
    context: 'system-editor',
    policy: SAMPLE_POLICY_DOWNLOAD,
    initialUsers: [sampleUsers[5]],
    pool: directorySamplePool,
  },
  {
    id: 'edge-non-member',
    group: 'Edge cases',
    tag: 'Channel non-member',
    title: 'Channel admin tests a non-member',
    body: '"Denied · Not a member" short-circuit. No session evaluation.',
    role: 'channel',
    context: 'channel-editor',
    policy: SAMPLE_POLICY_DOWNLOAD,
    channelName: 'Operation Aurora',
    initialUsers: [sampleNonMember, sampleUsers[0]],
    pool: directorySamplePool,
  },
  {
    id: 'edge-this-policy-only',
    group: 'Edge cases',
    tag: 'This-policy-only mode',
    title: 'Editor mode hides other-policy denies',
    body: 'Toggle "Evaluate against · This policy only". Banner shows scope; verdicts collapse to this policy\'s decision.',
    role: 'system',
    context: 'system-editor',
    policy: SAMPLE_POLICY_DOWNLOAD_UPLOAD,
    initialUsers: sampleMultiActionUsers,
    pool: directorySamplePool,
  },
];

export default function SimulateAccess() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const active = SCENARIOS.find((s) => s.id === activeId);

  useEffect(() => {
    if (!activeId) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setActiveId(null);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeId]);

  const groups = [
    'Custom session — design comparison',
    'Primary surfaces',
    'Ibrahim variant (May 7 meeting)',
    'Policy without session attributes',
    'Edge cases',
  ] as const;

  return (
    <div className={styles['sa-hub']}>
      <div className={styles['sa-hub__intro']}>
        <h1 className={styles['sa-hub__intro-title']}>Simulate Access — interactive prototype</h1>
        <p className={styles['sa-hub__intro-body']}>
          Pixel-for-pixel rebuild of the team's mockups. Click a scenario to launch the modal. Pills are clickable
          (per-permission popover), pencil icons open the edit-attributes popover, and rows reveal a remove button on hover.
        </p>
      </div>

      {groups.map((group) => (
        <div key={group}>
          <div className={styles['sa-hub__section-title']}>{group}</div>
          <div className={styles['sa-hub__cards']}>
            {SCENARIOS.filter((s) => s.group === group).map((s) => (
              <a
                key={s.id}
                className={styles['sa-hub__card']}
                href={`#${s.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  setActiveId(s.id);
                }}
              >
                <span className={styles['sa-hub__card-tag']}>{s.tag}</span>
                <h3 className={styles['sa-hub__card-title']}>{s.title}</h3>
                <p className={styles['sa-hub__card-body']}>{s.body}</p>
              </a>
            ))}
          </div>
        </div>
      ))}

      {active && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: 20,
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setActiveId(null);
          }}
        >
          <div className={styles['sa-modal-card']}>
            {active.variant === 'ibrahim' ? (
              <IbrahimSimulateModal
                key={active.id}
                policy={active.policy}
                initialUsers={active.initialUsers}
                userPool={active.pool ?? directorySamplePool}
                availablePermissions={active.availablePermissions}
                onClose={() => setActiveId(null)}
              />
            ) : (
              <SimulateAccessModal
                key={active.id}
                role={active.role}
                context={active.context}
                policy={active.policy}
                channelName={active.channelName}
                initialUsers={active.initialUsers}
                userPool={active.pool ?? directorySamplePool}
                availablePermissions={active.availablePermissions}
                customSessionMode={active.customSessionMode}
                onClose={() => setActiveId(null)}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
