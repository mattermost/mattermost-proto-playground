import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FocusEvent,
  type ReactNode,
  type RefObject,
} from 'react';
import ArrowCollapseIcon from '@mattermost/compass-icons/components/arrow-collapse';
import ArrowExpandIcon from '@mattermost/compass-icons/components/arrow-expand';
import AtIcon from '@mattermost/compass-icons/components/at';
import CloseCircleIcon from '@mattermost/compass-icons/components/close-circle';
import EmoticonOutlineIcon from '@mattermost/compass-icons/components/emoticon-outline';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import SendIcon from '@mattermost/compass-icons/components/send';
import SlashForwardBoxOutlineIcon from '@mattermost/compass-icons/components/slash-forward-box-outline';
import { Icon } from '@mattermost/compass-ui';
import { IconButton } from '@mattermost/compass-ui';
import styles from './MobileMessageInput.module.scss';

export type MobileMessageInputVariant = 'Root' | 'Reply';

export interface MobileMessageAttachment {
  id: string;
  src: string;
  alt?: string;
}

export interface MobileMessageInputProps {
  /** Root channel composer or thread reply. Default: Root. */
  variant?: MobileMessageInputVariant;
  /** Field placeholder. Defaults by variant. */
  placeholder?: string;
  /** Controlled message text. */
  value?: string;
  onChange?: (value: string) => void;
  /** Controlled expand state. */
  expanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  /** Attachment thumbnails shown above the action row. */
  attachments?: MobileMessageAttachment[];
  onRemoveAttachment?: (id: string) => void;
  onPlusClick?: () => void;
  onMentionClick?: () => void;
  onEmojiClick?: () => void;
  onSlashClick?: () => void;
  onSend?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
  /** Focus the textarea on mount. */
  autoFocus?: boolean;
  /** Start in the focused composer chrome (without requiring DOM focus). */
  defaultFocused?: boolean;
  inputRef?: RefObject<HTMLTextAreaElement | null>;
  className?: string;
}

function defaultPlaceholder(variant: MobileMessageInputVariant): string {
  return variant === 'Reply' ? 'Reply…' : 'Write a message…';
}

/**
 * Mobile iOS message composer for channel (Root) and thread (Reply) screens.
 *
 * @see Figma Patterns — Mobile — Message Input
 */
