import { useRef, useState } from 'react';
import DotsHorizontalIcon from '@mattermost/compass-icons/components/dots-horizontal';
import ImportIcon from '@mattermost/compass-icons/components/import';
import AccountMultiplePlusOutlineIcon from '@mattermost/compass-icons/components/account-multiple-plus-outline';
import KeyVariantIcon from '@mattermost/compass-icons/components/key-variant';
import IconButton from '@/components/ui/IconButton/IconButton';
import Icon from '@/components/ui/Icon/Icon';
import PopoverMenu, {
  PopoverMenuTitle,
} from '@/components/ui/PopoverMenu/PopoverMenu';
import MenuItem from '@/components/ui/MenuItem/MenuItem';
import Button from '@/components/ui/Button/Button';
import SideSheet from '../SideSheet/SideSheet';
import { useOutsideClose } from '@/hooks/useOutsideClose';
import styles from './BulkManagementMenu.module.scss';

export interface BulkManagementMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type BulkAction = 'import' | 'assign' | 'delegate';

const NOTICE: Record<
  BulkAction,
  { title: string; body: string; primary: string }
> = {
  import: {
    title: 'Bulk value import',
    body: 'Import a large value set — for example a program or COI taxonomy of thousands of values — from a file or a connected source, with duplicate and masking rules applied on the way in. Full import is planned for a later release; this entry point reserves its place in the workflow.',
    primary: 'Choose a file',
  },
  assign: {
    title: 'Assign values to members',
    body: 'Assign an attribute value to many users at once — by list, filter, or group — instead of editing each profile. Mass assignment is planned for a later release; this entry point reserves its place in the workflow.',
    primary: 'Select members',
  },
  delegate: {
    title: 'Delegated ownership',
    body: 'Hand day-to-day management of a value set — adds, retirements, assignments — to a named owner without granting full system-admin access. Delegated ownership is planned for a later release and will be reconciled with existing delegated-management tooling.',
    primary: 'Add an owner',
  },
};

/**
 * Bulk attribute/value management — STUB (July-1 delta §3.2).
 *
 * A neutral overflow menu that surfaces WHERE bulk value ingestion, mass
 * value-assignment, and delegated ownership will live. The entry points read
 * as plausible product; each opens a short notice rather than a working flow —
 * depth is deferred to a follow-on increment and kept neutral so it reconciles
 * with (does not duplicate) existing delegated-management tooling.
 */
export default function BulkManagementMenu({
  open,
  onOpenChange,
}: BulkManagementMenuProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [notice, setNotice] = useState<BulkAction | null>(null);
  useOutsideClose(wrapRef, open, () => onOpenChange(false));

  const pick = (action: BulkAction) => {
    onOpenChange(false);
    setNotice(action);
  };

  const active = notice ? NOTICE[notice] : null;

  return (
    <div className={styles['bulk']} ref={wrapRef}>
      <IconButton
        aria-label="Bulk management"
        size="Medium"
        toggled={open}
        onClick={() => onOpenChange(!open)}
        icon={<Icon glyph={<DotsHorizontalIcon />} size="20" />}
      />

      {open && (
        <PopoverMenu className={styles['bulk__menu']}>
          <PopoverMenuTitle>Bulk management</PopoverMenuTitle>
          <MenuItem
            label="Bulk value import…"
            leadingVisual={<Icon glyph={<ImportIcon />} size="16" />}
            secondaryLabel="Import a large value set from a file or source"
            onClick={() => pick('import')}
          />
          <MenuItem
            label="Assign values to members…"
            leadingVisual={
              <Icon glyph={<AccountMultiplePlusOutlineIcon />} size="16" />
            }
            secondaryLabel="Set an attribute value across many users at once"
            onClick={() => pick('assign')}
          />
          <MenuItem
            label="Delegated ownership…"
            leadingVisual={<Icon glyph={<KeyVariantIcon />} size="16" />}
            secondaryLabel="Let a named owner manage a value set"
            onClick={() => pick('delegate')}
          />
        </PopoverMenu>
      )}

      {active && (
        <SideSheet
          open
          onClose={() => setNotice(null)}
          title={active.title}
          footer={
            <>
              <Button
                emphasis="Tertiary"
                size="Medium"
                onClick={() => setNotice(null)}
              >
                Close
              </Button>
              <Button emphasis="Primary" size="Medium" disabled>
                {active.primary}
              </Button>
            </>
          }
        >
          <p className={styles['bulk__notice']}>{active.body}</p>
        </SideSheet>
      )}
    </div>
  );
}
