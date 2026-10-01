/**
 * Shared logic for the Custom Session affordance (Options B + C).
 *
 * A "custom session" is a hypothetical session built by an admin to test what-if
 * scenarios. It does not modify real session telemetry. Synthetic sessions are
 * always visually distinct from real ones in the UI.
 */
import type {
  CellVerdict,
  PermissionAction,
  PolicyContext,
  SessionAttributeValue,
  SessionDecision,
  UserSimulationRow,
  VerdictAttribution,
} from './types';

/**
 * The fields the admin can configure on a custom session. The first three are
 * the active set used by the verdict simulator; the rest are demo-only fields
 * to demonstrate scaling from 1 to 10+ attributes in the what-if UI. They
 * render as chips but don't currently affect the verdict (proto-only).
 */
export interface CustomSessionFields {
  device_type: string;
  vpn_active: string; // 'true' | 'false'
  device_mdm_enrolled: string; // 'true' | 'false'
  network_interface_type?: string;
  os_version?: string;
  client_version?: string;
  geolocation?: string;
  mfa_freshness?: string;
  ip_in_range?: string;
  time_of_day?: string;
}

/** Compliant defaults — used when there's no real session to pre-fill from. */
export const COMPLIANT_DEFAULTS: CustomSessionFields = {
  device_type: 'desktop',
  vpn_active: 'true',
  device_mdm_enrolled: 'true',
  network_interface_type: 'WiFi',
  os_version: '14.5.0',
  client_version: '10.4.2',
  geolocation: 'US',
  mfa_freshness: 'fresh',
  ip_in_range: 'true',
  time_of_day: 'business-hours',
};

/** Pre-defined attribute counts for demo policies. */
export type AttributeCount = 1 | 3 | 10;

/** Attributes the policy references — shown as chips. Pluck a count via the policy name suffix. */
export function attributesUsedByPolicy(policy?: PolicyContext): (keyof CustomSessionFields)[] {
  if (!policy) return ['device_type', 'vpn_active', 'device_mdm_enrolled'];
  // Demo: high-attribute policy carries "10-attr" in its name.
  if (policy.policyName.includes('10-attr')) {
    return [
      'device_type',
      'vpn_active',
      'device_mdm_enrolled',
      'network_interface_type',
      'os_version',
      'client_version',
      'geolocation',
      'mfa_freshness',
      'ip_in_range',
      'time_of_day',
    ];
  }
  if (policy.policyName.includes('1-attr')) {
    return ['vpn_active'];
  }
  if (policy.policyName.includes('IL5')) return ['device_type', 'vpn_active', 'device_mdm_enrolled'];
  return ['device_type'];
}

/** Pretty labels for the form. */
export const FIELD_LABEL: Record<keyof CustomSessionFields, string> = {
  device_type: 'Device',
  vpn_active: 'VPN',
  device_mdm_enrolled: 'MDM',
  network_interface_type: 'Network',
  os_version: 'OS',
  client_version: 'Client',
  geolocation: 'Region',
  mfa_freshness: 'MFA',
  ip_in_range: 'IP allowed',
  time_of_day: 'Time',
};

export const FIELD_OPTIONS: Record<keyof CustomSessionFields, string[]> = {
  device_type: ['desktop', 'mobile', 'browser'],
  vpn_active: ['true', 'false'],
  device_mdm_enrolled: ['true', 'false'],
  network_interface_type: ['WiFi', 'Cellular', 'Ethernet', 'VPN tunnel'],
  os_version: ['14.5.0', '14.4.1', '14.3.0', '13.6.0'],
  client_version: ['10.4.2', '10.3.0', '10.2.1'],
  geolocation: ['US', 'EU', 'APAC', 'restricted'],
  mfa_freshness: ['fresh', 'stale'],
  ip_in_range: ['true', 'false'],
  time_of_day: ['business-hours', 'after-hours'],
};

/**
 * Pull a starting value from a real session (most-recent denied session preferred).
 *
 * Ordering contract: callers (fixtures / API) MUST pass `user.sessions` in
 * most-recent-first order. We don't re-sort here because the prototype's
 * `lastActive` is a relative-time string, not a comparable timestamp. Spec needs
 * to formalize this contract — production should sort by a Date field upstream.
 */
