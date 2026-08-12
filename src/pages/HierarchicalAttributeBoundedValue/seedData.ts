/**
 * Seed data for the Bounded Value prototype.
 *
 * Two schemes, deliberately kept as SEPARATE fields drawing from SEPARATE value
 * lists:
 *
 *  • `levels`   — rank-style ordered classification (UNCLASSIFIED < CUI <
 *                 CONFIDENTIAL < SECRET < TOP SECRET). This is the driving use
 *                 case and the unambiguous one. Field type: `rank`.
 *  • `programs` — a graph-shaped compartment field with a genuine multi-parent
 *                 node, so the "within" semantics of a Hierarchical field get
 *                 exercised. Field type: `hierarchical`.
 *
 * Classification levels and handling caveats are NOT merged into one graph
 * field. That combination is wrong for reasons outside this prototype's scope
 * and is being retired elsewhere in the project — hence two independent fields,
 * each with its own value list and its own cap chain.
 */

import type { GraphOption } from '@/pages/HierarchicalAttributeAuthoring/graphModel';
import avatarAiko from '@/assets/avatars/Aiko Tan.png';
import avatarArjun from '@/assets/avatars/Arjun Patel.png';
import avatarDanielle from '@/assets/avatars/Danielle Okoro.png';
import avatarLeonard from '@/assets/avatars/Leonard Riley.png';
import avatarMarco from '@/assets/avatars/Marco Rinaldi.png';
import avatarSofia from '@/assets/avatars/Sofia Bauer.png';
import type { SchemeKey, ValueScheme } from './boundsModel';

/** Minimal GraphOption factory — counts are irrelevant to bound arithmetic. */
function node(
  id: string,
  label: string,
  parentIds: string[],
  color?: string,
): GraphOption {
  return {
    id,
    label,
    color,
    parentIds,
    inUseCount: 0,
    policyRefCount: 0,
    source: 'manual',
  };
}

// ─── Scheme 1 — classification levels (ordered / `rank`) ──────────────────────
//
// Expressed BOTH ways on purpose. `ranks` is the real reading for a `rank`
// field; the parent pointers express the same order as a strict chain so the
// graph helpers (`covers`, `descendantsOf`) work on it too. Root = highest.

const LEVEL_OPTIONS: GraphOption[] = [
  node('top-secret', 'TOP SECRET', [], 'var(--color-orange-500)'),
  node('secret', 'SECRET', ['top-secret'], 'var(--color-red-500)'),
  node('confidential', 'CONFIDENTIAL', ['secret'], 'var(--color-blue-400)'),
  node('cui', 'CUI', ['confidential'], 'var(--color-purple-400)'),
  node('unclassified', 'UNCLASSIFIED', ['cui'], 'var(--color-green-500)'),
];

export const LEVELS_SCHEME: ValueScheme = {
  key: 'levels',
  fieldType: 'rank',
  valueListName: 'Classification levels',
  fieldLabel: 'Classification',
  options: LEVEL_OPTIONS,
  ranks: {
    unclassified: 1,
    cui: 2,
    confidential: 3,
    secret: 4,
    'top-secret': 5,
  },
  displayOrder: ['top-secret', 'secret', 'confidential', 'cui', 'unclassified'],
};

// ─── Scheme 2 — programs (graph / `hierarchical`) ─────────────────────────────
//
// `joint-strike-cell` is the multi-parent node: it sits under BOTH Falcon Wing
// and Trident Fleet, so it is "within" either cap. That is the behaviour a
// ranked ladder cannot express.

const PROGRAM_COLOR = {
  air: 'var(--color-blue-400)',
  sea: 'var(--color-cyan-400)',
  joint: 'var(--color-purple-400)',
  all: 'var(--color-indigo-400)',
} as const;

const PROGRAM_OPTIONS: GraphOption[] = [
  node('all-programs', 'All Programs', [], PROGRAM_COLOR.all),
  node('air', 'Air Operations', ['all-programs'], PROGRAM_COLOR.air),
  node('falcon-wing', 'Falcon Wing', ['air'], PROGRAM_COLOR.air),
  node('raptor-flight', 'Raptor Flight', ['falcon-wing'], PROGRAM_COLOR.air),
  node('hawkeye-det', 'Hawkeye Detachment', ['falcon-wing'], PROGRAM_COLOR.air),
  node('tanker-wing', 'Tanker Wing', ['air'], PROGRAM_COLOR.air),
  node('tanker-sqd-9', 'Tanker Squadron 9', ['tanker-wing'], PROGRAM_COLOR.air),
  node('maritime', 'Maritime Operations', ['all-programs'], PROGRAM_COLOR.sea),
  node('trident-fleet', 'Trident Fleet', ['maritime'], PROGRAM_COLOR.sea),
  node(
    'nautilus-sqd',
    'Nautilus Squadron',
    ['trident-fleet'],
    PROGRAM_COLOR.sea,
  ),
  // Multi-parent: within Falcon Wing AND within Trident Fleet.
  node(
    'joint-strike-cell',
    'Joint Strike Cell',
    ['falcon-wing', 'trident-fleet'],
    PROGRAM_COLOR.joint,
  ),
];

