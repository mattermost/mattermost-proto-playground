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
import type { CallPhase } from '@/types/videoCall';
import { useVideoCall } from './videoCallContext';
import { groupChatName } from './videoCallsData';

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
const DEFAULT_GM_ROW = 'Hilda Martin, Steve M...';

/** A channel elsewhere in the sidebar that always has a call running (discovery). */
const OTHER_CALL_ROW = 'Release Discussion';

/**
 * Whether the open conversation has a call running. A DM only has one once it
 * is ringing (pre-join is not a call yet); a group or channel call is already
 * running before you join.
 */
function conversationHasCall(
  context: 'dm' | 'gm' | 'channel',
  phase: CallPhase,
) {
  if (context === 'dm') {
    return (
      phase === 'calling' ||
      phase === 'incoming' ||
      phase === 'joining' ||
      phase === 'active'
    );
  }
  return phase !== 'idle';
}

function buildSidebarModel(
  context: 'dm' | 'gm' | 'channel',
  count: number,
  phase: CallPhase,
): SidebarModel {
  const openHasCall = conversationHasCall(context, phase);
  // The group DM row is the open group chat, named after its members.
  const gmName = groupChatName(count);
  const activeName =
    context === 'dm' ? MARCO.name : context === 'gm' ? gmName : 'UX Design';
  const groups = CHANNELS_SIDEBAR_MODEL.groups.map((group) => {
    const kept = group.items.filter((i) => i.name !== MARCO.name);
    const items =
      group.key === 'favorites'
        ? kept.flatMap((i) => (i.name === 'Aiko Tan' ? [i, MARCO] : [i]))
        : kept;
    return {
      ...group,
      items: items.map((i) => {
        const row =
          context === 'gm' && i.name === DEFAULT_GM_ROW
            ? { ...i, name: gmName, memberCount: count }
            : i;
        const active = row.name === activeName;
        return {
          ...row,
          active,
          callActive: active ? openHasCall : row.name === OTHER_CALL_ROW,
        };
      }),
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
    () => buildSidebarModel(state.callContext, state.count, state.phase),
    [state.callContext, state.count, state.phase],
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
