import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import ArrowBackIcon from '@mattermost/compass-icons/components/arrow-back-ios';
import ArrowForwardIcon from '@mattermost/compass-icons/components/arrow-forward-ios';

import ConsoleSidebar, {
  type ConsoleSidebarCategoryData,
} from '@/components/ui/ConsoleSidebar/ConsoleSidebar';
import ConsolePageHeader from '@/components/ui/ConsolePageHeader/ConsolePageHeader';
import Button from '@/components/ui/Button/Button';
import IconButton from '@/components/ui/IconButton/IconButton';
import Icon from '@/components/ui/Icon/Icon';
import Chip from '@/components/ui/Chip/Chip';
import Spinner from '@/components/ui/Spinner/Spinner';
import Radio from '@/components/ui/Radio/Radio';
import SectionNotice from '@/components/ui/SectionNotice/SectionNotice';
import UserAvatarGroup from '@/components/ui/UserAvatarGroup/UserAvatarGroup';
import PopoverMenu from '@/components/ui/PopoverMenu/PopoverMenu';
import MenuItem from '@/components/ui/MenuItem/MenuItem';
import Scrollbars from '@/components/ui/Scrollbars/Scrollbars';
import { useOutsideClose } from '@/hooks/useOutsideClose';

import avatarLeonard from '@/assets/avatars/Leonard Riley.png';
import avatarAiko from '@/assets/avatars/Aiko Tan.png';
import avatarMarco from '@/assets/avatars/Marco Rinaldi.png';
import avatarEmma from '@/assets/avatars/Emma Novak.png';
import avatarDavid from '@/assets/avatars/David Liang.png';

import {
  OPERATORS,
  USER_ATTRS,
  CHANNEL_VARIABLES,
  LITERALS,
  SEED_REQUIREMENTS,
  SCOPE_OPTIONS,
  CHANNEL_TYPE_OPTIONS,
  SEED_CHANNEL_CONDITIONS,
  ENFORCEMENT_BY_TYPE,
  TIGHTEN_ONLY_STATEMENT,
  REEVAL_CADENCE_COPY,
  SEED_IMPACT,
  SEED_MATCH_RESULT,
  matchResultSummary,
  TERMS,
  userAttr,
  channelVar,
  compatibleVariables,
  type Requirement,
  type ScopeMode,
  type ChannelTypeFilter,
  type ChannelCondition,
  type GateState,
} from '@/pages/GlobalMembershipPolicy/gmpData';
import { GMP_ROUTES } from '@/pages/GlobalMembershipPolicy/gmpConsole';
import styles from './GlobalMembershipPolicyGuided.module.scss';

// ─── Harness state ────────────────────────────────────────────────────────────

type ScreenState = 'populated' | 'empty' | 'error';
const VALID_STATES: ScreenState[] = ['populated', 'empty', 'error'];

