import {
  ATTR_TYPE_OPTIONS,
  isChannelDisplayHidden,
  resolveInheritMode,
  type AttrType,
  type DisplayWhere,
  type HubAttribute,
  type ResourceConfig,
} from '@/pages/AttributeManagementHub/hubData';
import { CHANNEL_ATTRIBUTES } from './channelData';
import { TEAM_ATTRIBUTES } from './teamData';

export interface PostAttributeValue {
  attributeId: string;
  valueId: string;
  /** Author changed the value away from the channel default. */
  overridden: boolean;
}

/** Ad-hoc attribute added on a single post (thread sidebar flow). */
export interface PostCustomAttribute {
  id: string;
  name: string;
  type: AttrType;
  values: { id: string; label: string }[];
  selectedValueId: string;
  showWhere?: DisplayWhere[];
}

/** Default post display surfaces when a binding has no showWhere. */
export const DEFAULT_POST_DISPLAY: DisplayWhere[] = ['Header', 'Composer'];

/** Normalize binding/override showWhere to Header + Composer for post UI. */
export function seedPostShowWhere(showWhere?: DisplayWhere[]): DisplayWhere[] {
  if (!showWhere || isChannelDisplayHidden(showWhere)) {
    return [...DEFAULT_POST_DISPLAY];
  }
  const next: DisplayWhere[] = [];
  if (showWhere.includes('Header')) next.push('Header');
  if (showWhere.includes('Composer') || showWhere.includes('Sidebar')) {
    next.push('Composer');
  }
  return next.length > 0 ? next : [...DEFAULT_POST_DISPLAY];
}

/** Resolve effective post display locations (override → binding seed). */
export function resolvePostShowWhere(
  attributeId: string,
  overrides: Record<string, DisplayWhere[]>,
  seed?: DisplayWhere[],
): DisplayWhere[] {
  return overrides[attributeId] ?? seedPostShowWhere(seed);
}

export const POST_ATTRIBUTE_TYPES: AttrType[] = [...ATTR_TYPE_OPTIONS];

export interface ThreadDemoPost {
  id: string;
  author: string;
  avatarSrc: string;
  avatarAlt: string;
  timestamp: string;
  body: string;
  attributes: PostAttributeValue[];
  customAttributes?: PostCustomAttribute[];
}

/** Channel defaults for #alpha-coordination — inherited when a post does not override. */
export const CHANNEL_ATTRIBUTE_DEFAULTS: Record<string, string> = {
  classification: 's',
  caveat: 'cav-noforn',
  'mission-phase': 'mp-exec',
  'engagement-tempo': 'et-elevated',
};

export const THREAD_ROOT: ThreadDemoPost = {
  id: 'post-leonard-ops',
  author: 'Leonard Riley',
  avatarSrc: '',
  avatarAlt: 'Leonard Riley',
  timestamp: 'Today at 10:18 AM',
  body: 'Ops brief for the week: sustainment window opens Thursday. Confirm tempo and classification on outbound posts before the sync with Program ALPHA leadership.',
  attributes: [
    { attributeId: 'classification', valueId: 'u', overridden: true },
    { attributeId: 'caveat', valueId: 'cav-noforn', overridden: false },
    { attributeId: 'mission-phase', valueId: 'mp-exec', overridden: false },
    { attributeId: 'engagement-tempo', valueId: 'et-surge', overridden: true },
  ],
};

