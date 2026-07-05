import { Tags, ShortcutTag } from '@mattermost/compass-ui';
import styles from '@/styles/library-demo/components.module.scss';

export default function TagsLibrary() {
  return (
    <>
      <div className={styles['components__button-block']}>
        <div className={styles['components__button-row']}>
          <span className={styles['components__instance-label']}>Types</span>
          <Tags type="General">General</Tags>
          <Tags type="Info">Info</Tags>
          <Tags type="Danger">Danger</Tags>
          <Tags type="Success">Success</Tags>
          <Tags type="Warning">Warning</Tags>
          <Tags type="Info Dim">Info Dim</Tags>
        </div>
        <div className={styles['components__button-row']}>
          <span className={styles['components__instance-label']}>Sizes</span>
          <Tags size="X-Small" type="Info">
            X-Small
          </Tags>
          <Tags size="Small" type="Info">
            Small
          </Tags>
        </div>
        <div className={styles['components__button-row']}>
          <span className={styles['components__instance-label']}>All caps</span>
          <Tags type="General" casing="All Caps">
            professional
          </Tags>
          <Tags type="Success" casing="All Caps">
            active
          </Tags>
        </div>
      </div>
      <div className={styles['components__button-block']}>
        <div className={styles['components__button-row']}>
          <span className={styles['components__instance-label']}>
            Shortcut · Default
          </span>
          <ShortcutTag label="⌘" size="Small" />
          <ShortcutTag label="⌘" size="Medium" />
          <ShortcutTag label="⌘" size="Large" />
          <ShortcutTag label="Shift" size="Small" />
          <ShortcutTag label="K" size="Small" />
        </div>
        <div
          className={styles['components__button-row']}
          style={{
            padding: '0.75rem',
            borderRadius: 'var(--radius-s)',
            background: 'var(--color-neutral-1100, #1b1d22)',
          }}
        >
          <span
            className={styles['components__instance-label']}
            style={{ color: 'var(--color-neutral-0)' }}
          >
            Shortcut · Tooltips
          </span>
          <ShortcutTag label="⌘" location="Tooltips" size="Small" />
          <ShortcutTag label="⌘" location="Tooltips" size="Medium" />
          <ShortcutTag label="⌘" location="Tooltips" size="Large" />
        </div>
      </div>
    </>
  );
}
