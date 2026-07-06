// Fixtures for the "Delivered to" prototype (post-feedback model).
// No confidence tiers: every delivery mechanism is treated with equal
// confidence once the message reached the device/inbox. Two groups only —
// people (the flat recipient list, incl. permalink-reached users folded in)
// and integrations/webhooks (external destinations / leaks).

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

export type DeliveryIcon =
  | 'view'
  | 'session'
  | 'push'
  | 'email'
  | 'permalink'
  | 'webhook'
  | 'integration';

export type DeliveredKind = 'user' | 'integration';

export interface DeliveredItem {
  key: string;
  name: string;
  src?: string; // photo for people; omitted for integrations
  kind: DeliveredKind;
  /** How the message reached them — informational, not a confidence signal. */
  method: string;
  icon: DeliveryIcon;
  time: string;
}

export const REPORT = {
  reporter: 'Leonard Riley',
  author: 'Gordon Walker',
  channel: 'UX Design',
  team: 'Staff',
  postedAt: '10:43 AM on April 24 (Monday)',
  quarantinedAt: '10:45 AM',
  removedAt: 'April 24, 2026',
  durationVisible: '2 mins, 12 sec',
  reason: 'Classification mismatch',
  comment:
    'It looks like this was posted in the wrong channel and may contain sensitive personal information.',
  asOf: '10:45 AM',
};

// ── Generation ──────────────────────────────────────────────────────────
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

// Equal-confidence delivery methods (incl. permalink-reached users, folded in).
const METHODS: { method: string; icon: DeliveryIcon }[] = [
  { method: 'Delivered to the channel', icon: 'view' },
  { method: 'Opened in a thread', icon: 'view' },
  { method: 'Delivered to an active session', icon: 'session' },
  { method: 'Sent as a push notification', icon: 'push' },
  { method: 'Sent by email', icon: 'email' },
  { method: 'Delivered while offline', icon: 'view' },
  { method: 'Reached via permalink in ~Developers', icon: 'permalink' },
];
const TIMES = ['10:43 AM', '10:44 AM', '10:45 AM'];

function buildUsers(count: number): DeliveredItem[] {
  const out: DeliveredItem[] = [];
  for (let i = 0; i < count; i++) {
    const name = `${FIRST_NAMES[i % FIRST_NAMES.length]} ${
      LAST_NAMES[Math.floor(i / FIRST_NAMES.length) % LAST_NAMES.length]
    }`;
    const m = METHODS[i % METHODS.length];
    out.push({
      key: `user-${i}`,
      name,
      src: AVATAR_POOL[i % AVATAR_POOL.length],
      kind: 'user',
      method: m.method,
      icon: m.icon,
      time: TIMES[i % TIMES.length],
    });
  }
  return out;
}

const INTEGRATIONS: DeliveredItem[] = [
  {
    key: 'siem',
    name: 'SIEM webhook connector',
    kind: 'integration',
    method: 'Sent to an outgoing webhook',
    icon: 'webhook',
    time: '10:43 AM',
  },
  {
    key: 'github',
    name: 'GitHub integration',
    kind: 'integration',
    method: 'Delivered to a post-create hook',
    icon: 'integration',
    time: '10:43 AM',
  },
  {
    key: 'zapier',
    name: 'Zapier workflow',
    kind: 'integration',
    method: 'Delivered to a post-create hook',
    icon: 'integration',
    time: '10:43 AM',
  },
];

export const ROSTER: DeliveredItem[] = [...buildUsers(100), ...INTEGRATIONS];

export const USER_COUNT = ROSTER.filter((r) => r.kind === 'user').length;
export const INTEGRATION_COUNT = ROSTER.filter(
  (r) => r.kind === 'integration',
).length;

export const USER_FACES = ROSTER.filter((r) => r.kind === 'user').map((r) => ({
  key: r.key,
  src: r.src,
  name: r.name,
}));

// Integration/leak surfaces, for the icon tiles shown next to the avatar group.
export const INTEGRATION_ITEMS = ROSTER.filter(
  (r) => r.kind === 'integration',
).map((r) => ({ key: r.key, name: r.name, icon: r.icon }));