/** Attributes configured for Posts in this channel, in display order. */
export function postScopedAttributes(extra: HubAttribute[] = []): HubAttribute[] {
  const fromChannel = CHANNEL_ATTRIBUTES.filter((attribute) =>
    attribute.appliesTo.some((binding) => binding.resource === 'Posts'),
  );

  const missionPhase = TEAM_ATTRIBUTES.find(
    (attribute) => attribute.id === 'mission-phase',
  );
  const base = (() => {
    if (!missionPhase) return fromChannel;

    const missionForPosts: HubAttribute = {
      ...missionPhase,
      appliesTo: missionPhase.appliesTo.filter(
        (binding) => binding.resource === 'Posts',
      ),
    };

    const withoutMission = fromChannel.filter(
      (attribute) => attribute.id !== 'mission-phase',
    );
    const classificationIndex = withoutMission.findIndex(
      (attribute) => attribute.id === 'classification',
    );
    if (classificationIndex === -1) {
      return [...withoutMission, missionForPosts];
    }

    return [
      ...withoutMission.slice(0, classificationIndex + 1),
      missionForPosts,
      ...withoutMission.slice(classificationIndex + 1),
    ];
  })();

  const baseIds = new Set(base.map((attribute) => attribute.id));
  const merged = [
    ...base,
    ...extra.filter((attribute) => !baseIds.has(attribute.id)),
  ];
  return merged;
}

export function isInheritedPostBinding(binding: ResourceConfig): boolean {
  const mode = resolveInheritMode(binding);
  return mode === 'inherit' || mode === 'inherit-lock';
}

/** Show a posted-message chip only when the author overrode channel inheritance. */
export function shouldShowPostedAttributeChip(
  attribute: HubAttribute,
  valueId: string,
): boolean {
  const binding = postBinding(attribute);
  if (!binding) return false;
  if (isInheritedPostBinding(binding)) {
    const defaultVal = channelDefaultValueId(attribute.id);
    return defaultVal !== undefined && valueId !== defaultVal;
  }
  return true;
}

export function postBinding(
  attribute: HubAttribute,
): ResourceConfig | undefined {
  return attribute.appliesTo.find((binding) => binding.resource === 'Posts');
}

/** DoD-style classification ids used in thread demo fixtures. */
const CLASSIFICATION_LABELS: Record<string, string> = {
  ts: 'TOP SECRET',
  s: 'SECRET',
  c: 'CONFIDENTIAL',
  cui: 'CUI',
  u: 'UNCLASSIFIED',
};

/** Demo classification options when a post author may pick a level. */
export const CLASSIFICATION_PICKER_OPTIONS = [
  { id: 'u', label: 'UNCLASSIFIED' },
  { id: 'cui', label: 'CUI' },
  { id: 'c', label: 'CONFIDENTIAL' },
  { id: 's', label: 'SECRET' },
  { id: 'ts', label: 'TOP SECRET' },
] as const;

/** Rank for channel-ceiling checks — higher number = more sensitive. */
export const CLASSIFICATION_RANK: Record<string, number> = {
  u: 0,
  cui: 1,
  c: 2,
  s: 3,
  ts: 4,
};

/** True when `valueId` is at or below the channel max (authors may not escalate). */
export function isClassificationAtOrBelow(
  valueId: string,
  maxValueId: string,
): boolean {
  return (
    (CLASSIFICATION_RANK[valueId] ?? 0) <=
    (CLASSIFICATION_RANK[maxValueId] ?? 0)
  );
}

export function classificationLabel(valueId: string): string {
  return CLASSIFICATION_LABELS[valueId] ?? '—';
}

export function valueLabel(attribute: HubAttribute, valueId: string): string {
  if (attribute.id === 'classification') {
    return classificationLabel(valueId);
  }
  return attribute.values.find((value) => value.id === valueId)?.label ?? '—';
}

export function isPostAttributeLocked(
  _attribute: HubAttribute,
  binding: ResourceConfig,
): boolean {
  if (binding.valueEditability === 'locked') return true;
  const mode = resolveInheritMode(binding);
  return mode === 'inherit-lock';
}

export function isPostAttributeInherited(
  _attribute: HubAttribute,
  binding: ResourceConfig,
  instance: PostAttributeValue,
): boolean {
  if (instance.overridden) return false;
  const mode = resolveInheritMode(binding);
  return mode === 'inherit' || mode === 'inherit-lock';
}

export function channelDefaultValueId(attributeId: string): string | undefined {
  return CHANNEL_ATTRIBUTE_DEFAULTS[attributeId];
}

