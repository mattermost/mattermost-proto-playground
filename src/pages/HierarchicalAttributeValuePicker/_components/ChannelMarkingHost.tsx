import type { ReactNode } from 'react';
import LockOutlineIcon from '@mattermost/compass-icons/components/lock-outline';
import Button from '@/components/ui/Button/Button';
import Icon from '@/components/ui/Icon/Icon';
import LabelTag from '@/components/ui/LabelTag/LabelTag';
import Modal from '@/components/ui/Modal/Modal';
import TextInput from '@/components/ui/TextInput/TextInput';
import Tooltip from '@/components/ui/Tooltip/Tooltip';
import {
  FIELD_NAME,
  RESOURCE_CHANNEL,
  TYPE_NAME,
} from '@/pages/HierarchicalAttributeValuePicker/pickerModel';
import styles from './ChannelMarkingHost.module.scss';

const BACKDROP_CHANNELS = [
  'Air Ops Daily',
  'Falcon Wing Readiness',
  'Raptor Flight Coordination',
  'Sortie Planning',
  'Maintenance Board',
  'Range Deconfliction',
];

export interface ChannelMarkingHostProps {
  /** Prototype-only demo band. Rendered above the product chrome. */
  banner?: ReactNode;
  /** The Program field — picker plus its live consequence. */
  children: ReactNode;
  /** True while a zero-qualifying selection is unconfirmed. */
  saveBlocked?: boolean;
  saveBlockedReason?: string;
}

/**
 * Host context for the RESOURCE side: creating a channel and marking it.
 *
 * This is where the conjunction trap bites, because the admin's mental model
 * arrives from tags and categories — where adding a label widens reach — and
 * `coversAll` does the exact opposite. Putting the picker inside the real
 * create-channel flow is the only way to review whether the live sentence lands
 * before the mistake is committed.
 */
export default function ChannelMarkingHost({
  banner,
  children,
  saveBlocked = false,
  saveBlockedReason,
}: ChannelMarkingHostProps) {
  return (
    <div className={styles['channel']}>
      {banner}
      <div className={styles['channel__stage']}>
        <div className={styles['channel__backdrop']} aria-hidden>
          <div className={styles['channel__team-rail']}>
            <span className={styles['channel__team']}>AO</span>
            <span
              className={[
                styles['channel__team'],
                styles['channel__team--muted'],
              ].join(' ')}
            >
              Mx
            </span>
            <span
              className={[
                styles['channel__team'],
                styles['channel__team--muted'],
              ].join(' ')}
            >
              Jt
            </span>
          </div>
          <div className={styles['channel__rail']}>
            <span className={styles['channel__rail-title']}>Channels</span>
            {BACKDROP_CHANNELS.map((name) => (
              <span key={name} className={styles['channel__rail-item']}>
                <Icon size="12" glyph={<LockOutlineIcon />} />
                {name}
              </span>
            ))}
          </div>
          <div className={styles['channel__main']} />
        </div>

        <div className={styles['channel__scrim']}>
          <Modal
            size="Medium"
            title="Create a new channel"
            onClose={() => undefined}
            footer={
              <div className={styles['channel__footer']}>
                <Button emphasis="Tertiary">Cancel</Button>
                <span className={styles['channel__save-wrap']}>
                  <Button emphasis="Primary" disabled={saveBlocked}>
                    Create channel
                  </Button>
                  {saveBlocked && saveBlockedReason != null && (
                    <span className={styles['channel__save-tip']}>
                      <Tooltip label={saveBlockedReason} arrow="Bottom" />
                    </span>
                  )}
                </span>
              </div>
            }
          >
            <div className={styles['channel__form']}>
              <div className={styles['channel__field']}>
                <span className={styles['channel__label']}>Channel name</span>
                <TextInput
                  size="Medium"
                  value={RESOURCE_CHANNEL.displayName}
                  aria-label="Channel name"
                  readOnly
                />
                <span className={styles['channel__help']}>
                  URL: /air-ops/channels/{RESOURCE_CHANNEL.url}
                </span>
              </div>

              <div className={styles['channel__field']}>
                <span className={styles['channel__label']}>Purpose</span>
                <TextInput
                  size="Medium"
                  value={RESOURCE_CHANNEL.purpose}
                  aria-label="Channel purpose"
                  readOnly
                />
              </div>

              <div className={styles['channel__attrs']}>
                <span className={styles['channel__attrs-title']}>
                  Channel attributes
                </span>
                <span className={styles['channel__attrs-help']}>
                  These values decide who can enter. They are not labels.
                </span>

                <div className={styles['channel__attr-row']}>
                  <span className={styles['channel__attr-key']}>
                    Classification
                  </span>
                  <div className={styles['channel__attr-value']}>
                    <LabelTag label="Secret" type="Info" size="Small" />
                    <span className={styles['channel__help']}>
                      Set from the parent team · read-only here
                    </span>
                  </div>
                </div>

                <div className={styles['channel__attr-block']}>
                  <span className={styles['channel__attr-key']}>
                    {FIELD_NAME}
                    <LabelTag
                      className={styles['channel__attr-tag']}
                      label={TYPE_NAME}
                      type="Default"
                      size="X-Small"
                    />
                  </span>
                  <div className={styles['channel__attr-field']}>{children}</div>
                </div>
              </div>
            </div>
          </Modal>
        </div>
      </div>
    </div>
  );
}
