import type { MobileNavigationBarProps } from '@mattermost/compass-proto';
import avatarAikoTan from '@/assets/avatars/Aiko Tan.png';
import avatarArjunPatel from '@/assets/avatars/Arjun Patel.png';
import avatarDanielle from '@/assets/avatars/Danielle Okoro.png';
import avatarDariusCole from '@/assets/avatars/Darius Cole.png';
import avatarDavidLiang from '@/assets/avatars/David Liang.png';
import avatarEmmaNovak from '@/assets/avatars/Emma Novak.png';
import avatarEthanBrooks from '@/assets/avatars/Ethan Brooks.png';
import avatarLeonard from '@/assets/avatars/Leonard Riley.png';
import avatarMarco from '@/assets/avatars/Marco Rinaldi.png';
import avatarSofia from '@/assets/avatars/Sofia Bauer.png';
import avatarStaffTeam from '@/assets/avatars/Staff Team.png';

export const avatars = {
  aikoTan: avatarAikoTan,
  arjunPatel: avatarArjunPatel,
  danielle: avatarDanielle,
  dariusCole: avatarDariusCole,
  davidLiang: avatarDavidLiang,
  emmaNovak: avatarEmmaNovak,
  ethanBrooks: avatarEthanBrooks,
  leonard: avatarLeonard,
  marco: avatarMarco,
  sofia: avatarSofia,
  staffTeam: avatarStaffTeam,
};

const DM_NAMES = new Set([
  'Aiko Tan',
  'Arjun Patel',
  'Danielle Okoro',
  'Darius Cole',
  'David Liang',
  'Emma Novak',
  'Ethan Brooks',
]);

export type ChannelMeta = {
  name: string;
  variant: NonNullable<MobileNavigationBarProps['variant']>;
  memberCount?: number;
};

export function getChannelMeta(name: string): ChannelMeta {
  if (DM_NAMES.has(name)) {
    return {name, variant: 'dm'};
  }
  if (name.includes(',')) {
    return {name, variant: 'gm', memberCount: 2};
  }
  return {name, variant: 'channel', memberCount: 124};
}
