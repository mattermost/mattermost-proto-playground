export type AcvcSurfaceId = 'authoring' | 'channel' | 'denial' | 'readonly' | 'traces';

export interface AcvcSurface {
  id: AcvcSurfaceId;
  label: string;
}

/**
 * Top-level surfaces shown in the prototype chrome's centre slot.
 *
 * Two surfaces were removed rather than deferred, because the session controls
 * above each frame already reach the states they held:
 *
 * - "Two devices" — the verdict is per session, and flipping a control shows
 *   both answers on one frame. A side-by-side pair proved the same point twice.
 * - "Recovery" — deny, navigate away, then set the network back to Trusted and
 *   the channel returns with its accumulated unreads and the full backfill.
 *   Reachable inside Denial, so a separate surface only duplicated it.
 */
export const ACVC_SURFACES: AcvcSurface[] = [
  { id: 'authoring', label: '1 · System authoring' },
  { id: 'channel', label: '2 · Channel authoring' },
  { id: 'denial', label: '3 · Denial' },
  { id: 'readonly', label: '4 · Write to Channels' },
  { id: 'traces', label: '5 · Traces removed' },
];

/**
 * Sub-screens within the admin surface.
 *
 * Two entries were dropped. The 'Admin inheritance' warning went at Phase 4 P2 —
 * the shipped `Members` role description already discloses that administrators
 * fall back to the rule, at the point of selection. 'Simulate access' went
 * because nothing about that modal changes for Read Channel, so showing it
 * invited reviewers to critique a surface that is not under design. The
 * "Simulate rules" trigger stays on the policy page, since it ships.
 */
export const AUTHORING_SCREENS = [
  { id: 'picker', label: 'Add permission' },
  { id: 'configured', label: 'Policy configured' },
  { id: 'confirm', label: 'Save confirmation' },
] as const;

export const DENIAL_SCREENS = [
  { id: 'channel', label: 'Channel denial' },
  { id: 'workspace', label: 'Channels gone, DMs stay' },
] as const;

export const READONLY_SCREENS = [
  { id: 'channel', label: 'Channel-scoped' },
  { id: 'message-menu', label: 'Message actions' },
  { id: 'info', label: 'Channel info' },
  { id: 'header-menu', label: 'Header menu' },
  { id: 'settings', label: 'Channel settings' },
  { id: 'system', label: 'System-wide' },
  { id: 'thread', label: 'Thread reply' },
  { id: 'threads', label: 'Threads view' },
] as const;

export const TRACES_SCREENS = [
  { id: 'switcher', label: 'Channel switcher' },
  { id: 'search', label: 'Search' },
  { id: 'threads', label: 'Threads' },
  { id: 'browse', label: 'Browse channels' },
  { id: 'permalink', label: 'Permalink' },
] as const;
