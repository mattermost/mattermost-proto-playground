import {
  HUB_ATTRIBUTES,
  INHERIT_FROM_CHANNEL_VALUE_ID,
  defaultAccessModel,
  defaultResourceConfig,
  isPolicyLocked,
  isSourceOwned,
  whoCanSet,
  type HubAttribute,
  type ResourceConfig,
  type ResourceKind,
} from '@/pages/AttributeManagementHub/hubData';

/** Team Settings scope — channels and posts within this team (not the Teams resource). */
export const TEAM_SCOPE_RESOURCES: ResourceKind[] = ['Channels', 'Posts'];

export const TEAM_RESOURCE_LABELS: Partial<Record<ResourceKind, string>> = {
  Channels: 'Channels in this team',
  Posts: 'Posts in this team',
};

export const TEAM_NAME = 'Program ALPHA';

const APPLIES_TO_COPY =
  'Define attributes once in Team settings. Each attribute can apply to channels within the team and posts.';

export const TEAM_ATTRIBUTES_INTRO = APPLIES_TO_COPY;

export const TEAM_CATALOG_TITLE = `Attributes used in ${TEAM_NAME}`;

export const TEAM_CATALOG_EMPTY =
  'Define your first attribute to apply it to channels in this team or their posts.';

export const TEAM_APPLIES_TO_EMPTY =
  'Add a resource to apply this attribute to channels within this team or posts.';

/** Team-created attribute ids — everything else in the catalog is system/global. */
export const TEAM_LOCAL_IDS = new Set(['mission-phase']);

const teamSessionAttributes = new Map<string, HubAttribute>();

/** Persist attributes created in team settings across workspace remounts. */
export function saveTeamLocalAttribute(attribute: HubAttribute): void {
  TEAM_LOCAL_IDS.add(attribute.id);
  teamSessionAttributes.set(attribute.id, attribute);
}

export function isSessionTeamAttribute(attributeId: string): boolean {
  return teamSessionAttributes.has(attributeId);
}

/** Seed workspace state with fixture data plus session-created attributes. */
export function getTeamWorkspaceAttributes(): HubAttribute[] {
  const baseIds = new Set(TEAM_ATTRIBUTES.map((attribute) => attribute.id));
  const created = [...teamSessionAttributes.values()].filter(
    (attribute) => !baseIds.has(attribute.id),
  );
  return [...TEAM_ATTRIBUTES, ...created];
}

function readTeamSettingsUrl(): URL | null {
  if (typeof window === 'undefined') return null;
  return new URL(window.location.href);
}

export function syncTeamAttributeDetailParams(attributeId: string): void {
  const url = readTeamSettingsUrl();
  if (!url) return;
  url.searchParams.set('tab', 'attributes');
  url.searchParams.set('attr', attributeId);
  url.searchParams.delete('flow');
  window.history.replaceState(null, '', url);
}

export function clearTeamAttributeDetailParams(): void {
  const url = readTeamSettingsUrl();
  if (!url) return;
  url.searchParams.delete('attr');
  window.history.replaceState(null, '', url);
}

export function isSystemTeamAttribute(attribute: HubAttribute): boolean {
  return !TEAM_LOCAL_IDS.has(attribute.id);
}

export const TEAM_CATALOG_SECTIONS = [
  { label: 'System attributes', filter: isSystemTeamAttribute },
  {
    label: 'Team attributes',
    filter: (attribute: HubAttribute) => !isSystemTeamAttribute(attribute),
  },
];

/** Synced or policy-bound attributes open read-only in the detail view. */
export function isTeamAttributeReadOnly(attribute: HubAttribute): boolean {
  return isSourceOwned(attribute) || isPolicyLocked(attribute);
}

function trimToTeamScope(attribute: HubAttribute): HubAttribute {
  return {
    ...attribute,
    appliesTo: attribute.appliesTo.filter((binding) =>
      TEAM_SCOPE_RESOURCES.includes(binding.resource),
    ),
  };
}

const TEAM_LOCAL: HubAttribute[] = [
  {
    id: 'mission-phase',
    name: 'Mission phase',
    type: 'Select',
    description: 'Operating phase for the ALPHA program — set at team level and inherited by channels and posts.',
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
        defaultValueId: INHERIT_FROM_CHANNEL_VALUE_ID,
        postDisplayMode: 'when-overridden',
      },
    ],
    usedByPolicies: 0,
    policyNames: [],
    access: defaultAccessModel('Team Administrators'),
    readIntoFiltering: false,
  },
];

export const TEAM_ATTRIBUTES: HubAttribute[] = [
  ...HUB_ATTRIBUTES.map(trimToTeamScope).filter((a) => a.appliesTo.length > 0),
  ...TEAM_LOCAL,
];

export function blankTeamAttribute(): HubAttribute {
  return {
    id: `attr-${Date.now()}`,
    name: '',
    type: 'Select',
    description: '',
    values: [],
    source: { kind: 'manual' },
    appliesTo: [],
    usedByPolicies: 0,
    policyNames: [],
    access: defaultAccessModel('Team Administrators'),
    readIntoFiltering: false,
  };
}

export function defaultTeamResourceConfig(resource: ResourceKind): ResourceConfig {
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
