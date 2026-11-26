// [AI DRAFT] Turns one prompt into as much of a policy as it can name,
// then asks for the single next piece that is still missing.
import { COACH } from '../copy';
import { draftFromPrompt } from './aiDraft';
import { PERMISSIONS, type PermissionId } from './permissions';
import {
  allRules,
  isIncomplete,
  prune,
  readback,
  type Group,
  type Policy,
  type RoleId,
} from './rules';
import type { Vocabulary } from './vocabulary';

export interface CoachPatch {
  name?: string;
  description?: string;
  role?: RoleId;
  permissions?: PermissionId[];
  root?: Group;
}

export interface CoachTurn {
  patch: CoachPatch;
  /** What this prompt changed. Empty when the reply is only a question. */
  summary: string;
  /** The one thing still missing, when the policy is not complete. */
  ask: string | null;
  /** This prompt is what completed the policy. */
  justCompleted: boolean;
}

type Gap = 'rules' | 'permissions' | 'name' | 'description';

const ASK: Record<Gap, string> = {
  rules: COACH.askRules,
  permissions: COACH.askPermissions,
  name: COACH.askName,
  description: COACH.askDescription,
};

const DM_SET: PermissionId[] = ['dm_read', 'dm_create', 'dm_write'];
const CHANNEL_MESSAGES: PermissionId[] = ['channel_read', 'channel_write'];

function sameIds(a: PermissionId[], b: PermissionId[]): boolean {
  if (a.length !== b.length) return false;
  const left = [...a].sort();
  const right = [...b].sort();
  return left.every((id, i) => id === right[i]);
}

function hasRules(policy: Policy): boolean {
  return allRules(prune(policy.root)).some((rule) => !isIncomplete(rule));
}

function gaps(policy: Policy, description: string): Gap[] {
  const missing: Gap[] = [];
  if (!hasRules(policy)) missing.push('rules');
  if (policy.permissions.length === 0) missing.push('permissions');
  if (!policy.name.trim()) missing.push('name');
  if (!description.trim()) missing.push('description');
  return missing;
}

