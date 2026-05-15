import { buildDefaultChannelsSidebarModel } from '@/components/ui/ChannelsSidebar/channelsSidebarModel';
import avatarAikoTan from '@/assets/avatars/Aiko Tan.png';
import avatarArjunPatel from '@/assets/avatars/Arjun Patel.png';
import avatarDanielle from '@/assets/avatars/Danielle Okoro.png';
import avatarDariusCole from '@/assets/avatars/Darius Cole.png';
import avatarDavidLiang from '@/assets/avatars/David Liang.png';
import avatarEmmaNovak from '@/assets/avatars/Emma Novak.png';
import avatarEthanBrooks from '@/assets/avatars/Ethan Brooks.png';

/** Sidebar roster for the External Call Participants prototype (same as default tree; customize here per story). */
export const externalCallParticipantsChannelsSidebarModel =
  buildDefaultChannelsSidebarModel({
    showUnreadsCategory: false,
    avatarAikoTan,
    avatarArjunPatel,
    avatarDanielOkoro: avatarDanielle,
    avatarDariusCole,
    avatarDavidLiang,
    avatarEmmaNovak,
    avatarEthanBrooks,
  });
