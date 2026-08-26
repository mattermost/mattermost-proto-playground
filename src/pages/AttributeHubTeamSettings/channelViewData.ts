import {
  ATTR_TYPE_OPTIONS,
  channelDisplayIncludes,
  coerceValueEditabilityForType,
  resolveInheritMode,
  resolveValueEditability,
  takesValueListForType,
  type AttrType,
  type DisplayWhere,
  type HubAttribute,
  type ResourceConfig,
  type ValueEditability,
} from '@/pages/AttributeManagementHub/hubData';
import { CHANNEL_ATTRIBUTES, isChannelAttributeReadOnly } from './channelData';
import { TEAM_ATTRIBUTES } from './teamData';
import type { PostCustomAttribute } from './postViewData';
import { CHANNEL_ATTRIBUTE_DEFAULTS } from './postViewData';

export type ChannelCustomAttribute = PostCustomAttribute;

export function slugifyChannelName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export interface ChannelAttributeValue {
  attributeId: string;
  valueId: string;
}

/** Per-channel overrides for catalog attribute bindings. */
export interface ChannelBindingOverride {
  name?: string;
  required?: boolean;
  showWhere?: DisplayWhere[];
  valueEditability?: ValueEditability;
  allowNewOptions?: boolean;
}

export interface ChannelDemoState {
  attributes: ChannelAttributeValue[];
  customAttributes: ChannelCustomAttribute[];
  bindingOverrides: Record<string, ChannelBindingOverride>;
}

export interface EffectiveChannelBinding {
  required: boolean;
  showWhere: DisplayWhere[];
  valueEditability: ValueEditability;
  allowNewOptions: boolean;
}

export const CHANNEL_ATTRIBUTE_TYPES: AttrType[] = [...ATTR_TYPE_OPTIONS];

/** Initial channel attribute values for #alpha-coordination info sidebar. */
export const CHANNEL_INFO_SEED: ChannelDemoState = {
  attributes: [
    { attributeId: 'classification', valueId: 's' },
    { attributeId: 'program', valueId: 'pg-aurora' },
    { attributeId: 'caveat', valueId: 'cav-noforn' },
    { attributeId: 'engagement-tempo', valueId: 'et-elevated' },
    { attributeId: 'mission-phase', valueId: 'mp-exec' },
    { attributeId: 'channel-attr-ops-window', valueId: 'ow-day' },
    { attributeId: 'channel-attr-watch-floor', valueId: 'wf-alpha' },
  ],
  customAttributes: [],
  // Header chips: 6 attrs (Classification uses Banner); 3 visible + "+3 more".
  bindingOverrides: {
    'channel-attr-ops-window': { showWhere: ['Header', 'Sidebar'] },
    'channel-attr-watch-floor': { showWhere: ['Header', 'Sidebar'] },
  },
};

export function effectiveChannelBinding(
  attribute: HubAttribute,
  binding: ResourceConfig,
  overrides: ChannelBindingOverride = {},
): EffectiveChannelBinding {
  const showWhere = overrides.showWhere ?? binding.showWhere ?? ['Sidebar'];
  return {
    required: overrides.required ?? binding.required,
    showWhere,
    valueEditability: coerceValueEditabilityForType(
      attribute.type,
      overrides.valueEditability ?? resolveValueEditability(binding),
    ),
    allowNewOptions: overrides.allowNewOptions ?? false,
  };
}

export function effectiveCustomBinding(
  overrides: ChannelBindingOverride = {},
): EffectiveChannelBinding {
  return {
    required: overrides.required ?? false,
    showWhere: overrides.showWhere ?? ['Sidebar'],
    valueEditability: overrides.valueEditability ?? 'editable',
    allowNewOptions: overrides.allowNewOptions ?? true,
  };
}

export function patchChannelBindingOverride(
  state: ChannelDemoState,
  attributeId: string,
  patch: Partial<ChannelBindingOverride>,
): ChannelDemoState {
  const current = state.bindingOverrides[attributeId] ?? {};
  return {
    ...state,
    bindingOverrides: {
      ...state.bindingOverrides,
      [attributeId]: { ...current, ...patch },
    },
  };
}

/** Attributes configured for this channel with sidebar display. */
export function channelScopedAttributes(
  extra: HubAttribute[] = [],
): HubAttribute[] {
  const fromChannel = CHANNEL_ATTRIBUTES.filter((attribute) =>
    attribute.appliesTo.some(
      (binding) =>
        binding.resource === 'Channels' &&
        (binding.showWhere?.includes('Sidebar') ?? false),
    ),
  );

  const missionPhase = TEAM_ATTRIBUTES.find(
    (attribute) => attribute.id === 'mission-phase',
  );

  const base = (() => {
    if (!missionPhase) return fromChannel;

    const missionForChannels: HubAttribute = {
      ...missionPhase,
      appliesTo: missionPhase.appliesTo.filter(
        (binding) => binding.resource === 'Channels',
      ),
    };
    if (missionForChannels.appliesTo.length === 0) return fromChannel;

    const withoutMission = fromChannel.filter(
      (attribute) => attribute.id !== 'mission-phase',
    );
    return [...withoutMission, missionForChannels];
  })();

  const seen = new Set(base.map((attribute) => attribute.id));
  const merged = [...base];
  for (const attribute of extra) {
    if (seen.has(attribute.id)) continue;
    seen.add(attribute.id);
    merged.push(attribute);
  }
  return merged;
}

