// [AI DRAFT] Helpers shared by the policy page and the save confirmation.
import { MISSING_COUNTS } from '../model/fixtures';
import { refLabel } from '../model/format';
import { permissionDef } from '../model/permissions';
import { refDef, referencedAttributes, type Group, type RoleId } from '../model/rules';
import type { Vocabulary } from '../model/vocabulary';
import type { NewlyAllowed, NoOnePasses } from '../model/behaviourDiff';
import { IMPACT, NO_ONE, WIDENING } from '../copy';

/** With Bot accounts selected, the acting party is a bot (bot-attributes prototype). */
export function vocabForRole(vocab: Vocabulary, role: RoleId): Vocabulary {
  if (role !== 'Bot accounts' || vocab.id === 'n5') return vocab;
  return {
    ...vocab,
    party: { ...vocab.party, user: 'Bot', session: "Bot's session" },
    noun: { ...vocab.noun, user: 'bot', session: "bot's session" },
  };
}

export function impactLines(root: Group, vocab: Vocabulary): string[] {
  const seen = new Set<string>();
  return referencedAttributes(root)
    .map((ref) => ({ ref, info: MISSING_COUNTS[`${ref.party}.${ref.attr}`] }))
    .filter(({ ref, info }) => {
      if (!info) return false;
      const key = `${info.noun}.${ref.attr}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .map(({ ref, info }) => IMPACT.line(info.count, info.noun, refLabel(ref, vocab).split(': ')[1]));
}

/** Some reason proves the policy got looser; 'changed' and 'unverifiable' don't (CUX2-4). */
export function provenLooser(widening: string[]): boolean {
  return widening.some((w) => w !== 'changed' && w !== 'unverifiable');
}

/** One line per widening reason, shared by the warnings bar and the save confirmation. */
export function wideningText(w: string, pairs: NewlyAllowed, vocab: Vocabulary): string {
  if (w === 'pairs') return WIDENING.pairs(pairs.count, pairs.unit, vocab.noun.user, vocab.noun.recipient);
  if (w === 'emptied') return WIDENING.emptied();
  return WIDENING.detail[w];
}


/** The "No one passes" lines: which permissions, then the values no one has (M4). */
export function noOneLines(noOne: NoOnePasses, role: RoleId, vocab: Vocabulary): string[] {
  const who = role === 'Guests' ? 'Guest users' : role;
  return [
    ...noOne.permissions.map((p) => NO_ONE.permission(who, permissionDef(p).label)),
    ...noOne.values.map((v) => NO_ONE.value(vocab.noun[v.ref.party], refDef(v.ref).label, v.values.join(' or '))),
  ];
}
