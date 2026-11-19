import { useVideoCall } from '../videoCallContext';
import {
  CHANNEL_NAME,
  DM_PEER_ID,
  ROSTER,
  groupChatName,
} from '../videoCallsData';

const PEER_NAME = ROSTER.find((p) => p.id === DM_PEER_ID)?.name ?? '';

/** Name of the conversation the call belongs to: the peer, the group or the channel. */
export function useConversationName(): string {
  const { state } = useVideoCall();
  if (state.callContext === 'dm') return PEER_NAME;
  if (state.callContext === 'gm') return groupChatName(state.count);
  return CHANNEL_NAME;
}
