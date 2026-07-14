/**
 * Two-uses disambiguation — shared policy-sentence generator + axis metadata.
 *
 * Consumed READ-ONLY by the three Disambiguation option scenes:
 *   - OptionRoleFraming  (O2 — semantic role framing + iconography/color)
 *   - OptionSplitCard    (O4 — axis-per-side split card + sentence recap)
 *   - OptionTabbedRevamp (O6 — page-level Members / Channels tabs)
 *
 * The sentence is GENERATED-ONLY (spec Q4 recommended default: a read-only
 * mirror of form state, never a second source of truth). It renders the two
 * independent axes as one plain-language line:
 *   "Members of [these channels] must satisfy [this requirement]."
 *
 * All terminology and data flow through gmpData.ts (imported additively; nothing
 * removed or renamed there).
 */

import {
  OPERATORS,
  channelVar,
  userAttr,
  type Requirement,
  type ChannelCondition,
  type ScopeMode,
  type AttrKind,
} from '@/pages/GlobalMembershipPolicy/gmpData';

/** The two independent axes, named for in-product framing (not annotations). */
export const AXES = {
  members: {
    key: 'members' as const,
    /** Locked section name (00-brief) — the requirement axis. */
    sectionTitle: 'Membership requirements',
    /** Short tab / chip label (spec Q6 recommended: "Members"). */
    tabLabel: 'Members',
    /** Plain-language role the axis answers. */
    question: 'Who qualifies to be a member?',
    /** One-line role framing shown under the section header (O2/O4/O6). */
    framing:
      'Compare a member’s attributes to a fixed value or to the channel’s own attributes. This decides who qualifies.',
    /** Chip caption used in the two-axes explainer. */
    caption: 'who qualifies',
  },
  channels: {
    key: 'channels' as const,
    /** Locked section name (00-brief) — the scope axis. */
    sectionTitle: 'Where this policy applies',
    tabLabel: 'Channels',
    question: 'Which channels does this policy run against?',
    framing:
      'Choose the channels this policy runs against — every channel, a manual list, or channels that match conditions on their own attributes. This decides where it applies.',
    caption: 'where it applies',
  },
} as const;

function operatorLabel(kind: AttrKind, operatorId: string): string {
  return OPERATORS[kind].find((o) => o.id === operatorId)?.label ?? operatorId;
}

/** One requirement rendered as a phrase, e.g. "Clearance is at least the channel’s Classification". */
export function requirementPhrase(req: Requirement): string {
  const attr = userAttr(req.userAttrId);
  const attrLabel = (attr?.label ?? 'attribute').replace('User: ', '');
  const op = operatorLabel(attr?.kind ?? 'ranked', req.operatorId);
  if (req.value.mode === 'variable') {
    const v = channelVar(req.value.variableId);
    const varLabel = (v?.label ?? 'a channel attribute').replace(
      'Channel: ',
      'the channel’s ',
    );
    return `${attrLabel} ${op} ${varLabel}`;
  }
  const labels = req.value.labels;
  const valueText =
    labels.length === 0
      ? '…'
      : labels.length === 1
        ? labels[0]
        : `${labels.slice(0, -1).join(', ')} or ${labels[labels.length - 1]}`;
  return `${attrLabel} ${op} ${valueText}`;
}

/** One channel condition rendered as a phrase, e.g. "Program is Dragon Spacecraft". */
export function conditionPhrase(cond: ChannelCondition): string {
  const attr = channelVar(cond.channelAttrId);
  const attrLabel = (attr?.label ?? 'attribute').replace('Channel: ', '');
  const op = operatorLabel(attr?.kind ?? 'select', cond.operatorId);
  const valueText =
    cond.labels.length === 0
      ? '…'
      : cond.labels.length === 1
        ? cond.labels[0]
        : `${cond.labels.slice(0, -1).join(', ')} or ${cond.labels[cond.labels.length - 1]}`;
  return `${attrLabel} ${op} ${valueText}`;
}

/** Requirements side of the sentence, joined by the All/Any combiner. */
export function requirementsClause(
  requirements: Requirement[],
  allRequired: boolean,
  advanced: boolean,
): string {
  if (advanced) return 'a custom expression';
  if (requirements.length === 0) return '…';
  const parts = requirements.map(requirementPhrase);
  const joiner = allRequired ? ' and ' : ' or ';
  return parts.join(joiner);
}

/** Channels side of the sentence, from the selected scope mode. */
export function channelsClause(
  scope: ScopeMode,
  channelConditions: ChannelCondition[],
  manualCount: number,
  referencesChannelAttr: boolean,
): string {
  switch (scope) {
    case 'all-where-set':
      return referencesChannelAttr
        ? 'every channel where the referenced attributes are set'
        : 'every channel';
    case 'manual':
      return manualCount === 0
        ? '…'
        : `${manualCount} manually selected ${manualCount === 1 ? 'channel' : 'channels'}`;
    case 'attribute-rules':
      return channelConditions.length === 0
        ? '…'
        : `channels where ${channelConditions.map(conditionPhrase).join(' and ')}`;
  }
}

export interface SentenceInput {
  requirements: Requirement[];
  allRequired: boolean;
  advanced: boolean;
  scope: ScopeMode;
  channelConditions: ChannelCondition[];
  manualCount: number;
}

export interface PolicySentence {
  /** True when neither axis has been configured yet (empty policy). */
  empty: boolean;
  /** The channels-side fragment ("every channel…", "42 manually selected channels"). */
  channelsClause: string;
  /** The requirements-side fragment ("Clearance is at least the channel’s Classification"). */
  requirementsClause: string;
}

/**
 * Build the generated policy sentence:
 *   "Members of {channelsClause} must satisfy {requirementsClause}."
 * Returns the fragments so callers can style the two axes distinctly.
 */
export function buildPolicySentence(input: SentenceInput): PolicySentence {
  const referencesChannelAttr = input.requirements.some(
    (r) => r.value.mode === 'variable',
  );
  const emptyReqs = input.advanced ? false : input.requirements.length === 0;
  const emptyChannels =
    (input.scope === 'manual' && input.manualCount === 0) ||
    (input.scope === 'attribute-rules' && input.channelConditions.length === 0);

  return {
    empty: emptyReqs && emptyChannels,
    channelsClause: channelsClause(
      input.scope,
      input.channelConditions,
      input.manualCount,
      referencesChannelAttr,
    ),
    requirementsClause: requirementsClause(
      input.requirements,
      input.allRequired,
      input.advanced,
    ),
  };
}