export default function MobileMessageInput({
  variant = 'Root',
  placeholder,
  value,
  onChange,
  expanded,
  onExpandedChange,
  attachments,
  onRemoveAttachment,
  onPlusClick,
  onMentionClick,
  onEmojiClick,
  onSlashClick,
  onSend,
  onFocus,
  onBlur,
  autoFocus = false,
  defaultFocused = false,
  inputRef,
  className = '',
}: MobileMessageInputProps) {
  const localRef = useRef<HTMLTextAreaElement | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const isValueControlled = value !== undefined;
  const [uncontrolledValue, setUncontrolledValue] = useState(value ?? '');
  const currentValue = isValueControlled ? value : uncontrolledValue;

  const isExpandedControlled = expanded !== undefined;
  const [uncontrolledExpanded, setUncontrolledExpanded] = useState(
    expanded ?? false,
  );
  const isExpanded = isExpandedControlled ? expanded : uncontrolledExpanded;

  const [focused, setFocused] = useState(autoFocus || defaultFocused);

  const resolvedPlaceholder = placeholder ?? defaultPlaceholder(variant);
  const hasText = currentValue.trim().length > 0;
  const hasAttachments = Boolean(attachments && attachments.length > 0);
  const showFocusedChrome = focused || isExpanded;

  const setTextareaRef = (node: HTMLTextAreaElement | null) => {
    localRef.current = node;
    if (inputRef) {
      (
        inputRef as {current: HTMLTextAreaElement | null}
      ).current = node;
    }
  };

  useEffect(() => {
    if (autoFocus) {
      localRef.current?.focus();
    }
  }, [autoFocus]);

  const setExpanded = (next: boolean) => {
    if (!isExpandedControlled) {
      setUncontrolledExpanded(next);
    }
    onExpandedChange?.(next);
  };

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const next = event.target.value;
    if (!isValueControlled) {
      setUncontrolledValue(next);
    }
    onChange?.(next);
  };

  const handleFocus = () => {
    setFocused(true);
    onFocus?.();
  };

  const handleBlur = (event: FocusEvent<HTMLTextAreaElement>) => {
    const next = event.relatedTarget;
    if (next instanceof Node && rootRef.current?.contains(next)) {
      return;
    }
    setFocused(false);
    onBlur?.();
  };

  const handleExpandToggle = () => {
    setExpanded(!isExpanded);
    localRef.current?.focus();
  };

  const toolbarIcon = (glyph: ReactNode) => (
    <Icon size='20' glyph={glyph} />
  );

  const rootClass = [
    styles['mobile-message-input'],
    showFocusedChrome ? styles['mobile-message-input--focused'] : '',
    isExpanded ? styles['mobile-message-input--expanded'] : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const renderSendButton = (compact: boolean) => {
    const visible =
      hasText && (compact ? !showFocusedChrome : showFocusedChrome);

    return (
      <button
        type='button'
        className={styles['mobile-message-input__send']}
        aria-label='Send'
        onClick={onSend}
        tabIndex={visible ? undefined : -1}
        aria-hidden={!visible}
      >
        <Icon size='20' glyph={<SendIcon />} />
      </button>
    );
  };

  return (
    <div ref={rootRef} className={rootClass}>
      <div className={styles['mobile-message-input__expand']}>
        <IconButton
          aria-label={isExpanded ? 'Collapse composer' : 'Expand composer'}
          size='Small'
          onClick={handleExpandToggle}
          tabIndex={showFocusedChrome ? undefined : -1}
          icon={
            <Icon
              size='16'
              glyph={isExpanded ? <ArrowCollapseIcon /> : <ArrowExpandIcon />}
            />
          }
        />
      </div>

      <div className={styles['mobile-message-input__top']}>
        <div className={styles['mobile-message-input__plus']}>
          <IconButton
            aria-label='Add files and media'
            size='Medium'
            rounded
            className={styles['mobile-message-input__plus-button']}
            onClick={onPlusClick}
            tabIndex={showFocusedChrome ? -1 : undefined}
            icon={toolbarIcon(<PlusIcon />)}
          />
        </div>

        <div className={styles['mobile-message-input__field']}>
          <textarea
            ref={setTextareaRef}
            className={styles['mobile-message-input__textarea']}
            aria-label={resolvedPlaceholder}
            placeholder={resolvedPlaceholder}
            value={currentValue}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            rows={1}
            autoFocus={autoFocus}
          />
        </div>

        <div
          className={[
            styles['mobile-message-input__trailing'],
            hasText && !showFocusedChrome
              ? styles['mobile-message-input__trailing--visible']
              : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {renderSendButton(true)}
        </div>
      </div>

      {hasAttachments && (
        <div className={styles['mobile-message-input__attachments']}>
          <ul className={styles['mobile-message-input__attachment-list']}>
            {attachments!.map((attachment) => (
              <li
                key={attachment.id}
                className={styles['mobile-message-input__attachment']}
              >
                <img
                  className={styles['mobile-message-input__attachment-thumb']}
                  src={attachment.src}
                  alt={attachment.alt ?? ''}
                />
                <button
                  type='button'
                  className={styles['mobile-message-input__attachment-remove']}
                  aria-label={`Remove ${attachment.alt ?? 'attachment'}`}
                  onClick={() => onRemoveAttachment?.(attachment.id)}
                >
                  <Icon size='20' glyph={<CloseCircleIcon />} />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div
        className={styles['mobile-message-input__actions-collapse']}
        aria-hidden={!showFocusedChrome}
      >
        <div className={styles['mobile-message-input__actions-collapse-inner']}>
          <div className={styles['mobile-message-input__actions']}>
            <div className={styles['mobile-message-input__action-group']}>
              <div className={styles['mobile-message-input__action']}>
                <IconButton
                  aria-label='Add files and media'
                  size='Medium'
                  rounded
                  className={styles['mobile-message-input__plus-button']}
                  onClick={onPlusClick}
                  tabIndex={showFocusedChrome ? undefined : -1}
                  icon={toolbarIcon(<PlusIcon />)}
                />
              </div>
              <div className={styles['mobile-message-input__action']}>
                <IconButton
                  aria-label='Mention someone'
                  size='Medium'
                  onClick={onMentionClick}
                  tabIndex={showFocusedChrome ? undefined : -1}
                  icon={toolbarIcon(<AtIcon />)}
                />
              </div>
              <div className={styles['mobile-message-input__action']}>
                <IconButton
                  aria-label='Insert emoji'
                  size='Medium'
                  onClick={onEmojiClick}
                  tabIndex={showFocusedChrome ? undefined : -1}
                  icon={toolbarIcon(<EmoticonOutlineIcon />)}
                />
              </div>
              <div className={styles['mobile-message-input__action']}>
                <IconButton
                  aria-label='Slash command'
                  size='Medium'
                  onClick={onSlashClick}
                  tabIndex={showFocusedChrome ? undefined : -1}
                  icon={toolbarIcon(<SlashForwardBoxOutlineIcon />)}
                />
              </div>
            </div>

            <div
              className={[
                styles['mobile-message-input__primary'],
                hasText && showFocusedChrome
                  ? styles['mobile-message-input__primary--visible']
                  : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {renderSendButton(false)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
