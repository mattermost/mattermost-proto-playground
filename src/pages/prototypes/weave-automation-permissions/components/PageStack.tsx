import { useEffect, useRef, useState, type ReactNode } from 'react';
import styles from './PageStack.module.scss';

// --duration-moderate is 300ms; keep in sync if that token changes.
const TRANSITION_MS = 300;

interface PageStackProps {
  /** The parent page. Stays mounted underneath, so its scroll position survives. */
  base: ReactNode;
  /** The child page, or null to show only the parent. */
  child: ReactNode | null;
}

/**
 * Parent → child page transition: the child fades in while sliding a short
 * distance from the right as the parent fades out, and both reverse on the way
 * back.
 */
export default function PageStack({ base, child }: PageStackProps) {
  const open = child !== null;
  const [mounted, setMounted] = useState(open);
  const [visible, setVisible] = useState(false);
  // The child leaves with the content it last had, even after the page state
  // that produced it is gone.
  const lastChild = useRef<ReactNode>(child);
  if (child !== null) lastChild.current = child;

  useEffect(() => {
    if (open) {
      setMounted(true);
      let raf2 = 0;
      const raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(() => setVisible(true));
      });
      return () => {
        cancelAnimationFrame(raf1);
        if (raf2) cancelAnimationFrame(raf2);
      };
    }
    setVisible(false);
    const t = window.setTimeout(() => setMounted(false), TRANSITION_MS);
    return () => window.clearTimeout(t);
  }, [open]);

  return (
    <div className={styles['page-stack']}>
      <div
        className={[
          styles['page-stack__layer'],
          styles['page-stack__layer--base'],
          visible ? styles['page-stack__layer--covered'] : '',
        ].join(' ')}
        inert={visible}
      >
        {base}
      </div>
      {mounted ? (
        <div
          className={[
            styles['page-stack__layer'],
            styles['page-stack__layer--child'],
            visible ? styles['page-stack__layer--visible'] : '',
          ].join(' ')}
          inert={!visible}
        >
          {child ?? lastChild.current}
        </div>
      ) : null}
    </div>
  );
}
