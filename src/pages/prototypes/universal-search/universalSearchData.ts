import avatarAiko from '@/assets/avatars/Aiko Tan.png';
import avatarArjun from '@/assets/avatars/Arjun Patel.png';
import avatarDanielle from '@/assets/avatars/Danielle Okoro.png';
import avatarDarius from '@/assets/avatars/Darius Cole.png';
import avatarEmma from '@/assets/avatars/Emma Novak.png';
import avatarEthan from '@/assets/avatars/Ethan Brooks.png';
import avatarIsabella from '@/assets/avatars/Isabella Cruz.png';
import avatarLeonard from '@/assets/avatars/Leonard Riley.png';
import avatarMarco from '@/assets/avatars/Marco Rinaldi.png';
import avatarSofia from '@/assets/avatars/Sofia Bauer.png';

export type ChannelResult = {
  id: string;
  name: string;
  leadingVisual: 'public' | 'private';
  unread?: boolean;
  mentionCount?: number;
};

export type PersonResult = {
  id: string;
  name: string;
  avatarSrc: string;
  status?: 'online' | 'away' | 'dnd' | 'offline';
};

export type RecentSearch = {
  id: string;
  label: string;
};

export type FileResult = {
  id: string;
  name: string;
  secondaryLabel: string;
  kind: 'pdf' | 'word' | 'generic';
};

export type MessageHit = {
  id: string;
  username: string;
  avatarSrc: string;
  timestamp: string;
  channelName: string;
  body: string;
};

export const UNREAD_CHANNELS: ChannelResult[] = [
  {
    id: 'ux-design',
    name: 'ux-design',
    leadingVisual: 'public',
    unread: true,
    mentionCount: 3,
  },
  {
    id: 'releases',
    name: 'releases',
    leadingVisual: 'public',
    unread: true,
  },
  {
    id: 'security',
    name: 'security',
    leadingVisual: 'private',
    unread: true,
    mentionCount: 1,
  },
];

export const RECENT_CHANNELS: ChannelResult[] = [
  {
    id: 'town-square',
    name: 'town-square',
    leadingVisual: 'public',
  },
  {
    id: 'off-topic',
    name: 'off-topic',
    leadingVisual: 'public',
  },
  {
    id: 'design-crit',
    name: 'design-crit',
    leadingVisual: 'private',
  },
  {
    id: 'platform',
    name: 'platform',
    leadingVisual: 'public',
  },
  {
    id: 'customers',
    name: 'customers',
    leadingVisual: 'private',
  },
];

export const CHANNEL_QUERY = 'des';

export const CHANNEL_TYPING_RESULTS: ChannelResult[] = [
  {
    id: 'ux-design',
    name: 'ux-design',
    leadingVisual: 'public',
  },
  {
    id: 'design-crit',
    name: 'design-crit',
    leadingVisual: 'private',
  },
  {
    id: 'design-system',
    name: 'design-system',
    leadingVisual: 'public',
  },
];

export const RECENT_MESSAGE_SEARCHES: RecentSearch[] = [
  { id: 'm1', label: 'launch checklist' },
  { id: 'm2', label: 'in:ux-design accessibility' },
  { id: 'm3', label: 'from:sofia Figma' },
  { id: 'm4', label: 'onboarding FAQ' },
];

export const MESSAGE_MODIFIERS = [
  'From:',
  'In:',
  'On:',
  'Before:',
  'After:',
  '-',
  '""',
] as const;

export const MESSAGE_FILTER_OPTIONS = [
  { id: 'f1', label: 'Sofia Bauer', secondaryLabel: '@sofia' },
  { id: 'f2', label: 'Marco Rinaldi', secondaryLabel: '@marco' },
  { id: 'f3', label: 'Leonard Riley', secondaryLabel: '@leonard' },
  { id: 'f4', label: 'Emma Novak', secondaryLabel: '@emma' },
];

export const ACTIVE_CHANNEL_FILTER = {
  label: 'In:',
  value: 'ux-design',
};

export const MESSAGE_RESULTS_QUERY = 'launch checklist';

export const MESSAGE_HITS: MessageHit[] = [
  {
    id: 'hit1',
    username: 'Sofia Bauer',
    avatarSrc: avatarSofia,
    timestamp: '9:14 AM',
    channelName: 'ux-design',
    body: 'Updated the launch checklist with the new onboarding screens — review before Friday.',
  },
  {
    id: 'hit2',
    username: 'Marco Rinaldi',
    avatarSrc: avatarMarco,
    timestamp: 'Yesterday',
    channelName: 'releases',
    body: 'Can we keep the launch checklist in Releases so support can find it?',
  },
  {
    id: 'hit3',
    username: 'Leonard Riley',
    avatarSrc: avatarLeonard,
    timestamp: 'Mon',
    channelName: 'ux-design',
    body: 'Pinned the launch checklist to this channel for the next two sprints.',
  },
];

