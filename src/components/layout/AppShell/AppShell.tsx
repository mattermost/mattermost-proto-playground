import { Outlet } from 'react-router-dom';
import TopNav from '@/components/layout/TopNav/TopNav';
import styles from './AppShell.module.scss';

export default function AppShell() {
  const isEmbedded = window.self !== window.top;

  return (
    <div className={styles['app-shell']}>
      {!isEmbedded && <TopNav />}
      <div className={styles['app-shell__content']}>
        <Outlet />
      </div>
    </div>
  );
}
