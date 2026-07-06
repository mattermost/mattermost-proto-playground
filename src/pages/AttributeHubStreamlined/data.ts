/**
 * AttributeHubStreamlined — LOCAL derived helpers for Approach A
 * ("Aggressive cut: one owner, one page, no advanced tier").
 *
 * This file imports the shared model + seed from `AttributeManagementHub/hubData`
 * READ-ONLY and never mutates it. It only adds Approach-A-specific projections:
 *
 *  - a SINGLE "who sets the value" answer per ATTRIBUTE (not per-resource). The
 *    answer is a relational default derived from the resource types the attribute
 *    applies to — there is no per-resource grant editor in this pole.
 *  - a SINGLE "who can edit this attribute" owner list (roles + named users),
 *    collapsing the old edit-definition vs manage-values split into one list.
 *
 * This deliberately REVERSES locked decisions D1/D2/D3 + §4b per-resource-type
 * ownership — that is the point of Approach A. It is surfaced honestly in-scene
 * via a single "Approach A tradeoff" note.
 */
import {
  isSourceOwned,
  type AccessCapability,
  type HubAttribute,
  type ResourceConfig,
  type WhoSets,
} from '../AttributeManagementHub/hubData';

/**
 * The single per-attribute setter answer, derived from resource type.
 *
 * Approach A collapses the merged per-resource `whoCanSet` back to one answer.
 * Rather than author it, we derive the natural owner from the resources the
 * attribute applies to (channel admin, team admin, post author, member, or the
 * sync system) — the auto-derived relational default the model already ships.
 */
export function derivedSetter(a: HubAttribute): {
  who: WhoSets;
  derivedFrom: string;
  synced: boolean;
} {
  // Synced attributes are set by the source system, full stop.
  if (isSourceOwned(a) && a.source.system) {
    return {
      who: a.source.system as WhoSets,
      derivedFrom: `synced from ${a.source.system}`,
      synced: true,
    };
  }
  // Otherwise take the relational default of the highest-authority resource the
  // attribute applies to. Precedence mirrors the resource containment order.
  const precedence: WhoSets[] = [
    'System admin',
    'Team admin',
    'Channel admin',
    'Post author',
    'Members',
  ];
  const defaults = a.appliesTo
    .map((c) => c.whoCanSet.relationalDefault)
    .filter((w): w is WhoSets => w != null);
  for (const who of precedence) {
    if (defaults.includes(who)) {
      const from = a.appliesTo.find(
        (c) => c.whoCanSet.relationalDefault === who,
      );
      return {
        who,
        derivedFrom: from
          ? `${who} on ${from.resource.toLowerCase()}`
          : String(who),
        synced: false,
      };
    }
  }
  return { who: 'System admin', derivedFrom: 'System admin', synced: false };
}

/** Plain-language description of who sets the value, for the read-only chip. */
export function setterLabel(a: HubAttribute): string {
  const { who, synced } = derivedSetter(a);
  if (synced) return `Set by ${who}`;
  if (who === 'Members') return 'Set by members on their own profile';
  return `Set by ${who.toLowerCase()}`;
}

/**
 * The single "who can edit this attribute" owner list. Approach A does NOT split
 * edit-definition vs manage-values, so we union the two capabilities into one
 * owner list (roles + named users). Attribute-rules (JS-3) are dropped entirely.
 */
export interface Owner {
  subject: string;
  kind: 'role' | 'user';
  owner: boolean;
}

export function attributeOwners(a: HubAttribute): Owner[] {
  const seen = new Set<string>();
  const owners: Owner[] = [];
  const collect = (cap: AccessCapability) => {
    for (const g of cap.roles) {
      if (seen.has(g.subject)) continue;
      seen.add(g.subject);
      owners.push({ subject: g.subject, kind: 'role', owner: !!g.owner });
    }
    for (const g of cap.users) {
      if (seen.has(g.subject)) continue;
      seen.add(g.subject);
      owners.push({ subject: g.subject, kind: 'user', owner: !!g.owner });
    }
    // attributeRules deliberately NOT collected — cut in Approach A (JS-3).
  };
  collect(a.access.editDefinition);
  collect(a.access.manageValues);
  return owners;
}

/** Resources the attribute applies to, with the Required flag Approach A keeps. */
export function requiredResources(a: HubAttribute): ResourceConfig[] {
  return a.appliesTo.filter((c) => c.required);
}

/**
 * Read-into status for the single read-only pill. Approach A ships NO toggle:
 * for UAS attributes filtering is forced-on server-side; everything else is off.
 */
export function readIntoStatus(a: HubAttribute): {
  forced: boolean;
  active: boolean;
} {
  const forced = a.source.system === 'UAS';
  return { forced, active: forced && a.readIntoFiltering };
}
