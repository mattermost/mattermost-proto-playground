/**
 * Simplified-scene local model. Extends the read-only baseline `hubData`
 * with concepts the Simplified brief adds without editing shared files:
 *
 *  - Terminology: "values" → **Options**; keep **Value** / **Tier**; keep
 *    **Ranked-hierarchical**; add rank-agnostic **Hierarchical** type.
 *  - Rich option metadata (color, external-source color, translations).
 *  - Four-mode inheritance ceiling (edge-scoped, self-hiding).
 *  - Per-resource naming ("Name on {resource}").
 *
 * All of this is scene-local: baseline types are imported read-only and never
 * mutated. Extra per-option / per-resource state is held in a side table keyed
 * by id so we never touch shared seed data.
 */
import type {
  AttrType,
  HubAttribute,
  ResourceConfig,
  ResourceKind,
  AttrValue,
} from '@/pages/AttributeManagementHub/hubData';

// ── Types available in the Simplified type picker ──────────────────────────
//
// Baseline `AttrType` has no "Hierarchical". We model the local superset as a
// string union and coerce at the baseline boundary (the stored attribute keeps
// its baseline type; "Hierarchical" is a scene-local presentation flavour of a
// tree that does not compare rank).

export type SimplifiedAttrType = AttrType | 'Hierarchical';

export const SIMPLIFIED_ATTR_TYPES: SimplifiedAttrType[] = [
  'Select',
  'Multiselect',
  'Ranked',
  'Ranked-hierarchical',
  'Hierarchical',
  'Text',
];

/** Scene-local flavour store: attributes flagged as rank-agnostic trees. */
const HIERARCHICAL_FLAVOUR = new Set<string>();

export function markHierarchical(attributeId: string, on: boolean): void {
  if (on) HIERARCHICAL_FLAVOUR.add(attributeId);
  else HIERARCHICAL_FLAVOUR.delete(attributeId);
}

export function isHierarchicalFlavour(attributeId: string): boolean {
  return HIERARCHICAL_FLAVOUR.has(attributeId);
}

/**
 * The type shown in the Simplified UI. A baseline "Ranked-hierarchical" that a
 * user has switched to rank-agnostic reads back as "Hierarchical".
 */
export function displayType(attribute: HubAttribute): SimplifiedAttrType {
  if (
    attribute.type === 'Ranked-hierarchical' &&
    isHierarchicalFlavour(attribute.id)
  ) {
    return 'Hierarchical';
  }
  return attribute.type;
}

/** Both tree types render the nested tree; only Ranked-hierarchical compares rank. */
export function isTreeType(type: SimplifiedAttrType): boolean {
  return type === 'Ranked-hierarchical' || type === 'Hierarchical';
}

export function comparesRank(type: SimplifiedAttrType): boolean {
  return type === 'Ranked' || type === 'Ranked-hierarchical';
}

// ── Terminology (Simplified) ───────────────────────────────────────────────
// "values" → "Options" for the option domain; "Value" stays for the discrete
// assigned value; "Tier" stays for a ranked position.

/** Option-domain count for the Definition heading, e.g. "5 tiers" / "12 options". */
export function optionCountLabel(attribute: HubAttribute): string {
  const type = displayType(attribute);
  if (type === 'Text') return 'Free text';
  if (comparesRank(type)) {
    const tiers = attribute.values.filter((v) => v.tier != null).length;
    return `${tiers} ${tiers === 1 ? 'tier' : 'tiers'}`;
  }
  let n = 0;
  const walk = (vs: { children?: unknown[] }[]) => {
    for (const v of vs) {
      n += 1;
      if (Array.isArray(v.children)) walk(v.children as typeof vs);
    }
  };
  walk(attribute.values);
  return `${n} ${n === 1 ? 'option' : 'options'}`;
}

// ── Rich option editor: color + external color + translations ──────────────
//
// Held in a scene-local side table keyed by value id so the baseline
// `AttrValue` shape is never widened.

export interface OptionMeta {
  /** Chosen swatch color token (CSS custom property expression) or null. */
  color?: string | null;
  /** True when the color is provided by the connected external source. */
  colorFromSource?: boolean;
  /** locale → translated label. */
  translations?: Record<string, string>;
}

const OPTION_META: Record<string, OptionMeta> = {
  // Seeded so the demo popover opens on a realistic option (Classification tiers).
  'protected-b': {
    color: 'var(--color-red-500)',
    translations: { fr: 'Protégé B', de: 'Geschützt B' },
  },
  'protected-a': {
    color: 'var(--color-orange-500)',
    translations: { fr: 'Protégé A' },
  },
  unclassified: {
    color: 'var(--color-green-500)',
  },
  // Clearance tiers carry a source-provided color (synced from UAS).
  'cl-3': { color: 'var(--color-red-500)', colorFromSource: true },
  'cl-2': { color: 'var(--color-orange-500)', colorFromSource: true },
  'cl-1': { color: 'var(--color-green-500)', colorFromSource: true },
};

