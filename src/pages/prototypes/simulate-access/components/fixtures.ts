// Sample fixtures for the Simulate access prototype.
// Avatars come from src/assets/avatars/.

import type {
  UserSimulationRow,
  PolicyContext,
  SessionDecision,
  SessionAttributeValue,
  PermissionAction,
  CellVerdict,
  VerdictAttribution,
} from './types';

import avatarAiko from '@/assets/avatars/Aiko Tan.png';
import avatarArjun from '@/assets/avatars/Arjun Patel.png';
import avatarDanielle from '@/assets/avatars/Danielle Okoro.png';
import avatarDarius from '@/assets/avatars/Darius Cole.png';
import avatarDavid from '@/assets/avatars/David Liang.png';
import avatarEmma from '@/assets/avatars/Emma Novak.png';
import avatarEthan from '@/assets/avatars/Ethan Brooks.png';
import avatarIsabella from '@/assets/avatars/Isabella Cruz.png';
import avatarLeila from '@/assets/avatars/Leila Haddad.png';
import avatarLeonard from '@/assets/avatars/Leonard Riley.png';
import avatarLukas from '@/assets/avatars/Lukas Meyer.png';
import avatarMarco from '@/assets/avatars/Marco Rinaldi.png';
import avatarSofia from '@/assets/avatars/Sofia Bauer.png';

const compliant: SessionAttributeValue[] = [
  { key: 'session.device_type', label: 'Device type', value: 'desktop', type: 'enum' },
  { key: 'session.os_version', label: 'OS version', value: '14.5.0', type: 'version' },
  { key: 'session.client_version', label: 'Client version', value: '10.4.2', type: 'version' },
  { key: 'session.network_interface_type', label: 'Network', value: 'WiFi', type: 'enum' },
  { key: 'session.vpn_active', label: 'VPN active', value: true, type: 'boolean' },
  { key: 'session.device_mdm_enrolled', label: 'MDM enrolled', value: true, type: 'boolean' },
];

const mobileNoVpn: SessionAttributeValue[] = [
  { key: 'session.device_type', label: 'Device type', value: 'mobile', type: 'enum' },
  { key: 'session.os_version', label: 'OS version', value: '17.4.1', type: 'version' },
  { key: 'session.client_version', label: 'Client version', value: '2.18.0', type: 'version' },
  { key: 'session.network_interface_type', label: 'Network', value: 'Cellular', type: 'enum' },
  { key: 'session.vpn_active', label: 'VPN active', value: false, type: 'boolean' },
  { key: 'session.device_mdm_enrolled', label: 'MDM enrolled', value: true, type: 'boolean' },
];

const browserUnmanaged: SessionAttributeValue[] = [
  { key: 'session.device_type', label: 'Device type', value: 'browser', type: 'enum' },
  { key: 'session.os_version', label: 'OS version', value: null, type: 'version' },
  { key: 'session.client_version', label: 'Client version', value: '10.4.2', type: 'version' },
  { key: 'session.network_interface_type', label: 'Network', value: null, type: 'enum' },
  { key: 'session.vpn_active', label: 'VPN active', value: null, type: 'boolean' },
  { key: 'session.device_mdm_enrolled', label: 'MDM enrolled', value: false, type: 'boolean' },
];

const allNull: SessionAttributeValue[] = [
  { key: 'session.device_type', label: 'Device type', value: null, type: 'enum' },
  { key: 'session.os_version', label: 'OS version', value: null, type: 'version' },
  { key: 'session.client_version', label: 'Client version', value: null, type: 'version' },
  { key: 'session.network_interface_type', label: 'Network', value: null, type: 'enum' },
  { key: 'session.vpn_active', label: 'VPN active', value: null, type: 'boolean' },
  { key: 'session.device_mdm_enrolled', label: 'MDM enrolled', value: null, type: 'boolean' },
];

/** Helper: derive a single-verdict session from a uniform decision (used when policy has 1 action or all actions agree). */
const allowedSession = (
  sessionId: string,
  deviceLabel: string,
  lastActive: string,
  attrs: SessionAttributeValue[],
  actions: PermissionAction[] = ['download_file_attachment'],
): SessionDecision => ({
  sessionId,
  deviceLabel,
  lastActive,
  verdict: 'allowed',
  cellVerdicts: actions.map((a) => ({ action: a, verdict: 'allowed' })),
  attributes: attrs,
});

const deniedSession = (
  sessionId: string,
  deviceLabel: string,
  lastActive: string,
  attrs: SessionAttributeValue[],
  failingCondition: string,
  actions: PermissionAction[] = ['download_file_attachment'],
  attribution: VerdictAttribution = 'denied-this-policy',
): SessionDecision => ({
  sessionId,
  deviceLabel,
  lastActive,
  verdict: attribution,
  cellVerdicts: actions.map((a) => ({ action: a, verdict: attribution, failingCondition })),
  failingCondition,
  attributes: attrs,
});

