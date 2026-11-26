/*
 * Generated from the Weave plugin step catalog
 * (mattermost-plugin-weave `server/automation/catalog.json`, main at 32c114c).
 * Global-only steps (User will log in, Call another plugin) are left out:
 * they never appear in team automations, so a team policy cannot grant them.
 */

import type { StepCategory } from './weaveAutomationPermissionsData';

export const WEAVE_CATALOG: StepCategory[] = [
  {
    id: 'triggers',
    label: 'Triggers',
    steps: [
      {
        id: 'trigger_message_posted',
        type: 'message_posted',
        label: 'Message posted',
      },
      {
        id: 'trigger_message_updated',
        type: 'message_updated',
        label: 'Message edited',
      },
      {
        id: 'trigger_message_deleted',
        type: 'message_deleted',
        label: 'Message deleted',
      },
      {
        id: 'trigger_channel_created',
        type: 'channel_created',
        label: 'Channel created',
      },
      {
        id: 'trigger_user_joined_channel',
        type: 'user_joined_channel',
        label: 'User joined channel',
      },
      {
        id: 'trigger_user_left_channel',
        type: 'user_left_channel',
        label: 'User left channel',
      },
      {
        id: 'trigger_user_joined_team',
        type: 'user_joined_team',
        label: 'User joined team',
      },
      {
        id: 'trigger_user_left_team',
        type: 'user_left_team',
        label: 'User left team',
      },
      {
        id: 'trigger_reaction_added',
        type: 'reaction_added',
        label: 'Reaction added',
      },
      {
        id: 'trigger_reaction_removed',
        type: 'reaction_removed',
        label: 'Reaction removed',
      },
      {
        id: 'trigger_user_created',
        type: 'user_created',
        label: 'User created',
      },
      { id: 'trigger_webhook', type: 'webhook', label: 'Incoming webhook' },
      { id: 'trigger_schedule', type: 'schedule', label: 'Schedule' },
      {
        id: 'trigger_slash_command',
        type: 'slash_command',
        label: 'Slash command',
      },
      { id: 'trigger_manual', type: 'manual', label: 'Manual (run now)' },
      {
        id: 'trigger_message_action',
        type: 'message_action',
        label: 'Message action (button/menu click)',
      },
      {
        id: 'trigger_post_menu_action',
        type: 'post_menu_action',
        label: 'Post menu action ("..." menu)',
      },
      {
        id: 'trigger_dialog_submitted',
        type: 'dialog_submitted',
        label: 'Dialog submitted',
      },
      {
        id: 'trigger_message_will_be_posted',
        type: 'message_will_be_posted',
        label: 'Message will be posted (blocking)',
      },
      {
        id: 'trigger_message_will_be_updated',
        type: 'message_will_be_updated',
        label: 'Message will be edited (blocking)',
      },
      {
        id: 'trigger_channel_will_be_archived',
        type: 'channel_will_be_archived',
        label: 'Channel will be archived (blocking)',
      },
      {
        id: 'trigger_channel_will_be_updated',
        type: 'channel_will_be_updated',
        label: 'Channel will be updated (blocking)',
      },
      {
        id: 'trigger_channel_will_be_restored',
        type: 'channel_will_be_restored',
        label: 'Channel will be restored (blocking)',
      },
      {
        id: 'trigger_channel_member_will_be_added',
        type: 'channel_member_will_be_added',
        label: 'Channel member will be added (blocking)',
      },
      {
        id: 'trigger_team_member_will_be_added',
        type: 'team_member_will_be_added',
        label: 'Team member will be added (blocking)',
      },
      {
        id: 'trigger_file_will_be_uploaded',
        type: 'file_will_be_uploaded',
        label: 'File will be uploaded (blocking)',
      },
    ],
  },
  {
    id: 'flow',
    label: 'Flow',
    steps: [
      { id: 'node_condition', type: 'condition', label: 'Condition' },
      { id: 'node_transform', type: 'transform', label: 'Transform' },
      { id: 'node_stop', type: 'stop', label: 'Stop' },
      { id: 'node_wait', type: 'wait', label: 'Wait' },
      { id: 'node_loop', type: 'loop', label: 'Loop (for each)' },
      { id: 'node_explode', type: 'explode', label: 'Explode (split array)' },
      { id: 'node_implode', type: 'implode', label: 'Implode (recombine)' },
    ],
  },
  {
    id: 'channels',
    label: 'Channels',
    steps: [
      { id: 'node_get_channel', type: 'get_channel', label: 'Get channel' },
      {
        id: 'node_list_channels',
        type: 'list_channels',
        label: 'List public channels',
      },
      {
        id: 'node_get_channel_members',
        type: 'get_channel_members',
        label: 'Get channel members',
      },
      {
        id: 'node_create_channel',
        type: 'create_channel',
        label: 'Create channel',
      },
      {
        id: 'node_add_channel_member',
        type: 'add_channel_member',
        label: 'Add channel member',
      },
      {
        id: 'node_remove_channel_member',
        type: 'remove_channel_member',
        label: 'Remove channel member',
      },
      {
        id: 'node_archive_channel',
        type: 'archive_channel',
        label: 'Archive channel',
      },
      {
        id: 'node_update_channel',
        type: 'update_channel',
        label: 'Update channel',
      },
    ],
  },
  {
    id: 'users-teams',
    label: 'Users & teams',
    steps: [
      { id: 'node_get_user', type: 'get_user', label: 'Get user' },
      {
        id: 'node_add_team_member',
        type: 'add_team_member',
        label: 'Add team member',
      },
      {
        id: 'node_remove_team_member',
        type: 'remove_team_member',
        label: 'Remove team member',
      },
      {
        id: 'node_update_user_roles',
        type: 'update_user_roles',
        label: 'Update user roles',
      },
      {
        id: 'node_update_user_status',
        type: 'update_user_status',
        label: 'Update user status',
      },
      { id: 'node_create_group', type: 'create_group', label: 'Create group' },
      {
        id: 'node_add_group_member',
        type: 'add_group_member',
        label: 'Add group member',
      },
      {
        id: 'node_remove_group_member',
        type: 'remove_group_member',
        label: 'Remove group member',
      },
    ],
  },
  {
    id: 'posts',
    label: 'Posts',
    steps: [
      { id: 'node_get_posts', type: 'get_posts', label: 'Get channel posts' },
      { id: 'node_get_thread', type: 'get_thread', label: 'Get thread' },
      { id: 'node_search_posts', type: 'search_posts', label: 'Search posts' },
      { id: 'node_post_message', type: 'post_message', label: 'Post message' },
      { id: 'node_update_post', type: 'update_post', label: 'Update post' },
      { id: 'node_delete_post', type: 'delete_post', label: 'Delete post' },
      { id: 'node_add_reaction', type: 'add_reaction', label: 'Add reaction' },
      {
        id: 'node_remove_reaction',
        type: 'remove_reaction',
        label: 'Remove reaction',
      },
      {
        id: 'node_send_ephemeral',
        type: 'send_ephemeral',
        label: 'Send ephemeral message',
      },
      { id: 'node_dm_user', type: 'dm_user', label: 'Direct message user' },
    ],
  },
  {
    id: 'blocking',
    label: 'Blocking',
    steps: [
      {
        id: 'node_decision',
        type: 'decision',
        label: 'Decision (allow/reject/modify)',
      },
    ],
  },
  {
    id: 'interactive',
    label: 'Interactive',
    steps: [
      { id: 'node_open_dialog', type: 'open_dialog', label: 'Open dialog' },
    ],
  },
  {
    id: 'stored-state',
    label: 'Stored state',
    steps: [
      { id: 'node_kv_set', type: 'kv_set', label: 'Set value' },
      { id: 'node_kv_get', type: 'kv_get', label: 'Get value' },
      { id: 'node_kv_delete', type: 'kv_delete', label: 'Delete value' },
      {
        id: 'node_kv_increment',
        type: 'kv_increment',
        label: 'Increment counter',
      },
      {
        id: 'node_kv_list_append',
        type: 'kv_list_append',
        label: 'Append to list',
      },
      { id: 'node_kv_list_pop', type: 'kv_list_pop', label: 'Pop from list' },
    ],
  },
  {
    id: 'integrations',
    label: 'Integrations',
    steps: [
      { id: 'node_http_request', type: 'http_request', label: 'HTTP request' },
    ],
  },
  {
    id: 'ai',
    label: 'AI',
    steps: [
      {
        id: 'node_ai_completion',
        type: 'ai_completion',
        label: 'AI completion',
      },
      { id: 'node_ai_summarize', type: 'ai_summarize', label: 'AI summarize' },
      { id: 'node_ai_classify', type: 'ai_classify', label: 'AI classify' },
    ],
  },
  {
    id: 'playbooks',
    label: 'Playbooks',
    steps: [
      {
        id: 'node_pb_start_run',
        type: 'pb_start_run',
        label: 'Start playbook run',
      },
      {
        id: 'node_pb_update_status',
        type: 'pb_update_status',
        label: 'Post run status update',
      },
      {
        id: 'node_pb_finish_run',
        type: 'pb_finish_run',
        label: 'Finish playbook run',
      },
      {
        id: 'node_pb_check_task',
        type: 'pb_check_task',
        label: 'Set task state',
      },
      { id: 'node_pb_add_task', type: 'pb_add_task', label: 'Add task' },
      { id: 'node_pb_get_run', type: 'pb_get_run', label: 'Get playbook run' },
    ],
  },
  {
    id: 'legacy',
    label: 'Legacy',
    steps: [
      {
        id: 'node_mm_api',
        type: 'mm_api',
        label: 'Mattermost action (legacy)',
      },
    ],
  },
];
