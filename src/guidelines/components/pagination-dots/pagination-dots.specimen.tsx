import { PaginationDots } from '@mattermost/compass-ui';
import styles from '@/styles/library-demo/components.module.scss';

export default function PaginationDotsLibrary() {
  return (
    <>
      <div className={styles['components__button-block']}>
        <div className={styles['components__button-row']}>
          <span className={styles['components__instance-label']}>
            Horizontal
          </span>
          <PaginationDots pages={5} activePage={2} orientation="Horizontal" />
        </div>
        <div className={styles['components__button-row']}>
          <span className={styles['components__instance-label']}>Vertical</span>
          <PaginationDots pages={4} activePage={1} orientation="Vertical" />
        </div>
        <div
          className={[
            styles['components__button-row'],
            styles['components__button-row--inverted-bg'],
          ].join(' ')}
        >
          <span className={styles['components__instance-label']}>Inverted</span>
          <PaginationDots pages={5} activePage={3} dotStyle="Inverted" />
        </div>
        <div className={styles['components__button-row']}>
          <span className={styles['components__instance-label']}>
            On primary (info)
          </span>
          <span className={styles['components__on-primary-dots']}>
            <PaginationDots pages={5} activePage={2} dotStyle="OnPrimary" />
          </span>
        </div>
      </div>
    </>
  );
}
