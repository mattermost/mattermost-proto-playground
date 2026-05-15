/**
 * A4 — Channel Settings modal (Info tab) with Allow Knocks section.
 *
 * Visual chrome ported from the canonical Mattermost Figma (file
 * KUFeXCQAefySaR5Wq3GkeU, node 3686:45510): a wide ~960×720 modal with a
 * left settings sidebar (Info / Membership Policy / Configuration / Archive)
 * and a right content pane.
 *
 * A4 mechanism note: A4 has no per-channel Discoverable attribute — the
 * Discoverable section in the Figma is replaced by an "Allow knocks" master
 * toggle with four sub-toggles for the reference channels (permalink,
 * mention, recommendation, prior-membership). FR-3 atomicity is vacuously
 * satisfied so there is no Confirm-and-Commit modal (§3.4.4).
 *
 * The component signature is preserved so A4.tsx wiring is untouched.
 */
import { useState } from 'react';
import InformationOutlineIcon from '@mattermost/compass-icons/components/information-outline';
import ShieldOutlineIcon from '@mattermost/compass-icons/components/shield-outline';
import CogOutlineIcon from '@mattermost/compass-icons/components/cog-outline';
import ArchiveOutlineIcon from '@mattermost/compass-icons/components/archive-outline';
import CloseIcon from '@mattermost/compass-icons/components/close';
import EyeOutlineIcon from '@mattermost/compass-icons/components/eye-outline';
import GlobeIcon from '@mattermost/compass-icons/components/globe';
import LockOutlineIcon from '@mattermost/compass-icons/components/lock-outline';
import CheckIcon from '@mattermost/compass-icons/components/check';
import Switch from '@/components/ui/Switch/Switch';
import Button from '@/components/ui/Button/Button';
import TextInput from '@/components/ui/TextInput/TextInput';
import TextArea from '@/components/ui/TextArea/TextArea';
import IconButton from '@/components/ui/IconButton/IconButton';
import Icon from '@/components/ui/Icon/Icon';
import Radio from '@/components/ui/Radio/Radio';
import SectionNotice from '@/components/ui/SectionNotice/SectionNotice';
import { findChannel } from '../useA4Store';
import type {
  AllowKnocksConfig,
  RecommendationPermission,
  ReferenceSource,
} from '../useA4Store';
import styles from './ChannelSettings.module.scss';

export interface ChannelSettingsProps {
  channelId: string;
  config: AllowKnocksConfig;
  actor: string;
  /** Whether the device viewport is mobile — KD-8 web-only at launch notice. */
  isMobile?: boolean;
  onEnableAllowKnocks(): void;
  onDisableAllowKnocks(): void;
  onSetSubToggle(source: ReferenceSource, value: boolean): void;
  onSetRecommendationPermission(value: RecommendationPermission): void;
}

type SidebarKey = 'info' | 'membership-policy' | 'configuration' | 'archive';

const SIDEBAR_ITEMS: Array<{
  key: SidebarKey;
  label: string;
  glyph: React.ReactNode;
}> = [
  { key: 'info', label: 'Info', glyph: <InformationOutlineIcon /> },
  {
    key: 'membership-policy',
    label: 'Membership Policy',
    glyph: <ShieldOutlineIcon />,
  },
  { key: 'configuration', label: 'Configuration', glyph: <CogOutlineIcon /> },
];

