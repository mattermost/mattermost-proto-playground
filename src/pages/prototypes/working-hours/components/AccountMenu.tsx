import { useEffect, useRef } from 'react';
import { UserAccountMenu } from '@mattermost/compass-proto';
import avatarLeonard from '@/assets/avatars/Leonard Riley.png';
import type { EffectiveStatus, ManualStatus } from '../workingHoursData';
import styles from '../WorkingHours.module.scss';

type Props = {
  open: boolean;
  onClose: () => void;
  status: EffectiveStatus;
  /** e.g. "until Monday 9:00 AM" when DND comes from working hours. */
  dndUntil: string | null;
  /** Custom status auto-set outside working hours. */
  customStatus: { emoji: string; text: string } | null;
  onClearCustomStatus: () => void;
  onPickStatus: (s: ManualStatus) => void;
  onOpenSchedule: () => void;
  /** Hover-open the DND submenu on first render (for the "Profile menu" scene). */
  submenuInitiallyOpen?: boolean;
};

/**
 * Host for compass-proto's UserAccountMenu. The menu is chrome only, so this
 * owns the dismissal (outside click and Escape); the shell positions it.
 */
export function AccountMenu({
  open,
  onClose,
  status,
  dndUntil,
  customStatus,
  onClearCustomStatus,
  onPickStatus,
  onOpenSchedule,
  submenuInitiallyOpen,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

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

  return (
    <div className={styles['account-menu']} ref={ref}>
      <UserAccountMenu
        open={open}
        userName="Leonard Riley"
        username="leonard.riley"
        avatarSrc={avatarLeonard}
        status={status}
        dndUntil={dndUntil ?? undefined}
        scheduleLabel="Working Hours"
        scheduleOn
        customStatus={customStatus ?? undefined}
        onClearCustomStatus={onClearCustomStatus}
        submenuInitiallyOpen={submenuInitiallyOpen}
        onPickStatus={onPickStatus}
        onOpenSchedule={onOpenSchedule}
        onClose={onClose}
      />
    </div>
  );
}
