import { Button, Icon, Switch } from '@mattermost/compass-ui';
import { useId, useState, type ChangeEvent } from 'react';
import ChevronRightIcon from '@mattermost/compass-icons/components/chevron-right';
import styles from './McpServersToolsList.module.scss';

export interface McpTool {
  id: string;
  name: string;
  description: string;
}

export interface McpToolServer {
  id: string;
  name: string;
  connected: boolean;
  showConnect?: boolean;
  tools: McpTool[];
}

export const MCP_TOOL_SERVERS: McpToolServer[] = [
  {
    id: 'atlassian',
    name: 'Atlassian',
    connected: true,
    tools: [
      {
        id: 'jira-create-issue',
        name: 'Create Jira issue',
        description:
          'Create a new issue in a Jira project with summary and description.',
      },
      {
        id: 'jira-search',
        name: 'Search Jira',
        description:
          'Find issues using JQL or natural-language search across projects.',
      },
      {
        id: 'jira-transition',
        name: 'Transition issue',
        description:
          'Move an issue to a new status following the project workflow.',
      },
      {
        id: 'confluence-page',
        name: 'Create Confluence page',
        description:
          'Publish a new page in a Confluence space from provided content.',
      },
      {
        id: 'confluence-search',
        name: 'Search Confluence',
        description: 'Search pages and spaces for matching documentation.',
      },
      {
        id: 'jira-comment',
        name: 'Add Jira comment',
        description: 'Post a comment on an existing Jira issue.',
      },
    ],
  },
  {
    id: 'github',
    name: 'GitHub',
    connected: true,
    tools: [
      {
        id: 'gh-create-pr',
        name: 'Create pull request',
        description: 'Open a pull request from a branch with title and body.',
      },
      {
        id: 'gh-list-issues',
        name: 'List issues',
        description:
          'List open issues in a repository filtered by labels or assignee.',
      },
      {
        id: 'gh-review-pr',
        name: 'Review pull request',
        description: 'Summarize changes and leave review comments on a PR.',
      },
      {
        id: 'gh-search-code',
        name: 'Search code',
        description: 'Search repository code for symbols, strings, or patterns.',
      },
      {
        id: 'gh-create-issue',
        name: 'Create issue',
        description:
          'File a new GitHub issue with title, body, and optional labels.',
      },
    ],
  },
  {
    id: 'rocketlane',
    name: 'Rocketlane MCP',
    connected: false,
    showConnect: true,
    tools: [],
  },
  {
    id: 'mattermost',
    name: 'Mattermost',
    connected: true,
    tools: [
      {
        id: 'mm-read-channel',
        name: 'Read channel history',
        description: 'Fetch recent messages from a channel the agent can access.',
      },
      {
        id: 'mm-post-message',
        name: 'Post message',
        description:
          'Send a message to a channel or thread on behalf of the agent.',
      },
      {
        id: 'mm-search-posts',
        name: 'Search posts',
        description: 'Search messages across channels within the agent’s access.',
      },
      {
        id: 'mm-get-user',
        name: 'Look up user',
        description: 'Resolve a username or ID to profile details.',
      },
    ],
  },
  {
    id: 'mattermost-private',
    name: 'Mattermost Private Cloud MCP',
    connected: true,
    tools: [
      {
        id: 'mm-pc-deploy',
        name: 'Check deployment status',
        description: 'Report health and version for a private cloud deployment.',
      },
      {
        id: 'mm-pc-logs',
        name: 'Fetch recent logs',
        description: 'Retrieve recent application or infrastructure log snippets.',
      },
      {
        id: 'mm-pc-scale',
        name: 'Scale workspace',
        description: 'Adjust capacity for a private cloud workspace within limits.',
      },
    ],
  },
  {
    id: 'playbooks',
    name: 'Playbooks MCP',
    connected: true,
    tools: [
      {
        id: 'pb-start-run',
        name: 'Start playbook run',
        description: 'Begin a new run from a playbook template.',
      },
      {
        id: 'pb-update-status',
        name: 'Update run status',
        description: 'Post a status update to an active playbook run.',
      },
      {
        id: 'pb-complete-checklist',
        name: 'Complete checklist item',
        description: 'Mark a checklist item done in the current run.',
      },
      {
        id: 'pb-list-runs',
        name: 'List active runs',
        description: 'List playbook runs that are currently in progress.',
      },
    ],
  },
];

function toolKey(serverId: string, toolId: string) {
  return `${serverId}:${toolId}`;
}

export interface McpServersToolsListProps {
  /** Filter servers and tools by name/description. */
  query?: string;
  /** When true, all tools appear enabled and switches are locked. */
  lockAllEnabled?: boolean;
  className?: string;
  /** Prefix for expand panel ids when multiple lists are on screen. */
  idPrefix?: string;
}

