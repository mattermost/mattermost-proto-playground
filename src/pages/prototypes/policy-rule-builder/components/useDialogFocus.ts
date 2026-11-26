// [AI DRAFT] Host-side dialog focus for Compass Modal, which is visual chrome
// only (AGENTS.md "Overlay wiring"): move focus in on open, close on Escape,
// keep Tab inside, and return focus to the opener on close (cycle 1, QA-15).
import { useEffect, type RefObject } from 'react';

const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';

export function useDialogFocus(ref: RefObject<HTMLElement | null>, onClose: () => void) {
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    const root = ref.current;
    // Land on the title, so the dialog is announced by name and the close X
    // isn't the first thing ringed; Tab then moves into the controls.
    const title = root?.querySelector<HTMLElement>('h1, h2');
    if (title) {
      title.tabIndex = -1;
      title.style.outline = 'none';
      title.focus({ preventScroll: true });
    } else {
      root?.querySelector<HTMLElement>(FOCUSABLE)?.focus({ preventScroll: true });
    }
    const onKey = (e: KeyboardEvent) => {
      if (!root) return;
      if (e.key === 'Escape') {
        // An open Select or Combobox handles its own Escape (cycle 3, QA3-2).
        if (root.querySelector('[aria-expanded="true"]') || document.querySelector('[role="listbox"]')) {
          return;
        }
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== 'Tab') return;
      const items = Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (items.length === 0) return;
      const i = items.indexOf(document.activeElement as HTMLElement);
      if (e.shiftKey && i <= 0) {
        e.preventDefault();
        items[items.length - 1].focus();
      } else if (!e.shiftKey && i === items.length - 1) {
        e.preventDefault();
        items[0].focus();
      }
    };
    root?.addEventListener('keydown', onKey);
    return () => {
      root?.removeEventListener('keydown', onKey);
      opener?.focus?.({ preventScroll: true });
    };
  }, [ref, onClose]);
}
