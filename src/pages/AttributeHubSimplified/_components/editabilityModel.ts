/**
 * Value editability after set — scene-local model for the channel-attributes
 * alignment variation (walkthrough 2026-08-06).
 *
 * The lock lives on the attribute, not on the channel and not on the value
 * (Maria, 00:58:51 — "at the global level, not this thing"). Which options are
 * offered is derived from the attribute type, because the safe direction is a
 * property of the type: a ranked scale can be raised, a tree can be narrowed,
 * an unordered Select has no direction at all.
 *
 * Scope excludes Users. User values are owned by the external source of record
 * (UAS/LDAP/SAML/SCIM), so editability there is controlled upstream.
 */
import {
  type HubAttribute,
  type ResourceKind,
} from '@/pages/AttributeManagementHub/hubData';
import { comparesRank, displayType, type SimplifiedAttrType } from './simplifiedModel';

export type ValueEditability =
  | 'editable'
  | 'raise-only'
  | 'lower-only'
  | 'narrow-only'
  | 'broaden-only'
  | 'add-only'
  | 'remove-only'
  | 'locked'
  /** Posts only — value is pinned to the channel and cannot be overridden. */
  | 'locked-to-channel';

/** Scene-local store so baseline seed data stays untouched. */
const STORE = new Map<string, ValueEditability>();

export function editabilityOptionsFor(
  type: SimplifiedAttrType,
  options?: { includeLockedToChannel?: boolean },
): ValueEditability[] {
  const base: ValueEditability[] = comparesRank(type)
    ? ['editable', 'raise-only', 'lower-only', 'locked']
    : type === 'Hierarchical'
      ? ['editable', 'narrow-only', 'broaden-only', 'locked']
      : type === 'Multiselect'
        ? ['editable', 'add-only', 'remove-only', 'locked']
        : ['editable', 'locked'];
  if (options?.includeLockedToChannel) {
    return [...base, 'locked-to-channel'];
  }
  return base;
}

/**
 * Ranked and tree types default to the fail-secure direction: raising a
 * classification or narrowing to a descendant can only shrink who qualifies.
 * Multiselect has no safe direction (adding widens under `has any of` and
 * narrows under `has all of`), so it defaults open and states the consequence.
 */
export function defaultEditability(type: SimplifiedAttrType): ValueEditability {
  // Ranked no longer ratchets upward by default. EO 13526's significant-doubt
  // rule classifies at the LOWER level, and over-classification is a legislated
  // harm (Reducing Over-Classification Act 2010) — so a structural upward
  // ratchet trades spillage risk for over-classification risk rather than
  // being neutral-safe. Restricting direction is now a deliberate choice.
  if (type === 'Hierarchical') return 'narrow-only';
  return 'editable';
}

export function getEditability(attribute: HubAttribute): ValueEditability {
  const type = displayType(attribute);
  const stored = STORE.get(attribute.id);
  if (stored && editabilityOptionsFor(type).includes(stored)) {
    return stored;
  }
  return defaultEditability(type);
}

export function setEditability(
  attributeId: string,
  next: ValueEditability,
): void {
  STORE.set(attributeId, next);
}

// ── Per-resource placement (Applies-to variation) ──────────────────────────
//
// Same type-derived rule set, chosen on each resource binding instead of once
// on the attribute. Users is excluded — its values come from the source system.

const RESOURCE_STORE = new Map<string, ValueEditability>();

const resourceKey = (attributeId: string, resource: ResourceKind) =>
  `${attributeId}:${resource}`;

export function getResourceEditability(
  attribute: HubAttribute,
  resource: ResourceKind,
): ValueEditability {
  const type = displayType(attribute);
  const stored = RESOURCE_STORE.get(resourceKey(attribute.id, resource));
  if (stored && editabilityOptionsFor(type).includes(stored)) {
    return stored;
  }
  return defaultEditability(type);
}

export function setResourceEditability(
  attributeId: string,
  resource: ResourceKind,
  next: ValueEditability,
): void {
  RESOURCE_STORE.set(resourceKey(attributeId, resource), next);
}

/** Singular resource noun for per-binding copy: Channels → channel. */
export function resourceNoun(resource: ResourceKind): string {
  return resource.slice(0, -1).toLowerCase();
}

/**
 * Dropdown option copy. A closed dropdown shows only the selected option, so
 * every label must stand alone with no supporting description — and each type
 * names the movement in its own accurate vocabulary rather than a shared
 * abstraction. "More/less restrictive" was rejected deliberately: it implies an
 * access guarantee that only holds for Ranked. Adding a Multiselect value
 * widens access under `has any of` but narrows it under `has all of`, and
 * narrowing a hierarchical value can grow the qualifying population under
 * additive inheritance. Naming the value movement is honest; naming the access
 * consequence is not.
 */
