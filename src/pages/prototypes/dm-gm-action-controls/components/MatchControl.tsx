// [AI DRAFT] "All conditions required" / "Any condition required" control for
// the requirements table header. Not shipped (shipped Simple mode joins rows
// with AND only); used by both variations so they behave the same.
import { useCallback, useRef, useState } from 'react';
import ChevronDownIcon from '@mattermost/compass-icons/components/chevron-down';
import FilterVariantIcon from '@mattermost/compass-icons/components/filter-variant';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { MenuItem } from '@mattermost/compass-ui/components/menu-item';
import { PopoverMenu } from '@mattermost/compass-ui/components/popover-menu';
import { useOutsideClose } from '@/hooks/useOutsideClose';
import { MATCH } from '../copy';
import type { MatchMode } from '../policyModel';
import styles from './PolicyEditor.module.scss';

export default function MatchControl({
  value,
  onChange,
}: {
  value: MatchMode;
  onChange: (m: MatchMode) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);
  useOutsideClose(ref, open, close);
  return (
    <div className={styles['policy-editor__anchor']} ref={ref}>
      <button
        type="button"
        className={styles['policy-editor__head-control']}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <Icon glyph={<FilterVariantIcon />} size="16" />
        {MATCH[value]}
        <Icon glyph={<ChevronDownIcon />} size="16" />
      </button>
      {open ? (
        <PopoverMenu className={styles['policy-editor__match-menu']}>
          {(['all', 'any'] as MatchMode[]).map((mode) => (
            <MenuItem
              key={mode}
              label={MATCH[mode]}
              leadingElement={false}
              trailingElement={mode === value}
              onClick={() => {
                onChange(mode);
                close();
              }}
            />
          ))}
        </PopoverMenu>
      ) : null}
    </div>
  );
}
