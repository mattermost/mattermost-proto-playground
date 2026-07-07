import { Icon, IconButton, MenuItem, PopoverMenu, Switch, UserAvatar } from '@mattermost/compass-ui';
import { useRef, useState, type ChangeEvent, Fragment } from 'react';
import DotsHorizontalIcon from '@mattermost/compass-icons/components/dots-horizontal';
import PencilOutlineIcon from '@mattermost/compass-icons/components/pencil-outline';
import TrashCanOutlineIcon from '@mattermost/compass-icons/components/trash-can-outline';
import { useOutsideClose } from '@/hooks/useOutsideClose';
import {
  AUTOMATION_TYPE_META,
  agentById,
  agentAvatarProps,
  type Automation,
} from '../channelAutomationsData';
import { automationGlyph } from './automationIcons';
import styles from './AutomationListItem.module.scss';

export interface AutomationListItemProps {
  automation: Automation;
  onToggle: (id: string, enabled: boolean) => void;
  onEdit: (id: string) => void;
  onRequestDelete?: (id: string) => void;
  showAgent?: boolean;
}

function MetaSeparator() {
  return <span className={styles['item__meta-sep']} aria-hidden>·</span>;
}

export default function AutomationListItem({
  automation,
  onToggle,
  onEdit,
  onRequestDelete,
  showAgent = false,
}: AutomationListItemProps) {
  const meta = AUTOMATION_TYPE_META[automation.type];
  const agent = showAgent ? agentById(automation.agentId) : undefined;
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useOutsideClose(menuRef, menuOpen, () => setMenuOpen(false));

  const close = () => setMenuOpen(false);

  const metaSegments = [
    ...automation.trigger.split(' · '),
    `By ${automation.createdBy}`,
  ];

  return (
    <div
      className={[
        styles.item,
        automation.enabled ? '' : styles['item--disabled'],
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={() => onEdit(automation.id)}
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
        <p className={styles['item__name']}>{automation.name}</p>
        <p className={styles['item__meta']}>
          {metaSegments.map((segment, index) => (
            <Fragment key={index}>
              {index > 0 ? <MetaSeparator /> : null}
              <span>{segment}</span>
            </Fragment>
          ))}
          {showAgent && agent ? (
            <>
              <MetaSeparator />
              <span className={styles['item__meta-agent']}>
                <UserAvatar size="12" {...agentAvatarProps(agent)} />
                {agent.displayName}
              </span>
            </>
          ) : null}
        </p>
      </div>

      <div
        className={styles['item__actions']}
        onClick={(e) => e.stopPropagation()}
      >
        <Switch
          size="Small"
          checked={automation.enabled}
          onChange={(e: ChangeEvent<HTMLInputElement>) => onToggle(automation.id, e.target.checked)}
          aria-label={`${automation.enabled ? 'Disable' : 'Enable'} ${automation.name}`}
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
                  onEdit(automation.id);
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
                    onRequestDelete(automation.id);
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
