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
  /** When set, only these resource kinds appear in the add menu. */
  allowedResources?: ResourceKind[];
  /** Override display labels for resource kinds. */
  resourceLabels?: Partial<Record<ResourceKind, string>>;
}

export default function AddResourceMenu({
  applied,
  onAdd,
  emphasis = 'Tertiary',
  size = 'Small',
  align = 'start',
  allowedResources = ALL_RESOURCES,
  resourceLabels,
}: AddResourceMenuProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);

  const available = allowedResources.filter((r) => !applied.includes(r));

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
                label={resourceLabels?.[r] ?? r}
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
