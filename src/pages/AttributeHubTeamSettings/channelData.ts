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

/** Channel-created attribute ids — everything else is system/global. */
export const CHANNEL_LOCAL_IDS = new Set(['engagement-tempo', 'caveat']);

export function isSystemChannelAttribute(attribute: HubAttribute): boolean {
  return !CHANNEL_LOCAL_IDS.has(attribute.id);
}

export const CHANNEL_CATALOG_SECTIONS = [
  { label: 'System attributes', filter: isSystemChannelAttribute },
  {
    label: 'Channel attributes',
    filter: (attribute: HubAttribute) => !isSystemChannelAttribute(attribute),
  },
];

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
