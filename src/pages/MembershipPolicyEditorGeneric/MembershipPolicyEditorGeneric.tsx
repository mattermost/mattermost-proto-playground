import { useRef, useState } from 'react';
import AccountMultipleOutlineIcon from '@mattermost/compass-icons/components/account-multiple-outline';
import FormatListBulletedIcon from '@mattermost/compass-icons/components/format-list-bulleted';
import ShieldOutlineIcon from '@mattermost/compass-icons/components/shield-outline';
import ServerVariantIcon from '@mattermost/compass-icons/components/server-variant';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import ChevronDownIcon from '@mattermost/compass-icons/components/chevron-down';
import DotsVerticalIcon from '@mattermost/compass-icons/components/dots-vertical';
import TrashCanOutlineIcon from '@mattermost/compass-icons/components/trash-can-outline';
import CodeBracketsIcon from '@mattermost/compass-icons/components/code-brackets';
import MagnifyIcon from '@mattermost/compass-icons/components/magnify';
import CheckIcon from '@mattermost/compass-icons/components/check';
import AlertCircleOutlineIcon from '@mattermost/compass-icons/components/alert-circle-outline';

import ConsoleSidebar, {
  type ConsoleSidebarCategoryData,
} from '@/components/ui/ConsoleSidebar/ConsoleSidebar';
import ConsolePageHeader from '@/components/ui/ConsolePageHeader/ConsolePageHeader';
import ConsoleFooter from '@/components/ui/ConsoleFooter/ConsoleFooter';
import Button from '@/components/ui/Button/Button';
import IconButton from '@/components/ui/IconButton/IconButton';
import Icon from '@/components/ui/Icon/Icon';
import Chip from '@/components/ui/Chip/Chip';
import Spinner from '@/components/ui/Spinner/Spinner';
import UserAvatarGroup from '@/components/ui/UserAvatarGroup/UserAvatarGroup';
import PopoverMenu from '@/components/ui/PopoverMenu/PopoverMenu';
import MenuItem from '@/components/ui/MenuItem/MenuItem';
import { useOutsideClose } from '@/hooks/useOutsideClose';

import avatarLeonard from '@/assets/avatars/Leonard Riley.png';
import avatarAiko from '@/assets/avatars/Aiko Tan.png';
import avatarMarco from '@/assets/avatars/Marco Rinaldi.png';
import avatarEmma from '@/assets/avatars/Emma Novak.png';
import avatarDavid from '@/assets/avatars/David Liang.png';

import {
  OPERATORS,
  USER_ATTRS,
  VARIABLES,
  LITERALS,
  SEED_REQUIREMENTS,
  userAttr,
  variable,
  type Requirement,
} from './mpData';
import styles from './MembershipPolicyEditorGeneric.module.scss';

type ScreenState =
  | 'default'
  | 'populated'
  | 'loading'
  | 'error'
  | 'disabled'
  | 'empty';

const VALID_STATES: ScreenState[] = [
  'default',
  'populated',
  'loading',
  'error',
  'disabled',
  'empty',
];

const CATEGORIES: ConsoleSidebarCategoryData[] = [
  {
    id: 'user-management',
    label: 'User Management',
    icon: <AccountMultipleOutlineIcon />,
    items: [
      { id: 'users', label: 'Users' },
      { id: 'groups', label: 'Groups' },
      { id: 'teams', label: 'Teams' },
      { id: 'channels', label: 'Channels' },
      { id: 'permissions', label: 'Permissions' },
    ],
  },
  {
    id: 'attribute-management',
    label: 'Attribute Management',
    icon: <FormatListBulletedIcon />,
    items: [
      { id: 'global-attributes', label: 'Global Attributes' },
      { id: 'user-attributes', label: 'User Attributes' },
      { id: 'channel-attributes', label: 'Channel Attributes' },
    ],
  },
  {
    id: 'attribute-based-policies',
    label: 'Attribute-Based Policies',
    icon: <ShieldOutlineIcon />,
    items: [
      { id: 'membership-policies', label: 'Membership Policies' },
      { id: 'permission-policies', label: 'Permission Policies' },
    ],
  },
  {
    id: 'environment',
    label: 'Environment',
    icon: <ServerVariantIcon />,
    items: [
      { id: 'web-server', label: 'Web Server' },
      { id: 'database', label: 'Database' },
      { id: 'file-storage', label: 'File Storage' },
    ],
  },
];

