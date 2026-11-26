// [AI DRAFT] Scene and screen inventory, after designer feedback round 1
// (2026-10-29): A′ only (B′ archived), rules first (permission-first
// archived), User → Recipient → resource order, collapsed warnings and
// explanation. Switches left: grouping and naming.
// Round 2 (design sync, 2026-10-30; 09-design-sync-feedback.md): M1 three
// sections, M2 Recipient step, M3 Channel and Direct or group message apart
// and narrowed by permissions, M4 No one passes, M5 reasons, M6 search.
import { attributeDef, type ResourceKind } from './model/catalog';
import type { GroupingMode } from './model/celParse';
import { blankPolicy, buildScenario, type ScenarioId } from './model/fixtures';
import type { PermissionId } from './model/permissions';
import { attr, group, rule, toCel, value, type Policy } from './model/rules';
import { celPath, type Vocabulary } from './model/vocabulary';

/**
 * Grouping options. Grouping loop iteration 1 kept "Group blocks"; Connector
 * words and Rule sets are archived (07-grouping-loop/it1-*.md), as is the
 * checkbox model before them.
 */
export const GROUPINGS: { value: GroupingMode; label: string }[] = [
  // Round 1.2 (designer): Group blocks is archived as well. One flat All/Any
  // join; anything more complex is written in Advanced mode.
  { value: 'flat', label: 'Flat (All / Any)' },
];

export type SceneId = 'authoring' | 'save' | 'advanced' | 'simulate';

export const SCENES: { id: SceneId; label: string }[] = [
  { id: 'authoring', label: '1 · Authoring' },
  { id: 'save', label: '2 · Saving' },
  { id: 'advanced', label: '3 · Advanced mode' },
  { id: 'simulate', label: '4 · Simulate' },
];

export interface ScreenSetup {
  policy: Policy;
  advanced?: boolean;
  cel?: string;
  canonicalNote?: boolean;
  addMenuOpen?: boolean;
  addMenuQuery?: string;
  valueMenuOpen?: boolean;
  pickerOpen?: boolean;
  warningsOpen?: boolean;
  explainOpen?: boolean;
  rowMenuOpen?: boolean;
  /** Show "Ungrouped · Undo", restoring this tree. */
  undoFrom?: Policy['root'];
  /** The saved version, when the screen shows an edit in progress. */
  saved?: Policy;
  save?: boolean;
  simulate?: {
    permission?: PermissionId;
    user?: string;
    recipients?: string[];
    resources?: Partial<Record<ResourceKind, string>>;
    view?: 'trace' | 'pairs';
  };
  scrollTo?: 'who' | 'rules' | 'permissions' | 'bottom';
}

export interface ScreenDef {
  id: string;
  label: string;
  title: string;
  /** Reviewer context, outside the product frame. */
  note: (g: GroupingMode) => string;
  setup: (g: GroupingMode, v: Vocabulary) => ScreenSetup;
}

const s = (id: ScenarioId) => buildScenario(id, 'a');

/** Two group levels: too deep for Simple mode in either grouping mode. */
function tooDeepCel(v: Vocabulary): string {
  return toCel(
    group('any', [
      rule({ party: 'user', attr: 'employment_type' }, 'neq', value('Contractor')),
      group('all', [
        rule({ party: 'recipient', attr: 'isbot' }, 'eq', value('Bot')),
        group('any', [
          rule({ party: 'user', attr: 'clearance' }, 'gte', value('Secret')),
          rule({ party: 'user', attr: 'program' }, 'eq', attr('recipient', 'program')),
        ]),
      ]),
    ]),
    v,
  );
}

/** Program compared with Clearance: different option lists, so an error. */
function mismatchCel(v: Vocabulary): string {
  return `${celPath(v, 'user', attributeDef('user', 'program'))} == ${celPath(v, 'recipient', attributeDef('recipient', 'clearance'))}`;
}

function botsPolicy(): Policy {
  return {
    id: 'bots',
    name: 'Program bots can read channels',
    role: 'Bot accounts',
    permissions: ['channel_read'],
    root: group('all', [rule({ party: 'user', attr: 'program' }, 'eq', value('Ashgrove'))]),
  };
}

