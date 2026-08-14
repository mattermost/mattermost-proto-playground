import { Scrollbar } from '@mattermost/compass-ui';
import styles from '@/styles/library-demo/components.module.scss';

export default function ScrollbarLibrary() {
  const items = Array.from({ length: 24 }, (_, i) => i + 1);

  return (
    <div className={styles['components__button-block']}>
      <div className={styles['components__button-row']}>
        <span className={styles['components__instance-label']}>Default</span>
        <div
          style={{
            width: 280,
            height: 200,
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
            overflow: 'hidden',
            border: '1px solid rgba(var(--center-channel-color-rgb), 0.16)',
            borderRadius: 'var(--radius-s)',
            background: 'var(--center-channel-bg)',
          }}
        >
          <Scrollbar alwaysVisible>
            <ul
              style={{
                margin: 0,
                padding: 'var(--spacing-s) var(--spacing-m)',
                listStyle: 'none',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--spacing-xs)',
                color: 'var(--center-channel-color)',
                fontSize: 'var(--font-size-100)',
                lineHeight: 'var(--line-height-100)',
              }}
            >
              {items.map((n) => (
                <li key={n}>Item {n}</li>
              ))}
            </ul>
          </Scrollbar>
        </div>
      </div>

      <div className={styles['components__button-row']}>
        <span className={styles['components__instance-label']}>
          Sidebar surface
        </span>
        <div
          style={{
            width: 240,
            height: 180,
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
            overflow: 'hidden',
            borderRadius: 'var(--radius-s)',
            background: 'var(--sidebar-header-bg)',
          }}
        >
          <Scrollbar alwaysVisible color="--sidebar-text-rgb">
            <ul
              style={{
                margin: 0,
                padding: 'var(--spacing-s) var(--spacing-m)',
                listStyle: 'none',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--spacing-xs)',
                color: 'var(--sidebar-text)',
                fontSize: 'var(--font-size-100)',
              }}
            >
              {items.map((n) => (
                <li key={n}>Channel item {n}</li>
              ))}
            </ul>
          </Scrollbar>
        </div>
      </div>
    </div>
  );
}
