import type { Ref } from 'react';
import ChevronDownIcon from '@mattermost/compass-icons/components/chevron-down';
import MagnifyIcon from '@mattermost/compass-icons/components/magnify';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { IconButton } from '@mattermost/compass-ui/components/icon-button';
import styles from './LhsSidebarHeader.module.scss';

type LhsSidebarHeaderProps = {
  productName: string;
  findLabel: string;
  findAriaLabel?: string;
  plusAriaLabel: string;
  plusExpanded?: boolean;
  plusHasPopup?: boolean | 'menu';
  onPlusClick: () => void;
  /** Anchor for host-owned menus (e.g. Channels PlusMenu). */
  plusAnchorRef?: Ref<HTMLDivElement>;
};

/**
 * Product LHS chrome matching Figma Left Sidebar Header/Default (73:105849)
 * plus ChannelsSidebar navigator find row.
 */
export default function LhsSidebarHeader({
  productName,
  findLabel,
  findAriaLabel,
  plusAriaLabel,
  plusExpanded,
  plusHasPopup,
  onPlusClick,
  plusAnchorRef,
}: LhsSidebarHeaderProps) {
  return (
    <div className={styles['lhs-sidebar-header']}>
      <div className={styles['lhs-sidebar-header__bar']}>
        <button
          type="button"
          className={styles['lhs-sidebar-header__product']}
          aria-label={productName}
        >
          <span className={styles['lhs-sidebar-header__product-name']}>
            {productName}
          </span>
          <span
            className={styles['lhs-sidebar-header__product-chevron']}
            aria-hidden
          >
            <ChevronDownIcon size={16} />
          </span>
        </button>
        <div ref={plusAnchorRef} className={styles['lhs-sidebar-header__plus']}>
          <IconButton
            size="small"
            style="inverted"
            padding="compact"
            rounded
            icon={<Icon glyph={<PlusIcon />} size="16" />}
            aria-label={plusAriaLabel}
            aria-expanded={plusExpanded}
            aria-haspopup={plusHasPopup}
            onClick={onPlusClick}
          />
        </div>
      </div>

      <div className={styles['lhs-sidebar-header__navigator']}>
        <div
          className={styles['lhs-sidebar-header__find']}
          role="search"
          aria-label={findAriaLabel ?? findLabel}
        >
          <span className={styles['lhs-sidebar-header__find-icon']} aria-hidden>
            <MagnifyIcon size={16} />
          </span>
          <span className={styles['lhs-sidebar-header__find-label']}>
            {findLabel}
          </span>
        </div>
      </div>
    </div>
  );
}
