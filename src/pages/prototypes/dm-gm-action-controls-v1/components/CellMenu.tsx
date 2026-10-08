// [AI DRAFT] Borderless, clickable table cell that opens a Compass menu.
// Mirrors the shipped ABAC table editor (webapp table_editor/selector_menus.scss):
// no input border, a neutral wash on hover, a deeper wash while the menu is
// open, and a "[] Subject: attribute" chip for attribute references. Compass
// has no table-cell trigger, so the trigger is composed from tokens; the menu
// itself is PopoverMenu + MenuItem.
import { useCallback, useRef, useState, type ReactNode } from 'react';
import ChevronDownIcon from '@mattermost/compass-icons/components/chevron-down';
import CodeBracketsIcon from '@mattermost/compass-icons/components/code-brackets';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { MenuItem } from '@mattermost/compass-ui/components/menu-item';
import { PopoverMenu } from '@mattermost/compass-ui/components/popover-menu';
import { useOutsideClose } from '@/hooks/useOutsideClose';
import styles from './PolicyEditor.module.scss';

export interface CellMenuOption {
  value: string;
  label: string;
}

export function CellMenu({
  ariaLabel,
  options,
  value,
  onChange,
  children,
  chevron = false,
}: {
  ariaLabel: string;
  options: CellMenuOption[];
  value: string;
  onChange: (value: string) => void;
  /** What the cell shows: plain text, or an AttributeChip. */
  children: ReactNode;
  /** Show a trailing chevron, as the shipped value cell does. */
  chevron?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);
  useOutsideClose(ref, open, close);
  return (
    <div className={styles['policy-editor__cell-anchor']} ref={ref}>
      <button
        type="button"
        className={styles['policy-editor__cell-trigger']}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => setOpen((o) => !o)}
      >
        <span className={styles['policy-editor__cell-trigger-value']}>
          {children}
        </span>
        {chevron ? <Icon glyph={<ChevronDownIcon />} size="16" /> : null}
      </button>
      {open ? (
        <PopoverMenu
          className={styles['policy-editor__cell-menu']}
          aria-label={ariaLabel}
        >
          {options.map((o) => (
            <MenuItem
              key={o.value}
              label={o.label}
              leadingElement={false}
              trailingElement={o.value === value}
              onClick={() => {
                onChange(o.value);
                close();
              }}
            />
          ))}
        </PopoverMenu>
      ) : null}
    </div>
  );
}

/** "[] User: Program": an attribute reference, styled as a chip, not a value. */
export function AttributeChip({ label }: { label: string }) {
  return (
    <span className={styles['policy-editor__attr-chip']}>
      <Icon glyph={<CodeBracketsIcon />} size="12" />
      <span className={styles['policy-editor__attr-chip-text']}>{label}</span>
    </span>
  );
}
