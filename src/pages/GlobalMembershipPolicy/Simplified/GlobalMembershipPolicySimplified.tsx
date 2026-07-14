import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FormatListBulletedIcon from '@mattermost/compass-icons/components/format-list-bulleted';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import ChevronDownIcon from '@mattermost/compass-icons/components/chevron-down';
import DotsVerticalIcon from '@mattermost/compass-icons/components/dots-vertical';
import TrashCanOutlineIcon from '@mattermost/compass-icons/components/trash-can-outline';
import MagnifyIcon from '@mattermost/compass-icons/components/magnify';
import CheckAllIcon from '@mattermost/compass-icons/components/check-all';
import CheckCircleOutlineIcon from '@mattermost/compass-icons/components/check-circle-outline';
import AlertCircleOutlineIcon from '@mattermost/compass-icons/components/alert-circle-outline';
import AlertOutlineIcon from '@mattermost/compass-icons/components/alert-outline';
import InformationOutlineIcon from '@mattermost/compass-icons/components/information-outline';
import LockOutlineIcon from '@mattermost/compass-icons/components/lock-outline';
import FilterVariantIcon from '@mattermost/compass-icons/components/filter-variant';

import ConsoleSidebar from '@/components/ui/ConsoleSidebar/ConsoleSidebar';
import ConsolePageHeader from '@/components/ui/ConsolePageHeader/ConsolePageHeader';
import ConsoleFooter from '@/components/ui/ConsoleFooter/ConsoleFooter';
import Button from '@/components/ui/Button/Button';
import IconButton from '@/components/ui/IconButton/IconButton';
import Icon from '@/components/ui/Icon/Icon';
import Radio from '@/components/ui/Radio/Radio';
import Switch from '@/components/ui/Switch/Switch';
import SearchInput from '@/components/ui/SearchInput/SearchInput';
import Modal from '@/components/ui/Modal/Modal';
import SectionNotice from '@/components/ui/SectionNotice/SectionNotice';
import Spinner from '@/components/ui/Spinner/Spinner';
import PopoverMenu from '@/components/ui/PopoverMenu/PopoverMenu';
import MenuItem from '@/components/ui/MenuItem/MenuItem';
import { useOutsideClose } from '@/hooks/useOutsideClose';

import avatarLeonard from '@/assets/avatars/Leonard Riley.png';

import {
  OPERATORS,
  USER_ATTRS,
  SEED_REQUIREMENTS,
  SIMPLIFIED_SCOPE_OPTIONS,
  MANUAL_CHANNELS,
  TIGHTEN_ONLY_STATEMENT,
  REEVAL_CADENCE_COPY,
  SEED_IMPACT,
  TERMS,
  policyById,
  policyEditorPreset,
  POLICY_EDITOR_PRESETS,
  userAttr,
  allChannelsBlockingVars,
  type Requirement,
  type SimplifiedScopeMode,
  type GateState,
  type ManualChannel,
  type ReqValue,
} from '@/pages/GlobalMembershipPolicy/gmpData';
import {
  GMP_ROUTES,
  GMP_SIDEBAR_CATEGORIES,
} from '@/pages/GlobalMembershipPolicy/gmpConsole';

import SimplifiedValuePicker from './SimplifiedValuePicker';
import SimplifiedTestMatchingModal, {
  type SimplifiedTestView,
} from './TestMatchingModal/SimplifiedTestMatchingModal';
import styles from './GlobalMembershipPolicySimplified.module.scss';

type ScreenState = 'populated' | 'empty' | 'error';
const VALID_STATES: ScreenState[] = ['populated', 'empty', 'error'];
const VALID_SCOPES: SimplifiedScopeMode[] = ['all', 'manual'];
const VALID_TEST_VIEWS: SimplifiedTestView[] = ['list', 'channel'];

/** Operators whose value is a multi-literal set. */
const MULTI_OPERATORS = new Set(['is-one-of', 'includes-any']);

const CATEGORIES = GMP_SIDEBAR_CATEGORIES;

function initialPolicyName(
  policyParam: string | null,
  isEmpty: boolean,
): string {
  if (isEmpty) {
    return '';
  }
  if (policyParam === 'new' || policyParam == null) {
    return 'Clearance required';
  }
  return policyById(policyParam)?.name ?? 'Clearance required';
}

