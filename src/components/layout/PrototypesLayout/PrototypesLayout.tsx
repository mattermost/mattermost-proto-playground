import { useMemo, useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import MagnifyIcon from '@mattermost/compass-icons/components/magnify';
import { ShortcutTagGroup } from '@mattermost/compass-ui';
import QuickSwitcher from '@/components/layout/QuickSwitcher';
import PrototypesSidebar from '@/components/layout/PrototypesSidebar/PrototypesSidebar';
import { buildPrototypeSwitcherDestinations } from '@/components/layout/PrototypesSwitcher/prototypeSwitcherDestinations';
import { usePrototypesNav } from '@/contexts/PrototypesNavContext';
import styles from './PrototypesLayout.module.scss';

function useIsMac() {
  return useMemo(
    () =>
      typeof navigator !== 'undefined' &&
      /Mac|iPhone|iPod|iPad/i.test(navigator.platform),
    [],
  );
}

function PrototypesLayoutInner() {
  const { open } = usePrototypesNav();
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const isMac = useIsMac();
  const destinations = useMemo(() => buildPrototypeSwitcherDestinations(), []);
  const shortcutLabels = isMac ? ['⌘', 'K'] : ['Ctrl', 'K'];

  return (
    <div
      className={[
        styles['prototypes-layout'],
        open ? '' : styles['prototypes-layout--collapsed'],
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {open && (
        <aside
          id="prototypes-tree-panel"
          className={styles['prototypes-layout__rail']}
          aria-label="Prototypes"
        >
          <div className={styles['prototypes-layout__rail-bar']}>
            <Link
              to="/prototypes"
              className={styles['prototypes-layout__rail-title']}
            >
              Prototypes
            </Link>
          </div>

          <div className={styles['prototypes-layout__find']}>
            <button
              type="button"
              className={styles['prototypes-layout__find-btn']}
              aria-label="Find prototypes"
              aria-keyshortcuts="Control+K Meta+K"
              onClick={() => setSwitcherOpen(true)}
            >
              <span
                className={styles['prototypes-layout__find-icon']}
                aria-hidden
              >
                <MagnifyIcon size={16} />
              </span>
              <span className={styles['prototypes-layout__find-label']}>
                Find prototypes
              </span>
              <ShortcutTagGroup
                className={styles['prototypes-layout__find-shortcut']}
                labels={shortcutLabels}
                size="Small"
              />
            </button>
          </div>

          <div className={styles['prototypes-layout__rail-body']}>
            <PrototypesSidebar />
          </div>
        </aside>
      )}

      <div className={styles['prototypes-layout__content']}>
        <Outlet />
      </div>

      <QuickSwitcher
        open={switcherOpen}
        onOpenChange={setSwitcherOpen}
        destinations={destinations}
        placeholder="Find prototypes…"
        dialogLabel="Find prototypes"
        emptyLabel="No matching prototypes"
        listLabel="Prototypes"
        enableKeyboardShortcut
      />
    </div>
  );
}

/** Docked, collapsible prototypes tree; content fills the remaining width. */
export default function PrototypesLayout() {
  return <PrototypesLayoutInner />;
}
