/**
 * Membership Policy editor — attribute-requirement data model.
 *
 * Enforcement is authored as attribute-requirement rows (never raw code):
 *   [User attribute] [operator] [value or variable]
 * Operators are type-aware. Values are either a pre-approved literal (no free
 * text) or a variable referencing a type-compatible resource attribute.
 */

export type AttrKind = 'ranked' | 'select' | 'multiselect';

/** Type-aware operator sets. */
export const OPERATORS: Record<AttrKind, { id: string; label: string }[]> = {
  ranked: [
    { id: 'at-least', label: 'is at least' },
    { id: 'at-most', label: 'is at most' },
  ],
  select: [
    { id: 'is', label: 'is' },
    { id: 'is-one-of', label: 'is one of' },
  ],
  multiselect: [
    { id: 'includes', label: 'includes' },
    { id: 'includes-any', label: 'includes any of' },
  ],
};

/** A user attribute available on the left of a requirement row. */
export interface UserAttrOption {
  id: string;
  label: string; // e.g. "User: Clearance"
  kind: AttrKind;
}

export const USER_ATTRS: UserAttrOption[] = [
  { id: 'clearance', label: 'User: Clearance', kind: 'ranked' },
  { id: 'program', label: 'User: Program', kind: 'multiselect' },
  { id: 'nationality', label: 'User: Nationality', kind: 'select' },
  { id: 'coi', label: 'User: Community of interest', kind: 'multiselect' },
];

/** A resource attribute usable as a variable on the right of a row. */
export interface VariableOption {
  id: string;
  label: string; // e.g. "Channel: Classification"
  kind: AttrKind;
}

export const VARIABLES: VariableOption[] = [
  { id: 'ch-classification', label: 'Channel: Classification', kind: 'ranked' },
  { id: 'ch-program', label: 'Channel: Program', kind: 'multiselect' },
  { id: 'ch-releasability', label: 'Channel: Releasability', kind: 'select' },
];

/** Pre-approved literal values, per user attribute. */
export const LITERALS: Record<string, { id: string; label: string }[]> = {
  clearance: [
    { id: 'unclassified', label: 'Unclassified' },
    { id: 'protected-a', label: 'Protected A' },
    { id: 'protected-b', label: 'Protected B' },
    { id: 'protected-c', label: 'Protected C' },
  ],
  program: [
    { id: 'aurora', label: 'Aurora' },
    { id: 'beacon', label: 'Beacon' },
    { id: 'cipher', label: 'Cipher' },
  ],
  nationality: [
    { id: 'usa', label: 'USA' },
    { id: 'gbr', label: 'GBR' },
    { id: 'can', label: 'CAN' },
    { id: 'aus', label: 'AUS' },
  ],
  coi: [
    { id: 'maritime-isr', label: 'Maritime ISR' },
    { id: 'cyber-defense', label: 'Cyber Defense' },
  ],
};

export type RequirementValue =
  | { mode: 'variable'; variableId: string }
  | { mode: 'literal'; labels: string[] };

export interface Requirement {
  id: string;
  userAttrId: string;
  operatorId: string;
  value: RequirementValue;
}

/** Seed rows across multiple attribute types (genericity). */
export const SEED_REQUIREMENTS: Requirement[] = [
  {
    id: 'req-1',
    userAttrId: 'clearance',
    operatorId: 'at-least',
    value: { mode: 'variable', variableId: 'ch-classification' },
  },
  {
    id: 'req-2',
    userAttrId: 'program',
    operatorId: 'includes-any',
    value: { mode: 'variable', variableId: 'ch-program' },
  },
  {
    id: 'req-3',
    userAttrId: 'nationality',
    operatorId: 'is-one-of',
    value: { mode: 'literal', labels: ['USA', 'GBR', 'CAN'] },
  },
];

export function userAttr(id: string): UserAttrOption | undefined {
  return USER_ATTRS.find((a) => a.id === id);
}

export function variable(id: string): VariableOption | undefined {
  return VARIABLES.find((v) => v.id === id);
}

/** Matching-users test result (mock). */
export interface MatchResult {
  matched: number;
  total: number;
  sample: { id: string; name: string; src: string }[];
}
