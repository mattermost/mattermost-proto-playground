import { useEffect, useRef, type ComponentProps } from 'react';
import { Message } from '@mattermost/compass-proto';
import styles from './AcvcMessage.module.scss';

type MessageProps = ComponentProps<typeof Message>;

export interface AcvcMessageProps extends MessageProps {
  /**
   * Channel Write Access denied. Keeps personal/read actions (save, more) on the
   * hover toolbar and drops quick reactions, AI, plugin, and reply.
   */
  writeDenied?: boolean;
  /** Called when the toolbar's More actions control is clicked. */
  onMoreActionsClick?: () => void;
}

/**
 * Compass `Message` with the Write-to-Channels toolbar trim.
 *
 * Published `Message` / `MessageActions` have no write-access prop, so the
 * write controls are hidden with a className override on the real toolbar and
 * the More actions click is picked up by delegation. The wrapper uses
 * `display: contents`, so it adds no box to the message list.
 */
export default function AcvcMessage({
  writeDenied = false,
  onMoreActionsClick,
  ...messageProps
}: AcvcMessageProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || !onMoreActionsClick) return;
    function handle(e: MouseEvent) {
      const target = e.target as HTMLElement | null;
      if (
        target?.closest(
          '[role="toolbar"][aria-label="Message actions"] [aria-label="More actions"]',
        )
      ) {
        onMoreActionsClick?.();
      }
    }
    root.addEventListener('click', handle);
    return () => root.removeEventListener('click', handle);
  }, [onMoreActionsClick]);

  return (
    <div
      ref={rootRef}
      className={[
        styles['acvc-message'],
        writeDenied ? styles['acvc-message--write-denied'] : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <Message {...messageProps} />
    </div>
  );
}