export function optionMeta(valueId: string): OptionMeta {
  return OPTION_META[valueId] ?? {};
}

export function setOptionMeta(valueId: string, next: OptionMeta): void {
  OPTION_META[valueId] = { ...OPTION_META[valueId], ...next };
}

/** Banner palette key for filled option chips (Figma Input Chip + plain fallback). */
export type OptionColorScheme =
  | 'green'
  | 'blue'
  | 'red'
  | 'orange'
  | 'purple'
  | 'neutral'
  | 'plain';

/** Map a stored swatch token to the banner scheme used by ColoredRankedInputChip. */
export function optionColorScheme(valueId: string): OptionColorScheme {
  const color = optionMeta(valueId).color;
  if (!color) return 'plain';
  if (color.includes('green')) return 'green';
  if (color.includes('blue')) return 'blue';
  if (color.includes('red')) return 'red';
  if (color.includes('orange')) return 'orange';
  if (color.includes('yellow')) return 'orange';
  if (color.includes('purple')) return 'purple';
  return 'neutral';
}

/** Assign contiguous ranks 1..N to top-level values (Ranked / Ranked-hierarchical). */
export function assignSequentialTiers(values: AttrValue[]): AttrValue[] {
  let tier = 1;
  return values.map((value) => ({ ...value, tier: tier++ }));
}

/** Clear rank from top-level values when leaving a ranked type. */
export function stripTiers(values: AttrValue[]): AttrValue[] {
  return values.map((value) => ({ ...value, tier: undefined }));
}

/** Keep value ranks aligned with the active simplified type. */
export function syncValuesWithType(attribute: HubAttribute): HubAttribute {
  const type = displayType(attribute);
  if (comparesRank(type)) {
    const needsTiers = attribute.values.some((value) => value.tier == null);
    if (!needsTiers) return attribute;
    return { ...attribute, values: assignSequentialTiers(attribute.values) };
  }
  const hasTiers = attribute.values.some((value) => value.tier != null);
  if (!hasTiers) return attribute;
  return { ...attribute, values: stripTiers(attribute.values) };
}

/** Swatch palette for the rich option editor (theme tokens only). */
export const OPTION_SWATCHES: { id: string; token: string; label: string }[] = [
  { id: 'red', token: 'var(--color-red-500)', label: 'Red' },
  { id: 'orange', token: 'var(--color-orange-500)', label: 'Orange' },
  { id: 'yellow', token: 'var(--color-yellow-600)', label: 'Yellow' },
  { id: 'green', token: 'var(--color-green-500)', label: 'Green' },
  { id: 'blue', token: 'var(--color-blue-400)', label: 'Blue' },
  { id: 'purple', token: 'var(--color-purple-500)', label: 'Purple' },
];

/** Locales offered in the Translations sub-editor. */
export const OPTION_LOCALES: { code: string; label: string }[] = [
  { code: 'fr', label: 'French' },
  { code: 'de', label: 'German' },
  { code: 'es', label: 'Spanish' },
  { code: 'ja', label: 'Japanese' },
];

export function localeLabel(code: string): string {
  return OPTION_LOCALES.find((l) => l.code === code)?.label ?? code;
}

// ── Four-mode inheritance ceiling (edge-scoped) ────────────────────────────
//
// The baseline `InheritMode` is a 3-value union ('off' | 'inherit' |
// 'inherit-lock'). The Simplified brief needs four ceiling modes for ranked
// types plus a two-mode set for everything else. We map the richer local mode
// onto the baseline `inheritMode` field so state still round-trips through the
// baseline `ResourceConfig` without widening it.

export type CeilingMode =
  | 'off'
  | 'no-constraint'
  | 'no-below'
  | 'no-above'
  | 'locked';

/** Read the local ceiling mode out of the baseline config. */
export function resolveCeiling(cfg: ResourceConfig): CeilingMode {
  const stored = CEILING_MODE[cfg.resource + ':' + ceilingKey(cfg)];
  if (stored) return stored;
  // Fall back to baseline inheritMode when no richer choice recorded yet.
  if (cfg.inheritMode === 'inherit-lock') return 'locked';
  if (cfg.inheritMode === 'inherit') return 'no-constraint';
  if (cfg.inheritToChild) return 'locked';
  return 'off';
}

