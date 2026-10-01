// [AI DRAFT] Single source for the subject labels and the copy built on them.
//
// Every scene, both directions (B / A) and both variations (inline / card)
// import from here. Renaming the policy target ("Other person") or the acting
// subject ("Acting user") is a one-line change to TARGET_LABEL / ACTING_LABEL;
// every derived string below follows. All strings are first-pass draft copy
// unless marked "shipped".

/* ------------------------------------------------------------------ */
/* Subject labels                                                      */
/* ------------------------------------------------------------------ */

/** The policy target: the other member of the DM or GM. */
export const TARGET_LABEL = 'Other person';

/** The policy subject: the person starting, posting in, or viewing. */
export const ACTING_LABEL = 'Acting user';

function lowerFirst(s: string): string {
  return s.charAt(0).toLowerCase() + s.slice(1);
}

/** Mid-sentence forms: "other person", "acting user". */
export const TARGET_NOUN = lowerFirst(TARGET_LABEL);
export const ACTING_NOUN = lowerFirst(ACTING_LABEL);

/** "acting user's Program" */
export function actingAttr(attribute: string): string {
  return `${ACTING_NOUN}'s ${attribute}`;
}

/* ------------------------------------------------------------------ */
/* Editor (both variations)                                            */
/* ------------------------------------------------------------------ */

export const EDITOR = {
  actingHeading: ACTING_LABEL,
  actingHint: 'The person starting, posting in, or viewing the conversation',
  actingEmpty: `No conditions on the ${ACTING_NOUN}`,
  actingSessionGroup: `${ACTING_LABEL}'s session`,
  targetHeading: TARGET_LABEL,
  targetHint: 'User attributes only',
  /** Card variation only. */
  targetCardTitle: 'Who they can message',
  targetCardSubtitle: `Conditions on the ${TARGET_NOUN} in the conversation. In a group message, every member is checked.`,
  targetEmpty: 'Add an attribute to limit who they can message',
  combinedNote: (match: string) =>
    `Combined with the ${ACTING_NOUN} conditions: ${match}`,
  missingAttribute: (attrs: string[]) =>
    `People and bots without ${attrs.join(' or ')} are denied, including users on connected servers.`,
  pickerBlocked: `Can't be added while this policy has conditions on the ${TARGET_NOUN}.`,
  /** aria-labels: "<Subject> <attribute> operator" etc. */
  rowAria: (subject: string, attribute: string, part: 'operator' | 'value') =>
    `${subject} ${attribute} ${part}`,
  removeRowAria: (subject: string, attribute: string) =>
    `Remove ${lowerFirst(subject)} ${attribute} condition`,
};

/* ------------------------------------------------------------------ */
/* "Same as" comparison                                                */
/* ------------------------------------------------------------------ */

export const COMPARISON = {
  /** Inline variation operators. */
  isSameAs: 'is same as',
  isNotSameAs: 'is not same as',
  /** Card variation: the value option that compares to the acting side. */
  sameAsOption: (attribute: string) => `Same as ${actingAttr(attribute)}`,
};

/* ------------------------------------------------------------------ */
/* Plain-language summary fragments (Direction B)                      */
/* ------------------------------------------------------------------ */

export const SUMMARY = {
  label: 'Rule summary',
  startedFrom: (rule: string) => `Started from: ${rule}`,
  edited: 'Edited',
  tagBothWays: 'Applies both ways',
  tagOneWay: 'One way',
  tagActingOnly: `${ACTING_LABEL} only`,
  noPermission:
    'Add a direct and group message permission to describe this rule.',
  noConditions: (who: string) =>
    `Add conditions to restrict who ${who} can message.`,
  targetMatches: (attribute: string) =>
    `the ${TARGET_NOUN}'s ${attribute} matches theirs`,
  targetDiffers: (attribute: string) =>
    `the ${TARGET_NOUN}'s ${attribute} differs from theirs`,
  targetIs: (attribute: string, operator: string, value: string) =>
    `the ${TARGET_NOUN}'s ${attribute} ${operator} ${value}`,
  actingIs: (attribute: string, operator: string, value: string) =>
    `their ${attribute} ${operator} ${value}`,
  onlyWithMatching: (who: string, perm: string, attrs: string) =>
    `${who} can ${perm} only with people whose ${attrs} matches theirs.`,
  onlyWhen: (who: string, perm: string, clauses: string) =>
    `${who} can ${perm} only when ${clauses}.`,
  cantWith: (who: string, subject: string, perm: string, target: string) =>
    `${who} whose ${subject} can't ${perm} with people whose ${target}.`,
  tailBothWays: 'Applies both ways.',
  tailOneWay: `One way: this doesn't limit what the ${TARGET_NOUN} can do.`,
  tailOneWayTheyCan: 'One way: those people can still message them.',
  tailSession: 'Checked on every session.',
};

/* ------------------------------------------------------------------ */
/* Simulate                                                            */
/* ------------------------------------------------------------------ */

export const SIMULATE = {
  /** Shipped admin.access_control.simulate_access.title */
  title: 'Simulate access',
  subtitle:
    'Pick two people to check every direct and group message permission in both directions.',
  actingField: ACTING_LABEL,
  targetField: TARGET_LABEL,
  suggestion:
    'Suggested by the starting rule: pick a contractor and a program lead.',
  oneWayTag: 'One-way',
  oneWaySentence: 'One-way.',
  sameBothWays: 'Same both ways.',
  layerMissingTargetLabel: `Missing attribute on ${TARGET_NOUN}`,
  layerMissingTarget: (policy: string) =>
    `Missing attribute on ${TARGET_NOUN} · ${policy}`,
  notEvaluatedAsActing: `Not evaluated as ${ACTING_NOUN}`,
};

/* ------------------------------------------------------------------ */
/* End user: denial, read-only and blocked-start copy                  */
/* ------------------------------------------------------------------ */

export type DeniedKind = 'start-dm' | 'start-gm' | 'post';

/** Neutral: never names an attribute, a policy, or a member (FR-20). */
export const DENIED_COPY: Record<DeniedKind, string> = {
  'start-dm': "You can't start a conversation with this person.",
  'start-gm': "You can't start a conversation with this group.",
  post: "You can't post in this conversation.",
};

/** Direction B's link after the denial text. */
export const SUPPORT_LINK_TEXT = 'Contact support';

/**
 * Stand-in for the admin-configured Help Link value (shipped setting
 * admin.support.helpTitle). The link renders only when a custom value is set;
 * the Mattermost default never appears here.
 */
export const HELP_LINK_URL = 'https://help.program-office.example/messaging';

/**
 * Hidden (view denied) state, inherited unchanged from the View Channel D+C′
 * treatment as ported. Silent: no support link in either direction.
 */
export const HIDDEN_COPY = {
  title: 'You do not have permission to view this content',
  description:
    'Contact your system administrator if you believe this is an error.',
  redirect: (seconds: number) =>
    seconds === 1
      ? 'Redirecting in 1 second…'
      : `Redirecting in ${seconds} seconds…`,
};

/** Shipped post_info.message.visible */
export const EPHEMERAL_SUFFIX = '(Only visible to you)';
