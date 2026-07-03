import styles from './ChatTypingIndicator.module.scss';

export default function ChatTypingIndicator() {
  return (
    <div className={styles['typing']} role="status" aria-label="Agent is typing">
      <span className={styles['typing__dot']} />
      <span className={styles['typing__dot']} />
      <span className={styles['typing__dot']} />
    </div>
  );
}
