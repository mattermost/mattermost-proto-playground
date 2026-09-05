import type { ReactNode } from 'react';
import MagnifyIcon from '@mattermost/compass-icons/components/magnify';
import ProductChannelsIcon from '@mattermost/compass-icons/components/product-channels';
import ProductPlaybooksIcon from '@mattermost/compass-icons/components/product-playbooks';
import ProductBoardsIcon from '@mattermost/compass-icons/components/product-boards';
import CreationOutlineIcon from '@mattermost/compass-icons/components/creation-outline';
import DotsHorizontalIcon from '@mattermost/compass-icons/components/dots-horizontal';
import BookmarkOutlineIcon from '@mattermost/compass-icons/components/bookmark-outline';
import AtIcon from '@mattermost/compass-icons/components/at';
import CogOutlineIcon from '@mattermost/compass-icons/components/cog-outline';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { UserAvatar } from '@mattermost/compass-ui/components/user-avatar';
import type { AgentsProduct } from '../context/AgentsContext';
import { VIEWER } from '../agentsData';
import styles from './ProductSidebar.module.scss';

type ProductSidebarProps = {
  activeProduct: AgentsProduct;
  onSelectProduct: (product: AgentsProduct) => void;
};

type RailButtonProps = {
  label: string;
  active?: boolean;
  onClick?: () => void;
  iconClassName?: string;
  children: ReactNode;
};

function RailButton({
  label,
  active,
  onClick,
  iconClassName,
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
      title={label}
      aria-current={active ? 'page' : undefined}
      onClick={onClick}
    >
      {active ? (
        <span className={styles['product-sidebar__active-bar']} aria-hidden />
      ) : null}
      <span
        className={[styles['product-sidebar__icon'], iconClassName]
          .filter(Boolean)
          .join(' ')}
      >
        {children}
      </span>
    </button>
  );
}

/**
 * Vision product rail (Figma 73:103950). Replaces TeamSidebar + GlobalHeader
 * product switcher for this prototype.
 */
export default function ProductSidebar({
  activeProduct,
  onSelectProduct,
}: ProductSidebarProps) {
  return (
    <nav className={styles['product-sidebar']} aria-label="Products">
      <div className={styles['product-sidebar__top']}>
        <RailButton label="Search">
          <Icon glyph={<MagnifyIcon />} size="20" />
        </RailButton>
        <RailButton
          label="Channels"
          active={activeProduct === 'channels'}
          onClick={() => onSelectProduct('channels')}
          iconClassName={styles['product-sidebar__icon--large']}
        >
          <Icon glyph={<ProductChannelsIcon />} size="20" />
        </RailButton>
        <RailButton
          label="Playbooks"
          iconClassName={styles['product-sidebar__icon--large']}
        >
          <Icon glyph={<ProductPlaybooksIcon />} size="20" />
        </RailButton>
        <RailButton
          label="Boards"
          iconClassName={styles['product-sidebar__icon--large']}
        >
          <Icon glyph={<ProductBoardsIcon />} size="20" />
        </RailButton>
        <RailButton
          label="Agents"
          active={activeProduct === 'agents'}
          onClick={() => onSelectProduct('agents')}
        >
          <Icon glyph={<CreationOutlineIcon />} size="20" />
        </RailButton>
        <RailButton label="More products">
          <Icon glyph={<DotsHorizontalIcon />} size="20" />
        </RailButton>
      </div>

      <div className={styles['product-sidebar__bottom']}>
        <RailButton label="Saved messages">
          <Icon glyph={<BookmarkOutlineIcon />} size="20" />
        </RailButton>
        <RailButton label="Recent mentions">
          <Icon glyph={<AtIcon />} size="20" />
        </RailButton>
        <RailButton label="Settings">
          <Icon glyph={<CogOutlineIcon />} size="20" />
        </RailButton>
        <button
          type="button"
          className={styles['product-sidebar__account']}
          aria-label={VIEWER.name}
          title={VIEWER.name}
        >
          <UserAvatar
            size="32"
            src={VIEWER.avatarSrc}
            alt={VIEWER.avatarAlt}
            status
          />
        </button>
      </div>
    </nav>
  );
}
