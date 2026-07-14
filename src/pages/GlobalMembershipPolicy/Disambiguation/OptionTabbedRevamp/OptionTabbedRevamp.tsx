/**
 * O6 — Full-page revamp: page-level Members / Channels tabs.
 *
 * The two axes become the top-level IA of the edit-policy page (spec Q6 =
 * "Members / Channels"). The reader literally cannot conflate them — they live
 * on different tabs:
 *   - Members tab  → membership requirements (Simple/Advanced, match-mode,
 *     Test matching users). Everything about who qualifies.
 *   - Channels tab → the three scope modes (all-where-set + type filter,
 *     manual channel table, attribute-based conditions). Everything about where
 *     it runs.
 * A persistent header banner carries the auto-generated policy sentence
 * (Q4 = generated-only). The combine/timing strip + Save live in a sticky
 * footer that belongs to the whole policy (Q3); Test matching users stays on
 * the Members tab because it is a member-scoped preview.
 *
 * Deep-links: ?policy=<id> · ?state=populated|empty|error · ?page=members|channels
 *             · ?scope=all|manual|rules · ?gate=open|results
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import MagnifyIcon from '@mattermost/compass-icons/components/magnify';
import CodeBracketsIcon from '@mattermost/compass-icons/components/code-brackets';
import FormatListBulletedIcon from '@mattermost/compass-icons/components/format-list-bulleted';
import InformationOutlineIcon from '@mattermost/compass-icons/components/information-outline';

import ConsoleSidebar from '@/components/ui/ConsoleSidebar/ConsoleSidebar';
import ConsolePageHeader from '@/components/ui/ConsolePageHeader/ConsolePageHeader';
import Button from '@/components/ui/Button/Button';
import Icon from '@/components/ui/Icon/Icon';
import Radio from '@/components/ui/Radio/Radio';
import SectionNotice from '@/components/ui/SectionNotice/SectionNotice';
import Spinner from '@/components/ui/Spinner/Spinner';
import UserAvatarGroup from '@/components/ui/UserAvatarGroup/UserAvatarGroup';
import { Tabs } from '@/components/ui/Tabs';

import avatarLeonard from '@/assets/avatars/Leonard Riley.png';
import avatarAiko from '@/assets/avatars/Aiko Tan.png';
import avatarMarco from '@/assets/avatars/Marco Rinaldi.png';
import avatarEmma from '@/assets/avatars/Emma Novak.png';
import avatarDavid from '@/assets/avatars/David Liang.png';

import {
  SEED_REQUIREMENTS,
  SEED_CHANNEL_CONDITIONS,
  SCOPE_OPTIONS,
  ALL_CHANNELS_NO_REF,
  CHANNEL_TYPE_OPTIONS,
  CHANNEL_TYPE_CONSEQUENCE,
  MANUAL_CHANNELS,
  TIGHTEN_ONLY_STATEMENT,
  REEVAL_CADENCE_COPY,
  SEED_MATCH_RESULT,
  matchResultSummary,
  TERMS,
  OPERATORS,
  USER_ATTRS,
  CHANNEL_VARIABLES,
  policyById,
  policyEditorPreset,
  POLICY_EDITOR_PRESETS,
  type Requirement,
  type ChannelCondition,
  type ScopeMode,
  type ChannelTypeFilter,
  type ManualChannel,
} from '@/pages/GlobalMembershipPolicy/gmpData';
import {
  GMP_ROUTES,
  GMP_SIDEBAR_CATEGORIES,
} from '@/pages/GlobalMembershipPolicy/gmpConsole';

import {
  MemberGlyph,
  ChannelGlyph,
  RequirementRow,
  ChannelConditionRow,
  AllRequiredMenu,
  ManualChannelTable,
} from '../shared/DisambiguationParts';
import { AXES, buildPolicySentence } from '../shared/policySentence';
import PolicySentenceBanner from '../shared/PolicySentenceBanner';
import ImpactGate from '../shared/ImpactGate';
import shared from '../shared/DisambiguationParts.module.scss';
import styles from './OptionTabbedRevamp.module.scss';

type ScreenState = 'populated' | 'empty' | 'error';
type Page = 'members' | 'channels';
const VALID_STATES: ScreenState[] = ['populated', 'empty', 'error'];
const VALID_SCOPES: ScopeMode[] = ['all-where-set', 'manual', 'attribute-rules'];

const AVATAR_BY_KEY: Record<string, string> = {
  aiko: avatarAiko,
  marco: avatarMarco,
  emma: avatarEmma,
  david: avatarDavid,
};

function readParams() {
  return typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search)
    : new URLSearchParams();
}

export default function OptionTabbedRevamp() {
  const navigate = useNavigate();
  const params = readParams();

  const stateParam = params.get('state') as ScreenState | null;
  const initialState: ScreenState =
    stateParam && VALID_STATES.includes(stateParam) ? stateParam : 'populated';
  const isEmpty = initialState === 'empty';
  const isError = initialState === 'error';

  const policyParam = params.get('policy');
  const knownPolicyId =
    !isEmpty && policyParam != null && policyParam in POLICY_EDITOR_PRESETS
      ? policyParam
      : null;
  const preset = knownPolicyId != null ? policyEditorPreset(knownPolicyId) : null;

  const pageParam = params.get('page');
  const initialPage: Page = pageParam === 'channels' ? 'channels' : 'members';

  const scopeParamRaw = params.get('scope');
  const scopeFromUrl: ScopeMode | null =
    scopeParamRaw === 'all'
      ? 'all-where-set'
      : scopeParamRaw === 'manual'
        ? 'manual'
        : scopeParamRaw === 'rules'
          ? 'attribute-rules'
          : VALID_SCOPES.includes(scopeParamRaw as ScopeMode)
            ? (scopeParamRaw as ScopeMode)
            : null;

  const gateParam = params.get('gate');
  const gateFromUrl = gateParam === 'open' || gateParam === 'results';
  const gateResultsFromUrl = gateParam === 'results';

  const seedRequirements = isEmpty ? [] : (preset?.requirements ?? SEED_REQUIREMENTS);
  const initialReferencesChannelAttr = seedRequirements.some(
    (r) => r.value.mode === 'variable',
  );

  const [active, setActive] = useState('membership-policies');
  const [page, setPage] = useState<Page>(initialPage);
  const [mode, setMode] = useState<'simple' | 'advanced'>('simple');
  const [policyName, setPolicyName] = useState(
    isEmpty ? '' : (policyById(policyParam ?? '')?.name ?? 'Clearance required'),
  );
  const [requirements, setRequirements] = useState<Requirement[]>(seedRequirements);
  const [allRequired, setAllRequired] = useState(true);
  const [scope, setScope] = useState<ScopeMode>(
    scopeFromUrl ??
      preset?.scope ??
      (initialReferencesChannelAttr ? 'all-where-set' : 'manual'),
  );
  const [channelType, setChannelType] = useState<ChannelTypeFilter>('all');
  const [channelConditions, setChannelConditions] = useState<ChannelCondition[]>(
    isEmpty ? [] : (preset?.channelConditions ?? SEED_CHANNEL_CONDITIONS),
  );
  const [manualChannels, setManualChannels] = useState<ManualChannel[]>(
    isEmpty ? [] : (preset?.manualChannels ?? MANUAL_CHANNELS),
  );
  const [testState, setTestState] = useState<'idle' | 'loading' | 'done'>('idle');
  const [gateOpen, setGateOpen] = useState(gateFromUrl);

  const referencesChannelAttr = requirements.some((r) => r.value.mode === 'variable');

  const patchRequirement = (id: string, next: Partial<Requirement>) =>
    setRequirements((prev) => prev.map((r) => (r.id === id ? { ...r, ...next } : r)));
  const removeRequirement = (id: string) =>
    setRequirements((prev) => prev.filter((r) => r.id !== id));
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

  const patchCondition = (id: string, next: Partial<ChannelCondition>) =>
    setChannelConditions((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...next } : c)),
    );
  const removeCondition = (id: string) =>
    setChannelConditions((prev) => prev.filter((c) => c.id !== id));
  const addCondition = () => {
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

  const toggleAutoAdd = (id: string) =>
    setManualChannels((prev) =>
      prev.map((c) => (c.id === id ? { ...c, autoAdd: !c.autoAdd } : c)),
    );
  const removeChannel = (id: string) =>
    setManualChannels((prev) => prev.filter((c) => c.id !== id));

  const runTest = () => {
    setTestState('loading');
    window.setTimeout(() => setTestState('done'), 700);
  };

  const goToList = () => navigate(GMP_ROUTES.list);
  const handleSidebarClick = (itemId: string) => {
    setActive(itemId);
    if (itemId === 'membership-policies') goToList();
  };

  const sentence = buildPolicySentence({
    requirements,
    allRequired,
    advanced: mode === 'advanced',
    scope,
    channelConditions,
    manualCount: manualChannels.length,
  });

  const typeMeta = CHANNEL_TYPE_CONSEQUENCE[channelType];

  const tabItems = [
    {
      key: 'members',
      label: AXES.members.tabLabel,
      countBadge: mode === 'advanced' ? undefined : requirements.length || undefined,
    },
    {
      key: 'channels',
      label: AXES.channels.tabLabel,
    },
  ];

  return (
    <div className={styles['scene']}>
      <ConsoleSidebar
        avatarSrc={avatarLeonard}
        avatarAlt="Leonard Riley"
        username="leonard.riley"
        categories={GMP_SIDEBAR_CATEGORIES}
        activeItemId={active}
        onItemClick={handleSidebarClick}
      />

      <div className={styles['scene__center']}>
        <ConsolePageHeader
          title={policyParam == null ? TERMS.newTitle : TERMS.editorTitle}
          backButton
          onBack={goToList}
        />

        {/* Persistent policy header — name + generated sentence + axis tabs */}
        <div className={styles['policy-header']}>
          <input
            className={styles['policy-header__name']}
            value={policyName}
            placeholder="Name this policy"
            aria-label={TERMS.nameLabel}
            onChange={(e) => setPolicyName(e.target.value)}
          />
          <PolicySentenceBanner sentence={sentence} variant="header" />
          <div className={styles['policy-header__tabs']}>
            <Tabs
              tabs={tabItems}
              activeKey={page}
              onChange={(key) => setPage(key as Page)}
            />
          </div>
        </div>

        <div className={styles['scene__scroll']}>
          <div className={styles['scene__page']}>
            {isError && (
              <SectionNotice
                type="Danger"
                title="Couldn’t save this policy"
                description="A requirement references Channel: Classification, but some channels in scope don’t have it set. Fix the highlighted row on the Members tab or narrow the scope on the Channels tab, then try again."
              />
            )}

            {page === 'members' ? (
              <section className={styles['tabpanel']} data-axis="members">
                <div className={styles['tabpanel__intro']}>
                  <span className={styles['tabpanel__glyph']}>
                    <MemberGlyph />
                  </span>
                  <div>
                    <p className={styles['tabpanel__question']}>
                      {AXES.members.question}
                    </p>
                    <p className={styles['tabpanel__framing']}>
                      {AXES.members.framing}
                    </p>
                  </div>
                  <div
                    className={styles['segmented']}
                    role="group"
                    aria-label="Editor mode"
                  >
                    <button
                      type="button"
                      className={[
                        styles['segmented__btn'],
                        mode === 'advanced' ? styles['segmented__btn--active'] : '',
                      ].join(' ')}
                      onClick={() => setMode('advanced')}
                    >
                      <Icon size="12" glyph={<CodeBracketsIcon />} />
                      Advanced
                    </button>
                    <button
                      type="button"
                      className={[
                        styles['segmented__btn'],
                        mode === 'simple' ? styles['segmented__btn--active'] : '',
                      ].join(' ')}
                      onClick={() => setMode('simple')}
                    >
                      <Icon size="12" glyph={<FormatListBulletedIcon />} />
                      Simple
                    </button>
                  </div>
                </div>

                {mode === 'advanced' ? (
                  <textarea
                    className={styles['cel']}
                    spellCheck={false}
                    defaultValue={
                      isEmpty
                        ? ''
                        : 'user.attributes.clearance >= channel.attributes.classification &&\nuser.attributes.program == channel.attributes.program'
                    }
                  />
                ) : requirements.length === 0 ? (
                  <div className={shared['empty']}>
                    <p className={shared['empty__title']}>No requirements yet.</p>
                    <p className={shared['empty__body']}>
                      Add a requirement to define who qualifies for membership.
                    </p>
                  </div>
                ) : (
                  <div className={shared['table']}>
                    <div
                      className={shared['table__head']}
                      data-marker="off"
                    >
                      <span>User attribute</span>
                      <span>Operator</span>
                      <span>Value</span>
                      <div className={shared['table__head-trailing']}>
                        <AllRequiredMenu value={allRequired} onChange={setAllRequired} />
                      </div>
                    </div>
                    {requirements.map((req) => (
                      <RequirementRow
                        key={req.id}
                        req={req}
                        showAxisMarker={false}
                        onChange={(next) => patchRequirement(req.id, next)}
                        onRemove={() => removeRequirement(req.id)}
                      />
                    ))}
                  </div>
                )}

                {mode === 'simple' && (
                  <div className={styles['add-row']}>
                    <Button
                      emphasis="Tertiary"
                      size="Small"
                      leadingIcon={<Icon size="16" glyph={<PlusIcon />} />}
                      onClick={addRequirement}
                    >
                      Add attribute
                    </Button>
                  </div>
                )}

                {/* Test matching users — member-scoped preview (Q3) */}
                <div className={styles['test']}>
                  <Button
                    emphasis="Tertiary"
                    size="Small"
                    leadingIcon={<Icon size="16" glyph={<MagnifyIcon />} />}
                    onClick={runTest}
                  >
                    {TERMS.testUsers}
                  </Button>
                  {testState === 'loading' && (
                    <span className={styles['test__result']}>
                      <Spinner size={16} />
                      Evaluating…
                    </span>
                  )}
                  {testState === 'done' && (
                    <div className={styles['test__result']}>
                      <div className={styles['test__line']}>
                        <UserAvatarGroup
                          size="24"
                          avatars={SEED_MATCH_RESULT.sample.map((s) => ({
                            key: s.key,
                            src: AVATAR_BY_KEY[s.key],
                            name: s.name,
                          }))}
                        />
                        <span className={styles['test__count']}>
                          {matchResultSummary(SEED_MATCH_RESULT)}
                        </span>
                      </div>
                      <span className={styles['test__skipped']}>
                        {SEED_MATCH_RESULT.excludedMissingAttr} channels excluded — a
                        referenced attribute is not set on those channels.
                      </span>
                    </div>
                  )}
                </div>
              </section>
            ) : (
              <section className={styles['tabpanel']} data-axis="channels">
                <div className={styles['tabpanel__intro']}>
                  <span className={styles['tabpanel__glyph']}>
                    <ChannelGlyph />
                  </span>
                  <div>
                    <p className={styles['tabpanel__question']}>
                      {AXES.channels.question}
                    </p>
                    <p className={styles['tabpanel__framing']}>
                      {AXES.channels.framing}
                    </p>
                  </div>
                </div>

                <div className={styles['scope']}>
                  {SCOPE_OPTIONS.map((opt) => {
                    const selected = scope === opt.id;
                    const noChannelRef =
                      opt.id === 'all-where-set' && !referencesChannelAttr;
                    const title = noChannelRef ? ALL_CHANNELS_NO_REF.title : opt.title;
                    return (
                      <div
                        key={opt.id}
                        className={[
                          styles['scope__option'],
                          selected ? styles['scope__option--selected'] : '',
                        ].join(' ')}
                      >
                        <Radio
                          name="tr-scope"
                          checked={selected}
                          onChange={() => setScope(opt.id)}
                        >
                          <span className={styles['scope__title']}>{title}</span>
                        </Radio>

                        {selected && opt.id === 'all-where-set' && (
                          <div className={styles['scope__detail']}>
                            {noChannelRef && (
                              <SectionNotice
                                type={channelType === 'private' ? 'Warning' : 'Hint'}
                                title="This applies to every channel as a workspace-wide baseline"
                                description="No channel attributes are referenced, so this policy enforces the same requirement on every channel. Select specific channels unless a blanket rule is your intent."
                              />
                            )}
                            <div className={styles['typefilter']}>
                              <p className={styles['typefilter__label']}>
                                Which channel types?
                              </p>
                              <div
                                className={styles['segmented']}
                                role="group"
                                aria-label="Which channel types?"
                              >
                                {CHANNEL_TYPE_OPTIONS.map((t) => (
                                  <button
                                    key={t.id}
                                    type="button"
                                    className={[
                                      styles['segmented__btn'],
                                      channelType === t.id
                                        ? styles['segmented__btn--active']
                                        : '',
                                    ].join(' ')}
                                    aria-pressed={channelType === t.id}
                                    onClick={() => setChannelType(t.id)}
                                  >
                                    {t.label}
                                  </button>
                                ))}
                              </div>
                              <p
                                className={[
                                  styles['typefilter__help'],
                                  channelType === 'private'
                                    ? styles['typefilter__help--danger']
                                    : '',
                                ].join(' ')}
                              >
                                {typeMeta.consequence}
                              </p>
                            </div>
                          </div>
                        )}

                        {selected && opt.id === 'manual' && (
                          <div className={styles['scope__detail']}>
                            <ManualChannelTable
                              channels={manualChannels}
                              onToggleAutoAdd={toggleAutoAdd}
                              onRemove={removeChannel}
                            />
                          </div>
                        )}

                        {selected && opt.id === 'attribute-rules' && (
                          <div className={styles['scope__detail']}>
                            {channelConditions.length === 0 ? (
                              <div className={shared['empty']}>
                                <p className={shared['empty__title']}>
                                  No channel conditions yet.
                                </p>
                                <p className={shared['empty__body']}>
                                  Add a channel-attribute condition to target which
                                  channels this policy applies to.
                                </p>
                              </div>
                            ) : (
                              <div className={shared['table']}>
                                <div
                                  className={shared['table__head']}
                                  data-marker="off"
                                >
                                  <span>Channel attribute</span>
                                  <span>Operator</span>
                                  <span>Value</span>
                                  <span />
                                </div>
                                {channelConditions.map((cond) => (
                                  <ChannelConditionRow
                                    key={cond.id}
                                    cond={cond}
                                    showAxisMarker={false}
                                    onChange={(next) => patchCondition(cond.id, next)}
                                    onRemove={() => removeCondition(cond.id)}
                                  />
                                ))}
                              </div>
                            )}
                            <div className={styles['add-row']}>
                              <Button
                                emphasis="Tertiary"
                                size="Small"
                                leadingIcon={<Icon size="16" glyph={<PlusIcon />} />}
                                onClick={addCondition}
                              >
                                Add condition
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            )}
          </div>
        </div>

        {/* Sticky footer — belongs to the whole policy (Q3) */}
        <div className={styles['footer']}>
          <div className={styles['footer__timing']}>
            <span className={styles['footer__timing-icon']} aria-hidden>
              <Icon size="16" glyph={<InformationOutlineIcon />} />
            </span>
            <div className={styles['footer__timing-lines']}>
              <p className={styles['footer__timing-line']}>
                <span className={styles['footer__timing-label']}>How this combines:</span>{' '}
                {TIGHTEN_ONLY_STATEMENT}
              </p>
              <p className={styles['footer__timing-line']}>
                <span className={styles['footer__timing-label']}>When it takes effect:</span>{' '}
                {REEVAL_CADENCE_COPY}
              </p>
            </div>
          </div>
          <div className={styles['footer__actions']}>
            <Button emphasis="Tertiary" onClick={goToList}>
              Cancel
            </Button>
            <Button emphasis="Primary" onClick={() => setGateOpen(true)}>
              Save
            </Button>
          </div>
        </div>
      </div>

      {gateOpen && (
        <ImpactGate
          policyName={policyName}
          startError={isError}
          initialState={gateResultsFromUrl ? 'results' : undefined}
          onClose={() => setGateOpen(false)}
        />
      )}
    </div>
  );
}
