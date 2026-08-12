/**
 * Every user-facing string for the Bounded Value prototype, in one place.
 *
 * The wording here is the point of the prototype, not decoration:
 *
 *  • "Inherited" has to be honest. There is no provenance flag on a value —
 *    the marking is inferred from the ABSENCE of a stored value, so the copy
 *    says "nothing is stored on this post" rather than implying a recorded
 *    origin.
 *  • Reverting is clearing. There is no revert API; revert IS delete. So the
 *    affordance is a clear/remove action and its copy explains the consequence
 *    ("goes back to inheriting"), never "reset" or "restore default".
 *  • A rejected write names the cap AND the offending value, and offers no
 *    retry-to-allow and no bypass. The server is the guard.
 *  • An unresolvable cap offers nothing and says so plainly, and explicitly
 *    denies the "no limit" reading.
 */

import {
  CAP_UNRESOLVED_REASON_TEXT,
  optionLabel,
  type CapUnresolvedReason,
  type ValueScheme,
} from './boundsModel';

/** "classification" | "program" — the noun used in running copy. */
export function noun(scheme: ValueScheme): string {
  return scheme.fieldLabel.toLowerCase();
}

// ─── Inherited (post has nothing stored) ──────────────────────────────────────

export const INHERITED_BADGE = 'Inherited';

export const INHERITED_TITLE = 'Inherited from this channel';

export function inheritedDetail(
  scheme: ValueScheme,
  sourceLabel: string,
  capId: string,
): string {
  return `Nothing is stored on this post, so it takes ${sourceLabel}’s ${noun(scheme)}: ${optionLabel(scheme, capId)}. If the channel changes, this post follows.`;
}

/** Tooltip on the Inherited badge — why the marking is trustworthy. */
export function inheritedBadgeTooltip(scheme: ValueScheme): string {
  return `No ${noun(scheme)} is stored on this post. The value shown is the channel’s, resolved when the post is read.`;
}

// ─── Explicit (post stores its own value) ─────────────────────────────────────

export const EXPLICIT_BADGE = 'Set on this post';

export function explicitDetail(
  scheme: ValueScheme,
  sourceLabel: string,
): string {
  return `This post stores its own ${noun(scheme)}, so it no longer follows ${sourceLabel}.`;
}

/** Shown when the stored value happens to equal the channel's. */
export function explicitMatchesCapNote(sourceLabel: string): string {
  return `Same value as ${sourceLabel} today, but stored on the post — it will not follow if the channel changes.`;
}

// ─── Clearing (the only way back to inheriting) ───────────────────────────────

export const CLEAR_ACTION = 'Clear value';

export const CLEAR_HELP = 'Clear to go back to inheriting from the channel.';

export const CLEAR_NO_REVERT_NOTE =
  'There is no separate revert — clearing the stored value is what restores inheritance.';

export function clearedConfirmation(
  scheme: ValueScheme,
  sourceLabel: string,
  capId: string,
): string {
  return `Cleared. This post has no ${noun(scheme)} of its own again, so it shows ${sourceLabel}’s: ${optionLabel(scheme, capId)}.`;
}

// ─── Cap narrowing in the picker (read.option.bounds) ─────────────────────────

export function capHeader(
  scheme: ValueScheme,
  sourceLabel: string,
  capId: string,
): string {
  const cap = optionLabel(scheme, capId);
  return scheme.fieldType === 'rank'
    ? `Up to ${cap} — ${sourceLabel}’s ${noun(scheme)}`
    : `Within ${cap} — ${sourceLabel}’s ${noun(scheme)}`;
}

export function capExplainer(
  scheme: ValueScheme,
  sourceLabel: string,
  capId: string,
): string {
  const cap = optionLabel(scheme, capId);
  return scheme.fieldType === 'rank'
    ? `Values above ${cap} are not offered here. A post cannot be marked higher than the channel it sits in, and ${sourceLabel} is ${cap}.`
    : `Only ${cap} and the programs inside it are offered here. Programs outside ${cap} are not available to posts in ${sourceLabel}.`;
}

