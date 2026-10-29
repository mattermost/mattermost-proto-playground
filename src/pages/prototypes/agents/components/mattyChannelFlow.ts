import type { ChannelLinkCardData } from '../agentsData';

export type ChannelFlowStep = 'name' | 'type' | 'purpose' | 'category' | 'board';

export type ChannelDraft = {
  name: string;
  type: 'public' | 'private';
  purpose: string;
  category: string | null;
  board: boolean;
};

export type ChannelFlowState = {
  step: ChannelFlowStep;
  draft: Partial<ChannelDraft>;
};

export type ChannelFlowResult =
  | { kind: 'ask'; flow: ChannelFlowState; text: string; quickReplies?: string[] }
  | { kind: 'create'; draft: ChannelDraft; text: string };

export const CHANNEL_FLOW_TRIGGER = /create (a )?new channel/i;

export const CHANNEL_FLOW_START: ChannelFlowResult = {
  kind: 'ask',
  flow: { step: 'name', draft: {} },
  text: 'Happy to set that up. What should the channel be called?',
};

const DRAFT_PURPOSE = 'Draft one for me';

function normalizeName(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/^#/, '')
    .replace(/[^a-z0-9\s_-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

function draftPurpose(name: string): string {
  return `A place for the team to share updates and decisions about ${name.replace(/[-_]/g, ' ')}.`;
}

export function advanceChannelFlow(flow: ChannelFlowState, answer: string): ChannelFlowResult {
  const text = answer.trim();

  switch (flow.step) {
    case 'name': {
      const name = normalizeName(text);
      if (!name) {
        return { kind: 'ask', flow, text: 'Channel names can use letters, numbers, and hyphens. What should I call it?' };
      }
      return {
        kind: 'ask',
        flow: { step: 'type', draft: { ...flow.draft, name } },
        text: `${name} it is. Should it be public or private?`,
        quickReplies: ['Public — anyone can join', 'Private — only invited members'],
      };
    }
    case 'type': {
      const type = /private/i.test(text) ? 'private' : 'public';
      return {
        kind: 'ask',
        flow: { step: 'purpose', draft: { ...flow.draft, type } },
        text: 'What’s the purpose? It shows up when people browse channels.',
        quickReplies: [DRAFT_PURPOSE],
      };
    }
    case 'purpose': {
      const purpose = text === DRAFT_PURPOSE ? draftPurpose(flow.draft.name ?? '') : text;
      return {
        kind: 'ask',
        flow: { step: 'category', draft: { ...flow.draft, purpose } },
        text: 'Optional: want it to land in a default sidebar category when people join?',
        quickReplies: ['Projects', 'Customer Success', 'Skip'],
      };
    }
    case 'category': {
      const category = /^(skip|none|no)\b/i.test(text) ? null : text;
      return {
        kind: 'ask',
        flow: { step: 'board', draft: { ...flow.draft, category } },
        text: 'Last one: should I create a board for this channel too?',
        quickReplies: ['Yes, create a board', 'No thanks'],
      };
    }
    case 'board': {
      const draft = {
        ...flow.draft,
        board: /^(y|yes|sure|ok)/i.test(text),
      } as ChannelDraft;
      return { kind: 'create', draft, text: `Got everything I need. Creating ${draft.name} now.` };
    }
  }
}

export function buildChannelToolSteps(draft: ChannelDraft): string[] {
  return [
    `Checking ${draft.name} is available`,
    `Creating ${draft.type} channel`,
    'Setting the channel purpose',
    ...(draft.category ? [`Adding to ${draft.category} category`] : []),
    ...(draft.board ? ['Creating a channel board'] : []),
  ];
}

export function buildChannelCard(draft: ChannelDraft): ChannelLinkCardData {
  return {
    channelName: draft.name,
    channelDescription: draft.purpose,
    channelType: draft.type,
  };
}
