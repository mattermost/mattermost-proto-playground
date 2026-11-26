// [AI DRAFT] Behavioural "less strict" check (cycle 3, QA3-1).
//
// The structural diff in rules.ts catches every single edit, but two
// coordinated Advanced edits (swapping values between two When cards or two
// groups) can loosen a policy while every rule still matches something saved.
// This check simulates the saved and draft rules over the sample accounts and
// resources and counts pairs that were blocked and are now allowed. In the
// product this would run server-side against real accounts (an impact diff).
import type { PartyId } from './catalog';
import { simulate } from './evaluate';
import { PEOPLE, RESOURCES, TRUSTED_SESSION, type ResourceFixture } from './fixtures';
import { conflictsFor, permissionDef, placeOf, supplies, type PermissionId } from './permissions';
import {
  allRules,
  partiesInUse,
  prune,
  type AttrRef,
  type OperatorId,
  type Policy,
} from './rules';

export interface NewlyAllowed {
  /** Distinct user → recipient pairs (or users, when no permission has a recipient). */
  count: number;
  unit: 'pairs' | 'accounts';
}

/** Distinct sample pairs that were blocked under `saved` and are allowed under `draft` (QA4-1). */
export function newlyAllowedPairs(saved: Policy, draft: Policy): NewlyAllowed {
  const savedRoot = prune(saved.root);
  const draftRoot = prune(draft.root);
  const permissions = draft.permissions.filter((p) => saved.permissions.includes(p));
  const files = RESOURCES.filter((r) => r.kind === 'file');
  const post = RESOURCES.find((r) => r.kind === 'post');
  const team = RESOURCES.find((r) => r.kind === 'team');
  // Only accounts the role covers act as the User (as in Simulate).
  const actors = PEOPLE.filter((p) =>
    draft.role === 'Bot accounts' ? p.account !== 'Person' : p.account === 'Person',
  );
  const pairs = new Set<string>();
  let anyRecipient = false;
  for (const permission of permissions) {
    const withRecipient = supplies(permission, 'recipient');
    anyRecipient ||= withRecipient;
    const fileSets = permissionDef(permission).supplies.includes('file') ? files : [undefined];
    // DM/GM permissions act in direct and group messages; others in channels (M3).
    const kind = placeOf(permission);
    for (const place of RESOURCES.filter((r) => r.kind === kind)) {
      for (const file of fileSets) {
        const resources = { [kind]: place, file, post, team };
        for (const user of actors) {
          const others = withRecipient ? PEOPLE.filter((p) => p.id !== user.id) : [null];
          for (const other of others) {
            const ctx = {
              permission,
              user,
              session: TRUSTED_SESSION,
              recipients: other ? [other] : [],
              resources,
            };
            if (!simulate(savedRoot, ctx).allowed && simulate(draftRoot, ctx).allowed) {
              pairs.add(other ? `${user.id}>${other.id}` : user.id);
            }
          }
        }
      }
    }
  }
  return { count: pairs.size, unit: anyRecipient ? 'pairs' : 'accounts' };
}

/* ------------------------------------------------------------------ */
/* No one passes (round 2, M4)                                         */
/* ------------------------------------------------------------------ */

export interface NoOnePasses {
  /** Permissions no sample account can use under these rules. */
  permissions: PermissionId[];
  /** Every permission is one of them: no one gets anything from this policy. */
  all: boolean;
  /** Values the rules ask for that nothing in the sample holds, to say why. */
  values: { ref: AttrRef; values: string[] }[];
}

const HOLDS: OperatorId[] = ['eq', 'in', 'any_of', 'all_of'];

/**
 * A valid policy that no one passes on this server, so no one gets its
 * permissions (Abhijit, design sync 2026-10-29). Checked over the sample
 * accounts and resources; the product would count on the server
 * ([VERIFY WITH Eng]). Permissions that don't fit the rules are skipped:
 * they're already flagged.
 */
export function noOnePasses(policy: Policy): NoOnePasses {
  const root = prune(policy.root);
  const none: NoOnePasses = { permissions: [], all: false, values: [] };
  if (root.children.length === 0 || policy.permissions.length === 0) return none;
  const inUse = partiesInUse(root);
  const actors = PEOPLE.filter((p) =>
    policy.role === 'Bot accounts' ? p.account !== 'Person' : p.account === 'Person',
  );
  const of = (kind: string) => RESOURCES.filter((r) => r.kind === kind);
  const fitting = policy.permissions.filter((p) => conflictsFor(p, inUse).length === 0);
  const passes = (permission: PermissionId) => {
    const kind = placeOf(permission);
    const files = supplies(permission, 'file') ? of('file') : [undefined];
    const posts = supplies(permission, 'post') ? of('post') : [undefined];
    for (const place of of(kind)) {
      for (const file of files) {
        for (const post of posts) {
          const resources = { [kind]: place, file, post, team: of('team')[0] };
          for (const user of actors) {
            const others = supplies(permission, 'recipient') ? PEOPLE.filter((p) => p.id !== user.id) : [null];
            for (const other of others) {
              const ctx = { permission, user, session: TRUSTED_SESSION, recipients: other ? [other] : [], resources };
              if (simulate(root, ctx).allowed) return true;
            }
          }
        }
      }
    }
    return false;
  };
  const blocked = fitting.filter((p) => !passes(p));
  if (blocked.length === 0) return none;
  // Which asked-for values nothing holds: the likely reason.
  const holders = (party: PartyId) =>
    party === 'user' ? actors : party === 'recipient' ? PEOPLE : party === 'session' ? [] : of(party);
  const valueOf = (h: (typeof PEOPLE)[number] | ResourceFixture, attr: string) =>
    'account' in h && attr === 'isbot' ? (h.account === 'Person' ? 'Person' : 'Bot') : h.attributes[attr];
  const values = allRules(root)
    .filter((r) => r.right.kind === 'value' && HOLDS.includes(r.op) && r.left.party !== 'session')
    .flatMap((r) => {
      const wanted = r.right.kind === 'value' ? r.right.values : [];
      const held = holders(r.left.party).some((h) => {
        const v = valueOf(h, r.left.attr);
        return v !== undefined && v.split(',').some((x) => wanted.includes(x));
      });
      return held ? [] : [{ ref: r.left, values: wanted }];
    });
  return { permissions: blocked, all: blocked.length === policy.permissions.length, values };
}
