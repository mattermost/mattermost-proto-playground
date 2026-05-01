import { Outlet, useLocation, useMatch, useNavigate } from 'react-router-dom';
import ArrowLeftIcon from '@mattermost/compass-icons/components/arrow-left';
import IconButton from '@/components/ui/IconButton/IconButton';
import Icon from '@/components/ui/Icon/Icon';
import ThemePicker from '@/components/layout/ThemePicker/ThemePicker';
import styles from './AppShell.module.scss';

function parentPath(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length <= 1) return '/';
  return '/' + segments[0];
}

function isDocsPathname(pathname: string): boolean {
  return pathname.startsWith('/library') || pathname.startsWith('/guidelines');
}

export default function AppShell() {
  const isHome = useMatch('/');
  const isEmbedded = window.self !== window.top;
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const isDocs = isDocsPathname(pathname);

  return (
    <div className={styles['app-shell']}>
      {!isEmbedded && !isDocs && (
        <div className={styles['app-shell__bar']}>
          {!isHome ? (
            <IconButton
              aria-label="Back"
              icon={<Icon glyph={<ArrowLeftIcon />} size="20" />}
              onClick={() => navigate(parentPath(pathname))}
            />
          ) : (
            <div />
          )}
          <ThemePicker />
        </div>
      )}
      {!isEmbedded && isDocs && (
        <ThemePicker className={styles['app-shell__floating-theme']} />
      )}
      <div className={styles['app-shell__content']}>
        <Outlet />
      </div>
    </div>
  );
}
