import { useState, type ReactNode } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import TopNav from '@/components/layout/TopNav/TopNav';
import PrototypeTopNav from '@/components/layout/PrototypeTopNav/PrototypeTopNav';
import QuickSwitcher from '@/components/layout/QuickSwitcher';
import { PrototypeChromeProvider } from '@/contexts/PrototypeChromeContext';
import { PrototypesNavProvider } from '@/contexts/PrototypesNavContext';
import { getPrototypeByPath } from '@/manifests/prototypes';
import styles from './AppShell.module.scss';

export default function AppShell() {
  const isEmbedded = window.self !== window.top;
  const { pathname } = useLocation();
  const prototypeEntry = getPrototypeByPath(pathname);
  const isPrototypesArea =
    pathname === '/prototypes' || pathname.startsWith('/prototypes/');
  const [prototypeCenterSlot, setPrototypeCenterSlot] = useState<ReactNode>(null);
  const [quickSwitcherOpen, setQuickSwitcherOpen] = useState(false);

  return (
    <PrototypesNavProvider>
      <div className={styles['app-shell']}>
        {!isEmbedded && prototypeEntry && (
          <PrototypeTopNav
            title={prototypeEntry.label}
            centerSlot={prototypeCenterSlot}
          />
        )}
        {!isEmbedded && !prototypeEntry && (
          <TopNav onOpenQuickSwitcher={() => setQuickSwitcherOpen(true)} />
        )}
        {!isEmbedded && (
          <QuickSwitcher
            open={quickSwitcherOpen}
            onOpenChange={setQuickSwitcherOpen}
            // Prototypes layout owns ⌘K with a prototypes-only switcher.
            enableKeyboardShortcut={!isPrototypesArea}
          />
        )}
        <div className={styles['app-shell__content']}>
          <PrototypeChromeProvider setCenterSlot={setPrototypeCenterSlot}>
            <Outlet />
          </PrototypeChromeProvider>
        </div>
      </div>
    </PrototypesNavProvider>
  );
}
