import {
  ChannelHeader,
  ChannelShell,
  ChannelsSidebar,
  Message,
  MessageInput,
  MessageSeparator,
  layoutStyles,
} from '@mattermost/compass-ui';
import avatarLeonard from '@/assets/avatars/Leonard Riley.png';
import avatarSofia from '@/assets/avatars/Sofia Bauer.png';
import type { ChannelWorkspace } from '../matrixInteropTypes';
import ChannelSettingsModal from '../components/ChannelSettingsModal';
import modalStyles from '../components/MatrixInteropModals.module.scss';
import styles from '../MatrixInterop.module.scss';

type ChannelSettingsSceneProps = {
  channelLabel: string;
  sharingEnabled: boolean;
  onSharingEnabledChange: (enabled: boolean) => void;
  workspaces: ChannelWorkspace[];
  onAddWorkspace: () => void;
  onRemoveWorkspace: (workspaceId: string) => void;
  onCloseSettings: () => void;
};

export default function ChannelSettingsScene({
  channelLabel,
  sharingEnabled,
  onSharingEnabledChange,
  workspaces,
  onAddWorkspace,
  onRemoveWorkspace,
  onCloseSettings,
}: ChannelSettingsSceneProps) {
  return (
    <div className={styles['matrix-interop__channel-frame']}>
      <ChannelShell
        className={styles['matrix-interop__channel-shell']}
        teamName="Product"
        channelsSidebar={
          <ChannelsSidebar
            teamName="Product"
            activeChannelName="Release Planning"
            channelNameOverrides={{
              'UX Design': 'Release Planning',
            }}
          />
        }
        channelHeader={
          <ChannelHeader
            type="Channel"
            name="release-planning"
            description="Release planning and coordination."
            memberCount={12}
            pinnedCount={2}
          />
        }
        overlay={
          <div className={modalStyles['matrix-interop-modals']}>
            <div
              className={modalStyles['matrix-interop-modals__backdrop']}
              aria-hidden
            />
            <div
              className={`${modalStyles['matrix-interop-modals__dialog']} ${modalStyles['matrix-interop-modals__dialog--wide']}`}
            >
              <ChannelSettingsModal
                channelLabel={channelLabel}
                sharingEnabled={sharingEnabled}
                onSharingEnabledChange={onSharingEnabledChange}
                workspaces={workspaces}
                onAddWorkspace={onAddWorkspace}
                onRemoveWorkspace={onRemoveWorkspace}
                onClose={onCloseSettings}
              />
            </div>
          </div>
        }
      >
        <div className={layoutStyles['channel-shell__messages']}>
          <MessageSeparator type="Date" label="Today" />
          <Message
            avatarSrc={avatarSofia}
            avatarAlt="Sofia Bauer"
            username="Sofia Bauer"
            timestamp="9:14 AM"
          >
            <p className={layoutStyles['channel-shell__post-text']}>
              Draft release notes are ready for review.
            </p>
          </Message>
          <Message
            avatarSrc={avatarLeonard}
            avatarAlt="Leonard Riley"
            username="Leonard Riley"
            timestamp="9:22 AM"
          >
            <p className={layoutStyles['channel-shell__post-text']}>
              Matrix bridge status looks healthy on the staging connection.
            </p>
          </Message>
        </div>
        <MessageInput placeholder="Write to Release Planning" />
      </ChannelShell>
    </div>
  );
}
