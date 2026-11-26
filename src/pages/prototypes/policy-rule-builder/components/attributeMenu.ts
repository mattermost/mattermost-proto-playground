// [AI DRAFT] The attribute menu ("+ Add attribute" and a row's left cell).
//
// An empty policy is rules first (feedback F3): every party can be picked.
// Once permissions are chosen, they narrow it (round 2, M3), and the rules
// do too. Unavailable parties are gathered at the end by MenuCell (F8), with
// what they work with (M5).
// Layout (round 2): User and User's session list their attributes. Recipient
// is the one step under "Direct and group messages" (M2), so its attributes
// can't be mistaken for the user's; resources are steps (round 1.3).
// A disabled step keeps its attributes so the menu's search can still find
// them, with the reason (M6).
import { RESOURCE_KINDS, attributesFor, type PartyId } from '../model/catalog';
import { partyStatus, type PermissionId } from '../model/permissions';
import type { RoleId } from '../model/rules';
import type { Vocabulary } from '../model/vocabulary';
import { MENU } from '../copy';
import type { MenuGroup, MenuOption } from './MenuCell';

export const refKey = (party: PartyId, attr: string) => `${party}:${attr}`;

export function parseRefKey(key: string): { party: PartyId; attr: string } {
  const [party, attr] = key.split(':') as [PartyId, string];
  return { party, attr };
}

function partyOptions(party: PartyId, role: RoleId, disabledReason?: string): MenuOption[] {
  return attributesFor(party, role).map<MenuOption>((a) => ({
    value: refKey(party, a.id),
    label: a.label,
    disabledReason,
  }));
}

export function attributeMenu(
  vocab: Vocabulary,
  partiesInUse: PartyId[],
  role: RoleId,
  permissions: PermissionId[],
  /** The row being edited: its own party doesn't count against itself. */
  editing?: PartyId,
): MenuGroup[] {
  const inUse = partiesInUse.filter((p) => p !== editing);
  const status = (p: PartyId) => partyStatus(inUse, p, (x) => vocab.party[x], permissions);
  const step = (p: PartyId, description?: string): MenuOption => {
    const st = status(p);
    const reason = st.kind === 'unavailable' ? st.reason : undefined;
    return {
      value: `__type:${p}`,
      label: vocab.party[p],
      description,
      disabledReason: reason,
      next: { title: vocab.party[p], groups: [{ options: partyOptions(p, role, reason) }] },
    };
  };
  return [
    { heading: vocab.party.user, options: partyOptions('user', role) },
    { heading: vocab.party.session, options: partyOptions('session', role) },
    // A direct or group message has no attributes of its own, so it is not a
    // resource you can add a rule on (designer, 2026-10-31). Comparisons there
    // are the user against the recipient; a file or post the action touches
    // still has its own attributes. Recipient follows the resources.
    {
      heading: MENU.resourceHeading,
      options: RESOURCE_KINDS.filter((k) => k !== 'dm').map((k) => step(k)),
    },
    { heading: MENU.dmHeading, options: [step('recipient')] },
  ];
}
