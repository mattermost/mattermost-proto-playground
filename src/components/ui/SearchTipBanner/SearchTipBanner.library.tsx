import SearchTipBanner from '@/components/ui/SearchTipBanner/SearchTipBanner';
import styles from '@/pages/Components/Components.module.scss';

export default function SearchTipBannerLibrary() {
  return (
    <>
      <div className={styles['components__button-block']}>
        <div className={styles['components__button-row']}>
          <span className={styles['components__instance-label']}>Default</span>
          <SearchTipBanner onDismiss={() => {}} />
        </div>
        <div className={styles['components__button-row']}>
          <span className={styles['components__instance-label']}>
            Custom keys
          </span>
          <SearchTipBanner
            prefix="Tip: Use"
            suffix="to open quick switcher"
            shortcutKeys={[{ label: '⌘' }, { label: 'K' }]}
            onDismiss={() => {}}
          />
        </div>
      </div>
    </>
  );
}
