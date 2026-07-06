/**
 * Attribute Management — Classification setup (Variation E) data model.
 *
 * Consolidated-model expression of Classification as ONE ranked-hierarchical
 * attribute:
 *   - The ranked TIER (Unclassified < Protected A < Protected B …) is the spine
 *     compared against user Clearance (tier scale linked to Clearance, UAS-sourced).
 *   - Display-only sub-markings NEST inside a tier (Official use only under
 *     Unclassified; a TLP branch → TLP-CLEAR … TLP-RED). Nested markings ride
 *     along for display and do NOT enter the rank comparison.
 *   - Releasability/Caveat is a SEPARATE Select attribute, enforced against
 *     Nationality — nested = display-only; separate attribute = independently
 *     compared.
 */

export type CatalogAttrType = 'Ranked · Hierarchical' | 'Select' | 'Ranked';

export type CatalogResource = 'Users' | 'Channels' | 'Posts' | 'Teams';

/** A node in the Classification hierarchy tree. */
export interface ClassificationNode {
  id: string;
  label: string;
  /**
   * Ranked tiers carry an integer rank (the spine compared against Clearance).
   * Display-only markings omit rank — they nest under a tier and never enter
   * the comparison.
   */
  rank?: number;
  /** Display-only markings nested under this tier. */
  children?: ClassificationNode[];
  /**
   * When true this node is a display-only marking (not part of the ranked
   * comparison). Set on every nested marking.
   */
  displayOnly?: boolean;
  /** Optional grouping label shown on an intermediate branch (e.g. "TLP"). */
  branch?: boolean;
}

/** Catalog row shown in the attribute catalog table. */
export interface CatalogAttr {
  id: string;
  name: string;
  type: CatalogAttrType;
  /** Short one-line description of what the attribute compares against. */
  comparedAgainst: string;
  appliesTo: CatalogResource[];
  /** Externally sourced (UAS/LDAP) → values are read-only, shown with a lock. */
  externallyOwned?: boolean;
  externalSystem?: string;
  /** In use by N membership/access policies. */
  inUseByPolicies: number;
  /** Classification only: the ranked-hierarchical tree. */
  tree?: ClassificationNode[];
  /** Non-hierarchical value labels (Select / Ranked). */
  values?: { id: string; label: string; rank?: number }[];
  /** This attribute's tier scale is linked to another (Classification ↔ Clearance). */
  linkedScaleTo?: string;
}

/** The ranked-hierarchical Classification tree (locked model). */
export const CLASSIFICATION_TREE: ClassificationNode[] = [
  {
    id: 'unclassified',
    label: 'Unclassified',
    rank: 0,
    children: [
      {
        id: 'ofuo',
        label: 'Official use only',
        displayOnly: true,
      },
      {
        id: 'tlp',
        label: 'TLP',
        branch: true,
        displayOnly: true,
        children: [
          { id: 'tlp-clear', label: 'TLP-CLEAR', displayOnly: true },
          { id: 'tlp-green', label: 'TLP-GREEN', displayOnly: true },
          { id: 'tlp-amber', label: 'TLP-AMBER', displayOnly: true },
          {
            id: 'tlp-amber-strict',
            label: 'TLP-AMBER_STRICT',
            displayOnly: true,
          },
          { id: 'tlp-red', label: 'TLP-RED', displayOnly: true },
        ],
      },
    ],
  },
  { id: 'protected-a', label: 'Protected A', rank: 1 },
  { id: 'protected-b', label: 'Protected B', rank: 2 },
  { id: 'protected-c', label: 'Protected C', rank: 3 },
];

/** Clearance shares the same ranked tier scale (owns it; UAS-sourced). */
export const CLEARANCE_VALUES = [
  { id: 'c-unclassified', label: 'Unclassified', rank: 0 },
  { id: 'c-protected-a', label: 'Protected A', rank: 1 },
  { id: 'c-protected-b', label: 'Protected B', rank: 2 },
  { id: 'c-protected-c', label: 'Protected C', rank: 3 },
];

/** Releasability — a SEPARATE Select attribute compared against Nationality. */
export const RELEASABILITY_VALUES = [
  { id: 'noforn', label: 'NOFORN' },
  { id: 'rel-gbr', label: 'REL TO GBR' },
  { id: 'rel-can', label: 'REL TO CAN' },
  { id: 'rel-fvey', label: 'REL TO FVEY' },
];

export const CATALOG: CatalogAttr[] = [
  {
    id: 'classification',
    name: 'Classification',
    type: 'Ranked · Hierarchical',
    comparedAgainst: 'Compared against user Clearance',
    appliesTo: ['Channels', 'Posts', 'Teams'],
    inUseByPolicies: 3,
    tree: CLASSIFICATION_TREE,
    linkedScaleTo: 'Clearance',
  },
  {
    id: 'releasability',
    name: 'Releasability',
    type: 'Select',
    comparedAgainst: 'Compared against user Nationality',
    appliesTo: ['Channels', 'Posts'],
    inUseByPolicies: 1,
    values: RELEASABILITY_VALUES,
  },
  {
    id: 'clearance',
    name: 'Clearance',
    type: 'Ranked',
    comparedAgainst: 'User attribute · owns the tier scale',
    appliesTo: ['Users'],
    externallyOwned: true,
    externalSystem: 'UAS',
    inUseByPolicies: 4,
    values: CLEARANCE_VALUES,
    linkedScaleTo: 'Classification',
  },
];

/** Count of ranked tiers (the spine) vs display-only markings in a tree. */
export function treeCounts(tree: ClassificationNode[]): {
  tiers: number;
  markings: number;
} {
  let tiers = 0;
  let markings = 0;
  const walk = (nodes: ClassificationNode[]) => {
    for (const n of nodes) {
      if (n.displayOnly) {
        if (!n.branch) markings += 1;
      } else if (n.rank != null) {
        tiers += 1;
      }
      if (n.children) walk(n.children);
    }
  };
  walk(tree);
  return { tiers, markings };
}
