import MessageInput from '@/components/ui/MessageInput';
import styles from '@/pages/Patterns/Patterns.module.scss';

export default function MessageInputLibrary() {
  return (
    <div className={styles['patterns__message-input-demo']}>
      <p className={styles['patterns__variant-label']}>Default</p>
      <MessageInput placeholder="Message #ux-design…" />
      <p className={styles['patterns__variant-label']}>With priority indicator</p>
      <MessageInput placeholder="Message #ux-design…" showPriorityIndicator />
      <p className={styles['patterns__variant-label']}>With attachments</p>
      <MessageInput placeholder="Message #ux-design…" showAttachments />
      <p className={styles['patterns__variant-label']}>
        With priority + attachments
      </p>
      <MessageInput
        placeholder="Message #ux-design…"
        showPriorityIndicator
        showAttachments
      />
    </div>
  );
}
