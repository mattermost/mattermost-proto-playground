/**
 * DPC V2 A1 — Channel Settings (Info tab) — Wave 2C.
 *
 * Forked from V1 (`dpc/a1/_states/ChannelSettings.tsx`) with the Phase 5 V2
 * deltas wired in:
 *
 *   1. Member-count exposure in the toggle help text per NFR-1 REVISED + KD-2
 *      revised (§3.1.4): the help text now reads
 *      "Let non-members find this channel by name, purpose, and member count."
 *      and a compact pre-join preview chip surfaces the actual
 *      "{channelName} · {N} members" string the end-user surfaces will show.
 *
 *   2. Scenario-aware Confirm trigger per §3.1.1 → §3.2.1: when Save fires on
 *      a toggle-flip, we pick a ConfirmScenario from the current ABAC posture
 *      and pass it explicitly to `store.openToggleConfirm(actor, scenario)`.
 *      Disable still bypasses the modal in V1; V2 routes the disable through
 *      the modal as well (Template 4 — `disable-with-pending`).
 *
 * Two side-by-side options are kept so reviewers can compare:
 *   Option A — Discoverable OFF, no preview chip.
 *   Option B — Discoverable ON, preview chip rendered + floating "unsaved
 *   changes" footer when the toggle is dirty.
 *
 * Structural anatomy mirrors V1 verbatim (BEM block renamed to keep
 * playground side-by-side comparison clean).
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
import PlusIcon from '@mattermost/compass-icons/components/plus';
import CheckIcon from '@mattermost/compass-icons/components/check';
import AccountMultipleOutlineIcon from '@mattermost/compass-icons/components/account-multiple-outline';
import Switch from '@/components/ui/Switch/Switch';
import Button from '@/components/ui/Button/Button';
import TextInput from '@/components/ui/TextInput/TextInput';
import TextArea from '@/components/ui/TextArea/TextArea';
import IconButton from '@/components/ui/IconButton/IconButton';
import Icon from '@/components/ui/Icon/Icon';
import { usePersona } from '@/pages/dpc/shared';
import type { A1V2StoreApi, ConfirmScenario } from '../useA1V2Store';
import styles from './ChannelSettings.module.scss';

export interface ChannelSettingsProps {
  store: A1V2StoreApi;
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

/**
 * Resolve which ConfirmScenario template to surface when the admin commits
 * the toggle change. Mirrors §3.2.8 decision-tree intent:
 *   - Toggle ON  + ABAC empty (0 match) → enable-empty (Template 5)
 *   - Toggle ON  + ABAC typical         → enable-typical (Template 2)
 *   - Toggle ON  + ABAC slow            → enable-slow (Template 6)
 *   - Toggle ON  + auto-add on policy   → enable-large-jump (Template 3 stand-in)
 *   - Toggle OFF + pending requests > 0 → disable-with-pending (Template 4)
 *   - Toggle OFF + 0 pending            → policy-change-impact stand-in
 */