export function buildPostAttributesFromComposer(
  attachedIds: string[],
  valuesById: Record<string, string>,
): PostAttributeValue[] {
  return attachedIds.map((attributeId) => {
    const valueId = valuesById[attributeId] ?? '';
    const defaultVal = channelDefaultValueId(attributeId);
    return {
      attributeId,
      valueId,
      overridden: defaultVal !== undefined && valueId !== defaultVal,
    };
  });
}

export function buildPostAttributeInstance(
  attributeId: string,
  valueId: string,
): PostAttributeValue {
  const defaultVal = channelDefaultValueId(attributeId);
  return {
    attributeId,
    valueId,
    overridden: defaultVal !== undefined && valueId !== defaultVal,
  };
}

export function addAttributeToPost(
  post: ThreadDemoPost,
  attributeId: string,
): ThreadDemoPost {
  if (post.attributes.some((row) => row.attributeId === attributeId)) {
    return post;
  }

  const attribute = postScopedAttributes().find((item) => item.id === attributeId);
  const defaultVal = channelDefaultValueId(attributeId);
  const valueId = defaultVal ?? attribute?.values[0]?.id ?? '';

  return {
    ...post,
    attributes: [
      ...post.attributes,
      buildPostAttributeInstance(attributeId, valueId),
    ],
  };
}

export function removeAttributeFromPost(
  post: ThreadDemoPost,
  attributeId: string,
): ThreadDemoPost {
  return {
    ...post,
    attributes: post.attributes.filter((row) => row.attributeId !== attributeId),
  };
}

export function updateAttributeValueOnPost(
  post: ThreadDemoPost,
  attributeId: string,
  valueId: string,
): ThreadDemoPost {
  const defaultVal = channelDefaultValueId(attributeId);
  return {
    ...post,
    attributes: post.attributes.map((row) =>
      row.attributeId === attributeId
        ? {
            ...row,
            valueId,
            overridden: defaultVal !== undefined && valueId !== defaultVal,
          }
        : row,
    ),
  };
}

export function removeCustomAttributeFromPost(
  post: ThreadDemoPost,
  attributeId: string,
): ThreadDemoPost {
  return {
    ...post,
    customAttributes: (post.customAttributes ?? []).filter(
      (attribute) => attribute.id !== attributeId,
    ),
  };
}

export function createPostCustomAttribute(type: AttrType): PostCustomAttribute {
  return {
    id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: 'New attribute',
    type,
    values: [],
    selectedValueId: '',
  };
}

export function addCustomAttributeToPost(
  post: ThreadDemoPost,
  type: AttrType,
): ThreadDemoPost {
  return {
    ...post,
    customAttributes: [
      ...(post.customAttributes ?? []),
      createPostCustomAttribute(type),
    ],
  };
}

export function updateCustomAttributeOnPost(
  post: ThreadDemoPost,
  attributeId: string,
  patch: Partial<Pick<PostCustomAttribute, 'name' | 'selectedValueId'>>,
): ThreadDemoPost {
  return {
    ...post,
    customAttributes: (post.customAttributes ?? []).map((attribute) =>
      attribute.id === attributeId ? { ...attribute, ...patch } : attribute,
    ),
  };
}

export function addCustomAttributeValueOnPost(
  post: ThreadDemoPost,
  attributeId: string,
  label: string,
): ThreadDemoPost {
  const trimmed = label.trim();
  if (!trimmed) return post;

  const valueId = `val-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

  return {
    ...post,
    customAttributes: (post.customAttributes ?? []).map((attribute) => {
      if (attribute.id !== attributeId) return attribute;
      return {
        ...attribute,
        values: [...attribute.values, { id: valueId, label: trimmed }],
        selectedValueId: valueId,
      };
    }),
  };
}

export function customAttributeValueLabel(
  attribute: PostCustomAttribute,
): string {
  if (!attribute.selectedValueId) return 'Add value…';
  return (
    attribute.values.find((value) => value.id === attribute.selectedValueId)
      ?.label ?? '—'
  );
}

export function formatChannelPostTime(): string {
  const now = new Date();
  return now.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: false,
  });
}
