import { buildDefaultChannelsSidebarModel } from '@mattermost/compass-proto';
import avatarAikoTan from '@/assets/avatars/Aiko Tan.png';
import avatarArjunPatel from '@/assets/avatars/Arjun Patel.png';
import avatarDanielleOkoro from '@/assets/avatars/Danielle Okoro.png';
import avatarDariusCole from '@/assets/avatars/Darius Cole.png';
import avatarDavidLiang from '@/assets/avatars/David Liang.png';
import avatarEmmaNovak from '@/assets/avatars/Emma Novak.png';
import avatarEthanBrooks from '@/assets/avatars/Ethan Brooks.png';

/** Shared avatar inputs for docs/prototype default channel trees. */
export const CHANNELS_SIDEBAR_DEMO_AVATARS = {
  avatarAikoTan,
  avatarArjunPatel,
  avatarDanielleOkoro,
  avatarDariusCole,
  avatarDavidLiang,
  avatarEmmaNovak,
  avatarEthanBrooks,
} as const;

/** Default docs/layout sidebar tree (unreads category off). */
export const defaultChannelsSidebarDemoModel = buildDefaultChannelsSidebarModel({
  showUnreadsCategory: false,
  ...CHANNELS_SIDEBAR_DEMO_AVATARS,
});

/** Docs variant with Unreads category on. */
export const unreadsChannelsSidebarDemoModel = buildDefaultChannelsSidebarModel({
  showUnreadsCategory: true,
  ...CHANNELS_SIDEBAR_DEMO_AVATARS,
});
