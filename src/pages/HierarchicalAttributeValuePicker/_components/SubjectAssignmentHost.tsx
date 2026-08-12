import type { ReactNode } from 'react';
import ConsolePageHeader from '@/components/ui/ConsolePageHeader/ConsolePageHeader';
import ConsolePanel from '@/components/ui/ConsolePanel/ConsolePanel';
import ConsoleSidebar from '@/components/ui/ConsoleSidebar/ConsoleSidebar';
import sidebarStyles from '@/components/ui/ConsoleSidebar/ConsoleSidebar.module.scss';
import Button from '@/components/ui/Button/Button';
import LabelTag from '@/components/ui/LabelTag/LabelTag';
import Scrollbars from '@/components/ui/Scrollbars/Scrollbars';
import UserAvatar from '@/components/ui/UserAvatar/UserAvatar';
import { HUB_SIDEBAR_CATEGORIES } from '@/pages/AttributeManagementHub/hubSidebar';
import {
  ACTING_ADMIN,
  FIELD_NAME,
  SUBJECT_USER,
  TYPE_NAME,
} from '@/pages/HierarchicalAttributeValuePicker/pickerModel';
import styles from './SubjectAssignmentHost.module.scss';

export interface SubjectAssignmentHostProps {
  /** Prototype-only demo band. Rendered above the product chrome. */
  banner?: ReactNode;
  /** The Program field — picker plus its live consequence. */
  children: ReactNode;
}

/**
 * Host context for the SUBJECT side: System Console ▸ User Management ▸ Users ▸
 * a user's attribute assignment panel.
 *
 * The host matters. "Assigning a program to a person" and "marking a channel"
 * are the same picker over the same values, and the only thing that tells an
 * admin which consequence applies is where they are standing when they do it.
 * Reviewing the picker without its host would hide the actual risk.
 */
export default function SubjectAssignmentHost({
  banner,
  children,
}: SubjectAssignmentHostProps) {
  return (
    <div className={styles['subject']}>
      <ConsoleSidebar
        className={sidebarStyles['console-sidebar--product']}
        avatarSrc={ACTING_ADMIN.avatarSrc}
        avatarAlt={ACTING_ADMIN.name}
        username={ACTING_ADMIN.username}
        categories={HUB_SIDEBAR_CATEGORIES}
        activeItemId="users"
      />
      <div className={styles['subject__center']}>
        {banner}
        <ConsolePageHeader
          title={SUBJECT_USER.name}
          subtitle={`@${SUBJECT_USER.username} · ${SUBJECT_USER.meta}`}
          backButton
          trailing={
            <div className={styles['subject__actions']}>
              <Button emphasis="Tertiary">Cancel</Button>
              {/* P3 · redundancy on this side is never blocking, so Save is
                  never gated here. Only the resource side can gate a save. */}
              <Button emphasis="Primary">Save changes</Button>
            </div>
          }
        />
        <div className={styles['subject__scroll']}>
          <Scrollbars>
            <div className={styles['subject__content']}>
              <ConsolePanel
                title="Attributes"
                subtitle="Values assigned to this user. Access is derived from these — nothing here is decorative."
              >
                <div className={styles['subject__identity']}>
                  <UserAvatar
                    size="40"
                    src={SUBJECT_USER.avatarSrc}
                    alt={SUBJECT_USER.name}
                  />
                  <div className={styles['subject__identity-text']}>
                    <span className={styles['subject__identity-name']}>
                      {SUBJECT_USER.name}
                    </span>
                    <span className={styles['subject__identity-meta']}>
                      @{SUBJECT_USER.username}
                    </span>
                  </div>
                </div>

                <div className={styles['subject__rows']}>
                  <div className={styles['subject__row']}>
                    <span className={styles['subject__key']}>Clearance</span>
                    <div className={styles['subject__value']}>
                      <LabelTag label="Secret" type="Info" size="Small" />
                      <span className={styles['subject__value-note']}>
                        Synced from the identity provider · read-only here
                      </span>
                    </div>
                  </div>

                  <div className={styles['subject__row']}>
                    <span className={styles['subject__key']}>
                      {FIELD_NAME}
                      <LabelTag
                        className={styles['subject__key-tag']}
                        label={TYPE_NAME}
                        type="Default"
                        size="X-Small"
                      />
                    </span>
                    <div className={styles['subject__field']}>{children}</div>
                  </div>
                </div>
              </ConsolePanel>
            </div>
          </Scrollbars>
        </div>
      </div>
    </div>
  );
}
