import { useRef, useState } from 'react';
import HelpCircleOutlineIcon from '@mattermost/compass-icons/components/help-circle-outline';
import PopoverMenu from '@/components/ui/PopoverMenu/PopoverMenu';
import { useOutsideClose } from '@/hooks/useOutsideClose';
import styles from './HelpPopover.module.scss';

export interface HelpPopoverProps {
  /** Trigger label, e.g. "What's this?". */
  triggerLabel: string;
  /** Optional title shown at the top of the popover body. */
  title?: string;
  /** Body copy — one short paragraph. */
  body: string;
  /** Optional worked example shown as a muted note under the body. */
  example?: string;
  className?: string;
}

/**
 * Click-to-open explainer popover used for the Ranked-type helper and the
 * Channels→Posts ceiling explanation ("What's this?"). Uses the Compass
 * PopoverMenu surface for elevation/border and the shared outside-close hook.
 */
export default function HelpPopover({
  triggerLabel,
  title,
  body,
  example,
  className = '',
}: HelpPopoverProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  useOutsideClose(ref, open, () => setOpen(false));

  return (
    <span
      ref={ref}
      className={[styles['help'], className].filter(Boolean).join(' ')}
    >
      <button
        type="button"
        className={styles['help__trigger']}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <HelpCircleOutlineIcon size={14} />
        <span>{triggerLabel}</span>
      </button>
      {open && (
        <div className={styles['help__pop']}>
          <PopoverMenu>
            <div className={styles['help__body']}>
              {title && <p className={styles['help__title']}>{title}</p>}
              <p className={styles['help__text']}>{body}</p>
              {example && <p className={styles['help__example']}>{example}</p>}
            </div>
          </PopoverMenu>
        </div>
      )}
    </span>
  );
}
