/**
 * O2 — Semantic role framing + iconography/color.
 *
 * The committed single-page editor, refined so the two independent uses of
 * channel attributes read as different questions:
 *   - "Membership requirements" gets a person glyph + a member-tinted (info)
 *     accent bar; every requirement row shows a member marker; a channel
 *     attribute used on the RHS keeps its "Channel:" prefix (via ValuePicker).
 *   - "Where this policy applies" gets a channels glyph + a channel-tinted
 *     (success) accent bar; every scope condition row shows a channel marker.
 * A one-line role framing under each header loads the correct mental model
 * before the reader parses the rows. Layout is otherwise unchanged from A.
 *
 * Deep-links: ?policy=<id> · ?state=populated|empty|error · ?scope=all|manual|rules
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import CodeBracketsIcon from '@mattermost/compass-icons/components/code-brackets';
import FormatListBulletedIcon from '@mattermost/compass-icons/components/format-list-bulleted';
import InformationOutlineIcon from '@mattermost/compass-icons/components/information-outline';

import ConsoleSidebar from '@/components/ui/ConsoleSidebar/ConsoleSidebar';
import ConsolePageHeader from '@/components/ui/ConsolePageHeader/ConsolePageHeader';
import ConsoleFooter from '@/components/ui/ConsoleFooter/ConsoleFooter';
import Button from '@/components/ui/Button/Button';
import Icon from '@/components/ui/Icon/Icon';
import Radio from '@/components/ui/Radio/Radio';
import SectionNotice from '@/components/ui/SectionNotice/SectionNotice';

import avatarLeonard from '@/assets/avatars/Leonard Riley.png';

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
import { AXES } from '../shared/policySentence';
import ImpactGate from '../shared/ImpactGate';
import shared from '../shared/DisambiguationParts.module.scss';
import styles from './OptionRoleFraming.module.scss';

type ScreenState = 'populated' | 'empty' | 'error';
const VALID_STATES: ScreenState[] = ['populated', 'empty', 'error'];
const VALID_SCOPES: ScopeMode[] = ['all-where-set', 'manual', 'attribute-rules'];

function readParams() {
  return typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search)
    : new URLSearchParams();
}

export default function OptionRoleFraming() {
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

  const seedRequirements = isEmpty ? [] : (preset?.requirements ?? SEED_REQUIREMENTS);
  const initialReferencesChannelAttr = seedRequirements.some(
    (r) => r.value.mode === 'variable',
  );

  const [active, setActive] = useState('membership-policies');
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
  const [gateOpen, setGateOpen] = useState(false);

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

  const goToList = () => navigate(GMP_ROUTES.list);
  const handleSidebarClick = (itemId: string) => {
    setActive(itemId);
    if (itemId === 'membership-policies') goToList();
  };

  const typeMeta = CHANNEL_TYPE_CONSEQUENCE[channelType];

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

        <div className={styles['scene__scroll']}>
          <div className={styles['scene__page']}>
            {isError && (
              <SectionNotice
                type="Danger"
                title="Couldn’t save this policy"
                description="A requirement references Channel: Classification, but some channels in scope don’t have it set. Fix the highlighted row or narrow the scope, then try again."
              />
            )}

            {/* Two-axes explainer — in-product framing, not a meta annotation */}
            <div className={styles['explainer']}>
              <span className={styles['explainer__chip']} data-axis="members">
                <MemberGlyph size="12" />
                {AXES.members.tabLabel} · {AXES.members.caption}
              </span>
              <span className={styles['explainer__chip']} data-axis="channels">
                <ChannelGlyph size="12" />
                {AXES.channels.tabLabel} · {AXES.channels.caption}
              </span>
              <span className={styles['explainer__text']}>
                Channel attributes can appear in both — compared to a member in
                requirements, or used to select channels in scope.
              </span>
            </div>

            {/* Name field */}
            <div className={styles['field']}>
              <label className={styles['field__label']} htmlFor="policy-name">
                {TERMS.nameLabel}
              </label>
              <div className={styles['field__control']}>
                <input
                  id="policy-name"
                  className={styles['field__input']}
                  value={policyName}
                  placeholder="Clearance required"
                  onChange={(e) => setPolicyName(e.target.value)}
                />
                <p className={styles['field__help']}>{TERMS.nameHelp}</p>
              </div>
            </div>

            {/* Section 1 — Membership requirements (member axis) */}
            <section className={styles['panel']} data-axis="members">
              <div className={styles['panel__head']}>
                <div className={styles['panel__title-area']}>
                  <span className={styles['panel__glyph']}>
                    <MemberGlyph />
                  </span>
                  <div>
                    <h2 className={styles['panel__title']}>{AXES.members.sectionTitle}</h2>
                    <p className={styles['panel__framing']}>{AXES.members.framing}</p>
                  </div>
                </div>
                <div className={styles['segmented']} role="group" aria-label="Editor mode">
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

              <div className={styles['panel__body']}>
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
                    <p className={shared['empty__title']}>No attribute requirements yet.</p>
                    <p className={shared['empty__body']}>
                      Add a requirement to define who qualifies for membership.
                    </p>
                  </div>
                ) : (
                  <div className={shared['table']}>
                    <div className={shared['table__head']}>
                      <span />
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
              </div>
            </section>

            {/* Section 2 — Where this policy applies (channel axis) */}
            <section className={styles['panel']} data-axis="channels">
              <div className={styles['panel__head']}>
                <div className={styles['panel__title-area']}>
                  <span className={styles['panel__glyph']}>
                    <ChannelGlyph />
                  </span>
                  <div>
                    <h2 className={styles['panel__title']}>{AXES.channels.sectionTitle}</h2>
                    <p className={styles['panel__framing']}>{AXES.channels.framing}</p>
                  </div>
                </div>
              </div>

              <div className={styles['panel__body']}>
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
                          name="rf-scope"
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
                                <div className={shared['table__head']}>
                                  <span />
                                  <span>Channel attribute</span>
                                  <span>Operator</span>
                                  <span>Value</span>
                                  <span />
                                </div>
                                {channelConditions.map((cond) => (
                                  <ChannelConditionRow
                                    key={cond.id}
                                    cond={cond}
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
              </div>
            </section>
          </div>
        </div>

        <div className={styles['timing']}>
          <span className={styles['timing__icon']} aria-hidden>
            <Icon size="16" glyph={<InformationOutlineIcon />} />
          </span>
          <div className={styles['timing__lines']}>
            <p className={styles['timing__line']}>
              <span className={styles['timing__label']}>How this combines:</span>{' '}
              {TIGHTEN_ONLY_STATEMENT}
            </p>
            <p className={styles['timing__line']}>
              <span className={styles['timing__label']}>When it takes effect:</span>{' '}
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
          policyName={policyName}
          startError={isError}
          onClose={() => setGateOpen(false)}
        />
      )}
    </div>
  );
}