// Side table keyed by resource + a per-attribute discriminator so two
// attributes' Channel bindings don't collide.
const CEILING_MODE: Record<string, CeilingMode> = {};

function ceilingKey(cfg: ResourceConfig): string {
  return cfg.defaultValueId ? String(cfg.defaultValueId) : 'binding';
}

export function ceilingStorageKey(
  attributeId: string,
  resource: ResourceKind,
): string {
  return `${attributeId}:${resource}`;
}

/** Record the local ceiling mode AND the baseline-compatible inheritMode. */
export function ceilingToBaseline(mode: CeilingMode): Partial<ResourceConfig> {
  if (mode === 'off') return { inheritMode: 'off', inheritToChild: undefined };
  if (mode === 'locked') {
    return { inheritMode: 'inherit-lock', inheritToChild: undefined };
  }
  // no-constraint / no-below / no-above all inherit (advisory/soft ceiling).
  return { inheritMode: 'inherit', inheritToChild: undefined };
}

export function storeCeiling(
  attributeId: string,
  resource: ResourceKind,
  mode: CeilingMode,
): void {
  CEILING_MODE[ceilingStorageKey(attributeId, resource)] = mode;
}

export function readStoredCeiling(
  attributeId: string,
  resource: ResourceKind,
): CeilingMode | undefined {
  return CEILING_MODE[ceilingStorageKey(attributeId, resource)];
}

/** Modes offered depend on whether the type compares rank. */
export function ceilingModesFor(
  type: SimplifiedAttrType,
): { key: CeilingMode; label: string }[] {
  if (comparesRank(type)) {
    return [
      { key: 'no-constraint', label: 'No constraint' },
      { key: 'no-below', label: 'Cannot go below the parent value' },
      { key: 'no-above', label: 'Cannot go above the parent value' },
      { key: 'locked', label: 'Locked to the parent value' },
    ];
  }
  return [
    { key: 'no-constraint', label: 'Inherit as default (overridable)' },
    { key: 'locked', label: 'Locked to the parent value' },
  ];
}

/**
 * Flattened inheritance options for the primary (non-Advanced) dropdown.
 *
 * The On/Off toggle is folded in as the leading `off` option, so one control
 * carries the whole decision. Labels name the PARENT explicitly ("the team's
 * value", not "the parent value") because this field now sits directly above
 * "Changing the value" — and both constrain direction. Naming the parent keeps
 * the axes apart: this one is structural (relative to the parent), the one
 * below it is temporal (relative to the value's own prior state).
 */
export function inheritanceModesFor(
  type: SimplifiedAttrType,
  parentLabel: string,
): { key: CeilingMode; label: string }[] {
  const parent = parentLabel.toLowerCase();
  const modes: { key: CeilingMode; label: string }[] = [
    { key: 'off', label: `Does not inherit from the ${parent}` },
    { key: 'no-constraint', label: `Inherits the ${parent}'s value as a default` },
  ];
  if (comparesRank(type)) {
    modes.push(
      { key: 'no-below', label: `Cannot go below the ${parent}'s value` },
      { key: 'no-above', label: `Cannot go above the ${parent}'s value` },
    );
  }
  modes.push({ key: 'locked', label: `Locked to the ${parent}'s value` });
  return modes;
}

export function ceilingSummaryLabel(mode: CeilingMode): string | null {
  switch (mode) {
    case 'off':
      return null;
    case 'no-constraint':
      return 'Inherits';
    case 'no-below':
      return 'No lower than parent';
    case 'no-above':
      return 'No higher than parent';
    case 'locked':
      return 'Locked to parent';
    default:
      return null;
  }
}

// ── Per-resource naming ("Name on {resource}") ─────────────────────────────
//
// Scene-local side table; replaces the removed value-linking flow.

const RESOURCE_NAME: Record<string, string> = {
  // Demo: Classification is surfaced as "Clearance" on user-facing Teams.
  'classification:Teams': 'Clearance',
};

export function resourceName(
  attributeId: string,
  resource: ResourceKind,
): string {
  return RESOURCE_NAME[`${attributeId}:${resource}`] ?? '';
}

export function setResourceName(
  attributeId: string,
  resource: ResourceKind,
  name: string,
): void {
  const key = `${attributeId}:${resource}`;
  if (name.trim()) RESOURCE_NAME[key] = name.trim();
  else delete RESOURCE_NAME[key];
}

// ── Per-resource option additions ──────────────────────────────────────────
//
// Options added from a resource binding join the shared catalog (one rank
// scale for ranked types). New rows are enabled on the introducing resource
// and disabled on other bindings until an admin turns them on there.