// ─── Rejected write (write.value.bounds — the guard) ─────────────────────────

export function rejectedTitle(
  scheme: ValueScheme,
  attemptedId: string,
): string {
  const attempted = optionLabel(scheme, attemptedId);
  return scheme.fieldType === 'rank'
    ? `Not saved — ${attempted} is above this channel’s ${noun(scheme)}`
    : `Not saved — ${attempted} is outside this channel’s ${noun(scheme)}`;
}

export function rejectedDetail(
  scheme: ValueScheme,
  sourceLabel: string,
  capId: string,
  attemptedId: string,
): string {
  const cap = optionLabel(scheme, capId);
  const attempted = optionLabel(scheme, attemptedId);
  return scheme.fieldType === 'rank'
    ? `${sourceLabel} is ${cap}, so a post in it can be ${cap} or lower. ${attempted} was rejected and nothing was saved. Pick ${cap} or lower, or clear the value to inherit ${cap} from the channel.`
    : `${sourceLabel} is ${cap}, so a post in it can be ${cap} or a program inside it. ${attempted} was rejected and nothing was saved. Pick a program inside ${cap}, or clear the value to inherit ${cap} from the channel.`;
}

export const REJECTED_GUARD_NOTE =
  'The server checks this on every save, including later edits. There is no override.';

export const REJECTED_PICK_LOWER_ACTION = 'Choose an allowed value';

// ─── Cap unresolvable (fail-closed) ───────────────────────────────────────────

export function unresolvableTitle(scheme: ValueScheme): string {
  return `No ${noun(scheme)} can be set right now`;
}

export function unresolvableDetail(
  scheme: ValueScheme,
  sourceLabel: string,
  reason: CapUnresolvedReason,
  subject: 'post' | 'channel' = 'post',
): string {
  return `${sourceLabel}’s ${noun(scheme)} could not be resolved — ${CAP_UNRESOLVED_REASON_TEXT[reason]}. Without it there is nothing to compare a ${subject} value against, so no values are offered and this ${subject}’s ${noun(scheme)} cannot be saved.`;
}

export function unresolvableNotNoLimit(scheme: ValueScheme): string {
  return `A ${noun(scheme)} that cannot be resolved is not “no limit”. Nothing is offered until it resolves.`;
}

export const UNRESOLVABLE_EMPTY_TITLE = 'No values available';

export function unresolvableEmptyDetail(
  scheme: ValueScheme,
  sourceLabel: string,
): string {
  return `Waiting on ${sourceLabel}’s ${noun(scheme)}. Values appear here once it resolves.`;
}

export const UNRESOLVABLE_ACTION = 'Open channel settings';

// ─── Channel surface — raise but never lower ─────────────────────────────────

export function channelCurrentTitle(
  scheme: ValueScheme,
  sourceLabel: string,
  currentId: string,
): string {
  return `${sourceLabel} is ${optionLabel(scheme, currentId)}`;
}

export function channelDirectionExplainer(
  scheme: ValueScheme,
  currentId: string,
  allowedIds: string[],
): string {
  const current = optionLabel(scheme, currentId);
  const others = allowedIds
    .filter((id) => id !== currentId)
    .map((id) => optionLabel(scheme, id));
  const list = formatList(others);
  if (scheme.fieldType === 'rank') {
    return others.length === 0
      ? `This is already the highest ${noun(scheme)} the system allows. Lowering it is not offered — posts already in this channel were marked against ${current}.`
      : `You can raise it to ${list}. Lowering it is not offered — posts already in this channel were marked against ${current}.`;
  }
  return others.length === 0
    ? `There is no wider program available. Moving it anywhere narrower or unrelated is not offered — posts already in this channel were marked inside ${current}.`
    : `You can move it to a program that still contains ${current}: ${list}. Anything narrower or unrelated is not offered, because posts already in this channel were marked inside ${current}.`;
}

export function channelLowerToggleLabel(scheme: ValueScheme): string {
  return scheme.fieldType === 'rank'
    ? 'Need a lower classification?'
    : 'Need a narrower or different program?';
}

