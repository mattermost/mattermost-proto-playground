import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import AlertOutlineIcon from '@mattermost/compass-icons/components/alert-outline';
import ConsoleSidebar from '@/components/ui/ConsoleSidebar/ConsoleSidebar';
import sidebarStyles from '@/components/ui/ConsoleSidebar/ConsoleSidebar.module.scss';
import ConsolePageHeader from '@/components/ui/ConsolePageHeader/ConsolePageHeader';
import ConsolePanel from '@/components/ui/ConsolePanel/ConsolePanel';
import Scrollbars from '@/components/ui/Scrollbars/Scrollbars';
import Select from '@/components/ui/Select/Select';
import Spinner from '@/components/ui/Spinner/Spinner';
import SectionNotice from '@/components/ui/SectionNotice/SectionNotice';
import TextInput from '@/components/ui/TextInput/TextInput';
import Icon from '@/components/ui/Icon/Icon';
import avatarLeonard from '@/assets/avatars/Leonard Riley.png';
import {
  HUB_ACTIVE_ITEM,
  HUB_SIDEBAR_CATEGORIES,
} from '@/pages/AttributeManagementHub/hubSidebar';
import type { AccessGrant } from '@/pages/AttributeManagementHub/hubData';
import WhoCanEdit from '@/pages/AttributeHubSimplified/_components/WhoCanEdit';
import shell from '@/pages/AttributeHubSimplified/AttributeHubSimplified.module.scss';
import detail from '@/pages/AttributeHubSimplified/_components/SimplifiedDetailView.module.scss';
import GraphOptionsControl from './_components/GraphOptionsControl';
import {
  PROGRAM_ATTRIBUTE,
  PROGRAM_EDITORS,
  SEED_V2,
  type GraphOption,
  type UiApproach,
} from './graphAuthoringModel';
import styles from './HierarchicalAttributeAuthoringV2.module.scss';

type StateKey =
  | 'populated'
  | 'empty'
  | 'cycle-rejected'
  | 'delete-blocked'
  | 'loading'
  | 'error';

const STATE_OPTIONS: Array<{ value: StateKey; label: string }> = [
  { value: 'populated', label: 'Populated (14-node Programs graph)' },
  { value: 'empty', label: 'Create from scratch (empty)' },
  { value: 'cycle-rejected', label: 'Add-parent blocked — cycle' },
  { value: 'delete-blocked', label: 'Delete blocked — has children' },
  { value: 'loading', label: 'Loading' },
  { value: 'error', label: 'Fail-secure error' },
];

// Bake-off representation dimension (04c). Neutral reviewer labels; codenames
// kept ONLY inside this demo band, never in the simulated product surface.
const UI_OPTIONS: Array<{ value: UiApproach; label: string; note: string }> = [
  {
    value: 'stubs',
    label: 'Reference stubs (GA-0)',
    note: 'Extra parents show as read-only rows in place',
  },
  {
    value: 'chips',
    label: 'Parent chips (GA-1)',
    note: 'Extra parents show as chips on the node’s own row',
  },
  {
    value: 'hybrid',
    label: 'Chips + peek (GA-4)',
    note: 'Chips by default, with an on-demand spatial peek',
  },
];

const TYPE_OPTIONS = ['Text', 'Select', 'Multiselect', 'Ranked', 'Hierarchical'];

