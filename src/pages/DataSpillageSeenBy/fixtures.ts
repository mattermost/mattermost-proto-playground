// Fixtures for the Data Spillage "Seen By" exposure roster prototype.
// Confidence tiers and surface labels map directly to engineering's
// "Mechanisms of Viewing Post Contents" table (Confluence ICT/4237656115).

import avatarAiko from '@/assets/avatars/Aiko Tan.png';
import avatarArjun from '@/assets/avatars/Arjun Patel.png';
import avatarDarius from '@/assets/avatars/Darius Cole.png';
import avatarDavid from '@/assets/avatars/David Liang.png';
import avatarEmma from '@/assets/avatars/Emma Novak.png';
import avatarIsabella from '@/assets/avatars/Isabella Cruz.png';
import avatarLeila from '@/assets/avatars/Leila Haddad.png';
import avatarLukas from '@/assets/avatars/Lukas Meyer.png';
import avatarMarco from '@/assets/avatars/Marco Rinaldi.png';
import avatarSofia from '@/assets/avatars/Sofia Bauer.png';

export type Tier = 'confirmed' | 'inferred' | 'lateral';

/** Icon key — resolved to a compass-icon component in the view layer. */
export type SurfaceIcon =
  | 'view'
  | 'session'
  | 'email'
  | 'push'
  | 'ping'
  | 'api'
  | 'search'
  | 'permalink'
  | 'webhook'
  | 'integration';

export interface ExposureEvent {
  /** User-facing surface label (never the internal mechanism name). */
  surface: string;
  /** Optional extra context, e.g. the channel a permalink leaked into. */
  detail?: string;
  /** Local-time display string. */
  time: string;
  icon: SurfaceIcon;
  /** Content left the platform (inbox / device) — drives a remediation hint. */
  offPlatform?: boolean;
}

export interface ExposureItem {
  key: string;
  /** Display name (person) or destination name (system). */
  name: string;
  /** Avatar photo for people. Omit for systems/destinations. */
  src?: string;
  tier: Tier;
  /** When true, render an icon tile instead of a person avatar. */
  system?: boolean;
  /** For lateral-leak destinations: how many further people may be reached. */
  reach?: number;
  /** Earliest exposure time, shown on the collapsed row. */
  earliest: string;
  events: ExposureEvent[];
}

export interface TierMeta {
  tier: Tier;
  label: string;
  tone: 'success' | 'warning' | 'danger';
  definition: string;
  action: string;
}

export const TIER_META: Record<Tier, TierMeta> = {
  confirmed: {
    tier: 'confirmed',
    label: 'Confirmed they saw it',
    tone: 'success',
    definition:
      'Direct evidence the message reached this person before it was quarantined.',
    action: 'Re-brief now',
  },
  inferred: {
    tier: 'inferred',
    label: 'May have seen it',
    tone: 'warning',
    definition:
      "Signals suggest they were exposed, but we can't confirm they read this message.",
    action: 'Investigate before acting',
  },
  lateral: {
    tier: 'lateral',
    label: 'Reached beyond this channel',
    tone: 'danger',
    definition:
      'The message spread to places it was never posted — other channels, systems, or integrations. Treat as a possible new spill.',
    action: 'Escalate separately',
  },
};

// Quarantined message context (mirrors the report card in the RHS).
export const REPORT = {
  reporter: 'Leonard Riley',
  author: 'Gordon Walker',
  channel: 'UX Design',
  team: 'Staff',
  postedAt: '10:43 AM on April 24 (Monday)',
  quarantinedAt: '10:45 AM',
  durationVisible: '2 mins, 12 sec',
  reason: 'Classification mismatch',
  comment:
    'It looks like this was posted in the wrong channel and may contain sensitive personal information.',
  asOf: '10:45 AM',
};