export function channelBinding(
  attribute: HubAttribute,
): ResourceConfig | undefined {
  return attribute.appliesTo.find((binding) => binding.resource === 'Channels');
}

export function isChannelAttributeLocked(
  attribute: HubAttribute,
  binding: ResourceConfig,
): boolean {
  if (binding.valueEditability === 'locked') return true;
  if (isChannelAttributeReadOnly(attribute)) return true;
  const mode = resolveInheritMode(binding);
  return mode === 'inherit-lock';
}

/** Channel info sidebar: label lock icon + locked label menu (display location only). */
export function isChannelInfoLabelLocked(
  attribute: HubAttribute,
  binding: ResourceConfig,
): boolean {
  return isChannelAttributeLocked(attribute, binding);
}

/**
 * Channel info sidebar: whether the assigned value is read-only.
 * Program stays label-locked (UAS-synced definition) but channel admins may change the value.
 */
export function isChannelInfoValueLocked(
  attribute: HubAttribute,
  binding: ResourceConfig,
): boolean {
  if (attribute.id === 'program') return false;
  return isChannelAttributeLocked(attribute, binding);
}

export interface HeaderChannelAttribute {
  id: string;
  name: string;
  valueId: string;
  label: string;
  isClassification: boolean;
  useChip: boolean;
  locked: boolean;
}

export interface ChannelClassificationBannerState {
  valueId: string;
  label: string;
  locked: boolean;
}

function headerValueUsesChip(
  attribute: HubAttribute | ChannelCustomAttribute,
  attributeId: string,
): boolean {
  if (attributeId === 'classification') return false;
  return takesValueListForType(attribute.type);
}

/** Classification value for the full-width channel banner when Banner display is on. */
export function channelClassificationBanner(
  channel: ChannelDemoState,
): ChannelClassificationBannerState | null {
  const attribute = channelScopedAttributes().find(
    (row) => row.id === 'classification',
  );
  if (!attribute) return null;

  const instance = channel.attributes.find(
    (row) => row.attributeId === 'classification',
  );
  if (!instance) return null;

  const binding = channelBinding(attribute);
  if (!binding) return null;

  const overrides = channel.bindingOverrides.classification ?? {};
  const effective = effectiveChannelBinding(attribute, binding, overrides);
  if (!channelDisplayIncludes(effective.showWhere, 'Banner')) return null;

  return {
    valueId: instance.valueId,
    label: channelValueLabel(attribute, instance.valueId),
    locked: isChannelAttributeLocked(attribute, binding),
  };
}

/** Classification banner state regardless of Banner display location (prototype forcing). */
export function channelClassificationBannerForced(
  channel: ChannelDemoState,
): ChannelClassificationBannerState | null {
  const attribute = channelScopedAttributes().find(
    (row) => row.id === 'classification',
  );
  if (!attribute) return null;

  const instance = channel.attributes.find(
    (row) => row.attributeId === 'classification',
  );
  if (!instance) return null;

  const binding = channelBinding(attribute);
  if (!binding) return null;

  return {
    valueId: instance.valueId,
    label: channelValueLabel(attribute, instance.valueId),
    locked: isChannelAttributeLocked(attribute, binding),
  };
}

/** Demo seed: classification chip in header (not banner), six header attrs → "+3 more". */
export const CHANNEL_VIEW_FIGMA_SEED: ChannelDemoState = {
  attributes: [
    { attributeId: 'classification', valueId: 'u' },
    { attributeId: 'program', valueId: 'pg-aurora' },
    { attributeId: 'caveat', valueId: 'cav-noforn' },
    { attributeId: 'engagement-tempo', valueId: 'et-elevated' },
    { attributeId: 'mission-phase', valueId: 'mp-exec' },
    { attributeId: 'channel-attr-ops-window', valueId: 'ow-day' },
    { attributeId: 'channel-attr-watch-floor', valueId: 'wf-alpha' },
  ],
  customAttributes: [],
  bindingOverrides: {
    classification: { showWhere: ['Header', 'Sidebar'] },
    'channel-attr-ops-window': { showWhere: ['Header', 'Sidebar'] },
    'channel-attr-watch-floor': { showWhere: ['Header', 'Sidebar'] },
  },
};

