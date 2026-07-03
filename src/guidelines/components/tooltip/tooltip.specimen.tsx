import { Tooltip } from '@mattermost/compass-ui';
import styles from '@/styles/library-demo/components.module.scss';

export default function TooltipLibrary() {
  return (
    <>
      <div className={styles['components__button-block']}>
        <div className={styles['components__button-row']}>
          <span className={styles['components__instance-label']}>Arrows</span>
          <Tooltip label="Top arrow" arrow="Top" />
          <Tooltip label="Right arrow" arrow="Right" />
          <Tooltip label="Bottom arrow" arrow="Bottom" />
          <Tooltip label="Left arrow" arrow="Left" />
        </div>
        <div className={styles['components__button-row']}>
          <span className={styles['components__instance-label']}>
            With shortcut & hint
          </span>
          <Tooltip
            label="Bold"
            arrow="Bottom"
            shortcutKeys={[{ label: '⌘' }, { label: 'B' }]}
          />
          <Tooltip
            label="Open quick switcher"
            arrow="Right"
            hint="Jump to any channel or direct message"
            shortcutKeys={[{ label: '⌘' }, { label: 'K' }]}
          />
        </div>
      </div>
    </>
  );
}
