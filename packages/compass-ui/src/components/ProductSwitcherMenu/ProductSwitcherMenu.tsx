import type { HTMLAttributes, ReactNode } from 'react';
import ApplicationCogIcon from '@mattermost/compass-icons/components/application-cog';
import AppsIcon from '@mattermost/compass-icons/components/apps';
import DownloadOutlineIcon from '@mattermost/compass-icons/components/download-outline';
import InformationOutlineIcon from '@mattermost/compass-icons/components/information-outline';
import ProductBoardsIcon from '@mattermost/compass-icons/components/product-boards';
import ProductChannelsIcon from '@mattermost/compass-icons/components/product-channels';
import ProductPlaybooksIcon from '@mattermost/compass-icons/components/product-playbooks';
import WebhookIcon from '@mattermost/compass-icons/components/webhook';
import Icon from '@/components/Icon/Icon';
import MenuItem from '@/components/MenuItem/MenuItem';
import PopoverMenu, {
  PopoverMenuDivider,
  PopoverMenuGroup,
} from '@/components/PopoverMenu/PopoverMenu';
import styles from './ProductSwitcherMenu.module.scss';

/** Built-in products shipped with the switcher. */
export type BuiltInProductSwitcherProduct = 'Channels' | 'Boards' | 'Playbooks';

/**
 * Product id for selection. Built-ins use their labels; prototypes use any
 * string id from {@link ProductSwitcherProductItem.id}.
 */
export type ProductSwitcherProduct = BuiltInProductSwitcherProduct | (string & {});

export interface ProductSwitcherProductItem {
  /** Stable id used for `selectedProduct` and `onProductSelect`. */
  id: string;
  /** Menu row label. */
  label: string;
  /**
   * Leading icon glyph (e.g. a compass-icons component). Rendered at 24px in
   * the product row slot.
   */
  icon: ReactNode;
  /** Optional row click handler (also fires `onProductSelect` when provided). */
  onClick?: () => void;
}

export interface ProductSwitcherMenuProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Currently active product id; shows trailing check on that row.
   * Default: `Channels`.
   */
  selectedProduct?: ProductSwitcherProduct;
  /**
   * Extra products appended after Channels, Boards, and Playbooks.
   * Use this from prototypes to register custom products in the top section.
   */
  additionalProducts?: ProductSwitcherProductItem[];
  /** Called when any product row (built-in or additional) is activated. */
  onProductSelect?: (productId: string) => void;
}

export const DEFAULT_PRODUCT_SWITCHER_PRODUCTS: ProductSwitcherProductItem[] = [
  {
    id: 'Channels',
    label: 'Channels',
    icon: <ProductChannelsIcon />,
  },
  {
    id: 'Boards',
    label: 'Boards',
    icon: <ProductBoardsIcon />,
  },
  {
    id: 'Playbooks',
    label: 'Playbooks',
    icon: <ProductPlaybooksIcon />,
  },
];

function productLeadingVisual(glyph: ReactNode) {
  return (
    <span className={styles['product-switcher-menu__product-icon']}>
      <Icon glyph={glyph} size="24" />
    </span>
  );
}

/**
 * Product switcher popover opened from the Global Header products control.
 * Products use 24px button-bg icons and semibold center-channel labels; the
 * active product shows a trailing check. Utility links follow in a second group.
 *
 * Prototypes can append products via {@link ProductSwitcherMenuProps.additionalProducts}.
 *
 * Matches Figma Patterns — Popover Menus (node 1423:8667).
 */
export default function ProductSwitcherMenu({
  selectedProduct = 'Channels',
  additionalProducts = [],
  onProductSelect,
  className = '',
  style,
  ...rest
}: ProductSwitcherMenuProps) {
  const rootClass = [styles['product-switcher-menu'], className]
    .filter(Boolean)
    .join(' ');

  const products = [...DEFAULT_PRODUCT_SWITCHER_PRODUCTS, ...additionalProducts];

  return (
    <PopoverMenu
      className={rootClass}
      style={{ width: '273px', ...style }}
      {...rest}
    >
      <PopoverMenuGroup>
        {products.map((product) => (
          <MenuItem
            key={product.id}
            className={styles['product-switcher-menu__product-item']}
            label={product.label}
            leadingVisual={productLeadingVisual(product.icon)}
            trailingElement={selectedProduct === product.id}
            onClick={() => {
              product.onClick?.();
              onProductSelect?.(product.id);
            }}
          />
        ))}
      </PopoverMenuGroup>
      <PopoverMenuDivider />
      <PopoverMenuGroup>
        <MenuItem
          label="System console"
          leadingVisual={<Icon glyph={<ApplicationCogIcon />} size="16" />}
        />
        <MenuItem
          label="Integrations"
          leadingVisual={<Icon glyph={<WebhookIcon />} size="16" />}
        />
        <MenuItem
          label="Marketplace"
          leadingVisual={<Icon glyph={<AppsIcon />} size="16" />}
        />
        <MenuItem
          label="Download apps"
          leadingVisual={<Icon glyph={<DownloadOutlineIcon />} size="16" />}
        />
        <MenuItem
          label="About Mattermost"
          leadingVisual={<Icon glyph={<InformationOutlineIcon />} size="16" />}
        />
      </PopoverMenuGroup>
    </PopoverMenu>
  );
}