export const RECENT_FILE_SEARCHES: RecentSearch[] = [
  { id: 'fs1', label: 'brand guidelines' },
  { id: 'fs2', label: 'ext:pdf roadmap' },
  { id: 'fs3', label: 'Q3 planning' },
];

export const RECENT_FILES: FileResult[] = [
  {
    id: 'file1',
    name: 'Compass_Brand_Guidelines.pdf',
    secondaryLabel: 'ux-design · Yesterday',
    kind: 'pdf',
  },
  {
    id: 'file2',
    name: 'Q3_Roadmap.docx',
    secondaryLabel: 'releases · Mon',
    kind: 'word',
  },
  {
    id: 'file3',
    name: 'Onboarding_flows.fig',
    secondaryLabel: 'design-crit · Last week',
    kind: 'generic',
  },
  {
    id: 'file4',
    name: 'Support_macros.pdf',
    secondaryLabel: 'customers · Last week',
    kind: 'pdf',
  },
];

export const FILE_MODIFIERS = [
  'From:',
  'In:',
  'Ext:',
  'After:',
  'Before:',
] as const;

export const PEOPLE_MOST_CHATTED: PersonResult[] = [
  {
    id: 'sofia',
    name: 'Sofia Bauer',
    avatarSrc: avatarSofia,
    status: 'online',
  },
  {
    id: 'marco',
    name: 'Marco Rinaldi',
    avatarSrc: avatarMarco,
    status: 'away',
  },
  {
    id: 'leonard',
    name: 'Leonard Riley',
    avatarSrc: avatarLeonard,
    status: 'online',
  },
];

export const PEOPLE_RECENT: PersonResult[] = [
  {
    id: 'emma',
    name: 'Emma Novak',
    avatarSrc: avatarEmma,
    status: 'dnd',
  },
  {
    id: 'arjun',
    name: 'Arjun Patel',
    avatarSrc: avatarArjun,
    status: 'offline',
  },
  {
    id: 'aiko',
    name: 'Aiko Tan',
    avatarSrc: avatarAiko,
    status: 'online',
  },
  {
    id: 'danielle',
    name: 'Danielle Okoro',
    avatarSrc: avatarDanielle,
    status: 'away',
  },
  {
    id: 'darius',
    name: 'Darius Cole',
    avatarSrc: avatarDarius,
    status: 'online',
  },
];

export const PEOPLE_QUERY = 'so';

export const PEOPLE_TYPING_RESULTS: PersonResult[] = [
  {
    id: 'sofia',
    name: 'Sofia Bauer',
    avatarSrc: avatarSofia,
    status: 'online',
  },
  {
    id: 'ethan',
    name: 'Ethan Brooks',
    avatarSrc: avatarEthan,
    status: 'offline',
  },
  {
    id: 'isabella',
    name: 'Isabella Cruz',
    avatarSrc: avatarIsabella,
    status: 'online',
  },
];

export const ACTIVE_CHANNEL_NAME = 'UX Design';

export const ALL_QUERY = 'ux';

function matchesQuery(query: string, values: string[]) {
  const needle = query.trim().toLowerCase();
  if (!needle) return false;
  return values.some((value) => value.toLowerCase().includes(needle));
}

function uniqueById<T extends { id: string }>(items: T[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

export function allSearchMatches(query: string) {
  return {
    channels: uniqueById([
      ...UNREAD_CHANNELS,
      ...RECENT_CHANNELS,
      ...CHANNEL_TYPING_RESULTS,
    ]).filter((channel) => matchesQuery(query, [channel.name])),
    messages: MESSAGE_HITS.filter((hit) =>
      matchesQuery(query, [hit.body, hit.username, hit.channelName]),
    ),
    files: RECENT_FILES.filter((file) =>
      matchesQuery(query, [file.name, file.secondaryLabel]),
    ),
    people: uniqueById([
      ...PEOPLE_MOST_CHATTED,
      ...PEOPLE_RECENT,
      ...PEOPLE_TYPING_RESULTS,
    ]).filter((person) => matchesQuery(query, [person.name])),
  };
}
