import { Button, SectionNotice } from '@mattermost/compass-ui';
import styles from './CreateAutomationShortcut.module.scss';

export interface CreateAutomationShortcutProps {
  agentDisplayName: string;
  onCreate: () => void;
}

/** Option 4 — Rovo-style convenience entry from an agent view (not a second management surface). */
export default function CreateAutomationShortcut({
  agentDisplayName,
  onCreate,
}: CreateAutomationShortcutProps) {
  return (
    <div className={styles['shortcut']}>
      <SectionNotice
        type="Info"
        title={`Create an automation that runs as ${agentDisplayName}. You don’t need edit access to reuse this agent — only to change its shared settings.`}
      />
      <Button emphasis="Secondary" onClick={onCreate}>
        Create automation with this agent
      </Button>
    </div>
  );
}