function resolveScenario(
  store: A1V2StoreApi,
  nextDiscoverable: boolean,
): ConfirmScenario {
  if (!nextDiscoverable) {
    return store.state.pendingRequests.length > 0
      ? 'disable-with-pending'
      : 'policy-change-impact';
  }
  switch (store.state.abacPolicy) {
    case 'empty':
      return 'enable-empty';
    case 'slow':
      return 'enable-slow';
    default:
      return 'enable-typical';
  }
}

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
    const scenario = resolveScenario(store, discoverableLocal);
    store.openToggleConfirm(personaInfo.username, scenario);
  };

  const handleReset = () => {
    setDiscoverableLocal(state.channelDiscoverable);
  };

  return (
    <section
      className={styles['v2-channel-settings']}
      aria-label="Channel Settings (V2)"
    >
      <header className={styles['v2-channel-settings__header']}>
        <div className={styles['v2-channel-settings__header-left']}>
          <h2 className={styles['v2-channel-settings__title']}>
            Channel Settings
          </h2>
          <span
            className={styles['v2-channel-settings__title-divider']}
            aria-hidden
          />
          <span className={styles['v2-channel-settings__subtitle']}>
            {focusChannel.displayName}
          </span>
        </div>
        <IconButton
          aria-label="Close"
          icon={<Icon size="20" glyph={<CloseIcon />} />}
        />
      </header>

      <div className={styles['v2-channel-settings__body']}>
        <nav
          className={styles['v2-channel-settings__sidebar']}
          aria-label="Settings sections"
        >
          {SIDEBAR_ITEMS.map((item) => {
            const isActive = activeKey === item.key;
            return (
              <button
                key={item.key}
                type="button"
                className={[
                  styles['v2-channel-settings__sidebar-item'],
                  isActive
                    ? styles['v2-channel-settings__sidebar-item--active']
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
            className={styles['v2-channel-settings__sidebar-divider']}
            aria-hidden
          />
          <button
            type="button"
            className={[
              styles['v2-channel-settings__sidebar-item'],
              activeKey === 'archive'
                ? styles['v2-channel-settings__sidebar-item--active']
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
          className={styles['v2-channel-settings__sidebar-divider-vertical']}
          aria-hidden
        />

        <div className={styles['v2-channel-settings__content']}>
          {activeKey === 'info' && (
            <InfoTab
              channelName={focusChannel.displayName}
              memberCount={focusChannel.memberCount}
              isPrivate={focusChannel.kind === 'private'}
              discoverable={discoverableLocal}
              onDiscoverableChange={setDiscoverableLocal}
            />
          )}
          {activeKey !== 'info' && (
            <div className={styles['v2-channel-settings__placeholder']}>
              <p>
                {SIDEBAR_ITEMS.find((s) => s.key === activeKey)?.label ??
                  'Archive channel'}{' '}
                is out of scope for this prototype — see §3.1.13 for prototype
                scope.
              </p>
            </div>
          )}

          {isDirty && activeKey === 'info' && (
            <div
              className={styles['v2-channel-settings__floating-footer']}
              role="region"
              aria-label="Unsaved changes"
            >
              <div className={styles['v2-channel-settings__floating-footer-left']}>
                <Icon size="16" glyph={<InformationOutlineIcon />} />
                <span
                  className={styles['v2-channel-settings__floating-footer-text']}
                >
                  There are unsaved changes
                </span>
              </div>
              <div
                className={styles['v2-channel-settings__floating-footer-actions']}
              >
                <Button emphasis="Tertiary" size="Small" onClick={handleReset}>
                  Cancel
                </Button>
                <Button emphasis="Primary" size="Small" onClick={handleSave}>
                  Save Changes
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
  memberCount: number;
  isPrivate: boolean;
  discoverable: boolean;
  onDiscoverableChange: (next: boolean) => void;
}

function InfoTab({
  channelName,
  memberCount,
  isPrivate,
  discoverable,
  onDiscoverableChange,
}: InfoTabProps) {
  const [purpose, setPurpose] = useState('');
  const [header, setHeader] = useState('');

  return (
    <div className={styles['v2-channel-settings__info']}>
      <TextInput
        label="Channel name"
        defaultValue={channelName}
        size="Medium"
      />

      <div className={styles['v2-channel-settings__url-row']}>
        <span className={styles['v2-channel-settings__url-text']}>
          URL: https://community.mattermost.com…channels/{channelName}
        </span>
        <Button emphasis="Quaternary" size="Small">
          Edit
        </Button>
      </div>

      <div className={styles['v2-channel-settings__privacy-cards']}>
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

      <div className={styles['v2-channel-settings__discoverable']}>
        <div className={styles['v2-channel-settings__discoverable-text']}>
          <span className={styles['v2-channel-settings__discoverable-title']}>
            Discoverable
          </span>
          <span className={styles['v2-channel-settings__discoverable-help']}>
            Let non-members find this channel by name, purpose, and member
            count. If access rules are configured, qualifying users can join
            directly. Otherwise, they can request to join.
          </span>
          {/*
            Member-count exposure (KD-2 revised / NFR-1 revised).
            Renders the exact preview-format end users will see so the admin
            can audit the disclosure at toggle-time.
          */}
          {discoverable && (
            <div
              className={styles['v2-channel-settings__preview-chip']}
              aria-label="Pre-join preview that non-members will see"
            >
              <span className={styles['v2-channel-settings__preview-chip-icon']}>
                <LockOutlineIcon size={14} />
                <PlusIcon
                  size={10}
                  className={styles['v2-channel-settings__preview-chip-plus']}
                />
              </span>
              <span
                className={styles['v2-channel-settings__preview-chip-name']}
              >
                {channelName}
              </span>
              <span
                className={styles['v2-channel-settings__preview-chip-sep']}
                aria-hidden
              />
              <span
                className={styles['v2-channel-settings__preview-chip-count']}
              >
                <Icon size="12" glyph={<AccountMultipleOutlineIcon />} />
                {memberCount} members
              </span>
            </div>
          )}
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

      <div className={styles['v2-channel-settings__textarea-block']}>
        <div className={styles['v2-channel-settings__textarea-wrap']}>
          <TextArea
            rows={1}
            placeholder="Enter a purpose for this channel"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
          />
          <span className={styles['v2-channel-settings__textarea-icon']}>
            <IconButton
              aria-label="Preview purpose"
              size="Small"
              icon={<Icon size="16" glyph={<EyeOutlineIcon />} />}
            />
          </span>
        </div>
        <span className={styles['v2-channel-settings__field-help']}>
          Describe how this channel should be used.
        </span>
      </div>

      <div className={styles['v2-channel-settings__textarea-block']}>
        <div className={styles['v2-channel-settings__textarea-wrap']}>
          <TextArea
            rows={3}
            placeholder="Enter a header description or important links"
            value={header}
            onChange={(e) => setHeader(e.target.value)}
          />
          <span className={styles['v2-channel-settings__textarea-icon']}>
            <IconButton
              aria-label="Preview header"
              size="Small"
              icon={<Icon size="16" glyph={<EyeOutlineIcon />} />}
            />
          </span>
        </div>
        <span className={styles['v2-channel-settings__field-help']}>
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
        styles['v2-channel-settings__privacy-card'],
        selected ? styles['v2-channel-settings__privacy-card--selected'] : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <span
        className={[
          styles['v2-channel-settings__privacy-card-icon-wrap'],
          selected
            ? styles['v2-channel-settings__privacy-card-icon-wrap--selected']
            : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <Icon size="24" glyph={icon} />
      </span>
      <span className={styles['v2-channel-settings__privacy-card-text']}>
        <span className={styles['v2-channel-settings__privacy-card-title']}>
          {title}
        </span>
        <span className={styles['v2-channel-settings__privacy-card-subtitle']}>
          {subtitle}
        </span>
      </span>
      {selected && (
        <span
          className={styles['v2-channel-settings__privacy-card-check']}
          aria-hidden
        >
          <Icon size="20" glyph={<CheckIcon />} />
        </span>
      )}
    </div>
  );
}
