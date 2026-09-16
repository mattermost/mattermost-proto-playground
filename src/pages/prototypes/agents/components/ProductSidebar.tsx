import type { ReactNode } from 'react';
import ChannelsChatIcon from '../icons/ChannelsChatIcon';
import PlaybooksClipboardIcon from '../icons/PlaybooksClipboardIcon';
import BoardsTargetIcon from '../icons/BoardsTargetIcon';
import FilesDocumentIcon from '../icons/FilesDocumentIcon';
import CreationOutlineIcon from '@mattermost/compass-icons/components/creation-outline';
import PhoneIcon from '@mattermost/compass-icons/components/phone';
import DotsHorizontalIcon from '@mattermost/compass-icons/components/dots-horizontal';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { Tooltip } from '@mattermost/compass-ui/components/tooltip';
import type { AgentsProduct } from '../context/AgentsContext';
import styles from './ProductSidebar.module.scss';

type ProductSidebarProps = {
  activeProduct: AgentsProduct;
  onSelectProduct: (product: AgentsProduct) => void;
};

type RailButtonProps = {
  label: string;
  active?: boolean;
  onClick?: () => void;
  children: ReactNode;
};

function RailButton({
  label,
  active,
  onClick,
  children,
}: RailButtonProps) {
  return (
    <button
      type="button"
      className={[
        styles['product-sidebar__button'],
        active ? styles['product-sidebar__button--active'] : '',
      ]
        .filter(Boolean)
        .join(' ')}
      aria-label={label}
      aria-current={active ? 'page' : undefined}
      onClick={onClick}
    >
      <span className={styles['product-sidebar__icon']}>
        {children}
      </span>
      <span className={styles['product-sidebar__tooltip']} aria-hidden>
        <Tooltip label={label} arrow="left" />
      </span>
    </button>
  );
}

export default function ProductSidebar({
  activeProduct,
  onSelectProduct,
}: ProductSidebarProps) {
  return (
    <nav className={styles['product-sidebar']} aria-label="Products">
      <div className={styles['product-sidebar__top']}>
        <RailButton
          label="Channels"
          active={activeProduct === 'channels'}
          onClick={() => onSelectProduct('channels')}
        >
          <Icon glyph={<ChannelsChatIcon />} size="20" />
        </RailButton>
        <RailButton label="Playbooks">
          <Icon glyph={<PlaybooksClipboardIcon />} size="20" />
        </RailButton>
        <RailButton label="Boards">
          <Icon glyph={<BoardsTargetIcon />} size="20" />
        </RailButton>
        <RailButton
          label="Agents"
          active={activeProduct === 'agents'}
          onClick={() => onSelectProduct('agents')}
        >
          <Icon glyph={<CreationOutlineIcon />} size="20" />
        </RailButton>
        <RailButton label="Docs">
          <Icon glyph={<FilesDocumentIcon />} size="20" />
        </RailButton>
        <RailButton label="Calls">
          <Icon glyph={<PhoneIcon />} size="20" />
        </RailButton>
        <RailButton label="More">
          <Icon glyph={<DotsHorizontalIcon />} size="20" />
        </RailButton>
      </div>
    </nav>
  );
}
