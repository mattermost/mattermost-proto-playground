import ShieldOutlineIcon from '@mattermost/compass-icons/components/shield-outline';
import RightSidebar from '@/components/ui/RightSidebar/RightSidebar';
import RightSidebarHeader from '@/components/ui/RightSidebarHeader/RightSidebarHeader';
import Icon from '@/components/ui/Icon/Icon';
import UserAvatar from '@/components/ui/UserAvatar/UserAvatar';
import KVRow from '../_components/KVRow';
import StatusPill from '../_components/StatusPill';
import {
  encryptionManager,
  singleConfig,
} from '../shared/fixtures';
import styles from './MemberRHS.module.scss';

export interface MemberRHSProps {
  /** Called when the close button on the RHS header is clicked. */
  onClose: () => void;
}

/**
 * State 11 — Encryption Details RHS panel (Member view).
 *
 * Stripped-down counterpart to `EncryptionRHS` for non-EM members. Only three
 * sections:
 *   1. Configuration — name + connected status.
 *   2. Encryption Manager — current EM avatar + name.
 *   3. Status — overall encryption status.
 *
 * No Add EM affordance, no Test Configuration button, no member list.
 */
export default function MemberRHS({ onClose }: MemberRHSProps) {
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
      <div className={styles['member-rhs']}>
        <section className={styles['member-rhs__section']}>
          <h3 className={styles['member-rhs__section-title']}>
            Configuration
          </h3>
          <KVRow label="Name" value={singleConfig.name} />
          <KVRow
            label="Connection"
            value={<StatusPill label="Connected" tone="success" />}
          />
        </section>

        <section className={styles['member-rhs__section']}>
          <h3 className={styles['member-rhs__section-title']}>
            Encryption Manager
          </h3>
          <KVRow
            label="Current EM"
            value={
              <span className={styles['member-rhs__user']}>
                <UserAvatar
                  src={encryptionManager.avatarSrc}
                  alt={encryptionManager.fullName}
                  size="20"
                />
                <span>{encryptionManager.fullName}</span>
              </span>
            }
          />
        </section>

        <section className={styles['member-rhs__section']}>
          <h3 className={styles['member-rhs__section-title']}>Status</h3>
          <KVRow
            label="Encryption"
            value="Active"
            valueColor="success"
          />
        </section>
      </div>
    </RightSidebar>
  );
}
