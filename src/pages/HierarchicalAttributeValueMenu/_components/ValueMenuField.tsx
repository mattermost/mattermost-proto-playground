import { useEffect, useId, useRef, type ReactNode } from 'react';
import AlertOutlineIcon from '@mattermost/compass-icons/components/alert-outline';
import ChevronDownIcon from '@mattermost/compass-icons/components/chevron-down';
import Icon from '@/components/ui/Icon/Icon';
import AnchoredValueMenu from './AnchoredValueMenu';
import styles from './ValueMenuField.module.scss';

export type ValueMenuFieldVariant = 'control' | 'chips';

/**
 * What the trigger opens. `tree` makes the trigger a `combobox` controlling the
 * multi-select value tree; `menu` keeps a plain menu button for the flat
 * single-select Classification field, where a menu is the correct role model.
 */
export type ValueMenuFieldPopup = 'tree' | 'menu';

export interface ValueMenuFieldProps {
  /**
   * `control` — an input-shaped box holding removable chips plus a caret, which
   * is the pattern `Device_Type` already uses on User Configuration.
   * `chips` — the value chip itself is the trigger, which is what the Channel
   * Info sidebar does; there is no room there for a second box.
   */
  variant?: ValueMenuFieldVariant;
  /** Accessible name for the trigger. */
  label: string;
  placeholder: string;
  /** Selected-value chips. Empty renders the placeholder. */
  children?: ReactNode;
  hasValue: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  popup?: ValueMenuFieldPopup;
  /**
   * The popover body. Receives the id the trigger points `aria-controls` at, so
   * the relationship is stated once and cannot drift between the two elements.
   */
  menu: (popupId: string) => ReactNode;
  align?: 'start' | 'end';
  /** Inline notices under the field. Never inside the popover. */
  notice?: ReactNode;
  disabled?: boolean;
}

export default function ValueMenuField({
  variant = 'control',
  label,
  placeholder,
  children,
  hasValue,
  open,
  onOpenChange,
  popup = 'tree',
  menu,
  align = 'start',
  notice,
  disabled = false,
}: ValueMenuFieldProps) {
  const popupId = useId();
  const anchorRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const wasOpen = useRef(open);

  // Escape (and an outside click) unmounts the portaled popover with focus still
  // inside it, which would drop focus on the document body. The guideline is
  // explicit that closing returns focus to the trigger that opened it.
  useEffect(() => {
    if (wasOpen.current && !open) {
      const active = document.activeElement;
      if (active == null || active === document.body)
        triggerRef.current?.focus();
    }
    wasOpen.current = open;
  }, [open]);

  /**
   * ARIA 1.2 allows a combobox popup to be a `listbox`, `tree`, `grid` or
   * `dialog`; this one is a tree, so the trigger says so rather than claiming a
   * menu it does not open.
   */
  const triggerProps = {
    role: popup === 'tree' ? ('combobox' as const) : undefined,
    'aria-haspopup': popup,
    'aria-expanded': open,
    'aria-controls': open ? popupId : undefined,
    'aria-label': label,
  };

  return (
    <div className={styles['value-menu-field']}>
      {variant === 'control' ? (
        <div
          ref={anchorRef}
          className={[
            styles['value-menu-field__control'],
            disabled ? styles['value-menu-field__control--disabled'] : '',
            open ? styles['value-menu-field__control--open'] : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {hasValue && (
            <span className={styles['value-menu-field__chips']}>
              {children}
            </span>
          )}
          <button
            type="button"
            ref={triggerRef}
            className={styles['value-menu-field__trigger']}
            disabled={disabled}
            onClick={() => onOpenChange(!open)}
            {...triggerProps}
          >
            {!hasValue && (
              <span className={styles['value-menu-field__placeholder']}>
                {placeholder}
              </span>
            )}
            <span className={styles['value-menu-field__caret']}>
              <Icon size="16" glyph={<ChevronDownIcon />} />
            </span>
          </button>
        </div>
      ) : (
        <button
          type="button"
          ref={triggerRef}
          className={[
            styles['value-menu-field__chip-trigger'],
            open ? styles['value-menu-field__chip-trigger--open'] : '',
          ]
            .filter(Boolean)
            .join(' ')}
          disabled={disabled}
          onClick={() => onOpenChange(!open)}
          {...triggerProps}
        >
          {hasValue ? (
            children
          ) : (
            <span className={styles['value-menu-field__placeholder']}>
              {placeholder}
            </span>
          )}
        </button>
      )}

      <AnchoredValueMenu
        open={open}
        onClose={() => onOpenChange(false)}
        anchorRef={variant === 'control' ? anchorRef : triggerRef}
        align={align}
      >
        {menu(popupId)}
      </AnchoredValueMenu>

      {notice}
    </div>
  );
}

export interface FieldNoticeProps {
  tone: 'warning' | 'hint';
  children: ReactNode;
  /** One-click fix, offered only with the harmless subject-side hint. */
  action?: { label: string; onClick: () => void };
}

/**
 * The only prose allowed outside the popover: two resource-side dangers get a
 * warning; harmless subject-side redundancy gets a quiet hint with a fix. Both
 * sit under the field so the popover stays a dropdown.
 */
export function FieldNotice({ tone, children, action }: FieldNoticeProps) {
  return (
    <div
      className={[
        styles['value-menu-field__notice'],
        styles[`value-menu-field__notice--${tone}`],
      ].join(' ')}
    >
      {tone === 'warning' && (
        <span className={styles['value-menu-field__notice-icon']}>
          <Icon size="12" glyph={<AlertOutlineIcon />} />
        </span>
      )}
      <span className={styles['value-menu-field__notice-text']}>
        {children}
      </span>
      {action != null && (
        <button
          type="button"
          className={styles['value-menu-field__notice-action']}
          onClick={action.onClick}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
