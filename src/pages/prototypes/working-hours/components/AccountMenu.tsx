import { useEffect, useLayoutEffect, useRef } from 'react';
import { UserAccountMenu } from '@mattermost/compass-proto';
import avatarLeonard from '@/assets/avatars/Leonard Riley.png';
import {
  scheduleActive,
  type EffectiveStatus,
  type ManualStatus,
  type ScheduleState,
} from '../workingHoursData';
import styles from '../WorkingHours.module.scss';

type Props = {
  open: boolean;
  onClose: () => void;
  status: EffectiveStatus;
  /** Saved schedule. The DND submenu shows whether working hours are on. */
  schedule: ScheduleState;
  /** e.g. "until Monday 9:00 AM" when DND comes from working hours. */
  dndUntil: string | null;
  /** Custom status auto-set outside working hours. */
  customStatus: { emoji: string; text: string } | null;
  onClearCustomStatus: () => void;
  onPickStatus: (s: ManualStatus) => void;
  onOpenSchedule: () => void;
  /** Hover-open the DND submenu on first render (for the "Profile menu" scene). */
  submenuInitiallyOpen?: boolean;
  /** Walkthrough mode: stamp focus anchors and keep the menu open on outside clicks. */
  walkthroughActive?: boolean;
};

/**
 * Host for compass-proto's UserAccountMenu. The menu is chrome only, so this
 * owns the dismissal (outside click and Escape); the shell positions it.
 */
export function AccountMenu({
  open,
  onClose,
  status,
  schedule,
  dndUntil,
  customStatus,
  onClearCustomStatus,
  onPickStatus,
  onOpenSchedule,
  submenuInitiallyOpen,
  walkthroughActive = false,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  // Compass has no data attribute escape hatch on menu rows, so stamp the two
  // rows the walkthrough points at once they have rendered.
  useLayoutEffect(() => {
    if (!open || !walkthroughActive) return;
    let raf = 0;
    let tries = 0;
    const stamp = () => {
      const root = ref.current;
      if (!root) return;
      const rows = [
        ...root.querySelectorAll<HTMLElement>('[class*="menu-item"]'),
      ].filter((el) =>
        /(^|\s)_?menu-item_[A-Za-z0-9]+(_\d+)?(\s|$)/.test(el.className),
      );
      const find = (label: string) =>
        rows.find((el) => el.textContent?.trim().startsWith(label));
      const dnd = find('Do Not Disturb');
      const hours = find('Working hours');
      dnd?.setAttribute('data-wt-focus', 'wh-dnd-row');
      hours?.setAttribute('data-wt-focus', 'wh-menu-item');
      if ((!dnd || !hours) && tries++ < 30) raf = requestAnimationFrame(stamp);
    };
    stamp();
    return () => cancelAnimationFrame(raf);
  }, [open, walkthroughActive, submenuInitiallyOpen]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (ref.current?.contains(t)) return;
      // Walkthrough chrome sits outside the prototype; its clicks must not close the menu.
      if (walkthroughActive) return;
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
  }, [open, onClose, walkthroughActive]);

  return (
    <div className={styles['account-menu']} ref={ref}>
      <UserAccountMenu
        open={open}
        userName="Leonard Riley"
        username="leonard.riley"
        avatarSrc={avatarLeonard}
        status={status}
        dndUntil={dndUntil ?? undefined}
        scheduleLabel="Working hours"
        scheduleOn={scheduleActive(schedule)}
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
