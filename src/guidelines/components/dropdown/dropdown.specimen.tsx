import { Dropdown } from '@mattermost/compass-ui';
import styles from '@/styles/library-demo/components.module.scss';

export default function DropdownLibrary() {
  return (
    <>
      <div className={styles['components__button-block']}>
        <div className={styles['components__button-row']}>
          <span className={styles['components__instance-label']}>Sizes</span>
          <Dropdown size="X-Small">X-Small</Dropdown>
          <Dropdown size="Small">Small</Dropdown>
          <Dropdown size="Medium">Medium</Dropdown>
          <Dropdown size="Large">Large</Dropdown>
          <Dropdown size="X-Large">X-Large</Dropdown>
        </div>
        <div className={styles['components__button-row']}>
          <span className={styles['components__instance-label']}>Padding</span>
          <Dropdown size="Medium">Tight</Dropdown>
          <Dropdown size="Medium" padding="Compact">
            Compact
          </Dropdown>
        </div>
        <div className={styles['components__button-row']}>
          <span className={styles['components__instance-label']}>States</span>
          <Dropdown>Default</Dropdown>
          <Dropdown isOpen>Open</Dropdown>
          <Dropdown disabled>Disabled</Dropdown>
        </div>
        <div
          className={[
            styles['components__button-row'],
            styles['components__button-row--inverted-bg'],
          ].join(' ')}
        >
          <span className={styles['components__instance-label']}>Inverted</span>
          <Dropdown appearance="Inverted">Inverted</Dropdown>
        </div>
      </div>
    </>
  );
}
