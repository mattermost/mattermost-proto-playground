import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FormatListBulletedIcon from '@mattermost/compass-icons/components/format-list-bulleted';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import ChevronDownIcon from '@mattermost/compass-icons/components/chevron-down';
import DotsVerticalIcon from '@mattermost/compass-icons/components/dots-vertical';
import TrashCanOutlineIcon from '@mattermost/compass-icons/components/trash-can-outline';
import CodeBracketsIcon from '@mattermost/compass-icons/components/code-brackets';
import MagnifyIcon from '@mattermost/compass-icons/components/magnify';
import CheckIcon from '@mattermost/compass-icons/components/check';
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
  CHANNEL_VARIABLES,
  SEED_REQUIREMENTS,
  SEED_CHANNEL_CONDITIONS,
  SCOPE_OPTIONS,
  ALL_CHANNELS_NO_REF,
  CHANNEL_TYPE_OPTIONS,
  CHANNEL_TYPE_CONSEQUENCE,
  MANUAL_CHANNELS,
  TEAMS,
  TIGHTEN_ONLY_STATEMENT,
  REEVAL_CADENCE_COPY,
  SEED_IMPACT,
  SEED_MATCH_RESULT,
  matchResultSummary,
  TERMS,
  policyById,
  policyEditorPreset,
  POLICY_EDITOR_PRESETS,
  userAttr,
  channelVar,
  type Requirement,
  type ChannelCondition,
  type ScopeMode,
  type ChannelTypeFilter,
  type GateState,
  type ManualChannel,
  type PolicyTeam,
  type ReqValue,
} from '@/pages/GlobalMembershipPolicy/gmpData';
import {
  GMP_ROUTES,
  GMP_SIDEBAR_CATEGORIES,
} from '@/pages/GlobalMembershipPolicy/gmpConsole';

import WalkthroughFocusProvider from '@/components/walkthrough/WalkthroughFocusProvider';
import ValuePicker from './ValuePicker';
import styles from './GlobalMembershipPolicyLongForm.module.scss';

type ScreenState = 'populated' | 'empty' | 'error';
type WhereTab = 'channels' | 'teams';
const VALID_STATES: ScreenState[] = ['populated', 'empty', 'error'];
const VALID_SCOPES: ScopeMode[] = ['all-where-set', 'manual', 'attribute-rules'];

/** Operators whose value is a multi-literal set. */
const MULTI_OPERATORS = new Set(['is-one-of', 'includes-any']);

const AVATAR_BY_KEY: Record<string, string> = {
  aiko: avatarAiko,
  marco: avatarMarco,
  emma: avatarEmma,
  david: avatarDavid,
};

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