export default function McpServersToolsList({
  query = '',
  lockAllEnabled = false,
  className = '',
  idPrefix,
}: McpServersToolsListProps) {
  const reactId = useId().replace(/\W/g, '');
  const prefix = idPrefix ?? reactId;
  const [expandedServers, setExpandedServers] = useState<Record<string, boolean>>(
    {},
  );
  const [serverEnabled, setServerEnabled] = useState<Record<string, boolean>>(
    () =>
      Object.fromEntries(
        MCP_TOOL_SERVERS.map((server) => [server.id, server.connected]),
      ),
  );
  const [toolEnabled, setToolEnabled] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(
      MCP_TOOL_SERVERS.flatMap((server) =>
        server.tools.map((tool) => [toolKey(server.id, tool.id), true]),
      ),
    ),
  );

  const normalizedQuery = query.trim().toLowerCase();
  const visibleServers = MCP_TOOL_SERVERS.filter((server) => {
    if (!normalizedQuery) return true;
    if (server.name.toLowerCase().includes(normalizedQuery)) return true;
    return server.tools.some(
      (tool) =>
        tool.name.toLowerCase().includes(normalizedQuery) ||
        tool.description.toLowerCase().includes(normalizedQuery),
    );
  });

  function toggleExpanded(serverId: string) {
    setExpandedServers((current) => ({
      ...current,
      [serverId]: !current[serverId],
    }));
  }

  function setServerToolsEnabled(serverId: string, enabled: boolean) {
    const server = MCP_TOOL_SERVERS.find((entry) => entry.id === serverId);
    if (!server) return;

    setServerEnabled((current) => ({ ...current, [serverId]: enabled }));
    setToolEnabled((current) => {
      const next = { ...current };
      for (const tool of server.tools) {
        next[toolKey(serverId, tool.id)] = enabled;
      }
      return next;
    });
  }

  return (
    <div
      className={[styles['mcp-servers'], className].filter(Boolean).join(' ')}
    >
      {visibleServers.map((server) => {
        const expanded = Boolean(expandedServers[server.id]);
        const toolsPanelId = `${prefix}-${server.id}-tools`;
        const enabledCount = server.tools.filter(
          (tool) => toolEnabled[toolKey(server.id, tool.id)],
        ).length;
        const totalCount = server.tools.length;
        const canExpand = totalCount > 0;

        return (
          <article key={server.id} className={styles['mcp-servers__server']}>
            <div className={styles['mcp-servers__server-header']}>
              <button
                type="button"
                className={[
                  styles['mcp-servers__server-toggle'],
                  expanded ? styles['mcp-servers__server-toggle--expanded'] : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                aria-expanded={expanded}
                aria-controls={toolsPanelId}
                aria-label={`${expanded ? 'Collapse' : 'Expand'} ${server.name}`}
                disabled={!canExpand}
                onClick={() => toggleExpanded(server.id)}
              >
                <Icon size="16" glyph={<ChevronRightIcon />} />
              </button>

              <button
                type="button"
                className={styles['mcp-servers__server-body']}
                disabled={!canExpand}
                aria-expanded={expanded}
                aria-controls={toolsPanelId}
                onClick={() => {
                  if (canExpand) toggleExpanded(server.id);
                }}
              >
                <h3 className={styles['mcp-servers__server-name']}>
                  {server.name}
                </h3>
                <div className={styles['mcp-servers__server-meta']}>
                  <p className={styles['mcp-servers__server-count']}>
                    {totalCount > 0
                      ? `${enabledCount} of ${totalCount} tools enabled`
                      : '0 tools available'}
                  </p>
                  {server.connected ? (
                    <span className={styles['mcp-servers__connected']}>
                      Connected
                    </span>
                  ) : null}
                </div>
              </button>

              <div className={styles['mcp-servers__server-actions']}>
                {server.showConnect ? (
                  <Button size="Small" emphasis="Primary">
                    Connect
                  </Button>
                ) : null}
                <Switch
                  className={styles['mcp-servers__server-switch']}
                  size="Small"
                  checked={serverEnabled[server.id] ?? false}
                  disabled={lockAllEnabled || !server.connected}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setServerToolsEnabled(server.id, e.target.checked)
                  }
                  aria-label={`${serverEnabled[server.id] ? 'Disable' : 'Enable'} ${server.name}`}
                />
              </div>
            </div>

            {canExpand ? (
              <div
                id={toolsPanelId}
                className={[
                  styles['mcp-servers__tools-collapse'],
                  expanded
                    ? styles['mcp-servers__tools-collapse--expanded']
                    : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                aria-hidden={!expanded}
              >
                <div className={styles['mcp-servers__tools-collapse-inner']}>
                  <ul className={styles['mcp-servers__tools']}>
                    {server.tools.map((tool) => {
                      const key = toolKey(server.id, tool.id);
                      const enabled = Boolean(toolEnabled[key]);

                      return (
                        <li
                          key={tool.id}
                          className={styles['mcp-servers__tool']}
                        >
                          <div className={styles['mcp-servers__tool-copy']}>
                            <p className={styles['mcp-servers__tool-name']}>
                              {tool.name}
                            </p>
                            <p
                              className={styles['mcp-servers__tool-description']}
                            >
                              {tool.description}
                            </p>
                          </div>
                          <Switch
                            className={styles['mcp-servers__tool-switch']}
                            size="Small"
                            checked={lockAllEnabled || enabled}
                            disabled={
                              lockAllEnabled ||
                              !(serverEnabled[server.id] ?? false)
                            }
                            onChange={(e: ChangeEvent<HTMLInputElement>) => {
                              const nextEnabled = e.target.checked;
                              setToolEnabled((current) => ({
                                ...current,
                                [key]: nextEnabled,
                              }));
                              if (nextEnabled) {
                                setServerEnabled((current) => ({
                                  ...current,
                                  [server.id]: true,
                                }));
                              }
                            }}
                            aria-label={`${enabled ? 'Disable' : 'Enable'} ${tool.name}`}
                          />
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}
