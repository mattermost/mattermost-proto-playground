// [AI DRAFT] End-user fixtures: channels, DMs and GMs seen by the signed-in
// contractor (Darius Cole), and the verdicts each one gets under ACTIVE_POLICIES.
import type { ReactNode } from 'react';
import {
  ISABELLA,
  DARIUS,
  DAVID,
  EMMA,
  ETHAN,
  VIEWER,
  type Person,
} from './dmgmData';
import { ACTIVE_POLICIES, evaluate, type SessionContext } from './policyModel';

export type ConversationType = 'channel' | 'dm' | 'gm' | 'self';

export interface ConversationMessage {
  author: Person;
  time: string;
  text: string;
  /** Rich body (used for ephemeral replies); replaces `text` when set. */
  body?: ReactNode;
}

export interface Conversation {
  name: string;
  type: ConversationType;
  /** Other members (excluding the viewer). Empty for channels and the self-DM. */
  members: Person[];
  description?: string;
  memberCount?: number;
  messages: ConversationMessage[];
  status?: 'read' | 'unread' | 'mention';
}

export const TEAM_NAME = 'Program Office';

export const CHANNELS: Conversation[] = [
  {
    name: 'Town Square',
    type: 'channel',
    members: [],
    description: 'Announcements for everyone on the Program Office team.',
    memberCount: 212,
    messages: [
      {
        author: ISABELLA,
        time: '08:05',
        text: 'Reminder: the Ashgrove design review moves to 1400 today, Building 12, Conference Room B.',
      },
      {
        author: EMMA,
        time: '08:31',
        text: 'Corvane requirements baseline v3 is posted to the program share. Comments due Friday.',
      },
    ],
  },
  {
    name: 'Ashgrove Integration',
    type: 'channel',
    members: [],
    description: 'Ashgrove hardware and software integration.',
    memberCount: 38,
    status: 'unread',
    messages: [
      {
        author: DAVID,
        time: '09:12',
        text: 'Telemetry from sortie 14 is on the share. Two dropouts on the secondary bus around T+212.',
      },
      {
        author: ISABELLA,
        time: '09:20',
        text: 'Thanks David. Darius, can you check whether the bus analyzer caught both dropouts?',
      },
      {
        author: DARIUS,
        time: '09:24',
        text: 'Looking at it now. I will post the trace before the stand-up.',
      },
    ],
  },
  {
    name: 'Flight Test Planning',
    type: 'channel',
    members: [],
    description: 'Test cards, range slots and chase aircraft.',
    memberCount: 54,
    messages: [
      {
        author: DAVID,
        time: '10:02',
        text: 'Sortie 15 test card draft is up. Range slot is Thursday 0800–1100.',
      },
    ],
  },
  {
    name: 'Off-Topic',
    type: 'channel',
    members: [],
    description: 'Anything that is not work.',
    memberCount: 198,
    messages: [
      {
        author: ETHAN,
        time: '11:40',
        text: 'Food truck is back by the north gate today.',
      },
    ],
  },
];

export const DIRECT: Conversation[] = [
  {
    name: ISABELLA.name,
    type: 'dm',
    members: [ISABELLA],
    status: 'unread',
    messages: [
      {
        author: ISABELLA,
        time: '08:47',
        text: 'Darius, can you send me the updated interface control document before tomorrow’s technical interchange meeting?',
      },
      {
        author: DARIUS,
        time: '08:52',
        text: 'Will do. I will send it by 1600.',
      },
    ],
  },
  {
    name: `${DAVID.name}, ${EMMA.name}`,
    type: 'gm',
    members: [DAVID, EMMA],
    messages: [
      {
        author: EMMA,
        time: 'Yesterday',
        text: 'Joint range schedule draft is attached. Corvane needs one Thursday slot back.',
      },
      {
        author: DAVID,
        time: 'Yesterday',
        text: 'Ashgrove can give up the Thursday afternoon slot.',
      },
    ],
  },
  {
    name: EMMA.name,
    type: 'dm',
    members: [EMMA],
    messages: [
      {
        author: EMMA,
        time: 'Yesterday',
        text: 'Do you still have the cable harness drawings from the joint test last month?',
      },
      {
        author: DARIUS,
        time: 'Yesterday',
        text: 'I think so. Let me check the archive.',
      },
    ],
  },
  {
    name: `${ISABELLA.name}, ${DAVID.name}`,
    type: 'gm',
    members: [ISABELLA, DAVID],
    messages: [
      {
        author: ISABELLA,
        time: '10:15',
        text: 'Let’s go over the sortie 15 test card after lunch.',
      },
    ],
  },
  {
    name: DAVID.name,
    type: 'dm',
    members: [DAVID],
    messages: [
      {
        author: DAVID,
        time: '09:31',
        text: 'Ground station logs are uploaded. Let me know if the timestamps look off.',
      },
    ],
  },
  {
    name: `${VIEWER.name} (you)`,
    type: 'self',
    members: [],
    messages: [
      {
        author: VIEWER,
        time: '07:58',
        text: 'To do: re-run the bus analyzer on the sortie 14 data.',
      },
    ],
  },
];

export const ALL_CONVERSATIONS = [...CHANNELS, ...DIRECT];

export function conversationByName(name: string): Conversation {
  const found = ALL_CONVERSATIONS.find((c) => c.name === name);
  if (!found) {
    throw new Error(`Unknown conversation: ${name}`);
  }
  return found;
}

export function isDirect(c: Conversation): boolean {
  return c.type !== 'channel';
}

export interface ConversationAccess {
  canView: boolean;
  canPost: boolean;
}

/** Channels are outside these policies; DMs, GMs and the self-DM are evaluated. */
export function accessFor(
  c: Conversation,
  ctx: SessionContext,
): ConversationAccess {
  if (!isDirect(c)) {
    return { canView: true, canPost: true };
  }
  const view = evaluate(ACTIVE_POLICIES, 'view', VIEWER, ctx, c.members);
  const post = evaluate(ACTIVE_POLICIES, 'post', VIEWER, ctx, c.members);
  return { canView: view.allowed, canPost: post.allowed };
}

export function canStartWith(people: Person[], ctx: SessionContext): boolean {
  return evaluate(ACTIVE_POLICIES, 'start', VIEWER, ctx, people).allowed;
}