/** Channel attributes configured for Header display with resolved values. */
export function headerChannelAttributes(
  channel: ChannelDemoState,
): HeaderChannelAttribute[] {
  const instanceById = new Map(
    channel.attributes.map((row) => [row.attributeId, row]),
  );
  const results: HeaderChannelAttribute[] = [];

  for (const attribute of channelScopedAttributes()) {
    if (!instanceById.has(attribute.id)) continue;

    const binding = channelBinding(attribute);
    if (!binding) continue;

    const overrides = channel.bindingOverrides[attribute.id] ?? {};
    const effective = effectiveChannelBinding(attribute, binding, overrides);
    if (!channelDisplayIncludes(effective.showWhere, 'Header')) continue;
    if (
      attribute.id === 'classification' &&
      channelDisplayIncludes(effective.showWhere, 'Banner')
    ) {
      continue;
    }

    const row = instanceById.get(attribute.id)!;
    results.push({
      id: attribute.id,
      name: overrides.name ?? attribute.name,
      valueId: row.valueId,
      label: channelValueLabel(attribute, row.valueId),
      isClassification: attribute.id === 'classification',
      useChip: headerValueUsesChip(attribute, attribute.id),
      locked: isChannelAttributeLocked(attribute, binding),
    });
  }

  for (const custom of channel.customAttributes) {
    const overrides = channel.bindingOverrides[custom.id] ?? {};
    const effective = effectiveCustomBinding(overrides);
    if (!channelDisplayIncludes(effective.showWhere, 'Header')) continue;
    if (!custom.selectedValueId) continue;

    const label =
      custom.values.find((value) => value.id === custom.selectedValueId)
        ?.label ?? '—';

    results.push({
      id: custom.id,
      name: overrides.name ?? custom.name,
      valueId: custom.selectedValueId,
      label,
      isClassification: false,
      useChip: headerValueUsesChip(custom, custom.id),
      locked: false,
    });
  }

  return results;
}

export function channelValueLabel(
  attribute: HubAttribute,
  valueId: string,
): string {
  if (attribute.id === 'classification') {
    const labels: Record<string, string> = {
      ts: 'TOP SECRET',
      s: 'SECRET',
      c: 'CONFIDENTIAL',
      cui: 'CUI',
      u: 'UNCLASSIFIED',
    };
    return labels[valueId] ?? '—';
  }
  return attribute.values.find((value) => value.id === valueId)?.label ?? '—';
}

export function defaultChannelAttributeValue(attribute: HubAttribute): string {
  const preset = CHANNEL_ATTRIBUTE_DEFAULTS[attribute.id];
  if (preset) return preset;
  return attribute.values[0]?.id ?? '';
}

export function addCustomAttributeToChannel(
  state: ChannelDemoState,
  type: AttrType,
): ChannelDemoState {
  const id = `channel-attr-${Date.now()}`;
  const custom: ChannelCustomAttribute = {
    id,
    name: 'New attribute',
    type,
    values: [],
    selectedValueId: '',
  };
  return {
    ...state,
    customAttributes: [...state.customAttributes, custom],
  };
}

export function updateCustomAttributeOnChannel(
  state: ChannelDemoState,
  id: string,
  patch: Partial<Pick<ChannelCustomAttribute, 'name' | 'selectedValueId'>>,
): ChannelDemoState {
  return {
    ...state,
    customAttributes: state.customAttributes.map((row) =>
      row.id === id ? { ...row, ...patch } : row,
    ),
  };
}

export function addCustomAttributeValueOnChannel(
  state: ChannelDemoState,
  id: string,
  label: string,
): ChannelDemoState {
  const trimmed = label.trim();
  if (!trimmed) return state;

  return {
    ...state,
    customAttributes: state.customAttributes.map((row) => {
      if (row.id !== id) return row;
      const valueId = `val-${Date.now()}`;
      return {
        ...row,
        values: [...row.values, { id: valueId, label: trimmed }],
        selectedValueId: valueId,
      };
    }),
  };
}

export function removeAttributeFromChannel(
  state: ChannelDemoState,
  attributeId: string,
): ChannelDemoState {
  return {
    ...state,
    attributes: state.attributes.filter((row) => row.attributeId !== attributeId),
  };
}

export function removeCustomAttributeFromChannel(
  state: ChannelDemoState,
  id: string,
): ChannelDemoState {
  return {
    ...state,
    customAttributes: state.customAttributes.filter((row) => row.id !== id),
  };
}

export function updateChannelAttributeValue(
  state: ChannelDemoState,
  attributeId: string,
  valueId: string,
): ChannelDemoState {
  const exists = state.attributes.some((row) => row.attributeId === attributeId);
  if (!exists) {
    return {
      ...state,
      attributes: [...state.attributes, { attributeId, valueId }],
    };
  }
  return {
    ...state,
    attributes: state.attributes.map((row) =>
      row.attributeId === attributeId ? { ...row, valueId } : row,
    ),
  };
}