type StepId = 1 | 2 | 3 | 4;
const STEPS: { id: StepId; label: string }[] = [
  { id: 1, label: 'Identity' },
  { id: 2, label: 'Requirements' },
  { id: 3, label: 'Scope + Type' },
  { id: 4, label: 'Review' },
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

const AVATAR_BY_KEY: Record<string, string> = {
  aiko: avatarAiko,
  marco: avatarMarco,
  emma: avatarEmma,
  david: avatarDavid,
};

// ─── Root ───────────────────────────────────────────────────────────────────

export default function GlobalMembershipPolicyGuided() {
  const navigate = useNavigate();
  const params =
    typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search)
      : new URLSearchParams();
  const stateParam = params.get('state') as ScreenState | null;
  const screenState: ScreenState =
    stateParam && VALID_STATES.includes(stateParam) ? stateParam : 'populated';
  const stepParam = Number(params.get('step'));
  const isEmpty = screenState === 'empty';
  const isError = screenState === 'error';

  const defaultStep: StepId = isEmpty ? 1 : isError ? 4 : 3;
  const initialStep: StepId =
    stepParam >= 1 && stepParam <= 4 ? (stepParam as StepId) : defaultStep;

  const [active, setActive] = useState('membership-policies');
  const [step, setStep] = useState<StepId>(initialStep);

  // Step 1
  const [policyName, setPolicyName] = useState(isEmpty ? '' : 'Clearance required');

  // Step 2
  const [mode, setMode] = useState<'simple' | 'advanced'>('simple');
  const [requirements, setRequirements] = useState<Requirement[]>(
    isEmpty ? [] : SEED_REQUIREMENTS,
  );
  const [allRequired, setAllRequired] = useState(true);
  const [tested, setTested] = useState(false);

  // Step 3
  const [scope, setScope] = useState<ScopeMode>(
    isEmpty ? 'all-where-set' : 'all-where-set',
  );
  const [typeFilter, setTypeFilter] = useState<ChannelTypeFilter>(
    isEmpty ? 'all' : 'private',
  );
  const [conditions, setConditions] = useState<ChannelCondition[]>(
    SEED_CHANNEL_CONDITIONS,
  );
  const [manualChannels, setManualChannels] = useState<string[]>([
    'Operation Aurora',
    'Incident Response',
  ]);

  // Validation — controls non-linear jumps.
  const nameValid = policyName.trim().length > 0;
  const requirementsValid = requirements.length > 0;
  const canReachStep = (target: StepId): boolean => {
    if (target <= 1) return true;
    if (target === 2) return nameValid;
    if (target === 3) return nameValid && requirementsValid;
    return nameValid && requirementsValid; // Step 4
  };

  const goTo = (target: StepId) => {
    if (canReachStep(target)) setStep(target);
  };
  const next = () => goTo((Math.min(4, step + 1) as StepId));
  const back = () => setStep((Math.max(1, step - 1) as StepId));

  const addRequirement = () => {
    const attr = USER_ATTRS[0];
    const compat = compatibleVariables(attr.kind);
    setRequirements((prev) => [
      ...prev,
      {
        id: `req-${Date.now()}`,
        userAttrId: attr.id,
        operatorId: OPERATORS[attr.kind][0].id,
        value: compat[0]
          ? { mode: 'variable', variableId: compat[0].id }
          : { mode: 'literal', labels: [] },
      },
    ]);
  };
  const removeRequirement = (id: string) =>
    setRequirements((prev) => prev.filter((r) => r.id !== id));
  const patchRequirement = (id: string, nextReq: Partial<Requirement>) =>
    setRequirements((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...nextReq } : r)),
    );

  // Footer wiring per step.
  const primaryLabel =
    step === 4 ? 'Create policy' : step === 3 ? 'Next: Review' : 'Next';

  // Step 4 gate lives in its own component (owns computing/results/error).
  const [gateReady, setGateReady] = useState(false);

  const footerSaveDisabled = step === 4 ? !gateReady : !canReachStep((step + 1) as StepId);

  return (
    <div className={styles['gmp']}>
      <ConsoleSidebar
        avatarSrc={avatarLeonard}
        avatarAlt="Leonard Riley"
        username="leonard.riley"
        categories={CATEGORIES}
        activeItemId={active}
        onItemClick={setActive}
      />

      <div className={styles['gmp__center']}>
        <ConsolePageHeader
          title={TERMS.newTitle}
          backButton
          onBack={() => navigate(GMP_ROUTES.list)}
        />

        <div className={styles['gmp__scroll']}>
          <Scrollbars>
            <div className={styles['gmp__page']}>
              <StepRail
                current={step}
                canReach={canReachStep}
                onJump={goTo}
              />

              <div className={styles['gmp__step-region']}>
                {step === 1 && (
                  <StepPanel
                    key="step-1"
                    eyebrow="Step 1 of 4"
                    title="Identity"
                    subtitle="Name this policy so it can be identified in the policies list."
                  >
                    <IdentityStep
                      value={policyName}
                      onChange={setPolicyName}
                    />
                  </StepPanel>
                )}

                {step === 2 && (
                  <StepPanel
                    key="step-2"
                    eyebrow="Step 2 of 4"
                    title={TERMS.whoTitle}
                    subtitle={TERMS.whoSubtitle}
                  >
                    <RequirementsStep
                      mode={mode}
                      onModeChange={setMode}
                      requirements={requirements}
                      allRequired={allRequired}
                      onAllRequiredChange={setAllRequired}
                      onAdd={addRequirement}
                      onRemove={removeRequirement}
                      onPatch={patchRequirement}
                      tested={tested}
                      onTested={() => setTested(true)}
                    />
                  </StepPanel>
                )}

                {step === 3 && (
                  <StepPanel
                    key="step-3"
                    eyebrow="Step 3 of 4"
                    title={TERMS.whereTitle}
                    subtitle={TERMS.whereSubtitle}
                  >
                    <ScopeTypeStep
                      scope={scope}
                      onScopeChange={setScope}
                      typeFilter={typeFilter}
                      onTypeFilterChange={setTypeFilter}
                      conditions={conditions}
                      onConditionsChange={setConditions}
                      manualChannels={manualChannels}
                      onManualChannelsChange={setManualChannels}
                      sparse={isEmpty}
                    />
                  </StepPanel>
                )}

                {step === 4 && (
                  <StepPanel
                    key="step-4"
                    eyebrow="Step 4 of 4"
                    title="Review and create"
                    subtitle="Confirm what this policy will do before it takes effect."
                  >
                    <ReviewStep
                      policyName={policyName || '(unnamed policy)'}
                      requirements={requirements}
                      allRequired={allRequired}
                      scope={scope}
                      typeFilter={typeFilter}
                      forceError={isError}
                      onReadyChange={setGateReady}
                      onBackToScope={() => goTo(3)}
                    />
                  </StepPanel>
                )}
              </div>

              <p className={styles['gmp__tighten']}>{TIGHTEN_ONLY_STATEMENT}</p>
            </div>
          </Scrollbars>
        </div>

        <div className={styles['gmp__footer']}>
          <Button
            emphasis="Tertiary"
            leadingIcon={
              step === 1 ? undefined : <Icon size="16" glyph={<ArrowBackIcon />} />
            }
            onClick={step === 1 ? () => undefined : back}
          >
            {step === 1 ? 'Cancel' : 'Back'}
          </Button>
          <Button
            emphasis="Primary"
            destructive={step === 4 && typeFilter === 'private'}
            disabled={footerSaveDisabled}
            trailingIcon={
              step === 4 ? undefined : (
                <Icon size="16" glyph={<ArrowForwardIcon />} />
              )
            }
            onClick={step === 4 ? () => undefined : next}
          >
            {primaryLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Step rail (composed — no Stepper component in the library) ───────────────

function StepRail({
  current,
  canReach,
  onJump,
}: {
  current: StepId;
  canReach: (s: StepId) => boolean;
  onJump: (s: StepId) => void;
}) {
  return (
    <ol className={styles['gmp__rail']} aria-label="Policy setup steps">
      {STEPS.map((s, i) => {
        const isCurrent = s.id === current;
        const isComplete = s.id < current;
        const reachable = canReach(s.id);
        const circleClass = [
          styles['gmp__rail-circle'],
          isCurrent ? styles['gmp__rail-circle--current'] : '',
          isComplete ? styles['gmp__rail-circle--complete'] : '',
        ]
          .filter(Boolean)
          .join(' ');

        return (
          <li key={s.id} className={styles['gmp__rail-item']}>
            <button
              type="button"
              className={styles['gmp__rail-step']}
              aria-current={isCurrent ? 'step' : undefined}
              disabled={!reachable}
              onClick={() => onJump(s.id)}
            >
              <span className={circleClass} aria-hidden>
                {isComplete ? <Icon size="16" glyph={<CheckIcon />} /> : s.id}
              </span>
              <span
                className={[
                  styles['gmp__rail-label'],
                  isCurrent ? styles['gmp__rail-label--current'] : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                {s.label}
              </span>
            </button>
            {i < STEPS.length - 1 && (
              <span
                className={[
                  styles['gmp__rail-connector'],
                  isComplete ? styles['gmp__rail-connector--complete'] : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                aria-hidden
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}

function StepPanel({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section className={styles['gmp__panel']}>
      <header className={styles['gmp__panel-head']}>
        <span className={styles['gmp__panel-eyebrow']}>{eyebrow}</span>
        <h2 className={styles['gmp__panel-title']}>{title}</h2>
        <p className={styles['gmp__panel-subtitle']}>{subtitle}</p>
      </header>
      <div className={styles['gmp__panel-body']}>{children}</div>
    </section>
  );
}

// ─── Step 1 — Identity ────────────────────────────────────────────────────────

function IdentityStep({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className={styles['gmp__field']}>
      <label className={styles['gmp__field-label']} htmlFor="gmp-policy-name">
        {TERMS.nameLabel}
      </label>
      <input
        id="gmp-policy-name"
        className={styles['gmp__text-input']}
        value={value}
        placeholder="e.g. Clearance required"
        onChange={(e) => onChange(e.target.value)}
      />
      <p className={styles['gmp__field-help']}>{TERMS.nameHelp}</p>
    </div>
  );
}

// ─── Step 2 — Requirements ────────────────────────────────────────────────────

function RequirementsStep({
  mode,
  onModeChange,
  requirements,
  allRequired,
  onAllRequiredChange,
  onAdd,
  onRemove,
  onPatch,
  tested,
  onTested,
}: {
  mode: 'simple' | 'advanced';
  onModeChange: (m: 'simple' | 'advanced') => void;
  requirements: Requirement[];
  allRequired: boolean;
  onAllRequiredChange: (v: boolean) => void;
  onAdd: () => void;
  onRemove: (id: string) => void;
  onPatch: (id: string, next: Partial<Requirement>) => void;
  tested: boolean;
  onTested: () => void;
}) {
  return (
    <div className={styles['gmp__req-block']}>
      <div className={styles['gmp__req-head']}>
        <h3 className={styles['gmp__req-title']}>{TERMS.requirementsLabel}</h3>
        <div className={styles['gmp__segmented']} role="group" aria-label="Editor mode">
          <button
            type="button"
            className={[
              styles['gmp__segmented-btn'],
              mode === 'advanced' ? styles['gmp__segmented-btn--active'] : '',
            ]
              .filter(Boolean)
              .join(' ')}
            onClick={() => onModeChange('advanced')}
          >
            <Icon size="12" glyph={<CodeBracketsIcon />} />
            Advanced
          </button>
          <button
            type="button"
            className={[
              styles['gmp__segmented-btn'],
              mode === 'simple' ? styles['gmp__segmented-btn--active'] : '',
            ]
              .filter(Boolean)
              .join(' ')}
            onClick={() => onModeChange('simple')}
          >
            <Icon size="12" glyph={<FormatListBulletedIcon />} />
            Simple
          </button>
        </div>
      </div>

      {requirements.length === 0 ? (
        <div className={styles['gmp__empty']}>
          <p className={styles['gmp__empty-title']}>No attribute requirements yet</p>
          <p className={styles['gmp__empty-body']}>
            Add a requirement to control who this policy applies to. Requirements
            compare a user attribute against a value or a channel attribute.
          </p>
        </div>
      ) : (
        <div className={styles['gmp__req-table']}>
          <div className={styles['gmp__req-thead']}>
            <span>User Attribute</span>
            <span>Operator</span>
            <span>Values or Variables</span>
            <MatchModeMenu value={allRequired} onChange={onAllRequiredChange} />
          </div>
          {requirements.map((req) => (
            <RequirementRow
              key={req.id}
              req={req}
              onChange={(nextReq) => onPatch(req.id, nextReq)}
              onRemove={() => onRemove(req.id)}
            />
          ))}
        </div>
      )}

      <div className={styles['gmp__req-actions']}>
        <Button
          emphasis="Tertiary"
          size="Small"
          leadingIcon={<Icon size="16" glyph={<PlusIcon />} />}
          onClick={onAdd}
        >
          Add attribute
        </Button>
      </div>

      <div className={styles['gmp__req-footer']}>
        <p className={styles['gmp__req-help']}>
          Select attributes and values that users must have for this policy.
        </p>
        <TestMatchingUsers onDone={onTested} />
      </div>

      {requirements.length > 0 && !tested && (
        <p className={styles['gmp__nudge']}>
          Run <strong>Test matching users</strong> to preview who this policy will
          affect before continuing.
        </p>
      )}
    </div>
  );
}

function RequirementRow({
  req,
  onChange,
  onRemove,
}: {
  req: Requirement;
  onChange: (next: Partial<Requirement>) => void;
  onRemove: () => void;
}) {
  const attr = userAttr(req.userAttrId);
  const kind = attr?.kind ?? 'ranked';
  const operators = OPERATORS[kind];
  const compat = compatibleVariables(kind);
  const literals = LITERALS[req.userAttrId] ?? [];
  const isVariable = req.value.mode === 'variable';

  const changeUserAttr = (id: string) => {
    const nextAttr = userAttr(id);
    if (!nextAttr) return;
    const nextVar = compatibleVariables(nextAttr.kind)[0];
    onChange({
      userAttrId: id,
      operatorId: OPERATORS[nextAttr.kind][0].id,
      value: nextVar
        ? { mode: 'variable', variableId: nextVar.id }
        : { mode: 'literal', labels: [] },
    });
  };

  return (
    <div className={styles['gmp__req-row']}>
      <div className={styles['gmp__req-cell']}>
        <select
          className={styles['gmp__req-select']}
          value={req.userAttrId}
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

      <div className={styles['gmp__req-cell']}>
        <select
          className={styles['gmp__req-select']}
          value={req.operatorId}
          aria-label="Operator"
          onChange={(e) => onChange({ operatorId: e.target.value })}
        >
          {operators.map((op) => (
            <option key={op.id} value={op.id}>
              {op.label}
            </option>
          ))}
        </select>
      </div>

      <div className={styles['gmp__req-cell']}>
        <div className={styles['gmp__value-modes']}>
          <button
            type="button"
            className={[
              styles['gmp__value-mode'],
              isVariable ? styles['gmp__value-mode--active'] : '',
            ]
              .filter(Boolean)
              .join(' ')}
            disabled={compat.length === 0}
            onClick={() =>
              onChange({
                value: { mode: 'variable', variableId: compat[0]?.id ?? '' },
              })
            }
          >
            Variable
          </button>
          <button
            type="button"
            className={[
              styles['gmp__value-mode'],
              !isVariable ? styles['gmp__value-mode--active'] : '',
            ]
              .filter(Boolean)
              .join(' ')}
            onClick={() =>
              onChange({
                value: {
                  mode: 'literal',
                  labels: literals.slice(0, 1).map((l) => l.label),
                },
              })
            }
          >
            Value
          </button>
        </div>

        {isVariable ? (
          <span className={styles['gmp__variable-chip']}>
            <Icon size="12" glyph={<CodeBracketsIcon />} />
            <select
              className={styles['gmp__variable-select']}
              value={req.value.mode === 'variable' ? req.value.variableId : ''}
              aria-label="Channel attribute variable"
              onChange={(e) =>
                onChange({ value: { mode: 'variable', variableId: e.target.value } })
              }
            >
              {compat.map((v) => (
                <option key={v.id} value={v.id}>
                  {channelVar(v.id)?.label}
                </option>
              ))}
            </select>
          </span>
        ) : (
          <div className={styles['gmp__literal-chips']}>
            {(req.value.mode === 'literal' ? req.value.labels : []).map((l) => (
              <Chip key={l} size="Small" tone="neutral">
                {l}
              </Chip>
            ))}
            <select
              className={styles['gmp__literal-add']}
              value=""
              aria-label="Add value"
              onChange={(e) => {
                if (!e.target.value) return;
                const current =
                  req.value.mode === 'literal' ? req.value.labels : [];
                if (current.includes(e.target.value)) return;
                onChange({
                  value: { mode: 'literal', labels: [...current, e.target.value] },
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

      <div className={styles['gmp__req-cell-actions']}>
        <RowMenu onRemove={onRemove} />
      </div>
    </div>
  );
}

function RowMenu({ onRemove }: { onRemove: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useOutsideClose(ref, open, () => setOpen(false));

  return (
    <div className={styles['gmp__row-menu']} ref={open ? ref : undefined}>
      <IconButton
        size="X-Small"
        aria-label="Row actions"
        aria-haspopup="menu"
        aria-expanded={open}
        icon={<Icon size="16" glyph={<DotsVerticalIcon />} />}
        onClick={() => setOpen((o) => !o)}
      />
      {open && (
        <div className={styles['gmp__row-menu-pop']}>
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

function MatchModeMenu({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useOutsideClose(ref, open, () => setOpen(false));

  return (
    <div className={styles['gmp__matchmode']} ref={open ? ref : undefined}>
      <button
        type="button"
        className={styles['gmp__matchmode-trigger']}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        {value ? TERMS.allRequired : TERMS.anyMatch}
        <Icon size="12" glyph={<ChevronDownIcon />} />
      </button>
      {open && (
        <div className={styles['gmp__matchmode-pop']}>
          <PopoverMenu aria-label="Match mode">
            <MenuItem
              label={TERMS.allRequired}
              secondaryLabel="A user must satisfy every row"
              secondaryLabelPosition="Below"
              trailingVisual={
                value ? <Icon size="16" glyph={<CheckIcon />} /> : undefined
              }
              onClick={() => {
                onChange(true);
                setOpen(false);
              }}
            />
            <MenuItem
              label={TERMS.anyMatch}
              secondaryLabel="A user must satisfy at least one row"
              secondaryLabelPosition="Below"
              trailingVisual={
                !value ? <Icon size="16" glyph={<CheckIcon />} /> : undefined
              }
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

function TestMatchingUsers({ onDone }: { onDone: () => void }) {
  const [state, setState] = useState<'idle' | 'loading' | 'done'>('idle');

  const run = () => {
    setState('loading');
    window.setTimeout(() => {
      setState('done');
      onDone();
    }, 700);
  };

  return (
    <div className={styles['gmp__test']}>
      <Button
        emphasis="Tertiary"
        size="Small"
        leadingIcon={<Icon size="16" glyph={<MagnifyIcon />} />}
        onClick={run}
      >
        {TERMS.testUsers}
      </Button>
      {state === 'loading' && (
        <span className={styles['gmp__test-result']}>
          <Spinner size={16} />
          Evaluating…
        </span>
      )}
      {state === 'done' && (
        <div className={styles['gmp__test-done']}>
          <span className={styles['gmp__test-result']}>
            <UserAvatarGroup
              size="24"
              avatars={SEED_MATCH_RESULT.sample.map((s) => ({
                key: s.key,
                src: AVATAR_BY_KEY[s.key],
                name: s.name,
              }))}
            />
            {matchResultSummary(SEED_MATCH_RESULT)}
          </span>
          <span className={styles['gmp__test-skipped']}>
            {SEED_MATCH_RESULT.excludedMissingAttr} channels skipped — attribute not
            set
          </span>
        </div>
      )}
    </div>
  );
}

// ─── Step 3 — Scope + Type ────────────────────────────────────────────────────

function ScopeTypeStep({
  scope,
  onScopeChange,
  typeFilter,
  onTypeFilterChange,
  conditions,
  onConditionsChange,
  manualChannels,
  onManualChannelsChange,
  sparse,
}: {
  scope: ScopeMode;
  onScopeChange: (m: ScopeMode) => void;
  typeFilter: ChannelTypeFilter;
  onTypeFilterChange: (t: ChannelTypeFilter) => void;
  conditions: ChannelCondition[];
  onConditionsChange: (c: ChannelCondition[]) => void;
  manualChannels: string[];
  onManualChannelsChange: (c: string[]) => void;
  sparse: boolean;
}) {
  return (
    <div className={styles['gmp__scope']}>
      {SCOPE_OPTIONS.map((opt) => {
        const selected = scope === opt.id;
        return (
          <div
            key={opt.id}
            className={[
              styles['gmp__scope-option'],
              selected ? styles['gmp__scope-option--selected'] : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <Radio
              name="gmp-scope"
              checked={selected}
              onChange={() => onScopeChange(opt.id)}
            >
              <span className={styles['gmp__scope-text']}>
                <span className={styles['gmp__scope-title']}>{opt.title}</span>
                <span className={styles['gmp__scope-body']}>{opt.body}</span>
              </span>
            </Radio>

            {selected && opt.id === 'all-where-set' && (
              <div className={styles['gmp__scope-detail']}>
                <TypeFilterGuardrail
                  value={typeFilter}
                  onChange={onTypeFilterChange}
                />
                {sparse && (
                  <SectionNotice
                    type="Hint"
                    title="No channels have these attributes set yet"
                    description="This policy will apply automatically as channels get the referenced attributes assigned. It is valid to save now — it simply covers zero channels today."
                  />
                )}
              </div>
            )}

            {selected && opt.id === 'attribute-rules' && (
              <div className={styles['gmp__scope-detail']}>
                <ChannelConditionTable
                  conditions={conditions}
                  onChange={onConditionsChange}
                />
              </div>
            )}

            {selected && opt.id === 'manual' && (
              <div className={styles['gmp__scope-detail']}>
                <div className={styles['gmp__manual-chips']}>
                  {manualChannels.map((c) => (
                    <Chip
                      key={c}
                      size="Small"
                      tone="neutral"
                      onRemove={() =>
                        onManualChannelsChange(
                          manualChannels.filter((x) => x !== c),
                        )
                      }
                    >
                      {c}
                    </Chip>
                  ))}
                  <button type="button" className={styles['gmp__manual-add']}>
                    <Icon size="12" glyph={<PlusIcon />} />
                    Add channels
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function TypeFilterGuardrail({
  value,
  onChange,
}: {
  value: ChannelTypeFilter;
  onChange: (t: ChannelTypeFilter) => void;
}) {
  return (
    <div className={styles['gmp__typefilter']}>
      <h4 className={styles['gmp__typefilter-title']}>Which channel types?</h4>
      <p className={styles['gmp__typefilter-help']}>
        Enforcement is derived from the channel type — you don’t choose it per
        policy.
      </p>

      <div className={styles['gmp__typefilter-options']} role="radiogroup">
        {CHANNEL_TYPE_OPTIONS.map((opt) => (
          <Radio
            key={opt.id}
            name="gmp-type-filter"
            checked={value === opt.id}
            onChange={() => onChange(opt.id)}
          >
            {opt.label}
          </Radio>
        ))}
      </div>

      <div className={styles['gmp__enforce-grid']}>
        <div className={styles['gmp__enforce-row']}>
          <span className={styles['gmp__enforce-tag']}>Public</span>
          <span className={styles['gmp__enforce-copy']}>
            {ENFORCEMENT_BY_TYPE.public.detail}
          </span>
        </div>
        <div className={styles['gmp__enforce-row']}>
          <span
            className={[
              styles['gmp__enforce-tag'],
              styles['gmp__enforce-tag--danger'],
            ].join(' ')}
          >
            Private
          </span>
          <span className={styles['gmp__enforce-copy']}>
            {ENFORCEMENT_BY_TYPE.private.detail}
          </span>
        </div>
      </div>

      {value === 'private' && (
        <SectionNotice
          type="Danger"
          title="Private only — non-matching members will be removed"
          description="Members who don’t match this policy will be REMOVED from the private channels in scope. This is a destructive action. Review the impact on the next step before creating the policy."
        />
      )}

      <p className={styles['gmp__reeval']}>{REEVAL_CADENCE_COPY}</p>
    </div>
  );
}

function ChannelConditionTable({
  conditions,
  onChange,
}: {
  conditions: ChannelCondition[];
  onChange: (c: ChannelCondition[]) => void;
}) {
  const add = () => {
    const v = CHANNEL_VARIABLES[0];
    onChange([
      ...conditions,
      {
        id: `cc-${Date.now()}`,
        channelAttrId: v.id,
        operatorId: OPERATORS[v.kind][0].id,
        labels: [],
      },
    ]);
  };
  const remove = (id: string) =>
    onChange(conditions.filter((c) => c.id !== id));

  return (
    <div className={styles['gmp__cond-block']}>
      <h4 className={styles['gmp__cond-title']}>Channel attribute requirements</h4>
      <div className={styles['gmp__req-table']}>
        <div className={styles['gmp__req-thead']}>
          <span>Attribute</span>
          <span>Operator</span>
          <span>Values</span>
          <span aria-hidden />
        </div>
        {conditions.map((c) => {
          const cv = channelVar(c.channelAttrId);
          const kind = cv?.kind ?? 'select';
          return (
            <div key={c.id} className={styles['gmp__req-row']}>
              <div className={styles['gmp__req-cell']}>
                <select
                  className={styles['gmp__req-select']}
                  value={c.channelAttrId}
                  aria-label="Channel attribute"
                  onChange={(e) =>
                    onChange(
                      conditions.map((x) =>
                        x.id === c.id
                          ? { ...x, channelAttrId: e.target.value }
                          : x,
                      ),
                    )
                  }
                >
                  {CHANNEL_VARIABLES.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.label.replace('Channel: ', '')}
                    </option>
                  ))}
                </select>
              </div>
              <div className={styles['gmp__req-cell']}>
                <select
                  className={styles['gmp__req-select']}
                  value={c.operatorId}
                  aria-label="Operator"
                  onChange={(e) =>
                    onChange(
                      conditions.map((x) =>
                        x.id === c.id
                          ? { ...x, operatorId: e.target.value }
                          : x,
                      ),
                    )
                  }
                >
                  {OPERATORS[kind].map((op) => (
                    <option key={op.id} value={op.id}>
                      {op.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className={styles['gmp__req-cell']}>
                <span className={styles['gmp__cond-value']}>
                  {c.labels.length > 0 ? c.labels.join(', ') : 'Dragon Spacecraft'}
                </span>
              </div>
              <div className={styles['gmp__req-cell-actions']}>
                <IconButton
                  size="X-Small"
                  destructive
                  aria-label="Remove condition"
                  icon={<Icon size="16" glyph={<TrashCanOutlineIcon />} />}
                  onClick={() => remove(c.id)}
                />
              </div>
            </div>
          );
        })}
      </div>
      <div className={styles['gmp__req-actions']}>
        <Button
          emphasis="Tertiary"
          size="Small"
          leadingIcon={<Icon size="16" glyph={<PlusIcon />} />}
          onClick={add}
        >
          Add attribute
        </Button>
      </div>
    </div>
  );
}

// ─── Step 4 — Review (the always-confirm gate) ────────────────────────────────

function ReviewStep({
  policyName,
  requirements,
  allRequired,
  scope,
  typeFilter,
  forceError,
  onReadyChange,
  onBackToScope,
}: {
  policyName: string;
  requirements: Requirement[];
  allRequired: boolean;
  scope: ScopeMode;
  typeFilter: ChannelTypeFilter;
  forceError: boolean;
  onReadyChange: (ready: boolean) => void;
  onBackToScope: () => void;
}) {
  const [gate, setGate] = useState<GateState>('computing');

  const runCompute = () => {
    setGate('computing');
    onReadyChange(false);
    window.setTimeout(() => {
      const nextGate: GateState = forceError ? 'error' : 'results';
      setGate(nextGate);
      onReadyChange(nextGate === 'results');
    }, 900);
  };

  useEffect(() => {
    runCompute();
    return () => onReadyChange(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const scopeLabel = useMemo(
    () => SCOPE_OPTIONS.find((s) => s.id === scope)?.title ?? '',
    [scope],
  );
  const typeLabel = useMemo(
    () => CHANNEL_TYPE_OPTIONS.find((t) => t.id === typeFilter)?.label ?? '',
    [typeFilter],
  );

  return (
    <div className={styles['gmp__review']}>
      <div className={styles['gmp__readback']}>
        <ReadbackRow label="Policy name" value={policyName} />
        <ReadbackRow
          label="Match mode"
          value={allRequired ? TERMS.allRequired : TERMS.anyMatch}
        />
        <div className={styles['gmp__readback-row']}>
          <span className={styles['gmp__readback-label']}>Requirements</span>
          <div className={styles['gmp__readback-reqs']}>
            {requirements.length === 0 ? (
              <span className={styles['gmp__readback-empty']}>None</span>
            ) : (
              requirements.map((r) => (
                <RequirementSummary key={r.id} req={r} />
              ))
            )}
          </div>
        </div>
        <ReadbackRow
          label="Applies to"
          value={
            scope === 'all-where-set' ? `${scopeLabel} · ${typeLabel}` : scopeLabel
          }
        />
      </div>

      {gate === 'computing' && (
        <div className={styles['gmp__gate-loading']}>
          <Spinner size={28} />
          <p className={styles['gmp__gate-loading-text']}>Calculating impact…</p>
        </div>
      )}

      {gate === 'error' && (
        <SectionNotice
          type="Danger"
          title="We couldn’t calculate the impact"
          description="The impact preview failed to load. The policy has not been created. Retry to recompute before confirming."
          primaryButtonLabel="Retry"
          onPrimaryAction={runCompute}
        />
      )}

      {gate === 'results' && (
        <ImpactResults typeFilter={typeFilter} onBackToScope={onBackToScope} />
      )}
    </div>
  );
}

function ReadbackRow({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles['gmp__readback-row']}>
      <span className={styles['gmp__readback-label']}>{label}</span>
      <span className={styles['gmp__readback-value']}>{value}</span>
    </div>
  );
}

function RequirementSummary({ req }: { req: Requirement }) {
  const attr = userAttr(req.userAttrId);
  const op = attr ? OPERATORS[attr.kind].find((o) => o.id === req.operatorId) : undefined;
  return (
    <span className={styles['gmp__req-summary']}>
      <span className={styles['gmp__req-summary-attr']}>{attr?.label}</span>
      <span className={styles['gmp__req-summary-op']}>{op?.label}</span>
      {req.value.mode === 'variable' ? (
        <span className={styles['gmp__variable-chip']}>
          <Icon size="12" glyph={<CodeBracketsIcon />} />
          {channelVar(req.value.variableId)?.label}
        </span>
      ) : (
        <span className={styles['gmp__req-summary-literal']}>
          {req.value.labels.join(', ') || '—'}
        </span>
      )}
    </span>
  );
}

function ImpactResults({
  typeFilter,
  onBackToScope,
}: {
  typeFilter: ChannelTypeFilter;
  onBackToScope: () => void;
}) {
  const showPublic = typeFilter !== 'private';
  const showPrivate = typeFilter !== 'public';

  return (
    <div className={styles['gmp__impact']}>
      <h3 className={styles['gmp__impact-title']}>Impact of this policy</h3>
      <p className={styles['gmp__impact-scope']}>
        {SEED_IMPACT.channelsInScope} channels in scope —{' '}
        {SEED_IMPACT.publicChannels} public, {SEED_IMPACT.privateChannels} private.
      </p>

      <div className={styles['gmp__impact-cards']}>
        {showPublic && (
          <div className={styles['gmp__impact-card']}>
            <span className={styles['gmp__impact-card-head']}>
              Public channels — non-destructive
            </span>
            <span className={styles['gmp__impact-card-metric']}>
              {SEED_IMPACT.usersDeRecommended} users
            </span>
            <span className={styles['gmp__impact-card-copy']}>
              removed from recommendations on {SEED_IMPACT.publicChannels} public
              channels. They keep access and can still join.
            </span>
          </div>
        )}

        {showPrivate && (
          <div
            className={[
              styles['gmp__impact-card'],
              styles['gmp__impact-card--danger'],
            ].join(' ')}
          >
            <span className={styles['gmp__impact-card-head']}>
              Private channels — destructive
            </span>
            <span className={styles['gmp__impact-card-metric']}>
              {SEED_IMPACT.usersRemoved} members removed
            </span>
            <span className={styles['gmp__impact-card-copy']}>
              from {SEED_IMPACT.privateChannels} private channels. These members
              lose access to channel history and content.
            </span>
          </div>
        )}
      </div>

      <p className={styles['gmp__impact-skipped']}>
        {SEED_IMPACT.skippedMissingAttr} channels were not evaluated — a referenced
        attribute is not set on them.
      </p>

      <p className={styles['gmp__impact-tighten']}>{TIGHTEN_ONLY_STATEMENT}</p>
      <p className={styles['gmp__reeval']}>{REEVAL_CADENCE_COPY}</p>

      <button
        type="button"
        className={styles['gmp__impact-back']}
        onClick={onBackToScope}
      >
        <Icon size="12" glyph={<ArrowBackIcon />} />
        Adjust scope
      </button>
    </div>
  );
}
