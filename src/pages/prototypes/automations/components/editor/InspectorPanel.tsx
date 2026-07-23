import CloseIcon from '@mattermost/compass-icons/components/close';
import {
  Button,
  Checkbox,
  Combobox,
  Icon,
  IconButton,
  Scrollbar,
  Select,
  TextInput,
} from '@mattermost/compass-ui';
import { useMemo, type ChangeEvent } from 'react';
import {
  AUTOMATION_BOTS,
  AUTOMATION_FOLDERS,
  DEFAULT_AUTOMATION_BOT_ID,
  DEFAULT_AUTOMATION_FOLDER_ID,
  SYSTEM_TAGS,
} from '../../data/automationsData';
import { helpTextForStep } from '../../data/stepCatalog';
import type { Automation, StepKind, WorkflowNode } from '../../data/types';
import styles from './editor.module.scss';

const KIND_TITLES: Record<StepKind, string> = {
  trigger: 'Trigger',
  action: 'Action',
  flow: 'Flow',
};

type InspectorPanelProps = {
  automation: Automation;
  selectedNode: WorkflowNode | null;
  onCloseNode: () => void;
  onUpdateAutomation: (patch: Partial<Automation>) => void;
  onUpdateNode: (nodeId: string, fields: Record<string, string>, label?: string) => void;
  onDuplicateNode: (nodeId: string) => void;
  onDeleteNode: (nodeId: string) => void;
};

export default function InspectorPanel({
  automation,
  selectedNode,
  onCloseNode,
  onUpdateAutomation,
  onUpdateNode,
  onDuplicateNode,
  onDeleteNode,
}: InspectorPanelProps) {
  const tagOptions = useMemo(() => {
    const tags = new Set<string>(SYSTEM_TAGS);
    automation.tags.forEach((t) => tags.add(t));
    return Array.from(tags)
      .sort((a, b) => a.localeCompare(b))
      .map((tag) => ({ value: tag, label: tag }));
  }, [automation.tags]);

  if (selectedNode) {
    const fields = selectedNode.data.fields ?? {};
    const helpText =
      selectedNode.data.helpText ?? helpTextForStep(selectedNode.data.stepType);
    return (
      <div className={styles.panel}>
        <div className={styles.panel__header}>
          <h2 className={styles.panel__title}>{KIND_TITLES[selectedNode.data.kind]}</h2>
          <IconButton
            aria-label="Close"
            size="Small"
            padding="Compact"
            icon={<Icon size="16" glyph={<CloseIcon />} />}
            onClick={onCloseNode}
          />
        </div>
        <Scrollbar className={styles.panel__body}>
          <div className={styles.panel__stack}>
            <div className={styles['panel__intro']}>
              <h3 className={styles['panel__step-title']}>{selectedNode.data.label}</h3>
              {helpText ? <p className={styles.panel__help}>{helpText}</p> : null}
            </div>
            <TextInput
              label="Label"
              value={selectedNode.data.label}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                onUpdateNode(selectedNode.id, fields, e.target.value)
              }
            />
            {selectedNode.data.stepType === 'condition' ? (
              <>
                <TextInput
                  label="Left value"
                  value={fields.left ?? ''}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    onUpdateNode(selectedNode.id, { ...fields, left: e.target.value })
                  }
                />
                <Select
                  label="Operator"
                  value={fields.operator ?? 'contains'}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                    onUpdateNode(selectedNode.id, {
                      ...fields,
                      operator: e.target.value,
                    })
                  }
                >
                  <option value="contains">contains</option>
                  <option value="equals">equals</option>
                  <option value="contains_any">contains any</option>
                </Select>
                <TextInput
                  label="Right value"
                  value={fields.right ?? ''}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    onUpdateNode(selectedNode.id, { ...fields, right: e.target.value })
                  }
                />
              </>
            ) : (
              <TextInput
                label="Configuration"
                value={fields.message ?? fields.emoji ?? fields.command ?? ''}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  onUpdateNode(selectedNode.id, {
                    ...fields,
                    message: e.target.value,
                  })
                }
              />
            )}
            <div>
              <p className={styles.panel__help}>Variables</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {['{{.Post.message}}', '{{.ChannelID}}', '{{.User.username}}'].map(
                  (v) => (
                    <button
                      key={v}
                      type="button"
                      className={styles.agent__prompt}
                      onClick={() =>
                        onUpdateNode(selectedNode.id, {
                          ...fields,
                          message: `${fields.message ?? ''}${v}`,
                        })
                      }
                    >
                      {v}
                    </button>
                  ),
                )}
              </div>
            </div>
          </div>
        </Scrollbar>
        <div className={styles.panel__footer}>
          <Button
            emphasis="Tertiary"
            size="Small"
            onClick={() => onDuplicateNode(selectedNode.id)}
          >
            Duplicate step
          </Button>
          <Button
            emphasis="Tertiary"
            size="Small"
            destructive
            onClick={() => onDeleteNode(selectedNode.id)}
          >
            Delete step
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.panel}>
      <div className={styles.panel__header}>
        <h2 className={styles.panel__title}>Automation Settings</h2>
      </div>
      <Scrollbar className={styles.panel__body}>
        <div className={styles.panel__stack}>
          <TextInput
            label="Name"
            value={automation.name}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              onUpdateAutomation({ name: e.target.value })
            }
          />
          <Checkbox
            checked={automation.status === 'enabled'}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              onUpdateAutomation({
                status: e.target.checked ? 'enabled' : 'disabled',
              })
            }
          >
            Enabled
          </Checkbox>
          <Select
            label="Scope"
            value={automation.scope}
            onChange={(e: ChangeEvent<HTMLSelectElement>) =>
              onUpdateAutomation({
                scope: e.target.value as Automation['scope'],
              })
            }
          >
            <option value="global">Global</option>
            <option value="team">Team</option>
            <option value="channel">Channel</option>
          </Select>
          <Combobox
            label="Tags"
            placeholder="Add tags…"
            multiple
            options={tagOptions}
            value={automation.tags}
            onChange={(next: string | string[] | null) =>
              onUpdateAutomation({
                tags: Array.isArray(next) ? next : next ? [next] : [],
              })
            }
          />
          <Select
            label="Bot"
            value={automation.botId || DEFAULT_AUTOMATION_BOT_ID}
            onChange={(e: ChangeEvent<HTMLSelectElement>) =>
              onUpdateAutomation({ botId: e.target.value })
            }
          >
            {AUTOMATION_BOTS.map((bot) => (
              <option key={bot.id} value={bot.id}>
                {bot.label}
              </option>
            ))}
          </Select>
          <Select
            label="Folder"
            value={automation.folderId || DEFAULT_AUTOMATION_FOLDER_ID}
            onChange={(e: ChangeEvent<HTMLSelectElement>) =>
              onUpdateAutomation({ folderId: e.target.value })
            }
          >
            {AUTOMATION_FOLDERS.map((folder) => (
              <option key={folder.id} value={folder.id}>
                {folder.name}
              </option>
            ))}
          </Select>
        </div>
      </Scrollbar>
    </div>
  );
}
