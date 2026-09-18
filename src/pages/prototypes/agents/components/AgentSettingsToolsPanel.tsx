import PlusIcon from '@mattermost/compass-icons/components/plus';
import TrashCanOutlineIcon from '@mattermost/compass-icons/components/trash-can-outline';
import { Button } from '@mattermost/compass-ui/components/button';
import { Checkbox } from '@mattermost/compass-ui/components/checkbox';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { IconButton } from '@mattermost/compass-ui/components/icon-button';
import { Tag } from '@mattermost/compass-ui/components/tag';
import {
  MCP_CATALOG,
  allToolIdsForServer,
  getMcpServer,
  type ConnectedMcp,
} from '../agentsData';
import styles from './AgentSettingsModal.module.scss';

type AgentSettingsToolsPanelProps = {
  connectedMcps: ConnectedMcp[];
  onChange: (mcps: ConnectedMcp[]) => void;
};

export default function AgentSettingsToolsPanel({
  connectedMcps,
  onChange,
}: AgentSettingsToolsPanelProps) {
  const connectedIds = new Set(connectedMcps.map((mcp) => mcp.serverId));
  const available = MCP_CATALOG.filter((server) => !connectedIds.has(server.id));

  const addServer = (serverId: string) => {
    onChange([
      ...connectedMcps,
      { serverId, enabledToolIds: allToolIdsForServer(serverId) },
    ]);
  };

  const removeServer = (serverId: string) => {
    onChange(connectedMcps.filter((mcp) => mcp.serverId !== serverId));
  };

  const toggleTool = (serverId: string, toolId: string, enabled: boolean) => {
    onChange(
      connectedMcps.map((mcp) => {
        if (mcp.serverId !== serverId) return mcp;
        const nextIds = enabled
          ? [...mcp.enabledToolIds, toolId]
          : mcp.enabledToolIds.filter((id) => id !== toolId);
        return { ...mcp, enabledToolIds: nextIds };
      }),
    );
  };

  return (
    <div className={styles['agent-settings-modal__access']}>
      <div className={styles['agent-settings-modal__access-block']}>
        <div className={styles['agent-settings-modal__section-header']}>
          <h3 className={styles['agent-settings-modal__section-title']}>
            Tools
          </h3>
          <p className={styles['agent-settings-modal__help']}>
            MCP servers this agent can call. Toggle the tools you want it to
            use, or connect another server.
          </p>
        </div>

        {connectedMcps.length === 0 ? (
          <p className={styles['agent-settings-modal__help']}>
            No MCP servers connected yet.
          </p>
        ) : (
          <div className={styles['agent-settings-modal__mcps']} role="list">
            {connectedMcps.map((mcp) => {
              const server = getMcpServer(mcp.serverId);
              if (!server) return null;
              return (
                <div
                  key={mcp.serverId}
                  className={styles['agent-settings-modal__mcp']}
                  role="listitem"
                >
                  <div className={styles['agent-settings-modal__mcp-header']}>
                    <div className={styles['agent-settings-modal__mcp-title']}>
                      <span>{server.name}</span>
                      <Tag label="Connected" type="success" size="x-small" />
                    </div>
                    <IconButton
                      size="small"
                      padding="compact"
                      destructive
                      icon={
                        <Icon glyph={<TrashCanOutlineIcon />} size="16" />
                      }
                      aria-label={`Disconnect ${server.name}`}
                      onClick={() => removeServer(mcp.serverId)}
                    />
                  </div>
                  <p className={styles['agent-settings-modal__help']}>
                    {server.description}
                  </p>
                  <div className={styles['agent-settings-modal__mcp-tools']}>
                    {server.tools.map((tool) => (
                      <Checkbox
                        key={tool.id}
                        checked={mcp.enabledToolIds.includes(tool.id)}
                        onChange={(e) =>
                          toggleTool(mcp.serverId, tool.id, e.target.checked)
                        }
                      >
                        <span
                          className={
                            styles['agent-settings-modal__mcp-tool']
                          }
                        >
                          <span>{tool.name}</span>
                          <span
                            className={styles['agent-settings-modal__help']}
                          >
                            {tool.description}
                          </span>
                        </span>
                      </Checkbox>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {available.length > 0 ? (
          <div className={styles['agent-settings-modal__mcp-add']}>
            <p className={styles['agent-settings-modal__mcp-add-label']}>
              Add MCP
            </p>
            <div className={styles['agent-settings-modal__mcp-add-list']}>
              {available.map((server) => (
                <Button
                  key={server.id}
                  emphasis="tertiary"
                  size="small"
                  leadingIcon={<Icon glyph={<PlusIcon />} size="16" />}
                  onClick={() => addServer(server.id)}
                >
                  {server.name}
                </Button>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
