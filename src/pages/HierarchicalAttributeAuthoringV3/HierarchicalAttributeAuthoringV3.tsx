import { useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import LockOutlineIcon from '@mattermost/compass-icons/components/lock-outline';
import ConsolePageHeader from '@/components/ui/ConsolePageHeader/ConsolePageHeader';
import ConsolePanel from '@/components/ui/ConsolePanel/ConsolePanel';
import ConsoleSidebar from '@/components/ui/ConsoleSidebar/ConsoleSidebar';
import sidebarStyles from '@/components/ui/ConsoleSidebar/ConsoleSidebar.module.scss';
import Icon from '@/components/ui/Icon/Icon';
import Scrollbars from '@/components/ui/Scrollbars/Scrollbars';
import SectionNotice from '@/components/ui/SectionNotice/SectionNotice';
import Select from '@/components/ui/Select/Select';
import Spinner from '@/components/ui/Spinner/Spinner';
import TextInput from '@/components/ui/TextInput/TextInput';
import avatarLeonard from '@/assets/avatars/Leonard Riley.png';
import {
  HUB_ACTIVE_ITEM,
  HUB_SIDEBAR_CATEGORIES,
} from '@/pages/AttributeManagementHub/hubSidebar';
import HoverTip from './_components/HoverTip';
import OwnershipSettings from './_components/OwnershipSettings';
import TypeChooser from './_components/TypeChooser';
import ValuesPanel, { type SeededValueState } from './_components/ValuesPanel';
import { type ValueRanking } from './v3GraphModel';
import type { HierValue } from './v3GraphModel';
import {
  CHAIN_SEED,
  LATTICE_SEED,
  EMPTY_PERMISSIONS,
  ORDER_SEED,
  PROGRAMS_APPLIES_TO,
  PROGRAMS_MACHINE_OWNER,
  PROGRAMS_PERMISSIONS,
  PROGRAMS_SEED,
  type AppliesToRow,
  type MachineOwner,
  type PermissionSettings,
} from './v3Seed';
import styles from './HierarchicalAttributeAuthoringV3.module.scss';

type StateKey =
  | 'populated'
  | 'empty'
  | 'create'
  | 'cycle-rejected'
  | 'delete-blocked'
  | 'delete-safe'
  | 'grant-confirm'
  | 'ordering'
  | 'single-chain'
  | 'lattice'
  | 'loading'
  | 'error';

const STATE_OPTIONS: Array<{ value: StateKey; label: string }> = [
  { value: 'populated', label: 'Populated — Programs graph' },
  { value: 'empty', label: 'Empty — nothing added yet' },
  { value: 'create', label: 'Create — choose the type' },
  { value: 'cycle-rejected', label: 'Loop refused' },
  { value: 'delete-blocked', label: 'Delete blocked — would orphan a value' },
  {
    value: 'delete-safe',
    label: 'Delete allowed — the value below has another parent',
  },
  { value: 'grant-confirm', label: 'Confirm a new grant' },
  {
    value: 'ordering',
    label: 'Ordering — one value at two different positions',
  },
  {
    value: 'lattice',
    label: 'Lattice — the guild visualization, 24 values / 37 edges',
  },
  {
    value: 'single-chain',
    label: 'One unbranched chain — the whole-attribute notice',
  },
  { value: 'loading', label: 'Loading' },
  { value: 'error', label: 'Values failed to load' },
];

const STATE_KEYS = new Set<string>(STATE_OPTIONS.map((option) => option.value));

const TYPE_OPTIONS = [
  'Text',
  'Select',
  'Multiselect',
  'Ranked',
  'Hierarchical',
];

interface Scenario {
  name: string;
  subtitle: string;
  values: HierValue[];
  permissions: PermissionSettings;
  machineOwner: MachineOwner | null;
  appliesTo: AppliesToRow[];
  seeded: SeededValueState;
}

const CONSOLE_PATH = 'System Console → Attribute Management';

function scenarioFor(state: StateKey, nameOverride: string | null): Scenario {
  if (state === 'empty') {
    return {
      name: nameOverride ?? '',
      // No policy claim and no applied resources: an attribute that has just
      // been created is not used by anything yet.
      subtitle: `${CONSOLE_PATH} · Hierarchical · not used by a policy yet`,
      values: [],
      permissions: EMPTY_PERMISSIONS,
      machineOwner: null,
      appliesTo: [],
      seeded: null,
    };
  }
  if (state === 'ordering') {
    return {
      name: 'Program',
      subtitle: `${CONSOLE_PATH} · Hierarchical · used by 2 policies`,
      values: ORDER_SEED,
      permissions: PROGRAMS_PERMISSIONS,
      machineOwner: null,
      appliesTo: [
        {
          resource: 'Users',
          detail:
            'People hold one or more programs. Position is listed per parent, so a rule can compare where a value sits under one command without touching where it sits under another.',
        },
      ],
      seeded: null,
    };
  }
  if (state === 'lattice') {
    return {
      name: 'Marking',
      subtitle: `${CONSOLE_PATH} · Hierarchical · used by 4 policies`,
      values: LATTICE_SEED,
      permissions: PROGRAMS_PERMISSIONS,
      machineOwner: null,
      appliesTo: [
        {
          resource: 'Users',
          detail:
            'People hold one composed marking. Every value pairs a secrecy level with a program, so a single value carries both axes at once.',
        },
        {
          resource: 'Channels',
          detail:
            'Channels are marked from the same list. A user passes if they hold the channel’s marking, or one above it on either axis.',
        },
      ],
      seeded: null,
    };
  }
  if (state === 'single-chain') {
    return {
      name: 'Command Echelon',
      subtitle: `${CONSOLE_PATH} · Hierarchical · used by 1 policy`,
      values: CHAIN_SEED,
      permissions: PROGRAMS_PERMISSIONS,
      machineOwner: null,
      appliesTo: [
        {
          resource: 'Users',
          detail:
            'People hold one echelon. A user passes if they hold the value on the channel, or a value above it.',
        },
      ],
      seeded: null,
    };
  }
  const seeded: SeededValueState =
    state === 'cycle-rejected' ||
    state === 'delete-blocked' ||
    state === 'delete-safe' ||
    state === 'grant-confirm'
      ? state
      : null;
  return {
    name: 'Program',
    subtitle: `${CONSOLE_PATH} · Hierarchical · used by 3 policies`,
    values: PROGRAMS_SEED,
    permissions: PROGRAMS_PERMISSIONS,
    machineOwner: PROGRAMS_MACHINE_OWNER,
    appliesTo: PROGRAMS_APPLIES_TO,
    seeded,
  };
}

/**
 * Hierarchical attribute authoring — V3. [AI DRAFT]
 *
 * Supersedes the "refined tree" surface. Every change here follows from one fact
 * about this attribute type: an edge is a privilege grant, not containment. If
 * Falcon Wing is a parent of Raptor Flight, everyone holding Falcon Wing reaches
 * everything marked Raptor Flight — so "nest under", "child options" and "appears
 * under" are the wrong words for the operation, and a display toggle that hides a
 * relationship is a security defect rather than a preference.
 *
 * What that produced, screen by screen:
 *  - The value list always renders every relationship; the only setting is an
 *    authoring gate on creating a NEW second parent, and it says so.
 *  - There is no primary parent. The display spine comes from `createAt`, the tag
 *    is "Shown here", and the parents list states that all parents grant equally.
 *  - Deletes are blocked only by genuine orphaning, and both the block and the
 *    confirm name the access at stake.
 *  - Adding a parent goes through a confirm that names the population being
 *    widened and counts the newly-reachable values.
 *  - The create state leads with the discriminating question and intercepts the
 *    known-bad "levels and groups in one attribute" answer before any value
 *    exists.
 *  - Ownership is read-only in core; human editing is a five-rung ladder split
 *    across three separate settings.
 */
export default function HierarchicalAttributeAuthoringV3() {
  const [params, setParams] = useSearchParams();
  // Attribute-level ranking setting. Ranked is the default for this prototype;
  // pass ?ranking=unranked to hide ordinals.
  const ranking: ValueRanking =
    params.get('ranking') === 'unranked' ? 'unranked' : 'ranked';
  // An unknown `state` falls back rather than rendering a scenario with no
  // matching entry in the picker — `?state=chain-detected` was retired when
  // chain-encoded ordering was removed, and old links still have to land somewhere.
  const stateParam = params.get('state');
  const stateKey: StateKey =
    stateParam && STATE_KEYS.has(stateParam)
      ? (stateParam as StateKey)
      : 'populated';
  const showDemoBand = params.get('demo') !== 'off';
  const nameParam = params.get('name');

  const scenario = scenarioFor(stateKey, nameParam);

  const [values, setValues] = useState<HierValue[]>(scenario.values);
  const [name, setName] = useState(scenario.name);
  const [permissions, setPermissions] = useState<PermissionSettings>(
    scenario.permissions,
  );

  // Re-seed when the deep-linked state changes, without an effect round-trip.
  const [prevKey, setPrevKey] = useState(`${stateKey}:${nameParam ?? ''}`);
  const key = `${stateKey}:${nameParam ?? ''}`;
  if (key !== prevKey) {
    setPrevKey(key);
    setValues(scenario.values);
    setName(scenario.name);
    setPermissions(scenario.permissions);
  }

  const scrollRef = useRef<HTMLDivElement>(null);

  const goToState = (next: StateKey, extra?: Record<string, string>) => {
    const search = new URLSearchParams(params);
    search.set('state', next);
    search.delete('name');
    for (const [k, value] of Object.entries(extra ?? {})) {
      search.set(k, value);
    }
    setParams(search, { replace: true });
  };

  const isCreate = stateKey === 'create';
  const isLoading = stateKey === 'loading';
  const isError = stateKey === 'error';

  return (
    <div className={styles['page']}>
      <ConsoleSidebar
        className={sidebarStyles['console-sidebar--product']}
        avatarSrc={avatarLeonard}
        avatarAlt="Leonard Riley"
        username="leonard.riley"
        categories={HUB_SIDEBAR_CATEGORIES}
        activeItemId={HUB_ACTIVE_ITEM}
      />

      <div className={styles['page__center']}>
        {showDemoBand && (
          <div className={styles['page__demo']}>
            <span className={styles['page__demo-label']}>Prototype demo</span>
            <label className={styles['page__demo-control']}>
              <span>State</span>
              <Select
                size="Small"
                width="fit"
                value={stateKey}
                aria-label="Demo state"
                onChange={(e) => goToState(e.target.value as StateKey)}
              >
                {STATE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </label>
            <span className={styles['page__demo-note']}>
              Hierarchical authoring V3 · edges are grants · [AI DRAFT]
            </span>
          </div>
        )}

        <ConsolePageHeader
          title={isCreate ? 'New attribute' : name || 'Untitled attribute'}
          subtitle={
            isCreate ? `${CONSOLE_PATH} · choosing a type` : scenario.subtitle
          }
          tag={isCreate ? undefined : 'Hierarchical'}
        />

        <div className={styles['page__scroll']} ref={scrollRef}>
          <Scrollbars>
            <div className={styles['page__content']}>
              {isLoading && (
                <div className={styles['page__status']}>
                  <Spinner size={32} aria-label="Loading values" />
                  <p className={styles['page__status-text']}>
                    Loading this attribute’s values…
                  </p>
                </div>
              )}

              {isCreate && (
                <ConsolePanel
                  title="What kind of attribute is this?"
                  subtitle="The answer decides the type, and the type can’t be changed afterwards."
                >
                  <TypeChooser
                    onCreateHierarchical={(created) =>
                      goToState('empty', { name: created })
                    }
                  />
                </ConsolePanel>
              )}

              {!isCreate && !isLoading && (
                <>
                  <ConsolePanel
                    title="Definition"
                    subtitle="What this attribute is called, and the values it holds."
                  >
                    <div className={styles['page__def']}>
                      <div className={styles['page__row']}>
                        <span className={styles['page__key']}>Name</span>
                        <div className={styles['page__field']}>
                          <TextInput
                            className={styles['page__input']}
                            size="Medium"
                            value={name}
                            placeholder="Name this attribute"
                            aria-label="Attribute name"
                            onChange={(e) => setName(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className={styles['page__row']}>
                        <span className={styles['page__key']}>Type</span>
                        <div className={styles['page__field']}>
                          <Select
                            className={styles['page__input']}
                            size="Medium"
                            value="Hierarchical"
                            readOnly
                            aria-label="Attribute type"
                          >
                            {TYPE_OPTIONS.map((type) => (
                              <option key={type} value={type}>
                                {type}
                              </option>
                            ))}
                          </Select>
                          <HoverTip
                            label="Type is fixed once an attribute exists"
                            hint="Hierarchical and Ranked can’t be converted into each other. Switching would mean a new attribute, re-assigning every user and channel, and rewriting every policy."
                          >
                            <span className={styles['page__lock']}>
                              <Icon size="12" glyph={<LockOutlineIcon />} />
                              Can’t be changed after creation
                            </span>
                          </HoverTip>
                        </div>
                      </div>

                      <div className={styles['page__row']}>
                        <span className={styles['page__key']}>Values</span>
                        <div className={styles['page__field']}>
                          {isError ? (
                            // Scoped to this region on purpose: the name, the
                            // type, the permissions and where the attribute
                            // applies have nothing to do with resolving the
                            // hierarchy, so they stay usable.
                            <SectionNotice
                              type="Danger"
                              title="We couldn’t load this attribute’s values"
                              description="Access hasn’t changed and nothing is being guessed in the meantime — anyone who would need one of these values to get in stays out until the list loads. Values can’t be added or edited here until then."
                              primaryButtonLabel="Try again"
                              onPrimaryAction={() => goToState('populated')}
                            />
                          ) : (
                            <ValuesPanel
                              key={key}
                              values={values}
                              setValues={setValues}
                              boundaryRef={scrollRef}
                              seededState={scenario.seeded}
                              initialRanking={ranking}
                              onStartRankedAttribute={() => goToState('create')}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </ConsolePanel>

                  <ConsolePanel
                    title="Who can change what"
                    subtitle="Human roles are a fixed ladder. Machine owners are assigned in their own integration."
                  >
                    <OwnershipSettings
                      settings={permissions}
                      onChange={setPermissions}
                      machineOwner={scenario.machineOwner}
                    />
                  </ConsolePanel>

                  <ConsolePanel
                    title="Applies to"
                    subtitle="Where this attribute can be set, and how it is checked."
                  >
                    <div className={styles['page__applies']}>
                      {scenario.appliesTo.length === 0 ? (
                        <p className={styles['page__applies-empty']}>
                          Not applied anywhere yet. Choose where this attribute
                          can be set once it has values.
                        </p>
                      ) : (
                        scenario.appliesTo.map((row) => (
                          <div
                            key={row.resource}
                            className={styles['page__applies-row']}
                          >
                            <span className={styles['page__applies-resource']}>
                              {row.resource}
                            </span>
                            <span className={styles['page__applies-detail']}>
                              {row.detail}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </ConsolePanel>
                </>
              )}
            </div>
          </Scrollbars>
        </div>
      </div>
    </div>
  );
}
