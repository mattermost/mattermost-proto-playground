import { useRef, useState } from 'react';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import Icon from '@/components/ui/Icon/Icon';
import Button from '@/components/ui/Button/Button';
import FixedPopoverMenu from '@/components/ui/FixedPopoverMenu/FixedPopoverMenu';
import type { FixedPopoverAlign } from '@/components/ui/FixedPopoverMenu/FixedPopoverMenu';
import PopoverMenu from '@/components/ui/PopoverMenu/PopoverMenu';
import MenuItem from '@/components/ui/MenuItem/MenuItem';
import { ALL_RESOURCES, type ResourceKind } from '../../hubData';
import { resourceIcon } from '../../resourceIcons';
import styles from './AddResourceMenu.module.scss';

export interface AddResourceMenuProps {
  applied: ResourceKind[];
  onAdd: (resource: ResourceKind) => void;
  emphasis?: 'Primary' | 'Secondary' | 'Tertiary';
  size?: 'Small' | 'Medium';
  align?: FixedPopoverAlign;
}

export default function AddResourceMenu({
  applied,
  onAdd,
  emphasis = 'Tertiary',
  size = 'Small',
  align = 'start',
}: AddResourceMenuProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);

  const available = ALL_RESOURCES.filter((r) => !applied.includes(r));

  return (
    <div className={styles['add']}>
      <div className={styles['add__trigger']} ref={triggerRef}>
        <Button
          emphasis={emphasis}
          size={size}
          leadingIcon={<Icon size="16" glyph={<PlusIcon />} />}
          disabled={available.length === 0}
          aria-haspopup="menu"
          aria-expanded={open}
          onClick={() => setOpen((current) => !current)}
        >
          Add resource
        </Button>
        <FixedPopoverMenu
          open={open && available.length > 0}
          onClose={() => setOpen(false)}
          anchorRef={triggerRef}
          align={align}
        >
          <PopoverMenu aria-label="Add resource">
            {available.map((r) => (
              <MenuItem
                key={r}
                label={r}
                leadingVisual={resourceIcon(r)}
                onClick={() => {
                  setOpen(false);
                  onAdd(r);
                }}
              />
            ))}
          </PopoverMenu>
        </FixedPopoverMenu>
      </div>
    </div>
  );
}
