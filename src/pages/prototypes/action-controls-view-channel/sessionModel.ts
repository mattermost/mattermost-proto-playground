import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  DEFAULT_DM,
  isDirectOrGroup,
  RESTRICTED_CHANNEL,
} from './channelData';

export type NetworkValue = 'Trusted' | 'Public';
export type DeviceValue = 'Managed' | 'Unmanaged';
export type ParticipationValue = 'Participant' | 'Observer';
export type ViewChannelCoverage = 'channel' | 'workspace';
export type CreatePostCoverage = 'channel' | 'system';

export interface SessionContext {
  network: NetworkValue;
  device: DeviceValue;
  /**
   * Drives Create Posts independently of Read Channel.
   *
   * Observer = the maintenance / mission-watch case: the channel stays visible,
   * notifications still fire, but the composer is read-only.
   */
  participation: ParticipationValue;
}

export type SessionInit = Omit<SessionContext, 'participation'> & {
  participation?: ParticipationValue;
  viewChannelCoverage?: ViewChannelCoverage;
  createPostCoverage?: CreatePostCoverage;
  activeChannel?: string;
};

function withParticipation(init: SessionInit): SessionContext {
  return {
    network: init.network,
    device: init.device,
    participation: init.participation ?? 'Participant',
  };
}

/**
 * Read Channel policy under test: `Network is Trusted AND Device Type is Managed`.
 *
 * Evaluated per session, never per user — the whole premise is that one account
 * can hold two live sessions with different verdicts at the same moment.
 *
 * DMs and GMs are exempt: the policy does not apply to them.
 */
export function canRead(ctx: SessionContext): boolean {
  return ctx.network === 'Trusted' && ctx.device === 'Managed';
}

export function canViewResource(
  ctx: SessionContext,
  name: string,
  viewCoverage: ViewChannelCoverage,
): boolean {
  if (isDirectOrGroup(name)) {
    return true;
  }
  if (canRead(ctx)) {
    return true;
  }
  if (viewCoverage === 'workspace') {
    return false;
  }
  return name !== RESTRICTED_CHANNEL;
}

/**
 * Create Posts requires Read Channel on the same resource. A grant to post is
 * meaningless — and still refused — on a session that cannot see the channel.
 * DMs and GMs are exempt from this action as well.
 */
export function canPostOn(
  ctx: SessionContext,
  name: string,
  viewCoverage: ViewChannelCoverage,
  postCoverage: CreatePostCoverage,
): boolean {
  if (isDirectOrGroup(name)) {
    return true;
  }
  if (!canViewResource(ctx, name, viewCoverage)) {
    return false;
  }
  if (ctx.participation === 'Participant') {
    return true;
  }
  if (postCoverage === 'system') {
    return false;
  }
  return name !== RESTRICTED_CHANNEL;
}

/** Denial-path alias for session-level Read Channel (channels only). */
export function isPermitted(ctx: SessionContext): boolean {
  return canRead(ctx);
}

/** Prototype stand-in for the 5-minute frozen-state timeout in phase5-flows.md. */
export const DENIAL_REDIRECT_SECONDS = 10;

/** Silent delay before removing traces when denial lands on another channel. */
export const DENIAL_SIDEBAR_REMOVAL_MS = DENIAL_REDIRECT_SECONDS * 1000;

/** Fallback when denial lands before the user has opened any other channel. */
export const DEFAULT_PERMITTED_CHANNEL = 'Town Square';

export interface SessionState {
  ctx: SessionContext;
  viewChannelCoverage: ViewChannelCoverage;
  createPostCoverage: CreatePostCoverage;
  /** Channel currently open in this session. */
  activeChannel: string;
  /** Last non-restricted channel the user opened — auto-redirect target after denial. */
  lastViewedPermittedChannel: string;
  /**
   * Whether this session has navigated since being denied.
   *
   * Traces removed from this session's sidebar and discovery surfaces.
   *
   * Set when the user navigates away from a denied restricted channel, when
   * the denied-state redirect fires, or after a silent timeout when denial
   * lands while another channel is active.
   */
  navigatedSinceDenial: boolean;
  /** Unread mentions accumulated while this session could not see the channel. */
  pendingMentions: number;
  /**
   * This session has been denied and re-granted, so the channel carries the
   * messages that arrived while it was hidden. Drives the New Messages
   * separator at the pre-denial boundary (D-1, full backfill).
   */
  backfilled: boolean;
}

export interface SessionView {
  state: SessionState;
  /** Read Channel verdict for the active resource. */
  canRead: boolean;
  /** Create Posts verdict for the active resource. */
  canPost: boolean;
  /** Alias of session-level canRead, used by denial / traces surfaces. */
  permitted: boolean;
  /** Restricted channel still listed in this session's sidebar. */
  channelInSidebar: boolean;
  /** CHANNELS group is shown. False for workspace-wide Read Channel denial. */
  includeChannels: boolean;
  /** Centre channel shows the permission-denied state rather than content. */
  showDenied: boolean;
  /**
   * Resource is visible and readable, but this session cannot post.
   */
  showReadOnly: boolean;
  setNetwork: (v: NetworkValue) => void;
  setDevice: (v: DeviceValue) => void;
  setParticipation: (v: ParticipationValue) => void;
  openChannel: (name: string) => void;
  reset: () => void;
}

function fallbackPermitted(viewCoverage: ViewChannelCoverage): string {
  return viewCoverage === 'workspace' ? DEFAULT_DM : DEFAULT_PERMITTED_CHANNEL;
}

