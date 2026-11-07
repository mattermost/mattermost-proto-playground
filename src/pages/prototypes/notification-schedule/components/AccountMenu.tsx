import { useEffect, useRef, useState } from 'react';
import ChevronRightIcon from '@mattermost/compass-icons/components/chevron-right';
import CogOutlineIcon from '@mattermost/compass-icons/components/cog-outline';
import AccountOutlineIcon from '@mattermost/compass-icons/components/account-outline';
import EmoticonIcon from '@mattermost/compass-icons/components/emoticon-happy-outline';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { MenuItem } from '@mattermost/compass-ui/components/menu-item';
import {
  PopoverMenu,
  PopoverMenuGroup,
  PopoverMenuTitle,
} from '@mattermost/compass-ui/components/popover-menu';
import { StatusBadge } from '@mattermost/compass-ui/components/status-badge';
import type {
  EffectiveStatus,
  ManualStatus,
} from '../notificationScheduleData';
import styles from '../NotificationSchedule.module.scss';

type Props = {
  open: boolean;
  onClose: () => void;
  status: EffectiveStatus;
  /** e.g. "until Monday 9:00 AM" when DND comes from the schedule. */
  dndUntil: string | null;
  scheduleOn: boolean;
  onPickStatus: (s: ManualStatus) => void;
  onOpenSchedule: () => void;
  onOpenSettings: () => void;
  /** Hover-open the DND submenu on first render (for the "Profile menu" scene). */
  submenuInitiallyOpen?: boolean;
};

const STATUS_ROWS: {
  id: ManualStatus;
  label: string;
  badge: 'online' | 'away' | 'offline';
}[] = [
  { id: 'online', label: 'Online', badge: 'online' },
  { id: 'away', label: 'Away', badge: 'away' },
];

/** Account menu with the Do Not Disturb submenu. Host-owned positioning and dismissal. */
export function AccountMenu({
  open,
  onClose,
  status,
  dndUntil,
  scheduleOn,
  onPickStatus,
  onOpenSchedule,
  onOpenSettings,
  submenuInitiallyOpen = false,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [submenu, setSubmenu] = useState(submenuInitiallyOpen);

  useEffect(() => {
    if (open) setSubmenu(submenuInitiallyOpen);
  }, [open, submenuInitiallyOpen]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (ref.current?.contains(t)) return;
      // The header's account button toggles the menu itself.
      if (t.closest('[aria-label="Account menu"]')) return;
      onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  const dnd = status === 'do-not-disturb';

  return (
    <div className={styles['account-menu']} ref={ref}>
      <PopoverMenu open={open} aria-label="Account menu">
        <PopoverMenuTitle>
          <span className={styles['account-menu__name']}>
            <StatusBadge size="x-small" status={status} /> Leonard Riley
          </span>
        </PopoverMenuTitle>
        <PopoverMenuGroup>
          {STATUS_ROWS.map((r) => (
            <MenuItem
              key={r.id}
              label={r.label}
              leadingVisual={<StatusBadge size="small" status={r.badge} />}
              trailingElement={status === r.id}
              onClick={() => {
                onPickStatus(r.id);
                onClose();
              }}
            />
          ))}
          <div
            className={styles['account-menu__dnd']}
            onMouseEnter={() => setSubmenu(true)}
            onMouseLeave={() => setSubmenu(false)}
          >
            <MenuItem
              label="Do Not Disturb"
              secondaryLabel={dnd ? (dndUntil ?? undefined) : undefined}
              leadingVisual={
                <StatusBadge size="small" status="do-not-disturb" />
              }
              trailingVisual={<Icon glyph={<ChevronRightIcon />} />}
              trailingElement
              active={submenu || dnd}
              aria-haspopup="menu"
              aria-expanded={submenu}
              onClick={() => setSubmenu((s) => !s)}
            />
            {submenu && (
              <div className={styles['account-menu__submenu']}>
                <PopoverMenu variant="child" open aria-label="Do Not Disturb">
                  <PopoverMenuTitle>
                    Disable notifications for…
                  </PopoverMenuTitle>
                  <PopoverMenuGroup>
                    {[
                      "Don't clear",
                      '30 mins',
                      '1 hour',
                      '2 hours',
                      'Tomorrow',
                      'Custom',
                    ].map((l) => (
                      <MenuItem
                        key={l}
                        label={l}
                        leadingElement={false}
                        onClick={onClose}
                      />
                    ))}
                  </PopoverMenuGroup>
                  <PopoverMenuGroup>
                    <MenuItem
                      label="Notification Schedule"
                      secondaryLabel={scheduleOn ? 'On' : 'Off'}
                      secondaryLabelPosition="inline"
                      leadingElement={false}
                      onClick={() => {
                        onOpenSchedule();
                        onClose();
                      }}
                    />
                  </PopoverMenuGroup>
                </PopoverMenu>
              </div>
            )}
          </div>
          <MenuItem
            label="Offline"
            leadingVisual={<StatusBadge size="small" status="offline" />}
            trailingElement={status === 'offline'}
            onClick={() => {
              onPickStatus('offline');
              onClose();
            }}
          />
        </PopoverMenuGroup>
        <PopoverMenuGroup>
          <MenuItem
            label="Set a custom status"
            leadingVisual={<Icon glyph={<EmoticonIcon />} />}
          />
        </PopoverMenuGroup>
        <PopoverMenuGroup>
          <MenuItem
            label="Profile"
            leadingVisual={<Icon glyph={<AccountOutlineIcon />} />}
          />
          <MenuItem
            label="Settings"
            leadingVisual={<Icon glyph={<CogOutlineIcon />} />}
            onClick={() => {
              onOpenSettings();
              onClose();
            }}
          />
        </PopoverMenuGroup>
      </PopoverMenu>
    </div>
  );
}
