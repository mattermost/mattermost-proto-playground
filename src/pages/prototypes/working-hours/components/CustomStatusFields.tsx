import { useCallback, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { EmojiPopover } from '@mattermost/compass-proto';
import { EmojiButton } from '@mattermost/compass-ui/components/emoji-button';
import { TextInput } from '@mattermost/compass-ui/components/text-input';
import { useOutsideClose } from '@/hooks/useOutsideClose';
import { usePopoverTransition } from '@/hooks/usePopoverTransition';
import styles from './CustomStatusFields.module.scss';

type Props = {
  /** Shown (and focusable) only while the custom status option is on. */
  open: boolean;
  emoji: string;
  text: string;
  onChange: (next: { emoji: string; text: string }) => void;
};

const MAX_LENGTH = 100;

/**
 * Emoji and text for the custom status set outside working hours. The emoji
 * picker is compass-proto's EmojiPopover; this host owns open/close, the portal
 * and positioning, as for every overlay.
 */
export function CustomStatusFields({ open, emoji, text, onChange }: Props) {
  const uid = useId();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const triggerRef = useRef<HTMLSpanElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const { mounted, visible } = usePopoverTransition(pickerOpen);

  const close = useCallback(() => setPickerOpen(false), []);

  // Collapsing the section closes the picker with it.
  useLayoutEffect(() => {
    if (!open) setPickerOpen(false);
  }, [open]);

  useLayoutEffect(() => {
    if (pickerOpen && triggerRef.current) {
      const r = triggerRef.current.getBoundingClientRect();
      setPos({ top: r.bottom + 4, left: r.left });
    }
  }, [pickerOpen]);

  // Outside mousedown closes, but the trigger toggles itself.
  useOutsideClose(popoverRef, pickerOpen, () => {
    if (!triggerRef.current?.matches(':hover')) close();
  });

  useLayoutEffect(() => {
    if (!pickerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        close();
        triggerRef.current?.querySelector('button')?.focus();
      }
    };
    document.addEventListener('keydown', onKey, true);
    return () => document.removeEventListener('keydown', onKey, true);
  }, [pickerOpen, close]);

  return (
    <div
      className={[
        styles['custom-status'],
        open && styles['custom-status--open'],
      ]
        .filter(Boolean)
        .join(' ')}
      inert={!open}
    >
      <div className={styles['custom-status__inner']}>
        <div className={styles['custom-status__row']}>
          <TextInput
            id={`${uid}-text`}
            className={styles['custom-status__text']}
            label="Custom status"
            value={text}
            maxLength={MAX_LENGTH}
            clearable
            onChange={(e) => onChange({ emoji, text: e.target.value })}
            onClear={() => onChange({ emoji, text: '' })}
            invalid={open && text.trim() === ''}
            message={
              open && text.trim() === '' ? 'Enter a status message.' : undefined
            }
            leadingIcon={
              <span ref={triggerRef} className={styles['custom-status__emoji']}>
                <EmojiButton
                  size="small"
                  emoji={emoji}
                  aria-label="Choose status emoji"
                  aria-haspopup="dialog"
                  aria-expanded={pickerOpen}
                  active={pickerOpen}
                  onClick={() => setPickerOpen((v) => !v)}
                />
              </span>
            }
          />
        </div>
      </div>
      {mounted &&
        pos &&
        createPortal(
          <div
            ref={popoverRef}
            style={{ position: 'fixed', top: pos.top, left: pos.left }}
            className={[
              styles['custom-status__popover'],
              visible && styles['custom-status__popover--visible'],
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <EmojiPopover
              onEmojiSelect={(picked: string) => {
                onChange({ emoji: picked, text });
                close();
                triggerRef.current?.querySelector('button')?.focus();
              }}
            />
          </div>,
          document.body,
        )}
    </div>
  );
}
