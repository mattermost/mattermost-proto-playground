/**
 * Attribute Management — Variation B (two areas)
 *
 * B reuses Variation A's seed data verbatim (imported from A's data.ts), so the
 * two variations show the same attributes. B only partitions that data by area:
 *
 *   - Attributes area      → Channels / Posts / Teams bindings (no Users pill)
 *   - User Attributes area → the Users binding, rendered as the shipped
 *                            Property · Type · Values · Actions table
 *
 * A cross-cutting attribute (one that binds BOTH Users and a resource) appears
 * in BOTH areas — its user binding in User Attributes, its resource binding in
 * Attributes — marked `shared`, one definition underneath. Each area edits its
 * own binding and links to the other ("Also applies to … ↗").
 */

import {
  ATTRIBUTES,
  type Attribute,
  type Resource,
} from '../AttributeManagementV2/data';

export type { Attribute, Resource } from '../AttributeManagementV2/data';

/** The two top-level areas in Variation B. */
export type AreaKey = 'attributes' | 'user';

/** Resource pills for the Attributes area — NO Users pill (that lives in User Attributes). */
export const B_RESOURCE_PILLS: { key: 'All' | Resource; label: string }[] = [
  { key: 'All', label: 'All' },
  { key: 'Channels', label: 'Channels' },
  { key: 'Posts', label: 'Posts' },
  { key: 'Teams', label: 'Teams' },
];

export type BResourceFilterKey = 'All' | 'Channels' | 'Posts' | 'Teams';

const RESOURCE_AREA: Resource[] = ['Channels', 'Posts', 'Teams'];

/** True when the attribute has at least one Channels/Posts/Teams binding. */
export function inAttributesArea(a: Attribute): boolean {
  return a.appliesTo.some((b) => RESOURCE_AREA.includes(b.resource));
}

/** True when the attribute has a Users binding. */
export function inUserArea(a: Attribute): boolean {
  return a.appliesTo.some((b) => b.resource === 'Users');
}

/**
 * Cross-cutting (B1): the attribute binds BOTH Users and a resource, so it
 * surfaces in both areas. This is the `shared` marker the spec calls for.
 */
export function isCrossCutting(a: Attribute): boolean {
  return inUserArea(a) && inAttributesArea(a);
}

/** Attributes shown in the Attributes area (Channels/Posts/Teams). */
export const ATTRIBUTES_AREA_LIST: Attribute[] = ATTRIBUTES.filter(inAttributesArea);

/** Attributes shown in the User Attributes area (Users-bound, custom rows). */
export const USER_AREA_LIST: Attribute[] = ATTRIBUTES.filter(inUserArea);

/**
 * The differently-named shared-values link (Clearance ↔ Classification) spans
 * the two areas: Clearance lives in User Attributes, Classification in
 * Attributes. Given an attribute, find the sibling's area for the cross-area
 * "Also applies to … ↗" link.
 */
export function siblingArea(a: Attribute): AreaKey | null {
  const link = a.sharedValuesLink;
  if (!link) return null;
  const sibling = ATTRIBUTES.find((x) => x.id === link.siblingId);
  if (!sibling) return null;
  // The sibling lives in whichever area it primarily binds.
  if (inUserArea(sibling) && !inAttributesArea(sibling)) return 'user';
  if (inAttributesArea(sibling) && !inUserArea(sibling)) return 'attributes';
  // Cross-cutting sibling — surfaces in both; prefer the area opposite this one.
  return inUserArea(a) ? 'attributes' : 'user';
}

export function siblingName(a: Attribute): string | null {
  const link = a.sharedValuesLink;
  if (!link) return null;
  return ATTRIBUTES.find((x) => x.id === link.siblingId)?.name ?? null;
}

// ─── User Attributes area — built-in profile fields ─────────────────────────────
// Shipped reference: built-ins are read-only/locked on top, Values = "—", no
// drag handle, no row menu. These are CPA profile fields, not attributes from
// the catalog, so they live only in this area.

export type BuiltInType = 'Image' | 'Text' | 'Email';

export interface BuiltInField {
  id: string;
  name: string;
  type: BuiltInType;
}

export const BUILT_IN_PROFILE_FIELDS: BuiltInField[] = [
  { id: 'profile-image', name: 'Profile image', type: 'Image' },
  { id: 'first-name', name: 'First name', type: 'Text' },
  { id: 'last-name', name: 'Last name', type: 'Text' },
  { id: 'username', name: 'Username', type: 'Text' },
  { id: 'email', name: 'Email', type: 'Email' },
  { id: 'title', name: 'Title', type: 'Text' },
];
