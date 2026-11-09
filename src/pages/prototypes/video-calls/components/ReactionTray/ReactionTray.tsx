import { useEffect, useState } from 'react';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { PopoverMenu } from '@mattermost/compass-ui/components/popover-menu';
import { EmojiPopover } from '@mattermost/compass-proto';
import styles from './ReactionTray.module.scss';

export interface ReactionTrayLabels {
  /** Accessible name of the tray. */
  tray?: string;
  /** Accessible name of one emoji button. */
  react?: (emoji: string) => string;
  /** Accessible name of the button that opens the full emoji picker. */
  more?: string;
}

export interface ReactionTrayProps {
  /** Emoji to offer, in order. */
  emojis: readonly string[];
  /** Host-owned visibility (the surface animates in/out and unmounts itself). */
  open: boolean;
  onSelect: (emoji: string) => void;
  /** Called after the exit transition finishes. */
  onExited?: () => void;
  labels?: ReactionTrayLabels;
  className?: string;
}

const DEFAULT_LABELS: Required<ReactionTrayLabels> = {
  tray: 'Reactions',
  react: (emoji) => `React with ${emoji}`,
  more: 'Choose another emoji',
};

/** Emoji row on a `PopoverMenu` surface. Host owns open state, anchoring and dismissal. */
export function ReactionTray({
  emojis,
  open,
  onSelect,
  onExited,
  labels,
  className,
}: ReactionTrayProps) {
  const l = { ...DEFAULT_LABELS, ...labels };
  // The quick row is a shortcut; the plus button swaps it for the full emoji picker.
  const [picking, setPicking] = useState(false);
  useEffect(() => {
    if (!open) setPicking(false);
  }, [open]);
  return (
    <PopoverMenu
      open={open}
      onExited={onExited}
      role="group"
      aria-label={l.tray}
      className={[styles['reaction-tray'], className].filter(Boolean).join(' ')}
    >
      {picking ? (
        <EmojiPopover onEmojiSelect={onSelect} />
      ) : (
        <div className={styles['reaction-tray__row']}>
          {emojis.map((emoji) => (
            <button
              key={emoji}
              type="button"
              className={styles['reaction-tray__emoji']}
              aria-label={l.react(emoji)}
              onClick={() => onSelect(emoji)}
            >
              <span aria-hidden>{emoji}</span>
            </button>
          ))}
          <button
            type="button"
            className={styles['reaction-tray__emoji']}
            aria-label={l.more}
            onClick={() => setPicking(true)}
          >
            <Icon glyph={<PlusIcon />} size="20" />
          </button>
        </div>
      )}
    </PopoverMenu>
  );
}