export function preFillFromUser(user: UserSimulationRow): {
  fields: CustomSessionFields;
  source: 'denied-session' | 'recent-session' | 'compliant-default';
  sourceLabel?: string;
} {
  const denied = user.sessions.find(
    (s) => !s.isPlaceholder && s.verdict !== 'allowed',
  );
  const recent = user.sessions.find((s) => !s.isPlaceholder);
  const seed = denied ?? recent;

  if (!seed) {
    return { fields: { ...COMPLIANT_DEFAULTS }, source: 'compliant-default' };
  }

  const get = (key: string): string | undefined => {
    const a = seed.attributes.find((x) => x.key === `session.${key}`);
    if (!a || a.value === null) return undefined;
    return String(a.value);
  };

  return {
    fields: {
      device_type: get('device_type') ?? COMPLIANT_DEFAULTS.device_type,
      vpn_active: get('vpn_active') ?? COMPLIANT_DEFAULTS.vpn_active,
      device_mdm_enrolled: get('device_mdm_enrolled') ?? COMPLIANT_DEFAULTS.device_mdm_enrolled,
    },
    source: denied ? 'denied-session' : 'recent-session',
    sourceLabel: `${seed.deviceLabel} · ${seed.lastActive}`,
  };
}

/** Convert form fields back to the attribute-list shape used by SessionDecision. */
export function fieldsToAttributes(fields: CustomSessionFields): SessionAttributeValue[] {
  return [
    { key: 'session.device_type', label: 'Device type', value: fields.device_type, type: 'enum' },
    { key: 'session.vpn_active', label: 'VPN active', value: fields.vpn_active === 'true', type: 'boolean' },
    {
      key: 'session.device_mdm_enrolled',
      label: 'MDM enrolled',
      value: fields.device_mdm_enrolled === 'true',
      type: 'boolean',
    },
  ];
}

/**
 * Simulate a verdict against the synthetic attribute values.
 * Prototype rule: ALLOW iff every gating attribute satisfies its constraint.
 * Each attribute participates only when the policy actually references it
 * (resolved via attributesUsedByPolicy) — so flipping any visible chip in the
 * 10-attribute scenario produces a real verdict change.
 */
export function simulateVerdict(
  fields: CustomSessionFields,
  policy: PolicyContext | undefined,
): { verdict: VerdictAttribution; failingCondition?: string; cellVerdicts: CellVerdict[] } {
  const actions: PermissionAction[] = policy?.actions ?? ['download_file_attachment'];
  const used = new Set(attributesUsedByPolicy(policy));

  const denyReason: string | null = (() => {
    if (used.has('device_mdm_enrolled') && fields.device_mdm_enrolled !== 'true') {
      return 'session.device_mdm_enrolled == true';
    }
    if (used.has('vpn_active') && fields.vpn_active !== 'true') {
      return 'session.vpn_active == true';
    }
    if (used.has('device_type') && fields.device_type === 'browser') {
      return 'session.device_type in ["desktop", "mobile"]';
    }
    if (used.has('network_interface_type') && fields.network_interface_type === 'Cellular') {
      return 'session.network_interface_type != "Cellular"';
    }
    if (used.has('mfa_freshness') && fields.mfa_freshness === 'stale') {
      return 'session.mfa_freshness == "fresh"';
    }
    if (used.has('ip_in_range') && fields.ip_in_range !== 'true') {
      return 'session.ip_in_range == true';
    }
    if (used.has('geolocation') && fields.geolocation === 'restricted') {
      return 'session.geolocation in ["US", "EU", "APAC"]';
    }
    if (used.has('time_of_day') && fields.time_of_day === 'after-hours') {
      return 'session.time_of_day == "business-hours"';
    }
    return null;
  })();

  const cellVerdicts: CellVerdict[] = actions.map((a) => ({
    action: a,
    verdict: denyReason ? 'denied-this-policy' : 'allowed',
    failingCondition: denyReason ?? undefined,
  }));

  return {
    verdict: denyReason ? 'denied-this-policy' : 'allowed',
    failingCondition: denyReason ?? undefined,
    cellVerdicts,
  };
}

/** Build a synthetic SessionDecision for rendering inside row chrome. */
export function buildCustomSession(
  fields: CustomSessionFields,
  policy: PolicyContext | undefined,
): SessionDecision {
  const sim = simulateVerdict(fields, policy);
  return {
    sessionId: 'custom-' + Math.random().toString(36).slice(2, 8),
    deviceLabel: 'Custom session',
    lastActive: 'just now',
    verdict: sim.verdict,
    cellVerdicts: sim.cellVerdicts,
    failingCondition: sim.failingCondition,
    attributes: fieldsToAttributes(fields),
  };
}
