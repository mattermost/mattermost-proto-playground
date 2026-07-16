import { Icon, IconButton, TextInput, UserAvatar } from '@mattermost/compass-ui';
import type { ChangeEvent, ComponentProps, ReactNode } from 'react';
import PencilOutlineIcon from '@mattermost/compass-icons/components/pencil-outline';
import SettingsHelpText from './SettingsHelpText';
import styles from './PersonaIdentityField.module.scss';

type AvatarProps = Pick<
  ComponentProps<typeof UserAvatar>,
  'alt' | 'name' | 'src' | 'fallbackColor'
>;

export interface PersonaIdentityFieldProps {
  avatar: AvatarProps;
  /**
   * When set, replaces the photo avatar with a trigger-style icon tile
   * (same treatment as TriggerPicker’s leading icon).
   */
  leadingIcon?: ReactNode;
  username: string;
  onUsernameChange: (value: string) => void;
  usernameDisabled?: boolean;
  usernamePlaceholder?: string;
  labelledBy?: string;
  help: string;
  className?: string;
}

/** Username + avatar cluster used in agent and automation settings. */
export default function PersonaIdentityField({
  avatar,
  leadingIcon,
  username,
  onUsernameChange,
  usernameDisabled = false,
  usernamePlaceholder = 'Agent username',
  labelledBy,
  help,
  className = '',
}: PersonaIdentityFieldProps) {
  return (
    <div
      className={[styles['persona-field'], className].filter(Boolean).join(' ')}
    >
      <div className={styles['persona-field__row']}>
        <div className={styles['persona-field__avatar-actions']}>
          {leadingIcon != null ? (
            <span className={styles['persona-field__icon-tile']} aria-hidden>
              <Icon size="20" glyph={leadingIcon} />
            </span>
          ) : (
            <UserAvatar size="40" {...avatar} />
          )}
          <IconButton
            className={styles['persona-field__avatar-edit']}
            size="X-Small"
            rounded
            padding="Compact"
            aria-label="Change avatar"
            icon={<Icon size="12" glyph={<PencilOutlineIcon />} />}
          />
        </div>
        <TextInput
          className={styles['persona-field__control']}
          placeholder={usernamePlaceholder}
          value={username}
          disabled={usernameDisabled}
          aria-labelledby={labelledBy}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            onUsernameChange(e.target.value)
          }
        />
      </div>
      <SettingsHelpText>{help}</SettingsHelpText>
    </div>
  );
}
