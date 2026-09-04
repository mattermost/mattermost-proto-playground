import type { AgentColor, AgentShape } from '../agentsData';
import { AGENT_COLOR_HEX } from '../agentsData';
import styles from './AgentAvatar.module.scss';

type AgentAvatarProps = {
  shape: AgentShape;
  color: AgentColor;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  eyes?: boolean;
  className?: string;
};

/**
 * Geometric agent appearance (shape × color) used in the New Agent modal
 * and Agents landing cards.
 */
export default function AgentAvatar({
  shape,
  color,
  size = 'md',
  eyes = false,
  className = '',
}: AgentAvatarProps) {
  const hex = AGENT_COLOR_HEX[color];

  return (
    <span
      className={[
        styles['agent-avatar'],
        styles[`agent-avatar--${size}`],
        styles[`agent-avatar--${shape}`],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ ['--agent-avatar-color' as string]: hex }}
      aria-hidden
    >
      <span className={styles['agent-avatar__shape']} />
      {eyes ? (
        <span className={styles['agent-avatar__eyes']}>
          <span />
          <span />
        </span>
      ) : null}
    </span>
  );
}
