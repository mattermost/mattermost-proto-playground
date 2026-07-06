import { useEffect, useRef, useState } from 'react';
import EqualIcon from '@mattermost/compass-icons/components/equal';
import FormatListNumberedIcon from '@mattermost/compass-icons/components/format-list-numbered';
import FolderOutlineIcon from '@mattermost/compass-icons/components/folder-outline';
import TrashCanOutlineIcon from '@mattermost/compass-icons/components/trash-can-outline';
import PlayOutlineIcon from '@mattermost/compass-icons/components/play-outline';
import FilterVariantIcon from '@mattermost/compass-icons/components/filter-variant';
import MagnifyIcon from '@mattermost/compass-icons/components/magnify';
import ApplicationCogIcon from '@mattermost/compass-icons/components/application-cog';
import Button from '@/components/ui/Button/Button';
import Chip from '@/components/ui/Chip/Chip';
import ConsolePropertyTable from '@/components/ui/ConsolePropertyTable/ConsolePropertyTable';
import ConsolePropertyRow from '@/components/ui/ConsolePropertyRow/ConsolePropertyRow';
import Dropdown from '@/components/ui/Dropdown/Dropdown';
import Icon from '@/components/ui/Icon/Icon';
import IconButton from '@/components/ui/IconButton/IconButton';
import MenuItem from '@/components/ui/MenuItem/MenuItem';
import PopoverMenu from '@/components/ui/PopoverMenu/PopoverMenu';
import TextInput from '@/components/ui/TextInput/TextInput';
import styles from './PolicyEditor.module.scss';

/**
 * Operator vocabulary for the Membership Policy editor's Simple mode when the
 * selected attribute is Ranked. Copy and ordering match Figma 4300-32780:
 * equality first, then the inequality operators paired by direction
 * (inclusive + strict, greater first then less). "is not" was dropped in this
 * update — strict `>` and `<` are now first-class in Simple mode instead of
 * Advanced-only.
 */
export type SimpleOperator =
  | { kind: '='; symbol: '='; label: 'is exactly' }
  | { kind: '>='; symbol: '≥'; label: 'is at least' }
  | { kind: '>'; symbol: '>'; label: 'is greater than' }
  | { kind: '<='; symbol: '≤'; label: 'is at most' }
  | { kind: '<'; symbol: '<'; label: 'is less than' };

export const SIMPLE_OPERATORS: SimpleOperator[] = [
  { kind: '=', symbol: '=', label: 'is exactly' },
  { kind: '>=', symbol: '≥', label: 'is at least' },
  { kind: '>', symbol: '>', label: 'is greater than' },
  { kind: '<=', symbol: '≤', label: 'is at most' },
  { kind: '<', symbol: '<', label: 'is less than' },
];

interface RuleAttribute {
  id: 'program' | 'clearance';
  label: string;
  icon: React.ReactNode;
}

const ATTRIBUTES: RuleAttribute[] = [
  { id: 'program', label: 'Program', icon: <FolderOutlineIcon /> },
  { id: 'clearance', label: 'Clearance', icon: <FormatListNumberedIcon /> },
];

interface AttributeRule {
  id: string;
  attribute: RuleAttribute;
  operator: SimpleOperator;
  /** Selected value chip label — kept as a string so the editor can show
   * arbitrary copy that matches Figma; in the real product this resolves to
   * a value from the attribute's schema. */
  valueLabel: string;
}

const DEFAULT_RULES: AttributeRule[] = [
  {
    id: 'rule-1',
    attribute: ATTRIBUTES[0],
    operator: SIMPLE_OPERATORS[0],
    valueLabel: 'Dragon Spacecraft',
  },
  {
    id: 'rule-2',
    attribute: ATTRIBUTES[1],
    operator: SIMPLE_OPERATORS[0],
    valueLabel: 'SECRET',
  },
];

