import { useState } from 'react';
import ChevronDownIcon from '@mattermost/compass-icons/components/chevron-down';
import CodeTagsIcon from '@mattermost/compass-icons/components/code-tags';
import FilterVariantIcon from '@mattermost/compass-icons/components/filter-variant';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import ShieldOutlineIcon from '@mattermost/compass-icons/components/shield-outline';
import TableLargeIcon from '@mattermost/compass-icons/components/table-large';
import TrashCanOutlineIcon from '@mattermost/compass-icons/components/trash-can-outline';
import { WithTooltip } from '@mattermost/compass-proto';
import { Button } from '@mattermost/compass-ui/components/button';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { IconButton } from '@mattermost/compass-ui/components/icon-button';
import { SegmentedControl } from '@mattermost/compass-ui/components/segmented-control';
import { TextArea } from '@mattermost/compass-ui/components/text-area';
import {
  ATTRIBUTES,
  toExpression,
  type AttributeKey,
  type Condition,
  type MatchMode,
  type Operator,
} from '../weaveAutomationPermissionsData';
import MenuCell, { type MenuGroup } from './MenuCell';
import styles from './AttributeRuleEditor.module.scss';

/* Copy and operator labels follow the policy rule builder (`copy.ts`, shipped
 * admin.access_control.operators.*). */
const OPERATORS: { value: Operator; label: string }[] = [
  { value: 'is', label: 'is' },
  { value: 'is-not', label: 'is not' },
  { value: 'in', label: 'in' },
];

const JOIN_LABELS: Record<MatchMode, string> = {
  all: 'All rules required',
  any: 'Any rule required',
};

const ATTRIBUTE_MENU: MenuGroup[] = [
  {
    heading: 'User',
    options: ATTRIBUTES.map((a) => ({ value: a.key, label: a.label })),
  },
];

interface AttributeRuleEditorProps {
  conditions: Condition[];
  match: MatchMode;
  onChange: (next: Condition[]) => void;
  onMatchChange: (match: MatchMode) => void;
  onTest: () => void;
}

let nextId = 100;

/**
 * Attribute rule editor, following Abhijit's permission policy rule builder
 * (branch `abhijit/dm-gm-action-controls`, `prototypes/policy-rule-builder`):
 * a borderless-cell table whose cells open menus, an "All / Any rule
 * required" header control, and an Advanced / Simple switch. Narrowed to one
 * party (user attributes) with no nested groups, since Weave rules only see
 * the acting user.
 */
