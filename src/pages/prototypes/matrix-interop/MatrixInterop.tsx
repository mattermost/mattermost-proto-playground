import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from '@mattermost/compass-ui';
import SceneSwitcher from '@/components/navigation/SceneSwitcher/SceneSwitcher';
import { usePrototypeChrome } from '@/contexts/PrototypeChromeContext';
import {
  CHANNEL_OPTIONS,
  CURRENT_CHANNEL,
  INITIAL_CHANNEL_WORKSPACES,
  INITIAL_CONNECTIONS,
  INITIAL_SHARED_CHANNELS,
  NEW_CONNECTION_TEMPLATE,
} from './matrixInteropData';
import { SCENES } from './matrixInteropScenes';
import type {
  ChannelWorkspace,
  MatrixConnection,
  SceneId,
  SharedChannel,
} from './matrixInteropTypes';
import { domainFromHomeserverUrl } from './matrixInteropTypes';
import ShareChannelModal from './components/ShareChannelModal';
import UnmapConfirmModal from './components/UnmapConfirmModal';
import ChannelSettingsScene from './scenes/ChannelSettingsScene';
import ConnectionDetailScene from './scenes/ConnectionDetailScene';
import ConnectionsListScene from './scenes/ConnectionsListScene';
import styles from './MatrixInterop.module.scss';

type ShareModalContext = 'admin' | 'channel';

