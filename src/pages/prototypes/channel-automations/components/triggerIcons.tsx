import type { ComponentType, SVGProps } from 'react';
import AccountPlusOutlineIcon from '@mattermost/compass-icons/components/account-plus-outline';
import CheckboxBlankOutlineIcon from '@mattermost/compass-icons/components/checkbox-blank-outline';
import CheckboxMarkedIcon from '@mattermost/compass-icons/components/checkbox-marked';
import ClockOutlineIcon from '@mattermost/compass-icons/components/clock-outline';
import LightningBoltOutlineIcon from '@mattermost/compass-icons/components/lightning-bolt-outline';
import MessageTextOutlineIcon from '@mattermost/compass-icons/components/message-text-outline';
import ProductChannelsIcon from '@mattermost/compass-icons/components/product-channels';
import ProductPlaybooksIcon from '@mattermost/compass-icons/components/product-playbooks';
import type { TriggerPickerOption } from '../channelAutomationsData';

type Glyph = ComponentType<SVGProps<SVGSVGElement>>;

const OPTION_ICONS: Record<TriggerPickerOption, Glyph> = {
  schedule: ClockOutlineIcon,
  message: MessageTextOutlineIcon,
  join: AccountPlusOutlineIcon,
  'channel-created': ProductChannelsIcon,
  'playbook-run-started': ProductPlaybooksIcon,
  'playbook-run-finished': ProductPlaybooksIcon,
  'playbook-task-checked': CheckboxMarkedIcon,
  'playbook-task-unchecked': CheckboxBlankOutlineIcon,
};

export function triggerOptionIcon(
  option: TriggerPickerOption | null,
): Glyph {
  return option != null ? OPTION_ICONS[option] : LightningBoltOutlineIcon;
}
