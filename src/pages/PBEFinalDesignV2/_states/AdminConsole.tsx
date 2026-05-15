import { useState } from 'react';
import ShieldOutlineIcon from '@mattermost/compass-icons/components/shield-outline';
import ServerOutlineIcon from '@mattermost/compass-icons/components/server-outline';
import CogOutlineIcon from '@mattermost/compass-icons/components/cog-outline';
import AccountOutlineIcon from '@mattermost/compass-icons/components/account-outline';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import InformationOutlineIcon from '@mattermost/compass-icons/components/information-outline';
import CreditCardOutlineIcon from '@mattermost/compass-icons/components/credit-card-outline';
import ChartBarIcon from '@mattermost/compass-icons/components/chart-bar';
import AccountMultipleOutlineIcon from '@mattermost/compass-icons/components/account-multiple-outline';
import SitemapIcon from '@mattermost/compass-icons/components/sitemap';
import ServerVariantIcon from '@mattermost/compass-icons/components/server-variant';
import PowerPlugOutlineIcon from '@mattermost/compass-icons/components/power-plug-outline';
import FormatListBulletedIcon from '@mattermost/compass-icons/components/format-list-bulleted';
import FlaskOutlineIcon from '@mattermost/compass-icons/components/flask-outline';
import ChevronLeftIcon from '@mattermost/compass-icons/components/chevron-left';
import ChevronRightIcon from '@mattermost/compass-icons/components/chevron-right';

import ConsoleSidebar from '@/components/ui/ConsoleSidebar/ConsoleSidebar';
import type { ConsoleSidebarCategoryData } from '@/components/ui/ConsoleSidebar/ConsoleSidebar';
import ConsolePageHeader from '@/components/ui/ConsolePageHeader/ConsolePageHeader';
import ConsoleFooter from '@/components/ui/ConsoleFooter/ConsoleFooter';
import ConsolePanel from '@/components/ui/ConsolePanel/ConsolePanel';
import ConsoleSetting from '@/components/ui/ConsoleSetting/ConsoleSetting';
import ConsolePropertyTable from '@/components/ui/ConsolePropertyTable/ConsolePropertyTable';
import ConsolePropertyRow from '@/components/ui/ConsolePropertyRow/ConsolePropertyRow';
import Radio from '@/components/ui/Radio/Radio';
import Button from '@/components/ui/Button/Button';
import Chip from '@/components/ui/Chip/Chip';
import Icon from '@/components/ui/Icon/Icon';
import IconButton from '@/components/ui/IconButton/IconButton';
import LabelTag from '@/components/ui/LabelTag/LabelTag';
import type { LabelTagType } from '@/components/ui/LabelTag/LabelTag';
import SectionNotice from '@/components/ui/SectionNotice/SectionNotice';

import RadioCard from '../_components/RadioCard';
import RuleRow from '../_components/RuleRow';
import { eligibleEMs, avatars } from '../shared/fixtures';
import styles from './AdminConsole.module.scss';

// ── Sidebar categories ────────────────────────────────────────────────────
const CATEGORIES: ConsoleSidebarCategoryData[] = [
  {
    id: 'billing',
    label: 'Billing & Account',
    icon: <CreditCardOutlineIcon />,
    items: [{ id: 'subscription', label: 'Subscription' }],
  },
  {
    id: 'about',
    label: 'About',
    icon: <InformationOutlineIcon />,
    items: [{ id: 'edition-license', label: 'Edition and License' }],
  },
  {
    id: 'reporting',
    label: 'Reporting',
    icon: <ChartBarIcon />,
    items: [{ id: 'site-statistics', label: 'Site Statistics' }],
  },
  {
    id: 'user-management',
    label: 'User Management',
    icon: <AccountMultipleOutlineIcon />,
    items: [
      { id: 'users', label: 'Users' },
      { id: 'permissions', label: 'Permissions' },
    ],
  },
  {
    id: 'system-attributes',
    label: 'System Attributes',
    icon: <SitemapIcon />,
    items: [
      { id: 'user-attributes', label: 'User Attributes' },
      { id: 'permission-policies', label: 'Permission Policies' },
    ],
  },
  {
    id: 'environment',
    label: 'Environment',
    icon: <ServerVariantIcon />,
    items: [
      { id: 'web-server', label: 'Web Server' },
      { id: 'logging', label: 'Logging' },
    ],
  },
  {
    id: 'site-configuration',
    label: 'Site Configuration',
    icon: <CogOutlineIcon />,
    items: [{ id: 'customization', label: 'Customization' }],
  },
  {
    id: 'authentication',
    label: 'Authentication',
    icon: <ShieldOutlineIcon />,
    items: [{ id: 'mfa', label: 'MFA' }],
  },
  {
    id: 'plugins',
    label: 'Plugins',
    icon: <PowerPlugOutlineIcon />,
    items: [
      { id: 'plugin-management', label: 'Plugin Management' },
      { id: 'pbe', label: 'Externally Managed Encryption' },
      { id: 'agents', label: 'Agents' },
      { id: 'agenda', label: 'Agenda' },
      { id: 'autolink', label: 'Autolink' },
      { id: 'boards', label: 'Boards' },
      { id: 'giphy-plugin', label: 'Giphy Plugin' },
      { id: 'github', label: 'GitHub' },
      { id: 'jira', label: 'Jira' },
      { id: 'matterpoll', label: 'Matterpoll' },
      { id: 'ms-teams-meetings', label: 'MS Teams Meetings' },
      { id: 'playbooks', label: 'Playbooks' },
      { id: 'remind-bot', label: 'Remind Bot' },
      { id: 'user-satisfaction-surveys', label: 'User Satisfaction Surveys' },
      { id: 'welcome-bot', label: 'Welcome Bot' },
    ],
  },
  {
    id: 'integrations',
    label: 'Integrations',
    icon: <FormatListBulletedIcon />,
    items: [{ id: 'integration-management', label: 'Integration Management' }],
  },
  {
    id: 'experimental',
    label: 'Experimental',
    icon: <FlaskOutlineIcon />,
    items: [{ id: 'features', label: 'Features' }],
  },
];

