import { defaultAdminConsoleSidebarGroups } from '@mattermost/compass-proto';

/** Default System Console nav with the Calls plugin page active under Plugins. */
export const CALLS_SIDEBAR_GROUPS = defaultAdminConsoleSidebarGroups.map(
  (group) => ({
    ...group,
    items: (group.key === 'plugins'
      ? [...group.items, { name: 'Calls' }]
      : group.items
    ).map((item) => ({ ...item, active: item.name === 'Calls' })),
  }),
);

export const RECORDING_QUALITY_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

export const TRANSCRIBER_MODEL_OPTIONS = [
  { value: 'tiny', label: 'Tiny' },
  { value: 'base', label: 'Base' },
  { value: 'small', label: 'Small' },
];

export const DEFAULT_ICE_SERVERS =
  '[{"urls":["stun:stun.global.calls.mattermost.com:3478"]}]';

export const CALLS_DOCS_URL =
  'https://docs.mattermost.com/channels/make-calls.html';
