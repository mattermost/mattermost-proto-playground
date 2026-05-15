/**
 * A3 — Channel Settings modal (Info tab).
 *
 * Visual chrome ported from the canonical Mattermost Figma (file
 * KUFeXCQAefySaR5Wq3GkeU, node 3686:45510): a wide ~960×720 modal with a
 * left settings sidebar (Info / Membership Policy / Configuration / Archive)
 * and a right content pane.
 *
 * A3 mechanism note: under the Curated Directory approach the channel object
 * carries no Discoverable attribute. The Discoverable section is rendered
 * here for visual parity with the canonical Figma, but the toggle is
 * deliberately disabled — discoverability is managed from a second surface
 * (channel header → "Add to Channel Directory") per §3.3.4. The contextual
 * SectionNotice below the toggle makes that two-surface invariant visible to
 * the reviewer.
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
import SectionNotice from '@/components/ui/SectionNotice/SectionNotice';
import { useA3Channel } from '../A3.context';
import styles from './ChannelSettings.module.scss';

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

export default function ChannelSettings() {
  const { channel } = useA3Channel();
  const [activeKey, setActiveKey] = useState<SidebarKey>('info');

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
          {activeKey === 'info' ? (
            <InfoTab
              channelName={channel.displayName}
              channelPurpose={channel.purpose}
              isPrivate={channel.kind === 'private'}
            />
          ) : (
            <div className={styles['channel-settings__placeholder']}>
              <p>
                {SIDEBAR_ITEMS.find((s) => s.key === activeKey)?.label ??
                  'Archive channel'}{' '}
                is out of scope for the A3 prototype — see §3.3.13.
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
}

function InfoTab({ channelName, channelPurpose, isPrivate }: InfoTabProps) {
  const [purpose, setPurpose] = useState(channelPurpose);
  const [header, setHeader] = useState(
    'Use !incident to file a new incident report.',
  );

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
        <Button emphasis="Link" size="Small">
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
          checked={false}
          disabled
          aria-label="Discoverable (managed from Channel Directory under A3)"
        />
      </div>

      <SectionNotice
        type="Hint"
        title="A3 · Discoverable is managed from the Channel Directory."
        description="Open the channel and use the header menu (⋮ → Add to Channel Directory) — that is surface 2 of 2 for this approach."
      />

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
