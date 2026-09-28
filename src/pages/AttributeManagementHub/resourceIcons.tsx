import type { ReactElement } from 'react';
import AccountOutlineIcon from '@mattermost/compass-icons/components/account-outline';
import ProductChannelsIcon from '@mattermost/compass-icons/components/product-channels';
import MessageTextOutlineIcon from '@mattermost/compass-icons/components/message-text-outline';
import LayersOutlineIcon from '@mattermost/compass-icons/components/layers-outline';
import Icon from '@/components/ui/Icon/Icon';
import type { ResourceKind } from './hubData';
import RobotOutlineIcon from './RobotOutlineIcon';

const RESOURCE_ICONS: Record<ResourceKind, typeof AccountOutlineIcon> = {
  Users: AccountOutlineIcon,
  Bots: RobotOutlineIcon,
  Channels: ProductChannelsIcon,
  Posts: MessageTextOutlineIcon,
  Teams: LayersOutlineIcon,
};

export function resourceIcon(
  resource: ResourceKind,
  size: '16' | '20' = '16',
): ReactElement {
  const Glyph = RESOURCE_ICONS[resource];
  return <Icon size={size} glyph={<Glyph />} />;
}
