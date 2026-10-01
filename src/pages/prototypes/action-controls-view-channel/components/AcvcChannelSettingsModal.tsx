import { useState } from 'react';
import CheckIcon from '@mattermost/compass-icons/components/check';
import ChevronDownIcon from '@mattermost/compass-icons/components/chevron-down';
import CogOutlineIcon from '@mattermost/compass-icons/components/cog-outline';
import FolderOutlineIcon from '@mattermost/compass-icons/components/folder-outline';
import GlobeIcon from '@mattermost/compass-icons/components/globe';
import InformationOutlineIcon from '@mattermost/compass-icons/components/information-outline';
import KeyVariantIcon from '@mattermost/compass-icons/components/key-variant';
import LockOutlineIcon from '@mattermost/compass-icons/components/lock-outline';
import ShieldOutlineIcon from '@mattermost/compass-icons/components/shield-outline';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { Modal } from '@mattermost/compass-ui/components/modal';
import { Switch } from '@mattermost/compass-ui/components/switch';
import { TextArea } from '@mattermost/compass-ui/components/text-area';
import { TextInput } from '@mattermost/compass-ui/components/text-input';
import styles from './AcvcChannelSettingsModal.module.scss';

type SettingsTab = 'info' | 'membership' | 'permissions' | 'configuration';

const TABS: { id: SettingsTab; label: string; glyph: typeof InformationOutlineIcon }[] = [
  { id: 'info', label: 'Info', glyph: InformationOutlineIcon },
  { id: 'membership', label: 'Membership Policy', glyph: ShieldOutlineIcon },
  { id: 'permissions', label: 'Permissions Policy', glyph: KeyVariantIcon },
  { id: 'configuration', label: 'Configuration', glyph: CogOutlineIcon },
];

export interface AcvcChannelSettingsModalProps {
  channelName: string;
  purpose: string;
  header: string;
  onClose: () => void;
}

export default function AcvcChannelSettingsModal({
  channelName,
  purpose,
  header,
  onClose,
}: AcvcChannelSettingsModalProps) {
  const [tab, setTab] = useState<SettingsTab>('info');

  return (
    <div className={styles['acvc-settings']}>
      <div className={styles['acvc-settings__backdrop']} aria-hidden />
      <div className={styles['acvc-settings__dialog']}>
        <Modal
          className={styles['acvc-settings__modal']}
          title="Channel Settings"
          size="large"
          headerDivider={false}
          footerDivider={false}
          onClose={onClose}
        >
          <div className={styles['acvc-settings__layout']}>
            <nav
              className={styles['acvc-settings__nav']}
              aria-label="Channel settings sections"
            >
              {TABS.map((item) => {
                const Glyph = item.glyph;
                return (
                  <button
                    key={item.id}
                    type="button"
                    className={[
                      styles['acvc-settings__nav-item'],
                      tab === item.id
                        ? styles['acvc-settings__nav-item--active']
                        : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    onClick={() => setTab(item.id)}
                  >
                    <Icon size="16" glyph={<Glyph />} />
                    {item.label}
                  </button>
                );
              })}
            </nav>

            <div className={styles['acvc-settings__body']}>
              {tab === 'info' ? (
                <InfoTab
                  channelName={channelName}
                  purpose={purpose}
                  header={header}
                />
              ) : (
                <p className={styles['acvc-settings__readonly-note']}>
                  This session can view this tab but cannot change channel
                  configuration.
                </p>
              )}
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}

function InfoTab({
  channelName,
  purpose,
  header,
}: {
  channelName: string;
  purpose: string;
  header: string;
}) {
  return (
    <div className={styles['acvc-settings__info']}>
      <h3 className={styles['acvc-settings__heading']}>Channel Info</h3>

      <TextInput label="Channel name" value={channelName} readOnly />

      <p className={styles['acvc-settings__url']}>
        URL: https://ux…ost.cloud/contributors/channels/watchfloor-ops
      </p>

      <div className={styles['acvc-settings__type-row']}>
        <div className={styles['acvc-settings__type-card']}>
          <Icon size="20" glyph={<GlobeIcon />} />
          <div>
            <span className={styles['acvc-settings__type-title']}>
              Public Channel
            </span>
            <span className={styles['acvc-settings__type-copy']}>
              Anyone can join
            </span>
          </div>
        </div>
        <div
          className={[
            styles['acvc-settings__type-card'],
            styles['acvc-settings__type-card--selected'],
          ].join(' ')}
        >
          <Icon size="20" glyph={<LockOutlineIcon />} />
          <div>
            <span className={styles['acvc-settings__type-title']}>
              Private Channel
            </span>
            <span className={styles['acvc-settings__type-copy']}>
              Only invited members
            </span>
          </div>
          <span className={styles['acvc-settings__type-check']} aria-hidden>
            <Icon size="16" glyph={<CheckIcon />} />
          </span>
        </div>
      </div>

      <Switch
        checked={false}
        disabled
        secondaryLabel="Non-members can see this channel in Browse Channels, the channel switcher, and shared permalinks. Message contents stay hidden until they join."
      >
        Discoverable (Users can request to join)
      </Switch>

      <button
        type="button"
        className={styles['acvc-settings__category']}
        disabled
      >
        <Icon size="16" glyph={<FolderOutlineIcon />} />
        <span>Choose a default category (optional)</span>
        <Icon size="16" glyph={<ChevronDownIcon />} />
      </button>
      <p className={styles['acvc-settings__hint']}>
        Sets the default sidebar category for users when they join the channel.
      </p>

      <TextArea
        label="Enter a purpose for this channel (optional)"
        value={purpose}
        readOnly
        rows={3}
      />
      <p className={styles['acvc-settings__hint']}>
        Describe how this channel should be used.
      </p>

      <TextArea label="Channel Header" value={header} readOnly rows={4} />
      <p className={styles['acvc-settings__hint']}>
        This is the text that will appear in the header of the channel beside
        the channel name. You can use markdown to include links.
      </p>
    </div>
  );
}