export default function ChannelSettings({
  channelId,
  config,
  isMobile = false,
  onEnableAllowKnocks,
  onDisableAllowKnocks,
  onSetSubToggle,
  onSetRecommendationPermission,
}: ChannelSettingsProps) {
  const channel = findChannel(channelId);
  const [activeKey, setActiveKey] = useState<SidebarKey>('info');

  if (!channel) return null;

  if (isMobile) {
    return (
      <div className={styles['channel-settings-mobile']}>
        <SectionNotice
          type="Info"
          title="Web-only at launch (KD-8)"
          description="The Allow Knocks settings panel is not available on mobile in v1. Open this prototype on a desktop viewport to configure Allow Knocks."
        />
      </div>
    );
  }

  return (
    <section className={styles['channel-settings']} aria-label="Channel Settings">
      <header className={styles['channel-settings__header']}>
        <div className={styles['channel-settings__header-left']}>
          <h2 className={styles['channel-settings__title']}>Channel Settings</h2>
          <span
            className={styles['channel-settings__title-divider']}
            aria-hidden
          />
          <span className={styles['channel-settings__subtitle']}>
            {channel.displayName}
          </span>
        </div>
        <IconButton
          aria-label="Close"
          icon={<Icon size="20" glyph={<CloseIcon />} />}
        />
      </header>

      <div className={styles['channel-settings__body']}>
        <nav className={styles['channel-settings__sidebar']} aria-label="Settings sections">
          {SIDEBAR_ITEMS.map((item) => {
            const isActive = activeKey === item.key;
            return (
              <button
                key={item.key}
                type="button"
                className={[
                  styles['channel-settings__sidebar-item'],
                  isActive
                    ? styles['channel-settings__sidebar-item--active']
                    : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => setActiveKey(item.key)}
              >
                <Icon size="16" glyph={item.glyph} />
                <span>{item.label}</span>
              </button>
            );
          })}
          <div
            className={styles['channel-settings__sidebar-divider']}
            aria-hidden
          />
          <button
            type="button"
            className={styles['channel-settings__sidebar-item']}
          >
            <Icon size="16" glyph={<ArchiveOutlineIcon />} />
            <span>Archive channel</span>
          </button>
        </nav>

        <div
          className={styles['channel-settings__sidebar-divider-vertical']}
          aria-hidden
        />

        <div className={styles['channel-settings__content']}>
          {activeKey === 'info' ? (
            <InfoTab
              channelName={channel.displayName}
              channelPurpose={channel.purpose}
              isPrivate={channel.kind === 'private'}
              config={config}
              channelId={channelId}
              onEnableAllowKnocks={onEnableAllowKnocks}
              onDisableAllowKnocks={onDisableAllowKnocks}
              onSetSubToggle={onSetSubToggle}
              onSetRecommendationPermission={onSetRecommendationPermission}
            />
          ) : (
            <div className={styles['channel-settings__placeholder']}>
              <p>
                {SIDEBAR_ITEMS.find((s) => s.key === activeKey)?.label}{' '}
                is out of scope for the A4 prototype — see §3.4.13.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

interface InfoTabProps {
  channelName: string;
  channelPurpose: string;
  isPrivate: boolean;
  config: AllowKnocksConfig;
  channelId: string;
  onEnableAllowKnocks(): void;
  onDisableAllowKnocks(): void;
  onSetSubToggle(source: ReferenceSource, value: boolean): void;
  onSetRecommendationPermission(value: RecommendationPermission): void;
}

function InfoTab({
  channelName,
  channelPurpose,
  isPrivate,
  config,
  channelId,
  onEnableAllowKnocks,
  onDisableAllowKnocks,
  onSetSubToggle,
  onSetRecommendationPermission,
}: InfoTabProps) {
  const [purpose, setPurpose] = useState(channelPurpose);
  const [header, setHeader] = useState('');

  return (
    <div className={styles['channel-settings__info']}>
      <TextInput
        label="Channel name"
        defaultValue={channelName}
        size="Medium"
      />

      <div className={styles['channel-settings__url-row']}>
        <span className={styles['channel-settings__url-text']}>
          URL: https://community.mattermost.com…channels/{channelName}
        </span>
        <Button emphasis="Quaternary" size="Small">
          Edit
        </Button>
      </div>

      <div className={styles['channel-settings__privacy-cards']}>
        <PrivacyCard
          icon={<GlobeIcon />}
          title="Public channel"
          subtitle="Anyone can join"
          selected={!isPrivate}
        />
        <PrivacyCard
          icon={<LockOutlineIcon />}
          title="Private channel"
          subtitle="Only invited members"
          selected={isPrivate}
        />
      </div>

      <div className={styles['channel-settings__discoverable']}>
        <div className={styles['channel-settings__discoverable-text']}>
          <span className={styles['channel-settings__discoverable-title']}>
            Allow knocks
          </span>
          <span className={styles['channel-settings__discoverable-help']}>
            When on, users who acquire a reference to this channel can request
            access via a knock. Knocks route to channel admins for approval.
            Channel content stays hidden until a knock is accepted.
          </span>
        </div>
        <Switch
          size="Medium"
          checked={config.master}
          onChange={(e) => {
            if ((e.target as HTMLInputElement).checked) onEnableAllowKnocks();
            else onDisableAllowKnocks();
          }}
          aria-label="Allow knocks"
        />
      </div>

      <fieldset
        className={styles['channel-settings__a4-sub']}
        disabled={!config.master}
      >
        <legend className={styles['channel-settings__a4-legend']}>
          Which references can trigger a knock
        </legend>
        <SubToggle
          label="Permalink unfurls"
          help="Users who receive a permalink to a post in this channel see a “Knock to request access” affordance."
          checked={config.permalinkUnfurls && config.master}
          disabled={!config.master}
          onChange={(v) => onSetSubToggle('permalink', v)}
        />
        <SubToggle
          label="@mention notifications"
          help="Users mentioned from this channel see a “Knock to request” affordance in their at-mentions activity."
          checked={config.mentionInterceptions && config.master}
          disabled={!config.master}
          onChange={(v) => onSetSubToggle('mention', v)}
        />
        <SubToggle
          label="Member recommendations"
          help="Existing members can send a DM recommendation that contains a knock affordance."
          checked={config.memberRecommendations && config.master}
          disabled={!config.master}
          onChange={(v) => onSetSubToggle('recommendation', v)}
        />
        <fieldset
          className={styles['channel-settings__a4-radio-set']}
          disabled={!config.master || !config.memberRecommendations}
        >
          <legend className={styles['channel-settings__a4-radio-legend']}>
            Who can recommend this channel
          </legend>
          <Radio
            name={`rec-perm-${channelId}`}
            value="all-members"
            checked={config.recommendationPermission === 'all-members'}
            onChange={() => onSetRecommendationPermission('all-members')}
          >
            All members
          </Radio>
          <Radio
            name={`rec-perm-${channelId}`}
            value="channel-admins-only"
            checked={
              config.recommendationPermission === 'channel-admins-only'
            }
            onChange={() =>
              onSetRecommendationPermission('channel-admins-only')
            }
          >
            Channel admins only (secure default per OQ-5.4)
          </Radio>
          <Radio
            name={`rec-perm-${channelId}`}
            value="disabled"
            checked={config.recommendationPermission === 'disabled'}
            onChange={() => onSetRecommendationPermission('disabled')}
          >
            Disabled
          </Radio>
        </fieldset>
        <SubToggle
          label="Prior members"
          help="Users who previously belonged to this channel see it in 'Channels you've left' and can knock to rejoin."
          checked={config.priorMembership && config.master}
          disabled={!config.master}
          onChange={(v) => onSetSubToggle('prior-membership', v)}
        />
      </fieldset>

      <div className={styles['channel-settings__textarea-block']}>
        <div className={styles['channel-settings__textarea-wrap']}>
          <TextArea
            rows={1}
            placeholder="Enter a purpose for this channel"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
          />
          <span className={styles['channel-settings__textarea-icon']}>
            <IconButton
              aria-label="Preview purpose"
              size="Small"
              icon={<Icon size="16" glyph={<EyeOutlineIcon />} />}
            />
          </span>
        </div>
        <span className={styles['channel-settings__field-help']}>
          Describe how this channel should be used.
        </span>
      </div>

      <div className={styles['channel-settings__textarea-block']}>
        <div className={styles['channel-settings__textarea-wrap']}>
          <TextArea
            rows={3}
            placeholder="Enter a header description or important links"
            value={header}
            onChange={(e) => setHeader(e.target.value)}
          />
          <span className={styles['channel-settings__textarea-icon']}>
            <IconButton
              aria-label="Preview header"
              size="Small"
              icon={<Icon size="16" glyph={<EyeOutlineIcon />} />}
            />
          </span>
        </div>
        <span className={styles['channel-settings__field-help']}>
          This is the text that will appear in the header of the channel beside
          the channel name. You can use markdown to include links by typing
          [Link Title](http://example.com).
        </span>
      </div>
    </div>
  );
}

interface SubToggleProps {
  label: string;
  help: string;
  checked: boolean;
  disabled?: boolean;
  onChange(value: boolean): void;
}

function SubToggle({
  label,
  help,
  checked,
  disabled,
  onChange,
}: SubToggleProps) {
  return (
    <div className={styles['channel-settings__a4-sub-toggle']}>
      <Switch
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange((e.target as HTMLInputElement).checked)}
        semiBold
        secondaryLabel={help}
      >
        {label}
      </Switch>
    </div>
  );
}

interface PrivacyCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  selected: boolean;
}

function PrivacyCard({ icon, title, subtitle, selected }: PrivacyCardProps) {
  return (
    <div
      className={[
        styles['channel-settings__privacy-card'],
        selected ? styles['channel-settings__privacy-card--selected'] : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <span
        className={[
          styles['channel-settings__privacy-card-icon-wrap'],
          selected
            ? styles['channel-settings__privacy-card-icon-wrap--selected']
            : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <Icon size="24" glyph={icon} />
      </span>
      <span className={styles['channel-settings__privacy-card-text']}>
        <span className={styles['channel-settings__privacy-card-title']}>
          {title}
        </span>
        <span className={styles['channel-settings__privacy-card-subtitle']}>
          {subtitle}
        </span>
      </span>
      {selected && (
        <span
          className={styles['channel-settings__privacy-card-check']}
          aria-hidden
        >
          <Icon size="20" glyph={<CheckIcon />} />
        </span>
      )}
    </div>
  );
}
