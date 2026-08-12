import { useEffect, useRef, useState } from 'react';
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
import RefinedOptionsControl from './_components/RefinedOptionsControl';
import {
  PROGRAM_ATTRIBUTE,
  type GraphOption,
} from '@/pages/HierarchicalAttributeAuthoringV2/graphAuthoringModel';
import { seedPresetFor } from './seedPresets';
import styles from './HierarchicalAttributeAuthoringRefined.module.scss';

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

const TYPE_OPTIONS = [
  'Text',
  'Select',
  'Multiselect',
  'Ranked',
  'Hierarchical',
];

export default function HierarchicalAttributeAuthoringRefined() {
  const [params, setParams] = useSearchParams();
  const stateKey = (params.get('state') as StateKey) || 'populated';
  /** ?seed=classification swaps the option graph; default stays Programs. */
  const preset = seedPresetFor(params.get('seed'));
  /** ?demo=off hides the prototype-only band when embedded in a customer deck. */
  const showDemoBand = params.get('demo') !== 'off';
  /** ?focus=options scrolls straight to the option tree — for embedded demos. */
  const focusOptions = params.get('focus') === 'options';

  const [options, setOptions] = useState<GraphOption[]>(() =>
    stateKey === 'empty' ? [] : preset.options,
  );
  const [name, setName] = useState(preset.name);
  const [editors, setEditors] = useState<{
    roles: AccessGrant[];
    users: AccessGrant[];
  }>(preset.editors);

  const [prevSeedKey, setPrevSeedKey] = useState(preset.name);
  const [prevStateKey, setPrevStateKey] = useState(stateKey);
  if (stateKey !== prevStateKey || preset.name !== prevSeedKey) {
    setPrevStateKey(stateKey);
    setPrevSeedKey(preset.name);
    setOptions(stateKey === 'empty' ? [] : preset.options);
    setName(preset.name);
    setEditors(preset.editors);
  }

  const setState = (value: StateKey) => {
    const next = new URLSearchParams(params);
    next.set('state', value);
    setParams(next, { replace: true });
  };

  const seededState =
    stateKey === 'cycle-rejected'
      ? 'cycle-rejected'
      : stateKey === 'delete-blocked'
        ? 'delete-blocked'
        : null;

  const showTree = stateKey !== 'loading' && stateKey !== 'error';

  // Embedded in a deck, the option tree is the point — bring it into view
  // rather than making the presenter find it.
  //
  // Deliberately NOT `scrollIntoView`: inside an iframe that also scrolls the
  // embedding page, which yanks the deck's own header off screen. Move only
  // this page's scroll container. Retries until the row has laid out.
  const optionsRowRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!focusOptions || !showTree) return;
    let raf = 0;
    let attempts = 0;
    const scroll = () => {
      const el = optionsRowRef.current;
      const scroller = el?.closest<HTMLElement>('.simplebar-content-wrapper');
      if (el && scroller && el.getBoundingClientRect().height > 0) {
        const offset =
          el.getBoundingClientRect().top -
          scroller.getBoundingClientRect().top +
          scroller.scrollTop;
        scroller.scrollTop = Math.max(0, offset - 12);
        return;
      }
      if (attempts++ < 30) raf = requestAnimationFrame(scroll);
    };
    scroll();
    return () => cancelAnimationFrame(raf);
  }, [focusOptions, showTree, options]);

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
        {showDemoBand && (
          <div className={styles['demo']}>
            <span className={styles['demo__label']}>Prototype demo</span>
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
              Refined tree · authoring surface only · [AI DRAFT]
            </span>
          </div>
        )}

        <ConsolePageHeader
          title={name || 'Untitled attribute'}
          subtitle={preset.subtitle}
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

                      <div
                        className={detail['detail__row']}
                        ref={optionsRowRef}
                      >
                        <span className={detail['detail__key']}>Options</span>
                        <div className={detail['detail__field']}>
                          <RefinedOptionsControl
                            key={`${stateKey}-${preset.name}`}
                            options={options}
                            setOptions={setOptions}
                            seededState={seededState}
                            explainerLead={preset.explainerLead}
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
                      {preset.appliesTo.map((row) => (
                        <div
                          key={row.resource}
                          className={styles['applies__row']}
                        >
                          <span className={styles['applies__resource']}>
                            {row.resource}
                          </span>
                          <span className={styles['applies__detail']}>
                            {row.detail}
                          </span>
                        </div>
                      ))}
                      <p className={styles['applies__note']}>
                        {preset.appliesNote}
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
