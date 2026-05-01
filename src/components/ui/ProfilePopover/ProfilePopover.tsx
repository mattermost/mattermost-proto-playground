import type { ReactNode } from 'react';
import CloseIcon from '@mattermost/compass-icons/components/close';
import EmailOutlineIcon from '@mattermost/compass-icons/components/email-outline';
import CircleMultipleOutlineIcon from '@mattermost/compass-icons/components/circle-multiple-outline';
import GithubCircleIcon from '@mattermost/compass-icons/components/github-circle';
import MattermostIcon from '@mattermost/compass-icons/components/mattermost';
import AccountPlusOutlineIcon from '@mattermost/compass-icons/components/account-plus-outline';
import PhoneIcon from '@mattermost/compass-icons/components/phone';
import SendOutlineIcon from '@mattermost/compass-icons/components/send-outline';
import PencilOutlineIcon from '@mattermost/compass-icons/components/pencil-outline';
import Button from '@/components/ui/Button/Button';
import IconButton from '@/components/ui/IconButton/IconButton';
import UserAvatar from '@/components/ui/UserAvatar/UserAvatar';
import LabelTag from '@/components/ui/LabelTag/LabelTag';
import Icon from '@/components/ui/Icon/Icon';
import styles from './ProfilePopover.module.scss';

export type ProfilePopoverUser = 'Others' | 'You';

export interface ProfilePopoverCustomStatus {
  emoji: string;
  text: string;
  /** Label suffix like "Until Tomorrow". */
  expiresLabel?: string;
}

export interface ProfilePopoverLocalTime {
  /** Local time, e.g. "10:42 PM". */
  time: string;
  /** Timezone abbreviation, e.g. "EST". */
  timezone: string;
  /** Hour difference relative to viewer, e.g. "3 hrs behind". */
  hourDifference?: string;
}

export interface ProfilePopoverProps {
  /** Whose profile is shown. Default: 'Others'. */
  user?: ProfilePopoverUser;
  /** Avatar image URL. */
  avatarSrc: string;
  /** Avatar alt text. */
  avatarAlt: string;
  /** Full name. */
  name: string;
  /** @handle. */
  username: string;
  /** Job title. */
  title?: string;
  /** Email address. */
  email?: string;
  /** Caption above the name, e.g. "Last online 6 hrs ago". */
  lastOnline?: string;
  /** Role tag shown at the very top, e.g. "System Admin". (Named `jobRole` to avoid clashing with the ARIA `role` attribute in JSX.) */
  jobRole?: string;
  /** Local time block. */
  localTime?: ProfilePopoverLocalTime;
  /** Custom status. */
  customStatus?: ProfilePopoverCustomStatus;
  /** Shared member org name. */
  sharedOrg?: string;
  /** Shows a Staff row. */
  staff?: boolean;
  /** Shows a Core Committer row. */
  coreCommitter?: boolean;
  /** GitHub handle — shows the GitHub profile row. */
  githubHandle?: string;
  onClose?: () => void;
  onPrimaryAction?: () => void;
  onAddContact?: () => void;
  onCall?: () => void;
  onSend?: () => void;
  className?: string;
}

interface MetaRowProps {
  icon: ReactNode;
  children: ReactNode;
  href?: string;
}

function MetaRow({ icon, children, href }: MetaRowProps) {
  const textClass = href
    ? styles['profile-popover__meta-link']
    : styles['profile-popover__meta-text'];

  return (
    <div className={styles['profile-popover__meta-item']}>
      <span className={styles['profile-popover__meta-icon']} aria-hidden>
        {icon}
      </span>
      {href ? (
        <a className={textClass} href={href}>
          {children}
        </a>
      ) : (
        <span className={textClass}>{children}</span>
      )}
    </div>
  );
}