/** Mixed-action session: actions disagree within a single session. */
const mixedSession = (
  sessionId: string,
  deviceLabel: string,
  lastActive: string,
  attrs: SessionAttributeValue[],
  cells: CellVerdict[],
): SessionDecision => {
  const allowedCount = cells.filter((c) => c.verdict === 'allowed').length;
  const deniedCount = cells.length - allowedCount;
  const verdict: VerdictAttribution =
    allowedCount === cells.length ? 'allowed'
      : deniedCount === cells.length ? cells[0].verdict
      : 'mixed';
  return {
    sessionId,
    deviceLabel,
    lastActive,
    verdict,
    cellVerdicts: cells,
    attributes: attrs,
  };
};

export const SAMPLE_POLICY_DOWNLOAD: PolicyContext = {
  policyName: 'IL5 Restricted Download',
  actions: ['download_file_attachment'],
  referencesSessionAttributes: true,
};

export const SAMPLE_POLICY_DOWNLOAD_UPLOAD: PolicyContext = {
  policyName: 'IL5 Restricted File Access',
  actions: ['download_file_attachment', 'upload_file_attachment'],
  referencesSessionAttributes: true,
};

export const SAMPLE_POLICY_USER_ATTRS_ONLY: PolicyContext = {
  policyName: 'Engineering Org — Standard Access',
  actions: ['download_file_attachment'],
  referencesSessionAttributes: false,
};

export const SAMPLE_POLICY_NO_SESSIONS_MULTI: PolicyContext = {
  policyName: 'Standard File Access',
  actions: ['download_file_attachment', 'upload_file_attachment'],
  referencesSessionAttributes: false,
};

// Demo policies for the v2 what-if attribute-scaling scenarios
// (the policyName contains the marker the customSession resolver looks for).
export const SAMPLE_POLICY_1_ATTR: PolicyContext = {
  policyName: 'VPN-only Download — 1-attr',
  actions: ['download_file_attachment'],
  referencesSessionAttributes: true,
};

export const SAMPLE_POLICY_10_ATTR: PolicyContext = {
  policyName: 'High-Assurance Download — 10-attr',
  actions: ['download_file_attachment'],
  referencesSessionAttributes: true,
};

const downloadAction: PermissionAction = 'download_file_attachment';
const uploadAction: PermissionAction = 'upload_file_attachment';

