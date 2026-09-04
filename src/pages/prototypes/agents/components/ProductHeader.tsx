import ArrowLeftIcon from '@mattermost/compass-icons/components/arrow-left';
import ArrowRightIcon from '@mattermost/compass-icons/components/arrow-right';
import CreationOutlineIcon from '@mattermost/compass-icons/components/creation-outline';
import ProductChannelsIcon from '@mattermost/compass-icons/components/product-channels';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { SearchInput } from '@mattermost/compass-ui/components/search-input';
import type { AgentsProduct } from '../context/AgentsContext';
import styles from './ProductHeader.module.scss';

type ProductHeaderProps = {
  product: AgentsProduct;
};

/**
 * Slim in-product header. Global utilities live on the Product Sidebar, so
 * this only shows product identity, history, and in-product search.
 */
export default function ProductHeader({ product }: ProductHeaderProps) {
  const isAgents = product === 'agents';

  return (
    <header className={styles['product-header']}>
      <div className={styles['product-header__left']}>
        <span className={styles['product-header__brand']} aria-hidden>
          <Icon
            glyph={
              isAgents ? <CreationOutlineIcon /> : <ProductChannelsIcon />
            }
            size="20"
          />
        </span>
        <span className={styles['product-header__name']}>
          {isAgents ? 'Agents' : 'Channels'}
        </span>
        <div className={styles['product-header__nav']}>
          <button
            type="button"
            className={styles['product-header__nav-button']}
            aria-label="Back"
            disabled
          >
            <Icon glyph={<ArrowLeftIcon />} size="16" />
          </button>
          <button
            type="button"
            className={styles['product-header__nav-button']}
            aria-label="Forward"
            disabled
          >
            <Icon glyph={<ArrowRightIcon />} size="16" />
          </button>
        </div>
      </div>

      <div className={styles['product-header__search']}>
        <SearchInput
          size="small"
          label="Search"
          aria-label={isAgents ? 'Search agents' : 'Search channels'}
        />
      </div>

      <div className={styles['product-header__right']} aria-hidden />
    </header>
  );
}
