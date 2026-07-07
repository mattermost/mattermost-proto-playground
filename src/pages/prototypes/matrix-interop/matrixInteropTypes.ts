export type SceneId = 'connections' | 'connection' | 'channel-settings';

export type ConnectionHealth = 'active' | 'degraded' | 'unknown';
export type ShareMode = 'create' | 'map';
export type ChannelVisibility = 'public' | 'private';
export type ShareModalVariant = 'admin' | 'channel';

export interface MatrixConnection {
  id: string;
  name: string;
  homeserverUrl: string;
  domain: string;
  health: ConnectionHealth;
  applicationServiceToken: string;
  homeserverToken: string;
  messageSyncEnabled: boolean;
}

export interface SharedChannel {
  id: string;
  connectionId: string;
  name: string;
  team: string;
  matrixRoomAlias: string;
  visibility: ChannelVisibility;
  health?: ConnectionHealth;
}

export interface ChannelWorkspace {
  id: string;
  connectionId: string;
  name: string;
  avatarSrc: string;
  status: 'online' | 'offline';
}

export interface MattermostChannelOption {
  id: string;
  name: string;
  team: string;
  visibility: ChannelVisibility;
}

export interface ShareChannelFormState {
  channelId: string;
  connectionId: string;
  shareMode: ShareMode;
  roomValue: string;
}

const MATRIX_ROOM_ADDRESS_PATTERN = /^[#!][^:\s]+:[^\s]+$/;

export function isValidMatrixRoomAddress(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  return MATRIX_ROOM_ADDRESS_PATTERN.test(trimmed);
}

export function domainFromHomeserverUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return '';

  try {
    const host = new URL(trimmed).hostname;
    return host.replace(/^matrix\./, '') || host;
  } catch {
    return '';
  }
}

export function deriveMatrixRoomAlias(
  shareMode: ShareMode,
  roomValue: string,
  channelName: string,
): string {
  if (shareMode === 'map') {
    return roomValue.trim();
  }
  const name = roomValue.trim() || channelName;
  return name;
}
