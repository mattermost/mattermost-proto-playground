import type { ComponentType, SVGProps } from 'react';
import AccountMinusOutlineIcon from '@mattermost/compass-icons/components/account-minus-outline';
import AccountMultipleOutlineIcon from '@mattermost/compass-icons/components/account-multiple-outline';
import AccountMultiplePlusOutlineIcon from '@mattermost/compass-icons/components/account-multiple-plus-outline';
import AccountOutlineIcon from '@mattermost/compass-icons/components/account-outline';
import AccountPlusOutlineIcon from '@mattermost/compass-icons/components/account-plus-outline';
import AtIcon from '@mattermost/compass-icons/components/at';
import CheckboxMarkedCircleOutlineIcon from '@mattermost/compass-icons/components/checkbox-marked-circle-outline';
import ClockOutlineIcon from '@mattermost/compass-icons/components/clock-outline';
import CloseCircleOutlineIcon from '@mattermost/compass-icons/components/close-circle-outline';
import ConsoleIcon from '@mattermost/compass-icons/components/console';
import EmoticonOutlineIcon from '@mattermost/compass-icons/components/emoticon-outline';
import EmoticonPlusOutlineIcon from '@mattermost/compass-icons/components/emoticon-plus-outline';
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
import PlusBoxOutlineIcon from '@mattermost/compass-icons/components/plus-box-outline';
import RadioboxMarkedIcon from '@mattermost/compass-icons/components/radiobox-marked';
import RefreshIcon from '@mattermost/compass-icons/components/refresh';
import SendOutlineIcon from '@mattermost/compass-icons/components/send-outline';
import SlashForwardBoxOutlineIcon from '@mattermost/compass-icons/components/slash-forward-box-outline';
import SourceBranchIcon from '@mattermost/compass-icons/components/source-branch';
import SyncIcon from '@mattermost/compass-icons/components/sync';
import UploadOutlineIcon from '@mattermost/compass-icons/components/upload-outline';
import WebhookIncomingIcon from '@mattermost/compass-icons/components/webhook-incoming';
import WebhookOutgoingIcon from '@mattermost/compass-icons/components/webhook-outgoing';
import type { PaletteItem, StepKind } from '../../data/types';

type Glyph = ComponentType<SVGProps<SVGSVGElement> & { size?: number | string }>;

const BY_STEP_TYPE: Record<string, Glyph> = {
  message_posted: MessagePlusOutlineIcon,
  message_edited: PencilOutlineIcon,
  message_deleted: MessageMinusOutlineIcon,
  channel_created: PlusBoxOutlineIcon,
  channel_renamed: PencilOutlineIcon,
  user_joined_channel: AccountPlusOutlineIcon,
  user_left_channel: AccountMinusOutlineIcon,
  user_joined_team: AccountMultiplePlusOutlineIcon,
  user_left_team: AccountMinusOutlineIcon,
  reaction_added: EmoticonPlusOutlineIcon,
  reaction_removed: EmoticonOutlineIcon,
  user_created: AccountOutlineIcon,
  incoming_webhook: WebhookIncomingIcon,
  schedule: ClockOutlineIcon,
  slash_command: SlashForwardBoxOutlineIcon,
  manual: HandRightOutlineIcon,
  dialog_submitted: ForumOutlineIcon,
  file_uploaded: UploadOutlineIcon,
  member_role_changed: AccountOutlineIcon,
  bot_mentioned: AtIcon,
  playbook_run_started: PlayOutlineIcon,
  playbook_run_finished: CheckboxMarkedCircleOutlineIcon,
  status_update_posted: MessageTextOutlineIcon,
  custom_plugin_event: ConsoleIcon,
  outgoing_webhook_fail: WebhookOutgoingIcon,
  group_synced: SyncIcon,
  post_message: SendOutlineIcon,
  direct_message: MessageTextOutlineIcon,
  add_reaction: EmoticonPlusOutlineIcon,
  get_channel_members: AccountMultipleOutlineIcon,
  open_dialog: OpenInNewIcon,
  http_request: LinkVariantIcon,
  create_channel: GlobeIcon,
  invite_user: AccountPlusOutlineIcon,
  condition: SourceBranchIcon,
  loop: RefreshIcon,
  stop: CloseCircleOutlineIcon,
  decision: RadioboxMarkedIcon,
  delay: ClockOutlineIcon,
};

const BY_KIND: Record<StepKind, Glyph> = {
  trigger: LightningBoltOutlineIcon,
  action: SendOutlineIcon,
  flow: SourceBranchIcon,
};

export function glyphForStep(kind: StepKind, stepType: string): Glyph {
  return BY_STEP_TYPE[stepType] ?? BY_KIND[kind];
}

export function glyphForPaletteItem(item: PaletteItem): Glyph {
  return glyphForStep(item.kind, item.stepType);
}
