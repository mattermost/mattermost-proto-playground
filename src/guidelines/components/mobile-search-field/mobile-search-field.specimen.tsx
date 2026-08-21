import {useState, type ChangeEvent} from 'react';
import { MobileSearchField } from '@mattermost/compass-proto';
import styles from '@/styles/library-demo/components.module.scss';

export default function MobileSearchFieldLibrary() {
  const [query, setQuery] = useState('');
  const [find, setFind] = useState('');

  return (
    <>
      <div className={styles['components__button-block']}>
        <div className={styles['components__button-row']}>
          <span className={styles['components__instance-label']}>
            Search tab
          </span>
          <div
            style={{
              width: '100%',
              maxWidth: 360,
              padding: 16,
              background: 'var(--sidebar-bg)',
              borderRadius: 8,
            }}
          >
            <MobileSearchField
              value={query}
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                setQuery(event.target.value)
              }
              placeholder='Search messages & files'
            />
          </div>
        </div>
        <div className={styles['components__button-row']}>
          <span className={styles['components__instance-label']}>
            Find channels (Home)
          </span>
          <div
            style={{
              width: '100%',
              maxWidth: 360,
              padding: 16,
              background: 'var(--sidebar-bg)',
              borderRadius: 8,
            }}
          >
            <MobileSearchField
              value={find}
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                setFind(event.target.value)
              }
              placeholder='Find channels…'
            />
          </div>
        </div>
      </div>
    </>
  );
}
