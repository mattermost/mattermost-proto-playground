import { useSearchParams } from 'react-router-dom';
import AlertOutlineIcon from '@mattermost/compass-icons/components/alert-outline';
import ServerOutlineIcon from '@mattermost/compass-icons/components/server-outline';
import ConsoleSidebar from '@/components/ui/ConsoleSidebar/ConsoleSidebar';
import sidebarStyles from '@/components/ui/ConsoleSidebar/ConsoleSidebar.module.scss';
import ConsolePageHeader from '@/components/ui/ConsolePageHeader/ConsolePageHeader';
import ConsolePanel from '@/components/ui/ConsolePanel/ConsolePanel';
import Scrollbars from '@/components/ui/Scrollbars/Scrollbars';
import Select from '@/components/ui/Select/Select';
import Spinner from '@/components/ui/Spinner/Spinner';
import SectionNotice from '@/components/ui/SectionNotice/SectionNotice';
import Icon from '@/components/ui/Icon/Icon';
import avatarLeonard from '@/assets/avatars/Leonard Riley.png';
import {
  HUB_ACTIVE_ITEM,
  HUB_SIDEBAR_CATEGORIES,
} from '@/pages/AttributeManagementHub/hubSidebar';
import shell from '@/pages/AttributeHubSimplified/AttributeHubSimplified.module.scss';
import detail from '@/pages/AttributeHubSimplified/_components/SimplifiedDetailView.module.scss';
import ExternalSourceBanner from './_components/ExternalSourceBanner';
import ReadonlyTreeView from './_components/ReadonlyTreeView';
import { EXTERNAL_SOURCE, SEED_V2, type MaskMode } from './externalModel';
import styles from './HierarchicalAttributeExternalReadonly.module.scss';

type StateKey =
  | 'populated'
  | 'empty'
  | 'filtered-no-results'
  | 'loading'
  | 'error';

const STATE_OPTIONS: Array<{ value: StateKey; label: string }> = [
  { value: 'populated', label: 'Populated (synced 14-value graph)' },
  { value: 'empty', label: 'Connected · nothing synced yet' },
  { value: 'filtered-no-results', label: 'Filter · no results' },
  { value: 'loading', label: 'Syncing from source' },
  { value: 'error', label: 'Fail-secure error' },
];

const MASK_OPTIONS: Array<{ value: MaskMode; label: string }> = [
  { value: 'masked', label: 'Masked (keep position)' },
  { value: 'hidden', label: 'Hidden (omit)' },
];

export default function HierarchicalAttributeExternalReadonly() {
  const [params, setParams] = useSearchParams();
  const stateKey = (params.get('state') as StateKey) || 'populated';
  const maskMode = (params.get('mask') as MaskMode) || 'masked';

  const setParam = (key: 'state' | 'mask', value: string) => {
    const next = new URLSearchParams(params);
    next.set(key, value);
    setParams(next, { replace: true });
  };

  const showTree = stateKey !== 'loading' && stateKey !== 'error';
  const hasValues = stateKey !== 'empty';

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
            <span>State</span>
            <Select
              size="Small"
              width="fit"
              value={stateKey}
              aria-label="Demo state"
              onChange={(e) => setParam('state', e.target.value)}
            >
              {STATE_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </Select>
          </label>
          <label className={styles['demo__control']}>
            <span>Non-accessible</span>
            <Select
              size="Small"
              width="fit"
              value={maskMode}
              aria-label="Demo masking mode"
              onChange={(e) => setParam('mask', e.target.value)}
            >
              {MASK_OPTIONS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </Select>
          </label>
          <span className={styles['demo__note']}>
            External read-only view · [AI DRAFT]
          </span>
        </div>

        <ConsolePageHeader
          title="Program"
          subtitle="System Console → Attribute Management · Hierarchical · externally managed"
          tag="Hierarchical"
        />

        <div className={shell['console__scroll']}>
          <Scrollbars>
            <div className={shell['console__content']}>
              <ExternalSourceBanner
                status={stateKey === 'loading' ? 'syncing' : 'connected'}
              />

              {stateKey === 'loading' && (
                <div className={styles['status']}>
                  <Spinner size={32} aria-label="Syncing from source" />
                  <p className={styles['status__text']}>
                    Syncing values from {EXTERNAL_SOURCE}…
                  </p>
                </div>
              )}

              {stateKey === 'error' && (
                <SectionNotice
                  type="Danger"
                  icon={<Icon size="20" glyph={<AlertOutlineIcon />} />}
                  title="Fail-secure — couldn’t resolve the hierarchy"
                  description={`The value graph couldn’t be retrieved from ${EXTERNAL_SOURCE}. No relationships are assumed and access stays denied until it resolves. There is no retry-to-allow or bypass here.`}
                />
              )}

              {showTree && (
                <ConsolePanel
                  title="Values"
                  subtitle="The program hierarchy, as synced from the external source. Browse and filter — values can’t be changed here."
                >
                  <div className={detail['detail__def']}>
                    <div className={detail['detail__row']}>
                      <span className={detail['detail__key']}>Type</span>
                      <div className={detail['detail__field']}>
                        <span className={styles['readonly-value']}>
                          Hierarchical
                        </span>
                        <p className={detail['detail__lock']}>
                          Type is defined by the external source.
                        </p>
                      </div>
                    </div>

                    <div className={detail['detail__row']}>
                      <span className={detail['detail__key']}>Source</span>
                      <div className={detail['detail__field']}>
                        <span className={styles['readonly-value']}>
                          <Icon size="16" glyph={<ServerOutlineIcon />} />
                          {EXTERNAL_SOURCE}
                        </span>
                      </div>
                    </div>

                    <div className={detail['detail__row']}>
                      <span className={detail['detail__key']}>Values</span>
                      <div className={detail['detail__field']}>
                        {hasValues ? (
                          <ReadonlyTreeView
                            key={`${stateKey}:${maskMode}`}
                            options={SEED_V2}
                            maskMode={maskMode}
                            initialFilter={
                              stateKey === 'filtered-no-results'
                                ? 'zznomatch'
                                : ''
                            }
                          />
                        ) : (
                          <div className={styles['empty-values']}>
                            <p className={styles['empty-values__title']}>
                              No values synced yet
                            </p>
                            <p className={styles['empty-values__text']}>
                              The connection to {EXTERNAL_SOURCE} is healthy, but
                              no program values have arrived yet. They’ll appear
                              here automatically on the next sync.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </ConsolePanel>
              )}

              {showTree && hasValues && (
                <ConsolePanel
                  title="Applies to"
                  subtitle="Where this attribute is used across Mattermost."
                >
                  <div className={styles['applies']}>
                    {[
                      {
                        resource: 'Users',
                        detail:
                          'People carry one or more programs · values set from the external source',
                      },
                      {
                        resource: 'Channels',
                        detail:
                          'Channels are tagged with programs · drawn from the same synced value list',
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
                      Users and Channels share one synced value list, so program
                      access can be compared across them.
                    </p>
                  </div>
                </ConsolePanel>
              )}
            </div>
          </Scrollbars>
        </div>
      </div>
    </div>
  );
}
