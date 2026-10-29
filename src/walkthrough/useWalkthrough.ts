import { useContext, useEffect } from 'react';
import {
  WalkthroughContext,
  type WalkthroughContextValue,
} from '@/walkthrough/WalkthroughContext';
import type {
  WalkthroughDocument,
  WalkthroughSceneHandler,
} from '@/walkthrough/types';

export function useWalkthrough(): WalkthroughContextValue {
  const ctx = useContext(WalkthroughContext);
  if (!ctx) {
    throw new Error('useWalkthrough must be used within WalkthroughProvider');
  }
  return ctx;
}

/** Register walkthrough content for the current prototype; cleans up on unmount. */
export function useRegisterWalkthrough(
  doc: WalkthroughDocument | null,
  options?: { onScene?: WalkthroughSceneHandler },
) {
  const { register, unregister } = useWalkthrough();

  useEffect(() => {
    if (!doc) return;
    register(doc, options);
    return () => unregister(doc.prototypeId);
  }, [doc, options?.onScene, register, unregister]); // eslint-disable-line react-hooks/exhaustive-deps
}
