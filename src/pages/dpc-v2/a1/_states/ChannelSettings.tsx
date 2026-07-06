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
import CheckIcon from '@mattermost/compass-icons/components/check';
import Switch from '@/components/ui/Switch/Switch';
import Button from '@/components/ui/Button/Button';
import ChannelHeader from '@/components/ui/ChannelHeader/ChannelHeader';
import EmptyState from '@/components/ui/EmptyState/EmptyState';
import Scrollbars from '@/components/ui/Scrollbars/Scrollbars';
import TextInput from '@/components/ui/TextInput/TextInput';
import TextArea from '@/components/ui/TextArea/TextArea';
import IconButton from '@/components/ui/IconButton/IconButton';
import Icon from '@/components/ui/Icon/Icon';
import { usePersona } from '@/pages/dpc/shared';
import AppOverlay from '../_components/AppOverlay';
import DpcAppShell, { shellStyles } from '../_components/DpcAppShell';
import ScreenCanvas from '../_components/ScreenCanvas';
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

  const settingsDialog = (
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

  return (
    <ScreenCanvas
      eyebrow="§3.1"
      title="Channel Settings — Info tab"
      subtitle="Channel Settings modal renders over the real channel chrome. The Discoverable toggle (with lock-plus 16px and live preview chip) is the focus surface."
      canvas={
        <DpcAppShell
          focusChannelName={focusChannel.displayName}
          focusIsDiscoverable={state.channelDiscoverable}
          channelHeader={
            <ChannelHeader
              type="Channel"
              name={focusChannel.displayName}
              description={focusChannel.purpose}
              memberCount={focusChannel.memberCount}
              pinnedCount={2}
            />
          }
          overlay={<AppOverlay maxWidth={960}>{settingsDialog}</AppOverlay>}
        >
          <div className={shellStyles['channel-shell__messages']}>
            <Scrollbars>
              <div className={shellStyles['channel-shell__messages-list']}>
                <EmptyState
                  title="Settings modal is the focus"
                  description="The underlying channel chrome shows context: the focus channel is active in the LHS sidebar with the lock-plus glyph."
                />
              </div>
            </Scrollbars>
          </div>
        </DpcAppShell>
      }
      reviewSummary="Saving a toggle change opens the Confirm-and-Commit modal (§3.2). Disable bypasses the modal in V1; V2 routes Disable through the modal as Template 4 (disable-with-pending)."
      reviewItems={[
        {
          heading: 'Help text restored (2026-05-18 stakeholder feedback)',
          body: (
            <p>
              Help text restored per 2026-05-18 stakeholder feedback. Selected
              Option 3 because it names the discovery surfaces explicitly
              (Browse Channels, channel switcher, shared permalinks) — the same
              vocabulary the Confirm-and-Commit modal uses, keeping the admin's
              mental model consistent. The parenthetical in the title
              ("Users can request to join") is a shorthand summary; the help
              text carries the load-bearing "still private + message contents
              stay hidden" guarantee admins need to commit confidently.
            </p>
          ),
        },
        {
          heading: 'Why lock-plus stays inside the modal (Change 2 exception)',
          body: (
            <p>
              The Settings Info tab keeps the lock-plus glyph adjacent to the
              toggle label because the icon is load-bearing for explanation at
              the configuration surface. The subtle-by-default treatment from
              KD-26 applies to LHS / Browse / Switcher rows, not to admin
              configuration surfaces.
            </p>
          ),
        },
      ]}
    />
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
            Discoverable (Users can request to join)
          </span>
          {/*
            Per stakeholder feedback 2026-05-18:
            - Help text restored beneath the toggle title. Title parenthetical
              ("Users can request to join") is a summary; it does NOT carry the
              load-bearing "still private + what's exposed" guarantee that
              admins need to make this decision confidently.
            - Selected Option 3 (names the surfaces explicitly: Browse Channels,
              the channel switcher, and shared permalinks). The surface
              vocabulary matches the consequence copy in the Confirm-and-Commit
              modal (§3.2), so the admin's mental model stays consistent
              across the toggle → commit transition. "Message contents stay
              hidden until they join" is the anti-misread guarantee.
            - The matched-user preview chip (channel name + member-count) was
              removed in the prior pass — the same disclosure is shown
              contextually in the Confirm-and-Commit modal where it's
              load-bearing for the admin's commit decision.
          */}
          <span className={styles['v2-channel-settings__discoverable-help']}>
            Non-members can see this channel in Browse Channels, the channel
            switcher, and shared permalinks. Message contents stay hidden
            until they join.
          </span>
        </div>
        <Switch
          size="Medium"
          checked={discoverable}
          onChange={(e) =>
            onDiscoverableChange((e.target as HTMLInputElement).checked)
          }
          aria-label="Discoverable (Users can request to join)"
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
