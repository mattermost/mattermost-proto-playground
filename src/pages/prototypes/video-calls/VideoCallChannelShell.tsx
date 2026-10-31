import { useMemo, type ReactNode } from 'react';
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
import avatarMarcoRinaldi from '@/assets/avatars/Marco Rinaldi.png';
import { useVideoCall } from './videoCallContext';

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

type SidebarModel = typeof CHANNELS_SIDEBAR_MODEL;
type SidebarItem = SidebarModel['groups'][number]['items'][number];

const MARCO = {
  name: 'Marco Rinaldi',
  leadingVisual: 'direct-message',
  avatarSrc: avatarMarcoRinaldi,
  avatarAlt: 'Marco Rinaldi',
  showAvatarStatus: true,
} as unknown as SidebarItem;

/**
 * The default tree plus Marco Rinaldi (the DM peer) under Favorites, with the
 * row for the open conversation active: the DM, the group DM or the channel.
 * A favourite appears only under Favorites, so Marco is dropped from any other
 * category.
 */
function buildSidebarModel(context: 'dm' | 'gm' | 'channel'): SidebarModel {
  const activeName =
    context === 'dm'
      ? MARCO.name
      : context === 'gm'
        ? 'Hilda Martin, Steve M...'
        : 'UX Design';
  const groups = CHANNELS_SIDEBAR_MODEL.groups.map((group) => {
    const kept = group.items.filter((i) => i.name !== MARCO.name);
    const items =
      group.key === 'favorites'
        ? kept.flatMap((i) => (i.name === 'Aiko Tan' ? [i, MARCO] : [i]))
        : kept;
    return {
      ...group,
      items: items.map((i) => ({ ...i, active: i.name === activeName })),
    };
  });
  return {
    ...CHANNELS_SIDEBAR_MODEL,
    groups,
    // Only the open conversation is active, so top-group rows are not.
    topGroupItems: CHANNELS_SIDEBAR_MODEL.topGroupItems,
  };
}

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
  const { state } = useVideoCall();
  const model = useMemo(
    () => buildSidebarModel(state.callContext),
    [state.callContext],
  );
  return (
    <ChannelShell
      channelsSidebarModel={model}
      channelHeader={header}
      floating={floating}
      overlay={overlay}
      trailing={trailing}
    >
      {children}
    </ChannelShell>
  );
}
