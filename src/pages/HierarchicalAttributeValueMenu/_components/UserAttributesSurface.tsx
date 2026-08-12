import type { ReactNode } from 'react';
import AccountOutlineIcon from '@mattermost/compass-icons/components/account-outline';
import ChevronDownIcon from '@mattermost/compass-icons/components/chevron-down';
import EmailOutlineIcon from '@mattermost/compass-icons/components/email-outline';
import ShieldOutlineIcon from '@mattermost/compass-icons/components/shield-outline';
import Button from '@/components/ui/Button/Button';
import Chip from '@/components/ui/Chip/Chip';
import ConsoleFooter from '@/components/ui/ConsoleFooter/ConsoleFooter';
import Icon from '@/components/ui/Icon/Icon';
import RankedValueChip from '@/components/ui/RankedValueChip/RankedValueChip';
import TextInput from '@/components/ui/TextInput/TextInput';
import UserAvatar from '@/components/ui/UserAvatar/UserAvatar';
import ConsoleFrame from '@/pages/hierarchical-attributes/shared/ConsoleFrame';
import avatarMarco from '@/assets/avatars/Marco Rinaldi.png';
import { FIELD_NAME, SUBJECT_USER } from '../valueMenuModel';
import styles from './UserAttributesSurface.module.scss';

export interface UserAttributesSurfaceProps {
  /** The live `Program` field, menu and inline notice included. */
  programField: ReactNode;
  /** Prototype demo band. Absent under `?demo=off`. */
  banner?: ReactNode;
  dirty: boolean;
  onSave: () => void;
  onCancel: () => void;
}

/**
 * Surface 1 — System Console ▸ User Management ▸ Users ▸ User Configuration.
 *
 * `USER ATTRIBUTES` is a two-column grid of narrow fields, and that grid is the
 * whole argument for a dropdown: there is no room here for a panel, a tree pane
 * or a live consequence card. `Rank` and `Clearance` are rendered exactly as
 * they ship — a numeral badge before the label — because that is the pattern the
 * ranked menu has to match rather than invent.
 */
export default function UserAttributesSurface({
  programField,
  banner,
  dirty,
  onSave,
  onCancel,
}: UserAttributesSurfaceProps) {
  return (
    <ConsoleFrame
      title="User Configuration"
      activeItemId="users"
      backButton
      showExit={false}
      banner={banner}
      footer={
        <ConsoleFooter
          saveDisabled={!dirty}
          onSave={onSave}
          onCancel={onCancel}
        />
      }
    >
      <div className={styles['user-attrs']}>
        <section
          className={styles['user-attrs__card']}
          aria-label="User profile"
        >
          <div className={styles['user-attrs__band']}>
            <span className={styles['user-attrs__avatar']}>
              <UserAvatar
                size="120"
                src={avatarMarco}
                alt={SUBJECT_USER.name}
                name={SUBJECT_USER.name}
              />
            </span>
            <span className={styles['user-attrs__band-text']}>
              <span className={styles['user-attrs__name']}>
                {SUBJECT_USER.name}
              </span>
              <span className={styles['user-attrs__userid']}>
                User ID: {SUBJECT_USER.userId}
              </span>
            </span>
          </div>

          <div className={styles['user-attrs__body']}>
            <p className={styles['user-attrs__role']}>{SUBJECT_USER.role}</p>

            <div className={styles['user-attrs__grid']}>
              <div className={styles['user-attrs__field']}>
                <span className={styles['user-attrs__label']}>Username</span>
                <TextInput
                  size="Medium"
                  value={SUBJECT_USER.username}
                  leadingIcon={
                    <Icon size="16" glyph={<AccountOutlineIcon />} />
                  }
                  readOnly
                />
              </div>
              <div className={styles['user-attrs__field']}>
                <span className={styles['user-attrs__label']}>Email</span>
                <TextInput
                  size="Medium"
                  value={SUBJECT_USER.email}
                  leadingIcon={<Icon size="16" glyph={<EmailOutlineIcon />} />}
                  readOnly
                />
              </div>
            </div>

            <div className={styles['user-attrs__field']}>
              <span className={styles['user-attrs__label']}>
                Authentication Method
              </span>
              <span className={styles['user-attrs__readonly']}>
                <Icon size="16" glyph={<ShieldOutlineIcon />} />
                <span>Email</span>
              </span>
            </div>

            <div className={styles['user-attrs__divider']} />

            <h3 className={styles['user-attrs__section-title']}>
              USER ATTRIBUTES
            </h3>

            <div className={styles['user-attrs__grid']}>
              <div className={styles['user-attrs__field']}>
                <span className={styles['user-attrs__label']}>Device_Type</span>
                <StaticControl>
                  <Chip size="Small" onRemove={() => undefined}>
                    macOS
                  </Chip>
                  <Chip size="Small" onRemove={() => undefined}>
                    Mobile-iOS
                  </Chip>
                </StaticControl>
              </div>

              <div className={styles['user-attrs__field']}>
                <span className={styles['user-attrs__label']}>
                  {FIELD_NAME}
                </span>
                {programField}
              </div>

              <div className={styles['user-attrs__field']}>
                <span className={styles['user-attrs__label']}>Department</span>
                <StaticControl>
                  <span className={styles['user-attrs__static-value']}>
                    Comms
                  </span>
                </StaticControl>
              </div>

              <div className={styles['user-attrs__field']}>
                <span className={styles['user-attrs__label']}>Rank</span>
                <StaticControl>
                  <RankedValueChip label="Captain" rank={2} size="Small" />
                </StaticControl>
              </div>

              <div className={styles['user-attrs__field']}>
                <span className={styles['user-attrs__label']}>Clearance</span>
                <StaticControl>
                  <RankedValueChip label="TS" rank={4} size="Small" />
                </StaticControl>
              </div>

              <div className={styles['user-attrs__field']}>
                <span className={styles['user-attrs__label']}>Resource</span>
                <StaticControl>
                  <span className={styles['user-attrs__placeholder']}>
                    Select an option
                  </span>
                </StaticControl>
              </div>
            </div>
          </div>

          <div className={styles['user-attrs__actions']}>
            <Button emphasis="Tertiary">Reset Password</Button>
            <Button emphasis="Tertiary" destructive>
              Deactivate
            </Button>
            <Button
              emphasis="Tertiary"
              className={styles['user-attrs__actions-end']}
            >
              Manage User Settings
            </Button>
          </div>
        </section>
      </div>
    </ConsoleFrame>
  );
}

/** A sibling attribute field, shown for context only. */
function StaticControl({ children }: { children: ReactNode }) {
  return (
    <div className={styles['user-attrs__static']}>
      <span className={styles['user-attrs__static-content']}>{children}</span>
      <span className={styles['user-attrs__static-caret']}>
        <Icon size="16" glyph={<ChevronDownIcon />} />
      </span>
    </div>
  );
}