export function plainEditabilityLabel(
  value: ValueEditability,
  type?: SimplifiedAttrType,
): string {
  switch (value) {
    case 'editable':
      return 'Can be changed at any time';
    case 'raise-only':
      return 'Can only be raised, never lowered';
    case 'lower-only':
      return 'Can only be lowered, never raised';
    case 'narrow-only':
      return 'Can only be narrowed to a more specific value';
    case 'broaden-only':
      return 'Can only be broadened to a less specific value';
    case 'add-only':
      return 'Values can be added but not removed';
    case 'remove-only':
      return 'Values can be removed but not added';
    case 'locked':
      return type === 'Multiselect'
        ? 'Values cannot be changed once set'
        : 'Cannot be changed once set';
    case 'locked-to-channel':
      return 'Locked to the channel value';
  }
}

/**
 * What each rule means, in concept. Deliberately names no option values —
 * an admin may not be read into every value, and the scale differs per
 * deployment, so a concrete example would be wrong or leaky.
 */
export function editabilityDescription(
  type: SimplifiedAttrType,
  value: ValueEditability,
  resource?: ResourceKind,
): string {
  switch (value) {
    case 'editable':
      if (comparesRank(type)) {
        return 'Any option on the scale, in either direction.';
      }
      if (type === 'Hierarchical') return 'Any option in the tree.';
      if (type === 'Multiselect') return 'Values can be added or removed.';
      if (type === 'Text') return 'Any value.';
      return 'Any option.';
    case 'raise-only':
      return 'Only to a higher tier on the scale. Moving down is blocked.';
    case 'lower-only':
      return 'Only to a lower tier on the scale. Moving up is blocked.';
    case 'narrow-only':
      return 'Only to a more specific option beneath the current one. Moving up, or across to another branch, is blocked.';
    case 'broaden-only':
      return 'Only to a broader option the current one sits under. Moving down, or across to another branch, is blocked.';
    case 'add-only':
      return 'Existing values stay. New ones can be added.';
    case 'remove-only':
      return 'Existing values can be cleared. No new ones can be added.';
    case 'locked':
      return resource
        ? `Fixed once set. Create a new ${resourceNoun(resource)} to use a different value.`
        : 'Fixed once set. A new resource is needed to use a different value.';
    case 'locked-to-channel':
      return 'Posts always use this channel’s value. Authors cannot set a different one.';
  }
}

/** Short membership warning for multiselect attributes that gate policies. */
export function plainPolicyCaveat(
  attribute: HubAttribute,
  value: ValueEditability,
): string | null {
  if (!showsOperatorCaveat(attribute, value)) return null;
  return `Used by ${attribute.usedByPolicies} ${
    attribute.usedByPolicies === 1 ? 'policy' : 'policies'
  } — changing values here can change who has access.`;
}

/**
 * Attribute-level variant of the same labels. Each rule is an exclusive regime,
 * not a combinable permission: on a hierarchy, "narrowed" and "broadened" BOTH
 * block movement across to a sibling branch, so allowing both is still not the
 * same as allowing any change. That is why these stay a single-choice list.
 */
export function editabilityLabel(
  value: ValueEditability,
  type?: SimplifiedAttrType,
): string {
  return plainEditabilityLabel(value, type);
}

/** Resources this setting governs — everything except Users. */
export function editabilityResources(attribute: HubAttribute): ResourceKind[] {
  return attribute.appliesTo
    .map((c) => c.resource)
    .filter((r) => r !== 'Users');
}

/** The external system that owns user values, when this attribute has a Users binding. */
export function usersManagedBy(attribute: HubAttribute): string | null {
  const users = attribute.appliesTo.find((c) => c.resource === 'Users');
  if (!users) return null;
  const setter = users.whoCanSet.relationalDefault;
  if (setter && ['UAS', 'LDAP', 'SAML', 'SCIM'].includes(setter)) {
    return setter;
  }
  return null;
}

/**
 * Multiselect has no unambiguously safe direction — the effect on membership
 * depends on the operator the consuming policy uses.
 */
export function showsOperatorCaveat(
  attribute: HubAttribute,
  value: ValueEditability,
): boolean {
  return (
    displayType(attribute) === 'Multiselect' &&
    value !== 'locked' &&
    value !== 'locked-to-channel' &&
    attribute.usedByPolicies > 0
  );
}
