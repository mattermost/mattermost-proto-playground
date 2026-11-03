import { useState, type ReactNode } from 'react';
import ChevronDownIcon from '@mattermost/compass-icons/components/chevron-down';
import PhoneIcon from '@mattermost/compass-icons/components/phone';
import PhoneInTalkIcon from '@mattermost/compass-icons/components/phone-in-talk';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { IconButton } from '@mattermost/compass-ui/components/icon-button';
import { Tooltip } from '@mattermost/compass-ui/components/tooltip';
import { useExitAnimation } from '@/hooks/useExitAnimation';
import styles from './CallHeaderButton.module.scss';

/** What the conversation's call is doing, as the header button shows it. */
export type CallHeaderButtonState = 'start' | 'join' | 'in-call';

export interface CallHeaderButtonProps {
  /** `start`: no call (default look). `join`: a call is running without you. `in-call`: you are ringing or in the call. */
  state: CallHeaderButtonState;
  /** Tooltip text and accessible name: "Start call", "Join call", "In call". */
  label: string;
  /** Shows the dropdown chevron and marks the button as a menu trigger. */
  menu?: boolean;
  /** Host-owned menu state (only with `menu`). */
  menuOpen?: boolean;
  onClick?: () => void;
  /** The menu surface, anchored under the button (only with `menu`). */
  children?: ReactNode;
  className?: string;
}

/**
 * Icon-only call button for the channel header: a phone glyph (and a chevron
 * when it opens a menu) with a tooltip. Presentational; the host owns what a
 * click does. The tooltip is visual chrome, so this owns hover / focus and
 * the exit fade, and hides it while the menu is open.
 */
export default function CallHeaderButton({
  state,
  label,
  menu = false,
  menuOpen = false,
  onClick,
  children,
  className,
}: CallHeaderButtonProps) {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const showTip = (hovered || focused) && !menuOpen;
  const tip = useExitAnimation(showTip, 150);

  return (
    <div
      className={[styles['call-header-button'], className]
        .filter(Boolean)
        .join(' ')}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <IconButton
        size="small"
        padding="compact"
        className={[
          styles['call-header-button__trigger'],
          menu && styles['call-header-button__trigger--menu'],
          menu && menuOpen && styles['call-header-button__trigger--open'],
          state !== 'start' && styles['call-header-button__trigger--live'],
          state === 'in-call' && styles['call-header-button__trigger--in-call'],
        ]
          .filter(Boolean)
          .join(' ')}
        icon={
          <>
            {/* A running call uses the same glyph as the sidebar's in-call icon. */}
            <Icon
              glyph={state === 'start' ? <PhoneIcon /> : <PhoneInTalkIcon />}
            />
            {menu && (
              <Icon
                glyph={<ChevronDownIcon />}
                className={styles['call-header-button__chevron']}
              />
            )}
          </>
        }
        aria-label={label}
        aria-haspopup={menu ? 'menu' : undefined}
        aria-expanded={menu ? menuOpen : undefined}
        active={menu && menuOpen}
        toggled={state === 'in-call' ? true : undefined}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onClick={onClick}
      />
      {tip.rendered && (
        <div
          className={[
            styles['call-header-button__tooltip'],
            tip.exiting && styles['call-header-button__tooltip--exiting'],
          ]
            .filter(Boolean)
            .join(' ')}
          role="presentation"
        >
          <Tooltip label={label} arrow="top" />
        </div>
      )}
      {children}
    </div>
  );
}
