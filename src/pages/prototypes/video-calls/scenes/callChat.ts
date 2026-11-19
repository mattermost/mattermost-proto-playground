import avatarMarco from '@/assets/avatars/Marco Rinaldi.png';
import avatarSofia from '@/assets/avatars/Sofia Bauer.png';
import type { CallPaneMessage } from '../components/CallThreadPane';

/**
 * In-call chat log, kept at module level (keyed by call start) so it survives
 * the call -> screen-share -> call scene remounts within one call.
 */
let logFor: number | null | undefined;
let log: CallPaneMessage[] = [];
let seenFor: number | null | undefined;

const SEED: CallPaneMessage[] = [
  {
    id: 'seed-1',
    username: 'Marco Rinaldi',
    avatarSrc: avatarMarco,
    timestamp: '9:14 AM',
    text: 'Can everyone see the new onboarding flow?',
  },
  {
    id: 'seed-2',
    username: 'Sofia Bauer',
    avatarSrc: avatarSofia,
    timestamp: '9:15 AM',
    text: 'Yes, looks great. I will drop the Figma link in the channel after.',
  },
];

export function getCallChat(startedAt: number | null): CallPaneMessage[] {
  if (logFor !== startedAt) {
    logFor = startedAt;
    log = SEED;
  }
  return log;
}

export function appendCallChat(
  startedAt: number | null,
  message: CallPaneMessage,
): CallPaneMessage[] {
  log = [...getCallChat(startedAt), message];
  return log;
}

export function hasSeenCallChat(startedAt: number | null): boolean {
  return seenFor === startedAt;
}

export function markCallChatSeen(startedAt: number | null): void {
  seenFor = startedAt;
}
