import { MenuItem } from '@mattermost/compass-ui';
import styles from '@/styles/library-demo/components.module.scss';

export default function MenuItemLibrary() {
  return (
    <>
      <div className={styles['components__button-block']}>
        <div className={styles['components__button-row']}>
          <span className={styles['components__instance-label']}>Default</span>
          <div className={styles['components__menu-demo']}>
            <MenuItem label="Menu Item" />
            <MenuItem label="With trailing check" trailingElement />
            <MenuItem label="No leading visual" leadingElement={false} />
          </div>
        </div>
        <div className={styles['components__button-row']}>
          <span className={styles['components__instance-label']}>
            Secondary label
          </span>
          <div className={styles['components__menu-demo']}>
            <MenuItem
              label="Menu Item"
              secondaryLabel="Descriptive text below"
            />
            <MenuItem
              label="Menu Item"
              secondaryLabel="Inline text"
              secondaryLabelPosition="Inline"
            />
          </div>
        </div>
        <div className={styles['components__button-row']}>
          <span className={styles['components__instance-label']}>
            Badges & tag
          </span>
          <div className={styles['components__menu-demo']}>
            <MenuItem label="New feature" tag />
            <MenuItem label="Mentions" mentionCount={3} />
            <MenuItem label="Custom status" customStatusEmoji="🏄" />
          </div>
        </div>
        <div className={styles['components__button-row']}>
          <span className={styles['components__instance-label']}>
            Destructive
          </span>
          <div className={styles['components__menu-demo']}>
            <MenuItem label="Delete item" destructive />
            <MenuItem label="Delete item" destructive trailingElement />
          </div>
        </div>
        <div className={styles['components__button-row']}>
          <span className={styles['components__instance-label']}>Disabled</span>
          <div className={styles['components__menu-demo']}>
            <MenuItem label="Menu Item" disabled />
            <MenuItem label="With badge" disabled mentionCount={2} />
            <MenuItem label="Destructive" destructive disabled />
          </div>
        </div>
      </div>
    </>
  );
}
