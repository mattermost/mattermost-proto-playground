/**
 * DPC V2 A1 — RejoinableChannelsSurface (v2.3).
 *
 * Delegates to BrowseChannels with `rejoinMode={true}`. Per §6.2 strict
 * parity: the rejoin flow renders the same Browse Channels modal scoped
 * to the user's `rejoinableChannels` list, with the universal "Request
 * to join" CTA (no separate "Rejoin" CTA).
 */
import BrowseChannels from './BrowseChannels';
import type { A1V2StoreApi } from '../useA1V2Store';

export interface RejoinableChannelsSurfaceProps {
  store: A1V2StoreApi;
}

export default function RejoinableChannelsSurface({
  store,
}: RejoinableChannelsSurfaceProps) {
  return <BrowseChannels store={store} rejoinMode />;
}
