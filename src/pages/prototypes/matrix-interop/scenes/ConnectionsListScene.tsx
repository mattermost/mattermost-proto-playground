import { useId } from 'react';
import { Radio } from '@mattermost/compass-ui';
import type { MatrixConnection } from '../matrixInteropTypes';
import ConnectionsTable from '../components/ConnectionsTable';
import MatrixAdminShell from '../components/MatrixAdminShell';
import { matrixAdminShellStyles } from '../components/matrixAdminShellStyles';

type ConnectionsListSceneProps = {
  connections: MatrixConnection[];
  pluginEnabled: boolean;
  onPluginEnabledChange: (enabled: boolean) => void;
  sharedChannelCounts: Record<string, number>;
  onViewConnection: (connectionId: string) => void;
  onEditConnection: (connectionId: string) => void;
  onPauseConnection: (connectionId: string) => void;
  onDeleteConnection: (connectionId: string) => void;
  onAddConnection: () => void;
  showEmptyDemo?: boolean;
};

export default function ConnectionsListScene({
  connections,
  pluginEnabled,
  onPluginEnabledChange,
  sharedChannelCounts,
  onViewConnection,
  onEditConnection,
  onPauseConnection,
  onDeleteConnection,
  onAddConnection,
  showEmptyDemo,
}: ConnectionsListSceneProps) {
  const radioNs = useId().replace(/\W/g, '');
  const displayConnections = showEmptyDemo ? [] : connections;

  return (
    <MatrixAdminShell title="Matrix Bridge">
      <section className={matrixAdminShellStyles['matrix-admin-shell__settings-panel']}>
        <div className={matrixAdminShellStyles['matrix-admin-shell__settings']}>
          <div className={matrixAdminShellStyles['matrix-admin-shell__setting']}>
            <div
              className={matrixAdminShellStyles['matrix-admin-shell__setting-label']}
            >
              Enable plugin
            </div>
            <div
              className={
                matrixAdminShellStyles['matrix-admin-shell__setting-fields']
              }
            >
              <div className={matrixAdminShellStyles['matrix-admin-shell__radio-row']}>
                <Radio
                  name={`${radioNs}-plugin-enabled`}
                  value="true"
                  checked={pluginEnabled}
                  onChange={() => onPluginEnabledChange(true)}
                  size="Medium"
                >
                  True
                </Radio>
                <Radio
                  name={`${radioNs}-plugin-enabled`}
                  value="false"
                  checked={!pluginEnabled}
                  onChange={() => onPluginEnabledChange(false)}
                  size="Medium"
                >
                  False
                </Radio>
              </div>
              <p className={matrixAdminShellStyles['matrix-admin-shell__help']}>
                When true, the plugin is enabled.
              </p>
            </div>
          </div>
        </div>
      </section>

      <ConnectionsTable
        connections={displayConnections}
        sharedChannelCounts={sharedChannelCounts}
        onViewConnection={onViewConnection}
        onEditConnection={onEditConnection}
        onPauseConnection={onPauseConnection}
        onDeleteConnection={onDeleteConnection}
        onAddConnection={onAddConnection}
      />
    </MatrixAdminShell>
  );
}
