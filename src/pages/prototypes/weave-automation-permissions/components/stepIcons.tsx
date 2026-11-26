/*
 * Step glyphs, copied from the Weave plugin (mattermost-plugin-weave
 * `webapp/src/components/step_icons.tsx`) so steps look the same as in the
 * plugin's palette and step picker.
 */
import type { ComponentType, SVGProps } from 'react';
import AccountMinusOutlineIcon from '@mattermost/compass-icons/components/account-minus-outline';
import AccountMultipleOutlineIcon from '@mattermost/compass-icons/components/account-multiple-outline';
import AccountMultiplePlusOutlineIcon from '@mattermost/compass-icons/components/account-multiple-plus-outline';
import AccountOutlineIcon from '@mattermost/compass-icons/components/account-outline';
import AccountPlusOutlineIcon from '@mattermost/compass-icons/components/account-plus-outline';
import ArchiveOutlineIcon from '@mattermost/compass-icons/components/archive-outline';
import CheckboxMarkedCircleOutlineIcon from '@mattermost/compass-icons/components/checkbox-marked-circle-outline';
import ClockOutlineIcon from '@mattermost/compass-icons/components/clock-outline';
import CloseCircleOutlineIcon from '@mattermost/compass-icons/components/close-circle-outline';
import CodeTagsIcon from '@mattermost/compass-icons/components/code-tags';
import ConsoleIcon from '@mattermost/compass-icons/components/console';
import CreationOutlineIcon from '@mattermost/compass-icons/components/creation-outline';
import EmoticonOutlineIcon from '@mattermost/compass-icons/components/emoticon-outline';
import EmoticonPlusOutlineIcon from '@mattermost/compass-icons/components/emoticon-plus-outline';
import FormatListBulletedIcon from '@mattermost/compass-icons/components/format-list-bulleted';
import ForumOutlineIcon from '@mattermost/compass-icons/components/forum-outline';
import GlobeIcon from '@mattermost/compass-icons/components/globe';
import HandRightOutlineIcon from '@mattermost/compass-icons/components/hand-right-outline';
import LightningBoltOutlineIcon from '@mattermost/compass-icons/components/lightning-bolt-outline';
import LinkVariantIcon from '@mattermost/compass-icons/components/link-variant';
import MessageMinusOutlineIcon from '@mattermost/compass-icons/components/message-minus-outline';
import MessagePlusOutlineIcon from '@mattermost/compass-icons/components/message-plus-outline';
import MessageTextOutlineIcon from '@mattermost/compass-icons/components/message-text-outline';
import OpenInNewIcon from '@mattermost/compass-icons/components/open-in-new';
import PencilOutlineIcon from '@mattermost/compass-icons/components/pencil-outline';
import PlayOutlineIcon from '@mattermost/compass-icons/components/play-outline';
import PlaylistCheckIcon from '@mattermost/compass-icons/components/playlist-check';
import PlusBoxOutlineIcon from '@mattermost/compass-icons/components/plus-box-outline';
import RadioboxMarkedIcon from '@mattermost/compass-icons/components/radiobox-marked';
import RefreshIcon from '@mattermost/compass-icons/components/refresh';
import SendOutlineIcon from '@mattermost/compass-icons/components/send-outline';
import ServerOutlineIcon from '@mattermost/compass-icons/components/server-outline';
import SlashForwardBoxOutlineIcon from '@mattermost/compass-icons/components/slash-forward-box-outline';
import SourceBranchIcon from '@mattermost/compass-icons/components/source-branch';
import TrashCanOutlineIcon from '@mattermost/compass-icons/components/trash-can-outline';
import UploadOutlineIcon from '@mattermost/compass-icons/components/upload-outline';
import WebhookIncomingIcon from '@mattermost/compass-icons/components/webhook-incoming';

type Glyph = ComponentType<
  SVGProps<SVGSVGElement> & { size?: number | string }
>;

