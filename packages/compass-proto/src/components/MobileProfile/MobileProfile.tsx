import type {ReactNode} from 'react';
import { UserAvatar } from '@mattermost/compass-ui';
import MobileTabScreen from '@/components/MobileTabScreen/MobileTabScreen';
import styles from './MobileProfile.module.scss';

export interface MobileProfileProps {
  /** Profile avatar image. */
  avatarSrc?: string;
  /** Accessible name for the avatar. */
  avatarAlt: string;
  /** Display name shown under the avatar. */
  displayName: string;
  /** Handle / username line under the display name. */
  username: string;
  /** When true, show online status on the avatar. Default: true. */
  status?: boolean;
  /** White sheet body — settings list, etc. */
  children?: ReactNode;
  className?: string;
}

/**
 * Mobile Profile tab layout — avatar, name, handle, and sheet.
 *
 * @see Figma Patterns — Mobile — Top Nav Bar — Profile
 */
export default function MobileProfile({
  avatarSrc,
  avatarAlt,
  displayName,
  username,
  status = true,
  children,
  className = '',
}: MobileProfileProps) {
  return (
    <MobileTabScreen
      className={className}
      header={
        <div className={styles['mobile-profile__header']}>
          <UserAvatar
            src={avatarSrc}
            alt={avatarAlt}
            size='120'
            status={status}
          />
          <div className={styles['mobile-profile__identity']}>
            <h1 className={styles['mobile-profile__name']}>{displayName}</h1>
            <p className={styles['mobile-profile__handle']}>{username}</p>
          </div>
        </div>
      }
    >
      {children}
    </MobileTabScreen>
  );
}
