import type { ReactNode } from 'react';
import ProductsIcon from '@mattermost/compass-icons/components/products';
import ApplicationCogIcon from '@mattermost/compass-icons/components/application-cog';
import UserAvatar from '@/components/ui/UserAvatar/UserAvatar';
import avatarLeonard from '@/assets/avatars/Leonard Riley.png';
import styles from './AppShellAM.module.scss';

export interface AppShellAMProps {
  /** Product label shown in the top bar. */
  productLabel?: string;
  /** Page body. */
  children: ReactNode;
}

/**
 * Agents-style product-switcher shell.
 * Top bar = product-switcher glyph (⊞) + product mark (✦) + product label,
 * with a session avatar at the trailing edge.
 *
 * Intentionally has NO System Console sidebar.
 */
export default function AppShellAM({
  productLabel = 'Attribute Management',
  children,
}: AppShellAMProps) {
  return (
    <div className={styles['shell']}>
      <header className={styles['shell__topbar']}>
        <div className={styles['shell__brand']}>
          <button
            type="button"
            className={styles['shell__icon-btn']}
            aria-label="Product switcher"
          >
            <ProductsIcon size={20} />
          </button>
          <span className={styles['shell__product-mark']} aria-hidden>
            <ApplicationCogIcon size={20} />
          </span>
          <span className={styles['shell__product-label']}>{productLabel}</span>
        </div>
        <div className={styles['shell__session']}>
          <button
            type="button"
            className={styles['shell__avatar-btn']}
            aria-label="Account menu"
          >
            <UserAvatar src={avatarLeonard} alt="Leonard Riley" size="24" status />
          </button>
        </div>
      </header>
      <main className={styles['shell__body']}>{children}</main>
    </div>
  );
}