/** Recipient and Team together: no permission has both (rules-first error). */
function noFitPolicy(): Policy {
  return {
    id: 'nofit',
    name: 'Program team members only',
    role: 'Members',
    permissions: [],
    root: group('all', [
      rule({ party: 'user', attr: 'program' }, 'eq', attr('recipient', 'program')),
      rule({ party: 'team', attr: 'program' }, 'eq', value('Ashgrove')),
    ]),
  };
}

/** A File rule under Create New Direct and Group Messages, plus a rule with no value. */
function unfinishedPolicy(): Policy {
  return {
    id: 'unfinished',
    name: 'Cleared recipients',
    role: 'Members',
    permissions: ['dm_create', 'dm_upload'],
    root: group('all', [
      rule({ party: 'recipient', attr: 'clearance' }, 'gte', attr('file', 'classification')),
      rule({ party: 'user', attr: 'position' }, 'eq', value()),
    ]),
  };
}

/** Channel permissions chosen: Recipient and Direct or group message aren't offered (M3). */
function channelPolicy(): Policy {
  return {
    id: 'narrowed',
    name: 'Ashgrove channels',
    role: 'Members',
    permissions: ['channel_read', 'channel_write'],
    root: group('all', [rule({ party: 'user', attr: 'program' }, 'eq', value('Ashgrove'))]),
  };
}

/** S5 with two more ways through: long enough that the summary is cut at two lines (M7). */
function longPolicy(): Policy {
  return {
    id: 'long',
    name: 'Contractor barrier, with exceptions',
    role: 'Members',
    permissions: ['dm_create', 'dm_write'],
    root: group('any', [
      rule({ party: 'user', attr: 'employment_type' }, 'neq', value('Contractor')),
      rule({ party: 'recipient', attr: 'employment_type' }, 'neq', value('Contractor')),
      rule({ party: 'user', attr: 'company' }, 'eq', attr('recipient', 'company')),
      rule({ party: 'user', attr: 'position' }, 'eq', value('Program lead')),
      rule({ party: 'recipient', attr: 'isbot' }, 'eq', value('Bot')),
    ]),
  };
}

/** Rules but no permission yet, like the designer's mock: a ranked rule and a session rule. */
function rulesOnlyPolicy(): Policy {
  return {
    id: 'rules-only',
    name: 'Cleared staff on managed devices',
    role: 'Members',
    permissions: [],
    root: group('all', [
      rule({ party: 'user', attr: 'clearance' }, 'gte', value('Secret')),
      rule({ party: 'session', attr: 'device' }, 'eq', value('Managed')),
    ]),
  };
}

/** Permissions but no rules yet: the policy can't save, so nothing is "allowed" yet. */
function permissionsOnlyPolicy(): Policy {
  return {
    id: 'perms-only',
    name: 'Contractor messaging',
    role: 'Members',
    permissions: ['dm_create', 'dm_write'],
    root: group('all', []),
  };
}

/** Valid, but no channel is marked Top Secret, so no one passes (M4). */
function noOnePolicy(): Policy {
  return {
    id: 'noone',
    name: 'Downloads from Top Secret channels',
    role: 'Members',
    permissions: ['file_download'],
    root: group('all', [
      rule({ party: 'user', attr: 'clearance' }, 'eq', value('Top Secret')),
      rule({ party: 'channel', attr: 'classification' }, 'eq', value('Top Secret')),
    ]),
  };
}

/** A and (B or C): Secret clearance, and either the same Program as the file or a lead role. */
function andOrPolicy(): Policy {
  return {
    id: 'andor',
    name: 'Cleared downloads',
    role: 'Members',
    permissions: ['file_download'],
    root: group('all', [
      rule({ party: 'user', attr: 'clearance' }, 'gte', value('Secret')),
      group('any', [
        rule({ party: 'user', attr: 'program' }, 'eq', attr('file', 'program')),
        rule({ party: 'user', attr: 'position' }, 'eq', value('Program lead')),
      ]),
    ]),
  };
}


