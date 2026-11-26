import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import CheckIcon from '@mattermost/compass-icons/components/check';
import CodeTagsIcon from '@mattermost/compass-icons/components/code-tags';
import FormatListBulletedIcon from '@mattermost/compass-icons/components/format-list-bulleted';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import ShieldOutlineIcon from '@mattermost/compass-icons/components/shield-outline';
import TrashCanOutlineIcon from '@mattermost/compass-icons/components/trash-can-outline';
import TuneIcon from '@mattermost/compass-icons/components/tune';
import { WithTooltip } from '@mattermost/compass-proto';
import { Button } from '@mattermost/compass-ui/components/button';
import { Combobox } from '@mattermost/compass-ui/components/combobox';
import { Dropdown } from '@mattermost/compass-ui/components/dropdown';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { IconButton } from '@mattermost/compass-ui/components/icon-button';
import { MenuItem } from '@mattermost/compass-ui/components/menu-item';
import { PopoverMenu } from '@mattermost/compass-ui/components/popover-menu';
import { SegmentedControl } from '@mattermost/compass-ui/components/segmented-control';
import { Select } from '@mattermost/compass-ui/components/select';
import { TextArea } from '@mattermost/compass-ui/components/text-area';
import { useOutsideClose } from '@mattermost/compass-ui/hooks/use-outside-close';
import {
  ATTRIBUTES,
  toExpression,
  type AttributeKey,
  type Condition,
  type MatchMode,
  type Operator,
} from '../weaveAutomationPermissionsData';
import styles from './AttributeRuleEditor.module.scss';

const OPERATORS: { value: Operator; label: string }[] = [
  { value: 'is', label: 'is' },
  { value: 'is-not', label: 'is not' },
  { value: 'in', label: 'includes' },
];

const MATCH_LABELS: Record<MatchMode, string> = {
  all: 'All attributes required',
  any: 'Any attribute matches',
};

interface AttributeRuleEditorProps {
  conditions: Condition[];
  match: MatchMode;
  onChange: (next: Condition[]) => void;
  onMatchChange: (match: MatchMode) => void;
  onTest: () => void;
}

let nextId = 100;

/**
 * "All attributes required" / "Any attribute matches" trigger and menu.
 * Host-owned overlay: portaled, fixed below the trigger, closes on outside
 * press and Escape.
 */
function MatchModeMenu({
  value,
  onChange,
}: {
  value: MatchMode;
  onChange: (m: MatchMode) => void;
}) {
  const [anchor, setAnchor] = useState<DOMRect | null>(null);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  useOutsideClose(wrapRef, open, () => setOpen(false), menuRef);

  function close() {
    setOpen(false);
    wrapRef.current?.querySelector('button')?.focus();
  }

  // Escape closes the menu and returns focus to the trigger.
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && !e.defaultPrevented) {
        e.preventDefault();
        setOpen(false);
        wrapRef.current?.querySelector('button')?.focus();
      }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <div ref={wrapRef}>
      <Dropdown
        size="x-small"
        leadingIcon={<Icon glyph={<TuneIcon />} />}
        isOpen={open}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={(e) => {
          if (open) {
            setOpen(false);
          } else {
            setAnchor(e.currentTarget.getBoundingClientRect());
            setOpen(true);
          }
        }}
      >
        {MATCH_LABELS[value]}
      </Dropdown>
      {anchor &&
        createPortal(
          <div
            ref={menuRef}
            className={styles['rule-editor__menu-layer']}
            style={{ top: anchor.bottom + 4, left: anchor.right }}
          >
            <PopoverMenu
              open={open}
              onExited={() => setAnchor(null)}
              role="menu"
              aria-label="How conditions combine"
            >
              {(Object.keys(MATCH_LABELS) as MatchMode[]).map((key) => (
                <MenuItem
                  key={key}
                  role="menuitemradio"
                  leadingElement={false}
                  aria-checked={value === key}
                  label={MATCH_LABELS[key]}
                  secondaryLabel={
                    key === 'all' ? 'Combined with AND' : 'Combined with OR'
                  }
                  secondaryLabelPosition="below"
                  trailingElement={value === key}
                  trailingVisual={<Icon glyph={<CheckIcon />} />}
                  onClick={() => {
                    onChange(key);
                    close();
                  }}
                />
              ))}
            </PopoverMenu>
          </div>,
          document.body,
        )}
    </div>
  );
}

/**
 * Attribute rule editor, following Abhijit's System Console membership
 * policy prototype (branch `abhijit-prototypes`,
 * `src/pages/MembershipPoliciesTeams/screens/SG1PolicyEditor.tsx`, built to
 * the Permission Policies Figma). The real product reuses the host webapp's
 * table and expression editors.
 */
export default function AttributeRuleEditor({
  conditions,
  match,
  onChange,
  onMatchChange,
  onTest,
}: AttributeRuleEditorProps) {
  const [mode, setMode] = useState('simple');

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
      <div className={styles['rule-editor__header']}>
        <span className={styles['rule-editor__title']} id="rule-editor-title">
          User attribute requirements
        </span>
        <SegmentedControl
          size="small"
          aria-label="Editor mode"
          value={mode}
          onChange={setMode}
          options={[
            {
              key: 'advanced',
              label: 'Advanced',
              icon: <Icon glyph={<CodeTagsIcon />} />,
              id: 'rule-mode-advanced',
              panelId: 'rule-panel',
            },
            {
              key: 'simple',
              label: 'Simple',
              icon: <Icon glyph={<FormatListBulletedIcon />} />,
              id: 'rule-mode-simple',
              panelId: 'rule-panel',
            },
          ]}
        />
      </div>

      <div
        id="rule-panel"
        role="tabpanel"
        aria-labelledby={
          mode === 'simple' ? 'rule-mode-simple' : 'rule-mode-advanced'
        }
      >
        {mode === 'simple' ? (
          <div
            className={styles['rule-editor__table']}
            role="table"
            aria-labelledby="rule-editor-title"
          >
            <div className={styles['rule-editor__head']} role="row">
              <span role="columnheader">Attribute</span>
              <span role="columnheader">Operator</span>
              <span role="columnheader">Values</span>
              <span
                role="columnheader"
                className={styles['rule-editor__head-end']}
              >
                <span className={styles['rule-editor__sr']}>
                  How conditions combine
                </span>
                <MatchModeMenu value={match} onChange={onMatchChange} />
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
                      leadingIcon={<Icon glyph={<FormatListBulletedIcon />} />}
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
                  <div role="cell" className={styles['rule-editor__cell-end']}>
                    <WithTooltip label="Remove attribute">
                      <IconButton
                        size="small"
                        padding="compact"
                        destructive
                        icon={<Icon glyph={<TrashCanOutlineIcon />} />}
                        aria-label={`Remove ${attr.label} rule`}
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
                emphasis="link"
                size="x-small"
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
            value={toExpression(conditions, match)}
            message="Read-only in this prototype. The product uses the host's expression editor."
            messageTone="info"
          />
        )}
      </div>

      <div className={styles['rule-editor__footer']}>
        <p className={styles['rule-editor__help']}>
          Select attributes and values that people must have to be in this group
        </p>
        <Button
          emphasis="tertiary"
          size="small"
          leadingIcon={<Icon glyph={<ShieldOutlineIcon />} />}
          onClick={onTest}
        >
          Test matching users
        </Button>
      </div>
    </div>
  );
}
