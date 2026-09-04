import { ChannelSidebarItem } from '@mattermost/compass-ui/components/channel-sidebar-item';
import { ChannelsSidebarCategory } from '@mattermost/compass-ui/components/channels-sidebar';
import { Scrollbar } from '@mattermost/compass-ui/components/scrollbar';
import { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAutomations } from '../context/AutomationsContext';
import styles from './ProductNav.module.scss';

const BASE = '/prototypes/automations';

/**
 * Automations left nav using Channels sidebar categories and items.
 * Global product scope — no team switcher in the header.
 */
export default function ProductNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { automations, favoriteIds, recentIds, demoEmpty } = useAutomations();

  const favorites = useMemo(
    () =>
      demoEmpty
        ? []
        : favoriteIds
            .map((id) => automations.find((a) => a.id === id))
            .filter((a): a is NonNullable<typeof a> => Boolean(a)),
    [automations, demoEmpty, favoriteIds],
  );

  const recents = useMemo(
    () =>
      demoEmpty
        ? []
        : recentIds
            .map((id) => automations.find((a) => a.id === id))
            .filter((a): a is NonNullable<typeof a> => Boolean(a))
            .slice(0, 10),
    [automations, demoEmpty, recentIds],
  );

  const homeActive = pathname === BASE || pathname === `${BASE}/`;
  const foldersActive = pathname.startsWith(`${BASE}/folders`);
  const templatesActive = pathname.startsWith(`${BASE}/templates`);
  const secretsActive = pathname.startsWith(`${BASE}/secrets`);
  const runsActive =
    pathname === `${BASE}/runs`
    || pathname.startsWith(`${BASE}/runs/`)
    || /\/runs(\/|$)/.test(pathname);

  return (
    <div className={styles['product-nav']}>
      <Scrollbar className={styles['product-nav__scroll']}>
        <div className={styles['product-nav__top']}>
          <ChannelSidebarItem
            name="Home"
            hideLeadingVisual
            active={homeActive}
            onClick={() => navigate(BASE)}
          />
          <ChannelSidebarItem
            name="Folders"
            hideLeadingVisual
            active={foldersActive}
            onClick={() => navigate(`${BASE}/folders`)}
          />
          <ChannelSidebarItem
            name="Templates"
            hideLeadingVisual
            active={templatesActive}
            onClick={() => navigate(`${BASE}/templates`)}
          />
          <ChannelSidebarItem
            name="Variables & secrets"
            hideLeadingVisual
            active={secretsActive}
            onClick={() => navigate(`${BASE}/secrets`)}
          />
          <ChannelSidebarItem
            name="Run history"
            hideLeadingVisual
            active={runsActive}
            onClick={() => navigate(`${BASE}/runs`)}
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
                hideLeadingVisual
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
                hideLeadingVisual
                onClick={() => navigate(`${BASE}/${a.id}/editor`)}
              />
            ))
          )}
        </div>
      </Scrollbar>
    </div>
  );
}
