import { useEffect } from 'react';
import type { RefObject } from 'react';

/**
 * Closes a dropdown or popover when the user mousedowns outside the container.
 * Listeners attach only while `open` is true.
 *
 * @param ref - Container element to consider "inside".
 * @param open - When true, the listener is active.
 * @param onClose - Called when a mousedown lands outside the container.
 */
export function useOutsideClose(
  ref: RefObject<HTMLElement | null>,
  open: boolean,
  onClose: () => void,
): void {
  useEffect(() => {
    if (!open) return;
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [ref, open, onClose]);
}
