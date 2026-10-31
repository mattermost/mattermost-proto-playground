import { PopoverMenu } from '@mattermost/compass-ui/components/popover-menu';
import styles from './ReactionTray.module.scss';

export interface ReactionTrayLabels {
  /** Accessible name of the tray. */
  tray?: string;
  /** Accessible name of one emoji button. */
  react?: (emoji: string) => string;
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
  return (
    <PopoverMenu
      open={open}
      onExited={onExited}
      role="group"
      aria-label={l.tray}
      className={[styles['reaction-tray'], className].filter(Boolean).join(' ')}
    >
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
      </div>
    </PopoverMenu>
  );
}