export function channelLowerToggleHelp(scheme: ValueScheme): string {
  return scheme.fieldType === 'rank'
    ? 'Lowering a channel’s classification affects every post inside it. Pick a value to see what it would break before anything changes.'
    : 'Moving a channel outside its current program affects every post inside it. Pick a value to see what it would break before anything changes.';
}

// ─── The chain: post ≤ channel ≤ system ──────────────────────────────────────

export const CHAIN_TITLE = 'Where this cap comes from';

export function chainCaption(scheme: ValueScheme): string {
  return `A post can be at most its channel’s ${noun(scheme)}; a channel can be at most the system’s. Each save is checked against the level directly above it — never against the whole chain at once.`;
}

export const CHAIN_CHANNEL_IS_CAP_NOTE =
  'Whatever you set here becomes the ceiling for every post in this channel.';

// ─── Conflict: container value dropping below values already set inside ──────

export function conflictTitle(
  scheme: ValueScheme,
  count: number,
  targetId: string,
): string {
  const target = optionLabel(scheme, targetId);
  const posts = count === 1 ? '1 post is' : `${count} posts are`;
  return scheme.fieldType === 'rank'
    ? `Change blocked — ${posts} marked above ${target}`
    : `Change blocked — ${posts} marked outside ${target}`;
}

export function conflictDetail(
  scheme: ValueScheme,
  sourceLabel: string,
  count: number,
  targetId: string,
): string {
  const target = optionLabel(scheme, targetId);
  const posts = count === 1 ? '1 post' : `${count} posts`;
  return scheme.fieldType === 'rank'
    ? `Setting ${sourceLabel} to ${target} would leave ${posts} marked higher than the channel they sit in. Resolve them first, or keep the channel where it is.`
    : `Setting ${sourceLabel} to ${target} would leave ${posts} marked outside the channel’s program. Resolve them first, or keep the channel where it is.`;
}

export function conflictResolveActionLabel(
  scheme: ValueScheme,
  targetId: string,
): string {
  return `Change to ${optionLabel(scheme, targetId)}`;
}

export function conflictConsequenceNote(
  scheme: ValueScheme,
  targetId: string,
): string {
  const target = optionLabel(scheme, targetId);
  return scheme.fieldType === 'rank'
    ? `Both options mark the post lower than it is now. Content written at a higher ${noun(scheme)} would carry ${target} instead. Downgrades are recorded against you.`
    : `Both options move the post into ${target}. Content marked in another program would be re-marked. The change is recorded against you.`;
}

export function conflictKeepActionLabel(
  scheme: ValueScheme,
  currentId: string,
): string {
  return `Keep ${optionLabel(scheme, currentId)}`;
}

export const CONFLICT_CHECK_ACTION = 'Check what this would break';

export const CONFLICT_RESOLVED_TITLE = 'Nothing is blocking the change now';

export function conflictResolvedDetail(
  scheme: ValueScheme,
  sourceLabel: string,
  targetId: string,
): string {
  const target = optionLabel(scheme, targetId);
  return scheme.fieldType === 'rank'
    ? `No posts are marked above ${target} any more, so ${sourceLabel} can be set to ${target}.`
    : `No posts are marked outside ${target} any more, so ${sourceLabel} can be set to ${target}.`;
}

export function conflictRowSubtitle(
  scheme: ValueScheme,
  author: string,
  timestamp: string,
): string {
  return `${author} · ${timestamp} · ${noun(scheme)} stored on the post`;
}

/**
 * Visible design-proposal note. Rendered in the prototype annotation register
 * (dashed, "[AI DRAFT]"), not as product chrome, and hidden by `?demo=off`.
 *
 * THIS IS A PROPOSAL, NOT SETTLED BACKEND BEHAVIOUR. The backend team has this
 * question open with three candidate answers and one already ruled out.
 */
