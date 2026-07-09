import {
  HUB_ATTRIBUTES,
  defaultAccessModel,
  defaultResourceConfig,
  isPolicyLocked,
  isSourceOwned,
  whoCanSet,
  type HubAttribute,
  type ResourceConfig,
  type ResourceKind,
} from '@/pages/AttributeManagementHub/hubData';

/** Channel Settings scope — this channel and its posts. */
export const CHANNEL_SCOPE_RESOURCES: ResourceKind[] = ['Channels', 'Posts'];

export const CHANNEL_NAME = 'alpha-coordination';

export const CHANNEL_RESOURCE_LABELS: Partial<Record<ResourceKind, string>> = {
  Channels: 'This channel',
  Posts: 'Posts of this channel',
};

const APPLIES_TO_COPY =
  'Define attributes for this channel and how they apply to posts. Post settings are configured here — there is no separate post settings surface.';

export const CHANNEL_ATTRIBUTES_INTRO = APPLIES_TO_COPY;

export const CHANNEL_CATALOG_TITLE = `Attributes used in #${CHANNEL_NAME}`;

export const CHANNEL_CATALOG_EMPTY =
  'Define your first attribute to apply it to this channel or its posts.';

export const CHANNEL_APPLIES_TO_EMPTY =
  'Add a resource to apply this attribute to this channel, posts within it, or both.';

/** Hub attributes reclassified as channel-local in this scope. */
export const CHANNEL_LOCAL_IDS = new Set([
  'engagement-tempo',
  'caveat',
  'mission-phase',
  'channel-attr-ops-window',
  'channel-attr-watch-floor',
]);

const HUB_ATTRIBUTE_IDS = new Set(HUB_ATTRIBUTES.map((attribute) => attribute.id));

const channelSessionAttributes = new Map<string, HubAttribute>();

/** Persist attributes created in channel settings across workspace remounts. */
export function saveChannelLocalAttribute(attribute: HubAttribute): void {
  CHANNEL_LOCAL_IDS.add(attribute.id);
  channelSessionAttributes.set(attribute.id, attribute);
}

export function isSessionChannelAttribute(attributeId: string): boolean {
  return channelSessionAttributes.has(attributeId);
}

/** Seed workspace state with fixture data plus session-created attributes. */
export function getChannelWorkspaceAttributes(): HubAttribute[] {
  const baseIds = new Set(CHANNEL_ATTRIBUTES.map((attribute) => attribute.id));
  const created = [...channelSessionAttributes.values()].filter(
    (attribute) => !baseIds.has(attribute.id),
  );
  return [...CHANNEL_ATTRIBUTES, ...created];
}

/** Global hub catalog rows; channel-created attrs are everything else. */
export function isSystemChannelAttribute(attribute: HubAttribute): boolean {
  if (CHANNEL_LOCAL_IDS.has(attribute.id)) {
    return false;
  }
  return HUB_ATTRIBUTE_IDS.has(attribute.id);
}

function readChannelSettingsUrl(): URL | null {
  if (typeof window === 'undefined') return null;
  return new URL(window.location.href);
}

export function syncChannelNewAttributeParams(
  applies: ResourceKind[] = ['Posts'],
): void {
  const url = readChannelSettingsUrl();
  if (!url) return;
  url.searchParams.set('tab', 'attributes');
  url.searchParams.set('flow', 'new');
  if (applies.length > 0) {
    url.searchParams.set('applies', applies.join(','));
  } else {
    url.searchParams.delete('applies');
  }
  url.searchParams.delete('attr');
  window.history.replaceState(null, '', url);
}

export function syncChannelAttributeDetailParams(attributeId: string): void {
  const url = readChannelSettingsUrl();
  if (!url) return;
  url.searchParams.set('tab', 'attributes');
  url.searchParams.set('attr', attributeId);
  url.searchParams.delete('flow');
  url.searchParams.delete('applies');
  window.history.replaceState(null, '', url);
}

export function clearChannelNewAttributeParams(): void {
  const url = readChannelSettingsUrl();
  if (!url) return;
  url.searchParams.delete('flow');
  url.searchParams.delete('applies');
  window.history.replaceState(null, '', url);
}

export function clearChannelAttributeDetailParams(): void {
  const url = readChannelSettingsUrl();
  if (!url) return;
  url.searchParams.delete('attr');
  window.history.replaceState(null, '', url);
}

/** Synced or policy-bound attributes open read-only in the detail view. */
export function isChannelAttributeReadOnly(attribute: HubAttribute): boolean {
  return isSourceOwned(attribute) || isPolicyLocked(attribute);
}

function trimToChannelScope(attribute: HubAttribute): HubAttribute {
  return {
    ...attribute,
    appliesTo: attribute.appliesTo.filter((binding) =>
      CHANNEL_SCOPE_RESOURCES.includes(binding.resource),
    ),
  };
}

