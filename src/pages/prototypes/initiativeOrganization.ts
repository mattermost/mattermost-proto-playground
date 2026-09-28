import {
  GROUP_META,
  INITIATIVE_META,
  getInitiativeOf,
  type Initiative,
  type InitiativeMeta,
  type PrototypeEntry,
  type PrototypeGroup,
} from '@/manifests/prototypes';

const STORAGE_KEY = 'proto-playground-initiative-org';
export const ORG_CHANGE_EVENT = 'proto-initiative-org';

export type CustomInitiative = {
  id: string;
  label: string;
  blurb?: string;
  group: PrototypeGroup;
};

export type OrganizedInitiativeMeta = InitiativeMeta & {
  id: string;
  custom?: boolean;
};

export type OrganizedInitiativeGroup = {
  initiative: string;
  entries: PrototypeEntry[];
};

type OrgState = {
  customs: CustomInitiative[];
  /** Prototype id → initiative id (built-in or custom). */
  assignments: Record<string, string>;
};

function readState(): OrgState {
  if (typeof window === 'undefined') {
    return { customs: [], assignments: {} };
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { customs: [], assignments: {} };
    const parsed = JSON.parse(raw) as Partial<OrgState>;
    return {
      customs: Array.isArray(parsed.customs) ? parsed.customs : [],
      assignments:
        parsed.assignments && typeof parsed.assignments === 'object'
          ? parsed.assignments
          : {},
    };
  } catch {
    return { customs: [], assignments: {} };
  }
}

function writeState(state: OrgState) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    window.dispatchEvent(new Event(ORG_CHANGE_EVENT));
  } catch {
    /* ignore */
  }
}

function slugify(label: string): string {
  const base = label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48);
  return base || 'initiative';
}

export function resolveInitiativeId(prototypeId: string): string {
  const { assignments } = readState();
  return assignments[prototypeId] ?? getInitiativeOf(prototypeId);
}

export function resolveInitiativeMeta(id: string): OrganizedInitiativeMeta {
  if (id in INITIATIVE_META) {
    return { id, ...INITIATIVE_META[id as Initiative] };
  }
  const custom = readState().customs.find((item) => item.id === id);
  if (custom) {
    return {
      id: custom.id,
      label: custom.label,
      blurb: custom.blurb,
      group: custom.group,
      custom: true,
    };
  }
  return { id, ...INITIATIVE_META.other };
}

export function listAllInitiativeMetas(): OrganizedInitiativeMeta[] {
  const { customs } = readState();
  const builtIn = (Object.keys(INITIATIVE_META) as Initiative[]).map((id) => ({
    id,
    ...INITIATIVE_META[id],
  }));
  const customMetas = customs.map((item) => ({
    id: item.id,
    label: item.label,
    blurb: item.blurb,
    group: item.group,
    custom: true as const,
  }));
  return [...builtIn, ...customMetas];
}

/**
 * Groups prototypes by effective initiative. Empty custom initiatives stay
 * visible so they can receive drops / moves.
 */
export function buildOrganizedInitiativeGroups(
  entries: PrototypeEntry[],
): OrganizedInitiativeGroup[] {
  const { customs } = readState();
  const byInitiative = new Map<string, PrototypeEntry[]>();

  for (const custom of customs) {
    byInitiative.set(custom.id, []);
  }

  for (const entry of entries) {
    const initiative = resolveInitiativeId(entry.id);
    if (!byInitiative.has(initiative)) byInitiative.set(initiative, []);
    byInitiative.get(initiative)!.push(entry);
  }

  for (const arr of byInitiative.values()) {
    arr.sort((a, b) => b.addedAt.localeCompare(a.addedAt));
  }

  return [...byInitiative.entries()]
    .map(([initiative, es]) => ({ initiative, entries: es }))
    .filter(({ initiative, entries }) => {
      // Keep empty customs; drop empty built-ins (except "other" if used).
      if (entries.length > 0) return true;
      return customs.some((c) => c.id === initiative);
    })
    .sort((a, b) => {
      const aDate = a.entries[0]?.addedAt ?? '';
      const bDate = b.entries[0]?.addedAt ?? '';
      if (aDate && bDate) return bDate.localeCompare(aDate);
      if (aDate) return -1;
      if (bDate) return 1;
      return resolveInitiativeMeta(a.initiative).label.localeCompare(
        resolveInitiativeMeta(b.initiative).label,
      );
    });
}

export function addCustomInitiative(input: {
  label: string;
  blurb?: string;
  group: PrototypeGroup;
}): CustomInitiative {
  const state = readState();
  const slug = slugify(input.label);
  let id = `custom-${slug}`;
  let n = 2;
  while (
    id in INITIATIVE_META ||
    state.customs.some((item) => item.id === id)
  ) {
    id = `custom-${slug}-${n}`;
    n += 1;
  }
  const created: CustomInitiative = {
    id,
    label: input.label.trim(),
    blurb: input.blurb?.trim() || undefined,
    group: input.group,
  };
  writeState({
    ...state,
    customs: [...state.customs, created],
  });
  return created;
}

export function movePrototypeToInitiative(
  prototypeId: string,
  initiativeId: string,
): void {
  const state = readState();
  const baseline = getInitiativeOf(prototypeId);
  const nextAssignments = { ...state.assignments };
  if (initiativeId === baseline) {
    delete nextAssignments[prototypeId];
  } else {
    nextAssignments[prototypeId] = initiativeId;
  }
  writeState({ ...state, assignments: nextAssignments });
}

export function accentForInitiative(id: string): string {
  const meta = resolveInitiativeMeta(id);
  return GROUP_META[meta.group].accentColor;
}