export const sampleUsers: UserSimulationRow[] = [
  {
    userId: 'u-leonard',
    name: 'Leonard Riley',
    handle: 'leonard.riley',
    avatarSrc: avatarLeonard,
    aggregateVerdict: 'allowed',
    perActionVerdicts: [{ action: downloadAction, verdict: 'allowed' }],
    sessions: [
      allowedSession('s-1', 'MacBook Pro', '4 min ago', compliant),
      allowedSession('s-2', 'iPhone 14', '20 min ago', compliant),
      allowedSession('s-3', 'iPad', '3 days ago', compliant),
    ],
  },
  {
    userId: 'u-marco',
    name: 'Marco Rinaldi',
    handle: 'marco.rinaldi',
    avatarSrc: avatarMarco,
    aggregateVerdict: 'denied-this-policy',
    perActionVerdicts: [{ action: downloadAction, verdict: 'denied-this-policy' }],
    sessions: [
      deniedSession(
        's-4',
        'iPhone 14 · cellular',
        '4 min ago',
        mobileNoVpn,
        'session.vpn_active == true',
      ),
      deniedSession(
        's-5',
        'MacBook Pro · public WiFi',
        '12 min ago',
        [
          { key: 'session.device_type', label: 'Device type', value: 'desktop', type: 'enum' },
          { key: 'session.os_version', label: 'OS version', value: '14.5.0', type: 'version' },
          { key: 'session.client_version', label: 'Client version', value: '10.4.2', type: 'version' },
          { key: 'session.network_interface_type', label: 'Network', value: 'WiFi', type: 'enum' },
          { key: 'session.vpn_active', label: 'VPN active', value: false, type: 'boolean' },
          { key: 'session.device_mdm_enrolled', label: 'MDM enrolled', value: true, type: 'boolean' },
        ],
        'session.vpn_active == true',
      ),
    ],
  },
  {
    userId: 'u-aiko',
    name: 'Aiko Tan',
    handle: 'aiko.tan',
    avatarSrc: avatarAiko,
    aggregateVerdict: 'allowed',
    perActionVerdicts: [{ action: downloadAction, verdict: 'allowed' }],
    sessions: [allowedSession('s-6', 'MacBook Air · WiFi', '8 min ago', compliant)],
  },
  {
    userId: 'u-darius',
    name: 'Darius Cole',
    handle: 'darius.cole',
    avatarSrc: avatarDarius,
    aggregateVerdict: 'denied-another-policy',
    perActionVerdicts: [{ action: downloadAction, verdict: 'denied-another-policy' }],
    sessions: [
      {
        sessionId: 's-7',
        deviceLabel: 'iPhone 15 · WiFi',
        lastActive: '1 min ago',
        verdict: 'denied-another-policy',
        cellVerdicts: [{ action: downloadAction, verdict: 'denied-another-policy' }],
        attributes: compliant,
      },
    ],
  },
  {
    userId: 'u-isabella',
    name: 'Isabella Cruz',
    handle: 'isabella.cruz',
    avatarSrc: avatarIsabella,
    aggregateVerdict: 'mixed',
    perActionVerdicts: [
      { action: downloadAction, verdict: 'allowed' },
      { action: uploadAction, verdict: 'denied-this-policy' },
    ],
    sessions: [
      mixedSession(
        's-8',
        'iPad Pro · WiFi',
        '14 min ago',
        mobileNoVpn,
        [
          { action: downloadAction, verdict: 'allowed' },
          { action: uploadAction, verdict: 'denied-this-policy', failingCondition: 'session.network_interface_type != "Cellular"' },
        ],
      ),
    ],
  },
  {
    userId: 'u-emma',
    name: 'Emma Novak',
    handle: 'emma.novak',
    avatarSrc: avatarEmma,
    aggregateVerdict: 'denied-no-recent-session',
    perActionVerdicts: [{ action: downloadAction, verdict: 'denied-no-recent-session' }],
    sessions: [
      {
        sessionId: 'placeholder-emma',
        deviceLabel: 'No recent session',
        lastActive: '> 30 days',
        verdict: 'denied-no-recent-session',
        cellVerdicts: [{ action: downloadAction, verdict: 'denied-no-recent-session' }],
        attributes: allNull,
        isPlaceholder: true,
      },
    ],
  },
  {
    userId: 'u-arjun',
    name: 'Arjun Patel',
    handle: 'arjun.patel',
    avatarSrc: avatarArjun,
    aggregateVerdict: 'mixed',
    perActionVerdicts: [{ action: downloadAction, verdict: 'mixed' }],
    sessions: [
      allowedSession('s-9', 'MacBook · WiFi', '22 sec ago', compliant),
      {
        sessionId: 's-10',
        deviceLabel: 'Browser · Chrome (unmanaged)',
        lastActive: '6 hr ago',
        verdict: 'denied-this-policy',
        cellVerdicts: [{ action: downloadAction, verdict: 'denied-this-policy', failingCondition: 'session.device_mdm_enrolled == true' }],
        attributes: browserUnmanaged,
        failingCondition: 'session.device_mdm_enrolled == true',
      },
    ],
  },
  {
    userId: 'u-leila',
    name: 'Leila Haddad',
    handle: 'leila.haddad',
    avatarSrc: avatarLeila,
    aggregateVerdict: 'allowed',
    perActionVerdicts: [{ action: downloadAction, verdict: 'allowed' }],
    sessions: [allowedSession('s-11', 'iPhone 14 · WiFi', '38 min ago', compliant)],
  },
  {
    userId: 'u-david',
    name: 'David Liang',
    handle: 'david.liang',
    avatarSrc: avatarDavid,
    aggregateVerdict: 'denied-this-policy',
    perActionVerdicts: [{ action: downloadAction, verdict: 'denied-this-policy' }],
    sessions: [
      {
        sessionId: 's-12',
        deviceLabel: 'MacBook · Cellular hotspot',
        lastActive: '3 min ago',
        verdict: 'denied-this-policy',
        cellVerdicts: [{ action: downloadAction, verdict: 'denied-this-policy', failingCondition: 'session.vpn_active == true' }],
        attributes: mobileNoVpn,
        failingCondition: 'session.vpn_active == true',
      },
    ],
  },
];

// Backfill cellVerdicts for any session that doesn't have it yet — keeps fixtures concise.
sampleUsers.forEach((u) => {
  u.sessions.forEach((s) => {
    if (!s.cellVerdicts || s.cellVerdicts.length === 0) {
      s.cellVerdicts = [{ action: downloadAction, verdict: s.verdict, failingCondition: s.failingCondition }];
    }
  });
});

// Mark Marco's first session as overridden — drives the amber-dot demo.
const marco = sampleUsers.find((u) => u.userId === 'u-marco');
if (marco && marco.sessions[0]) {
  marco.sessions[0].hasOverrides = true;
}