function list(items: string[]): string {
  if (items.length <= 1) return items[0] ?? '';
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`;
}

/** What a prompt will write, and which section cards that lands on. Null when the reply only asks a question. */
export interface PolicyBuild {
  line: string;
  sections: Array<'details' | 'who' | 'rules' | 'permissions'>;
}

export function policyBuild(patch: CoachPatch): PolicyBuild | null {
  const sections: PolicyBuild['sections'] = [];
  const parts: string[] = [];
  if (patch.name !== undefined || patch.description !== undefined) sections.push('details');
  if (patch.name !== undefined) parts.push('the name');
  if (patch.description !== undefined) parts.push('the description');
  if (patch.role) {
    sections.push('who');
    parts.push('who this applies to');
  }
  if (patch.root) {
    sections.push('rules');
    parts.push('the rules');
  }
  if (patch.permissions) {
    sections.push('permissions');
    parts.push('the permissions');
  }
  if (sections.length === 0) return null;
  return { line: COACH.buildingWork(list(parts)), sections };
}

/** Actions the prompt names. Channel and file words inside a comparison are not actions. */
function mentionedPermissions(text: string): PermissionId[] {
  const ids = new Set<PermissionId>();
  const add = (...listIds: PermissionId[]) => {
    listIds.forEach((id) => ids.add(id));
  };

  if (/\bdownload\b/.test(text)) add('file_download');
  if (/\bupload\b/.test(text) && /\b(direct|group message|\bdm\b)/.test(text)) {
    add('dm_upload', 'dm_write', 'dm_read');
  } else if (/\bupload\b/.test(text)) {
    add('file_upload');
  }
  if (/\bmanage\b/.test(text) && /\bchannels?\b/.test(text)) add('channel_manage', 'channel_read');
  if (/\b(post|write|send)\b/.test(text) && /\bchannels?\b/.test(text)) add('channel_write', 'channel_read');
  if (/\b(read|see|view)\b/.test(text) && /\bchannels?\b/.test(text)) add('channel_read');

  const messaging =
    /\b(message each other|messaging|direct messages?|group messages?)\b/.test(text) ||
    (/\bmessag/.test(text) && !/\bchannels?\b/.test(text)) ||
    /\bdms?\b/.test(text);
  if (messaging) add(...DM_SET);

  return [...ids];
}

function permissionSentence(ids: PermissionId[]): string {
  const set = new Set(ids);
  const only = (known: PermissionId[]) => known.length === set.size && known.every((id) => set.has(id));
  if (only(DM_SET)) return COACH.directMessages;
  if (only(CHANNEL_MESSAGES)) return COACH.channelMessages;
  const labels = ids.map((id) => PERMISSIONS.find((p) => p.id === id)?.label).filter((label): label is string => Boolean(label));
  return COACH.permissionsAdded(list(labels));
}

function explicitName(prompt: string): string | null {
  const match = prompt.match(/\b(?:call(?:ed)? it|name(?:d)? it|policy name(?: is)?|rename(?: it)? to)\s+["']?([^"']+?)["']?$/i);
  const name = match?.[1]?.replace(/[.\s]+$/, '').trim();
  return name || null;
}

function explicitDescription(prompt: string): string | null {
  const match = prompt.match(/\b(?:because|so that|in order to)\s+(.+)$/i);
  const why = match?.[1]?.trim().replace(/[.\s]+$/, '');
  if (!why) return null;
  return why.charAt(0).toUpperCase() + why.slice(1) + '.';
}

function suggestName(text: string, policy: Policy): string | null {
  let base: string | null = null;
  if (/\bprograms?\b/.test(text)) base = 'Same Program';
  else if (/\btop secret\b/.test(text)) base = 'Top Secret';
  else if (/\bsecret\b/.test(text)) base = 'Secret clearance';
  else if (/\bclearance\b/.test(text)) base = 'Clearance';
  else if (/\bmanaged devices?\b/.test(text)) base = 'Managed device';
  else if (/\bcontractors?\b/.test(text)) base = 'Contractor';
  else if (/\bcompan(?:y|ies)\b/.test(text)) base = 'Same company';
  if (!base) return null;
  if (policy.permissions.some((id) => id.startsWith('dm_'))) return `${base} messaging`;
  if (policy.permissions.some((id) => id.startsWith('file_'))) return `${base} files`;
  if (policy.permissions.some((id) => id.startsWith('channel_'))) return `${base} channels`;
  return base;
}

function suggestDescription(policy: Policy, vocab: Vocabulary): string | null {
  if (!hasRules(policy) || policy.permissions.length === 0) return null;
  const sentence = readback(policy, vocab).sentence;
  if (!sentence || sentence.startsWith('Add a ')) return null;
  const end = sentence.indexOf('. ');
  return end === -1 ? sentence : sentence.slice(0, end + 1);
}

function roleFrom(text: string): RoleId | null {
  if (/\bguests?\b/.test(text)) return 'Guests';
  if (/\bbot accounts?\b/.test(text)) return 'Bot accounts';
  return null;
}

function roleLabel(role: RoleId): string {
  if (role === 'Guests') return 'Guest users';
  return role;
}

/** One turn of the header conversation, against the policy as it stands. */
export function coachTurn(prompt: string, policy: Policy, description: string, vocab: Vocabulary): CoachTurn {
  const original = prompt.trim().replace(/\s+/g, ' ');
  const text = original.toLowerCase();
  const waiting = gaps(policy, description)[0] ?? null;
  if (!text) {
    return { patch: {}, summary: '', ask: waiting ? ASK[waiting] : null, justCompleted: false };
  }

  const drafted = draftFromPrompt(original, policy, vocab);
  const patch: CoachPatch = {};
  const notes: string[] = [];
  let next: Policy = policy;
  let nextDescription = description;

  if (drafted.root && (drafted.kind === 'created' || drafted.kind === 'updated' || drafted.kind === 'removed')) {
    patch.root = drafted.root;
    next = { ...next, root: drafted.root };
    notes.push(drafted.kind === 'created' ? COACH.rulesAdded : drafted.kind === 'removed' ? COACH.rulesRemoved : COACH.rulesUpdated);
  }

  const mentioned = mentionedPermissions(text);
  const removing = /\b(remove|delete|drop)\b/.test(text) && mentioned.length > 0;
  if (removing) {
    const permissions = policy.permissions.filter((id) => !mentioned.includes(id));
    if (!sameIds(permissions, policy.permissions)) {
      patch.permissions = permissions;
      next = { ...next, permissions };
    }
  } else if (mentioned.length > 0) {
    const replace = /\b(only|instead|replace)\b/.test(text);
    const permissions = replace ? mentioned : [...policy.permissions, ...mentioned.filter((id) => !policy.permissions.includes(id))];
    if (!sameIds(permissions, policy.permissions)) {
      patch.permissions = permissions;
      next = { ...next, permissions };
      const added = permissions.filter((id) => !policy.permissions.includes(id));
      notes.push(permissionSentence(added));
    }
  }

  const role = roleFrom(text);
  if (role && role !== policy.role) {
    patch.role = role;
    next = { ...next, role };
    notes.push(COACH.roleSet(roleLabel(role)));
  }

  const asking = drafted.kind === 'question';
  const named = explicitName(original);
  const freeName = !named && !asking && waiting === 'name' && !patch.root && !patch.permissions ? original : null;
  const name = named ?? freeName ?? (!asking && !policy.name.trim() ? suggestName(text, next) : null);
  if (name && name !== policy.name) {
    patch.name = name;
    next = { ...next, name };
    notes.push(COACH.named(name));
  }

  const statedWhy = explicitDescription(original);
  const freeWhy = !statedWhy && !asking && waiting === 'description' && !patch.root && !patch.permissions && !patch.name ? original : null;
  const why = statedWhy ?? freeWhy ?? (!asking && !description.trim() ? suggestDescription(next, vocab) : null);
  if (why && why !== description) {
    patch.description = why;
    nextDescription = why;
    notes.push(COACH.described);
  }

  const remaining = gaps(next, nextDescription);
  const justCompleted = remaining.length === 0 && gaps(policy, description).length > 0;
  const changed = notes.length > 0;

  if (asking && !changed) {
    return {
      patch: {},
      summary: drafted.body,
      ask: remaining[0] ? ASK[remaining[0]] : null,
      justCompleted: false,
    };
  }

  if (!changed) {
    return {
      patch: {},
      summary: waiting ? COACH.still : COACH.nothing,
      ask: waiting ? ASK[waiting] : null,
      justCompleted: false,
    };
  }

  return {
    patch,
    summary: notes.join(' '),
    ask: remaining[0] ? ASK[remaining[0]] : justCompleted ? COACH.done : null,
    justCompleted,
  };
}
