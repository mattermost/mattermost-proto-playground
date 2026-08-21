import type { PaletteItem } from './types';

export const ACTION_STEPS: PaletteItem[] = [
  {
    id: 'post-message',
    label: 'Post message',
    kind: 'action',
    stepType: 'post_message',
    verb: 'create',
    helpText: 'Post a message to a channel.',
  },
  {
    id: 'direct-message',
    label: 'Direct message user',
    kind: 'action',
    stepType: 'direct_message',
    verb: 'create',
    helpText: 'Send a direct message to a user.',
  },
  {
    id: 'add-reaction',
    label: 'Add reaction',
    kind: 'action',
    stepType: 'add_reaction',
    verb: 'create',
    helpText: 'Add an emoji reaction to a post.',
  },
  {
    id: 'get-channel-members',
    label: 'Get channel members',
    kind: 'action',
    stepType: 'get_channel_members',
    verb: 'get',
    helpText: 'Fetch members of the triggering channel.',
  },
  {
    id: 'open-dialog',
    label: 'Open dialog',
    kind: 'action',
    stepType: 'open_dialog',
    verb: 'create',
    helpText: 'Open an interactive dialog for the user.',
  },
  {
    id: 'http-request',
    label: 'HTTP request',
    kind: 'action',
    stepType: 'http_request',
    verb: 'create',
    helpText: 'Call an external HTTP endpoint.',
  },
  {
    id: 'create-channel',
    label: 'Create channel',
    kind: 'action',
    stepType: 'create_channel',
    verb: 'create',
    helpText: 'Create a new channel.',
  },
  {
    id: 'invite-user',
    label: 'Invite user',
    kind: 'action',
    stepType: 'invite_user',
    verb: 'update',
    helpText: 'Invite a user to a team or channel.',
  },
];

export const FLOW_STEPS: PaletteItem[] = [
  {
    id: 'condition',
    label: 'Condition',
    kind: 'flow',
    stepType: 'condition',
    helpText: 'Branch on true / false.',
  },
  {
    id: 'loop',
    label: 'Loop (for each)',
    kind: 'flow',
    stepType: 'loop',
    helpText: 'Iterate over a list.',
  },
  {
    id: 'stop',
    label: 'Stop',
    kind: 'flow',
    stepType: 'stop',
    helpText: 'End the workflow.',
  },
  {
    id: 'decision',
    label: 'Decision',
    kind: 'flow',
    stepType: 'decision',
    helpText: 'Choose among multiple paths.',
  },
  {
    id: 'delay',
    label: 'Delay',
    kind: 'flow',
    stepType: 'delay',
    helpText: 'Wait before continuing.',
  },
];

export const ALL_STEPS: PaletteItem[] = [...ACTION_STEPS, ...FLOW_STEPS];