function wideningPolicy(): Policy {
  return {
    id: 'widen',
    name: 'Same program only',
    role: 'Members',
    permissions: ['dm_create', 'dm_write'],
    root: group('any', [
      rule({ party: 'user', attr: 'program' }, 'eq', attr('recipient', 'program')),
      rule({ party: 'user', attr: 'employment_type' }, 'neq', value('Contractor')),
    ]),
  };
}

export const SCREENS: Record<SceneId, ScreenDef[]> = {
  authoring: [
    {
      id: 'empty',
      label: 'Empty',
      title: 'An empty policy: pick any attribute first',
      note: () =>
        'Rules first (F3): before any permission is chosen, every party with attributes is offered. Recipient is the one step under "Direct and group messages" (M2). A direct or group message has no attributes of its own, so it is not in this menu (designer, 2026-10-31). One search covers the whole menu (M6).',
      setup: () => ({ policy: blankPolicy(), addMenuOpen: true }),
    },
    {
      id: 'search',
      label: 'Search',
      title: 'One search for every attribute, steps included',
      note: () =>
        'Matches are listed flat with their party, so "Recipient: Program" can\'t be mistaken for the user\'s (design sync, M6).',
      setup: () => ({ policy: blankPolicy(), addMenuOpen: true, addMenuQuery: 'program', scrollTo: 'rules' }),
    },
    {
      id: 'rules-only',
      label: 'Rules, no permission',
      title: 'Rules written, no permission yet: the rules are read back',
      note: () =>
        'Before a permission is chosen, "What this policy does" reads "This policy applies only when …" (designer mock, 2026-10-31).',
      setup: () => ({ policy: rulesOnlyPolicy(), scrollTo: 'rules' }),
    },
    {
      id: 'perms-only',
      label: 'Permissions, no rules',
      title: 'Permissions chosen, no rules yet: what the policy will control',
      note: () =>
        'It names the permissions and asks for a rule. It never says "Members can …" without a condition: a policy needs a rule to save (designer mock, round 1.1).',
      setup: () => ({ policy: permissionsOnlyPolicy(), scrollTo: 'rules' }),
    },
    {
      id: 's1',
      label: 'Same program',
      title: 'Direct and group messages only with people in the same Program',
      note: () =>
        'User → Recipient order (feedback F4): "User: Program is same as Recipient: Program". "What this policy does" sits in the Sections rail and stays beside the form as it scrolls (designer mock, 2026-10-31).',
      setup: () => ({ policy: s('s1'), scrollTo: 'rules' }),
    },
    {
      id: 'compare',
      label: 'Compare menu',
      title: 'Comparing with another attribute: only matching option lists',
      note: () =>
        'A rule can be compared with another party\'s attribute, and is kept exactly as written. The menu lists User → Recipient → resource. Attributes with a different option list are under "Not available" at the end, after a divider (feedback F4, F8).',
      setup: () => ({ policy: s('s1'), valueMenuOpen: true, scrollTo: 'rules' }),
    },
    {
      id: 's3',
      label: 'Bot exception',
      title: 'Contractors can start direct messages with bots only',
      note: () =>
        'Two rules joined with Any: anyone who isn’t a contractor, or any message to a bot. Account type (Person / Bot) is the built-in flag, offered on the Recipient side.',
      setup: () => ({ policy: s('s3'), scrollTo: 'rules' }),
    },
    {
      id: 'and-or',
      label: 'A and (B or C)',
      title: 'Downloads need Secret clearance, and either the same Program or a lead role',
      note: () => 'A mixed All/Any join opens in Advanced mode, with its explanation open.',
      setup: (g) => ({ policy: andOrPolicy(), advanced: g === 'flat', scrollTo: 'rules' }),
    },
    {
      id: 's4',
      label: 'Large groups',
      title: 'No file sharing in group messages with more than 8 members',
      note: () =>
        'Direct or group message is its own resource, separate from Channel (M3). Both are `resource.` in CEL: [VERIFY WITH Eng] E-8. Member count needs E-4.',
      setup: () => ({ policy: s('s4'), scrollTo: 'rules' }),
    },
    {
      id: 's5',
      label: 'Directional',
      title: 'Contractors from different companies can’t message each other',
      note: () =>
        'Three rules joined with Any. The reading lists the barrier as "Not allowed when all of these are true", one line per rule, open in the rail (F7 revisited: nothing in the form moves).',
      setup: () => ({ policy: s('s5'), scrollTo: 'rules' }),
    },
    {
      id: 'long',
      label: 'Long policy',
      title: 'Five ways through: a long reading scrolls inside the rail',
      note: () =>
        'In the rail nothing is cut; a reading taller than the rail scrolls on its own. With the Live summary placement it\u2019s cut at two lines, with "Show details" for the rest (M7, VIS1-1).',
      setup: () => ({ policy: longPolicy(), scrollTo: 'rules' }),
    },
    {
      id: 'mixed-picker',
      label: 'Rules limit permissions',
      title: 'The rules decide which permissions fit',
      note: () =>
        'With Recipient rules, only direct and group message permissions fit. The rest are under "Not available", with what Recipient rules work with, said once per group (F3, F8, M5).',
      setup: () => ({ policy: s('s1'), pickerOpen: true, scrollTo: 'permissions' }),
    },
    {
      id: 'narrowed',
      label: 'Permissions narrow',
      title: 'Channel permissions chosen: Recipient and direct or group messages aren\u2019t offered',
      note: () =>
        'Once permissions are chosen, attributes none of them can use move under "Not available", with what they work with (M3, M5). An empty policy is still rules first.',
      setup: () => ({ policy: channelPolicy(), addMenuOpen: true, scrollTo: 'rules' }),
    },
    {
      id: 'no-fit',
      label: 'No permission fits',
      title: 'Rules that no permission can hold together are an error in the rules section',
      note: () =>
        'Recipient and Team together: no permission has both. This is the one thing shown up front (feedback F3, F6).',
      setup: () => ({ policy: noFitPolicy(), scrollTo: 'rules' }),
    },
    {
      id: 'bots',
      label: 'Bot accounts',
      title: 'A policy for bot accounts: the acting party is a bot',
      note: () =>
        '"Bot accounts" is chosen in the role picker. The table heading and the party chip follow the role. CEL stays `user.`.',
      setup: () => ({ policy: botsPolicy(), scrollTo: 'rules' }),
    },
  ],
  save: [
    {
      id: 'impact',
      label: 'Impact at save',
      title: 'Before saving: who has no value for the attributes this policy uses',
      note: () => 'Counts repeat the collapsed warning. A missing value blocks the action.',
      setup: () => ({ policy: s('s5'), save: true }),
    },
    {
      id: 'blocked',
      label: "Can't save yet",
      title: 'Save waits until every rule is finished and every permission fits',
      note: () =>
        'A File rule doesn’t fit Create New Direct and Group Messages, so that permission row is flagged (rules first). A rule with no value shows "Select value". Both block Save, with the reasons beside it.',
      setup: () => ({ policy: unfinishedPolicy(), scrollTo: 'bottom' }),
    },
    {
      id: 'no-one',
      label: 'No one passes',
      title: 'A valid policy no one passes: the Warnings button counts it',
      note: () =>
        'No channel is marked Top Secret, so no one can download files under this policy. Checked live over the sample accounts and resources; the product needs a server-side count, [VERIFY WITH Eng] (M4, M8).',
      setup: () => ({ policy: noOnePolicy(), warningsOpen: true, scrollTo: 'rules' }),
    },
    {
      id: 'no-one-save',
      label: 'No one passes · save',
      title: 'Saving a policy no one passes asks first',
      note: () => 'The confirmation leads with it. The Warnings button only shows the count (M4).',
      setup: () => ({ policy: noOnePolicy(), save: true }),
    },
    {
      id: 'widening',
      label: 'Less strict',
      title: 'An edit that makes the policy less strict, in the Warnings panel',
      note: () =>
        'Here the join went from All to Any. The Warnings button shows the count; "Less strict" is in the panel. The panel is closed by default (feedback F6), and this screen opens it.',
      setup: () => {
        const draft = wideningPolicy();
        return {
          policy: draft,
          saved: { ...draft, root: { ...draft.root, join: 'all' } },
          warningsOpen: true,
          scrollTo: 'rules',
        };
      },
    },
  ],
  advanced: [
    {
      id: 'round-trip',
      label: 'Round trip',
      title: 'Advanced mode after a trip through Simple mode',
      note: () =>
        'Autocomplete is grouped by party, in the active naming. Coming back from Simple writes the expression in the standard format, with explicit parentheses. Rules keep the order and direction they were written in (feedback F4, round 1.1).',
      setup: () => ({ policy: s('s5'), advanced: true, canonicalNote: true, scrollTo: 'rules' }),
    },
    {
      id: 'too-complex',
      label: 'Too complex',
      title: 'An expression Simple mode can’t show stays in Advanced mode',
      note: () =>
        'Simple is disabled, with the shipped reason. The reading is the only plain view of this expression.',
      setup: (_g, v) => ({ policy: s('s3'), advanced: true, cel: tooDeepCel(v), scrollTo: 'rules' }),
    },
    {
      id: 'reversed',
      label: 'Reversed rule',
      title: 'A reversed rule (!) stays in Advanced mode, and the explanation says so',
      note: () =>
        'Simple mode can\u2019t show "!", and the explanation can\u2019t read it back, so it says to review the expression (round 2, M7, UX2-1).',
      setup: (_g, v) => ({
        policy: s('s5'),
        advanced: true,
        cel: `!(${celPath(v, 'user', attributeDef('user', 'company'))} == ${celPath(v, 'recipient', attributeDef('recipient', 'company'))})`,
        scrollTo: 'rules',
      }),
    },
    {
      id: 'error',
      label: 'Error',
      title: 'Comparing attributes with different option lists is an error',
      note: () => 'Inline error, linked to the field. The server checks the same rule on save.',
      setup: (_g, v) => ({ policy: s('s1'), advanced: true, cel: mismatchCel(v), scrollTo: 'rules' }),
    },
  ],
  simulate: [
    {
      id: 'dm',
      label: 'Direct message',
      title: 'Simulate: two contractors from different companies',
      note: () => 'Trace by rule: every row of the Any list fails, so the message is blocked.',
      setup: () => ({
        policy: s('s5'),
        simulate: { permission: 'dm_create', user: 'darius', recipients: ['ethan'] },
      }),
    },
    {
      id: 'gm',
      label: 'Group with bots',
      title: 'Simulate: a group message with two bots and a person',
      note: () => 'One trace per recipient. One failing recipient blocks the group message.',
      setup: () => ({
        policy: s('s3'),
        simulate: {
          permission: 'dm_create',
          user: 'darius',
          recipients: ['readiness-bot', 'feed-bot', 'isabella'],
          resources: { dm: 'gm-four' },
        },
      }),
    },
    {
      id: 'remote',
      label: 'Connected server',
      title: 'Simulate: a recipient on a connected server, who has no attributes here',
      note: () => 'Each rule with no value fails; with none passing, the message is denied (E-5).',
      setup: () => ({
        policy: s('s5'),
        simulate: { permission: 'dm_create', user: 'darius', recipients: ['leila'] },
      }),
    },
    {
      id: 'pairs',
      label: 'Both directions',
      title: 'Simulate: who can message whom, in both directions',
      note: () => 'Checks direction without running each pair by hand.',
      setup: () => ({
        policy: s('s5'),
        simulate: {
          permission: 'dm_create',
          user: 'darius',
          recipients: ['ethan', 'isabella', 'leila'],
          view: 'pairs',
        },
      }),
    },
  ],
};

export function sceneFromParam(v: string | null): SceneId {
  return SCENES.some((x) => x.id === v) ? (v as SceneId) : 'authoring';
}
