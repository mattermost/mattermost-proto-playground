import { SearchInput } from '@mattermost/compass-ui';
import styles from '@/styles/library-demo/components.module.scss';

export default function SearchInputLibrary() {
  return (
    <>
      <div className={styles['components__button-block']}>
        <div className={styles['components__button-row']}>
          <span className={styles['components__instance-label']}>Sizes</span>
          <SearchInput size="Small" placeholder="Small search..." />
          <SearchInput size="Medium" placeholder="Medium search..." />
          <SearchInput size="Large" placeholder="Large search..." />
        </div>
        <div className={styles['components__button-row']}>
          <span className={styles['components__instance-label']}>
            With label
          </span>
          <SearchInput
            label="Search channels"
            placeholder="Find a channel..."
          />
        </div>
      </div>
    </>
  );
}
