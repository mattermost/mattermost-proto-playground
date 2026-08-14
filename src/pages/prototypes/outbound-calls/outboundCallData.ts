import type { Contact, OutboundPostItem, Recent } from '@/types/outboundCall';
import avatarAikoTan from '@/assets/avatars/Aiko Tan.png';
import avatarArjunPatel from '@/assets/avatars/Arjun Patel.png';
import avatarDanielle from '@/assets/avatars/Danielle Okoro.png';
import avatarDariusCole from '@/assets/avatars/Darius Cole.png';
import avatarDavidLiang from '@/assets/avatars/David Liang.png';
import avatarEmmaNovak from '@/assets/avatars/Emma Novak.png';
import avatarEthanBrooks from '@/assets/avatars/Ethan Brooks.png';
import avatarLeonard from '@/assets/avatars/Leonard Riley.png';
import avatarStaffTeam from '@/assets/avatars/Staff Team.png';

export { avatarAikoTan, avatarArjunPatel, avatarDanielle, avatarDariusCole, avatarDavidLiang };
export { avatarEmmaNovak, avatarEthanBrooks, avatarLeonard, avatarStaffTeam };

export const CONFERENCE_BRIDGE = {
  number: '+1 669 444 9171 (US)',
  rawNumber: '+16694449171',
  pin: '938 394',
  rawPin: '938394',
} as const;

export const CONTACTS: Contact[] = [
  {
    id: 'aiko',
    name: 'Aiko Tan',
    handle: '@aiko',
    email: 'aiko.tan@mattermost.com',
    title: 'Threat Analyst',
    avatar: avatarAikoTan,
    online: true,
    localTime: { time: '11:42 PM', timezone: 'JST', hourDifference: '13 hrs ahead' },
    phones: [
      { number: '+1 (415) 555-0142', label: 'NIPR', kind: 'standard', sipTrunk: 'DSN' },
      { number: '1-888-555-0188,,*2274#', label: 'NIPR Conf Bridge', kind: 'conference' },
    ],
  },
  {
    id: 'leonard',
    name: 'Leonard Riley',
    handle: '@leonard',
    email: 'leonard.riley@dia.mil',
    title: 'Targeting Analyst',
    role: 'System Admin',
    avatar: avatarLeonard,
    online: true,
    localTime: { time: '10:42 AM', timezone: 'EST' },
    phones: [
      { number: '555-0174', label: 'NIPR', kind: 'standard', sipTrunk: 'DSN' },
      { number: '1-888-333-3343,,*3456#', label: 'NIPR Conf Bridge', kind: 'conference' },
      { number: 'Ext. 44260', label: 'SIPR Extension', kind: 'secure', sipTrunk: 'DSN Gateway' },
    ],
  },
  {
    id: 'danielle',
    name: 'Danielle Okoro',
    handle: '@danielle',
    email: 'danielle.okoro@mattermost.com',
    title: 'Solutions Architect',
    avatar: avatarDanielle,
    online: false,
    localTime: { time: '3:42 PM', timezone: 'WAT', hourDifference: '5 hrs ahead' },
    phones: [
      { number: '+234 1 555 0116', label: 'NIPR', kind: 'standard', sipTrunk: 'DSN' },
      { number: 'Ext. 51820', label: 'SIPR Extension', kind: 'secure', sipTrunk: 'DSN Gateway' },
    ],
  },
  {
    id: 'arjun',
    name: 'Arjun Patel',
    handle: '@arjun',
    email: 'arjun.patel@mattermost.com',
    title: 'Customer Success',
    avatar: avatarArjunPatel,
    online: true,
    localTime: { time: '2:42 PM', timezone: 'GMT', hourDifference: '4 hrs ahead' },
    phones: [{ number: '+44 20 7946 0814', label: 'NIPR', kind: 'standard', sipTrunk: 'DSN' }],
  },
  {
    id: 'ethan',
    name: 'Ethan Brooks',
    handle: '@ethan',
    email: 'ethan.brooks@mattermost.com',
    title: 'IT Operations',
    avatar: avatarEthanBrooks,
    online: false,
    localTime: { time: '9:42 AM', timezone: 'CST', hourDifference: '1 hr behind' },
    phones: [{ number: '+1 (512) 555-0163', label: 'NIPR', kind: 'standard', sipTrunk: 'DSN' }],
  },
];

export const CONTACT_MAP: Record<string, Contact> = Object.fromEntries(
  CONTACTS.map((c) => [c.id, c]),
);

export const INITIAL_RECENTS: Recent[] = [
  { contactId: 'leonard', phoneIndex: 0, direction: 'outbound', timestamp: 'Today, 9:42 AM', durationSec: 252 },
  { contactId: 'danielle', phoneIndex: 0, direction: 'inbound-missed', timestamp: 'Yesterday, 4:18 PM' },
  { contactId: 'arjun', phoneIndex: 0, direction: 'outbound', timestamp: 'Yesterday, 11:07 AM', durationSec: 1140 },
  { contactId: 'aiko', phoneIndex: 1, direction: 'outbound', timestamp: 'Apr 17', durationSec: 84 },
];

export const CHANNEL_POSTS: OutboundPostItem[] = [
  {
    id: 'p1',
    contactId: 'aiko',
    timestamp: '9:14 AM',
    body: 'Morning. Briefing packet for the 11:00 handover is posted — give it a once-over before the sync.',
  },
  {
    id: 'p2',
    contactId: 'leonard',
    timestamp: '9:21 AM',
    body: "Need someone to run a line-check with the forward element before we step off. Any takers?",
  },
  {
    id: 'p3',
    contactId: 'danielle',
    timestamp: '9:38 AM',
    body: "I've got it. Leonard, what's the best number to reach you on?",
  },
];
