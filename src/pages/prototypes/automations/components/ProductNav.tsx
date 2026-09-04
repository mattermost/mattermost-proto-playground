import FolderOutlineIcon from '@mattermost/compass-icons/components/folder-outline';
import HomeVariantOutlineIcon from '@mattermost/compass-icons/components/home-variant-outline';
import IframeListOutlineIcon from '@mattermost/compass-icons/components/iframe-list-outline';
import LightningBoltOutlineIcon from '@mattermost/compass-icons/components/lightning-bolt-outline';
import PlayOutlineIcon from '@mattermost/compass-icons/components/play-outline';
import { ChannelSidebarItem } from '@mattermost/compass-ui/components/channel-sidebar-item';
import { ChannelsSidebarCategory } from '@mattermost/compass-ui/components/channels-sidebar';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { Scrollbar } from '@mattermost/compass-ui/components/scrollbar';
import { useMemo, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAutomations } from '../context/AutomationsContext';
import CodeBracesIcon from './icons/CodeBracesIcon';
import styles from './ProductNav.module.scss';

const BASE = '/prototypes/automations';

function ProductNavItem({
  name,
  glyph,
  active,
  onClick,
}: {
  name: string;
  glyph: ReactNode;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <div className={styles['product-nav__item']}>
      <span className={styles['product-nav__item-icon']} aria-hidden>
        <Icon size="16" glyph={glyph} />
      </span>
      <ChannelSidebarItem
        name={name}
        leadingVisual="insights"
        active={active}
        onClick={onClick}
      />
    </div>
  );
}

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
          <ProductNavItem
            name="Home"
            glyph={<HomeVariantOutlineIcon />}
            active={homeActive}
            onClick={() => navigate(BASE)}
          />
          <ProductNavItem
            name="Folders"
            glyph={<FolderOutlineIcon />}
            active={foldersActive}
            onClick={() => navigate(`${BASE}/folders`)}
          />
          <ProductNavItem
            name="Templates"
            glyph={<IframeListOutlineIcon />}
            active={templatesActive}
            onClick={() => navigate(`${BASE}/templates`)}
          />
          <ProductNavItem
            name="Variables & secrets"
            glyph={<CodeBracesIcon />}
            active={secretsActive}
            onClick={() => navigate(`${BASE}/secrets`)}
          />
          <ProductNavItem
            name="Run history"
            glyph={<PlayOutlineIcon />}
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
              <ProductNavItem
                key={a.id}
                name={a.name}
                glyph={<LightningBoltOutlineIcon />}
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
              <ProductNavItem
                key={a.id}
                name={a.name}
                glyph={<LightningBoltOutlineIcon />}
                onClick={() => navigate(`${BASE}/${a.id}/editor`)}
              />
            ))
          )}
        </div>
      </Scrollbar>
    </div>
  );
}
