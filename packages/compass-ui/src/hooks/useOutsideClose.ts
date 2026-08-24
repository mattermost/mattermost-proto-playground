import { useEffect } from 'react';
import type { RefObject } from 'react';

type MaybeRef = RefObject<HTMLElement | null>;

/**
 * Closes a dropdown or popover when the user mousedowns outside the container(s).
 * Listeners attach only while `open` is true.
 *
 * Pass `portalRef` when the popup is portaled outside `ref` so menu clicks
 * still count as inside.
 *
 * @param ref - Primary container (e.g. field root).
 * @param open - When true, the listener is active.
 * @param onClose - Called when a mousedown lands outside all containers.
 * @param portalRef - Optional portaled surface to treat as inside.
 */
export function useOutsideClose(
  ref: MaybeRef,
  open: boolean,
  onClose: () => void,
  portalRef?: MaybeRef,
): void {
  useEffect(() => {
    if (!open) return;
    function handle(e: MouseEvent) {
      const target = e.target as Node;
      if (ref.current?.contains(target)) return;
      if (portalRef?.current?.contains(target)) return;
      onClose();
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [ref, portalRef, open, onClose]);
}
