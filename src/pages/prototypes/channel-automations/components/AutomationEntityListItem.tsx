import { Icon, IconButton, MenuItem, PopoverMenu, Switch } from '@mattermost/compass-ui';
import { useRef, useState, type ChangeEvent } from 'react';
import DotsHorizontalIcon from '@mattermost/compass-icons/components/dots-horizontal';
import PencilOutlineIcon from '@mattermost/compass-icons/components/pencil-outline';
import TrashCanOutlineIcon from '@mattermost/compass-icons/components/trash-can-outline';
import { useOutsideClose } from '@/hooks/useOutsideClose';
import {
  AUTOMATION_TYPE_META,
  type AutomationEntity,
} from '../channelAutomationsData';
import { automationGlyph } from './automationIcons';
import styles from './AutomationListItem.module.scss';

export interface AutomationEntityListItemProps {
  entity: AutomationEntity;
  onToggle: (id: string, enabled: boolean) => void;
  onEdit: (id: string) => void;
  onRequestDelete?: (id: string) => void;
}

function MetaSeparator() {
  return <span className={styles['item__meta-sep']} aria-hidden>•</span>;
}

export default function AutomationEntityListItem({
  entity,
  onToggle,
  onEdit,
  onRequestDelete,
}: AutomationEntityListItemProps) {
  const meta = AUTOMATION_TYPE_META[entity.type];
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useOutsideClose(menuRef, menuOpen, () => setMenuOpen(false));

  const close = () => setMenuOpen(false);

  return (
    <div
      className={[
        styles.item,
        entity.enabled ? '' : styles['item--disabled'],
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={() => onEdit(entity.id)}
    >
      <span
        className={[
          styles['item__type-icon'],
          meta.iconKey === 'recap' ? styles['item__type-icon--large-glyph'] : '',
        ]
          .filter(Boolean)
          .join(' ')}
        aria-hidden
      >
        <Icon size="16" glyph={automationGlyph(meta.iconKey)} />
      </span>

      <div className={styles['item__body']}>
        <p className={styles['item__name']}>{entity.displayName}</p>
        <p className={styles['item__meta']}>
          <span>{entity.trigger}</span>
          <MetaSeparator />
          <span>
            {entity.activeMcps} MCPs Active
          </span>
          <MetaSeparator />
          <span>{entity.toolCount} tools</span>
        </p>
      </div>

      <div
        className={styles['item__actions']}
        onClick={(e) => e.stopPropagation()}
      >
        <Switch
          size="Small"
          checked={entity.enabled}
          onChange={(e: ChangeEvent<HTMLInputElement>) => onToggle(entity.id, e.target.checked)}
          aria-label={`${entity.enabled ? 'Disable' : 'Enable'} ${entity.displayName}`}
        />

        <div ref={menuRef} className={styles['item__menu-anchor']}>
          <IconButton
            size="Small"
            aria-label="Automation options"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            active={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
            icon={<Icon size="16" glyph={<DotsHorizontalIcon />} />}
          />
          {menuOpen && (
            <PopoverMenu className={styles['item__menu']}>
              <MenuItem
                label="Edit"
                leadingVisual={<Icon size="16" glyph={<PencilOutlineIcon />} />}
                onClick={() => {
                  close();
                  onEdit(entity.id);
                }}
              />
              {onRequestDelete ? (
                <MenuItem
                  label="Delete"
                  destructive
                  leadingVisual={
                    <Icon size="16" glyph={<TrashCanOutlineIcon />} />
                  }
                  onClick={() => {
                    close();
                    onRequestDelete(entity.id);
                  }}
                />
              ) : null}
            </PopoverMenu>
          )}
        </div>
      </div>
    </div>
  );
}
