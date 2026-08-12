/**
 * Seed presets for the refined hierarchical authoring surface.
 *
 * The default preset is the Programs graph this prototype was built around.
 * `classification` is additive: the same authoring surface, seeded so handling
 * markings are children of a classification tier inside ONE hierarchical
 * attribute — the shape a customer is asked to react to in the
 * classification-vs-clearance conversation.
 *
 * The multi-parent nodes are the point. `NOFORN` is a single option that hangs
 * under Confidential, Secret and Top Secret at once, so the deck can show a
 * handling marking shared across tiers rather than duplicated per tier.
 */
import type { AccessGrant } from '@/pages/AttributeManagementHub/hubData';
import {
  PROGRAM_EDITORS,
  SEED_V2,
  type GraphOption,
} from '@/pages/HierarchicalAttributeAuthoringV2/graphAuthoringModel';

const CLASSIFICATION_EDITORS = {
  roles: [
    { subject: 'Security Administrators', owner: true },
    { subject: 'Original Classification Authorities' },
  ],
  users: [] as AccessGrant[],
};

export type SeedKey = 'programs' | 'classification';

export interface SeedPreset {
  name: string;
  subtitle: string;
  options: GraphOption[];
  editors: { roles: AccessGrant[]; users: AccessGrant[] };
  appliesTo: Array<{ resource: string; detail: string }>;
  appliesNote: string;
  /** Opening sentence of the options explainer. */
  explainerLead: string;
}

function o(id: string, label: string, parentIds: string[]): GraphOption {
  return {
    id,
    label,
    parentIds,
    inUseCount: 0,
    policyRefCount: 0,
    source: 'manual',
  };
}

/** Tiers are roots; handling markings are their children, shared where they apply. */
const CLASSIFICATION_SEED: GraphOption[] = [
  o('unclassified', 'UNCLASSIFIED', []),
  o('cui', 'CUI', []),
  o('confidential', 'CONFIDENTIAL', []),
  o('secret', 'SECRET', []),
  o('topsecret', 'TOP SECRET', []),

  o('fouo', 'FOUO', ['cui']),
  // Three parents — one handling marking, valid at three tiers.
  o('noforn', 'NOFORN', ['confidential', 'secret', 'topsecret']),
  o('rel-gbr', 'REL TO USA, GBR', ['confidential', 'secret']),
  o('rel-can', 'REL TO USA, CAN', ['secret']),
  o('orcon', 'ORCON', ['secret', 'topsecret']),
  o('sci', 'SCI', ['topsecret']),
];

export const SEED_PRESETS: Record<SeedKey, SeedPreset> = {
  programs: {
    name: 'Program',
    subtitle:
      'System Console → Attribute Management · Hierarchical · used by 3 policies',
    options: SEED_V2,
    editors: PROGRAM_EDITORS,
    appliesTo: [
      {
        resource: 'Users',
        detail:
          'People hold one or more programs · anyone in Security Administrators can set',
      },
      {
        resource: 'Channels',
        detail:
          'Channels are tagged with programs · draws from the same option list',
      },
    ],
    appliesNote:
      'Users and Channels share one option list, so program access can be compared across them.',
    explainerLead: 'A hierarchy of programs.',
  },
  classification: {
    name: 'Classification',
    subtitle:
      'System Console → Attribute Management · Hierarchical · used by 2 policies',
    options: CLASSIFICATION_SEED,
    editors: CLASSIFICATION_EDITORS,
    appliesTo: [
      {
        resource: 'Channels',
        detail:
          'Channels carry a level, and any handling markings under it · anyone in Security Administrators can set',
      },
      {
        resource: 'Posts',
        detail:
          'Messages and files carry the same values · draws from the same option list',
      },
    ],
    appliesNote:
      'Level and handling live in one attribute: a handling marking is only selectable under the tiers it is listed beneath.',
    explainerLead:
      'Classification levels, with the handling markings valid at each one nested beneath it.',
  },
};

export function seedPresetFor(raw: string | null): SeedPreset {
  return raw === 'classification'
    ? SEED_PRESETS.classification
    : SEED_PRESETS.programs;
}
