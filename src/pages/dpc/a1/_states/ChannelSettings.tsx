/**
 * DPC A1 — Channel Settings modal (Info tab) surface.
 *
 * Visual chrome ported from the canonical Mattermost Figma (file
 * KUFeXCQAefySaR5Wq3GkeU, node 3686:45510): a wide ~960×720 modal with a
 * left settings sidebar (Info / Membership Policy / Configuration / Archive)
 * and a right content pane containing Channel name, URL, Public/Private
 * cards, the Discoverable section, Purpose, and Header.
 *
 * Two interactive options are shown for review:
 *   Option A — Discoverable OFF, clean state (no footer)
 *   Option B — Discoverable ON, floating "There are unsaved changes" footer
 *
 * The save action wires into the existing A1 store: enabling Discoverable
 * opens the Confirm-and-Commit modal (FR-1 deferred save). Disabling bypasses
 * the modal and dispatches DISABLE_DISCOVERABLE (FR-10 auto-withdraw).
 */
import { useEffect, useState } from 'react';
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
import { usePersona } from '@/pages/dpc/shared';
import type { A1StoreApi } from '../useA1Store';
import styles from './ChannelSettings.module.scss';

export interface ChannelSettingsProps {
  store: A1StoreApi;
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

export default function ChannelSettings({ store }: ChannelSettingsProps) {
  const { state, focusChannel } = store;
  const { personaInfo } = usePersona();
  const [activeKey, setActiveKey] = useState<SidebarKey>('info');
  const [discoverableLocal, setDiscoverableLocal] = useState(
    state.channelDiscoverable,
  );

  // Reconcile local toggle when server state changes (modal commits / cancels).
  useEffect(() => {
    setDiscoverableLocal(state.channelDiscoverable);
  }, [state.channelDiscoverable]);

  const isDirty = discoverableLocal !== state.channelDiscoverable;

  const handleSave = () => {
    if (discoverableLocal && !state.channelDiscoverable) {
      store.openToggleConfirm(personaInfo.username);
    } else if (!discoverableLocal && state.channelDiscoverable) {
      store.disableDiscoverable(personaInfo.username);
    }
  };

  const handleReset = () => {
    setDiscoverableLocal(state.channelDiscoverable);
  };

  return (
    <section className={styles['channel-settings']} aria-label="Channel Settings">
      <header className={styles['channel-settings__header']}>
        <div className={styles['channel-settings__header-left']}>
          <h2 className={styles['channel-settings__title']}>Channel Settings</h2>
          <span className={styles['channel-settings__title-divider']} aria-hidden />
          <span className={styles['channel-settings__subtitle']}>
            {focusChannel.displayName}
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
          <div className={styles['channel-settings__sidebar-divider']} aria-hidden />
          <button
            type="button"
            className={[
              styles['channel-settings__sidebar-item'],
              activeKey === 'archive'
                ? styles['channel-settings__sidebar-item--active']
                : '',
            ]
              .filter(Boolean)
              .join(' ')}
            onClick={() => setActiveKey('archive')}
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
          {activeKey === 'info' && (
            <InfoTab
              channelName={focusChannel.displayName}
              isPrivate={focusChannel.kind === 'private'}
              discoverable={discoverableLocal}
              onDiscoverableChange={setDiscoverableLocal}
            />
          )}
          {activeKey !== 'info' && (
            <div className={styles['channel-settings__placeholder']}>
              <p>
                {SIDEBAR_ITEMS.find((s) => s.key === activeKey)?.label ??
                  'Archive channel'}{' '}
                is out of scope for this prototype — see §3.1.13 for prototype scope.
              </p>
            </div>
          )}

          {isDirty && activeKey === 'info' && (
            <div
              className={styles['channel-settings__floating-footer']}
              role="region"
              aria-label="Unsaved changes"
            >
              <div className={styles['channel-settings__floating-footer-left']}>
                <Icon size="16" glyph={<InformationOutlineIcon />} />
                <span className={styles['channel-settings__floating-footer-text']}>
                  There are unsaved changes
                </span>
              </div>
              <div className={styles['channel-settings__floating-footer-actions']}>
                <Button emphasis="Tertiary" size="Small" onClick={handleReset}>
                  Cancel
                </Button>
                <Button emphasis="Primary" size="Small" onClick={handleSave}>
                  Save
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

interface InfoTabProps {
  channelName: string;
  isPrivate: boolean;
  discoverable: boolean;
  onDiscoverableChange: (next: boolean) => void;
}

function InfoTab({
  channelName,
  isPrivate,
  discoverable,
  onDiscoverableChange,
}: InfoTabProps) {
  const [purpose, setPurpose] = useState('');
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
            Discoverable
          </span>
          <span className={styles['channel-settings__discoverable-help']}>
            Allow non-members to find this channel when browsing. If access
            rules are configured, qualifying users can join directly. Otherwise,
            they can request to join.
          </span>
        </div>
        <Switch
          size="Medium"
          checked={discoverable}
          onChange={(e) =>
            onDiscoverableChange((e.target as HTMLInputElement).checked)
          }
          aria-label="Discoverable"
        />
      </div>

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
