import type { ReactNode } from 'react';
import GlobeIcon from '@mattermost/compass-icons/components/globe';
import LockOutlineIcon from '@mattermost/compass-icons/components/lock-outline';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import Button from '@/components/ui/Button/Button';
import ChannelHeader from '@/components/ui/ChannelHeader/ChannelHeader';
import ChannelShell from '@/components/ui/ChannelShell/ChannelShell';
import Icon from '@/components/ui/Icon/Icon';
import Modal from '@/components/ui/Modal/Modal';
import TextArea from '@/components/ui/TextArea/TextArea';
import TextInput from '@/components/ui/TextInput/TextInput';
import ModalBackdrop from '@/pages/ChannelAttributes/shared/ModalBackdrop';
import { FIELD_NAME, HOST_CHANNEL } from '../valueMenuModel';
import styles from './CreateChannelSurface.module.scss';

export interface CreateChannelSurfaceProps {
  /** Live `Classification` — flat, coloured, single-select. */
  classificationField: ReactNode;
  /** Live `Program` — hierarchical, multi-select. */
  programField: ReactNode;
  banner?: ReactNode;
}

/**
 * Surface 2 — the create-channel modal.
 *
 * Both field shapes share one host on purpose: `Classification` is five flat
 * coloured values and `Program` is a forest, and an author meets them one row
 * apart. If the hierarchical field needed a different control to the flat one,
 * that difference would be visible here as a seam. It should not be.
 */
export default function CreateChannelSurface({
  classificationField,
  programField,
  banner,
}: CreateChannelSurfaceProps) {
  return (
    <div className={styles['create-channel']}>
      {banner}
      <div className={styles['create-channel__shell']}>
        <ChannelShell
          teamName="DR Team"
          channelHeader={
            <ChannelHeader
              name={HOST_CHANNEL.name}
              memberCount={HOST_CHANNEL.memberCount}
            />
          }
          innerPanelOverlay={
            <div className={styles['create-channel__scrim']}>
              <ModalBackdrop>
                <Modal
                  size="Medium"
                  title="Create a new channel"
                  onClose={() => undefined}
                  footer={
                    <>
                      <Button emphasis="Tertiary">Cancel</Button>
                      <Button emphasis="Primary">Save</Button>
                    </>
                  }
                >
                  <div className={styles['create-channel__form']}>
                    <div className={styles['create-channel__types']}>
                      <span
                        className={[
                          styles['create-channel__type'],
                          styles['create-channel__type--active'],
                        ].join(' ')}
                      >
                        <Icon size="24" glyph={<GlobeIcon />} />
                        <span className={styles['create-channel__type-text']}>
                          <span
                            className={styles['create-channel__type-title']}
                          >
                            Public Channel
                          </span>
                          <span className={styles['create-channel__type-sub']}>
                            Anyone can join
                          </span>
                        </span>
                      </span>
                      <span className={styles['create-channel__type']}>
                        <Icon size="24" glyph={<LockOutlineIcon />} />
                        <span className={styles['create-channel__type-text']}>
                          <span
                            className={styles['create-channel__type-title']}
                          >
                            Private Channel
                          </span>
                          <span className={styles['create-channel__type-sub']}>
                            Only invited members
                          </span>
                        </span>
                      </span>
                    </div>

                    <TextInput
                      label="Channel name"
                      size="Medium"
                      value={HOST_CHANNEL.name}
                      readOnly
                    />
                    <p className={styles['create-channel__url']}>
                      URL: /dr-team/channels/{HOST_CHANNEL.url}
                    </p>

                    <TextArea
                      rows={3}
                      placeholder="Purpose (optional)"
                      defaultValue={HOST_CHANNEL.purpose}
                    />

                    <div className={styles['create-channel__divider']} />

                    <div className={styles['create-channel__attrs']}>
                      <h3 className={styles['create-channel__attrs-title']}>
                        Channel attributes
                      </h3>
                      <p className={styles['create-channel__attrs-sub']}>
                        Configure attributes and values for this channel
                      </p>

                      <div className={styles['create-channel__row']}>
                        <span className={styles['create-channel__row-label']}>
                          Classification
                        </span>
                        <div className={styles['create-channel__row-control']}>
                          {classificationField}
                        </div>
                      </div>

                      <div className={styles['create-channel__row']}>
                        <span className={styles['create-channel__row-label']}>
                          {FIELD_NAME}
                        </span>
                        <div className={styles['create-channel__row-control']}>
                          {programField}
                        </div>
                      </div>

                      <button
                        type="button"
                        className={styles['create-channel__add']}
                      >
                        <Icon size="16" glyph={<PlusIcon />} />
                        <span>Add attribute</span>
                      </button>
                    </div>
                  </div>
                </Modal>
              </ModalBackdrop>
            </div>
          }
        >
          <div className={styles['create-channel__center']} />
        </ChannelShell>
      </div>
    </div>
  );
}
