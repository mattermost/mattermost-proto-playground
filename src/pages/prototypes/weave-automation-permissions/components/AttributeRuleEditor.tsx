import { useState } from 'react';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import TrashCanOutlineIcon from '@mattermost/compass-icons/components/trash-can-outline';
import FlaskOutlineIcon from '@mattermost/compass-icons/components/flask-outline';
import { Button } from '@mattermost/compass-ui/components/button';
import { Combobox } from '@mattermost/compass-ui/components/combobox';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { IconButton } from '@mattermost/compass-ui/components/icon-button';
import { Select } from '@mattermost/compass-ui/components/select';
import { Tabs } from '@mattermost/compass-ui/components/tabs';
import { TextArea } from '@mattermost/compass-ui/components/text-area';
import { WithTooltip } from '@mattermost/compass-proto';
import {
  ATTRIBUTES,
  toExpression,
  type AttributeKey,
  type Condition,
  type Operator,
} from '../weaveAutomationPermissionsData';
import styles from './AttributeRuleEditor.module.scss';

const OPERATORS: { value: Operator; label: string }[] = [
  { value: 'is', label: 'is' },
  { value: 'is-not', label: 'is not' },
  { value: 'in', label: 'includes' },
];

interface AttributeRuleEditorProps {
  conditions: Condition[];
  onChange: (next: Condition[]) => void;
  onTest: () => void;
}

let nextId = 100;

/**
 * Stand-in for the host webapp's ABAC table and expression editors (the spec
 * reuses those). Simple: one row per condition, combined with AND. Advanced:
 * the generated expression, read-only in this prototype.
 */
export default function AttributeRuleEditor({
  conditions,
  onChange,
  onTest,
}: AttributeRuleEditorProps) {
  const [tab, setTab] = useState('simple');

  function update(id: string, patch: Partial<Condition>) {
    onChange(conditions.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }

  function add() {
    const used = new Set(conditions.map((c) => c.attribute));
    const attr = ATTRIBUTES.find((a) => !used.has(a.key)) ?? ATTRIBUTES[0];
    onChange([
      ...conditions,
      { id: `c${nextId++}`, attribute: attr.key, operator: 'is', values: [] },
    ]);
  }

  return (
    <div className={styles['rule-editor']}>
      <Tabs
        tabs={[
          {
            key: 'simple',
            label: 'Simple',
            id: 'rule-tab-simple',
            panelId: 'rule-panel',
          },
          {
            key: 'advanced',
            label: 'Advanced',
            id: 'rule-tab-advanced',
            panelId: 'rule-panel',
          },
        ]}
        activeKey={tab}
        onChange={setTab}
        aria-label="Rule editor mode"
      />

      <div
        id="rule-panel"
        role="tabpanel"
        aria-labelledby={
          tab === 'simple' ? 'rule-tab-simple' : 'rule-tab-advanced'
        }
      >
        {tab === 'simple' ? (
          <div
            className={styles['rule-editor__table']}
            role="table"
            aria-label="Conditions"
          >
            <div className={styles['rule-editor__head']} role="row">
              <span role="columnheader">Attribute</span>
              <span role="columnheader">Operator</span>
              <span role="columnheader">Values</span>
              <span role="columnheader" className={styles['rule-editor__sr']}>
                Remove
              </span>
            </div>
            {conditions.map((c) => {
              const attr =
                ATTRIBUTES.find((a) => a.key === c.attribute) ?? ATTRIBUTES[0];
              return (
                <div
                  key={c.id}
                  className={styles['rule-editor__row']}
                  role="row"
                >
                  <div role="cell">
                    <Select
                      size="small"
                      aria-label="Attribute"
                      listboxLabel="Attribute"
                      value={c.attribute}
                      options={ATTRIBUTES.map((a) => ({
                        value: a.key,
                        label: a.label,
                      }))}
                      onChange={(v) =>
                        update(c.id, {
                          attribute: v as AttributeKey,
                          values: [],
                        })
                      }
                    />
                  </div>
                  <div role="cell">
                    <Select
                      size="small"
                      aria-label="Operator"
                      listboxLabel="Operator"
                      value={c.operator}
                      options={OPERATORS}
                      onChange={(v) =>
                        update(c.id, { operator: v as Operator })
                      }
                    />
                  </div>
                  <div role="cell">
                    <Combobox
                      size="small"
                      multiple
                      aria-label={`${attr.label} values`}
                      placeholder="Add values"
                      options={attr.values.map((v) => ({ value: v, label: v }))}
                      value={c.values}
                      onChange={(v) =>
                        update(c.id, { values: (v as string[]) ?? [] })
                      }
                    />
                  </div>
                  <div role="cell">
                    <WithTooltip label="Remove condition">
                      <IconButton
                        size="small"
                        padding="compact"
                        icon={<Icon glyph={<TrashCanOutlineIcon />} />}
                        aria-label={`Remove ${attr.label} condition`}
                        onClick={() =>
                          onChange(conditions.filter((x) => x.id !== c.id))
                        }
                      />
                    </WithTooltip>
                  </div>
                </div>
              );
            })}
            <div className={styles['rule-editor__add']}>
              <Button
                emphasis="tertiary"
                size="small"
                leadingIcon={<Icon glyph={<PlusIcon />} />}
                onClick={add}
              >
                Add attribute
              </Button>
            </div>
          </div>
        ) : (
          <TextArea
            label="Expression"
            readOnly
            value={toExpression(conditions)}
            message="Read-only in this prototype. The real editor is the host's expression editor."
            messageTone="info"
          />
        )}
      </div>

      <div className={styles['rule-editor__footer']}>
        <p className={styles['rule-editor__help']}>
          Each row is a condition someone has to meet. All rows are combined
          with AND.
        </p>
        <Button
          emphasis="tertiary"
          size="small"
          leadingIcon={<Icon glyph={<FlaskOutlineIcon />} />}
          onClick={onTest}
        >
          Test who matches
        </Button>
      </div>
    </div>
  );
}
