import HomeVariantOutlineIcon from '@mattermost/compass-icons/components/home-variant-outline';
import LightningBoltOutlineIcon from '@mattermost/compass-icons/components/lightning-bolt-outline';
import { Icon, Scrollbar } from '@mattermost/compass-ui';
import { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAutomations } from '../context/AutomationsContext';
import styles from './ProductNav.module.scss';

const BASE = '/prototypes/automations';

export default function ProductNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { automations, favoriteIds, recentIds } = useAutomations();

  const favorites = useMemo(
    () =>
      favoriteIds
        .map((id) => automations.find((a) => a.id === id))
        .filter((a): a is NonNullable<typeof a> => Boolean(a)),
    [automations, favoriteIds],
  );

  const recents = useMemo(
    () =>
      recentIds
        .map((id) => automations.find((a) => a.id === id))
        .filter((a): a is NonNullable<typeof a> => Boolean(a))
        .slice(0, 10),
    [automations, recentIds],
  );

  const homeActive = pathname === BASE || pathname === `${BASE}/`;
  const templatesActive = pathname.startsWith(`${BASE}/templates`);

  return (
    <Scrollbar className={styles['product-nav']}>
      <div className={styles['product-nav__links']}>
        <button
          type="button"
          className={[
            styles['product-nav__link'],
            homeActive ? styles['product-nav__link--active'] : '',
          ]
            .filter(Boolean)
            .join(' ')}
          onClick={() => navigate(BASE)}
        >
          <Icon size="16" glyph={<HomeVariantOutlineIcon />} />
          Home
        </button>
        <button
          type="button"
          className={[
            styles['product-nav__link'],
            templatesActive ? styles['product-nav__link--active'] : '',
          ]
            .filter(Boolean)
            .join(' ')}
          onClick={() => navigate(`${BASE}/templates`)}
        >
          <Icon size="16" glyph={<LightningBoltOutlineIcon />} />
          Templates
        </button>
      </div>

      <div className={styles['product-nav__section']}>
        <h3 className={styles['product-nav__section-title']}>Favorites</h3>
        {favorites.length === 0 ? (
          <p className={styles['product-nav__empty']}>No favorites yet</p>
        ) : (
          favorites.map((a) => (
            <button
              key={a.id}
              type="button"
              className={styles['product-nav__item']}
              onClick={() => navigate(`${BASE}/${a.id}/editor`)}
            >
              {a.name}
            </button>
          ))
        )}
      </div>

      <div className={styles['product-nav__section']}>
        <h3 className={styles['product-nav__section-title']}>Recents</h3>
        {recents.length === 0 ? (
          <p className={styles['product-nav__empty']}>No recent automations</p>
        ) : (
          recents.map((a) => (
            <button
              key={a.id}
              type="button"
              className={styles['product-nav__item']}
              onClick={() => navigate(`${BASE}/${a.id}/editor`)}
            >
              {a.name}
            </button>
          ))
        )}
      </div>
    </Scrollbar>
  );
}
