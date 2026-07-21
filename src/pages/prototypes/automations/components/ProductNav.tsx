import IframeListOutlineIcon from '@mattermost/compass-icons/components/iframe-list-outline';
import {
  ChannelSidebarItem,
  ChannelsSidebarCategory,
  ChannelsSidebarHeader,
  Scrollbar,
} from '@mattermost/compass-ui';
import { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAutomations } from '../context/AutomationsContext';
import styles from './ProductNav.module.scss';

const BASE = '/prototypes/automations';

/**
 * Automations left nav using Channels sidebar header, categories, and items.
 */
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
    <div className={styles['product-nav']}>
      <ChannelsSidebarHeader teamName="Automations" />
      <Scrollbar className={styles['product-nav__scroll']}>
        <div className={styles['product-nav__top']}>
          <ChannelSidebarItem
            name="Home"
            leadingVisual="Threads"
            active={homeActive}
            onClick={() => navigate(BASE)}
          />
          <ChannelSidebarItem
            name="Templates"
            leadingIcon={<IframeListOutlineIcon size={16} />}
            active={templatesActive}
            onClick={() => navigate(`${BASE}/templates`)}
          />
        </div>

        <div className={styles['product-nav__group']}>
          <ChannelsSidebarCategory label="Favorites" showChevron />
          {favorites.length === 0 ? (
            <p className={styles['product-nav__empty']}>No favorites yet</p>
          ) : (
            favorites.map((a) => (
              <ChannelSidebarItem
                key={a.id}
                name={a.name}
                leadingVisual="Public"
                onClick={() => navigate(`${BASE}/${a.id}/editor`)}
              />
            ))
          )}
        </div>

        <div className={styles['product-nav__group']}>
          <ChannelsSidebarCategory label="Recents" showChevron />
          {recents.length === 0 ? (
            <p className={styles['product-nav__empty']}>No recent automations</p>
          ) : (
            recents.map((a) => (
              <ChannelSidebarItem
                key={a.id}
                name={a.name}
                leadingVisual="Public"
                onClick={() => navigate(`${BASE}/${a.id}/editor`)}
              />
            ))
          )}
        </div>
      </Scrollbar>
    </div>
  );
}
