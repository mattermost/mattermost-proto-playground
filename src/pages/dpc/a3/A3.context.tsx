/**
 * A3 local context — shares the active "viewed channel" between A3's
 * scenario sub-views (ChannelSettings, ChannelHeader, AddToDirectoryDialog,
 * DirectoryAdminSurface, PendingRequestsRail).
 *
 * The active channel is the channel the admin scenario is currently
 * narrating — by default ch-002 (`ops-planning-q3`). Reviewers can imagine
 * a real Mattermost channel sidebar to the left; this prototype just
 * focuses the surfaces that demonstrate the A3 mechanism.
 *
 * Kept deliberately tiny: the heavy lifting (state machine + audit log)
 * lives in `useA3Store.ts`.
 */
import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from 'react';
import type { ChannelFixture } from '@/pages/dpc/shared';

interface A3ChannelContextValue {
  channel: ChannelFixture;
}

const A3ChannelContext = createContext<A3ChannelContextValue | null>(null);

export interface A3ChannelProviderProps {
  channel: ChannelFixture;
  children: ReactNode;
}

export function A3ChannelProvider({
  channel,
  children,
}: A3ChannelProviderProps) {
  const value = useMemo(() => ({ channel }), [channel]);
  return (
    <A3ChannelContext.Provider value={value}>
      {children}
    </A3ChannelContext.Provider>
  );
}

export function useA3Channel(): A3ChannelContextValue {
  const ctx = useContext(A3ChannelContext);
  if (!ctx) {
    throw new Error('useA3Channel must be used within an A3ChannelProvider');
  }
  return ctx;
}
