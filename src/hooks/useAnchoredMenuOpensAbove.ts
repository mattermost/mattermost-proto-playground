import { useLayoutEffect, useState, type RefObject } from 'react';

const MENU_GAP = 6;

/**
 * Flips an anchored menu above its trigger when it would clip below the
 * modal footer (or clip-root bottom).
 */
export function useAnchoredMenuOpensAbove(
  open: boolean,
  rootRef: RefObject<HTMLElement | null>,
  menuRef: RefObject<HTMLElement | null>,
  clipRootSelector?: string,
): boolean {
  const [above, setAbove] = useState(false);

  useLayoutEffect(() => {
    if (!open || !rootRef.current || !menuRef.current) {
      setAbove(false);
      return;
    }

    const root = rootRef.current;
    const menu = menuRef.current;
    const rootRect = root.getBoundingClientRect();
    const menuHeight = menu.offsetHeight;

    let clipTop = 0;
    let clipBottom = window.innerHeight;

    const clipRoot = clipRootSelector
      ? root.closest(clipRootSelector)
      : root.closest('[role="dialog"]');

    if (clipRoot instanceof HTMLElement) {
      const rect = clipRoot.getBoundingClientRect();
      clipTop = rect.top + MENU_GAP;
      const footer = clipRoot.querySelector('footer');
      clipBottom = footer
        ? footer.getBoundingClientRect().top - MENU_GAP
        : rect.bottom - MENU_GAP;
    }

    const spaceBelow = clipBottom - rootRect.bottom - MENU_GAP;
    const spaceAbove = rootRect.top - clipTop - MENU_GAP;
    setAbove(spaceBelow < menuHeight && spaceAbove > spaceBelow);
  }, [open, rootRef, menuRef, clipRootSelector]);

  return above;
}
