import styles from './AgentTypingDots.module.scss';

type AgentTypingDotsProps = {
  className?: string;
  /** Accessible label for the loading state. */
  label?: string;
};

/**
 * Three-dot typing / thinking indicator (Figma Agentic UX 53:80444).
 * Staggered bounce + opacity pulse on a 1.2s loop.
 */
export default function AgentTypingDots({
  className = '',
  label = 'Agent is thinking',
}: AgentTypingDotsProps) {
  return (
    <span
      className={[styles['agent-typing-dots'], className]
        .filter(Boolean)
        .join(' ')}
      role="status"
      aria-label={label}
    >
      <span className={styles['agent-typing-dots__dot']} />
      <span className={styles['agent-typing-dots__dot']} />
      <span className={styles['agent-typing-dots__dot']} />
    </span>
  );
}