export function useSession(initial: SessionInit): SessionView {
  const initialCtx = withParticipation(initial);
  const viewChannelCoverage = initial.viewChannelCoverage ?? 'channel';
  const createPostCoverage = initial.createPostCoverage ?? 'channel';
  const startChannel = initial.activeChannel ?? RESTRICTED_CHANNEL;

  const [state, setState] = useState<SessionState>({
    ctx: initialCtx,
    viewChannelCoverage,
    createPostCoverage,
    activeChannel: startChannel,
    lastViewedPermittedChannel: fallbackPermitted(viewChannelCoverage),
    navigatedSinceDenial: false,
    pendingMentions: 0,
    backfilled: false,
  });

  const readable = canViewResource(
    state.ctx,
    state.activeChannel,
    state.viewChannelCoverage,
  );
  const postable = canPostOn(
    state.ctx,
    state.activeChannel,
    state.viewChannelCoverage,
    state.createPostCoverage,
  );
  const sessionPassesRead = canRead(state.ctx);

  /** Single state transition for any change to the session's attributes. */
  const updateCtx = useCallback((patch: Partial<SessionContext>) => {
    setState((prev) => {
      const next = { ...prev.ctx, ...patch };
      const wasReadable = canViewResource(
        prev.ctx,
        RESTRICTED_CHANNEL,
        prev.viewChannelCoverage,
      );
      const nowReadable = canViewResource(
        next,
        RESTRICTED_CHANNEL,
        prev.viewChannelCoverage,
      );

      // Re-grant: membership never changed, so the channel simply returns,
      // carrying whatever accumulated while it was hidden.
      if (!wasReadable && nowReadable) {
        return {
          ...prev,
          ctx: next,
          navigatedSinceDenial: false,
          pendingMentions: prev.navigatedSinceDenial ? 3 : prev.pendingMentions,
          backfilled: prev.backfilled || prev.navigatedSinceDenial,
        };
      }

      // Newly denied Read Channel: reset trace-removal. Participation-only
      // flips do not land here.
      if (wasReadable && !nowReadable) {
        return { ...prev, ctx: next, navigatedSinceDenial: false };
      }

      return { ...prev, ctx: next };
    });
  }, []);

  const setNetwork = useCallback(
    (network: NetworkValue) => updateCtx({ network }),
    [updateCtx],
  );

  const setDevice = useCallback(
    (device: DeviceValue) => updateCtx({ device }),
    [updateCtx],
  );

  const setParticipation = useCallback(
    (participation: ParticipationValue) => updateCtx({ participation }),
    [updateCtx],
  );

  const openChannel = useCallback((name: string) => {
    setState((prev) => {
      const deniedNow = !canViewResource(
        prev.ctx,
        RESTRICTED_CHANNEL,
        prev.viewChannelCoverage,
      );
      const openingRestricted = name === RESTRICTED_CHANNEL;
      // Any navigation to a permitted channel while denied re-evaluates the
      // sidebar and removes restricted-channel traces immediately. Opening the
      // restricted channel itself keeps the in-channel frozen path.
      const removeTracesOnNavigation = deniedNow && !openingRestricted;
      const viewingNow = canViewResource(
        prev.ctx,
        name,
        prev.viewChannelCoverage,
      );

      return {
        ...prev,
        activeChannel: name,
        lastViewedPermittedChannel: viewingNow
          ? name
          : prev.lastViewedPermittedChannel,
        navigatedSinceDenial: prev.navigatedSinceDenial || removeTracesOnNavigation,
        pendingMentions: openingRestricted ? 0 : prev.pendingMentions,
      };
    });
  }, []);

  const reset = useCallback(
    () =>
      setState({
        ctx: initialCtx,
        viewChannelCoverage,
        createPostCoverage,
        activeChannel: startChannel,
        lastViewedPermittedChannel: fallbackPermitted(viewChannelCoverage),
        navigatedSinceDenial: false,
        pendingMentions: 0,
        backfilled: false,
      }),
    [initialCtx, viewChannelCoverage, createPostCoverage, startChannel],
  );

  // When denial lands while the user is on another channel, remove sidebar
  // traces after a short delay — no countdown, unlike the in-channel path.
  useEffect(() => {
    if (sessionPassesRead) {
      return;
    }

    if (state.activeChannel === RESTRICTED_CHANNEL || state.navigatedSinceDenial) {
      return;
    }

    const timerId = window.setTimeout(() => {
      setState((prev) => {
        if (canRead(prev.ctx) || prev.navigatedSinceDenial) {
          return prev;
        }

        if (prev.activeChannel === RESTRICTED_CHANNEL) {
          return prev;
        }

        return { ...prev, navigatedSinceDenial: true };
      });
    }, DENIAL_SIDEBAR_REMOVAL_MS);

    return () => window.clearTimeout(timerId);
  }, [
    sessionPassesRead,
    state.activeChannel,
    state.navigatedSinceDenial,
    state.ctx.network,
    state.ctx.device,
  ]);

  return useMemo<SessionView>(() => {
    const workspaceDenied =
      state.viewChannelCoverage === 'workspace' && !sessionPassesRead;
    const channelInSidebar =
      !workspaceDenied && (sessionPassesRead || !state.navigatedSinceDenial);
    const onDirect = isDirectOrGroup(state.activeChannel);
    return {
      state,
      canRead: readable,
      canPost: postable,
      permitted: sessionPassesRead,
      channelInSidebar,
      includeChannels: !workspaceDenied,
      showDenied: !readable && !onDirect,
      showReadOnly: readable && !postable && !onDirect,
      setNetwork,
      setDevice,
      setParticipation,
      openChannel,
      reset,
    };
  }, [
    state,
    readable,
    postable,
    sessionPassesRead,
    setNetwork,
    setDevice,
    setParticipation,
    openChannel,
    reset,
  ]);
}