export default function HierarchicalAttributeAuthoringV2() {
  const [params, setParams] = useSearchParams();
  const stateKey = (params.get('state') as StateKey) || 'populated';
  const uiParam = params.get('ui') as UiApproach | null;
  const uiApproach: UiApproach =
    uiParam === 'chips' || uiParam === 'hybrid' ? uiParam : 'stubs';

  const [options, setOptions] = useState<GraphOption[]>(() =>
    stateKey === 'empty' ? [] : SEED_V2,
  );
  const [name, setName] = useState('Program');
  const [editors, setEditors] = useState<{
    roles: AccessGrant[];
    users: AccessGrant[];
  }>(PROGRAM_EDITORS);

  // Reset the graph to match the selected demo state SYNCHRONOUSLY during render
  // (not in an effect) so the Options control mounts with the correct dataset —
  // its "Allow cross-references" default reads whether the seed is multi-parent.
  const [prevStateKey, setPrevStateKey] = useState(stateKey);
  if (stateKey !== prevStateKey) {
    setPrevStateKey(stateKey);
    setOptions(stateKey === 'empty' ? [] : SEED_V2);
  }

  const setState = (value: StateKey) => {
    const next = new URLSearchParams(params);
    next.set('state', value);
    setParams(next, { replace: true });
  };

  const setUi = (value: UiApproach) => {
    const next = new URLSearchParams(params);
    next.set('ui', value);
    setParams(next, { replace: true });
  };

  const uiNote = UI_OPTIONS.find((u) => u.value === uiApproach)?.note ?? '';

  const seededState =
    stateKey === 'cycle-rejected'
      ? 'cycle-rejected'
      : stateKey === 'delete-blocked'
        ? 'delete-blocked'
        : null;

  const showTree = stateKey !== 'loading' && stateKey !== 'error';

  return (
    <div className={shell['console']}>
      <ConsoleSidebar
        className={sidebarStyles['console-sidebar--product']}
        avatarSrc={avatarLeonard}
        avatarAlt="Leonard Riley"
        username="leonard.riley"
        categories={HUB_SIDEBAR_CATEGORIES}
        activeItemId={HUB_ACTIVE_ITEM}
      />
      <div className={shell['console__center']}>
        {/* Demo-only band — NOT part of the product surface. */}
        <div className={styles['demo']}>
          <span className={styles['demo__label']}>Prototype demo</span>
          <label className={styles['demo__control']}>
            <span>Representation</span>
            <Select
              size="Small"
              width="fit"
              value={uiApproach}
              aria-label="Representation approach"
              onChange={(e) => setUi(e.target.value as UiApproach)}
            >
              {UI_OPTIONS.map((u) => (
                <option key={u.value} value={u.value}>
                  {u.label}
                </option>
              ))}
            </Select>
          </label>
          <label className={styles['demo__control']}>
            <span>State</span>
            <Select
              size="Small"
              width="fit"
              value={stateKey}
              aria-label="Demo state"
              onChange={(e) => setState(e.target.value as StateKey)}
            >
              {STATE_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </Select>
          </label>
          <span className={styles['demo__note']}>
            {uiNote} · authoring surface only · [AI DRAFT]
          </span>
        </div>

        <ConsolePageHeader
          title={name || 'Untitled attribute'}
          subtitle="System Console → Attribute Management · Hierarchical · used by 3 policies"
          tag="Hierarchical"
        />

        <div className={shell['console__scroll']}>
          <Scrollbars>
            <div className={shell['console__content']}>
              {stateKey === 'loading' && (
                <div className={styles['status']}>
                  <Spinner size={32} aria-label="Loading options" />
                  <p className={styles['status__text']}>Loading options…</p>
                </div>
              )}

              {stateKey === 'error' && (
                <SectionNotice
                  type="Danger"
                  icon={<Icon size="20" glyph={<AlertOutlineIcon />} />}
                  title="Fail-secure — couldn’t resolve the hierarchy"
                  description="The option graph couldn’t be loaded. No relationships are assumed and access stays denied until it resolves. There is no retry-to-allow or bypass here."
                />
              )}

              {showTree && (
                <>
                  <ConsolePanel
                    title="Definition"
                    subtitle="Name, type, options, and editors."
                  >
                    <div className={detail['detail__def']}>
                      <div className={detail['detail__row']}>
                        <span className={detail['detail__key']}>Name</span>
                        <div className={detail['detail__field']}>
                          <TextInput
                            className={detail['detail__input']}
                            size="Medium"
                            value={name}
                            aria-label="Attribute name"
                            onChange={(e) => setName(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className={detail['detail__row']}>
                        <span className={detail['detail__key']}>Type</span>
                        <div className={detail['detail__field']}>
                          <Select
                            className={detail['detail__input']}
                            size="Medium"
                            value="Hierarchical"
                            readOnly
                            aria-label="Attribute type"
                          >
                            {TYPE_OPTIONS.map((t) => (
                              <option key={t} value={t}>
                                {t}
                              </option>
                            ))}
                          </Select>
                          <p className={detail['detail__lock']}>
                            Type can’t change after creation.
                          </p>
                        </div>
                      </div>

                      <div className={detail['detail__row']}>
                        <span className={detail['detail__key']}>Options</span>
                        <div className={detail['detail__field']}>
                          <GraphOptionsControl
                            key={`${stateKey}:${uiApproach}`}
                            options={options}
                            setOptions={setOptions}
                            seededState={seededState}
                            uiApproach={uiApproach}
                          />
                        </div>
                      </div>

                      <div className={detail['detail__row']}>
                        <span className={detail['detail__key']}>
                          Who can edit
                        </span>
                        <div className={detail['detail__field']}>
                          <WhoCanEdit
                            attribute={PROGRAM_ATTRIBUTE}
                            editors={editors}
                            onChange={setEditors}
                          />
                        </div>
                      </div>
                    </div>
                  </ConsolePanel>

                  <ConsolePanel
                    title="Applies to"
                    subtitle="Where this attribute applies, and who can set the value on each."
                  >
                    <div className={styles['applies']}>
                      {[
                        {
                          resource: 'Users',
                          detail:
                            'People hold one or more programs · anyone in Security Administrators can set',
                        },
                        {
                          resource: 'Channels',
                          detail:
                            'Channels are tagged with programs · draws from the same option list',
                        },
                      ].map((row) => (
                        <div key={row.resource} className={styles['applies__row']}>
                          <span className={styles['applies__resource']}>
                            {row.resource}
                          </span>
                          <span className={styles['applies__detail']}>
                            {row.detail}
                          </span>
                        </div>
                      ))}
                      <p className={styles['applies__note']}>
                        Users and Channels share one option list, so program
                        access can be compared across them.
                      </p>
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
