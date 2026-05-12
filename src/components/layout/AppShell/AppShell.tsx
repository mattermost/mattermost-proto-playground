import { Outlet } from 'react-router-dom';
import TopNav from '@/components/layout/TopNav/TopNav';
import Scrollbars from '@/components/ui/Scrollbars/Scrollbars';
import styles from './AppShell.module.scss';

export default function AppShell() {
  const isEmbedded = window.self !== window.top;

  return (
    <div className={styles['app-shell']}>
      {!isEmbedded && <TopNav />}
      <div className={styles['app-shell__content']}>
        <Scrollbars>
          <div className={styles['app-shell__content-inner']}>
            <Outlet />
          </div>
        </Scrollbars>
      </div>
    </div>
  );
}
