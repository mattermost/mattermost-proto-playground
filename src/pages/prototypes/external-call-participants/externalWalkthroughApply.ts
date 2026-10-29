import type { WalkthroughSceneState } from '@/walkthrough';

export type WidgetOverlay = 'menu' | 'info' | 'participants';

/** External Call Participants keys under step.sceneState. */
export type ExternalWalkthroughApply = {
  /** Widget popover overlay. Omit / null clears. */
  widgetOverlay?: WidgetOverlay | null;
  /** Popout / guest Call info open. */
  callInfoOpen?: boolean;
  /** Host “Enable external participants” toggle. */
  externalEnabled?: boolean;
  /** Display name for the guest participant (welcome → guest). */
  guestName?: string;
};

function isWidgetOverlay(value: unknown): value is WidgetOverlay {
  return value === 'menu' || value === 'info' || value === 'participants';
}

export function parseExternalWalkthroughApply(
  state?: WalkthroughSceneState,
): ExternalWalkthroughApply {
  if (!state) return {};

  let widgetOverlay: ExternalWalkthroughApply['widgetOverlay'];
  if (state.widgetOverlay === null) widgetOverlay = null;
  else if (isWidgetOverlay(state.widgetOverlay)) widgetOverlay = state.widgetOverlay;

  return {
    widgetOverlay,
    callInfoOpen: state.callInfoOpen === true,
    externalEnabled: state.externalEnabled === true,
    guestName:
      typeof state.guestName === 'string' && state.guestName.trim()
        ? state.guestName.trim()
        : undefined,
  };
}
