import {
  Checkbox,
  SectionNotice,
  TextInput,
} from '@mattermost/compass-ui';
import { useState, type ChangeEvent } from 'react';
import McpServersToolsList from './McpServersToolsList';
import styles from './McpsTab.module.scss';

export interface McpsTabProps {
  activeMcps?: number;
  toolCount?: number;
}

export default function McpsTab(_props: McpsTabProps = {}) {
  const [autoEnableAllTools, setAutoEnableAllTools] = useState(true);
  const [query, setQuery] = useState('');

  return (
    <div className={styles['tools-tab']}>
      <div className={styles['tools-tab__checkboxes']}>
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

      {autoEnableAllTools ? null : (
        <TextInput
          size="Medium"
          placeholder="Search servers and tools..."
          value={query}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
          onClear={() => setQuery('')}
          aria-label="Search servers and tools"
        />
      )}

      {autoEnableAllTools ? (
        <SectionNotice
          type="Info"
          title="Every MCP tool is enabled for this agent."
          description="Disable 'Automatically enable all MCP tools' above to pick specific tools."
        />
      ) : null}

      <McpServersToolsList
        query={autoEnableAllTools ? '' : query}
        lockAllEnabled={autoEnableAllTools}
        idPrefix="agent-tools"
      />
    </div>
  );
}