const RESOURCE_INTRODUCED_VALUES: Record<string, string[]> = {};

function resourceValueKey(attributeId: string, resource: ResourceKind): string {
  return `${attributeId}:${resource}`;
}

export function markResourceIntroducedValue(
  attributeId: string,
  resource: ResourceKind,
  valueId: string,
): void {
  const key = resourceValueKey(attributeId, resource);
  const current = RESOURCE_INTRODUCED_VALUES[key] ?? [];
  if (!current.includes(valueId)) {
    RESOURCE_INTRODUCED_VALUES[key] = [...current, valueId];
  }
}

export function resourceIntroducedValueIds(
  attributeId: string,
  resource: ResourceKind,
): string[] {
  return RESOURCE_INTRODUCED_VALUES[resourceValueKey(attributeId, resource)] ?? [];
}

export function wasIntroducedOnResource(
  attributeId: string,
  resource: ResourceKind,
  valueId: string,
): boolean {
  return resourceIntroducedValueIds(attributeId, resource).includes(valueId);
}

/** Case-insensitive label match across the flat catalog (tiers + leaves). */
export function findValueByLabel(
  values: AttrValue[],
  label: string,
): AttrValue | undefined {
  const needle = label.trim().toLowerCase();
  if (!needle) return undefined;
  const walk = (rows: AttrValue[]): AttrValue | undefined => {
    for (const row of rows) {
      if (row.label.trim().toLowerCase() === needle) return row;
      if (row.children) {
        const nested = walk(row.children);
        if (nested) return nested;
      }
    }
    return undefined;
  };
  return walk(values);
}

// ── Value linking (exact match + define mapping) ───────────────────────────
//
// Scene-local extension of baseline `valuesLink`. Exact match mirrors the
// source catalog (read-only here). Mapped mode keeps local labels but pins
// each option to a source option so rank comparison stays consistent.

export type ValueLinkMode = 'exact' | 'mapped';

export interface ValueLinkConfig {
  attributeId: string;
  attributeName: string;
  mode: ValueLinkMode;
  /** Local value id → source value id (mapped mode). */
  mappings?: Record<string, string>;
}

const VALUE_LINK_CONFIG: Record<string, ValueLinkConfig> = {
  classification: {
    attributeId: 'clearance',
    attributeName: 'Clearance',
    mode: 'exact',
  },
};

export function resolveValueLink(attribute: HubAttribute): ValueLinkConfig | null {
  const stored = VALUE_LINK_CONFIG[attribute.id];
  if (stored) return stored;
  if (attribute.valuesLink) {
    return { ...attribute.valuesLink, mode: 'exact' };
  }
  return null;
}

export function setValueLinkConfig(
  attributeId: string,
  config: ValueLinkConfig | null,
): void {
  if (config) {
    VALUE_LINK_CONFIG[attributeId] = config;
  } else {
    delete VALUE_LINK_CONFIG[attributeId];
  }
}

export function isValueLinked(attribute: HubAttribute): boolean {
  return resolveValueLink(attribute) != null;
}

/** Linking is offered for manual catalogs that do not own a mirrored scale. */
export function canLinkValues(attribute: HubAttribute): boolean {
  return (
    attribute.source.kind === 'manual' &&
    attribute.type !== 'Text' &&
    !attribute.mirroredBy?.length
  );
}

/** Flatten tiers + leaves for mapping pickers. */
export function flatCatalogValues(values: AttrValue[]): AttrValue[] {
  const out: AttrValue[] = [];
  const walk = (rows: AttrValue[]) => {
    for (const row of rows) {
      out.push(row);
      if (row.children?.length) walk(row.children);
    }
  };
  walk(values);
  return out;
}

/** Seed mappings from case-insensitive label matches. */
export function suggestValueMappings(
  localValues: AttrValue[],
  sourceValues: AttrValue[],
): Record<string, string> {
  const mappings: Record<string, string> = {};
  const sourceByLabel = new Map(
    flatCatalogValues(sourceValues).map((value) => [
      value.label.trim().toLowerCase(),
      value.id,
    ]),
  );
  for (const local of flatCatalogValues(localValues)) {
    const match = sourceByLabel.get(local.label.trim().toLowerCase());
    if (match) mappings[local.id] = match;
  }
  return mappings;
}

export function mappedSourceValue(
  config: ValueLinkConfig,
  sourceAttribute: HubAttribute,
  localValueId: string,
): AttrValue | undefined {
  const sourceId = config.mappings?.[localValueId];
  if (!sourceId) return undefined;
  return flatCatalogValues(sourceAttribute.values).find((v) => v.id === sourceId);
}
