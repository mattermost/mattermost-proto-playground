import styles from './Emoji.module.scss';

export type EmojiSize =
  | '10'
  | '12'
  | '16'
  | '20'
  | '24'
  | '28'
  | '32'
  | '40'
  | '52'
  | '64'
  | '104';

export interface EmojiProps {
  /** Optional CSS class name. */
  className?: string;
  /** Emoji character(s) to display (e.g. "👍", "🎉"). */
  emoji: string;
  /** Size from the Mattermost icon scale. Default 24. */
  size?: EmojiSize;
  /**
   * `vivid` — full-strength channel color and slight scale; use inside muted
   * controls (e.g. `IconButton` quick reactions on the center channel).
   */
  variant?: 'default' | 'vivid';
}

const SIZE_CLASS_MAP: Record<EmojiSize, string> = {
  '10': styles['emoji--size-10'],
  '12': styles['emoji--size-12'],
  '16': styles['emoji--size-16'],
  '20': styles['emoji--size-20'],
  '24': styles['emoji--size-24'],
  '28': styles['emoji--size-28'],
  '32': styles['emoji--size-32'],
  '40': styles['emoji--size-40'],
  '52': styles['emoji--size-52'],
  '64': styles['emoji--size-64'],
  '104': styles['emoji--size-104'],
};

/**
 * Renders an emoji at a consistent size from the Mattermost icon scale.
 */
export default function Emoji({
  className = '',
  emoji,
  size = '24',
  variant = 'default',
}: EmojiProps) {
  const sizeClass = SIZE_CLASS_MAP[size];
  const rootClass = [
    styles.emoji,
    sizeClass,
    variant === 'vivid' ? styles['emoji--vivid'] : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={rootClass} role="img" aria-hidden>
      {emoji}
    </span>
  );
}
