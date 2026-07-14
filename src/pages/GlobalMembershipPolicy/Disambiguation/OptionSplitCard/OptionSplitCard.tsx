/**
 * O4 — Axis-per-side split card + sentence-form recap.
 *
 * Requirements (member axis) and Where (channel axis) sit side-by-side as two
 * panels within one card on wide viewports, each with its own header and role
 * glyph. A persistent generated policy sentence spans the top of the card:
 * "Members of [channels] must satisfy [requirements]." (Q4 = generated-only.)
 * On narrow viewports the panels stack, falling back to A's linear order.
 *
 * Spatial separation is the strongest signal that the two uses are independent;
 * the recap ties them back into one readable sentence.
 *
 * Deep-links: ?policy=<id> · ?state=populated|empty|error · ?scope=all|manual|rules
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PlusIcon from '@mattermost/compass-icons/components/plus';

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
  MANUAL_CHANNELS,
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
import styles from './OptionSplitCard.module.scss';

type ScreenState = 'populated' | 'empty' | 'error';
const VALID_STATES: ScreenState[] = ['populated', 'empty', 'error'];
const VALID_SCOPES: ScopeMode[] = ['all-where-set', 'manual', 'attribute-rules'];

function readParams() {
  return typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search)
    : new URLSearchParams();
}

export default function OptionSplitCard() {
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

  const sentence = buildPolicySentence({
    requirements,
    allRequired,
    advanced: false,
    scope,
    channelConditions,
    manualCount: manualChannels.length,
  });

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

            {/* The split card */}
            <div className={styles['card']}>
              <div className={styles['card__recap']}>
                <span className={styles['card__recap-label']}>This policy</span>
                <PolicySentenceBanner sentence={sentence} variant="card" />
              </div>

              <div className={styles['card__cols']}>
                {/* Left — Membership requirements (member axis) */}
                <section className={styles['col']} data-axis="members">
                  <div className={styles['col__head']}>
                    <span className={styles['col__glyph']}>
                      <MemberGlyph />
                    </span>
                    <div>
                      <h2 className={styles['col__title']}>
                        {AXES.members.sectionTitle}
                      </h2>
                      <p className={styles['col__framing']}>{AXES.members.framing}</p>
                    </div>
                  </div>

                  <div className={styles['col__body']}>
                    {requirements.length === 0 ? (
                      <div className={shared['empty']}>
                        <p className={shared['empty__title']}>
                          No attribute requirements yet.
                        </p>
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
                            <AllRequiredMenu
                              value={allRequired}
                              onChange={setAllRequired}
                            />
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
                  </div>
                </section>

                {/* Right — Where this policy applies (channel axis) */}
                <section className={styles['col']} data-axis="channels">
                  <div className={styles['col__head']}>
                    <span className={styles['col__glyph']}>
                      <ChannelGlyph />
                    </span>
                    <div>
                      <h2 className={styles['col__title']}>
                        {AXES.channels.sectionTitle}
                      </h2>
                      <p className={styles['col__framing']}>{AXES.channels.framing}</p>
                    </div>
                  </div>

                  <div className={styles['col__body']}>
                    <div className={styles['scope']}>
                      {SCOPE_OPTIONS.map((opt) => {
                        const selected = scope === opt.id;
                        const noChannelRef =
                          opt.id === 'all-where-set' && !referencesChannelAttr;
                        const title = noChannelRef
                          ? ALL_CHANNELS_NO_REF.title
                          : opt.title;
                        return (
                          <div
                            key={opt.id}
                            className={[
                              styles['scope__option'],
                              selected ? styles['scope__option--selected'] : '',
                            ].join(' ')}
                          >
                            <Radio
                              name="sc-scope"
                              checked={selected}
                              onChange={() => setScope(opt.id)}
                            >
                              <span className={styles['scope__title']}>{title}</span>
                            </Radio>

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
                                      Add a channel-attribute condition to target
                                      which channels this policy applies to.
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
                                        onChange={(next) =>
                                          patchCondition(cond.id, next)
                                        }
                                        onRemove={() => removeCondition(cond.id)}
                                      />
                                    ))}
                                  </div>
                                )}
                                <div className={styles['add-row']}>
                                  <Button
                                    emphasis="Tertiary"
                                    size="Small"
                                    leadingIcon={
                                      <Icon size="16" glyph={<PlusIcon />} />
                                    }
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
