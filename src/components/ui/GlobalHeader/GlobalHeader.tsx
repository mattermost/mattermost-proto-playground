import ProductsIcon from '@mattermost/compass-icons/components/products';
import ProductChannelsIcon from '@mattermost/compass-icons/components/product-channels';
import ProductPlaybooksIcon from '@mattermost/compass-icons/components/product-playbooks';
import ProductBoardsIcon from '@mattermost/compass-icons/components/product-boards';
import ArrowLeftIcon from '@mattermost/compass-icons/components/arrow-left';
import ArrowRightIcon from '@mattermost/compass-icons/components/arrow-right';
import MagnifyIcon from '@mattermost/compass-icons/components/magnify';
import HelpCircleOutlineIcon from '@mattermost/compass-icons/components/help-circle-outline';
import CogOutlineIcon from '@mattermost/compass-icons/components/cog-outline';
import AtIcon from '@mattermost/compass-icons/components/at';
import BookmarkOutlineIcon from '@mattermost/compass-icons/components/bookmark-outline';
import CheckboxMultipleMarkedOutlineIcon from '@mattermost/compass-icons/components/checkbox-multiple-marked-outline';
import Button from '@/components/ui/Button/Button';
import Icon from '@/components/ui/Icon/Icon';
import IconButton from '@/components/ui/IconButton/IconButton';
import UserAvatar from '@/components/ui/UserAvatar/UserAvatar';
import type { ComponentType, MouseEventHandler } from 'react';
import styles from './GlobalHeader.module.scss';

export type GlobalHeaderProduct = 'Channels' | 'Playbooks' | 'Boards';

export interface GlobalHeaderProps {
  /** Optional CSS class name. */
  className?: string;
  /** Product context. Controls branding + right-side controls. Default: Channels. */
  product?: GlobalHeaderProduct;
  /** When true and product is Channels, shows the Channels product icon + label. */
  showChannelsBranding?: boolean;
  /** When true, shows the Upgrade button in the right controls. */
  showUpgradeButton?: boolean;
  /** URL for the signed-in user avatar. */
  userAvatarSrc: string;
  /** Alt text for the signed-in user avatar. */
  userAvatarAlt: string;
  /** Called when the product switcher icon button is clicked. */
  onProductSwitcherClick?: MouseEventHandler<HTMLButtonElement>;
  /** Marks the product switcher button as expanded (for ARIA). */
  productSwitcherOpen?: boolean;
}

const PRODUCT_ICON: Record<GlobalHeaderProduct, ComponentType<{ size?: number }>> = {
  Channels: ProductChannelsIcon,
  Playbooks: ProductPlaybooksIcon,
  Boards: ProductBoardsIcon,
};

function InvertedIconButton({
  ariaLabel,
  glyph,
  onClick,
  ariaExpanded,
  ariaHasPopup,
}: {
  ariaLabel: string;
  glyph: React.ReactNode;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  ariaExpanded?: boolean;
  ariaHasPopup?: 'menu' | 'true';
}) {
  return (
    <IconButton
      aria-label={ariaLabel}
      size="Small"
      padding="Compact"
      style="Inverted"
      icon={<Icon size="16" glyph={glyph} />}
      onClick={onClick}
      aria-expanded={ariaExpanded}
      aria-haspopup={ariaHasPopup}
    />
  );
}

function ProductBrand({ product }: { product: GlobalHeaderProduct }) {
  const ProductIcon = PRODUCT_ICON[product];
  return (
    <div className={styles['global-header__product']}>
      <span className={styles['global-header__product-icon']} aria-hidden>
        <Icon size="20" glyph={<ProductIcon />} />
      </span>
      <span className={styles['global-header__product-name']}>{product}</span>
    </div>
  );
}

function Navigator() {
  return (
    <div className={styles['global-header__navigator']}>
      <InvertedIconButton ariaLabel="Back" glyph={<ArrowLeftIcon />} />
      <InvertedIconButton ariaLabel="Forward" glyph={<ArrowRightIcon />} />
    </div>
  );
}

/**
 * Global Header pattern — top bar spanning the full viewport that contains
 * the product switcher, product branding, navigator, and session-level
 * controls (search, mentions, saved, settings, account).
 *
 * Three product variants control the layout:
 * - Channels: center search + right controls (@ mentions, saved, settings)
 * - Playbooks: right controls (tasks, help, settings)
 * - Boards: right controls (help, settings)
 *
 * Matches Figma Global Header v1.2.1 (node 613:4135).
 */
export default function GlobalHeader({
  className = '',
  product = 'Channels',
  showChannelsBranding = true,
  showUpgradeButton = false,
  userAvatarSrc,
  userAvatarAlt,
  onProductSwitcherClick,
  productSwitcherOpen = false,
}: GlobalHeaderProps) {
  const isChannels = product === 'Channels';
  const showBrand = isChannels ? showChannelsBranding : true;

  const rootClass = [styles['global-header'], className].filter(Boolean).join(' ');

  return (
    <header className={rootClass}>
      <div className={styles['global-header__left']}>
        <InvertedIconButton
          ariaLabel="Product switcher"
          glyph={<ProductsIcon />}
          onClick={onProductSwitcherClick}
          ariaExpanded={productSwitcherOpen}
          ariaHasPopup="menu"
        />
        {showBrand && <ProductBrand product={product} />}
        <Navigator />
      </div>

      {isChannels && (
        <div className={styles['global-header__center']}>
          <div className={styles['global-header__search']}>
            <span className={styles['global-header__search-icon']} aria-hidden>
              <Icon size="12" glyph={<MagnifyIcon />} />
            </span>
            <input
              type="search"
              className={styles['global-header__search-input']}
              placeholder="Search"
              aria-label="Search"
            />
          </div>
          <InvertedIconButton ariaLabel="Help" glyph={<HelpCircleOutlineIcon />} />
        </div>
      )}

      <div className={styles['global-header__right']}>
        {showUpgradeButton && (
          <Button emphasis="Primary" size="X-Small">
            Upgrade
          </Button>
        )}
        {product === 'Playbooks' && (
          <InvertedIconButton
            ariaLabel="Tasks"
            glyph={<CheckboxMultipleMarkedOutlineIcon />}
          />
        )}
        {isChannels && (
          <>
            <InvertedIconButton ariaLabel="Recent mentions" glyph={<AtIcon />} />
            <InvertedIconButton ariaLabel="Saved messages" glyph={<BookmarkOutlineIcon />} />
          </>
        )}
        {!isChannels && (
          <InvertedIconButton ariaLabel="Help" glyph={<HelpCircleOutlineIcon />} />
        )}
        <InvertedIconButton ariaLabel="Settings" glyph={<CogOutlineIcon />} />
        <button className={styles['global-header__account']} aria-label="Account menu">
          <UserAvatar src={userAvatarSrc} alt={userAvatarAlt} size="24" status />
        </button>
      </div>
    </header>
  );
}
