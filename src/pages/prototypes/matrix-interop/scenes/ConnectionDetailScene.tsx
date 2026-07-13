import { useEffect, useMemo, useState } from 'react';
import type { MatrixConnection, SharedChannel } from '../matrixInteropTypes';
import ConnectionConfigPanel from '../components/ConnectionConfigPanel';
import MatrixAdminShell from '../components/MatrixAdminShell';
import SharedChannelsTable from '../components/SharedChannelsTable';

type ConnectionDetailSceneProps = {
  connection: MatrixConnection;
  sharedChannels: SharedChannel[];
  isNew?: boolean;
  onBack: () => void;
  onAddChannels: () => void;
  onEditSharedChannel: (channel: SharedChannel) => void;
  onRemoveSharedChannel: (channel: SharedChannel) => void;
  onSaveConnection: (connection: MatrixConnection) => void;
  onTogglePauseConnection: (connectionId: string) => void;
};

function connectionSettingsEqual(
  a: MatrixConnection,
  b: MatrixConnection,
): boolean {
  return (
    a.name === b.name &&
    a.homeserverUrl === b.homeserverUrl &&
    a.messageSyncEnabled === b.messageSyncEnabled &&
    a.matrixRateLimitingEnabled === b.matrixRateLimitingEnabled &&
    a.applicationServiceToken === b.applicationServiceToken &&
    a.homeserverToken === b.homeserverToken
  );
}

export default function ConnectionDetailScene({
  connection,
  sharedChannels,
  isNew = false,
  onBack,
  onAddChannels,
  onEditSharedChannel,
  onRemoveSharedChannel,
  onSaveConnection,
  onTogglePauseConnection,
}: ConnectionDetailSceneProps) {
  const [draft, setDraft] = useState(connection);

  useEffect(() => {
    setDraft(connection);
  }, [connection]);

  const isDirty = useMemo(
    () => !connectionSettingsEqual(draft, connection),
    [draft, connection],
  );

  const handleSave = () => {
    onSaveConnection(draft);
  };

  const handleCancel = () => {
    if (isNew) {
      onBack();
      return;
    }

    setDraft(connection);
  };

  return (
    <MatrixAdminShell
      title={isNew ? 'New Matrix Bridge Connection' : 'Matrix Bridge'}
      showBack
      ariaLabelBack="All connections"
      onBackClick={onBack}
      saveDisabled={!isDirty}
      onSave={handleSave}
      onCancel={handleCancel}
    >
      <ConnectionConfigPanel
        key={connection.id}
        connection={draft}
        isNew={isNew}
        onChange={(patch) => setDraft((prev) => ({ ...prev, ...patch }))}
        onTogglePause={() => onTogglePauseConnection(connection.id)}
      />
      <SharedChannelsTable
        channels={sharedChannels}
        onAddChannels={onAddChannels}
        onEditChannel={onEditSharedChannel}
        onRemoveChannel={onRemoveSharedChannel}
      />
    </MatrixAdminShell>
  );
}
