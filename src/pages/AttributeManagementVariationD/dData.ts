/**
 * Attribute Management — Variation D data model.
 *
 * Extends the shared V2 model with per-resource value overlays:
 *   - disable-for-new on base catalog values (no deletion)
 *
 * Global `Attribute.values` remains the canonical catalog. Resource bindings
 * customize which values are offered on each resource without removing them
 * from the platform.
 */

import {
  ATTRIBUTES,
  type Attribute,
  type Resource,
  type ResourceBinding,
  type ValueOption,
  isMirroring,
  isReadOnlyValues,
} from '../AttributeManagementV2/data';

export { isMirroring, isReadOnlyValues };

/** Per-resource value customization layered on the global catalog. */
export interface ResourceValueOverlay {
  /** Base value IDs disabled for NEW assignment on this resource. Existing kept. */
  disabledForNewIds?: string[];
}

export interface ResourceBindingD extends ResourceBinding {
  valueOverlay?: ResourceValueOverlay;
}

export interface AttributeD extends Omit<Attribute, 'appliesTo'> {
  appliesTo: ResourceBindingD[];
}

export type EffectiveValue = ValueOption & {
  disabledForNew: boolean;
  /** Shown when a catalog value is disabled for new assignment. */
  inUseCount?: number;
};

function cloneAttributes(): AttributeD[] {
  return ATTRIBUTES.map((a) => ({
    ...a,
    values: a.values.map((v) => ({ ...v })),
    appliesTo: a.appliesTo.map((b) => ({ ...b })),
  })) as AttributeD[];
}

/** Seed overlays exemplifying per-resource value customization. */
function applySeedOverlays(attrs: AttributeD[]): AttributeD[] {
  return attrs.map((a) => {
    if (a.id === 'classification') {
      return {
        ...a,
        appliesTo: a.appliesTo.map((b) => {
          if (b.resource === 'Channels') {
            return {
              ...b,
              valueOverlay: {
                disabledForNewIds: ['c'],
              },
            };
          }
          return b;
        }),
      };
    }
    if (a.id === 'program') {
      return {
        ...a,
        appliesTo: a.appliesTo.map((b) => {
          if (b.resource === 'Channels') {
            return {
              ...b,
              valueOverlay: {
                disabledForNewIds: ['p4'],
              },
            };
          }
          return b;
        }),
      };
    }
    return a;
  });
}

export const ATTRIBUTES_D: AttributeD[] = applySeedOverlays(cloneAttributes());

export function getBinding(
  attr: AttributeD,
  resource: Resource,
): ResourceBindingD | undefined {
  return attr.appliesTo.find((b) => b.resource === resource);
}

export function overlayFor(binding: ResourceBindingD): ResourceValueOverlay {
  return binding.valueOverlay ?? {};
}

export function canCustomizeResourceValues(attr: AttributeD): boolean {
  const takesValues =
    attr.type === 'Ranked' ||
    attr.type === 'Select' ||
    attr.type === 'Multiselect' ||
    attr.type === 'Hierarchical';
  return takesValues;
}

export function canToggleBaseValues(attr: AttributeD): boolean {
  if (isReadOnlyValues(attr)) return false;
  return true;
}

/** Mock in-use counts for disable-for-new affordance. */
const IN_USE_COUNTS: Record<string, Record<string, number>> = {
  classification: { c: 12 },
  program: { p4: 3 },
};

export function inUseCountForValue(
  attr: AttributeD,
  valueId: string,
): number | undefined {
  return IN_USE_COUNTS[attr.id]?.[valueId];
}

export function effectiveValuesForBinding(
  attr: AttributeD,
  binding: ResourceBindingD,
): EffectiveValue[] {
  const overlay = overlayFor(binding);
  const disabled = new Set(overlay.disabledForNewIds ?? []);
  const catalog: EffectiveValue[] = attr.values.map((v) => ({
    ...v,
    disabledForNew: disabled.has(v.id),
    inUseCount: disabled.has(v.id)
      ? inUseCountForValue(attr, v.id)
      : undefined,
  }));
  if (attr.type === 'Ranked' || attr.type === 'Hierarchical') {
    return [...catalog].sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0));
  }
  return catalog;
}

export function enabledCountForBinding(
  attr: AttributeD,
  binding: ResourceBindingD,
): { enabled: number; total: number } {
  const effective = effectiveValuesForBinding(attr, binding);
  const enabled = effective.filter((v) => !v.disabledForNew).length;
  return { enabled, total: effective.length };
}

export function effectiveValuesSummary(
  attr: AttributeD,
  resource: Resource | 'All',
): string {
  if (!canCustomizeResourceValues(attr)) {
    return attr.type === 'Text' ? 'Free text' : '—';
  }
  if (resource === 'All') {
    const parts = attr.appliesTo.map((b) => {
      const { enabled, total } = enabledCountForBinding(attr, b);
      return `${b.resource}: ${enabled}/${total}`;
    });
    return parts.join(' · ');
  }
  const binding = getBinding(attr, resource);
  if (!binding) return '—';
  const { enabled, total } = enabledCountForBinding(attr, binding);
  return `${enabled} of ${total} enabled`;
}

export function defaultBindingD(resource: Resource): ResourceBindingD {
  switch (resource) {
    case 'Users':
      return { resource, whoSets: 'System admin', userDisplay: 'hide-empty' };
    case 'Channels':
      return {
        resource,
        required: false,
        whoSets: 'Channel admin',
        displayLocations: ['Sidebar'],
        inheritMode: 'off',
      };
    case 'Posts':
      return { resource, required: false, whoSets: 'Post author' };
    case 'Teams':
      return { resource, required: false, whoSets: 'Team admin' };
  }
}

export function toggleValueForNew(
  binding: ResourceBindingD,
  valueId: string,
  enabled: boolean,
): ResourceBindingD {
  const overlay = overlayFor(binding);
  const current = new Set(overlay.disabledForNewIds ?? []);
  if (enabled) {
    current.delete(valueId);
  } else {
    current.add(valueId);
  }
  return {
    ...binding,
    valueOverlay: {
      ...overlay,
      disabledForNewIds: current.size > 0 ? Array.from(current) : undefined,
    },
  };
}
