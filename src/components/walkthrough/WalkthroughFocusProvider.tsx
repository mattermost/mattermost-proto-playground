import { useEffect, type ReactNode } from 'react';

import {
  readWalkthroughFocus,
  WALKTHROUGH_FOCUS_LABELS,
} from './walkthroughFocus';
import styles from './WalkthroughFocus.module.scss';

export default function WalkthroughFocusProvider({
  children,
}: {
  children: ReactNode;
}) {
  const focus = readWalkthroughFocus();
  const label = focus != null ? WALKTHROUGH_FOCUS_LABELS[focus] : null;

  useEffect(() => {
    if (focus == null) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      const target = document.querySelector<HTMLElement>(
        `[data-tour-focus="${focus}"]`,
      );
      if (target == null) {
        return;
      }
      target.setAttribute('data-tour-highlight', 'true');
      target.scrollIntoView({ block: 'center', behavior: 'instant' });
    }, 80);

    return () => {
      window.clearTimeout(timer);
      document
        .querySelectorAll<HTMLElement>('[data-tour-highlight="true"]')
        .forEach((node) => node.removeAttribute('data-tour-highlight'));
    };
  }, [focus]);

  return (
    <>
      {label != null && (
        <div className={styles['wf-banner']} role="note">
          {label}
        </div>
      )}
      {children}
    </>
  );
}