export default function MatrixInterop() {
  const { setCenterSlot } = usePrototypeChrome();

  const [scene, setScene] = useState<SceneId>('connections');
  const [connections, setConnections] =
    useState<MatrixConnection[]>(INITIAL_CONNECTIONS);
  const [sharedChannels, setSharedChannels] = useState<
    Record<string, SharedChannel[]>
  >(INITIAL_SHARED_CHANNELS);
  const [channelWorkspaces, setChannelWorkspaces] = useState<
    ChannelWorkspace[]
  >(INITIAL_CHANNEL_WORKSPACES);
  const [activeConnectionId, setActiveConnectionId] = useState<string | null>(
    INITIAL_CONNECTIONS[0]?.id ?? null,
  );
  const [pluginEnabled, setPluginEnabled] = useState(true);
  const [sharingEnabled, setSharingEnabled] = useState(true);
  const [showEmptyConnectionsDemo, setShowEmptyConnectionsDemo] =
    useState(false);
  const [isCreatingConnection, setIsCreatingConnection] = useState(false);

  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareModalContext, setShareModalContext] =
    useState<ShareModalContext>('admin');
  const [unmapTarget, setUnmapTarget] = useState<SharedChannel | null>(null);
  const [unmapWorkspaceId, setUnmapWorkspaceId] = useState<string | null>(null);
  const [editingSharedChannel, setEditingSharedChannel] =
    useState<SharedChannel | null>(null);

  useEffect(() => {
    setCenterSlot(
      <SceneSwitcher
        scenes={SCENES}
        activeId={scene}
        onChange={(id) => setScene(id as SceneId)}
        ariaLabel="Matrix interop scenes"
      />,
    );
    return () => setCenterSlot(null);
  }, [scene, setCenterSlot]);

  const sharedChannelCounts = useMemo(
    () =>
      Object.fromEntries(
        connections.map((c) => [c.id, sharedChannels[c.id]?.length ?? 0]),
      ),
    [connections, sharedChannels],
  );

  const activeConnection = useMemo(
    () => connections.find((c) => c.id === activeConnectionId) ?? null,
    [connections, activeConnectionId],
  );

  const handleViewConnection = useCallback((connectionId: string) => {
    setIsCreatingConnection(false);
    setActiveConnectionId(connectionId);
    setScene('connection');
  }, []);

  const handleAddConnection = useCallback(() => {
    setIsCreatingConnection(true);
    setActiveConnectionId(null);
    setScene('connection');
  }, []);

  const handleBackToList = useCallback(() => {
    setIsCreatingConnection(false);
    setScene('connections');
  }, []);

  const handleSaveConnection = useCallback(
    (updated: MatrixConnection) => {
      if (isCreatingConnection) {
        const id = `conn-${Date.now()}`;
        const domain =
          updated.domain || domainFromHomeserverUrl(updated.homeserverUrl);
        const newConnection: MatrixConnection = {
          ...updated,
          id,
          domain,
          health: 'active',
        };

        setConnections((prev) => [...prev, newConnection]);
        setSharedChannels((prev) => ({ ...prev, [id]: [] }));
        setIsCreatingConnection(false);
        setActiveConnectionId(id);
        return;
      }

      setConnections((prev) =>
        prev.map((connection) =>
          connection.id === updated.id ? updated : connection,
        ),
      );
    },
    [isCreatingConnection],
  );

  const handlePauseConnection = useCallback((connectionId: string) => {
    setConnections((prev) =>
      prev.map((connection) => {
        if (connection.id !== connectionId) return connection;
        return {
          ...connection,
          health: connection.health === 'paused' || connection.health === 'degraded'
            ? 'active'
            : 'paused',
        };
      }),
    );
  }, []);

  const handleDeleteConnection = useCallback((connectionId: string) => {
    setConnections((prev) =>
      prev.filter((connection) => connection.id !== connectionId),
    );
    setSharedChannels((prev) => {
      const next = { ...prev };
      delete next[connectionId];
      return next;
    });
    if (activeConnectionId === connectionId) {
      setActiveConnectionId(null);
      setIsCreatingConnection(false);
      setScene('connections');
    }
  }, [activeConnectionId]);

  const openShareModal = useCallback((context: ShareModalContext) => {
    setEditingSharedChannel(null);
    setShareModalContext(context);
    setShareModalOpen(true);
  }, []);

  const closeShareModal = useCallback(() => {
    setShareModalOpen(false);
    setEditingSharedChannel(null);
  }, []);

  const handleEditSharedChannel = useCallback((channel: SharedChannel) => {
    setEditingSharedChannel(channel);
    setShareModalContext('admin');
    setShareModalOpen(true);
  }, []);

  const handleRemoveSharedChannel = useCallback((channel: SharedChannel) => {
    setUnmapTarget(channel);
  }, []);

  const handleShare = useCallback(
    (payload: {
      channelId: string;
      connectionId: string;
      matrixRoomAlias: string;
      visibility: 'public' | 'private';
      team: string;
      channelName: string;
    }) => {
      if (editingSharedChannel) {
        const previousConnectionId = editingSharedChannel.connectionId;
        const updatedChannel: SharedChannel = {
          ...editingSharedChannel,
          connectionId: payload.connectionId,
          name: payload.channelName,
          team: payload.team,
          matrixRoomAlias: payload.matrixRoomAlias,
          visibility: payload.visibility,
        };

        setSharedChannels((prev) => {
          const next = { ...prev };

          if (previousConnectionId !== payload.connectionId) {
            next[previousConnectionId] = (next[previousConnectionId] ?? []).filter(
              (c) => c.id !== editingSharedChannel.id,
            );
            next[payload.connectionId] = [
              ...(next[payload.connectionId] ?? []),
              updatedChannel,
            ];
            return next;
          }

          next[payload.connectionId] = (next[payload.connectionId] ?? []).map(
            (c) => (c.id === editingSharedChannel.id ? updatedChannel : c),
          );
          return next;
        });

        closeShareModal();
        return;
      }

      const newChannel: SharedChannel = {
        id: `sc-${Date.now()}`,
        connectionId: payload.connectionId,
        name: payload.channelName,
        team: payload.team,
        matrixRoomAlias: payload.matrixRoomAlias,
        visibility: payload.visibility,
        health: 'active',
      };

      setSharedChannels((prev) => ({
        ...prev,
        [payload.connectionId]: [
          ...(prev[payload.connectionId] ?? []),
          newChannel,
        ],
      }));

      if (shareModalContext === 'channel') {
        const connection = connections.find((c) => c.id === payload.connectionId);
        if (connection) {
          setChannelWorkspaces((prev) => {
            if (prev.some((w) => w.connectionId === payload.connectionId)) {
              return prev;
            }
            return [
              ...prev,
              {
                id: `ws-${Date.now()}`,
                connectionId: payload.connectionId,
                name: connection.name,
                avatarSrc: '',
                status: 'online',
              },
            ];
          });
        }
      }

      closeShareModal();
    },
    [closeShareModal, connections, editingSharedChannel, shareModalContext],
  );

  const handleConfirmUnmap = useCallback(() => {
    if (unmapTarget) {
      setSharedChannels((prev) => ({
        ...prev,
        [unmapTarget.connectionId]: (prev[unmapTarget.connectionId] ?? []).filter(
          (c) => c.id !== unmapTarget.id,
        ),
      }));
      setUnmapTarget(null);
      return;
    }

    if (unmapWorkspaceId) {
      setChannelWorkspaces((prev) =>
        prev.filter((w) => w.id !== unmapWorkspaceId),
      );
      setUnmapWorkspaceId(null);
    }
  }, [unmapTarget, unmapWorkspaceId]);

  const handleRemoveWorkspace = useCallback((workspaceId: string) => {
    const workspace = channelWorkspaces.find((w) => w.id === workspaceId);
    if (!workspace) return;

    setUnmapWorkspaceId(workspaceId);
    setUnmapTarget({
      id: workspace.id,
      connectionId: workspace.connectionId,
      name: workspace.name,
      team: CURRENT_CHANNEL.team,
      matrixRoomAlias: workspace.name,
      visibility: 'public',
    });
  }, [channelWorkspaces]);

  useEffect(() => {
    if (
      scene === 'connection' &&
      !activeConnectionId &&
      !isCreatingConnection &&
      connections.length > 0
    ) {
      setActiveConnectionId(connections[0].id);
    }
  }, [scene, activeConnectionId, isCreatingConnection, connections]);

  const demoControls = (
    <div className={styles['matrix-interop__demo-controls']}>
      <p className={styles['matrix-interop__demo-label']}>Demo states:</p>
      <Button
        emphasis="Tertiary"
        size="Small"
        onClick={() => setShowEmptyConnectionsDemo((v) => !v)}
      >
        {showEmptyConnectionsDemo ? 'Restore connections' : 'Empty connections'}
      </Button>
      <Button
        emphasis="Tertiary"
        size="Small"
        onClick={() => openShareModal('admin')}
      >
        Open share modal
      </Button>
    </div>
  );

  return (
    <div className={styles['matrix-interop']}>
      {demoControls}
      <div className={styles['matrix-interop__canvas']}>
        {scene === 'connections' && (
          <ConnectionsListScene
            connections={connections}
            pluginEnabled={pluginEnabled}
            onPluginEnabledChange={setPluginEnabled}
            sharedChannelCounts={sharedChannelCounts}
            onViewConnection={handleViewConnection}
            onEditConnection={handleViewConnection}
            onPauseConnection={handlePauseConnection}
            onDeleteConnection={handleDeleteConnection}
            onAddConnection={handleAddConnection}
            showEmptyDemo={showEmptyConnectionsDemo}
          />
        )}

        {scene === 'connection' && (activeConnection || isCreatingConnection) && (
          <ConnectionDetailScene
            connection={
              isCreatingConnection
                ? NEW_CONNECTION_TEMPLATE
                : activeConnection!
            }
            isNew={isCreatingConnection}
            sharedChannels={
              activeConnection
                ? (sharedChannels[activeConnection.id] ?? [])
                : []
            }
            onBack={handleBackToList}
            onAddChannels={() => openShareModal('admin')}
            onEditSharedChannel={handleEditSharedChannel}
            onRemoveSharedChannel={handleRemoveSharedChannel}
            onSaveConnection={handleSaveConnection}
            onTogglePauseConnection={handlePauseConnection}
          />
        )}

        {scene === 'channel-settings' && (
          <ChannelSettingsScene
            channelLabel={`${CURRENT_CHANNEL.emoji} ${CURRENT_CHANNEL.name}`}
            sharingEnabled={sharingEnabled}
            onSharingEnabledChange={setSharingEnabled}
            workspaces={sharingEnabled ? channelWorkspaces : []}
            onAddWorkspace={() => openShareModal('channel')}
            onRemoveWorkspace={handleRemoveWorkspace}
            onCloseSettings={() => setScene('connections')}
          />
        )}
      </div>

      {shareModalOpen && (
        <ShareChannelModal
          variant={shareModalContext}
          connections={connections}
          channelOptions={CHANNEL_OPTIONS}
          editingChannel={editingSharedChannel ?? undefined}
          defaultConnectionId={activeConnectionId ?? undefined}
          defaultChannelId={CURRENT_CHANNEL.id}
          existingSharedChannels={
            activeConnectionId
              ? (sharedChannels[activeConnectionId] ?? [])
              : Object.values(sharedChannels).flat()
          }
          onClose={closeShareModal}
          onShare={handleShare}
        />
      )}

      {(unmapTarget || unmapWorkspaceId) && (
        <UnmapConfirmModal
          channel={
            unmapTarget ?? {
              name: 'workspace',
              matrixRoomAlias: '',
            }
          }
          connectionName={
            connections.find(
              (connection) => connection.id === unmapTarget?.connectionId,
            )?.name ?? 'Matrix connection'
          }
          connectionDomain={
            connections.find(
              (connection) => connection.id === unmapTarget?.connectionId,
            )?.domain ?? ''
          }
          onClose={() => {
            setUnmapTarget(null);
            setUnmapWorkspaceId(null);
          }}
          onConfirm={handleConfirmUnmap}
        />
      )}
    </div>
  );
}
