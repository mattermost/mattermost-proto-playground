// [AI DRAFT] Display strings for attribute references and rules, using the
// active vocabulary. Shared by every direction, Simulate and the readback.
import type { PartyId } from './catalog';
import {
  isMultiValue,
  operatorLabel,
  refDef,
  type AttrRef,
  type Rule,
} from './rules';
import type { Vocabulary } from './vocabulary';

/** "Recipient: Program", "User's session: Network", "File: Classification". */
export function refLabel(ref: AttrRef, vocab: Vocabulary): string {
  return `${vocab.party[ref.party]}: ${refDef(ref).label}`;
}

export function partyLabel(party: PartyId, vocab: Vocabulary): string {
  return vocab.party[party];
}

/** Right-hand side as text: "Contractor", "Bot or AI agent", "User: Program". */
export function operandText(r: Rule, vocab: Vocabulary): string {
  if (r.right.kind === 'attr') return refLabel(r.right.ref, vocab);
  const values = r.right.values;
  if (!isMultiValue(r.op)) return values[0] ?? '';
  return values.join(r.op === 'all_of' ? ' and ' : ' or ');
}

/** "Recipient: Program is User: Program" (compact, for traces and lists). */
export function ruleText(r: Rule, vocab: Vocabulary): string {
  const def = refDef(r.left);
  return `${refLabel(r.left, vocab)} ${operatorLabel(r.op, def.type, r.right.kind)} ${operandText(r, vocab)}`;
}