export default function ProfilePopover({
  user = 'Others',
  avatarSrc,
  avatarAlt,
  name,
  username,
  title,
  email,
  lastOnline,
  jobRole,
  localTime,
  customStatus,
  sharedOrg,
  staff = false,
  coreCommitter = false,
  githubHandle,
  onClose,
  onPrimaryAction,
  onAddContact,
  onCall,
  onSend,
  className = '',
}: ProfilePopoverProps) {
  const isYou = user === 'You';

  const rootClass = [styles['profile-popover'], className]
    .filter(Boolean)
    .join(' ');

  const hasTitlesBlock =
    Boolean(email) ||
    Boolean(sharedOrg) ||
    staff ||
    coreCommitter ||
    Boolean(githubHandle);
  const hasSecondary =
    hasTitlesBlock || Boolean(localTime) || Boolean(customStatus);

  return (
    <div className={rootClass}>
      {jobRole && (
        <div className={styles['profile-popover__role-tag']}>
          <LabelTag label={jobRole} casing="All Caps" size="X-Small" />
        </div>
      )}

      {onClose && (
        <IconButton
          className={styles['profile-popover__close']}
          aria-label="Close"
          size="Small"
          padding="Compact"
          icon={<Icon size="16" glyph={<CloseIcon />} />}
          onClick={onClose}
        />
      )}

      <section className={styles['profile-popover__primary']}>
        <UserAvatar src={avatarSrc} alt={avatarAlt} size="120" status />
        {lastOnline && (
          <p className={styles['profile-popover__last-online']}>{lastOnline}</p>
        )}
        <div className={styles['profile-popover__names']}>
          <p className={styles['profile-popover__name']}>{name}</p>
          <p className={styles['profile-popover__handle']}>{username}</p>
          {title && <p className={styles['profile-popover__title']}>{title}</p>}
        </div>
      </section>

      {hasSecondary && (
        <section className={styles['profile-popover__secondary']}>
          {hasTitlesBlock && (
            <div className={styles['profile-popover__titles']}>
              {email && (
                <MetaRow
                  icon={<Icon size="16" glyph={<EmailOutlineIcon />} />}
                  href={`mailto:${email}`}
                >
                  {email}
                </MetaRow>
              )}
              {sharedOrg && (
                <MetaRow
                  icon={
                    <Icon size="16" glyph={<CircleMultipleOutlineIcon />} />
                  }
                >
                  {sharedOrg}
                </MetaRow>
              )}
              {staff && (
                <MetaRow icon={<Icon size="16" glyph={<MattermostIcon />} />}>
                  Staff
                </MetaRow>
              )}
              {coreCommitter && (
                <MetaRow icon={<Icon size="16" glyph={<MattermostIcon />} />}>
                  Core Committer
                </MetaRow>
              )}
              {githubHandle && (
                <MetaRow icon={<Icon size="16" glyph={<GithubCircleIcon />} />}>
                  {githubHandle}
                </MetaRow>
              )}
            </div>
          )}

          {localTime && (
            <div className={styles['profile-popover__local-time']}>
              <p className={styles['profile-popover__section-label']}>
                Local time ({localTime.timezone})
              </p>
              <div className={styles['profile-popover__time']}>
                <span>{localTime.time}</span>
                {localTime.hourDifference && (
                  <span>({localTime.hourDifference})</span>
                )}
              </div>
            </div>
          )}

          {customStatus && (
            <div className={styles['profile-popover__custom-status']}>
              <p className={styles['profile-popover__section-label']}>
                Status
                {customStatus.expiresLabel
                  ? ` (${customStatus.expiresLabel})`
                  : ''}
              </p>
              <div className={styles['profile-popover__status-row']}>
                <span
                  className={styles['profile-popover__status-emoji']}
                  aria-hidden
                >
                  {customStatus.emoji}
                </span>
                <span>{customStatus.text}</span>
              </div>
            </div>
          )}
        </section>
      )}

      <footer
        className={[
          styles['profile-popover__footer'],
          isYou
            ? styles['profile-popover__footer--you']
            : styles['profile-popover__footer--others'],
        ].join(' ')}
      >
        <div
          className={[
            styles['profile-popover__primary-action'],
            isYou
              ? styles['profile-popover__primary-action--you']
              : styles['profile-popover__primary-action--others'],
          ].join(' ')}
        >
          <Button
            className={styles['profile-popover__primary-button']}
            size="Small"
            emphasis="Primary"
            leadingIcon={
              isYou ? (
                <Icon size="12" glyph={<PencilOutlineIcon />} />
              ) : (
                <Icon size="12" glyph={<SendOutlineIcon />} />
              )
            }
            onClick={onPrimaryAction}
          >
            {isYou ? 'Edit profile' : 'Message'}
          </Button>
        </div>
        <div className={styles['profile-popover__secondary-actions']}>
          {isYou ? (
            <IconButton
              aria-label="Send message"
              size="Small"
              icon={<Icon size="16" glyph={<SendOutlineIcon />} />}
              onClick={onSend}
            />
          ) : (
            <>
              <IconButton
                aria-label="Add to contacts"
                size="Small"
                icon={<Icon size="16" glyph={<AccountPlusOutlineIcon />} />}
                onClick={onAddContact}
              />
              <IconButton
                aria-label="Call"
                size="Small"
                icon={<Icon size="16" glyph={<PhoneIcon />} />}
                onClick={onCall}
              />
            </>
          )}
        </div>
      </footer>
    </div>
  );
}
