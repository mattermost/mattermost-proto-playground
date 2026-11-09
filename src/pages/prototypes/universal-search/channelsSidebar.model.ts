import { buildDefaultChannelsSidebarModel } from '@mattermost/compass-proto';
import avatarAikoTan from '@/assets/avatars/Aiko Tan.png';
import avatarArjunPatel from '@/assets/avatars/Arjun Patel.png';
import avatarDanielle from '@/assets/avatars/Danielle Okoro.png';
import avatarDariusCole from '@/assets/avatars/Darius Cole.png';
import avatarDavidLiang from '@/assets/avatars/David Liang.png';
import avatarEmmaNovak from '@/assets/avatars/Emma Novak.png';
import avatarEthanBrooks from '@/assets/avatars/Ethan Brooks.png';

export const universalSearchChannelsSidebarModel =
  buildDefaultChannelsSidebarModel({
    showUnreadsCategory: true,
    avatarAikoTan,
    avatarArjunPatel,
    avatarDanielleOkoro: avatarDanielle,
    avatarDariusCole,
    avatarDavidLiang,
    avatarEmmaNovak,
    avatarEthanBrooks,
  });