// ── Key Manager fixture ──────────────────────────────────────────────────
type KeyManagerStatus = 'Active' | 'Coming Soon' | 'Talk to Us';

interface KeyManagerRow {
  type: string;
  libraryPath: string;
  configurations: string;
  status: KeyManagerStatus;
}

const KEY_MANAGERS: KeyManagerRow[] = [
  {
    type: 'PKCS#11',
    libraryPath: '/opt/homebrew/lib/softhsm/libsofthsm2.so',
    configurations: '1 configuration created',
    status: 'Active',
  },
  {
    type: 'Custom KMS Plugin',
    libraryPath: '–',
    configurations: '–',
    status: 'Talk to Us',
  },
  {
    type: 'AWS KMS',
    libraryPath: '–',
    configurations: '–',
    status: 'Coming Soon',
  },
  {
    type: 'Azure Key Vault',
    libraryPath: '–',
    configurations: '–',
    status: 'Coming Soon',
  },
];

// Per Figma node 4275:22963 (Compass Console — Key Managers table), only the
// Active row shows a LabelTag; non-active rows render a literal en-dash in the
// Status cell and the whole row is dimmed to 64% opacity. Casing All Caps to
// keep the high-density tabular hierarchy from the source.
const STATUS_TYPE: Record<KeyManagerStatus, LabelTagType> = {
  Active: 'Success',
  'Coming Soon': 'Info',
  'Talk to Us': 'Info',
};

type Eligibility = 'attribute' | 'specific' | 'all';

