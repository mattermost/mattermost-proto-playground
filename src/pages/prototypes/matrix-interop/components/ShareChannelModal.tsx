import { useId, useMemo, useState, type ChangeEvent } from 'react';
import {
  Button,
  Modal,
  Radio,
  SectionNotice,
  Select,
  TextInput,
} from '@mattermost/compass-ui';
import ChannelAutocompleteField from './ChannelAutocompleteField';
import modalStyles from './MatrixInteropModals.module.scss';
import type {
  MattermostChannelOption,
  MatrixConnection,
  SharedChannel,
  ShareModalVariant,
  ShareMode,
} from '../matrixInteropTypes';
import {
  deriveMatrixRoomAlias,
  isValidMatrixRoomAddress,
} from '../matrixInteropTypes';

type ShareChannelModalProps = {
  variant: ShareModalVariant;
  connections: MatrixConnection[];
  channelOptions: MattermostChannelOption[];
  existingSharedChannels?: SharedChannel[];
  editingChannel?: SharedChannel;
  defaultConnectionId?: string;
  defaultChannelId?: string;
  onClose: () => void;
  onShare: (payload: {
    channelId: string;
    connectionId: string;
    shareMode: ShareMode;
    matrixRoomAlias: string;
    visibility: 'public' | 'private';
    team: string;
    channelName: string;
  }) => void;
};

function initialShareMode(channel?: SharedChannel): ShareMode {
  if (channel && isValidMatrixRoomAddress(channel.matrixRoomAlias)) {
    return 'map';
  }
  return 'create';
}