const CHANNEL_LOCAL: HubAttribute[] = [
  {
    id: 'engagement-tempo',
    name: 'Engagement tempo',
    type: 'Select',
    description:
      'Operating rhythm for this channel — set at channel level and inherited by posts.',
    values: [
      { id: 'et-routine', label: 'Routine' },
      { id: 'et-elevated', label: 'Elevated' },
      { id: 'et-surge', label: 'Surge' },
    ],
    source: { kind: 'manual' },
    appliesTo: [
      {
        resource: 'Channels',
        required: false,
        whoCanSet: whoCanSet('Channel admin'),
        showWhere: ['Header', 'Sidebar'],
      },
      {
        resource: 'Posts',
        required: false,
        whoCanSet: whoCanSet('Post author'),
        showWhere: ['Header', 'Composer'],
        inheritMode: 'inherit',
      },
    ],
    usedByPolicies: 0,
    policyNames: [],
    access: defaultAccessModel('Channel Administrators'),
    readIntoFiltering: false,
  },
  {
    id: 'mission-phase',
    name: 'Mission phase',
    type: 'Select',
    description:
      'Operating phase for the ALPHA program — set on this channel and inherited by posts.',
    values: [
      { id: 'mp-plan', label: 'Planning' },
      { id: 'mp-exec', label: 'Execution' },
      { id: 'mp-sustain', label: 'Sustainment' },
      { id: 'mp-standdown', label: 'Stand-down' },
    ],
    source: { kind: 'manual' },
    appliesTo: [
      {
        resource: 'Channels',
        required: false,
        whoCanSet: whoCanSet('Channel admin'),
        showWhere: ['Header', 'Sidebar'],
      },
      {
        resource: 'Posts',
        required: false,
        whoCanSet: whoCanSet('Post author'),
        showWhere: ['Header', 'Composer'],
        inheritMode: 'inherit',
      },
    ],
    usedByPolicies: 0,
    policyNames: [],
    access: defaultAccessModel('Channel Administrators'),
    readIntoFiltering: false,
  },
  {
    id: 'channel-attr-ops-window',
    name: 'Ops window',
    type: 'Select',
    description: 'Day or night operating window for this channel.',
    values: [
      { id: 'ow-day', label: 'Day' },
      { id: 'ow-night', label: 'Night' },
    ],
    source: { kind: 'manual' },
    appliesTo: [
      {
        resource: 'Channels',
        required: false,
        whoCanSet: whoCanSet('Channel admin'),
        showWhere: ['Header', 'Sidebar'],
      },
    ],
    usedByPolicies: 0,
    policyNames: [],
    access: defaultAccessModel('Channel Administrators'),
    readIntoFiltering: false,
  },
  {
    id: 'channel-attr-watch-floor',
    name: 'Watch floor',
    type: 'Select',
    description: 'Watch floor assignment for this channel.',
    values: [
      { id: 'wf-alpha', label: 'ALPHA' },
      { id: 'wf-bravo', label: 'BRAVO' },
    ],
    source: { kind: 'manual' },
    appliesTo: [
      {
        resource: 'Channels',
        required: false,
        whoCanSet: whoCanSet('Channel admin'),
        showWhere: ['Header', 'Sidebar'],
      },
    ],
    usedByPolicies: 0,
    policyNames: [],
    access: defaultAccessModel('Channel Administrators'),
    readIntoFiltering: false,
  },
];

export const CHANNEL_ATTRIBUTES: HubAttribute[] = [
  ...HUB_ATTRIBUTES.map(trimToChannelScope).filter((a) => a.appliesTo.length > 0),
  ...CHANNEL_LOCAL,
];

export function blankChannelAttribute(
  presetResources: ResourceKind[] = [],
): HubAttribute {
  const appliesTo = presetResources
    .filter((resource) => CHANNEL_SCOPE_RESOURCES.includes(resource))
    .map(defaultChannelResourceConfig);

  return {
    id: `attr-${Date.now()}`,
    name: '',
    type: 'Select',
    description: '',
    values: [],
    source: { kind: 'manual' },
    appliesTo,
    usedByPolicies: 0,
    policyNames: [],
    access: defaultAccessModel('Channel Administrators'),
    readIntoFiltering: false,
  };
}

export function readAppliesPreset(params: URLSearchParams): ResourceKind[] {
  const applies = params.get('applies');
  if (!applies) return [];

  return applies
    .split(',')
    .map((value) => value.trim())
    .filter((value): value is ResourceKind =>
      CHANNEL_SCOPE_RESOURCES.includes(value as ResourceKind),
    );
}

export function defaultChannelResourceConfig(resource: ResourceKind): ResourceConfig {
  const base = defaultResourceConfig(resource);
  if (resource === 'Channels') {
    return {
      ...base,
      whoCanSet: whoCanSet('Channel admin'),
      showWhere: ['Header', 'Sidebar'],
    };
  }
  return {
    ...base,
    whoCanSet: whoCanSet('Post author'),
    showWhere: ['Header', 'Composer'],
    inheritMode: 'inherit',
  };
}