// Hand-authored "hero" rows with rich detail; padded out below to demo scale.
const CURATED: ExposureItem[] = [
  // ── Confirmed (5 users) ──────────────────────────────────────────────
  {
    key: 'marco',
    name: 'Marco Rinaldi',
    src: avatarMarco,
    tier: 'confirmed',
    earliest: '10:43 AM',
    events: [{ surface: 'Opened the channel', time: '10:43 AM', icon: 'view' }],
  },
  {
    key: 'aiko',
    name: 'Aiko Tan',
    src: avatarAiko,
    tier: 'confirmed',
    earliest: '10:43 AM',
    events: [
      { surface: 'Opened the channel', time: '10:43 AM', icon: 'view' },
      { surface: 'Opened the thread', time: '10:44 AM', icon: 'view' },
    ],
  },
  {
    key: 'emma',
    name: 'Emma Novak',
    src: avatarEmma,
    tier: 'confirmed',
    earliest: '10:43 AM',
    events: [
      { surface: 'Read offline (synced while online)', time: '10:43 AM', icon: 'view' },
    ],
  },
  {
    key: 'david',
    name: 'David Liang',
    src: avatarDavid,
    tier: 'confirmed',
    earliest: '10:43 AM',
    events: [
      {
        surface: 'Full content sent by email',
        detail: 'Content left the platform to their inbox',
        time: '10:43 AM',
        icon: 'email',
        offPlatform: true,
      },
    ],
  },
  {
    key: 'darius',
    name: 'Darius Cole',
    src: avatarDarius,
    tier: 'confirmed',
    earliest: '10:43 AM',
    events: [
      { surface: 'Delivered to an active session', time: '10:43 AM', icon: 'session' },
      {
        surface: 'Full content on device notification',
        detail: 'Content rendered on a mobile lock screen',
        time: '10:43 AM',
        icon: 'push',
        offPlatform: true,
      },
    ],
  },

  // ── Inferred (5 users) ───────────────────────────────────────────────
  {
    key: 'arjun',
    name: 'Arjun Patel',
    src: avatarArjun,
    tier: 'inferred',
    earliest: '10:45 AM',
    events: [
      {
        surface: 'Marked the channel as read',
        detail: 'Assumes all messages read — no proof this post was viewed',
        time: '10:45 AM',
        icon: 'view',
      },
    ],
  },
  {
    key: 'sofia',
    name: 'Sofia Bauer',
    src: avatarSofia,
    tier: 'inferred',
    earliest: '10:44 AM',
    events: [
      {
        surface: 'Posted in the channel',
        detail: 'Backend assumes the author saw earlier posts',
        time: '10:44 AM',
        icon: 'view',
      },
    ],
  },
  {
    key: 'leila',
    name: 'Leila Haddad',
    src: avatarLeila,
    tier: 'inferred',
    earliest: '10:43 AM',
    events: [
      {
        surface: 'Notification ping (no content)',
        detail: 'ID-only push — content not shown unless opened',
        time: '10:43 AM',
        icon: 'ping',
      },
    ],
  },
  {
    key: 'lukas',
    name: 'Lukas Meyer',
    src: avatarLukas,
    tier: 'inferred',
    earliest: '10:44 AM',
    events: [
      {
        surface: 'Fetched via API',
        detail: 'A fetch is not proof of reading',
        time: '10:44 AM',
        icon: 'api',
      },
    ],
  },
  {
    key: 'isabella',
    name: 'Isabella Cruz',
    src: avatarIsabella,
    tier: 'inferred',
    earliest: '10:44 AM',
    events: [
      {
        surface: 'Appeared in their search results',
        detail: 'Low traceability — viewing a result is hard to confirm',
        time: '10:44 AM',
        icon: 'search',
      },
    ],
  },

  // ── Lateral leak (3 destinations beyond the channel) ─────────────────
  {
    key: 'developers',
    name: '~Developers',
    tier: 'lateral',
    system: true,
    reach: 24,
    earliest: '10:44 AM',
    events: [
      {
        surface: 'Previewed via permalink in another channel',
        detail: 'The post was never posted to ~Developers — its 24 members may have seen it',
        time: '10:44 AM',
        icon: 'permalink',
      },
    ],
  },
  {
    key: 'siem',
    name: 'SIEM webhook connector',
    tier: 'lateral',
    system: true,
    earliest: '10:43 AM',
    events: [
      {
        surface: 'Sent to an outgoing webhook',
        detail: 'Full content delivered to an external system',
        time: '10:43 AM',
        icon: 'webhook',
        offPlatform: true,
      },
    ],
  },
  {
    key: 'gh-integration',
    name: 'GitHub integration',
    tier: 'lateral',
    system: true,
    earliest: '10:43 AM',
    events: [
      {
        surface: 'Delivered to an integration',
        detail: 'Registered a post-create hook on the channel',
        time: '10:43 AM',
        icon: 'integration',
      },
    ],
  },
];

