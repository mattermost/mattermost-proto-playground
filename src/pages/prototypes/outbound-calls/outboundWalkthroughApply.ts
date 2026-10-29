import type { WalkthroughSceneState } from '@/walkthrough';
import type { CallStatus } from '@/types/outboundCall';

/** Outbound Calls keys under step.sceneState. */
export type OutboundWalkthroughApply = {
  /** Open the composing dial-pad PIP (team-rail softphone). */
  dialpad?: boolean;
  /**
   * Active softphone snapshot. `null` or omit clears the call.
   * Prefer `connected` for stable PIP demos (skips ringback).
   */
  call?: {
    contactId: string;
    phoneIndex?: number;
    status?: Extract<CallStatus, 'composing' | 'dialing' | 'connected'>;
    keypad?: boolean;
    muted?: boolean;
    fromDialpad?: boolean;
  } | null;
  /** Open a profile popover for this contact (anchor via data-wt-popover-anchor). */
  popover?: { contactId: string } | null;
  /** Open the channel/DM header Start call menu. */
  startCallMenu?: boolean;
  /** Composing PIP tab (requires dialpad / composing call). */
  composeTab?: 'dialpad' | 'recent' | 'conference';
  /** Seed DM composer with `tel:` and open autocomplete. */
  telAutocomplete?: boolean;
};

export function parseOutboundWalkthroughApply(
  state?: WalkthroughSceneState,
): OutboundWalkthroughApply {
  if (!state) return {};
  const dialpad = state.dialpad === true;
  const startCallMenu = state.startCallMenu === true;
  const telAutocomplete = state.telAutocomplete === true;

  let composeTab: OutboundWalkthroughApply['composeTab'];
  if (
    state.composeTab === 'dialpad' ||
    state.composeTab === 'recent' ||
    state.composeTab === 'conference'
  ) {
    composeTab = state.composeTab;
  }

  let popover: OutboundWalkthroughApply['popover'];
  if (state.popover === null) popover = null;
  else if (
    state.popover &&
    typeof state.popover === 'object' &&
    'contactId' in state.popover &&
    typeof (state.popover as { contactId: unknown }).contactId === 'string'
  ) {
    popover = { contactId: (state.popover as { contactId: string }).contactId };
  }

  let call: OutboundWalkthroughApply['call'];
  if (state.call === null) call = null;
  else if (state.call && typeof state.call === 'object' && 'contactId' in state.call) {
    const raw = state.call as Record<string, unknown>;
    const contactId = typeof raw.contactId === 'string' ? raw.contactId : '';
    if (contactId) {
      const status =
        raw.status === 'composing' || raw.status === 'dialing' || raw.status === 'connected'
          ? raw.status
          : 'connected';
      call = {
        contactId,
        phoneIndex: typeof raw.phoneIndex === 'number' ? raw.phoneIndex : 0,
        status,
        keypad: raw.keypad === true,
        muted: raw.muted === true,
        fromDialpad: raw.fromDialpad === true,
      };
    }
  }

  return {
    dialpad,
    call,
    popover,
    startCallMenu,
    composeTab,
    telAutocomplete,
  };
}

export function resolvePopoverAnchorRect(contactId: string): DOMRect {
  const el = document.querySelector(
    `[data-wt-popover-anchor="${CSS.escape(contactId)}"]`,
  ) as HTMLElement | null;
  if (el) return el.getBoundingClientRect();
  // Fallback: mid-stage so the popover is still visible in the shell.
  const stage = document.querySelector('[data-wt-focus="channel-shell"], [data-wt-focus="dm-shell"]');
  const stageRect = stage?.getBoundingClientRect();
  if (stageRect) {
    return new DOMRect(stageRect.left + stageRect.width * 0.35, stageRect.top + 120, 40, 40);
  }
  return new DOMRect(window.innerWidth * 0.45, window.innerHeight * 0.35, 40, 40);
}
