import type { Participant } from '@/types/callParticipant';
import avatarAikoTan from '@/assets/avatars/Aiko Tan.png';
import avatarArjunPatel from '@/assets/avatars/Arjun Patel.png';
import avatarDanielle from '@/assets/avatars/Danielle Okoro.png';
import avatarDariusCole from '@/assets/avatars/Darius Cole.png';
import avatarDavidLiang from '@/assets/avatars/David Liang.png';
import avatarEmmaNovak from '@/assets/avatars/Emma Novak.png';
import avatarEthanBrooks from '@/assets/avatars/Ethan Brooks.png';
import avatarIsabellaCruz from '@/assets/avatars/Isabella Cruz.png';
import avatarLeilaHaddad from '@/assets/avatars/Leila Haddad.png';
import avatarLeonard from '@/assets/avatars/Leonard Riley.png';
import avatarLukasMeyer from '@/assets/avatars/Lukas Meyer.png';

export const PARTICIPANTS: Participant[] = [
  {
    id: 'leonard',
    name: 'Leonard Riley',
    avatarSrc: avatarLeonard,
    host: true,
    talking: true,
    muted: false,
  },
  { id: 'aiko', name: 'Aiko Tan', avatarSrc: avatarAikoTan, muted: true },
  { id: 'arjun', name: 'Arjun Patel', avatarSrc: avatarArjunPatel, muted: true },
  { id: 'danielle', name: 'Danielle Okoro', avatarSrc: avatarDanielle, muted: true },
  { id: 'darius', name: 'Darius Cole', avatarSrc: avatarDariusCole, muted: true },
  { id: 'david', name: 'David Liang', avatarSrc: avatarDavidLiang, muted: true },
  { id: 'emma', name: 'Emma Novak', avatarSrc: avatarEmmaNovak, muted: true },
  { id: 'ethan', name: 'Ethan Brooks', avatarSrc: avatarEthanBrooks, muted: true },
  { id: 'isabella', name: 'Isabella Cruz', avatarSrc: avatarIsabellaCruz, muted: true },
  { id: 'leila', name: 'Leila Haddad', avatarSrc: avatarLeilaHaddad, muted: true },
  { id: 'lucas', name: 'Lucas Meyer', avatarSrc: avatarLukasMeyer, muted: true },
];

/** Full call roster for host widget/popout and guest view (Figma-aligned). */
export const CALL_PARTICIPANTS: Participant[] = [
  ...PARTICIPANTS.slice(0, -2),
  {
    id: 'external-james',
    name: 'James Smith',
    kind: 'external-link',
    external: true,
    muted: true,
  },
  {
    id: 'dialin-5555',
    name: '+1-555-555-5555',
    kind: 'dial-in',
    external: true,
    muted: true,
  },
];
