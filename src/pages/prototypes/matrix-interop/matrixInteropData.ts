import avatarAiko from '@/assets/avatars/Aiko Tan.png';
import avatarMarco from '@/assets/avatars/Marco Rinaldi.png';
import type {
  ChannelWorkspace,
  MattermostChannelOption,
  MatrixConnection,
  SharedChannel,
} from './matrixInteropTypes';

export const CURRENT_CHANNEL = {
  id: 'release-planning',
  name: 'Release Planning',
  team: 'Product',
  visibility: 'public' as const,
  emoji: '📋',
};

export const NEW_CONNECTION_TEMPLATE: MatrixConnection = {
  id: '__new__',
  name: '',
  homeserverUrl: '',
  domain: '',
  health: 'unknown',
  applicationServiceToken: '',
  homeserverToken: '',
  messageSyncEnabled: true,
  matrixRateLimitingEnabled: false,
};

export const INITIAL_CONNECTIONS: MatrixConnection[] = [
  {
    id: 'acme',
    name: 'Acme Agency',
    homeserverUrl: 'https://matrix.acme.example.com',
    domain: 'acme.example.com',
    health: 'active',
    applicationServiceToken: 'as-token-acme-••••••••',
    homeserverToken: 'hs-token-acme-••••••••',
    messageSyncEnabled: true,
    matrixRateLimitingEnabled: false,
  },
  {
    id: 'globex',
    name: 'Globex Corp',
    homeserverUrl: 'https://matrix.globex.example.com',
    domain: 'globex.example.com',
    health: 'active',
    applicationServiceToken: 'as-token-globex-••••••••',
    homeserverToken: 'hs-token-globex-••••••••',
    messageSyncEnabled: true,
    matrixRateLimitingEnabled: false,
  },
  {
    id: 'initech',
    name: 'Initech Systems',
    homeserverUrl: 'https://matrix.initech.example.com',
    domain: 'initech.example.com',
    health: 'paused',
    applicationServiceToken: 'as-token-initech-••••••••',
    homeserverToken: 'hs-token-initech-••••••••',
    messageSyncEnabled: false,
    matrixRateLimitingEnabled: true,
  },
];

export const INITIAL_SHARED_CHANNELS: Record<string, SharedChannel[]> = {
  acme: [
    {
      id: 'sc-1',
      connectionId: 'acme',
      name: 'Global Data Solutions',
      team: 'Sales',
      matrixRoomAlias: 'Global Data',
      visibility: 'public',
      health: 'active',
    },
    {
      id: 'sc-2',
      connectionId: 'acme',
      name: 'Quantum Leap Solutions',
      team: 'Sales',
      matrixRoomAlias: 'Quantum',
      visibility: 'private',
      health: 'active',
    },
    {
      id: 'sc-3',
      connectionId: 'acme',
      name: 'Stellar CyberNexus',
      team: 'Engineering',
      matrixRoomAlias: 'Cyber Nexus',
      visibility: 'public',
      health: 'active',
    },
    {
      id: 'sc-4',
      connectionId: 'acme',
      name: 'Apex Digital Solutions',
      team: 'Sales',
      matrixRoomAlias: 'Apex External',
      visibility: 'private',
      health: 'degraded',
    },
  ],
  globex: [
    {
      id: 'sc-5',
      connectionId: 'globex',
      name: 'Partner Updates',
      team: 'Marketing',
      matrixRoomAlias: 'Partner Updates',
      visibility: 'public',
      health: 'active',
    },
  ],
  initech: [],
};

export const CHANNEL_OPTIONS: MattermostChannelOption[] = [
  { id: 'feature-requests', name: 'Feature requests', team: 'Product', visibility: 'public' },
  { id: 'engineering', name: 'Engineering', team: 'Core', visibility: 'public' },
  { id: 'design-reviews', name: 'Design Reviews', team: 'UX', visibility: 'private' },
  { id: 'release-planning', name: 'Release Planning', team: 'Product', visibility: 'public' },
  { id: 'customer-escalations', name: 'Customer Escalations', team: 'Support', visibility: 'private' },
];

export const INITIAL_CHANNEL_WORKSPACES: ChannelWorkspace[] = [
  {
    id: 'ws-1',
    connectionId: 'acme',
    name: 'Nebula Networks',
    avatarSrc: avatarAiko,
    status: 'online',
  },
  {
    id: 'ws-2',
    connectionId: 'globex',
    name: 'Joint Command Task Force',
    avatarSrc: avatarMarco,
    status: 'online',
  },
];
