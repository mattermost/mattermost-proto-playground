import { useId, type ChangeEvent } from 'react';
import {
  AdminPanel,
  Button,
  Icon,
  Radio,
  Tag,
  TextInput,
} from '@mattermost/compass-ui';
import PauseIcon from '@mattermost/compass-icons/components/pause';
import type { MatrixConnection } from '../matrixInteropTypes';
import { domainFromHomeserverUrl } from '../matrixInteropTypes';
import { matrixAdminShellStyles } from './matrixAdminShellStyles';
import styles from './MatrixInteropTables.module.scss';

type ConnectionConfigPanelProps = {
  connection: MatrixConnection;
  onChange: (patch: Partial<MatrixConnection>) => void;
  isNew?: boolean;
};

function healthTagType(health: MatrixConnection['health']) {
  if (health === 'active') return 'Success' as const;
  if (health === 'degraded') return 'Warning' as const;
  return 'Default' as const;
}

function healthLabel(health: MatrixConnection['health']) {
  if (health === 'active') return 'Active';
  if (health === 'degraded') return 'Sync disabled';
  return 'Unknown';
}

function generateToken(prefix: string): string {
  const suffix = Math.random().toString(36).slice(2, 10);
  return `${prefix}-${suffix}........`;
}

export default function ConnectionConfigPanel({
  connection,
  onChange,
  isNew = false,
}: ConnectionConfigPanelProps) {
  const radioNs = useId().replace(/\W/g, '');
  const settingsSubtitle =
    'Matrix homeserver configuration for this connection.';

  return (
    <AdminPanel
      title={
        isNew ? (
          'Connection settings'
        ) : (
          <span className={styles['matrix-interop-tables__connection-settings-title']}>
            {connection.name}
            <span className={styles['matrix-interop-tables__header-chips']}>
              <Tag
                type={healthTagType(connection.health)}
                label={healthLabel(connection.health)}
              />
              {connection.domain ? (
                <Tag type="Default" label={connection.domain} />
              ) : null}
            </span>
          </span>
        )
      }
      subtitle={settingsSubtitle}
      expandable={!isNew}
      defaultExpandedState={isNew ? 'Expanded' : 'Collapsed'}
      headerActions={
        isNew ? undefined : (
          <Button
            emphasis="Tertiary"
            size="Small"
            leadingIcon={<Icon glyph={<PauseIcon />} size="16" />}
          >
            Pause connection
          </Button>
        )
      }
    >
      <div className={matrixAdminShellStyles['matrix-admin-shell__settings']}>
        <div className={matrixAdminShellStyles['matrix-admin-shell__setting']}>
          <div
            className={matrixAdminShellStyles['matrix-admin-shell__setting-label']}
          >
            Connection name
          </div>
          <div
            className={
              matrixAdminShellStyles['matrix-admin-shell__setting-fields']
            }
          >
            <div className={matrixAdminShellStyles['matrix-admin-shell__input-wrap']}>
              <TextInput
                size="Medium"
                value={connection.name}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  onChange({ name: e.target.value })
                }
                aria-label="Connection name"
              />
            </div>
            <p className={matrixAdminShellStyles['matrix-admin-shell__help']}>
              Display name for this Matrix connection in the admin console and
              connection picker.
            </p>
          </div>
        </div>

        <div className={matrixAdminShellStyles['matrix-admin-shell__setting']}>
          <div
            className={matrixAdminShellStyles['matrix-admin-shell__setting-label']}
          >
            Matrix Server URL
          </div>
          <div
            className={
              matrixAdminShellStyles['matrix-admin-shell__setting-fields']
            }
          >
            <div className={matrixAdminShellStyles['matrix-admin-shell__input-wrap']}>
              <TextInput
                size="Medium"
                value={connection.homeserverUrl}
                readOnly={!isNew}
                placeholder={isNew ? 'https://matrix.example.com' : undefined}
                onChange={
                  isNew
                    ? (e: ChangeEvent<HTMLInputElement>) => {
                        const homeserverUrl = e.target.value;
                        onChange({
                          homeserverUrl,
                          domain: domainFromHomeserverUrl(homeserverUrl),
                        });
                      }
                    : undefined
                }
                aria-label="Matrix Server URL"
              />
            </div>
            <p className={matrixAdminShellStyles['matrix-admin-shell__help']}>
              The base URL of the Matrix homeserver this connection bridges to.
            </p>
          </div>
        </div>

        <div className={matrixAdminShellStyles['matrix-admin-shell__setting']}>
          <div
            className={matrixAdminShellStyles['matrix-admin-shell__setting-label']}
          >
            Application Service Token
          </div>
          <div
            className={
              matrixAdminShellStyles['matrix-admin-shell__setting-fields']
            }
          >
            <div className={matrixAdminShellStyles['matrix-admin-shell__token-row']}>
              <TextInput
                size="Medium"
                value={connection.applicationServiceToken}
                readOnly
                aria-label="Application Service Token"
              />
              <div className={matrixAdminShellStyles['matrix-admin-shell__generate-row']}>
                <Button
                  emphasis="Tertiary"
                  size="Small"
                  onClick={() =>
                    onChange({
                      applicationServiceToken: generateToken('as-token-acme'),
                    })
                  }
                >
                  Generate
                </Button>
                <p className={matrixAdminShellStyles['matrix-admin-shell__help']}>
                  Generate a new secure token (remember to update your Matrix
                  homeserver registration file)
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className={matrixAdminShellStyles['matrix-admin-shell__setting']}>
          <div
            className={matrixAdminShellStyles['matrix-admin-shell__setting-label']}
          >
            Matrix Homeserver Token
          </div>
          <div
            className={
              matrixAdminShellStyles['matrix-admin-shell__setting-fields']
            }
          >
            <div className={matrixAdminShellStyles['matrix-admin-shell__token-row']}>
              <TextInput
                size="Medium"
                value={connection.homeserverToken}
                readOnly
                aria-label="Matrix Homeserver Token"
              />
              <div className={matrixAdminShellStyles['matrix-admin-shell__generate-row']}>
                <Button
                  emphasis="Tertiary"
                  size="Small"
                  onClick={() =>
                    onChange({
                      homeserverToken: generateToken('hs-token-acme'),
                    })
                  }
                >
                  Generate
                </Button>
                <p className={matrixAdminShellStyles['matrix-admin-shell__help']}>
                  Generate a new secure token (remember to update your Matrix
                  homeserver registration file)
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className={matrixAdminShellStyles['matrix-admin-shell__setting']}>
          <div
            className={matrixAdminShellStyles['matrix-admin-shell__setting-label']}
          >
            Enable Message Sync
          </div>
          <div
            className={
              matrixAdminShellStyles['matrix-admin-shell__setting-fields']
            }
          >
            <div className={matrixAdminShellStyles['matrix-admin-shell__radio-row']}>
              <Radio
                name={`${radioNs}-message-sync`}
                value="true"
                checked={connection.messageSyncEnabled}
                onChange={() => onChange({ messageSyncEnabled: true })}
                size="Medium"
              >
                True
              </Radio>
              <Radio
                name={`${radioNs}-message-sync`}
                value="false"
                checked={!connection.messageSyncEnabled}
                onChange={() => onChange({ messageSyncEnabled: false })}
                size="Medium"
              >
                False
              </Radio>
            </div>
            <p className={matrixAdminShellStyles['matrix-admin-shell__help']}>
              When true, messages sync bidirectionally between Mattermost and
              Matrix for shared channels on this connection.
            </p>
          </div>
        </div>

        <div className={matrixAdminShellStyles['matrix-admin-shell__setting']}>
          <div
            className={matrixAdminShellStyles['matrix-admin-shell__setting-label']}
          >
            Matrix Rate Limiting
          </div>
          <div
            className={
              matrixAdminShellStyles['matrix-admin-shell__setting-fields']
            }
          >
            <div className={matrixAdminShellStyles['matrix-admin-shell__radio-row']}>
              <Radio
                name={`${radioNs}-matrix-rate-limiting`}
                value="true"
                checked={connection.matrixRateLimitingEnabled}
                onChange={() => onChange({ matrixRateLimitingEnabled: true })}
                size="Medium"
              >
                True
              </Radio>
              <Radio
                name={`${radioNs}-matrix-rate-limiting`}
                value="false"
                checked={!connection.matrixRateLimitingEnabled}
                onChange={() => onChange({ matrixRateLimitingEnabled: false })}
                size="Medium"
              >
                False
              </Radio>
            </div>
            <p className={matrixAdminShellStyles['matrix-admin-shell__help']}>
              When true, the Matrix homeserver applies rate limits to API
              requests from this connection's application service user.
            </p>
          </div>
        </div>
      </div>
    </AdminPanel>
  );
}
