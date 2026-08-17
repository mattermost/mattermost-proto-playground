import { useLayoutEffect, useState, type ReactNode } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import TopNav from '@/components/layout/TopNav/TopNav';
import PrototypeTopNav from '@/components/layout/PrototypeTopNav/PrototypeTopNav';
import { PrototypeChromeProvider } from '@/contexts/PrototypeChromeContext';
import { getPrototypeByPath } from '@/manifests/prototypes';
import styles from './AppShell.module.scss';

export default function AppShell() {
  const isEmbedded = window.self !== window.top;
  const { pathname } = useLocation();
  const prototypeEntry = getPrototypeByPath(pathname);
  const [prototypeCenterSlot, setPrototypeCenterSlot] = useState<ReactNode>(null);

  /* Layout effect, not passive: parent passive effects run AFTER child ones, so a
     passive reset here would clobber the slot a prototype just set on mount. */
  useLayoutEffect(() => {
    setPrototypeCenterSlot(null);
  }, [pathname]);

  return (
    <div className={styles['app-shell']}>
      {!isEmbedded && prototypeEntry && (
        <PrototypeTopNav
          title={prototypeEntry.label}
          centerSlot={prototypeCenterSlot}
        />
      )}
      {!isEmbedded && !prototypeEntry && <TopNav />}
      <div className={styles['app-shell__content']}>
        <PrototypeChromeProvider setCenterSlot={setPrototypeCenterSlot}>
          <Outlet />
        </PrototypeChromeProvider>
      </div>
    </div>
  );
}
