import type { ReactNode } from 'react';
import {
  ChannelShell,
  buildDefaultChannelsSidebarModel,
} from '@mattermost/compass-proto';
import avatarAikoTan from '@/assets/avatars/Aiko Tan.png';
import avatarArjunPatel from '@/assets/avatars/Arjun Patel.png';
import avatarDanielle from '@/assets/avatars/Danielle Okoro.png';
import avatarDariusCole from '@/assets/avatars/Darius Cole.png';
import avatarDavidLiang from '@/assets/avatars/David Liang.png';
import avatarEmmaNovak from '@/assets/avatars/Emma Novak.png';
import avatarEthanBrooks from '@/assets/avatars/Ethan Brooks.png';

/** Default sidebar tree for every scene that shows the channel chrome. */
const CHANNELS_SIDEBAR_MODEL = buildDefaultChannelsSidebarModel({
  showUnreadsCategory: false,
  avatarAikoTan,
  avatarArjunPatel,
  avatarDanielleOkoro: avatarDanielle,
  avatarDariusCole,
  avatarDavidLiang,
  avatarEmmaNovak,
  avatarEthanBrooks,
});

export interface VideoCallChannelShellProps {
  /** Usually a `ChannelHeader`. */
  header: ReactNode;
  /** Messages region + composer. */
  children: ReactNode;
  /** In-channel floating UI (the minimized call widget). */
  floating?: ReactNode;
  /** Full-shell overlay (e.g. an incoming-call card). */
  overlay?: ReactNode;
  /** Right column (call chat/thread pane). */
  trailing?: ReactNode;
}

/**
 * Shared channel chrome for the dm, channel, ringing and minimized scenes so they
 * render the same sidebar/header frame. Prototype-only composition (not promoted).
 */
export default function VideoCallChannelShell({
  header,
  children,
  floating,
  overlay,
  trailing,
}: VideoCallChannelShellProps) {
  return (
    <ChannelShell
      channelsSidebarModel={CHANNELS_SIDEBAR_MODEL}
      channelHeader={header}
      floating={floating}
      overlay={overlay}
      trailing={trailing}
    >
      {children}
    </ChannelShell>
  );
}
