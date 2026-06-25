import { Scrollbar } from '@mattermost/compass-ui';
import { Scrollbars } from '@mattermost/compass-ui';
import styles from '@/styles/library-demo/components.module.scss';

export default function ScrollbarLibrary() {
  const lipsum = Array.from({ length: 24 }, (_, i) => i + 1);

  return (
    <>
      <div className={styles['components__button-block']}>
        <div className={styles['components__button-row']}>
          <span className={styles['components__instance-label']}>Vertical</span>
          <div
            style={{
              height: 160,
              display: 'flex',
              alignItems: 'stretch',
              gap: 'var(--spacing-m)',
            }}
          >
            <Scrollbar
              orientation="Vertical"
              thumbSize="25%"
              scrollPosition={0}
            />
            <Scrollbar
              orientation="Vertical"
              thumbSize="33%"
              scrollPosition={50}
            />
            <Scrollbar
              orientation="Vertical"
              thumbSize="50%"
              scrollPosition={100}
            />
          </div>
        </div>
        <div className={styles['components__button-row']}>
          <span className={styles['components__instance-label']}>
            Horizontal
          </span>
          <Scrollbar
            orientation="Horizontal"
            thumbSize="25%"
            scrollPosition={0}
          />
          <Scrollbar
            orientation="Horizontal"
            thumbSize="50%"
            scrollPosition={50}
          />
        </div>

        <div className={styles['components__button-row']}>
          <span className={styles['components__instance-label']}>
            Live overlay
          </span>
          <div
            style={{
              width: 280,
              height: 200,
              border:
                '1px solid rgba(var(--center-channel-color-rgb), 0.16)',
              borderRadius: 'var(--radius-s)',
              background: 'var(--center-channel-bg)',
            }}
          >
            <Scrollbars>
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
                {lipsum.map((n) => (
                  <li key={n}>Item {n}</li>
                ))}
              </ul>
            </Scrollbars>
          </div>
        </div>
      </div>
    </>
  );
}
