import { useRef, useState } from 'react';
import DotsVerticalIcon from '@mattermost/compass-icons/components/dots-vertical';
import PencilOutlineIcon from '@mattermost/compass-icons/components/pencil-outline';
import TrashCanOutlineIcon from '@mattermost/compass-icons/components/trash-can-outline';
import Icon from '@/components/ui/Icon/Icon';
import IconButton from '@/components/ui/IconButton/IconButton';
import Switch from '@/components/ui/Switch/Switch';
import PopoverMenu from '@/components/ui/PopoverMenu/PopoverMenu';
import MenuItem from '@/components/ui/MenuItem/MenuItem';
import { useOutsideClose } from '@/hooks/useOutsideClose';
import {
  AUTOMATION_TYPE_META,
  type Automation,
} from '../channelAutomationsData';
import { automationGlyph } from './automationIcons';
import styles from './AutomationListItem.module.scss';

export interface AutomationListItemProps {
  automation: Automation;
  onToggle: (id: string, enabled: boolean) => void;
  onEdit: (id: string) => void;
  onRequestDelete: (id: string) => void;
}

export default function AutomationListItem({
  automation,
  onToggle,
  onEdit,
  onRequestDelete,
}: AutomationListItemProps) {
  const meta = AUTOMATION_TYPE_META[automation.type];
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useOutsideClose(menuRef, menuOpen, () => setMenuOpen(false));

  const close = () => setMenuOpen(false);

  return (
    <div
      className={[
        styles['item'],
        automation.enabled ? '' : styles['item--disabled'],
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <span className={styles['item__type-icon']} aria-hidden>
        <Icon size="20" glyph={automationGlyph(meta.iconKey)} />
      </span>

      <div className={styles['item__body']}>
        <p className={styles['item__name']}>{automation.name}</p>
        <p className={styles['item__trigger']}>
          {meta.label} · {automation.trigger}
        </p>
      </div>

      <div className={styles['item__actions']}>
        <Switch
          size="Small"
          checked={automation.enabled}
          onChange={(e) => onToggle(automation.id, e.target.checked)}
          aria-label={`${automation.enabled ? 'Disable' : 'Enable'} ${automation.name}`}
        />

        <div ref={menuRef} className={styles['item__menu-anchor']}>
          <IconButton
            size="Small"
            aria-label="Automation options"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            toggled={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
            icon={<Icon size="16" glyph={<DotsVerticalIcon />} />}
          />
          {menuOpen && (
            <PopoverMenu className={styles['item__menu']}>
              <MenuItem
                label="Edit"
                leadingVisual={<Icon size="16" glyph={<PencilOutlineIcon />} />}
                onClick={() => {
                  close();
                  onEdit(automation.id);
                }}
              />
              <MenuItem
                label="Delete"
                destructive
                leadingVisual={
                  <Icon size="16" glyph={<TrashCanOutlineIcon />} />
                }
                onClick={() => {
                  close();
                  onRequestDelete(automation.id);
                }}
              />
            </PopoverMenu>
          )}
        </div>
      </div>
    </div>
  );
}