export default function MembershipPolicyEditorGeneric() {
  const params =
    typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search)
      : new URLSearchParams();
  const stateParam = params.get('state') as ScreenState | null;
  const initialState: ScreenState =
    stateParam && VALID_STATES.includes(stateParam) ? stateParam : 'populated';

  const [active, setActive] = useState('membership-policies');
  const [mode, setMode] = useState<'simple' | 'advanced'>('simple');
  const [policyName, setPolicyName] = useState(
    initialState === 'empty' || initialState === 'default'
      ? ''
      : 'Clearance required',
  );
  const [requirements, setRequirements] = useState<Requirement[]>(
    initialState === 'empty'
      ? []
      : initialState === 'default'
        ? SEED_REQUIREMENTS.slice(0, 1)
        : SEED_REQUIREMENTS,
  );
  const [allRequired, setAllRequired] = useState(true);
  const [scope, setScope] = useState<'evaluable' | 'specific'>('evaluable');

  const disabled = initialState === 'disabled';
  const loading = initialState === 'loading';
  const error = initialState === 'error';

  const addRequirement = () => {
    const attr = USER_ATTRS[0];
    setRequirements((prev) => [
      ...prev,
      {
        id: `req-${Date.now()}`,
        userAttrId: attr.id,
        operatorId: OPERATORS[attr.kind][0].id,
        value: { mode: 'variable', variableId: VARIABLES[0].id },
      },
    ]);
  };

  const removeRequirement = (id: string) =>
    setRequirements((prev) => prev.filter((r) => r.id !== id));

  const patchRequirement = (id: string, next: Partial<Requirement>) =>
    setRequirements((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...next } : r)),
    );

  return (
    <div className={styles['mp']}>
      <ConsoleSidebar
        avatarSrc={avatarLeonard}
        avatarAlt="Leonard Riley"
        username="leonard.riley"
        categories={CATEGORIES}
        activeItemId={active}
        onItemClick={setActive}
      />

      <div className={styles['mp__center']}>
        <ConsolePageHeader
          title="Edit membership policy"
          backButton
          onBack={() => undefined}
        />

        <div className={styles['mp__scroll']}>
          <div
            className={[
              styles['mp__page'],
              disabled ? styles['mp__page--disabled'] : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {error && (
              <div className={styles['mp__error-banner']} role="alert">
                <span className={styles['mp__error-icon']} aria-hidden>
                  <AlertCircleOutlineIcon size={18} />
                </span>
                <div>
                  <p className={styles['mp__error-title']}>
                    Couldn’t save this policy
                  </p>
                  <p className={styles['mp__error-body']}>
                    Row 1 references “Channel: Classification”, which isn’t set
                    on some channels in scope. Resolve the highlighted row or
                    limit the scope, then try again.
                  </p>
                </div>
              </div>
            )}

            {/* Access policy name */}
            <div className={styles['mp__field']}>
              <label className={styles['mp__field-label']} htmlFor="policy-name">
                Access policy name:
              </label>
              <div className={styles['mp__field-control']}>
                <input
                  id="policy-name"
                  className={styles['mp__text-input']}
                  value={policyName}
                  disabled={disabled}
                  placeholder="Clearance required"
                  onChange={(e) => setPolicyName(e.target.value)}
                />
                <p className={styles['mp__field-help']}>
                  Give your policy a name that will be used to identify it in
                  the policies list.
                </p>
              </div>
            </div>

            {/* Who this policy applies to */}
            <section className={styles['mp__panel']}>
              <div className={styles['mp__panel-head']}>
                <div>
                  <h2 className={styles['mp__panel-title']}>
                    Who this policy applies to
                  </h2>
                  <p className={styles['mp__panel-subtitle']}>
                    Define rules based on user attributes and values
                  </p>
                </div>
                <div className={styles['mp__segmented']} role="group">
                  <button
                    type="button"
                    className={[
                      styles['mp__segmented-btn'],
                      mode === 'advanced'
                        ? styles['mp__segmented-btn--active']
                        : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    disabled={disabled}
                    onClick={() => setMode('advanced')}
                  >
                    <Icon size="12" glyph={<CodeBracketsIcon />} />
                    Advanced
                  </button>
                  <button
                    type="button"
                    className={[
                      styles['mp__segmented-btn'],
                      mode === 'simple'
                        ? styles['mp__segmented-btn--active']
                        : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    disabled={disabled}
                    onClick={() => setMode('simple')}
                  >
                    <Icon size="12" glyph={<FormatListBulletedIcon />} />
                    Simple
                  </button>
                </div>
              </div>

              <div className={styles['mp__req-block']}>
                <div className={styles['mp__req-head']}>
                  <h3 className={styles['mp__req-title']}>
                    Attribute requirements
                  </h3>
                  <AllRequiredMenu
                    value={allRequired}
                    onChange={setAllRequired}
                    disabled={disabled}
                  />
                </div>

                {loading ? (
                  <div className={styles['mp__loading']}>
                    <Spinner size={20} />
                    <span>Loading attribute requirements…</span>
                  </div>
                ) : requirements.length === 0 ? (
                  <div className={styles['mp__empty']}>
                    <p className={styles['mp__empty-title']}>
                      No attribute requirements yet
                    </p>
                    <p className={styles['mp__empty-body']}>
                      Add a requirement to control who this policy applies to.
                      Requirements compare a user attribute against a value or a
                      resource attribute.
                    </p>
                  </div>
                ) : (
                  <div className={styles['mp__req-table']}>
                    <div className={styles['mp__req-thead']}>
                      <span>User Attribute</span>
                      <span>Operator</span>
                      <span>Values or Variables</span>
                      <span aria-hidden />
                    </div>
                    {requirements.map((req, i) => (
                      <RequirementRow
                        key={req.id}
                        req={req}
                        highlighted={error && i === 0}
                        disabled={disabled}
                        onChange={(next) => patchRequirement(req.id, next)}
                        onRemove={() => removeRequirement(req.id)}
                      />
                    ))}
                  </div>
                )}

                <div className={styles['mp__req-actions']}>
                  <Button
                    emphasis="Tertiary"
                    size="Small"
                    leadingIcon={<Icon size="16" glyph={<PlusIcon />} />}
                    disabled={disabled || loading}
                    onClick={addRequirement}
                  >
                    Add attribute
                  </Button>
                </div>

                <div className={styles['mp__req-footer']}>
                  <p className={styles['mp__req-help']}>
                    Select attributes and values that users must have for this
                    policy
                  </p>
                  <TestMatchingUsers disabled={disabled || loading} />
                </div>
              </div>
            </section>

            {/* Where this policy applies */}
            <section className={styles['mp__panel']}>
              <div className={styles['mp__panel-head']}>
                <div>
                  <h2 className={styles['mp__panel-title']}>
                    Where this policy applies
                  </h2>
                  <p className={styles['mp__panel-subtitle']}>
                    Define the channels and teams where this policy will apply
                  </p>
                </div>
              </div>

              <div className={styles['mp__scope']}>
                <ScopeOption
                  selected={scope === 'evaluable'}
                  disabled={disabled}
                  onSelect={() => setScope('evaluable')}
                  title="All channels it can evaluate"
                  body="This policy applies wherever the referenced attributes are set. Channels missing a value are skipped, not blocked."
                >
                  <CoveragePreview covered={42} skipped={3} disabled={disabled} />
                </ScopeOption>

                <ScopeOption
                  selected={scope === 'specific'}
                  disabled={disabled}
                  onSelect={() => setScope('specific')}
                  title="Limit to specific channels"
                  body="Restrict this policy to a chosen set of channels — pick them manually or with an attribute-based rule."
                >
                  {scope === 'specific' && (
                    <div className={styles['mp__scope-chips']}>
                      <Chip size="Small" tone="neutral">
                        Operation Aurora
                      </Chip>
                      <Chip size="Small" tone="neutral">
                        Incident Response
                      </Chip>
                      <button
                        type="button"
                        className={styles['mp__scope-add']}
                        disabled={disabled}
                      >
                        <Icon size="12" glyph={<PlusIcon />} />
                        Add channels
                      </button>
                    </div>
                  )}
                </ScopeOption>
              </div>
            </section>
          </div>
        </div>

        <ConsoleFooter
          saveDisabled={disabled}
          onSave={() => undefined}
          onCancel={() => undefined}
        />
      </div>
    </div>
  );
}

// ─── Requirement row ────────────────────────────────────────────────────────

function RequirementRow({
  req,
  highlighted,
  disabled,
  onChange,
  onRemove,
}: {
  req: Requirement;
  highlighted: boolean;
  disabled: boolean;
  onChange: (next: Partial<Requirement>) => void;
  onRemove: () => void;
}) {
  const attr = userAttr(req.userAttrId);
  const kind = attr?.kind ?? 'ranked';
  const operators = OPERATORS[kind];
  // Variables must be type-compatible with the user attribute.
  const compatibleVariables = VARIABLES.filter((v) => v.kind === kind);
  const literals = LITERALS[req.userAttrId] ?? [];

  const rowClass = [
    styles['mp__req-row'],
    highlighted ? styles['mp__req-row--error'] : '',
  ]
    .filter(Boolean)
    .join(' ');

  const changeUserAttr = (id: string) => {
    const next = userAttr(id);
    if (!next) return;
    const nextOps = OPERATORS[next.kind];
    const nextVar = VARIABLES.find((v) => v.kind === next.kind);
    onChange({
      userAttrId: id,
      operatorId: nextOps[0].id,
      value: nextVar
        ? { mode: 'variable', variableId: nextVar.id }
        : { mode: 'literal', labels: [] },
    });
  };

  const isVariable = req.value.mode === 'variable';

  return (
    <div className={rowClass}>
      <div className={styles['mp__req-cell']}>
        <select
          className={styles['mp__req-select']}
          value={req.userAttrId}
          disabled={disabled}
          aria-label="User attribute"
          onChange={(e) => changeUserAttr(e.target.value)}
        >
          {USER_ATTRS.map((a) => (
            <option key={a.id} value={a.id}>
              {a.label}
            </option>
          ))}
        </select>
      </div>

      <div className={styles['mp__req-cell']}>
        <select
          className={styles['mp__req-select']}
          value={req.operatorId}
          disabled={disabled}
          aria-label="Operator"
          onChange={(e) => onChange({ operatorId: e.target.value })}
        >
          {operators.map((op) => (
            <option key={op.id} value={op.id}>
              {op.label}
            </option>
          ))}
        </select>
        <span className={styles['mp__req-typehint']}>{kind}</span>
      </div>

      <div className={styles['mp__req-cell']}>
        <div className={styles['mp__value-modes']}>
          <button
            type="button"
            className={[
              styles['mp__value-mode'],
              isVariable ? styles['mp__value-mode--active'] : '',
            ]
              .filter(Boolean)
              .join(' ')}
            disabled={disabled || compatibleVariables.length === 0}
            onClick={() =>
              onChange({
                value: {
                  mode: 'variable',
                  variableId:
                    compatibleVariables[0]?.id ?? VARIABLES[0].id,
                },
              })
            }
          >
            Variable
          </button>
          <button
            type="button"
            className={[
              styles['mp__value-mode'],
              !isVariable ? styles['mp__value-mode--active'] : '',
            ]
              .filter(Boolean)
              .join(' ')}
            disabled={disabled}
            onClick={() =>
              onChange({
                value: { mode: 'literal', labels: literals.slice(0, 1).map((l) => l.label) },
              })
            }
          >
            Value
          </button>
        </div>

        {isVariable ? (
          <div className={styles['mp__variable-pill']}>
            <Icon size="12" glyph={<CodeBracketsIcon />} />
            <select
              className={styles['mp__variable-select']}
              value={
                req.value.mode === 'variable' ? req.value.variableId : ''
              }
              disabled={disabled}
              aria-label="Variable value"
              onChange={(e) =>
                onChange({
                  value: { mode: 'variable', variableId: e.target.value },
                })
              }
            >
              {compatibleVariables.map((v) => (
                <option key={v.id} value={v.id}>
                  {variable(v.id)?.label}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className={styles['mp__literal-chips']}>
            {(req.value.mode === 'literal' ? req.value.labels : []).map((l) => (
              <Chip key={l} size="Small" tone="neutral">
                {l}
              </Chip>
            ))}
            <select
              className={styles['mp__literal-add']}
              value=""
              disabled={disabled}
              aria-label="Add value"
              onChange={(e) => {
                if (!e.target.value) return;
                const current =
                  req.value.mode === 'literal' ? req.value.labels : [];
                if (current.includes(e.target.value)) return;
                onChange({
                  value: {
                    mode: 'literal',
                    labels: [...current, e.target.value],
                  },
                });
              }}
            >
              <option value="">Add value…</option>
              {literals.map((l) => (
                <option key={l.id} value={l.label}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className={styles['mp__req-cell-actions']}>
        <RowMenu disabled={disabled} onRemove={onRemove} />
      </div>
    </div>
  );
}

function RowMenu({
  disabled,
  onRemove,
}: {
  disabled: boolean;
  onRemove: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useOutsideClose(ref, open, () => setOpen(false));

  return (
    <div className={styles['mp__row-menu']} ref={open ? ref : undefined}>
      <IconButton
        size="X-Small"
        aria-label="Row actions"
        aria-haspopup="menu"
        aria-expanded={open}
        disabled={disabled}
        icon={<Icon size="16" glyph={<DotsVerticalIcon />} />}
        onClick={() => setOpen((o) => !o)}
      />
      {open && (
        <div className={styles['mp__row-menu-pop']}>
          <PopoverMenu aria-label="Row actions">
            <MenuItem
              label="Remove requirement"
              destructive
              leadingVisual={<Icon size="16" glyph={<TrashCanOutlineIcon />} />}
              onClick={() => {
                setOpen(false);
                onRemove();
              }}
            />
          </PopoverMenu>
        </div>
      )}
    </div>
  );
}

function AllRequiredMenu({
  value,
  onChange,
  disabled,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
  disabled: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useOutsideClose(ref, open, () => setOpen(false));

  return (
    <div className={styles['mp__allreq']} ref={open ? ref : undefined}>
      <button
        type="button"
        className={styles['mp__allreq-trigger']}
        aria-haspopup="menu"
        aria-expanded={open}
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
      >
        {value ? 'All attributes required' : 'Any attribute matches'}
        <Icon size="12" glyph={<ChevronDownIcon />} />
      </button>
      {open && (
        <div className={styles['mp__allreq-pop']}>
          <PopoverMenu aria-label="Match mode">
            <MenuItem
              label="All attributes required"
              secondaryLabel="A user must satisfy every row"
              secondaryLabelPosition="Below"
              trailingVisual={
                value ? <Icon size="16" glyph={<CheckIcon />} /> : undefined
              }
              trailingElement={value}
              onClick={() => {
                onChange(true);
                setOpen(false);
              }}
            />
            <MenuItem
              label="Any attribute matches"
              secondaryLabel="A user must satisfy at least one row"
              secondaryLabelPosition="Below"
              trailingVisual={
                !value ? <Icon size="16" glyph={<CheckIcon />} /> : undefined
              }
              trailingElement={!value}
              onClick={() => {
                onChange(false);
                setOpen(false);
              }}
            />
          </PopoverMenu>
        </div>
      )}
    </div>
  );
}

function TestMatchingUsers({ disabled }: { disabled: boolean }) {
  const [state, setState] = useState<'idle' | 'loading' | 'done'>('idle');

  const run = () => {
    setState('loading');
    window.setTimeout(() => setState('done'), 700);
  };

  return (
    <div className={styles['mp__test']}>
      <Button
        emphasis="Tertiary"
        size="Small"
        disabled={disabled}
        leadingIcon={<Icon size="16" glyph={<MagnifyIcon />} />}
        onClick={run}
      >
        Test matching users
      </Button>
      {state === 'loading' && (
        <span className={styles['mp__test-result']}>
          <Spinner size={16} />
          Evaluating…
        </span>
      )}
      {state === 'done' && (
        <span className={styles['mp__test-result']}>
          <UserAvatarGroup
            size="24"
            avatars={[
              { key: 'aiko', src: avatarAiko, name: 'Aiko Tan' },
              { key: 'marco', src: avatarMarco, name: 'Marco Rinaldi' },
              { key: 'emma', src: avatarEmma, name: 'Emma Novak' },
              { key: 'david', src: avatarDavid, name: 'David Liang' },
            ]}
          />
          128 of 340 users match
        </span>
      )}
    </div>
  );
}

// ─── Scope ────────────────────────────────────────────────────────────────

function ScopeOption({
  selected,
  disabled,
  onSelect,
  title,
  body,
  children,
}: {
  selected: boolean;
  disabled: boolean;
  onSelect: () => void;
  title: string;
  body: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={[
        styles['mp__scope-option'],
        selected ? styles['mp__scope-option--selected'] : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <button
        type="button"
        className={styles['mp__scope-radio-row']}
        disabled={disabled}
        onClick={onSelect}
      >
        <span
          className={[
            styles['mp__scope-radio'],
            selected ? styles['mp__scope-radio--on'] : '',
          ]
            .filter(Boolean)
            .join(' ')}
          aria-hidden
        />
        <span className={styles['mp__scope-text']}>
          <span className={styles['mp__scope-title']}>{title}</span>
          <span className={styles['mp__scope-body']}>{body}</span>
        </span>
      </button>
      {selected && children != null && (
        <div className={styles['mp__scope-detail']}>{children}</div>
      )}
    </div>
  );
}

function CoveragePreview({
  covered,
  skipped,
  disabled,
}: {
  covered: number;
  skipped: number;
  disabled: boolean;
}) {
  return (
    <div className={styles['mp__coverage']}>
      <span className={styles['mp__coverage-summary']}>
        <span className={styles['mp__coverage-count']}>{covered} covered</span>
        <span aria-hidden>·</span>
        <span className={styles['mp__coverage-skipped']}>
          {skipped} skipped — no Classification value
        </span>
      </span>
      <button
        type="button"
        className={styles['mp__coverage-link']}
        disabled={disabled}
      >
        Preview coverage
      </button>
    </div>
  );
}