export default function ShareChannelModal({
  variant,
  connections,
  channelOptions,
  defaultConnectionId,
  defaultChannelId,
  existingSharedChannels = [],
  editingChannel,
  onClose,
  onShare,
}: ShareChannelModalProps) {
  const isEditing = editingChannel != null;
  const radioNs = useId().replace(/\W/g, '');
  const [channelId, setChannelId] = useState(
    defaultChannelId ?? channelOptions[0]?.id ?? '',
  );
  const [connectionId, setConnectionId] = useState(
    editingChannel?.connectionId ??
      defaultConnectionId ??
      connections[0]?.id ??
      '',
  );
  const [shareMode, setShareMode] = useState<ShareMode>(() =>
    initialShareMode(editingChannel),
  );
  const [roomValue, setRoomValue] = useState(
    editingChannel?.matrixRoomAlias ?? '',
  );
  const [error, setError] = useState<string | null>(null);

  const selectedChannel = useMemo(() => {
    if (isEditing && editingChannel) {
      return {
        id: editingChannel.id,
        name: editingChannel.name,
        team: editingChannel.team,
        visibility: editingChannel.visibility,
      } satisfies MattermostChannelOption;
    }
    return channelOptions.find((c) => c.id === channelId);
  }, [channelId, channelOptions, editingChannel, isEditing]);

  const alreadyBridged = useMemo(() => {
    if (!selectedChannel || isEditing) return false;
    return existingSharedChannels.some(
      (c) =>
        c.connectionId === connectionId &&
        c.name.toLowerCase() === selectedChannel.name.toLowerCase(),
    );
  }, [connectionId, existingSharedChannels, isEditing, selectedChannel]);

  if (connections.length === 0) {
    return (
      <div className={modalStyles['matrix-interop-modals']}>
        <div
          className={modalStyles['matrix-interop-modals__backdrop']}
          aria-hidden
          onClick={onClose}
        />
        <div className={modalStyles['matrix-interop-modals__dialog']}>
          <Modal
            title="Share channels with Matrix"
            size="Small"
            onClose={onClose}
            footer={
              <div className={modalStyles['matrix-interop-modals__footer-actions']}>
                <Button emphasis="Tertiary" onClick={onClose}>
                  Close
                </Button>
              </div>
            }
          >
            <SectionNotice
              type="Warning"
              title="No Matrix connection configured"
              description="A system admin must configure a Matrix connection in the System Console before channels can be shared."
            />
          </Modal>
        </div>
      </div>
    );
  }

  const handleShare = () => {
    if (!selectedChannel) {
      setError('Select a Mattermost channel.');
      return;
    }

    if (alreadyBridged) {
      setError('This channel is already shared to the selected connection.');
      return;
    }

    if (shareMode === 'map' && !isValidMatrixRoomAddress(roomValue)) {
      setError(
        'Enter a valid Matrix room address (e.g. #room:matrix.example.com).',
      );
      return;
    }

    const alias = deriveMatrixRoomAlias(
      shareMode,
      roomValue,
      selectedChannel.name,
    );

    onShare({
      channelId: isEditing ? editingChannel!.id : channelId,
      connectionId,
      shareMode,
      matrixRoomAlias: alias,
      visibility: selectedChannel.visibility,
      team: selectedChannel.team,
      channelName: selectedChannel.name,
    });
  };

  const footer = (
    <div className={modalStyles['matrix-interop-modals__footer-actions']}>
      <Button emphasis="Tertiary" onClick={onClose}>
        Cancel
      </Button>
      <Button emphasis="Primary" onClick={handleShare}>
        {isEditing ? 'Save' : 'Share'}
      </Button>
    </div>
  );

  return (
    <div className={modalStyles['matrix-interop-modals']}>
      <div
        className={modalStyles['matrix-interop-modals__backdrop']}
        aria-hidden
        onClick={onClose}
      />
      <div className={modalStyles['matrix-interop-modals__dialog']}>
        <Modal
          title={isEditing ? 'Edit shared channel' : 'Share channels with Matrix'}
          size="Small"
          onClose={onClose}
          footer={footer}
        >
          <div className={modalStyles['matrix-interop-modals__body-stack']}>
            {variant === 'admin' && !isEditing && (
              <div className={modalStyles['matrix-interop-modals__field-group']}>
                <p className={modalStyles['matrix-interop-modals__field-label']}>
                  Mattermost channel
                </p>
                <ChannelAutocompleteField
                  channels={channelOptions}
                  value={channelId}
                  onChange={(id) => {
                    setChannelId(id);
                    setError(null);
                  }}
                  onInputChange={() => setError(null)}
                  invalid={Boolean(error && !selectedChannel)}
                  aria-label="Mattermost channel"
                />
              </div>
            )}

            {variant === 'admin' && isEditing && selectedChannel && (
              <div className={modalStyles['matrix-interop-modals__field-group']}>
                <p className={modalStyles['matrix-interop-modals__field-label']}>
                  Mattermost channel
                </p>
                <TextInput
                  size="Medium"
                  value={selectedChannel.name}
                  readOnly
                  aria-label="Mattermost channel"
                />
              </div>
            )}

            <div className={modalStyles['matrix-interop-modals__field-group']}>
              <p className={modalStyles['matrix-interop-modals__field-label']}>
                Matrix connection
              </p>
              <Select
                size="Medium"
                value={connectionId}
                onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                  setConnectionId(e.target.value)
                }
                aria-label="Matrix connection"
              >
                {connections.map((connection) => (
                  <option key={connection.id} value={connection.id}>
                    {connection.name} ({connection.domain})
                  </option>
                ))}
              </Select>
            </div>

            <div className={modalStyles['matrix-interop-modals__field-group']}>
              <p className={modalStyles['matrix-interop-modals__field-label']}>
                Matrix room
              </p>
              <div className={modalStyles['matrix-interop-modals__radio-row']}>
                <Radio
                  name={`${radioNs}-share-mode`}
                  value="create"
                  checked={shareMode === 'create'}
                  onChange={() => {
                    setShareMode('create');
                    setError(null);
                  }}
                  size="Medium"
                >
                  Create new Matrix room
                </Radio>
                <Radio
                  name={`${radioNs}-share-mode`}
                  value="map"
                  checked={shareMode === 'map'}
                  onChange={() => {
                    setShareMode('map');
                    setError(null);
                  }}
                  size="Medium"
                >
                  Map to existing Matrix room
                </Radio>
              </div>
              <TextInput
                size="Medium"
                value={roomValue}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  setRoomValue(e.target.value);
                  setError(null);
                }}
                placeholder={
                  shareMode === 'create'
                    ? 'Matrix room name'
                    : '#room:matrix.example.com'
                }
                invalid={Boolean(error)}
                aria-label={
                  shareMode === 'create'
                    ? 'Matrix room name'
                    : 'Matrix room address'
                }
              />
              {shareMode === 'create' ? (
                <p className={modalStyles['matrix-interop-modals__help']}>
                  If left blank, uses the channel name
                </p>
              ) : (
                <p className={modalStyles['matrix-interop-modals__help']}>
                  Paste an existing Matrix room address or room ID
                </p>
              )}
              {error && (
                <p className={modalStyles['matrix-interop-modals__error']}>
                  {error}
                </p>
              )}
              {alreadyBridged && (
                <SectionNotice
                  type="Warning"
                  title="Channel already shared"
                  description="This channel is already bridged to the selected Matrix connection."
                />
              )}
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}