export default function AdminConsole() {
  const [activeItem, setActiveItem] = useState('pbe');
  const [pbeEnabled, setPbeEnabled] = useState(true);
  const [eligibility, setEligibility] = useState<Eligibility>('attribute');

  return (
    <div className={styles['admin-console']}>
      <ConsoleSidebar
        avatarSrc={avatars.currentUser}
        avatarAlt="Isabella Cruz"
        username="isabella.cruz"
        categories={CATEGORIES}
        activeItemId={activeItem}
        onItemClick={setActiveItem}
      />

      <div className={styles['admin-console__center']}>
        <ConsolePageHeader title="Externally Managed Encryption" />

        <div className={styles['admin-console__scroll']}>
          <div className={styles['admin-console__content']}>
            {/* Enable toggle row */}
            <ConsoleSetting
              label="Enable Externally Managed Encryption"
              helpText="When enabled, eligible Encryption Managers can create encrypted channels using the configured Key Manager."
            >
              <div className={styles['admin-console__radio-row']}>
                <Radio
                  name="em-enable"
                  checked={pbeEnabled}
                  onChange={() => setPbeEnabled(true)}
                >
                  True
                </Radio>
                <Radio
                  name="em-enable"
                  checked={!pbeEnabled}
                  onChange={() => setPbeEnabled(false)}
                >
                  False
                </Radio>
              </div>
            </ConsoleSetting>

            {/* Key Managers panel */}
            <ConsolePanel
              title="Key Managers"
              subtitle="Key Managers are configured via environment variables or config.json."
              buttonLabel="Learn more"
            >
              <ConsolePropertyTable
                sections={[
                  {
                    // Header widths align with ConsolePropertyRow's internal
                    // column structure: 16 (drag) + 128 (title) + value flex.
                    // Status sits at the trailing edge of the value cell.
                    columns: [
                      { key: 'pad', label: '', width: 16 },
                      { key: 'type', label: 'Type', width: 128 },
                      { key: 'path', label: 'Library Path' },
                      { key: 'configurations', label: 'Configurations', width: 200 },
                      { key: 'status', label: 'Status', width: 140 },
                    ],
                    rows: KEY_MANAGERS.map((km) => {
                      const isActive = km.status === 'Active';
                      return (
                        <ConsolePropertyRow
                          key={km.type}
                          title={km.type}
                          hideMore
                          className={
                            isActive ? undefined : styles['admin-console__km-row--dim']
                          }
                          value={
                            <>
                              <span className={styles['admin-console__km-mono']}>
                                {km.libraryPath}
                              </span>
                              <span className={styles['admin-console__km-config']}>
                                {km.configurations}
                              </span>
                              <span className={styles['admin-console__km-status']}>
                                {isActive ? (
                                  <LabelTag
                                    label={km.status}
                                    type={STATUS_TYPE[km.status]}
                                    size="X-Small"
                                    casing="All Caps"
                                  />
                                ) : (
                                  <span
                                    className={styles['admin-console__km-status-dash']}
                                    aria-label="Not available"
                                  >
                                    –
                                  </span>
                                )}
                              </span>
                            </>
                          }
                        />
                      );
                    }),
                  },
                ]}
              />

              <div className={styles['admin-console__table-footer']}>
                <span className={styles['admin-console__pagination-text']}>
                  1 - 4 of 4
                </span>
                <IconButton
                  size="X-Small"
                  aria-label="Previous page"
                  icon={<Icon size="12" glyph={<ChevronLeftIcon />} />}
                />
                <IconButton
                  size="X-Small"
                  aria-label="Next page"
                  icon={<Icon size="12" glyph={<ChevronRightIcon />} />}
                />
              </div>
            </ConsolePanel>

            {/* Encryption Manager Eligibility */}
            <ConsolePanel
              title="Encryption Manager Eligibility"
              subtitle="Who can manage configurations and create encrypted channels"
            >
              <div className={styles['admin-console__radio-group']}>
                {/* Attribute rules */}
                <RadioCard
                  name="eligibility"
                  value="attribute"
                  checked={eligibility === 'attribute'}
                  onSelect={(v) => setEligibility(v as Eligibility)}
                  label="Users matching attribute rules"
                  expandedBody={
                    <>
                      <div className={styles['admin-console__rule-list']}>
                        <RuleRow
                          index={1}
                          attribute="role"
                          operator="equals"
                          value="encryption_manager"
                        />
                        <RuleRow
                          index={2}
                          attribute="device_type"
                          operator="equals"
                          value="managed"
                        />
                      </div>
                      <div>
                        <Button
                          size="Small"
                          emphasis="Tertiary"
                          leadingIcon={<Icon size="16" glyph={<PlusIcon />} />}
                        >
                          Add rule
                        </Button>
                      </div>
                      <div className={styles['admin-console__rule-match-info']}>
                        Matching users:{' '}
                        <span className={styles['admin-console__rule-match-count']}>
                          3
                        </span>
                      </div>
                      <div className={styles['admin-console__attribute-note']}>
                        Users whose attributes match ALL rules above can create
                        configurations, create encrypted channels, and manage
                        channel membership. Attributes can be set manually or
                        synced from your identity provider.
                      </div>
                    </>
                  }
                />

                {/* Specific users */}
                <RadioCard
                  name="eligibility"
                  value="specific"
                  checked={eligibility === 'specific'}
                  onSelect={(v) => setEligibility(v as Eligibility)}
                  label="Specific users"
                  expandedBody={
                    <div className={styles['admin-console__chip-row']}>
                      {eligibleEMs.map((em) => (
                        <Chip
                          key={em.name}
                          leadingAvatar={{ src: em.avatarSrc, alt: em.name }}
                          onRemove={() => {}}
                        >
                          {em.name}
                        </Chip>
                      ))}
                      <input
                        type="text"
                        className={styles['admin-console__chip-input']}
                        placeholder="Search and select users…"
                        aria-label="Search and add users"
                      />
                    </div>
                  }
                />

                {/* All users */}
                <RadioCard
                  name="eligibility"
                  value="all"
                  checked={eligibility === 'all'}
                  onSelect={(v) => setEligibility(v as Eligibility)}
                  label="All users"
                  expandedBody={
                    <SectionNotice
                      type="Warning"
                      title="Not recommended for production"
                      description="All users will be able to create configurations and encrypted channels."
                    />
                  }
                />
              </div>

              <div className={styles['admin-console__eligibility-summary']}>
                <Icon size="16" glyph={<AccountOutlineIcon />} />
                <span className={styles['admin-console__eligibility-summary-text']}>
                  Currently eligible:
                </span>
                <Button size="Small" emphasis="Link">
                  3 users
                </Button>
              </div>
            </ConsolePanel>

            {/* Active Key Manager footnote */}
            <div className={styles['admin-console__active-km']}>
              <Icon size="12" glyph={<ServerOutlineIcon />} />
              <span>
                Active Key Manager: PKCS#11 (libsofthsm2.so) · 1 configuration
              </span>
            </div>
          </div>
        </div>

        <ConsoleFooter saveDisabled={false} />
      </div>
    </div>
  );
}
