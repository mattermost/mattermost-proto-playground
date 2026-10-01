// [AI DRAFT] Neutral denial strings (draft copy, first pass). None names an
// attribute, a policy, or a member.

export type DeniedKind = 'start-dm' | 'start-gm' | 'post';

export const DENIED_COPY: Record<DeniedKind, string> = {
  'start-dm': "You can't start a conversation with this person.",
  'start-gm': "You can't start a conversation with this group.",
  post: "You can't post in this conversation.",
};

/**
 * Stand-in for the admin-configured Help Link value. The link renders only when
 * a custom value is set; the Mattermost default never appears here.
 */
export const HELP_LINK_URL = 'https://help.program-office.example/messaging';
