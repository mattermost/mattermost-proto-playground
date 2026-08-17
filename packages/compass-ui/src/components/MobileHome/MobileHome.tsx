import type {ReactNode} from 'react';
import styles from './MobileHome.module.scss';

export interface MobileHomeProps {
  /** Left team strip (typically `MobileTeamSidebar`). */
  teamSidebar: ReactNode;
  /** Channel list pane (typically `MobileChannelsSidebar`). */
  channelsSidebar: ReactNode;
  /** Bottom tab bar (typically `MobileTabBar`). */
  tabBar?: ReactNode;
  className?: string;
}

/**
 * Mobile Home tab layout — team strip, channel list, and optional tab bar.
 */
export default function MobileHome({
  teamSidebar,
  channelsSidebar,
  tabBar,
  className = '',
}: MobileHomeProps) {
  const rootClass = [styles['mobile-home'], className].filter(Boolean).join(' ');

  return (
    <div className={rootClass}>
      <div className={styles['mobile-home__body']}>
        {teamSidebar}
        {channelsSidebar}
      </div>
      {tabBar}
    </div>
  );
}