/** Sample data for a non-member channel admin scenario. */
export const sampleNonMember: UserSimulationRow = {
  userId: 'u-ethan',
  name: 'Ethan Brooks',
  handle: 'ethan.brooks',
  avatarSrc: avatarEthan,
  aggregateVerdict: 'denied-not-a-member',
  isNonMember: true,
  perActionVerdicts: [{ action: downloadAction, verdict: 'denied-not-a-member' }],
  sessions: [],
};

/** Channel members fixture for channel-listing pre-population. */
export const sampleChannelMembers: UserSimulationRow[] = [
  sampleUsers[0],
  sampleUsers[1],
  sampleUsers[2],
  sampleUsers[3],
  sampleUsers[6],
  sampleUsers[7],
];

/** Multi-action policy fixture (Download + Upload) — populates cell-level verdicts per session. */
function withMultiActionCells(
  base: UserSimulationRow,
  cellsPerSession: (sessionIdx: number) => CellVerdict[],
  aggregate: VerdictAttribution,
  perAction: { action: PermissionAction; verdict: VerdictAttribution }[],
): UserSimulationRow {
  const sessions = base.sessions.map((s, i) => {
    const cells = cellsPerSession(i);
    const allowed = cells.filter((c) => c.verdict === 'allowed').length;
    const denied = cells.length - allowed;
    const sessionVerdict: VerdictAttribution =
      allowed === cells.length ? 'allowed'
        : denied === cells.length ? cells[0].verdict
        : 'mixed';
    return { ...s, verdict: sessionVerdict, cellVerdicts: cells };
  });
  return { ...base, sessions, aggregateVerdict: aggregate, perActionVerdicts: perAction };
}

export const sampleMultiActionUsers: UserSimulationRow[] = [
  // Leonard — fully allowed across sessions and actions
  withMultiActionCells(
    sampleUsers[0],
    () => [
      { action: downloadAction, verdict: 'allowed' },
      { action: uploadAction, verdict: 'allowed' },
    ],
    'allowed',
    [{ action: downloadAction, verdict: 'allowed' }, { action: uploadAction, verdict: 'allowed' }],
  ),
  // Marco — fully denied (vpn off) across sessions and actions
  withMultiActionCells(
    sampleUsers[1],
    () => [
      { action: downloadAction, verdict: 'denied-this-policy', failingCondition: 'session.vpn_active == true' },
      { action: uploadAction, verdict: 'denied-this-policy', failingCondition: 'session.vpn_active == true' },
    ],
    'denied-this-policy',
    [{ action: downloadAction, verdict: 'denied-this-policy' }, { action: uploadAction, verdict: 'denied-this-policy' }],
  ),
  // Aiko — mixed: Download allowed, Upload denied (one session)
  withMultiActionCells(
    sampleUsers[2],
    () => [
      { action: downloadAction, verdict: 'allowed' },
      { action: uploadAction, verdict: 'denied-this-policy', failingCondition: 'session.network_interface_type != "Cellular"' },
    ],
    'mixed',
    [{ action: downloadAction, verdict: 'allowed' }, { action: uploadAction, verdict: 'denied-this-policy' }],
  ),
  // Darius — Download denied by another policy, Upload allowed
  withMultiActionCells(
    sampleUsers[3],
    () => [
      { action: downloadAction, verdict: 'denied-another-policy' },
      { action: uploadAction, verdict: 'allowed' },
    ],
    'mixed',
    [{ action: downloadAction, verdict: 'denied-another-policy' }, { action: uploadAction, verdict: 'allowed' }],
  ),
];

/** Searchable directory used by the user picker. */
export const directorySamplePool = [
  ...sampleUsers,
  sampleNonMember,
  {
    userId: 'u-sofia',
    name: 'Sofia Bauer',
    handle: 'sofia.bauer',
    avatarSrc: avatarSofia,
    aggregateVerdict: 'allowed' as const,
    perActionVerdicts: [{ action: downloadAction, verdict: 'allowed' as const }],
    sessions: [allowedSession('s-sofia-1', 'MacBook · WiFi', '2 min ago', compliant)],
  },
  {
    userId: 'u-lukas',
    name: 'Lukas Meyer',
    handle: 'lukas.meyer',
    avatarSrc: avatarLukas,
    aggregateVerdict: 'allowed' as const,
    perActionVerdicts: [{ action: downloadAction, verdict: 'allowed' as const }],
    sessions: [allowedSession('s-lukas-1', 'iPhone · WiFi', '11 min ago', compliant)],
  },
  {
    userId: 'u-danielle',
    name: 'Danielle Okoro',
    handle: 'danielle.okoro',
    avatarSrc: avatarDanielle,
    aggregateVerdict: 'allowed' as const,
    perActionVerdicts: [{ action: downloadAction, verdict: 'allowed' as const }],
    sessions: [allowedSession('s-danielle-1', 'MacBook · WiFi', '1 hr ago', compliant)],
  },
];