// ── Scale padding ──────────────────────────────────────────────────────
// Pad the curated heroes out to a realistic large-spill size so the roster
// exercises search, per-section "Show all", and big counts.

const AVATAR_POOL = [
  avatarMarco, avatarAiko, avatarEmma, avatarDavid, avatarDarius,
  avatarArjun, avatarSofia, avatarLeila, avatarLukas, avatarIsabella,
];

const FIRST_NAMES = [
  'James', 'Maria', 'Robert', 'Linda', 'Michael', 'Patricia', 'Daniel',
  'Jennifer', 'Karen', 'Paul', 'Nancy', 'Mark', 'Steven', 'Betty', 'Andrew',
  'Sandra', 'Joshua', 'Ashley', 'Kevin', 'Donna', 'Brian', 'Carol', 'George',
  'Ruth', 'Edward', 'Sharon', 'Ronald', 'Michelle', 'Anthony', 'Laura',
];
const LAST_NAMES = [
  'Carter', 'Bennett', 'Hughes', 'Foster', 'Parker', 'Coleman', 'Reed',
  'Murphy', 'Rivera', 'Sanchez', 'Powell', 'Patterson', 'Flores', 'Butler',
  'Simmons', 'Gonzales', 'Bryant', 'Alexander', 'Russell', 'Griffin', 'Diaz',
  'Hayes', 'Myers', 'Ford', 'Hamilton', 'Graham', 'Wallace', 'Cole', 'West',
  'Long',
];

const CONFIRMED_SURFACES: { surface: string; icon: SurfaceIcon }[] = [
  { surface: 'Opened the channel', icon: 'view' },
  { surface: 'Opened the thread', icon: 'view' },
  { surface: 'Read offline', icon: 'view' },
  { surface: 'Delivered to an active session', icon: 'session' },
];
const INFERRED_SURFACES: { surface: string; icon: SurfaceIcon }[] = [
  { surface: 'Marked the channel as read', icon: 'view' },
  { surface: 'Posted in the channel', icon: 'view' },
  { surface: 'Notification ping (no content)', icon: 'ping' },
  { surface: 'Fetched via API', icon: 'api' },
  { surface: 'Appeared in their search results', icon: 'search' },
];
const TIMES = ['10:43 AM', '10:44 AM', '10:45 AM'];

function pad(
  tier: 'confirmed' | 'inferred',
  count: number,
  surfaces: { surface: string; icon: SurfaceIcon }[],
): ExposureItem[] {
  const out: ExposureItem[] = [];
  for (let i = 0; i < count; i++) {
    // (i % L, ⌊i/L⌋) is a unique pair per i → unique names, no random.
    const name = `${FIRST_NAMES[i % FIRST_NAMES.length]} ${
      LAST_NAMES[Math.floor(i / FIRST_NAMES.length) % LAST_NAMES.length]
    }`;
    const surf = surfaces[i % surfaces.length];
    const time = TIMES[i % TIMES.length];
    out.push({
      key: `${tier}-pad-${i}`,
      name,
      src: AVATAR_POOL[i % AVATAR_POOL.length],
      tier,
      earliest: time,
      events: [{ surface: surf.surface, time, icon: surf.icon }],
    });
  }
  return out;
}

const curatedConfirmed = CURATED.filter((r) => r.tier === 'confirmed');
const curatedInferred = CURATED.filter((r) => r.tier === 'inferred');
const curatedLateral = CURATED.filter((r) => r.tier === 'lateral');

// Targets: ~100 people total across a large-channel spill.
export const ROSTER: ExposureItem[] = [
  ...curatedConfirmed,
  ...pad('confirmed', 42 - curatedConfirmed.length, CONFIRMED_SURFACES),
  ...curatedInferred,
  ...pad('inferred', 58 - curatedInferred.length, INFERRED_SURFACES),
  ...curatedLateral,
];

export function tierCount(tier: Tier): number {
  return ROSTER.filter((r) => r.tier === tier).length;
}

export const USER_EXPOSED = ROSTER.filter((r) => !r.system).length; // people
export const LATERAL_COUNT = tierCount('lateral');
