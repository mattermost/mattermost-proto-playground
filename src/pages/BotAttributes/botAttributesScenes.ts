export type BotAttributesSceneId =
  | 'attribute-hub'
  | 'bot-account'
  | 'bot-channel'
  | 'permission-policy';

export type BotAttributesSection = 'define' | 'assign' | 'enforce';

export type BotAttributesScene = {
  id: BotAttributesSceneId;
  section: BotAttributesSection;
  title: string;
  lead: string;
};

export const SECTION_LABELS: Record<BotAttributesSection, string> = {
  define: 'Define',
  assign: 'Assign',
  enforce: 'Enforce',
};

export const BOT_ATTRIBUTES_SCENES: BotAttributesScene[] = [
  {
    id: 'attribute-hub',
    section: 'define',
    title: 'Apply attribute to Bots',
    lead: 'In Applies to → Add resource, choose Bots. Turn Required on — like Channels — so new bots must set the attribute at creation.',
  },
  {
    id: 'bot-account',
    section: 'assign',
    title: 'Bot account attributes',
    lead: 'Bot Accounts list shows assigned attributes. Add a bot — Clearance is required before Create returns you to the list.',
  },
  {
    id: 'bot-channel',
    section: 'assign',
    title: 'Bot message & profile',
    lead: 'A bot posts in channel; open its profile to see the same attribute values assigned on the bot account.',
  },
  {
    id: 'permission-policy',
    section: 'enforce',
    title: 'Permission policy for bots',
    lead: 'Bot accounts is a first-class role. Values use bot attributes; the old isbot built-in is gone.',
  },
];
