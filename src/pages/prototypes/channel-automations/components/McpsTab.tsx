import {
  Button,
  Checkbox,
  Icon,
  SectionNotice,
  Switch,
  Tag,
  TextInput,
} from '@mattermost/compass-ui';
import { useState, type ChangeEvent } from 'react';
import ChevronRightIcon from '@mattermost/compass-icons/components/chevron-right';
import styles from './McpsTab.module.scss';

interface ToolServer {
  id: string;
  name: string;
  enabledTools: number;
  totalTools: number;
  connected: boolean;
  showConnect?: boolean;
}

const TOOL_SERVERS: ToolServer[] = [
  { id: 'atlassian', name: 'Atlassian', enabledTools: 31, totalTools: 31, connected: true },
  { id: 'github', name: 'GitHub', enabledTools: 40, totalTools: 40, connected: true },
  {
    id: 'rocketlane',
    name: 'Rocketlane MCP',
    enabledTools: 0,
    totalTools: 0,
    connected: false,
    showConnect: true,
  },
  { id: 'mattermost', name: 'Mattermost', enabledTools: 21, totalTools: 21, connected: true },
  {
    id: 'mattermost-private',
    name: 'Mattermost Private Cloud MCP',
    enabledTools: 11,
    totalTools: 11,
    connected: true,
  },
  { id: 'playbooks', name: 'Playbooks MCP', enabledTools: 14, totalTools: 14, connected: true },
];

export interface McpsTabProps {
  activeMcps?: number;
  toolCount?: number;
}

export default function McpsTab(_props: McpsTabProps = {}) {
  const [dynamicToolLoading, setDynamicToolLoading] = useState(true);
  const [autoEnableAllTools, setAutoEnableAllTools] = useState(true);
  const [query, setQuery] = useState('');
  const [serverEnabled, setServerEnabled] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(
      TOOL_SERVERS.map((server) => [server.id, server.connected]),
    ),
  );

  const visibleServers = TOOL_SERVERS.filter((server) => {
    const haystack = server.name.toLowerCase();
    return haystack.includes(query.trim().toLowerCase());
  });

  return (
    <div className={styles['tools-tab']}>
      <div className={styles['tools-tab__checkboxes']}>
        <div className={styles['tools-tab__checkbox']}>
          <Checkbox
            size="Medium"
            checked={dynamicToolLoading}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setDynamicToolLoading(e.target.checked)
            }
          >
            Dynamic tool loading
          </Checkbox>
          <p className={styles['tools-tab__checkbox-help']}>
            Expose search and load helper tools first, then load MCP tool schemas
            only when the agent needs them. Disable this to use the full MCP tool
            list for this agent.
          </p>
        </div>

        <div className={styles['tools-tab__checkbox']}>
          <Checkbox
            size="Medium"
            checked={autoEnableAllTools}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setAutoEnableAllTools(e.target.checked)
            }
          >
            Automatically enable all MCP tools
          </Checkbox>
          <p className={styles['tools-tab__checkbox-help']}>
            Give this agent access to every currently available MCP tool and any
            added in the future.
          </p>
        </div>
      </div>

      <TextInput
        size="Medium"
        placeholder="Search servers and tools..."
        value={query}
        onChange={(e: ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
        onClear={() => setQuery('')}
        aria-label="Search servers and tools"
      />

      {autoEnableAllTools ? (
        <SectionNotice
          type="Info"
          title="Every MCP tool is enabled for this agent. Disable 'Automatically enable all MCP tools' above to pick specific tools."
        />
      ) : null}

      <div className={styles['tools-tab__servers']}>
        {visibleServers.map((server) => (
          <article key={server.id} className={styles['tools-tab__server']}>
            <button
              type="button"
              className={styles['tools-tab__server-toggle']}
              aria-label={`Expand ${server.name}`}
            >
              <Icon size="16" glyph={<ChevronRightIcon />} />
            </button>

            <div className={styles['tools-tab__server-body']}>
              <h3 className={styles['tools-tab__server-name']}>{server.name}</h3>
              <p className={styles['tools-tab__server-meta']}>
                {server.totalTools > 0
                  ? `${server.enabledTools} of ${server.totalTools} tools enabled`
                  : '0 tools available'}
              </p>
            </div>

            <div className={styles['tools-tab__server-actions']}>
              {server.connected ? (
                <Tag label="Connected" type="Success" size="Small" />
              ) : null}
              {server.showConnect ? (
                <Button size="Small" emphasis="Primary">
                  Connect
                </Button>
              ) : null}
              <Switch
                size="Small"
                checked={serverEnabled[server.id] ?? false}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setServerEnabled((current) => ({
                    ...current,
                    [server.id]: e.target.checked,
                  }))
                }
                aria-label={`${serverEnabled[server.id] ? 'Disable' : 'Enable'} ${server.name}`}
              />
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