export const PROGRAMS_SCHEME: ValueScheme = {
  key: 'programs',
  fieldType: 'hierarchical',
  valueListName: 'Programs',
  fieldLabel: 'Program',
  options: PROGRAM_OPTIONS,
  displayOrder: [
    'all-programs',
    'air',
    'falcon-wing',
    'raptor-flight',
    'hawkeye-det',
    'joint-strike-cell',
    'tanker-wing',
    'tanker-sqd-9',
    'maritime',
    'trident-fleet',
    'nautilus-sqd',
  ],
};

export const SCHEMES: Record<SchemeKey, ValueScheme> = {
  levels: LEVELS_SCHEME,
  programs: PROGRAMS_SCHEME,
};

export function schemeFor(raw: string | null): ValueScheme {
  return raw === 'programs' ? PROGRAMS_SCHEME : LEVELS_SCHEME;
}

// ─── The channel and the system ───────────────────────────────────────────────

export const CHANNEL = {
  handle: '~falcon-ops',
  name: 'falcon-ops',
  description: 'Air tasking order coordination · Falcon Wing',
  memberCount: 38,
  pinnedCount: 2,
} as const;

/** The channel's own value per scheme — the cap for every post inside it. */
export const CHANNEL_VALUE: Record<SchemeKey, string> = {
  levels: 'secret',
  programs: 'falcon-wing',
};

/** The system value per scheme — the cap for the channel itself. */
export const SYSTEM_VALUE: Record<SchemeKey, string> = {
  levels: 'top-secret',
  programs: 'all-programs',
};

export const SYSTEM_LABEL = 'System default';

// ─── Posts in the channel ─────────────────────────────────────────────────────

export interface SeedPost {
  id: string;
  author: string;
  avatarSrc: string;
  timestamp: string;
  text: string;
  /**
   * Stored value per scheme. `null` = NOTHING STORED, so the post derives the
   * channel's value on read. Most posts store nothing — that is the common
   * case, not the exception.
   */
  stored: Record<SchemeKey, string | null>;
}

export const SEED_POSTS: SeedPost[] = [
  {
    id: 'p1',
    author: 'Sofia Bauer',
    avatarSrc: avatarSofia,
    timestamp: '08:14',
    text: 'ATO cycle 14 is published. Tasking window opens 0600Z tomorrow — confirm receipt in thread.',
    stored: { levels: null, programs: null },
  },
  {
    id: 'p2',
    author: 'Marco Rinaldi',
    avatarSrc: avatarMarco,
    timestamp: '08:41',
    text: 'Two airframes off-line for scheduled maintenance. Coverage gap 1100Z–1400Z, mitigations attached to the cycle brief.',
    stored: { levels: null, programs: null },
  },
  {
    id: 'p3',
    author: 'Arjun Patel',
    avatarSrc: avatarArjun,
    timestamp: '09:02',
    text: 'Weather product for the tasking window — nothing sensitive in here, marking it down so the met team can pull it.',
    stored: { levels: 'confidential', programs: 'raptor-flight' },
  },
  {
    id: 'p4',
    author: 'Aiko Tan',
    avatarSrc: avatarAiko,
    timestamp: '09:20',
    text: 'Ack on the coverage gap. Rebuilding the refuel track and will repost the timeline.',
    stored: { levels: null, programs: null },
  },
  {
    id: 'p5',
    author: 'Leonard Riley',
    avatarSrc: avatarLeonard,
    timestamp: '09:48',
    text: 'Target deck review moved to 1500Z. Same secure room, bring the annotated overlay.',
    stored: { levels: 'secret', programs: 'hawkeye-det' },
  },
  {
    id: 'p6',
    author: 'Danielle Okoro',
    avatarSrc: avatarDanielle,
    timestamp: '10:05',
    text: 'Cross-domain liaison is joining for the 1500Z block — routing the joint tasking notes through this channel.',
    stored: { levels: 'secret', programs: 'joint-strike-cell' },
  },
];

/** Posts that store their own value — the only ones that can ever conflict. */
export function postsWithStoredValue(scheme: SchemeKey): SeedPost[] {
  return SEED_POSTS.filter((p) => p.stored[scheme] != null);
}

/**
 * The value an admin is trying to move the channel DOWN to in the conflict
 * scenario. Chosen so the conflict list is non-trivial in both schemes:
 *   levels   → UNCLASSIFIED leaves CONFIDENTIAL + 2× SECRET outside.
 *   programs → Raptor Flight leaves Hawkeye Detachment + Joint Strike Cell
 *              outside (Raptor Flight itself stays within).
 */
export const CONFLICT_TARGET: Record<SchemeKey, string> = {
  levels: 'unclassified',
  programs: 'raptor-flight',
};

/** The value an author tries to write above the cap in the `rejected` state. */
export const OVER_CAP_ATTEMPT: Record<SchemeKey, string> = {
  levels: 'top-secret',
  programs: 'air',
};

/** The value an author has explicitly stored in the `explicit` state. */
export const EXPLICIT_DRAFT_VALUE: Record<SchemeKey, string> = {
  levels: 'confidential',
  programs: 'raptor-flight',
};