export const CONFLICT_PROPOSAL_NOTE = {
  heading: 'Design proposal — parent value dropping below child values',
  recommendation:
    'Recommended: BLOCK the parent change, name the conflicting posts, and give a path to resolve each one.',
  rejected: [
    'Flag the conflict and allow the change — leaves content sitting in the channel mismarked, with no deadline to fix it.',
    'Re-check and rewrite the post values — mutates authors’ content without their consent.',
    'Clamp on read — ruled out by the backend team already: it would display content below the marking it was written at.',
  ],
  status:
    'Backend behaviour is still open. This surface exists so the choice can be argued against something concrete.',
} as const;

// ─── Setup surface — derivation ───────────────────────────────────────────────

export const DERIVATION_OPTIONS = [
  {
    value: 'unset' as const,
    label: 'Not set',
    consequence:
      'Only stored values are used. An object with nothing stored has no value at all.',
  },
  {
    value: 'parent' as const,
    label: 'Inherit from the containing entity',
    consequence:
      'An object with nothing stored shows its container’s value, computed when it is read — a post shows its channel’s value. Storing a value overrides it; clearing the stored value restores inheritance.',
  },
  {
    value: 'participants' as const,
    label: 'Compute from members',
    consequence:
      'The value is computed from the members of the group. Storing a value on the object overrides the computed one.',
  },
];

export const DERIVATION_NO_PROVENANCE_NOTE =
  'There is no per-value marker for “derived”. A stored value is explicit; no stored value means the value is computed on read. Every surface reads it that way.';

// ─── Setup surface — the bound and its two leaves ─────────────────────────────

export const BOUND_SWITCH_LABEL = 'Cap this field by a linked field’s value';

export function boundSwitchHelp(
  fieldName: string,
  linkedFieldName: string,
): string {
  return `${fieldName} can never exceed ${linkedFieldName}. The cap is read from the linked entity at save time.`;
}

export const WRITE_BOUND_LEAF = {
  path: 'write.value.bounds: [linked]',
  tag: 'Guard',
  label: 'Reject saves outside the cap',
  help: 'Required whenever the cap is on. Every save is checked on the server against the linked field’s value, including later edits. A value that never appeared in a picker is still rejected here — an author can edit any part of their own post, so the value cannot police itself.',
} as const;

export const READ_BOUND_LEAF = {
  path: 'read.option.bounds: [linked]',
  tag: 'Convenience',
  label: 'Hide values outside the cap while composing',
  help: 'Optional. Narrows what authors are offered so invalid choices are never presented. The client is never trusted — turning this off changes nothing about what can be saved, only what people have to guess at.',
} as const;

export const BOUND_FAIL_CLOSED_NOTE =
  'If the linked value cannot be resolved — no container, no value, deleted, or ambiguous — the cap resolves to nothing: no options are offered and the save is rejected. An unresolvable cap is never read as “no limit”.';

// ─── Setup surface — linked field relationship ────────────────────────────────

export function linkedFieldSummary(
  fieldName: string,
  linkedFieldName: string,
  listName: string,
): string {
  return `${fieldName} is capped by ${linkedFieldName}. Both fields draw from ${listName} — a cap only means something when both sides share one value list.`;
}

export const LINKED_FIELD_BROKEN_TITLE =
  'These fields draw from different value lists';

export function linkedFieldBrokenDetail(
  fieldName: string,
  linkedFieldName: string,
): string {
  return `${fieldName} and ${linkedFieldName} have no values in common, so there is nothing to compare and the cap cannot be saved. Point both fields at one shared value list first.`;
}

// ─── Setup surface — second field escape hatch ────────────────────────────────

export const SECOND_FIELD = {
  title: 'Need different inheritance for the same object type?',
  body: 'Inheritance is a property of the field, not of individual values — it cannot vary value by value. Create a second field on the same object type, pointed at the same value list, and give that field its own inheritance setting.',
  action: 'Create a second field on this list',
} as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatList(items: string[]): string {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} or ${items[1]}`;
  return `${items.slice(0, -1).join(', ')}, or ${items[items.length - 1]}`;
}
