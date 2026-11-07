import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from '@mattermost/compass-ui/components/button';
import { Switch } from '@mattermost/compass-ui/components/switch';
import SceneSwitcher from '@/components/navigation/SceneSwitcher/SceneSwitcher';
import { usePrototypeChrome } from '@/contexts/PrototypeChromeContext';
import {
  INITIAL_SCHEDULE,
  isWithinSchedule,
  NOW_INSIDE,
  NOW_OUTSIDE,
  untilLabel,
  type EffectiveStatus,
  type ManualStatus,
  type ScheduleState,
} from './notificationScheduleData';
import { SCENES, type SceneId } from './notificationSchedule.scenes';
import { DesktopScene } from './scenes/DesktopScene';
import styles from './NotificationSchedule.module.scss';

/** A schedule that is already on, used to show the "in action" scenes. */
const ENABLED_SCHEDULE: ScheduleState = { ...INITIAL_SCHEDULE, enabled: true };

export default function NotificationSchedule() {
  const { setCenterSlot } = usePrototypeChrome();
  const [scene, setScene] = useState<SceneId>('settings');
  const [schedule, setSchedule] = useState<ScheduleState>(INITIAL_SCHEDULE);
  const [clock24, setClock24] = useState(false);

  // Simulated clock + status.
  const [outside, setOutside] = useState(false);
  const [manualStatus, setManualStatus] = useState<ManualStatus>('online');
  const [manualOverride, setManualOverride] = useState(false);

  // Desktop UI.
  const [menuOpen, setMenuOpen] = useState(false);
  const [submenuInitiallyOpen, setSubmenuInitiallyOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(true);
  const [settingsExpanded, setSettingsExpanded] = useState(false);

  const now = outside ? NOW_OUTSIDE : NOW_INSIDE;

  // Schedule DND applies whenever it is on and we are off-hours, unless the user
  // manually picked a status — that sticks until the next cycle (clock flips).
  const scheduleDnd =
    schedule.enabled && !isWithinSchedule(schedule, now) && !manualOverride;
  const status: EffectiveStatus = scheduleDnd ? 'do-not-disturb' : manualStatus;
  const dndUntil = scheduleDnd ? untilLabel(schedule, now, clock24) : null;

  const setClockOutside = useCallback((next: boolean) => {
    setOutside(next);
    setManualOverride(false); // a new cycle starts
  }, []);

  const pickStatus = useCallback((s: ManualStatus) => {
    setManualStatus(s);
    setManualOverride(true);
  }, []);

  const goToScene = useCallback(
    (id: SceneId) => {
      setScene(id);
      setMenuOpen(false);
      setSubmenuInitiallyOpen(false);
      setSettingsOpen(false);
      setSettingsExpanded(false);
      switch (id) {
        case 'settings':
          setSettingsOpen(true);
          break;
        case 'menu':
          setMenuOpen(true);
          setSubmenuInitiallyOpen(true);
          break;
        case 'in-action':
          setSchedule((s) => (s.enabled ? s : ENABLED_SCHEDULE));
          setClockOutside(true);
          setMenuOpen(true);
          break;
      }
    },
    [setClockOutside],
  );

  useEffect(() => {
    setCenterSlot(
      <SceneSwitcher
        scenes={SCENES}
        activeId={scene}
        onChange={(id) => goToScene(id as SceneId)}
        ariaLabel="Notification schedule entry points"
      />,
    );
    return () => setCenterSlot(null);
  }, [scene, goToScene, setCenterSlot]);

  const openSettings = useCallback((expanded: boolean) => {
    setSettingsExpanded(expanded);
    setSettingsOpen(true);
  }, []);

  const controls = useMemo(
    () => (
      <div
        className={styles['controls']}
        role="group"
        aria-label="Prototype controls"
      >
        <span className={styles['controls__label']}>Simulated time</span>
        <Button
          size="small"
          emphasis={outside ? 'tertiary' : 'secondary'}
          aria-pressed={!outside}
          onClick={() => setClockOutside(false)}
        >
          Wed 11:00 AM (in hours)
        </Button>
        <Button
          size="small"
          emphasis={outside ? 'secondary' : 'tertiary'}
          aria-pressed={outside}
          onClick={() => setClockOutside(true)}
        >
          Fri 6:30 PM (off hours)
        </Button>
        <div className={styles['controls__switch-wrap']}>
          <Switch
            size="small"
            checked={clock24}
            onChange={(e) => setClock24(e.target.checked)}
          >
            24-hour clock
          </Switch>
        </div>
      </div>
    ),
    [outside, clock24, setClockOutside],
  );

  return (
    <div className={styles['page']}>
      <DesktopScene
        schedule={schedule}
        clock24={clock24}
        status={status}
        dndUntil={dndUntil}
        menuOpen={menuOpen}
        submenuInitiallyOpen={submenuInitiallyOpen}
        settingsOpen={settingsOpen}
        settingsExpanded={settingsExpanded}
        onToggleMenu={() => setMenuOpen((o) => !o)}
        onCloseMenu={() => {
          setMenuOpen(false);
          setSubmenuInitiallyOpen(false);
        }}
        onOpenSettings={openSettings}
        onCloseSettings={() => setSettingsOpen(false)}
        onPickStatus={pickStatus}
        onSaveSchedule={setSchedule}
      />
      {controls}
    </div>
  );
}
