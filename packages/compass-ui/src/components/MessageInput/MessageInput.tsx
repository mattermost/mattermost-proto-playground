import { useEffect, useState, useRef, useCallback } from 'react';
import AlertCircleOutlineIcon from '@mattermost/compass-icons/components/alert-circle-outline';
import ChevronDownIcon from '@mattermost/compass-icons/components/chevron-down';
import ChevronUpIcon from '@mattermost/compass-icons/components/chevron-up';
import DotsHorizontalIcon from '@mattermost/compass-icons/components/dots-horizontal';
import CodeTagsIcon from '@mattermost/compass-icons/components/code-tags';
import CreationOutlineIcon from '@mattermost/compass-icons/components/creation-outline';
import EmoticonHappyOutlineIcon from '@mattermost/compass-icons/components/emoticon-happy-outline';
import EyeOutlineIcon from '@mattermost/compass-icons/components/eye-outline';
import FireIcon from '@mattermost/compass-icons/components/fire';
import FormatBoldIcon from '@mattermost/compass-icons/components/format-bold';
import FormatHeaderIcon from '@mattermost/compass-icons/components/format-header';
import FormatItalicIcon from '@mattermost/compass-icons/components/format-italic';
import FormatLetterCaseIcon from '@mattermost/compass-icons/components/format-letter-case';
import FormatListBulletedIcon from '@mattermost/compass-icons/components/format-list-bulleted';
import FormatListNumberedIcon from '@mattermost/compass-icons/components/format-list-numbered';
import FormatQuoteOpenIcon from '@mattermost/compass-icons/components/format-quote-open';
import FormatStrikethroughVariantIcon from '@mattermost/compass-icons/components/format-strikethrough-variant';
import LinkVariantIcon from '@mattermost/compass-icons/components/link-variant';
import PaperclipIcon from '@mattermost/compass-icons/components/paperclip';
import SendIcon from '@mattermost/compass-icons/components/send';
import Icon from '@/components/Icon/Icon';
import IconButton from '@/components/IconButton/IconButton';
import Tag from '@/components/Tag/Tag';
import AttachmentCard from '@/components/AttachmentCard/AttachmentCard';
import styles from './MessageInput.module.scss';

export type MessageInputWidth = 'wide' | 'narrow';

export interface MessageInputProps {
  className?: string;
  placeholder?: string;
  showPriorityIndicator?: boolean;
  showAttachments?: boolean;
  value?: string;
  onChange?: (value: string) => void;
  onSelectionChange?: () => void;
  inputRef?: React.RefObject<HTMLTextAreaElement | null>;
  /** `narrow` matches the Figma Message Input “Narrow” / right-sidebar layout. */
  width?: MessageInputWidth;
}

