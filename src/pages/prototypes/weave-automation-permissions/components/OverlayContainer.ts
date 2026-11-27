import { createContext, useContext } from 'react';

/**
 * The element modals portal into. WeaveShell provides its frame, so a modal's
 * scrim covers the product shell instead of the whole browser window.
 */
export const OverlayContainerContext = createContext<HTMLElement | null>(null);

export function useOverlayContainer(): HTMLElement | null {
  return useContext(OverlayContainerContext);
}