export default function AttributeRuleEditor({
  conditions,
  match,
  onChange,
  onMatchChange,
  onTest,
}: AttributeRuleEditorProps) {
  const [mode, setMode] = useState<'simple' | 'advanced'>('simple');

  function update(id: string, patch: Partial<Condition>) {
    onChange(conditions.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }

  function add(attribute: AttributeKey) {
    onChange([
      ...conditions,
      { id: `c${nextId++}`, attribute, operator: 'is', values: [] },
    ]);
  }

  function toggleValue(c: Condition, v: string) {
    const has = c.values.includes(v);
    update(c.id, {
      values: has ? c.values.filter((x) => x !== v) : [...c.values, v],
    });
  }

  return (
    <div className={styles['rule-editor']} data-wt-focus="attribute-rules">
      <div className={styles['rule-editor__header']}>
        <span className={styles['rule-editor__title']} id="rule-editor-title">
          Attribute-based rules
        </span>
        <SegmentedControl
          aria-label="Editor mode"
          options={[
            {
              key: 'advanced',
              label: 'Advanced',
              icon: <Icon glyph={<CodeTagsIcon />} />,
            },
            {
              key: 'simple',
              label: 'Simple',
              icon: <Icon glyph={<TableLargeIcon />} />,
            },
          ]}
          value={mode}
          onChange={(key) => setMode(key as 'simple' | 'advanced')}
        />
      </div>

      {mode === 'simple' ? (
        <div className={styles['rule-editor__table-wrap']}>
          <table
            className={styles['rule-editor__table']}
            aria-labelledby="rule-editor-title"
          >
            <colgroup>
              <col className={styles['rule-editor__col-attr']} />
              <col className={styles['rule-editor__col-op']} />
              <col />
              <col className={styles['rule-editor__col-actions']} />
            </colgroup>
            <thead>
              <tr>
                <th scope="col">Attribute</th>
                <th scope="col">Operator</th>
                <th scope="col">Values</th>
                <th scope="col" className={styles['rule-editor__head-end']}>
                  <MenuCell
                    ariaLabel={`${JOIN_LABELS[match]}. Change how rules combine`}
                    groups={[
                      {
                        options: (['all', 'any'] as MatchMode[]).map((m) => ({
                          value: m,
                          label: JOIN_LABELS[m],
                        })),
                      },
                    ]}
                    selected={[match]}
                    onSelect={(m) => onMatchChange(m as MatchMode)}
                    align="end"
                    renderTrigger={({ open, toggle }) => (
                      <button
                        type="button"
                        className={styles['rule-editor__head-control']}
                        aria-haspopup="menu"
                        aria-expanded={open}
                        aria-label={`${JOIN_LABELS[match]}. Change how rules combine`}
                        onClick={toggle}
                      >
                        <Icon glyph={<FilterVariantIcon />} size="16" />
                        {JOIN_LABELS[match]}
                        <Icon glyph={<ChevronDownIcon />} size="16" />
                      </button>
                    )}
                  />
                </th>
              </tr>
            </thead>
            <tbody>
              {conditions.length === 0 ? (
                <tr>
                  <td colSpan={4} className={styles['rule-editor__empty']}>
                    Select an attribute and values to create a rule
                  </td>
                </tr>
              ) : (
                conditions.map((c) => {
                  const attr =
                    ATTRIBUTES.find((a) => a.key === c.attribute) ??
                    ATTRIBUTES[0];
                  const opLabel =
                    OPERATORS.find((o) => o.value === c.operator)?.label ??
                    'is';
                  return (
                    <tr key={c.id}>
                      <td className={styles['rule-editor__trigger-cell']}>
                        <MenuCell
                          ariaLabel={`Attribute: ${attr.label}. Change attribute`}
                          groups={ATTRIBUTE_MENU}
                          searchable
                          selected={[c.attribute]}
                          onSelect={(k) =>
                            k !== c.attribute &&
                            update(c.id, {
                              attribute: k as AttributeKey,
                              values: [],
                            })
                          }
                        >
                          {attr.label}
                        </MenuCell>
                      </td>
                      <td className={styles['rule-editor__trigger-cell']}>
                        <MenuCell
                          ariaLabel={`${attr.label} operator: ${opLabel}. Change operator`}
                          groups={[{ options: OPERATORS }]}
                          selected={[c.operator]}
                          onSelect={(o) =>
                            update(c.id, { operator: o as Operator })
                          }
                        >
                          {opLabel}
                        </MenuCell>
                      </td>
                      <td className={styles['rule-editor__trigger-cell']}>
                        <MenuCell
                          ariaLabel={`${attr.label} values: ${c.values.join(', ') || 'none'}. Change values`}
                          groups={[
                            {
                              heading: 'Values',
                              options: attr.values.map((v) => ({
                                value: v,
                                label: v,
                              })),
                            },
                          ]}
                          selected={c.values}
                          multi
                          chevron
                          onSelect={(v) => toggleValue(c, v)}
                        >
                          {c.values.length ? (
                            c.values.join(', ')
                          ) : (
                            <span
                              className={styles['rule-editor__placeholder']}
                            >
                              Select value
                            </span>
                          )}
                        </MenuCell>
                      </td>
                      <td className={styles['rule-editor__actions-cell']}>
                        <WithTooltip label="Remove rule">
                          <IconButton
                            size="small"
                            padding="compact"
                            destructive
                            icon={<Icon glyph={<TrashCanOutlineIcon />} />}
                            aria-label={`Remove rule on ${attr.label}`}
                            onClick={() =>
                              onChange(conditions.filter((x) => x.id !== c.id))
                            }
                          />
                        </WithTooltip>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
          <div className={styles['rule-editor__table-footer']}>
            <MenuCell
              ariaLabel="Add attribute"
              groups={ATTRIBUTE_MENU}
              searchable
              selected={[]}
              onSelect={(k) => add(k as AttributeKey)}
              renderTrigger={({ open, toggle }) => (
                <Button
                  emphasis="tertiary"
                  size="small"
                  leadingIcon={<Icon glyph={<PlusIcon />} />}
                  aria-haspopup="menu"
                  aria-expanded={open}
                  onClick={toggle}
                >
                  Add attribute
                </Button>
              )}
            />
          </div>
        </div>
      ) : (
        <TextArea
          label="Expression"
          readOnly
          value={toExpression(conditions, match)}
          message="Read-only in this prototype. The product uses the host's expression editor."
          messageTone="info"
        />
      )}

      <div className={styles['rule-editor__footer']}>
        <Button
          emphasis="dim"
          size="small"
          compact
          leadingIcon={<Icon glyph={<ShieldOutlineIcon />} />}
          onClick={onTest}
        >
          Test matching users
        </Button>
      </div>
    </div>
  );
}