export default function MessageInput({
  className = '',
  placeholder = 'Message channel…',
  showPriorityIndicator = false,
  showAttachments = false,
  value,
  onChange,
  onSelectionChange,
  inputRef,
  width = 'wide',
}: MessageInputProps) {
  const [internalText, setInternalText] = useState('');
  const isControlled = value !== undefined;
  const text = isControlled ? value : internalText;
  const setText = (next: string) => {
    if (isControlled) onChange?.(next);
    else setInternalText(next);
  };
  const [formattingOpen, setFormattingOpen] = useState(false);
  const internalRef = useRef<HTMLTextAreaElement>(null);

  const setTextareaRef = (node: HTMLTextAreaElement | null) => {
    internalRef.current = node;
    if (inputRef) {
      (inputRef as React.MutableRefObject<HTMLTextAreaElement | null>).current = node;
    }
  };

  const handleInput = useCallback(() => {
    const el = internalRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, []);

  useEffect(() => {
    handleInput();
  }, [text, handleInput]);

  const hasSendValue = text.trim().length > 0;

  const cls = (base: string, mod?: string) =>
    [styles[base], mod ? styles[mod] : ''].filter(Boolean).join(' ');

  const isNarrowFormattingOpen = width === 'narrow' && formattingOpen;
  const showWideFormattingBar = formattingOpen && width === 'wide';

  const composerActions = (
    <>
      <button
        type="button"
        className={cls(
          'message-input__format-btn',
          formattingOpen ? 'message-input__format-btn--active' : '',
        )}
        aria-label={
          formattingOpen
            ? 'Hide formatting toolbar'
            : 'Show formatting toolbar'
        }
        aria-pressed={formattingOpen}
        onClick={() => setFormattingOpen((prev) => !prev)}
      >
        <Icon glyph={<FormatLetterCaseIcon />} size="16" />
        {isNarrowFormattingOpen ? (
          <span className={styles['message-input__format-chevron']}>
            <Icon glyph={<ChevronUpIcon />} size="12" />
          </span>
        ) : (
          <span
            className={cls(
              'message-input__format-chevron',
              formattingOpen ? 'message-input__format-chevron--rotated' : '',
            )}
          >
            <Icon glyph={<ChevronDownIcon />} size="12" />
          </span>
        )}
      </button>

      <span
        className={styles['message-input__actions-divider']}
        aria-hidden
      />

      <IconButton
        icon={<Icon glyph={<PaperclipIcon />} size="16" />}
        size="Small"
        aria-label="Attach a file"
      />
      <IconButton
        icon={<Icon glyph={<EmoticonHappyOutlineIcon />} size="16" />}
        size="Small"
        aria-label="Add an emoji"
      />

      <div
        className={cls(
          'message-input__send',
          !hasSendValue ? 'message-input__send--disabled' : '',
        )}
      >
        <button
          type="button"
          className={styles['message-input__send-main']}
          aria-label="Send message"
          disabled={!hasSendValue}
        >
          <Icon glyph={<SendIcon />} size="16" />
        </button>
        <button
          type="button"
          className={styles['message-input__send-dropdown']}
          aria-label="Send options"
          disabled={!hasSendValue}
        >
          <Icon glyph={<ChevronDownIcon />} size="16" />
        </button>
      </div>
    </>
  );

  const rootClass = [
    styles['message-input'],
    width === 'narrow' ? styles['message-input--width-narrow'] : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={rootClass}>
      <div
        className={cls(
          'message-input__container',
          formattingOpen ? 'message-input__container--formatting-open' : '',
        )}
      >
        {/* Preview button — fades in when formatting is open */}
        <button
          type="button"
          className={cls(
            'message-input__preview-btn',
            formattingOpen ? 'message-input__preview-btn--visible' : '',
          )}
          aria-label="Preview"
          tabIndex={formattingOpen ? 0 : -1}
        >
          <Icon glyph={<EyeOutlineIcon />} size="16" />
        </button>

        {/* Main text area */}
        <div
          className={cls(
            'message-input__body',
            formattingOpen ? 'message-input__body--formatting-open' : '',
          )}
        >
          {showPriorityIndicator && (
            <div className={styles['message-input__priority-row']}>
              <Tag
                label="IMPORTANT"
                type="Info"
                size="X-Small"
                casing="All Caps"
                leadingIcon={
                  <Icon glyph={<AlertCircleOutlineIcon />} size="10" />
                }
              />
            </div>
          )}
          <textarea
            ref={setTextareaRef}
            className={styles['message-input__textarea']}
            placeholder={placeholder}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onInput={handleInput}
            onSelect={onSelectionChange}
            onKeyUp={onSelectionChange}
            onClick={onSelectionChange}
            rows={1}
          />
        </div>

        {/* Attachment cards */}
        {showAttachments && (
          <div className={styles['message-input__attachments']}>
            <div className={styles['message-input__attachments-list']}>
              <AttachmentCard
                fileName="Design_Brief.pdf"
                fileMeta="PDF 240KB"
                fileType="pdf"
                state="default"
                onRemove={() => {}}
              />
              <AttachmentCard
                fileName="Wireframes_v3.png"
                fileMeta="PNG 1.2MB"
                fileType="image-icon"
                state="default"
                onRemove={() => {}}
              />
            </div>
          </div>
        )}

        {/* Formatting toolbar — full bar (wide only); narrow uses collapsed strip in footer */}
        <div
          className={cls(
            'message-input__formatting-bar',
            showWideFormattingBar ? 'message-input__formatting-bar--open' : '',
          )}
          aria-hidden={!showWideFormattingBar}
        >
          <div className={styles['message-input__toolbar-controls']}>
            {/* Style */}
            <div className={styles['message-input__toolbar-group']}>
              <IconButton
                icon={<Icon glyph={<FormatBoldIcon />} size="16" />}
                size="Small"
                aria-label="Bold"
              />
              <IconButton
                icon={<Icon glyph={<FormatItalicIcon />} size="16" />}
                size="Small"
                aria-label="Italic"
              />
              <IconButton
                icon={
                  <Icon glyph={<FormatStrikethroughVariantIcon />} size="16" />
                }
                size="Small"
                aria-label="Strikethrough"
              />
              <IconButton
                icon={<Icon glyph={<FormatHeaderIcon />} size="16" />}
                size="Small"
                aria-label="Heading"
              />
            </div>

            <span
              className={styles['message-input__toolbar-divider']}
              aria-hidden
            />

            {/* Links + Code */}
            <div className={styles['message-input__toolbar-group']}>
              <IconButton
                icon={<Icon glyph={<LinkVariantIcon />} size="16" />}
                size="Small"
                aria-label="Add link"
              />
              <IconButton
                icon={<Icon glyph={<CodeTagsIcon />} size="16" />}
                size="Small"
                aria-label="Code"
              />
            </div>

            <span
              className={styles['message-input__toolbar-divider']}
              aria-hidden
            />

            {/* Paragraph */}
            <div className={styles['message-input__toolbar-group']}>
              <IconButton
                icon={<Icon glyph={<FormatQuoteOpenIcon />} size="16" />}
                size="Small"
                aria-label="Quote"
              />
              <IconButton
                icon={<Icon glyph={<FormatListBulletedIcon />} size="16" />}
                size="Small"
                aria-label="Bulleted list"
              />
              <IconButton
                icon={<Icon glyph={<FormatListNumberedIcon />} size="16" />}
                size="Small"
                aria-label="Numbered list"
              />
            </div>

            <span
              className={styles['message-input__toolbar-divider']}
              aria-hidden
            />

            {/* Tools */}
            <div className={styles['message-input__toolbar-group']}>
              <IconButton
                icon={<Icon glyph={<AlertCircleOutlineIcon />} size="16" />}
                size="Small"
                aria-label="Message priority"
              />
              <IconButton
                icon={<Icon glyph={<FireIcon />} size="16" />}
                size="Small"
                aria-label="Burn on read"
              />
              <IconButton
                icon={<Icon glyph={<CreationOutlineIcon />} size="16" />}
                size="Small"
                aria-label="AI assistance"
              />
            </div>
          </div>
        </div>

        {width === 'narrow' ? (
          <div className={styles['message-input__narrow-chrome']}>
            <div className={styles['message-input__narrow-chrome-left']}>
              {formattingOpen && (
                <div className={styles['message-input__formatting-collapsed']}>
                  <IconButton
                    icon={<Icon glyph={<FormatBoldIcon />} size="16" />}
                    size="Small"
                    aria-label="Bold"
                  />
                  <IconButton
                    icon={<Icon glyph={<FormatItalicIcon />} size="16" />}
                    size="Small"
                    aria-label="Italic"
                  />
                  <IconButton
                    icon={<Icon glyph={<LinkVariantIcon />} size="16" />}
                    size="Small"
                    aria-label="Add link"
                  />
                  <IconButton
                    icon={<Icon glyph={<DotsHorizontalIcon />} size="16" />}
                    size="Small"
                    aria-label="More formatting options"
                  />
                </div>
              )}
            </div>
            <div
              className={[
                styles['message-input__actions'],
                styles['message-input__actions--narrow-chrome'],
              ].join(' ')}
            >
              {composerActions}
            </div>
          </div>
        ) : (
          <div className={styles['message-input__actions']}>{composerActions}</div>
        )}
      </div>
    </div>
  );
}