interface PolicyEditorProps {
  /** Initial value of the policy name field. */
  initialName?: string;
  /** Initial editor mode. */
  initialMode?: 'simple' | 'advanced';
  /** Called whenever editor state changes from its initial values. */
  onDirtyChange?: (dirty: boolean) => void;
}

/**
 * Membership Policy editor body — composes Compass `ConsolePropertyTable` for
 * the attribute-requirement rows, `Dropdown` + `PopoverMenu` + `MenuItem` for
 * the operator selector, `Chip` for the value chip, and `IconButton` for the
 * per-row delete affordance.
 *
 * Pixel-targets Figma 4208-27399 (Edit membership policy). Renders inside
 * `PolicyEditorPage` which provides the surrounding `ConsoleFrame` chrome.
 */
export default function PolicyEditor({
  initialName = 'Confidential DS-BP',
  initialMode = 'simple',
  onDirtyChange,
}: PolicyEditorProps) {
  const [name, setName] = useState(initialName);
  const [mode, setMode] = useState<'simple' | 'advanced'>(initialMode);
  const [rules, setRules] = useState<AttributeRule[]>(DEFAULT_RULES);
  const [openOperatorMenu, setOpenOperatorMenu] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  // Signal dirty state to the surrounding page so the Save button activates.
  useEffect(() => {
    const isDirty =
      name !== initialName || mode !== initialMode || rules !== DEFAULT_RULES;
    onDirtyChange?.(isDirty);
  }, [name, mode, rules, initialName, initialMode, onDirtyChange]);

  function setOperator(ruleId: string, op: SimpleOperator) {
    setRules((prev) =>
      prev.map((r) => (r.id === ruleId ? { ...r, operator: op } : r)),
    );
    setOpenOperatorMenu(null);
  }

  function removeRule(ruleId: string) {
    setRules((prev) => prev.filter((r) => r.id !== ruleId));
  }

  function addRule() {
    const used = new Set(rules.map((r) => r.attribute.id));
    const next = ATTRIBUTES.find((a) => !used.has(a.id)) ?? ATTRIBUTES[0];
    setRules((prev) => [
      ...prev,
      {
        id: `rule-${Date.now()}`,
        attribute: next,
        operator: SIMPLE_OPERATORS[0],
        valueLabel: '',
      },
    ]);
  }

  return (
    <div className={styles['policy-editor']}>
      {/* Top label row — "Membership policy name:" + text input + helper text */}
      <div className={styles['policy-editor__name']}>
        <label
          htmlFor="policy-name"
          className={styles['policy-editor__name-label']}
        >
          Membership policy name:
        </label>
        <div className={styles['policy-editor__name-field']}>
          <TextInput
            id="policy-name"
            size="Medium"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <span className={styles['policy-editor__name-help']}>
            Give your policy a name that will be used to identify it in the
            policies list.
          </span>
        </div>
      </div>

      {/* Section 1 — Membership rules */}
      <section className={styles['policy-editor__section']}>
        <header className={styles['policy-editor__section-head']}>
          <h2 className={styles['policy-editor__section-title']}>
            Membership rules
          </h2>
          <p className={styles['policy-editor__section-subtitle']}>
            Define access rules based on user attributes and values along with
            permissions
          </p>
        </header>

        <div className={styles['policy-editor__rules']}>
          <div className={styles['policy-editor__rules-head']}>
            <span className={styles['policy-editor__rules-head-title']}>
              Attribute requirements
            </span>
            <div className={styles['policy-editor__mode']} role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={mode === 'advanced'}
                className={[
                  styles['policy-editor__mode-button'],
                  mode === 'advanced' &&
                    styles['policy-editor__mode-button--active'],
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => setMode('advanced')}
              >
                <span className={styles['policy-editor__mode-icon']}>
                  <Icon size="12" glyph={<ApplicationCogIcon />} />
                </span>
                <span className={styles['policy-editor__mode-label']}>
                  Advanced
                </span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={mode === 'simple'}
                className={[
                  styles['policy-editor__mode-button'],
                  mode === 'simple' &&
                    styles['policy-editor__mode-button--active'],
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => setMode('simple')}
              >
                <span className={styles['policy-editor__mode-icon']}>
                  <Icon size="12" glyph={<FormatListNumberedIcon />} />
                </span>
                <span className={styles['policy-editor__mode-label']}>
                  Simple
                </span>
              </button>
            </div>
          </div>

          {mode === 'simple' ? (
            <ConsolePropertyTable
              sections={[
                {
                  columns: [
                    {
                      key: 'attribute',
                      label: 'Attribute',
                      width: 16 + 220 /* drag + title */,
                    },
                    { key: 'operator', label: 'Operator', width: 200 },
                    { key: 'values', label: 'Values' },
                  ],
                  rows: rules.map((rule) => (
                    <RuleRow
                      key={rule.id}
                      rule={rule}
                      operatorMenuOpen={openOperatorMenu === rule.id}
                      onToggleOperator={() =>
                        setOpenOperatorMenu(
                          openOperatorMenu === rule.id ? null : rule.id,
                        )
                      }
                      onSelectOperator={(op) => setOperator(rule.id, op)}
                      onRemove={() => removeRule(rule.id)}
                      onRemoveValue={() =>
                        setRules((prev) =>
                          prev.map((r) =>
                            r.id === rule.id ? { ...r, valueLabel: '' } : r,
                          ),
                        )
                      }
                    />
                  )),
                },
              ]}
            />
          ) : (
            <div className={styles['policy-editor__advanced']}>
              <textarea
                className={styles['policy-editor__advanced-input']}
                defaultValue={rulesToCel(rules)}
                aria-label="Advanced CEL expression"
                spellCheck={false}
              />
              <span className={styles['policy-editor__advanced-help']}>
                CEL with schema-aware validation on save (FR-10). Switch back to
                Simple to round-trip; inexpressible sub-expressions stay
                marked.
              </span>
            </div>
          )}

          <div className={styles['policy-editor__rules-actions']}>
            <Button
              emphasis="Quaternary"
              size="Small"
              leadingIcon={<span aria-hidden>+</span>}
              onClick={addRule}
            >
              Add attribute
            </Button>
          </div>

          <div className={styles['policy-editor__rules-footer']}>
            <p className={styles['policy-editor__rules-footnote']}>
              Select one or more attributes and values users must have to join
              this channel. You can choose if all or just one attribute is
              required for access. Test rules to check which users would be
              allowed based on the set rules.
            </p>
            <Button
              emphasis="Tertiary"
              size="Small"
              leadingIcon={<Icon size="16" glyph={<PlayOutlineIcon />} />}
            >
              Test access rule
            </Button>
          </div>
        </div>
      </section>

      {/* Section 2 — Assigned channels */}
      <section className={styles['policy-editor__section']}>
        <header className={styles['policy-editor__section-head']}>
          <div className={styles['policy-editor__section-titles']}>
            <h2 className={styles['policy-editor__section-title']}>
              Assigned channels
            </h2>
            <p className={styles['policy-editor__section-subtitle']}>
              Add channels that this property based access policy will apply to
            </p>
          </div>
          <Button
            emphasis="Primary"
            size="Small"
            leadingIcon={<span aria-hidden>+</span>}
          >
            Add channels
          </Button>
        </header>

        <div className={styles['policy-editor__channels']}>
          <div className={styles['policy-editor__channels-toolbar']}>
            <div className={styles['policy-editor__channels-search']}>
              <TextInput
                size="Small"
                placeholder="Search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                leadingIcon={<Icon size="16" glyph={<MagnifyIcon />} />}
              />
            </div>
            <Button
              emphasis="Tertiary"
              size="Small"
              leadingIcon={<Icon size="16" glyph={<FilterVariantIcon />} />}
            >
              Filters
            </Button>
          </div>
          <div className={styles['policy-editor__channels-empty']}>
            <span className={styles['policy-editor__channels-empty-text']}>
              No channels selected
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}

interface RuleRowProps {
  rule: AttributeRule;
  operatorMenuOpen: boolean;
  onToggleOperator: () => void;
  onSelectOperator: (op: SimpleOperator) => void;
  onRemove: () => void;
  onRemoveValue: () => void;
}

function RuleRow({
  rule,
  operatorMenuOpen,
  onToggleOperator,
  onSelectOperator,
  onRemove,
  onRemoveValue,
}: RuleRowProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  // Outside-click + Esc close for the operator menu (R-D1-FOCUS parity).
  useEffect(() => {
    if (!operatorMenuOpen) return;
    function onMouseDown(e: MouseEvent) {
      if (!menuRef.current) return;
      if (menuRef.current.contains(e.target as Node)) return;
      onToggleOperator();
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onToggleOperator();
    }
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [operatorMenuOpen, onToggleOperator]);

  return (
    <ConsolePropertyRow
      title={rule.attribute.label}
      typeIcon={rule.attribute.icon}
      draggable
      hideMore={false}
      trailingAction={
        <IconButton
          size="X-Small"
          destructive
          aria-label={`Remove ${rule.attribute.label} rule`}
          icon={<Icon size="16" glyph={<TrashCanOutlineIcon />} />}
          onClick={onRemove}
        />
      }
      value={
        <div className={styles['policy-editor__rule-value']}>
          <div
            className={styles['policy-editor__rule-operator']}
            ref={menuRef}
          >
            <Dropdown
              size="Small"
              padding="Compact"
              isOpen={operatorMenuOpen}
              onClick={onToggleOperator}
              leadingIcon={<OperatorSymbol symbol={rule.operator.symbol} />}
            >
              {rule.operator.label}
            </Dropdown>
            {operatorMenuOpen && (
              <div className={styles['policy-editor__rule-operator-menu']}>
                <PopoverMenu>
                  {SIMPLE_OPERATORS.map((op) => (
                    <MenuItem
                      key={op.kind}
                      label={op.label}
                      leadingVisual={<OperatorSymbol symbol={op.symbol} />}
                      trailingElement={op.kind === rule.operator.kind}
                      onClick={() => onSelectOperator(op)}
                    />
                  ))}
                </PopoverMenu>
              </div>
            )}
          </div>
          <div className={styles['policy-editor__rule-chips']}>
            {rule.valueLabel && (
              <Chip
                size="Small"
                tone="danger"
                onRemove={onRemoveValue}
                removeLabel={`Remove ${rule.valueLabel}`}
              >
                {rule.valueLabel}
              </Chip>
            )}
            <button
              type="button"
              className={styles['policy-editor__rule-add-value']}
              aria-label={`Add value to ${rule.attribute.label}`}
            >
              <span aria-hidden>+</span>
            </button>
          </div>
        </div>
      }
    />
  );
}

/**
 * Renders a single math-style operator glyph (`=`, `≠`, `≥`, `≤`) as an
 * accessible visual. No compass icon exists for `≠`/`≥`/`≤`; rendering as a
 * glyph keeps the row scannable while staying token-clean.
 */
function OperatorSymbol({ symbol }: { symbol: '=' | '≥' | '>' | '≤' | '<' }) {
  // `=` has a Compass icon; the other three render as type glyphs.
  if (symbol === '=') {
    return <Icon size="16" glyph={<EqualIcon />} />;
  }
  return (
    <span aria-hidden className={styles['policy-editor__operator-symbol']}>
      {symbol}
    </span>
  );
}

function rulesToCel(rules: AttributeRule[]): string {
  return rules
    .map(
      (r) =>
        `user.attributes.${r.attribute.id} ${r.operator.kind} "${r.valueLabel}"`,
    )
    .join(' && ');
}
