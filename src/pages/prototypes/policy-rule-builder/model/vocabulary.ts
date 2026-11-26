// [AI DRAFT] Naming variants for the parties, in the UI and in CEL.
//
// The designer has no preferred term yet, but wants the UI and CEL to agree
// as far as possible (intake Q1). Each vocabulary pairs the label an admin
// reads with the CEL root the engine evaluates, so the prototype switches them
// as one unit. Ideation 04 §2 scored N1–N4; N1 "Recipient ↔ recipient." is
// recommended. N5 keeps the request's own words so the designer can see why
// it was excluded: NIST SP 800-162 and Kubernetes read "object" as the resource.
//
// Resource paths are typed (04 §1.3): `resource.attributes.*` keeps today's
// meaning (the channel, direct message or group message where the action
// happens), and new
// resource types hang off it: `resource.file.*`, `resource.post.*`,
// `resource.team.*`.
import type { AttributeDef, PartyId } from './catalog';

export type VocabularyId = 'n1' | 'n2' | 'n3' | 'n4' | 'n5';

export interface Vocabulary {
  id: VocabularyId;
  /** Switch label (reviewer chrome, not product UI). */
  label: string;
  /** Admin-facing name for each party. */
  party: Record<PartyId, string>;
  /** Lower-case mid-sentence form: "the recipient's Program". */
  noun: Record<PartyId, string>;
  /** CEL root for each party. */
  cel: Record<PartyId, string>;
}

const RESOURCE_LABELS = {
  channel: 'Channel',
  dm: 'Direct or group message',
  file: 'File',
  post: 'Post',
  team: 'Team',
};

const RESOURCE_NOUNS = {
  channel: 'channel',
  dm: 'direct or group message',
  file: 'file',
  post: 'post',
  team: 'team',
};

/**
 * Channels and direct or group messages are both the channel the action
 * happens in, so both are `resource.` (round 2, M3). The parser tells them
 * apart from the policy's permissions and rules ([VERIFY WITH Eng] E-8).
 */
const RESOURCE_CEL = {
  channel: 'resource',
  dm: 'resource',
  file: 'resource.file',
  post: 'resource.post',
  team: 'resource.team',
};

function vocab(
  id: VocabularyId,
  label: string,
  user: [string, string, string],
  other: [string, string, string],
): Vocabulary {
  return {
    id,
    label,
    party: {
      user: user[0],
      session: `${user[0]}'s session`,
      recipient: other[0],
      ...RESOURCE_LABELS,
    },
    noun: {
      user: user[1],
      session: `${user[1]}'s session`,
      recipient: other[1],
      ...RESOURCE_NOUNS,
    },
    cel: {
      user: user[2],
      session: `${user[2]}.session`,
      recipient: other[2],
      ...RESOURCE_CEL,
    },
  };
}

export const VOCABULARIES: Record<VocabularyId, Vocabulary> = {
  n1: vocab('n1', 'Recipient · recipient.', ['User', 'user', 'user'], [
    'Recipient',
    'recipient',
    'recipient',
  ]),
  n2: vocab('n2', 'Target · target.', ['User', 'user', 'user'], [
    'Target',
    'target',
    'target',
  ]),
  n3: vocab('n3', 'Other participant · participant.', ['User', 'user', 'user'], [
    'Other participant',
    'other participant',
    'participant',
  ]),
  n4: vocab('n4', 'Recipient · resource.user.', ['User', 'user', 'user'], [
    'Recipient',
    'recipient',
    'resource.user',
  ]),
  n5: vocab('n5', 'Subject · Object (request terms)', ['Subject', 'subject', 'subject'], [
    'Object',
    'object',
    'object',
  ]),
};

export const VOCABULARY_ORDER: VocabularyId[] = ['n1', 'n2', 'n3', 'n4', 'n5'];

export const DEFAULT_VOCABULARY: VocabularyId = 'n1';

export function vocabularyFromParam(value: string | null): VocabularyId {
  return VOCABULARY_ORDER.includes(value as VocabularyId)
    ? (value as VocabularyId)
    : DEFAULT_VOCABULARY;
}

/** CEL path for one attribute: `recipient.attributes.program`, `user.session.network`. */
export function celPath(
  vocab: Vocabulary,
  party: PartyId,
  attr: AttributeDef,
): string {
  const root = vocab.cel[party];
  if (party === 'session' || attr.native) {
    return `${root}.${attr.id}`;
  }
  return `${root}.attributes.${attr.id}`;
}
