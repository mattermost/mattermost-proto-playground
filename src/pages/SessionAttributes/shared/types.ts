// Shared types for the Session Attributes prototype.
// Aligned to tech spec [WIP] Session Attributes v1.0 (MVF), 2026-05-15.

export type PlatformCoverage = 'available' | 'caveats' | 'unavailable';

export type AttributeCategory =
  | 'Network Identity'
  | 'Device Identity'
  | 'Device Posture'
  | 'User-Agent';

export type AttributeType =
  | 'String'
  | 'IP'
  | 'Boolean'
  | 'Version'
  | 'Enum';

export type AttributeSource = 'client' | 'server';

export interface PlatformState {
  state: PlatformCoverage;
  /** Tooltip text describing the caveat or reason for unavailability. */
  detail?: string;
}

export interface SessionAttribute {
  id: string;
  /** Human-readable label. */
  displayName: string;
  /** Canonical snake_case identifier, matches the CEL suffix. */
  name: string;
  type: AttributeType;
  category: AttributeCategory;
  source: AttributeSource;
  desktop: PlatformState;
  mobile: PlatformState;
  browser: PlatformState;
  ttlSeconds: number;
  gracePeriodSeconds: number;
  enabled: boolean;
  policyCount: number;
  notes?: string;
  /** Optional description for the details side panel. */
  description?: string;
  /** Optional mechanism / trust assurance descriptor (text, not visual hierarchy). */
  trustNote?: string;
}

export interface DeviceSession {
  id: string;
  deviceName: string;
  platform: 'desktop' | 'mobile' | 'browser';
  ip: string;
  deviceId: string;
  lastRefresh: string;
  attributeCount: number;
}
