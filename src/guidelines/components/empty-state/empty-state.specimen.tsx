import { EmptyState } from '@mattermost/compass-ui';
import SearchIllustration from '@/assets/illustrations/search.svg?react';
import styles from '@/styles/library-demo/components.module.scss';

export default function EmptyStateLibrary() {
  return (
    <>
      <div className={styles['components__button-block']}>
        <div className={styles['components__button-row']}>
          <span className={styles['components__instance-label']}>
            With illustration
          </span>
          <EmptyState
            illustration={{
              'aria-label': 'Search',
              width: '120px',
              height: '80px',
              children: <SearchIllustration />,
            }}
            title="No results found"
            description="Try adjusting your search or filters to find what you're looking for."
            action={{ children: 'Clear filters' }}
          />
        </div>
        <div className={styles['components__button-row']}>
          <span className={styles['components__instance-label']}>
            Text only
          </span>
          <EmptyState
            title="No messages yet"
            description="Be the first to start the conversation."
          />
        </div>
      </div>
    </>
  );
}
