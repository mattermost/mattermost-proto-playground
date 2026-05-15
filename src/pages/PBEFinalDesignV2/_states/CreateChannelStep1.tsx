import { useState } from 'react';
import GlobeIcon from '@mattermost/compass-icons/components/globe';
import LockOutlineIcon from '@mattermost/compass-icons/components/lock-outline';
import ShieldOutlineIcon from '@mattermost/compass-icons/components/shield-outline';
import ChevronRightIcon from '@mattermost/compass-icons/components/chevron-right';
import Modal from '@/components/ui/Modal/Modal';
import Button from '@/components/ui/Button/Button';
import Icon from '@/components/ui/Icon/Icon';
import TextInput from '@/components/ui/TextInput/TextInput';
import TextArea from '@/components/ui/TextArea/TextArea';
import Select from '@/components/ui/Select/Select';
import PaginationDots from '@/components/ui/PaginationDots/PaginationDots';
import ChannelTypeCard from '../_components/ChannelTypeCard';
import styles from './CreateChannelStep1.module.scss';

export type ChannelType = 'public' | 'private' | 'encrypted';

export interface CreateChannelStep1Props {
  /** Called when the modal is dismissed. */
  onCancel: () => void;
  /** Called when "Next" is clicked (encrypted only — advances to Step 2). */
  onNext: () => void;
  /**
   * Called when "Create Channel" is clicked for non-encrypted types.
   * Falls back to `onCancel` when omitted.
   */
  onCreate?: () => void;
}

/**
 * State 7 — Create Channel Step 1 (Encryption type, name, configuration).
 *
 * Body (per Figma node `4297:18394`):
 *  - Row of three `ChannelTypeCard`s (Public / Private / Encrypted).
 *    Encrypted is preselected.
 *  - Channel name `TextInput` (default "Program Alpha Planning").
 *  - For Encrypted only: `Select` labelled "Select encryption configuration".
 *  - Purpose `TextArea` with helper text underneath.
 *
 * Footer:
 *  - Encrypted: PaginationDots (2 total, page 1) + Previous + Next.
 *  - Non-encrypted: spacer + Cancel + Create Channel.
 */
export default function CreateChannelStep1({
  onCancel,
  onNext,
  onCreate,
}: CreateChannelStep1Props) {
  const [channelType, setChannelType] = useState<ChannelType>('encrypted');
  const isEncrypted = channelType === 'encrypted';
  const channelName = isEncrypted ? 'Program Alpha Planning' : '';

  return (
    <div className={styles['create-channel-step1']}>
      <div className={styles['create-channel-step1__overlay']}>
        <div className={styles['create-channel-step1__dialog']}>
          <Modal
            size="Small"
            title="Create a new channel"
            onClose={onCancel}
            footer={
              <div className={styles['create-channel-step1__footer']}>
                {isEncrypted ? (
                  <PaginationDots pages={2} activePage={1} />
                ) : (
                  <span />
                )}
                <div className={styles['create-channel-step1__actions']}>
                  <Button emphasis="Tertiary" onClick={onCancel}>
                    {isEncrypted ? 'Previous' : 'Cancel'}
                  </Button>
                  {isEncrypted ? (
                    <Button
                      emphasis="Primary"
                      trailingIcon={
                        <Icon size="16" glyph={<ChevronRightIcon />} />
                      }
                      onClick={onNext}
                    >
                      Next
                    </Button>
                  ) : (
                    <Button
                      emphasis="Primary"
                      onClick={onCreate ?? onCancel}
                    >
                      Create Channel
                    </Button>
                  )}
                </div>
              </div>
            }
          >
            <div className={styles['create-channel-step1__body']}>
              {/* Channel type cards */}
              <div className={styles['create-channel-step1__type-grid']}>
                <ChannelTypeCard
                  icon={<GlobeIcon size={20} />}
                  label="Public"
                  description="Anyone can join"
                  selected={channelType === 'public'}
                  onClick={() => setChannelType('public')}
                />
                <ChannelTypeCard
                  icon={<LockOutlineIcon size={20} />}
                  label="Private"
                  description="Only invited members"
                  selected={channelType === 'private'}
                  onClick={() => setChannelType('private')}
                />
                <ChannelTypeCard
                  icon={<ShieldOutlineIcon size={20} />}
                  label="Encrypted"
                  description="Key manager encrypted"
                  selected={channelType === 'encrypted'}
                  onClick={() => setChannelType('encrypted')}
                />
              </div>

              {/* Channel name */}
              <div className={styles['create-channel-step1__field']}>
                <TextInput
                  label="Channel name"
                  defaultValue={channelName}
                  placeholder="e.g., my-channel"
                />
              </div>

              {/* Configuration — encrypted only */}
              {isEncrypted && (
                <div className={styles['create-channel-step1__field']}>
                  <Select
                    label="Select encryption configuration"
                    defaultValue="config-1"
                  >
                    <option value="config-1">Program Alpha</option>
                  </Select>
                </div>
              )}

              {/* Purpose */}
              <div className={styles['create-channel-step1__field']}>
                <TextArea
                  label="Purpose (optional)"
                  defaultValue="Testing the encrypted channel flow with default encryption"
                  rows={3}
                />
                <span className={styles['create-channel-step1__help']}>
                  Describe how this channel should be used
                </span>
              </div>
            </div>
          </Modal>
        </div>
      </div>
    </div>
  );
}
