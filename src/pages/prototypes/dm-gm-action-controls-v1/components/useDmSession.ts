// [AI DRAFT] One end-user session: its attributes, the open conversation, typed
// drafts, and the hidden-state bookkeeping (inherited View Channel D+C′).
import { useCallback, useMemo, useState } from 'react';
import {
  ALL_CONVERSATIONS,
  accessFor,
  conversationByName,
  isDirect,
  type ConversationMessage,
} from '../conversations';
import type { SessionContext } from '../policyModel';

export interface DmSessionInit {
  ctx: SessionContext;
  active: string;
  /** Start with view-denied conversations already removed (the "after navigating" state). */
  removed?: boolean;
  drafts?: Record<string, string>;
}

export interface DmSession {
  ctx: SessionContext;
  setNetwork: (v: string) => void;
  setDevice: (v: string) => void;
  active: string;
  openConversation: (name: string) => void;
  /** View-denied conversations are removed from the sidebar after the next navigation. */
  hiddenRemoved: boolean;
  visibleConversationNames: string[];
  draft: string;
  setDraft: (value: string) => void;
  extraMessages: ConversationMessage[];
  addMessage: (name: string, message: ConversationMessage) => void;
  canView: boolean;
  canPost: boolean;
}

export function useDmSession(init: DmSessionInit): DmSession {
  const [ctx, setCtx] = useState<SessionContext>(init.ctx);
  const [active, setActive] = useState(init.active);
  const [hiddenRemoved, setHiddenRemoved] = useState(init.removed ?? false);
  const [drafts, setDrafts] = useState<Record<string, string>>(
    init.drafts ?? {},
  );
  const [extra, setExtra] = useState<Record<string, ConversationMessage[]>>({});

  const activeConversation = conversationByName(active);
  const access = accessFor(activeConversation, ctx);

  const setDevice = useCallback((v: string) => {
    setCtx((prev) => ({ ...prev, Device: v }));
    // Regaining view brings every conversation back.
    if (v === 'Managed') {
      setHiddenRemoved(false);
    }
  }, []);

  const setNetwork = useCallback((v: string) => {
    setCtx((prev) => ({ ...prev, Network: v }));
  }, []);

  const openConversation = useCallback(
    (name: string) => {
      setActive(name);
      const anyHidden = ALL_CONVERSATIONS.some(
        (c) => isDirect(c) && !accessFor(c, ctx).canView,
      );
      if (anyHidden) {
        setHiddenRemoved(true);
      }
    },
    [ctx],
  );

  const visibleConversationNames = useMemo(
    () =>
      ALL_CONVERSATIONS.filter((c) => {
        if (!isDirect(c)) {
          return true;
        }
        if (accessFor(c, ctx).canView) {
          return true;
        }
        // Stays listed until the next navigation, so nothing is yanked mid-read.
        return !hiddenRemoved;
      }).map((c) => c.name),
    [ctx, hiddenRemoved],
  );

  return {
    ctx,
    setNetwork,
    setDevice,
    active,
    openConversation,
    hiddenRemoved,
    visibleConversationNames,
    draft: drafts[active] ?? '',
    setDraft: (value: string) =>
      setDrafts((prev) => ({ ...prev, [active]: value })),
    extraMessages: extra[active] ?? [],
    addMessage: (name, message) =>
      setExtra((prev) => ({
        ...prev,
        [name]: [...(prev[name] ?? []), message],
      })),
    canView: access.canView,
    canPost: access.canPost,
  };
}
