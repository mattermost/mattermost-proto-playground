import type { PaletteItem } from './types';

/** Primary triggers shown in the engineer wireframe. */
export const PRIMARY_TRIGGERS: PaletteItem[] = [
  { id: 'message-posted', label: 'Message posted', kind: 'trigger', stepType: 'message_posted' },
  { id: 'message-edited', label: 'Message edited', kind: 'trigger', stepType: 'message_edited' },
  { id: 'message-deleted', label: 'Message deleted', kind: 'trigger', stepType: 'message_deleted' },
  { id: 'channel-created', label: 'Channel created', kind: 'trigger', stepType: 'channel_created' },
  { id: 'user-joined-channel', label: 'User joined channel', kind: 'trigger', stepType: 'user_joined_channel' },
  { id: 'user-left-channel', label: 'User left channel', kind: 'trigger', stepType: 'user_left_channel' },
  { id: 'user-joined-team', label: 'User joined team', kind: 'trigger', stepType: 'user_joined_team' },
  { id: 'user-left-team', label: 'User left team', kind: 'trigger', stepType: 'user_left_team' },
  { id: 'reaction-added', label: 'Reaction added', kind: 'trigger', stepType: 'reaction_added' },
  { id: 'reaction-removed', label: 'Reaction removed', kind: 'trigger', stepType: 'reaction_removed' },
  { id: 'user-created', label: 'User created', kind: 'trigger', stepType: 'user_created' },
  { id: 'incoming-webhook', label: 'Incoming webhook', kind: 'trigger', stepType: 'incoming_webhook' },
  { id: 'schedule', label: 'Schedule', kind: 'trigger', stepType: 'schedule' },
  { id: 'slash-command', label: 'Slash command', kind: 'trigger', stepType: 'slash_command' },
  { id: 'manual', label: 'Manual (run now)', kind: 'trigger', stepType: 'manual' },
];

/** Extra stubs so the Triggers badge reaches 26. */
const STUB_TRIGGERS: PaletteItem[] = [
  { id: 'dialog-submitted', label: 'Dialog submitted', kind: 'trigger', stepType: 'dialog_submitted' },
  { id: 'file-uploaded', label: 'File uploaded', kind: 'trigger', stepType: 'file_uploaded', disabled: true },
  { id: 'channel-renamed', label: 'Channel renamed', kind: 'trigger', stepType: 'channel_renamed', disabled: true },
  { id: 'member-role-changed', label: 'Member role changed', kind: 'trigger', stepType: 'member_role_changed', disabled: true },
  { id: 'bot-mentioned', label: 'Bot mentioned', kind: 'trigger', stepType: 'bot_mentioned', disabled: true },
  { id: 'playbook-run-started', label: 'Playbook run started', kind: 'trigger', stepType: 'playbook_run_started', disabled: true },
  { id: 'playbook-run-finished', label: 'Playbook run finished', kind: 'trigger', stepType: 'playbook_run_finished', disabled: true },
  { id: 'status-update-posted', label: 'Status update posted', kind: 'trigger', stepType: 'status_update_posted', disabled: true },
  { id: 'custom-plugin-event', label: 'Custom plugin event', kind: 'trigger', stepType: 'custom_plugin_event', disabled: true },
  { id: 'outgoing-webhook-fail', label: 'Outgoing webhook failed', kind: 'trigger', stepType: 'outgoing_webhook_fail', disabled: true },
  { id: 'group-synced', label: 'Group synced', kind: 'trigger', stepType: 'group_synced', disabled: true },
];

export const ALL_TRIGGERS: PaletteItem[] = [...PRIMARY_TRIGGERS, ...STUB_TRIGGERS];

export const TRIGGER_COUNT = ALL_TRIGGERS.length;