const BY_TYPE: Record<string, Glyph> = {
  // Triggers
  message_posted: MessagePlusOutlineIcon,
  message_updated: PencilOutlineIcon,
  message_deleted: MessageMinusOutlineIcon,
  channel_created: PlusBoxOutlineIcon,
  user_joined_channel: AccountPlusOutlineIcon,
  user_left_channel: AccountMinusOutlineIcon,
  user_joined_team: AccountMultiplePlusOutlineIcon,
  user_left_team: AccountMinusOutlineIcon,
  reaction_added: EmoticonPlusOutlineIcon,
  reaction_removed: EmoticonOutlineIcon,
  user_created: AccountOutlineIcon,
  webhook: WebhookIncomingIcon,
  schedule: ClockOutlineIcon,
  slash_command: SlashForwardBoxOutlineIcon,
  manual: HandRightOutlineIcon,
  message_action: ForumOutlineIcon,
  post_menu_action: MessageTextOutlineIcon,
  dialog_submitted: ForumOutlineIcon,
  message_will_be_posted: MessagePlusOutlineIcon,
  message_will_be_updated: PencilOutlineIcon,
  channel_will_be_archived: ArchiveOutlineIcon,
  channel_will_be_updated: PencilOutlineIcon,
  channel_will_be_restored: RefreshIcon,
  channel_member_will_be_added: AccountPlusOutlineIcon,
  team_member_will_be_added: AccountMultiplePlusOutlineIcon,
  file_will_be_uploaded: UploadOutlineIcon,
  user_will_log_in: AccountOutlineIcon,

  // Flow
  condition: SourceBranchIcon,
  transform: CodeTagsIcon,
  stop: CloseCircleOutlineIcon,
  wait: ClockOutlineIcon,
  loop: RefreshIcon,
  explode: FormatListBulletedIcon,
  implode: FormatListBulletedIcon,
  decision: RadioboxMarkedIcon,

  // Posts / messaging
  get_posts: MessageTextOutlineIcon,
  get_thread: ForumOutlineIcon,
  search_posts: MessageTextOutlineIcon,
  post_message: SendOutlineIcon,
  update_post: PencilOutlineIcon,
  delete_post: TrashCanOutlineIcon,
  add_reaction: EmoticonPlusOutlineIcon,
  remove_reaction: EmoticonOutlineIcon,
  send_ephemeral: MessageTextOutlineIcon,
  dm_user: MessageTextOutlineIcon,
  open_dialog: OpenInNewIcon,

  // Channels
  get_channel: GlobeIcon,
  list_channels: GlobeIcon,
  get_channel_members: AccountMultipleOutlineIcon,
  create_channel: PlusBoxOutlineIcon,
  add_channel_member: AccountPlusOutlineIcon,
  remove_channel_member: AccountMinusOutlineIcon,
  archive_channel: ArchiveOutlineIcon,
  update_channel: PencilOutlineIcon,

  // Users & teams
  get_user: AccountOutlineIcon,
  add_team_member: AccountMultiplePlusOutlineIcon,
  remove_team_member: AccountMinusOutlineIcon,
  update_user_roles: AccountOutlineIcon,
  update_user_status: AccountOutlineIcon,
  create_group: AccountMultipleOutlineIcon,
  add_group_member: AccountPlusOutlineIcon,
  remove_group_member: AccountMinusOutlineIcon,

  // State
  kv_set: ServerOutlineIcon,
  kv_get: ServerOutlineIcon,
  kv_delete: ServerOutlineIcon,
  kv_increment: ServerOutlineIcon,
  kv_list_append: ServerOutlineIcon,
  kv_list_pop: ServerOutlineIcon,

  // Integrations / AI / Playbooks
  http_request: LinkVariantIcon,
  plugin_call: ConsoleIcon,
  ai_completion: CreationOutlineIcon,
  ai_summarize: CreationOutlineIcon,
  ai_classify: CreationOutlineIcon,
  pb_start_run: PlayOutlineIcon,
  pb_update_status: PlaylistCheckIcon,
  pb_finish_run: CheckboxMarkedCircleOutlineIcon,
  pb_check_task: CheckboxMarkedCircleOutlineIcon,
  pb_add_task: FormatListBulletedIcon,
  pb_get_run: PlayOutlineIcon,
  mm_api: ServerOutlineIcon,
};

export function glyphForStep(type: string): Glyph {
  return BY_TYPE[type] ?? LightningBoltOutlineIcon;
}
