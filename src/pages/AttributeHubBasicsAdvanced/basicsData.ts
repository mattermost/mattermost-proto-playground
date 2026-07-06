/**
 * Approach B — "Basics by default, one Advanced door" — local derived helpers.
 *
 * Imports the canonical model + seed from AttributeManagementHub/hubData.ts
 * UNCHANGED. Everything here is derived state / copy for the Basics/Advanced
 * split (spec 27 §3 boundary + spec 28 copy fixes). No model changes.
 */

import {
  ALL_RESOURCES,
  appliesToUsers,
  eligibility,
  isPolicyLocked,
  isSourceOwned,
  readIntoForced,
  whoCanSet,
  accessCap,
  defaultResourceConfig,
  type HubAttribute,
  type ResourceConfig,
  type ResourceKind,
  type WhoSets,
} from '../AttributeManagementHub/hubData';

export {
  ALL_RESOURCES,
  appliesToUsers,
  isPolicyLocked,
  isSourceOwned,
  readIntoForced,
  whoCanSet,
  accessCap,
  defaultResourceConfig,
};

/** Derived eligibility line for the Basics Definition panel. */
export function eligibilityLine(a: HubAttribute): {
  eligible: boolean;
  why: string;
} {
  return eligibility(a);
}
export type { HubAttribute, ResourceConfig, ResourceKind, WhoSets };

/**
 * Preset relational-default options per resource for the JS-2 "Option 3"
 * who-can-set dropdown in Basics. The first entry is the natural owner
 * (relational default). Sync systems (UAS/LDAP/SCIM) are not user-selectable
 * presets — those bindings render locked.
 */
export const WHO_SETS_PRESETS: Record<ResourceKind, WhoSets[]> = {
  Users: ['System admin', 'Members'],
  Channels: ['Channel admin', 'Team admin', 'System admin', 'Members'],
  Teams: ['Team admin', 'System admin', 'Members'],
  Posts: ['Post author', 'Channel admin', 'System admin'],
};

const SYNC_SYSTEMS: WhoSets[] = ['UAS', 'LDAP', 'SCIM'];

export function isSyncSetter(who: WhoSets | null): boolean {
  return who != null && SYNC_SYSTEMS.includes(who);
}

/** A single-resource attribute shows ONE who-can-set dropdown, not four. */
export function enabledResources(a: HubAttribute): ResourceConfig[] {
  return a.appliesTo;
}

/**
 * V-4 — unify "linked" + "reuse" to "Shared value scale".
 * One state string used everywhere in this scene.
 */
export function sharedScaleState(a: HubAttribute): string | null {
  if (!a.valuesLink) return null;
  return `Values shared from ${a.valuesLink.attributeName}`;
}

/** V-4 — the one verb for entering the shared-scale relationship. */
export const SHARED_SCALE_VERB = 'Use a shared value scale from…';

/**
 * Compliance guardrail pills that stay VISIBLE in Basics as locked, explained
 * status even when their configuration lives behind Advanced (spec 27 §8 Risk 3,
 * §6 guardrail 6). Returns non-editable status pills — never toggles.
 */
export interface GuardrailPill {
  id: string;
  /** Short status label (the locked pill). */
  label: string;
  /** One-line plain-language explanation of the enforced guardrail. */
  explain: string;
  tone: 'info' | 'warning';
}

export function basicsGuardrailPills(a: HubAttribute): GuardrailPill[] {
  const pills: GuardrailPill[] = [];

  // D5 — read-into forced + non-editable for UAS-owned attributes.
  // Spec 28 rename: "read-into filtering" -> "Hide values viewer isn't cleared for".
  if (readIntoForced(a) && appliesToUsers(a)) {
    pills.push({
      id: 'read-into-forced',
      label: 'Hides values viewers aren’t cleared for',
      explain: `Required for ${a.source.system}-owned lists — values are hidden from admins who aren’t read into them. This is enforced and can’t be turned off.`,
      tone: 'info',
    });
  } else if (a.readIntoFiltering && appliesToUsers(a)) {
    // D5 manual/LDAP configurable case — visible as status; toggle lives in Advanced.
    pills.push({
      id: 'read-into-on',
      label: 'Hides values viewers aren’t cleared for',
      explain:
        'Values are hidden from viewers who aren’t cleared for them. Change this under Advanced settings.',
      tone: 'info',
    });
  }

  // D10 — member-trust guardrail: policy-bound attributes can't be member-set.
  if (isPolicyLocked(a)) {
    const memberSettable = a.appliesTo.some(
      (c) =>
        c.resource !== 'Posts' &&
        (c.whoCanSet.relationalDefault === 'Members' ||
          c.whoCanSet.grants.roles.some((g) => g.subject === 'Members')),
    );
    pills.push({
      id: 'member-trust',
      label: memberSettable
        ? 'Member-set — not trusted for access'
        : 'Trusted for access decisions',
      explain: `Used by ${a.usedByPolicies} ${
        a.usedByPolicies === 1 ? 'policy' : 'policies'
      }. A value any member can set can’t be trusted for access — “Members” is blocked as a setter while this attribute gates access.`,
      tone: memberSettable ? 'warning' : 'info',
    });
  }

  return pills;
}

/**
 * Spec 28 row 3 — self-describing access count for the Advanced-door subtitle.
 * "3 people or roles can edit this attribute" (never "3 role and user grants").
 */
export function editAccessSummary(a: HubAttribute): string {
  const cap = a.access.editDefinition;
  // JS-3: attribute-rules are CUT from the ACCESS layer, so they're not counted.
  const n = cap.roles.length + cap.users.length;
  return `${n} ${n === 1 ? 'person or role' : 'people or roles'} can edit this attribute`;
}

/** Which resources are still addable (not already bound). */
export function addableResources(a: HubAttribute): ResourceKind[] {
  const applied = new Set(a.appliesTo.map((c) => c.resource));
  return ALL_RESOURCES.filter((r) => !applied.has(r));
}

/** Spec 27 §7.2 / P4-3 — auto-suggest the guided wizard for complex types. */
export function shouldSuggestGuided(
  type: HubAttribute['type'],
  usingSharedScale: boolean,
): boolean {
  return type === 'Ranked-hierarchical' || usingSharedScale;
}