export default function GlobalMembershipPolicyLongForm() {
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
  const scopeFromUrl: ScopeMode | null =
    scopeParam === 'all'
      ? 'all-where-set'
      : scopeParam === 'manual'
        ? 'manual'
        : scopeParam === 'rules'
          ? 'attribute-rules'
          : VALID_SCOPES.includes(scopeParam as ScopeMode)
            ? (scopeParam as ScopeMode)
            : null;
  const tabParam = params.get('tab');
  const tabFromUrl: WhereTab =
    tabParam === 'teams' ? 'teams' : 'channels';
  const gateParam = params.get('gate');
  const testParam = params.get('test');

  const isEmpty = initialState === 'empty';
  const isError = initialState === 'error';
  const gateFromUrl = gateParam === 'open' || gateParam === 'results';
  const gateResultsFromUrl = gateParam === 'results';
  const testDoneFromUrl = testParam === 'done';

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
  const [mode, setMode] = useState<'simple' | 'advanced'>('simple');
  const [policyName, setPolicyName] = useState(
    initialPolicyName(policyParam, isEmpty),
  );
  const [requirements, setRequirements] = useState<Requirement[]>(
    isEmpty ? [] : seedRequirements,
  );
  const [allRequired, setAllRequired] = useState(true);
  // Dynamic default scope: "All channels" is only meaningful as a deliberate
  // workspace-wide baseline when no channel attribute is referenced. So default
  // a literal-only policy to manual selection, and default the adaptive case
  // (a rule references a channel attribute) to "all channels where the
  // referenced attributes are set". URL ?scope= still wins.
  const initialReferencesChannelAttr = (isEmpty ? [] : seedRequirements).some(
    (r) => r.value.mode === 'variable',
  );
  const [scope, setScope] = useState<ScopeMode>(
    scopeFromUrl ??
      editorPreset?.scope ??
      (initialReferencesChannelAttr ? 'all-where-set' : 'manual'),
  );
  const [whereTab, setWhereTab] = useState<WhereTab>(tabFromUrl);
  const [channelType, setChannelType] = useState<ChannelTypeFilter>('all');
  const [channelConditions, setChannelConditions] = useState<ChannelCondition[]>(
    isEmpty ? [] : (editorPreset?.channelConditions ?? SEED_CHANNEL_CONDITIONS),
  );
  const [manualChannels, setManualChannels] = useState<ManualChannel[]>(
    isEmpty ? [] : (editorPreset?.manualChannels ?? MANUAL_CHANNELS),
  );
  const [teams, setTeams] = useState<PolicyTeam[]>(isEmpty ? [] : TEAMS);
  const [gateOpen, setGateOpen] = useState(gateFromUrl);

  const referencesChannelAttr = requirements.some(
    (r) => r.value.mode === 'variable',
  );
  const teamsTabDisabled = referencesChannelAttr;

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

  const addChannelCondition = () => {
    const first = CHANNEL_VARIABLES[0];
    setChannelConditions((prev) => [
      ...prev,
      {
        id: `cc-${Date.now()}`,
        channelAttrId: first.id,
        operatorId: OPERATORS[first.kind][0].id,
        labels: [],
      },
    ]);
  };
  const removeChannelCondition = (id: string) =>
    setChannelConditions((prev) => prev.filter((c) => c.id !== id));
  const patchChannelCondition = (id: string, next: Partial<ChannelCondition>) =>
    setChannelConditions((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...next } : c)),
    );

  const toggleChannelAutoAdd = (id: string) =>
    setManualChannels((prev) =>
      prev.map((c) => (c.id === id ? { ...c, autoAdd: !c.autoAdd } : c)),
    );
  const removeManualChannel = (id: string) =>
    setManualChannels((prev) => prev.filter((c) => c.id !== id));
  const toggleTeamAutoAdd = (id: string) =>
    setTeams((prev) =>
      prev.map((t) => (t.id === id ? { ...t, autoAdd: !t.autoAdd } : t)),
    );
  const removeTeam = (id: string) =>
    setTeams((prev) => prev.filter((t) => t.id !== id));

  const goToList = () => navigate(GMP_ROUTES.list);

  const handleSidebarClick = (itemId: string) => {
    setActive(itemId);
    if (itemId === 'membership-policies') {
      goToList();
    }
  };

  return (
    <WalkthroughFocusProvider>
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

        <div className={styles['gmp__scroll']} data-tour-focus="editor-overview">
          <div className={styles['gmp__page']}>
            {isError && (
              <SectionNotice
                type="Danger"
                title="Couldn’t save this policy"
                description="A requirement references Channel: Classification, but some channels in scope don’t have it set. Fix the highlighted row or narrow the scope, then try again."
              />
            )}

            {/* Membership policy name */}
            <div className={styles['gmp__field']} data-tour-focus="policy-name">
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

            {/* Section 1 — Membership requirements (single header) */}
            <section className={styles['gmp__panel']} data-tour-focus="requirements">
              <div className={styles['gmp__panel-head']}>
                <div>
                  <h2 className={styles['gmp__panel-title']}>{TERMS.whoTitle}</h2>
                  <p className={styles['gmp__panel-subtitle']}>
                    {TERMS.whoSubtitle}.
                  </p>
                </div>
                <SimpleAdvancedToggle mode={mode} onChange={setMode} />
              </div>

              <div className={styles['gmp__req-block']}>
                {mode === 'advanced' ? (
                  <textarea
                    className={styles['gmp__cel']}
                    spellCheck={false}
                    placeholder={
                      'user.attributes.clearance >= channel.attributes.classification &&\nuser.attributes.program == channel.attributes.program'
                    }
                    defaultValue={
                      isEmpty
                        ? ''
                        : 'user.attributes.clearance >= channel.attributes.classification &&\nuser.attributes.program == channel.attributes.program'
                    }
                  />
                ) : requirements.length === 0 ? (
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
                        tourFocusId={
                          i === 0
                            ? req.value.mode === 'literal'
                              ? 'literal-row'
                              : 'hero-row'
                            : undefined
                        }
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

                <div className={styles['gmp__req-footer']} data-tour-focus="test-users">
                  <p className={styles['gmp__req-help']}>
                    Select the attributes users must have.
                  </p>
                  <TestMatchingUsers initialState={testDoneFromUrl ? 'done' : 'idle'} />
                </div>
              </div>
            </section>

            {/* Section 2 — Where this policy applies (Channels / Teams tabs) */}
            <section className={styles['gmp__panel']} data-tour-focus="where-applies">
              <div
                className={[
                  styles['gmp__panel-head'],
                  styles['gmp__panel-head--where'],
                ].join(' ')}
              >
                <div>
                  <h2 className={styles['gmp__panel-title']}>{TERMS.whereTitle}</h2>
                  <p className={styles['gmp__panel-subtitle']}>
                    {TERMS.whereSubtitle}.
                  </p>
                </div>
                <WhereTabs
                  value={whereTab}
                  onChange={setWhereTab}
                  teamsDisabled={teamsTabDisabled}
                />
              </div>

              <div className={styles['gmp__where']}>
                {whereTab === 'channels' ? (
                  <div className={styles['gmp__scope']}>
                    {SCOPE_OPTIONS.map((opt) => {
                      const selected = scope === opt.id;
                      // Radio 1 label adapts: "referenced attributes" only makes
                      // sense when a rule actually references a channel attribute.
                      const noChannelRef =
                        opt.id === 'all-where-set' &&
                        !requirements.some((r) => r.value.mode === 'variable');
                      const scopeTitle = noChannelRef
                        ? ALL_CHANNELS_NO_REF.title
                        : opt.title;
                      const scopeFocusId =
                        opt.id === 'all-where-set'
                          ? 'scope-all'
                          : opt.id === 'manual'
                            ? 'scope-manual'
                            : 'scope-rules';
                      return (
                        <div
                          key={opt.id}
                          data-tour-focus={selected ? scopeFocusId : undefined}
                          className={[
                            styles['gmp__scope-option'],
                            selected
                              ? styles['gmp__scope-option--selected']
                              : '',
                          ]
                            .filter(Boolean)
                            .join(' ')}
                        >
                          <Radio
                            name="gmp-scope"
                            checked={selected}
                            onChange={() => setScope(opt.id)}
                          >
                            <span className={styles['gmp__scope-title']}>
                              {scopeTitle}
                            </span>
                          </Radio>

                          {selected && opt.id === 'all-where-set' && (
                            <div className={styles['gmp__scope-detail']}>
                              {noChannelRef && (
                                <SectionNotice
                                  type={
                                    channelType === 'private'
                                      ? 'Warning'
                                      : 'Hint'
                                  }
                                  title="This applies to every channel as a workspace-wide baseline"
                                  description="No channel attributes are referenced, so this policy enforces the same requirement on every channel. Select specific channels unless a blanket rule is your intent."
                                />
                              )}
                              <ChannelTypeControl
                                value={channelType}
                                onChange={setChannelType}
                                tourFocusId="type-filter"
                              />
                            </div>
                          )}

                          {selected && opt.id === 'manual' && (
                            <div
                              className={styles['gmp__scope-detail']}
                              data-tour-focus="channel-table"
                            >
                              <ManualChannelTable
                                channels={manualChannels}
                                onToggleAutoAdd={toggleChannelAutoAdd}
                                onRemove={removeManualChannel}
                              />
                            </div>
                          )}

                          {selected && opt.id === 'attribute-rules' && (
                            <div className={styles['gmp__scope-detail']}>
                              <h3 className={styles['gmp__req-title']}>
                                Channel attribute requirements
                              </h3>
                              {channelConditions.length === 0 ? (
                                <div className={styles['gmp__empty']}>
                                  <p className={styles['gmp__empty-title']}>
                                    No channel conditions yet.
                                  </p>
                                  <p className={styles['gmp__empty-body']}>
                                    Add a channel attribute condition to target
                                    the channels this policy applies to.
                                  </p>
                                </div>
                              ) : (
                                <div className={styles['gmp__req-table']}>
                                  <div className={styles['gmp__req-thead']}>
                                    <span>Attribute</span>
                                    <span>Operator</span>
                                    <span>Value</span>
                                    <div
                                      className={styles['gmp__thead-trailing']}
                                    >
                                      <AllRequiredMenu
                                        value
                                        onChange={() => undefined}
                                      />
                                    </div>
                                  </div>
                                  {channelConditions.map((cond) => (
                                    <ChannelConditionRow
                                      key={cond.id}
                                      cond={cond}
                                      onChange={(next) =>
                                        patchChannelCondition(cond.id, next)
                                      }
                                      onRemove={() =>
                                        removeChannelCondition(cond.id)
                                      }
                                    />
                                  ))}
                                </div>
                              )}
                              <div className={styles['gmp__req-actions']}>
                                <Button
                                  emphasis="Tertiary"
                                  size="Small"
                                  leadingIcon={
                                    <Icon size="16" glyph={<PlusIcon />} />
                                  }
                                  onClick={addChannelCondition}
                                >
                                  Add attribute
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : teamsTabDisabled ? (
                  <div data-tour-focus="teams-tab">
                    <TeamsTabDisabled />
                  </div>
                ) : (
                  <div data-tour-focus="teams-tab">
                  <TeamsTab
                    teams={teams}
                    onToggleAutoAdd={toggleTeamAutoAdd}
                    onRemove={removeTeam}
                  />
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>

        {/* Persistent composition + timing strip above the footer */}
        <div className={styles['gmp__timing']} data-tour-focus="timing-strip">
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
          saveDisabled={false}
          onSave={() => setGateOpen(true)}
          onCancel={goToList}
        />
      </div>

      {gateOpen && (
        <ImpactGate
          onClose={() => setGateOpen(false)}
          startError={isError}
          initialState={gateResultsFromUrl ? 'results' : undefined}
        />
      )}
    </div>
    </WalkthroughFocusProvider>
  );
}

// ─── Channels / Teams underline tabs (mockup "Applies to") ───────────────────

const WHERE_TABS: { key: WhereTab; label: string }[] = [
  { key: 'channels', label: 'Channels' },
  { key: 'teams', label: 'Teams' },
];

function WhereTabs({
  value,
  onChange,
  teamsDisabled,
}: {
  value: WhereTab;
  onChange: (tab: WhereTab) => void;
  teamsDisabled: boolean;
}) {
  return (
    <div
      className={styles['gmp__where-tabs']}
      role="tablist"
      aria-label="Applies to"
    >
      {WHERE_TABS.map((tab) => {
        const active = value === tab.key;
        const disabled = tab.key === 'teams' && teamsDisabled;
        return (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={active}
            aria-disabled={disabled || undefined}
            className={[
              styles['gmp__where-tab'],
              active ? styles['gmp__where-tab--active'] : '',
              disabled ? styles['gmp__where-tab--disabled'] : '',
            ]
              .filter(Boolean)
              .join(' ')}
            onClick={() => onChange(tab.key)}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

// ─── Simple / Advanced toggle ────────────────────────────────────────────────

function SimpleAdvancedToggle({
  mode,
  onChange,
}: {
  mode: 'simple' | 'advanced';
  onChange: (m: 'simple' | 'advanced') => void;
}) {
  return (
    <div className={styles['gmp__segmented']} role="group" aria-label="Editor mode">
      <button
        type="button"
        className={[
          styles['gmp__segmented-btn'],
          mode === 'advanced' ? styles['gmp__segmented-btn--active'] : '',
        ]
          .filter(Boolean)
          .join(' ')}
        onClick={() => onChange('advanced')}
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
        onClick={() => onChange('simple')}
      >
        <Icon size="12" glyph={<FormatListBulletedIcon />} />
        Simple
      </button>
    </div>
  );
}

// ─── Requirement row (who-block) — grouped Value picker ──────────────────────

function RequirementRow({
  req,
  highlighted,
  tourFocusId,
  onChange,
  onRemove,
}: {
  req: Requirement;
  highlighted: boolean;
  tourFocusId?: string;
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
    // Trim a multi-literal selection down to one when leaving a multi operator.
    let value: ReqValue = req.value;
    if (!nextMulti && req.value.mode === 'literal' && req.value.labels.length > 1) {
      value = { mode: 'literal', labels: req.value.labels.slice(0, 1) };
    }
    onChange({ operatorId, value });
  };

  return (
    <div className={rowClass} data-tour-focus={tourFocusId}>
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
        <ValuePicker
          literalKey={req.userAttrId}
          kind={kind}
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

// ─── Channel condition row (attribute-rules scope) ───────────────────────────

function ChannelConditionRow({
  cond,
  onChange,
  onRemove,
}: {
  cond: ChannelCondition;
  onChange: (next: Partial<ChannelCondition>) => void;
  onRemove: () => void;
}) {
  const attr = channelVar(cond.channelAttrId);
  const kind = attr?.kind ?? 'select';
  const operators = OPERATORS[kind];
  const literalKey = attr?.id.replace('ch-', '') ?? '';
  const multi = MULTI_OPERATORS.has(cond.operatorId);

  const changeAttr = (id: string) => {
    const next = channelVar(id);
    if (!next) return;
    onChange({
      channelAttrId: id,
      operatorId: OPERATORS[next.kind][0].id,
      labels: [],
    });
  };

  // The channel-condition RHS is literal-only (matching a channel attribute to a
  // fixed value), so we adapt ValuePicker's ReqValue to the condition's labels.
  const value: ReqValue = { mode: 'literal', labels: cond.labels };
  const handleValue = (next: ReqValue) => {
    onChange({ labels: next.mode === 'literal' ? next.labels : [] });
  };

  return (
    <div className={styles['gmp__req-row']}>
      <div className={styles['gmp__req-cell']}>
        <span className={styles['gmp__attr-icon']} aria-hidden>
          <Icon size="16" glyph={<FormatListBulletedIcon />} />
        </span>
        <select
          className={styles['gmp__req-select']}
          value={cond.channelAttrId}
          aria-label="Channel attribute"
          onChange={(e) => changeAttr(e.target.value)}
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
          value={cond.operatorId}
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
        <ValuePicker
          literalKey={literalKey}
          kind={kind}
          value={value}
          multi={multi}
          hideVariables
          onChange={handleValue}
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

// ─── Channel-type consequence radios (under all-where-set only) ──────────────

function ChannelTypeControl({
  value,
  onChange,
  tourFocusId,
}: {
  value: ChannelTypeFilter;
  onChange: (v: ChannelTypeFilter) => void;
  tourFocusId?: string;
}) {
  const meta = CHANNEL_TYPE_CONSEQUENCE[value];
  return (
    <div
      className={styles['gmp__typefilter']}
      data-tour-focus={tourFocusId}
    >
      <p className={styles['gmp__typefilter-label']}>Which channel types?</p>
      <div
        className={styles['gmp__segmented']}
        role="group"
        aria-label="Which channel types?"
      >
        {CHANNEL_TYPE_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            type="button"
            className={[
              styles['gmp__segmented-btn'],
              value === opt.id ? styles['gmp__segmented-btn--active'] : '',
            ]
              .filter(Boolean)
              .join(' ')}
            aria-pressed={value === opt.id}
            onClick={() => onChange(opt.id)}
          >
            {opt.label}
          </button>
        ))}
      </div>
      {value === 'all' ? (
        <div className={styles['gmp__typefilter-helps']}>
          <p className={styles['gmp__typefilter-help']}>
            <span className={styles['gmp__typefilter-lead']}>Public</span>
            {' — '}
            {CHANNEL_TYPE_CONSEQUENCE.public.consequence}
          </p>
          <p className={styles['gmp__typefilter-help']}>
            <span className={styles['gmp__typefilter-lead']}>Private</span>
            {' — '}
            {CHANNEL_TYPE_CONSEQUENCE.private.consequence}
          </p>
        </div>
      ) : (
        <p className={styles['gmp__typefilter-help']}>
          <span>{meta.consequence}</span>
        </p>
      )}
    </div>
  );
}

// ─── Manual channel table (shipping "Applies to") ────────────────────────────

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

// ─── Teams tab (manual-only this iteration) ──────────────────────────────────

function TeamsTabDisabled() {
  return (
    <div className={styles['gmp__teams--disabled']}>
      <SectionNotice
        type="Hint"
        title={TERMS.teamsTabDisabledTitle}
        description={TERMS.teamsTabDisabledDescription}
      />
    </div>
  );
}

function TeamsTab({
  teams,
  onToggleAutoAdd,
  onRemove,
}: {
  teams: PolicyTeam[];
  onToggleAutoAdd: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div className={styles['gmp__teams']}>
      <div className={styles['gmp__manual']}>
        <div className={styles['gmp__manual-toolbar']}>
          <div className={styles['gmp__manual-search']}>
            <SearchInput size="Small" placeholder="Search" aria-label="Search teams" />
          </div>
          <div className={styles['gmp__manual-add']}>
            <Button
              emphasis="Tertiary"
              size="Small"
              leadingIcon={<Icon size="16" glyph={<PlusIcon />} />}
            >
              Add teams
            </Button>
          </div>
        </div>

        {teams.length === 0 ? (
          <div className={styles['gmp__empty']}>
            <p className={styles['gmp__empty-title']}>No teams selected yet.</p>
            <p className={styles['gmp__empty-body']}>
              Add teams to apply this policy across their channels.
            </p>
          </div>
        ) : (
          <div className={styles['gmp__ctable']}>
            <div
              className={[
                styles['gmp__ctable-row'],
                styles['gmp__ctable-row--teams'],
                styles['gmp__ctable-head'],
              ].join(' ')}
            >
              <span>Name</span>
              <span className={styles['gmp__ctable-autoadd-head']}>
                Auto-add members
              </span>
              <span />
            </div>
            {teams.map((t) => (
              <div
                key={t.id}
                className={[
                  styles['gmp__ctable-row'],
                  styles['gmp__ctable-row--teams'],
                ].join(' ')}
              >
                <span className={styles['gmp__ctable-name']}>{t.name}</span>
                <span className={styles['gmp__ctable-autoadd']}>
                  <Switch
                    size="Small"
                    checked={t.autoAdd}
                    onChange={() => onToggleAutoAdd(t.id)}
                  />
                  <span className={styles['gmp__ctable-autoadd-state']}>
                    {t.autoAdd ? 'On' : 'Off'}
                  </span>
                </span>
                <button
                  type="button"
                  className={styles['gmp__ctable-remove']}
                  onClick={() => onRemove(t.id)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Test matching users ─────────────────────────────────────────────────────

function TestMatchingUsers({
  initialState = 'idle',
}: {
  initialState?: 'idle' | 'loading' | 'done';
}) {
  const [state, setState] = useState<'idle' | 'loading' | 'done'>(initialState);

  const run = () => {
    setState('loading');
    window.setTimeout(() => setState('done'), 700);
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
        <div className={styles['gmp__test-result']}>
          <div className={styles['gmp__test-line']}>
            <UserAvatarGroup
              size="24"
              avatars={SEED_MATCH_RESULT.sample.map((s) => ({
                key: s.key,
                src: AVATAR_BY_KEY[s.key],
                name: s.name,
              }))}
            />
            <span className={styles['gmp__test-count']}>
              {matchResultSummary(SEED_MATCH_RESULT)}
            </span>
          </div>
          <span className={styles['gmp__test-skipped']}>
            {SEED_MATCH_RESULT.excludedMissingAttr} channels excluded — a
            referenced attribute is not set on those channels.
          </span>
        </div>
      )}
    </div>
  );
}

// ─── Impact gate (always-confirm, async three-state) ─────────────────────────

function ImpactGate({
  onClose,
  startError,
  initialState,
}: {
  onClose: () => void;
  startError: boolean;
  initialState?: GateState;
}) {
  const [state, setState] = useState<GateState>(initialState ?? 'computing');
  const startedRef = useRef(initialState != null);

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
            <div className={styles['gmp__gate-results']} data-tour-focus="impact-gate">
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
                data-tour-focus="gate-removals"
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
