import {
  Button,
  Checkbox,
  Scrollbar,
  Select,
  TextInput,
} from '@mattermost/compass-ui';
import type { ChangeEvent } from 'react';
import type { Automation, WorkflowNode } from '../../data/types';
import styles from './editor.module.scss';

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
  if (selectedNode) {
    const fields = selectedNode.data.fields ?? {};
    return (
      <div className={styles.panel}>
        <div className={styles.panel__header}>
          <h2 className={styles.panel__title}>{selectedNode.data.label}</h2>
          <Button emphasis="Tertiary" size="X-Small" onClick={onCloseNode}>
            Done
          </Button>
        </div>
        <Scrollbar className={styles.panel__body}>
          {selectedNode.data.helpText ? (
            <p className={styles.panel__help}>{selectedNode.data.helpText}</p>
          ) : null}
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
        <h2 className={styles.panel__title}>Automation</h2>
      </div>
      <Scrollbar className={styles.panel__body}>
        <TextInput
          label="Name"
          value={automation.name}
          onChange={(e: ChangeEvent<HTMLInputElement>) => onUpdateAutomation({ name: e.target.value })}
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
        <TextInput
          label="Tags (comma-separated)"
          value={automation.tags.join(', ')}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            onUpdateAutomation({
              tags: e.target.value
                .split(',')
                .map((t: string) => t.trim())
                .filter(Boolean),
            })
          }
        />
        <Select label="Run as" value="author" onChange={() => undefined}>
          <option value="author">Author (recommended)</option>
          <option value="bot">Bot account</option>
        </Select>
      </Scrollbar>
    </div>
  );
}
