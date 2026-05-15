import { useRef, useState } from 'react';
import ShieldOutlineIcon from '@mattermost/compass-icons/components/shield-outline';
import AccountPlusOutlineIcon from '@mattermost/compass-icons/components/account-plus-outline';
import PowerPlugOutlineIcon from '@mattermost/compass-icons/components/power-plug-outline';
import RightSidebar from '@/components/ui/RightSidebar/RightSidebar';
import RightSidebarHeader from '@/components/ui/RightSidebarHeader/RightSidebarHeader';
import Button from '@/components/ui/Button/Button';
import Icon from '@/components/ui/Icon/Icon';
import LabelTag from '@/components/ui/LabelTag/LabelTag';
import UserAvatar from '@/components/ui/UserAvatar/UserAvatar';
import SearchInput from '@/components/ui/SearchInput/SearchInput';
import PopoverNotice from '@/components/ui/PopoverNotice/PopoverNotice';
import { usePopoverTransition } from '@/hooks/usePopoverTransition';
import { useOutsideClose } from '@/hooks/useOutsideClose';
import KVRow from '../_components/KVRow';
import StatusPill from '../_components/StatusPill';
import {
  encryptionMeta,
  encryptionManager,
  channelMembers,
  singleConfig,
} from '../shared/fixtures';
import styles from './EncryptionRHS.module.scss';

export interface EncryptionRHSProps {
  /** Called when the close button on the RHS header is clicked. */
  onClose: () => void;
}

/**
 * State 10 — Encryption Details RHS panel (EM view).
 *
 * Four sections separated by thin dividers:
 *   1. Encryption Manager — current EM + role tag + "Add EM (Coming Soon)"
 *      affordance with a `PopoverNotice` explanation.
 *   2. Configuration — name, key manager, status pill, mono token/KEK labels,
 *      lease duration + Test Configuration button.
 *   3. Channel Encryption — key ID/algorithm (mono), active status, rotation
 *      timestamps.
 *   4. Members ({n}) — search + Add Member + member rows (avatar, name,
 *      role tag, Transfer EM/Remove link button).
 */
export default function EncryptionRHS({ onClose }: EncryptionRHSProps) {
  const [showAddEMPopover, setShowAddEMPopover] = useState(false);
  const addEMRef = useRef<HTMLDivElement>(null);
  const { mounted, visible } = usePopoverTransition(showAddEMPopover);
  useOutsideClose(addEMRef, showAddEMPopover, () =>
    setShowAddEMPopover(false),
  );

  return (
    <RightSidebar
      header={
        <RightSidebarHeader
          title="Encryption Details"
          leadingIcon={
            <Icon size="16" glyph={<ShieldOutlineIcon />} />
          }
          onClose={onClose}
        />
      }
    >
      <div className={styles['encryption-rhs']}>
        {/* Encryption Manager */}
        <section className={styles['encryption-rhs__section']}>
          <h3 className={styles['encryption-rhs__section-title']}>
            Encryption Manager
          </h3>
          <KVRow
            label="Current EM"
            value={
              <span className={styles['encryption-rhs__user']}>
                <UserAvatar
                  src={encryptionManager.avatarSrc}
                  alt={encryptionManager.fullName}
                  size="20"
                />
                <span>{encryptionManager.fullName}</span>
              </span>
            }
          />
          <KVRow
            label="Role"
            value={<LabelTag label="EM" type="Info Dim" casing="All Caps" />}
          />
          <div
            className={styles['encryption-rhs__coming-soon']}
            ref={addEMRef}
          >
            <button
              type="button"
              className={styles['encryption-rhs__coming-soon-trigger']}
              aria-haspopup="dialog"
              aria-expanded={showAddEMPopover}
              onClick={() => setShowAddEMPopover((v) => !v)}
            >
              <AccountPlusOutlineIcon size={14} aria-hidden />
              <span>Add Encryption Manager</span>
              <span className={styles['encryption-rhs__coming-soon-badge']}>
                Coming Soon
              </span>
            </button>
            {mounted && (
              <div
                className={[
                  styles['encryption-rhs__coming-soon-popover'],
                  visible
                    ? styles['encryption-rhs__coming-soon-popover--visible']
                    : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                role="dialog"
              >
                <PopoverNotice
                  variant="info"
                  title="Multiple Encryption Managers"
                  onClose={() => setShowAddEMPopover(false)}
                >
                  Support for more than one Encryption Manager per channel
                  will be available in a future release.
                </PopoverNotice>
              </div>
            )}
          </div>
        </section>

        {/* Configuration */}
        <section className={styles['encryption-rhs__section']}>
          <h3 className={styles['encryption-rhs__section-title']}>
            Configuration
          </h3>
          <KVRow label="Name" value={singleConfig.name} />
          <KVRow label="Key Manager" value={encryptionMeta.keyManager} />
          <KVRow
            label="Status"
            value={<StatusPill label="Connected" tone="success" />}
          />
          <KVRow label="Token Label" value={singleConfig.tokenLabel} mono />
          <KVRow label="KEK Label" value={singleConfig.kekLabel} mono />
          <KVRow
            label="Lease Duration"
            value={`${singleConfig.leaseDuration} min`}
          />
          <div className={styles['encryption-rhs__section-action']}>
            <Button
              size="Small"
              emphasis="Secondary"
              leadingIcon={
                <Icon size="16" glyph={<PowerPlugOutlineIcon />} />
              }
            >
              Test Configuration
            </Button>
          </div>
        </section>

        {/* Channel Encryption */}
        <section className={styles['encryption-rhs__section']}>
          <h3 className={styles['encryption-rhs__section-title']}>
            Channel Encryption
          </h3>
          <KVRow label="Key ID" value={encryptionMeta.keyId} mono />
          <KVRow label="Algorithm" value={encryptionMeta.algorithm} mono />
          <KVRow label="Status" value="Active" valueColor="success" />
          <KVRow label="Last Rotation" value={encryptionMeta.lastRotation} />
          <KVRow
            label="Next Scheduled"
            value={encryptionMeta.nextRotation}
          />
        </section>

        {/* Members */}
        <section className={styles['encryption-rhs__section']}>
          <h3 className={styles['encryption-rhs__section-title']}>
            Members ({channelMembers.length})
          </h3>
          <div className={styles['encryption-rhs__member-actions']}>
            <div className={styles['encryption-rhs__search']}>
              <SearchInput size="Small" placeholder="Search members..." />
            </div>
            <Button
              size="Small"
              emphasis="Tertiary"
              leadingIcon={
                <Icon size="16" glyph={<AccountPlusOutlineIcon />} />
              }
            >
              Add Member
            </Button>
          </div>
          <div className={styles['encryption-rhs__members']}>
            {channelMembers.map((member) => (
              <div
                key={member.name}
                className={styles['encryption-rhs__member-row']}
              >
                <div className={styles['encryption-rhs__member-info']}>
                  <UserAvatar
                    src={member.avatarSrc}
                    alt={member.name}
                    size="24"
                    status={member.online}
                  />
                  <div className={styles['encryption-rhs__member-name-row']}>
                    <span className={styles['encryption-rhs__member-name']}>
                      {member.name}
                    </span>
                    {member.role === 'Encryption Manager' ? (
                      <LabelTag
                        label="EM"
                        type="Info Dim"
                        casing="All Caps"
                      />
                    ) : (
                      <LabelTag label="Member" type="Default" />
                    )}
                  </div>
                </div>
                <Button size="X-Small" emphasis="Link">
                  {member.role === 'Encryption Manager'
                    ? 'Transfer EM'
                    : 'Remove'}
                </Button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </RightSidebar>
  );
}
