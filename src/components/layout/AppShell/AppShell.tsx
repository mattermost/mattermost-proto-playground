import { useEffect, useState, type ReactNode } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import TopNav from '@/components/layout/TopNav/TopNav';
import PrototypeTopNav from '@/components/layout/PrototypeTopNav/PrototypeTopNav';
import QuickSwitcher from '@/components/layout/QuickSwitcher';
import { PrototypeChromeProvider } from '@/contexts/PrototypeChromeContext';
import { getPrototypeByPath } from '@/manifests/prototypes';
import {
  WalkthroughLayout,
  WalkthroughModeControl,
  WalkthroughProvider,
  useWalkthrough,
} from '@/walkthrough';
import styles from './AppShell.module.scss';

function PrototypeChrome() {
  const { pathname } = useLocation();
  const prototypeEntry = getPrototypeByPath(pathname);
  const { document, active } = useWalkthrough();
  const [prototypeCenterSlot, setPrototypeCenterSlot] = useState<ReactNode>(null);
  const [quickSwitcherOpen, setQuickSwitcherOpen] = useState(false);
  const isEmbedded = window.self !== window.top;

  useEffect(() => {
    setPrototypeCenterSlot(null);
  }, [pathname]);

  const title =
    active && document
      ? `${document.title} · Walkthrough`
      : (prototypeEntry?.label ?? '');

  return (
    <>
      {!isEmbedded && prototypeEntry && (
        <PrototypeTopNav
          title={title}
          centerSlot={active ? null : prototypeCenterSlot}
          endSlot={<WalkthroughModeControl />}
        />
      )}
      {!isEmbedded && !prototypeEntry && (
        <TopNav onOpenQuickSwitcher={() => setQuickSwitcherOpen(true)} />
      )}
      {!isEmbedded && (
        <QuickSwitcher open={quickSwitcherOpen} onOpenChange={setQuickSwitcherOpen} />
      )}
      <div className={styles['app-shell__content']}>
        <PrototypeChromeProvider setCenterSlot={setPrototypeCenterSlot}>
          <WalkthroughLayout>
            <Outlet />
          </WalkthroughLayout>
        </PrototypeChromeProvider>
      </div>
    </>
  );
}

export default function AppShell() {
  return (
    <div className={styles['app-shell']}>
      <WalkthroughProvider>
        <PrototypeChrome />
      </WalkthroughProvider>
    </div>
  );
}
