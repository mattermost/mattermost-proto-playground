import { useEffect, type RefObject } from 'react';

/**
 * Closes a portaled popover when the user mousedowns outside all anchor surfaces.
 */
export function usePopoverDismiss(
  open: boolean,
  onClose: () => void,
  surfaces: RefObject<HTMLElement | null>[],
): void {
  useEffect(() => {
    if (!open) return;
    function handleMouseDown(event: MouseEvent) {
      const target = event.target as Node;
      if (surfaces.some((ref) => ref.current?.contains(target))) return;
      onClose();
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose, surfaces]);
}
