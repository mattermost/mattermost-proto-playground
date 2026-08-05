import type {ChangeEvent, ReactNode} from 'react';
import MobileSearchField from '@/components/MobileSearchField/MobileSearchField';
import MobileTabScreen from '@/components/MobileTabScreen/MobileTabScreen';
import styles from './MobileSearch.module.scss';

export interface MobileSearchProps {
  /** Controlled search query. */
  value?: string;
  /** Called when the search field changes. */
  onChange?: (value: string) => void;
  /** Search field placeholder. Default: Search messages & files. */
  placeholder?: string;
  /** White sheet body — results, empty state, etc. */
  children?: ReactNode;
  className?: string;
}

/**
 * Mobile Search tab layout — large title, sidebar search field, and sheet.
 *
 * @see Figma Patterns — Mobile — Top Nav Bar — Search
 */
export default function MobileSearch({
  value = '',
  onChange,
  placeholder = 'Search messages & files',
  children,
  className = '',
}: MobileSearchProps) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange?.(event.target.value);
  };

  return (
    <MobileTabScreen
      className={className}
      header={
        <div className={styles['mobile-search__header']}>
          <div className={styles['mobile-search__titles']}>
            <h1 className={styles['mobile-search__title']}>Search</h1>
          </div>
          <MobileSearchField
            value={value}
            placeholder={placeholder}
            onChange={handleChange}
            aria-label='Search messages and files'
          />
        </div>
      }
    >
      {children}
    </MobileTabScreen>
  );
}
