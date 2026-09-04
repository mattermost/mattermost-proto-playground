import CloseIcon from '@mattermost/compass-icons/components/close';
import { Button } from '@mattermost/compass-ui/components/button';
import { Checkbox } from '@mattermost/compass-ui/components/checkbox';
import { Combobox } from '@mattermost/compass-ui/components/combobox';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { IconButton } from '@mattermost/compass-ui/components/icon-button';
import { Scrollbar } from '@mattermost/compass-ui/components/scrollbar';
import { Select } from '@mattermost/compass-ui/components/select';
import { TextInput } from '@mattermost/compass-ui/components/text-input';
import { useMemo, type ChangeEvent } from 'react';
import {
  AUTOMATION_BOTS,
  DEFAULT_AUTOMATION_BOT_ID,
  DEFAULT_AUTOMATION_FOLDER_ID,
  SYSTEM_TAGS,
} from '../../data/automationsData';
import { helpTextForStep } from '../../data/stepCatalog';
import type { Automation, StepKind, WorkflowNode } from '../../data/types';
import { useAutomations } from '../../context/AutomationsContext';
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
  const { folders } = useAutomations();
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
            size="small"
            padding="compact"
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
                  options={[
                    { value: 'contains', label: 'contains' },
                    { value: 'equals', label: 'equals' },
                    { value: 'contains_any', label: 'contains any' },
                  ]}
                  onChange={(operator) =>
                    onUpdateNode(selectedNode.id, {
                      ...fields,
                      operator,
                    })
                  }
                />
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
              <div className={styles.panel__chips}>
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
            emphasis="tertiary"
            size="small"
            onClick={() => onDuplicateNode(selectedNode.id)}
          >
            Duplicate step
          </Button>
          <Button
            emphasis="tertiary"
            size="small"
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
            options={[
              { value: 'global', label: 'Global' },
              { value: 'team', label: 'Team' },
              { value: 'channel', label: 'Channel' },
            ]}
            onChange={(scope) =>
              onUpdateAutomation({
                scope: scope as Automation['scope'],
              })
            }
          />
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
            options={AUTOMATION_BOTS.map((bot) => ({
              value: bot.id,
              label: bot.label,
            }))}
            onChange={(botId) => onUpdateAutomation({ botId })}
          />
          <Select
            label="Team"
            value={automation.folderId || DEFAULT_AUTOMATION_FOLDER_ID}
            options={folders.map((folder) => ({
              value: folder.id,
              label: folder.name,
            }))}
            onChange={(folderId) => onUpdateAutomation({ folderId })}
          />
        </div>
      </Scrollbar>
    </div>
  );
}