export default function GlobalMembershipPolicySimplified() {
  const navigate = useNavigate();
  const params =
    typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search)
      : new URLSearchParams();
  const stateParam = params.get('state') as ScreenState | null;
  const initialState: ScreenState =
    stateParam && VALID_STATES.includes(stateParam) ? stateParam : 'populated';
  const scopeParam = params.get('scope');
  const policyParam = params.get('policy');
  const scopeFromUrl: SimplifiedScopeMode | null = VALID_SCOPES.includes(
    scopeParam as SimplifiedScopeMode,
  )
    ? (scopeParam as SimplifiedScopeMode)
    : null;
  // Deep-link the Test-matching modal for review: ?test=list | ?test=channel.
  const testParam = params.get('test');
  const initialTestView: SimplifiedTestView | null = VALID_TEST_VIEWS.includes(
    testParam as SimplifiedTestView,
  )
    ? (testParam as SimplifiedTestView)
    : null;

  const isEmpty = initialState === 'empty';
  const isError = initialState === 'error';

  const knownPolicyId =
    !isEmpty &&
    policyParam != null &&
    policyParam !== 'new' &&
    policyParam in POLICY_EDITOR_PRESETS
      ? policyParam
      : null;

  const editorPreset =
    knownPolicyId != null ? policyEditorPreset(knownPolicyId) : null;

  const seedRequirements = isEmpty
    ? []
    : (editorPreset?.requirements ?? SEED_REQUIREMENTS);

  const [active, setActive] = useState('membership-policies');
  const [policyName, setPolicyName] = useState(
    initialPolicyName(policyParam, isEmpty),
  );
  const [requirements, setRequirements] = useState<Requirement[]>(
    isEmpty ? [] : seedRequirements,
  );
  const [allRequired, setAllRequired] = useState(true);
  // Simplified scope (2.2): only "all" | "manual". A referenced channel attr
  // defaults to "all"; a literal-only policy defaults to "manual". URL wins.
  const initialReferencesChannelAttr = (isEmpty ? [] : seedRequirements).some(
    (r) => r.value.mode === 'variable',
  );
  const [scope, setScope] = useState<SimplifiedScopeMode>(() => {
    const preferred =
      scopeFromUrl ?? (initialReferencesChannelAttr ? 'all' : 'manual');
    const blocked = allChannelsBlockingVars(
      isEmpty ? [] : seedRequirements,
    ).length > 0;
    return preferred === 'all' && blocked ? 'manual' : preferred;
  });
  const [manualChannels, setManualChannels] = useState<ManualChannel[]>(
    isEmpty ? [] : (editorPreset?.manualChannels ?? MANUAL_CHANNELS),
  );
  const [gateOpen, setGateOpen] = useState(false);
  // Test-matching modal: open on load if deep-linked, else on button click.
  const [testView, setTestView] = useState<SimplifiedTestView | null>(
    initialTestView,
  );

  // ── All-channels scope guardrail (Simplification 2.3) ─────────────────────
  // Referencing a channel variable that is NOT marked required-for-channels
  // disables "All channels" (fail-secure mass-removal risk). Literal-only
  // requirements never trigger it.
  const blockingVars = allChannelsBlockingVars(requirements);
  const allChannelsDisabled = blockingVars.length > 0;

  useEffect(() => {
    if (allChannelsDisabled && scope === 'all') {
      setScope('manual');
    }
  }, [allChannelsDisabled, scope]);

  const addRequirement = () => {
    const attr = USER_ATTRS[0];
    setRequirements((prev) => [
      ...prev,
      {
        id: `req-${Date.now()}`,
        userAttrId: attr.id,
        operatorId: OPERATORS[attr.kind][0].id,
        value: { mode: 'literal', labels: [] },
      },
    ]);
  };
  const removeRequirement = (id: string) =>
    setRequirements((prev) => prev.filter((r) => r.id !== id));
  const patchRequirement = (id: string, next: Partial<Requirement>) =>
    setRequirements((prev) => prev.map((r) => (r.id === id ? { ...r, ...next } : r)));

  const toggleChannelAutoAdd = (id: string) =>
    setManualChannels((prev) =>
      prev.map((c) => (c.id === id ? { ...c, autoAdd: !c.autoAdd } : c)),
    );
  const removeManualChannel = (id: string) =>
    setManualChannels((prev) => prev.filter((c) => c.id !== id));

  const goToList = () => navigate(GMP_ROUTES.list);

  const handleSidebarClick = (itemId: string) => {
    setActive(itemId);
    if (itemId === 'membership-policies') {
      goToList();
    }
  };

  const blockingNames = blockingVars.map((v) => v.label).join(', ');
  const allChannelsBlockedTitle =
    'Why can’t this policy be applied to all channels?';
  const allChannelsBlockedDescription =
    blockingVars.length === 1
      ? `This policy uses ${blockingNames}, but not every channel has that value. Applying it to all channels could remove members from channels where it’s missing. Mark ${blockingNames} as required for channels, or choose specific channels below.`
      : `This policy uses ${blockingNames}, but not every channel has those values. Applying it to all channels could remove members from channels where they’re missing. Mark them as required for channels, or choose specific channels below.`;

  return (
    <div className={styles['gmp']}>
      <ConsoleSidebar
        avatarSrc={avatarLeonard}
        avatarAlt="Leonard Riley"
        username="leonard.riley"
        categories={CATEGORIES}
        activeItemId={active}
        onItemClick={handleSidebarClick}
      />

      <div className={styles['gmp__center']}>
        <ConsolePageHeader
          title={
            policyParam === 'new' || policyParam == null
              ? TERMS.newTitle
              : TERMS.editorTitle
          }
          backButton
          onBack={goToList}
        />

        <div className={styles['gmp__scroll']}>
          <div className={styles['gmp__page']}>
            {isError && (
              <SectionNotice
                type="Danger"
                title="Couldn’t save this policy"
                description="A requirement references a channel attribute, but some channels in scope don’t have it set. Fix the highlighted row or narrow the scope, then try again."
              />
            )}

            {/* Membership policy name */}
            <div className={styles['gmp__field']}>
              <label className={styles['gmp__field-label']} htmlFor="policy-name">
                {TERMS.nameLabel}
              </label>
              <div className={styles['gmp__field-control']}>
                <input
                  id="policy-name"
                  className={styles['gmp__text-input']}
                  value={policyName}
                  placeholder="Clearance required"
                  onChange={(e) => setPolicyName(e.target.value)}
                />
                <p className={styles['gmp__field-help']}>{TERMS.nameHelp}</p>
              </div>
            </div>

            {/* Section 1 — Membership requirements */}
            <section className={styles['gmp__panel']}>
              <div className={styles['gmp__panel-head']}>
                <div>
                  <h2 className={styles['gmp__panel-title']}>{TERMS.whoTitle}</h2>
                  <p className={styles['gmp__panel-subtitle']}>
                    {TERMS.whoSubtitle}.
                  </p>
                </div>
              </div>

              <div className={styles['gmp__req-block']}>
                {requirements.length === 0 ? (
                  <div className={styles['gmp__empty']}>
                    <p className={styles['gmp__empty-title']}>
                      No attribute requirements yet.
                    </p>
                    <p className={styles['gmp__empty-body']}>
                      Add a requirement to define who this policy applies to.
                    </p>
                    <div className={styles['gmp__empty-action']}>
                      <Button
                        emphasis="Tertiary"
                        size="Small"
                        leadingIcon={<Icon size="16" glyph={<PlusIcon />} />}
                        onClick={addRequirement}
                      >
                        Add attribute
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className={styles['gmp__req-table']}>
                    <div className={styles['gmp__req-thead']}>
                      <span>User Attribute</span>
                      <span>Operator</span>
                      <span>Value</span>
                      <div className={styles['gmp__thead-trailing']}>
                        <AllRequiredMenu
                          value={allRequired}
                          onChange={setAllRequired}
                        />
                      </div>
                    </div>
                    {requirements.map((req, i) => (
                      <RequirementRow
                        key={req.id}
                        req={req}
                        highlighted={isError && i === 0}
                        onChange={(next) => patchRequirement(req.id, next)}
                        onRemove={() => removeRequirement(req.id)}
                      />
                    ))}
                    <div className={styles['gmp__req-add-row']}>
                      <Button
                        emphasis="Tertiary"
                        size="Small"
                        leadingIcon={<Icon size="16" glyph={<PlusIcon />} />}
                        onClick={addRequirement}
                      >
                        Add attribute
                      </Button>
                    </div>
                  </div>
                )}

                <div className={styles['gmp__req-footer']}>
                  <p className={styles['gmp__req-help']}>
                    Select the attributes users must have.
                  </p>
                  {/* Opens the single-mode "Test matching users" modal (Part B). */}
                  <div className={styles['gmp__test']}>
                    <Button
                      emphasis="Tertiary"
                      size="Small"
                      leadingIcon={<Icon size="16" glyph={<MagnifyIcon />} />}
                      onClick={() => setTestView('list')}
                    >
                      {TERMS.testUsers}
                    </Button>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 2 — Where this policy applies (TWO radios only) */}
            <section className={styles['gmp__panel']}>
              <div className={styles['gmp__panel-head']}>
                <div>
                  <h2 className={styles['gmp__panel-title']}>{TERMS.whereTitle}</h2>
                  <p className={styles['gmp__panel-subtitle']}>
                    {TERMS.whereSubtitle}.
                  </p>
                </div>
              </div>

              <div className={styles['gmp__where']}>
                <div className={styles['gmp__scope']}>
                  {SIMPLIFIED_SCOPE_OPTIONS.map((opt) => {
                    const selected = scope === opt.id;
                    const isAllOption = opt.id === 'all';
                    const disabled = isAllOption && allChannelsDisabled;
                    return (
                      <div
                        key={opt.id}
                        className={[
                          styles['gmp__scope-option'],
                          selected ? styles['gmp__scope-option--selected'] : '',
                          disabled ? styles['gmp__scope-option--disabled'] : '',
                        ]
                          .filter(Boolean)
                          .join(' ')}
                      >
                        <Radio
                          name="gmp-scope"
                          checked={selected}
                          disabled={disabled}
                          onChange={() => {
                            if (!disabled) setScope(opt.id);
                          }}
                        >
                          <span className={styles['gmp__scope-title']}>
                            {opt.title}
                          </span>
                        </Radio>
                        {disabled ? (
                          <div className={styles['gmp__scope-notice']}>
                            <SectionNotice
                              type="Danger"
                              title={allChannelsBlockedTitle}
                              description={allChannelsBlockedDescription}
                            />
                          </div>
                        ) : (
                          <p className={styles['gmp__scope-help']}>{opt.body}</p>
                        )}

                        {selected && opt.id === 'manual' && (
                          <div className={styles['gmp__scope-detail']}>
                            <ManualChannelTable
                              channels={manualChannels}
                              onToggleAutoAdd={toggleChannelAutoAdd}
                              onRemove={removeManualChannel}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Persistent composition + timing strip above the footer */}
        <div className={styles['gmp__timing']}>
          <span className={styles['gmp__timing-icon']} aria-hidden>
            <Icon size="16" glyph={<InformationOutlineIcon />} />
          </span>
          <div className={styles['gmp__timing-lines']}>
            <p className={styles['gmp__timing-line']}>
              <span className={styles['gmp__timing-label']}>
                How this combines:
              </span>{' '}
              {TIGHTEN_ONLY_STATEMENT}
            </p>
            <p className={styles['gmp__timing-line']}>
              <span className={styles['gmp__timing-label']}>
                When it takes effect:
              </span>{' '}
              {REEVAL_CADENCE_COPY}
            </p>
          </div>
        </div>

        <ConsoleFooter
          onSave={() => setGateOpen(true)}
          onCancel={goToList}
        />
      </div>

      {gateOpen && (
        <ImpactGate onClose={() => setGateOpen(false)} startError={isError} />
      )}

      {testView != null && (
        <SimplifiedTestMatchingModal
          policyName={policyName || 'Clearance required'}
          initialView={testView}
          onClose={() => setTestView(null)}
        />
      )}
    </div>
  );
}

// ─── Requirement row (who-block) — schema-paired Value picker ────────────────

function RequirementRow({
  req,
  highlighted,
  onChange,
  onRemove,
}: {
  req: Requirement;
  highlighted: boolean;
  onChange: (next: Partial<Requirement>) => void;
  onRemove: () => void;
}) {
  const attr = userAttr(req.userAttrId);
  const kind = attr?.kind ?? 'ranked';
  const operators = OPERATORS[kind];
  const multi = MULTI_OPERATORS.has(req.operatorId);

  const rowClass = [
    styles['gmp__req-row'],
    highlighted ? styles['gmp__req-row--error'] : '',
  ]
    .filter(Boolean)
    .join(' ');

  const changeUserAttr = (id: string) => {
    const next = userAttr(id);
    if (!next) return;
    onChange({
      userAttrId: id,
      operatorId: OPERATORS[next.kind][0].id,
      value: { mode: 'literal', labels: [] },
    });
  };

  const changeOperator = (operatorId: string) => {
    const nextMulti = MULTI_OPERATORS.has(operatorId);
    let value: ReqValue = req.value;
    if (!nextMulti && req.value.mode === 'literal' && req.value.labels.length > 1) {
      value = { mode: 'literal', labels: req.value.labels.slice(0, 1) };
    }
    onChange({ operatorId, value });
  };

  return (
    <div className={rowClass}>
      <div className={styles['gmp__req-cell']}>
        <span className={styles['gmp__attr-icon']} aria-hidden>
          <Icon size="16" glyph={<FormatListBulletedIcon />} />
        </span>
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
          onChange={(e) => changeOperator(e.target.value)}
        >
          {operators.map((op) => (
            <option key={op.id} value={op.id}>
              {op.label}
            </option>
          ))}
        </select>
      </div>

      <div className={styles['gmp__req-cell']}>
        <SimplifiedValuePicker
          userAttrId={req.userAttrId}
          literalKey={req.userAttrId}
          value={req.value}
          multi={multi}
          error={highlighted}
          onChange={(value) => onChange({ value })}
        />
      </div>

      <div className={styles['gmp__req-cell-actions']}>
        <RowMenu onRemove={onRemove} />
      </div>
    </div>
  );
}

// ─── Row menu ────────────────────────────────────────────────────────────────

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

// ─── All-required / any-match menu ───────────────────────────────────────────

function AllRequiredMenu({
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
    <div className={styles['gmp__allreq']} ref={open ? ref : undefined}>
      <button
        type="button"
        className={styles['gmp__allreq-trigger']}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        {value ? TERMS.allRequired : TERMS.anyMatch}
        <Icon size="12" glyph={<ChevronDownIcon />} />
      </button>
      {open && (
        <div className={styles['gmp__allreq-pop']}>
          <PopoverMenu aria-label="Match mode">
            <MenuItem
              label={TERMS.allRequired}
              secondaryLabel="A user must satisfy every row"
              secondaryLabelPosition="Below"
              leadingVisual={<Icon size="16" glyph={<CheckAllIcon />} />}
              active={value}
              trailingElement={value}
              onClick={() => {
                onChange(true);
                setOpen(false);
              }}
            />
            <MenuItem
              label={TERMS.anyMatch}
              secondaryLabel="A user must satisfy at least one row"
              secondaryLabelPosition="Below"
              leadingVisual={<Icon size="16" glyph={<CheckCircleOutlineIcon />} />}
              active={!value}
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

// ─── Manual channel table ────────────────────────────────────────────────────

function ManualChannelTable({
  channels,
  onToggleAutoAdd,
  onRemove,
}: {
  channels: ManualChannel[];
  onToggleAutoAdd: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div className={styles['gmp__manual']}>
      <div className={styles['gmp__manual-toolbar']}>
        <div className={styles['gmp__manual-search']}>
          <SearchInput size="Small" placeholder="Search" aria-label="Search channels" />
        </div>
        <button type="button" className={styles['gmp__manual-filters']}>
          <Icon size="16" glyph={<FilterVariantIcon />} />
          Filters
        </button>
        <div className={styles['gmp__manual-add']}>
          <Button
            emphasis="Tertiary"
            size="Small"
            leadingIcon={<Icon size="16" glyph={<PlusIcon />} />}
          >
            Add channels
          </Button>
        </div>
      </div>

      {channels.length === 0 ? (
        <div className={styles['gmp__empty']}>
          <p className={styles['gmp__empty-title']}>No channels selected yet.</p>
          <p className={styles['gmp__empty-body']}>
            Add channels to apply this policy to a specific set.
          </p>
        </div>
      ) : (
        <>
          <div className={styles['gmp__ctable']}>
            <div
              className={[
                styles['gmp__ctable-row'],
                styles['gmp__ctable-head'],
              ].join(' ')}
            >
              <span>Name</span>
              <span>Team</span>
              <span className={styles['gmp__ctable-autoadd-head']}>
                Auto-add members
                <span className={styles['gmp__ctable-info']} aria-hidden>
                  <Icon size="12" glyph={<InformationOutlineIcon />} />
                </span>
              </span>
              <span />
            </div>
            {channels.map((c) => (
              <div key={c.id} className={styles['gmp__ctable-row']}>
                <span className={styles['gmp__ctable-name']}>
                  {c.private && (
                    <span className={styles['gmp__ctable-lock']} aria-label="Private">
                      <Icon size="12" glyph={<LockOutlineIcon />} />
                    </span>
                  )}
                  {c.name}
                </span>
                <span className={styles['gmp__ctable-team']}>{c.team}</span>
                <span className={styles['gmp__ctable-autoadd']}>
                  <Switch
                    size="Small"
                    checked={c.autoAdd}
                    onChange={() => onToggleAutoAdd(c.id)}
                  />
                  <span className={styles['gmp__ctable-autoadd-state']}>
                    {c.autoAdd ? 'On' : 'Off'}
                  </span>
                </span>
                <button
                  type="button"
                  className={styles['gmp__ctable-remove']}
                  onClick={() => onRemove(c.id)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
          <div className={styles['gmp__ctable-footer']}>
            <span className={styles['gmp__ctable-pagination']}>
              1–{channels.length} of {channels.length}
            </span>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Impact gate (always-confirm, async three-state) ─────────────────────────

function ImpactGate({
  onClose,
  startError,
}: {
  onClose: () => void;
  startError: boolean;
}) {
  const [state, setState] = useState<GateState>('computing');
  const startedRef = useRef(false);

  if (!startedRef.current) {
    startedRef.current = true;
    window.setTimeout(() => setState(startError ? 'error' : 'results'), 900);
  }

  const impact = SEED_IMPACT;

  const footer =
    state === 'computing' ? (
      <Button emphasis="Tertiary" onClick={onClose}>
        Cancel
      </Button>
    ) : state === 'error' ? (
      <div className={styles['gmp__gate-actions']}>
        <Button emphasis="Tertiary" onClick={onClose}>
          Cancel
        </Button>
        <Button emphasis="Primary" onClick={() => setState('computing')}>
          Retry
        </Button>
      </div>
    ) : (
      <div className={styles['gmp__gate-actions']}>
        <Button emphasis="Tertiary" onClick={onClose}>
          Cancel
        </Button>
        <Button emphasis="Primary" onClick={onClose}>
          {impact.usersRemoved > 0
            ? `Apply policy — remove ${impact.usersRemoved} members`
            : 'Apply policy'}
        </Button>
      </div>
    );

  return (
    <div className={styles['gmp__scrim']} role="presentation">
      <div className={styles['gmp__gate']}>
        <Modal
          size="Medium"
          title="Review policy impact"
          subtitle="Clearance required"
          onClose={onClose}
          footer={footer}
        >
          {state === 'computing' && (
            <div className={styles['gmp__gate-computing']}>
              <Spinner size={28} />
              <p className={styles['gmp__gate-computing-copy']}>
                Calculating impact…
              </p>
            </div>
          )}

          {state === 'error' && (
            <SectionNotice
              type="Danger"
              title="Couldn’t calculate the full impact"
              description="We couldn’t compute this policy’s impact right now. No changes have been applied. Retry, or cancel and try again later."
            />
          )}

          {state === 'results' && (
            <div className={styles['gmp__gate-results']}>
              <div className={styles['gmp__gate-scope']}>
                <span className={styles['gmp__gate-scope-count']}>
                  {impact.channelsInScope}
                </span>
                <span className={styles['gmp__gate-scope-label']}>
                  channels in scope
                </span>
                <span className={styles['gmp__gate-scope-split']}>
                  {impact.publicChannels} public · {impact.privateChannels} private
                </span>
              </div>

              <div className={styles['gmp__gate-effect']}>
                <span className={styles['gmp__gate-effect-icon']} aria-hidden>
                  <Icon size="20" glyph={<InformationOutlineIcon />} />
                </span>
                <div>
                  <p className={styles['gmp__gate-effect-title']}>
                    {impact.usersDeRecommended} users will be de-recommended from{' '}
                    {impact.publicChannels} public channels.
                  </p>
                  <p className={styles['gmp__gate-effect-body']}>
                    They keep access; only the recommendation is withdrawn.
                  </p>
                </div>
              </div>

              <div
                className={[
                  styles['gmp__gate-effect'],
                  styles['gmp__gate-effect--destructive'],
                ].join(' ')}
              >
                <span className={styles['gmp__gate-effect-icon']} aria-hidden>
                  <Icon size="20" glyph={<AlertOutlineIcon />} />
                </span>
                <div>
                  <p className={styles['gmp__gate-effect-title']}>
                    {impact.usersRemoved} members will be removed from{' '}
                    {impact.privateChannels} private channels.
                  </p>
                  <p className={styles['gmp__gate-effect-body']}>
                    This is destructive. Removed members lose access immediately
                    after you apply.
                  </p>
                </div>
              </div>

              <div className={styles['gmp__gate-skipped']}>
                <Icon size="16" glyph={<AlertCircleOutlineIcon />} />
                <span>
                  {impact.skippedMissingAttr} channels were not evaluated — a
                  referenced attribute isn’t set.
                </span>
              </div>

              <p className={styles['gmp__gate-footnote']}>
                Takes effect within ~15 minutes.
              </p>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}
