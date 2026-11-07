import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from '@mattermost/compass-ui/components/button';
import { Switch } from '@mattermost/compass-ui/components/switch';
import SceneSwitcher from '@/components/navigation/SceneSwitcher/SceneSwitcher';
import { usePrototypeChrome } from '@/contexts/PrototypeChromeContext';
import {
  formatTime,
  INITIAL_SCHEDULE,
  isWithinSchedule,
  TEAMMATE,
  NOW_INSIDE,
  NOW_OUTSIDE,
  untilLabel,
  type EffectiveStatus,
  type ManualStatus,
  type ScheduleState,
} from './workingHoursData';
import { SCENES, type SceneId } from './workingHours.scenes';
import { DesktopScene } from './scenes/DesktopScene';
import styles from './WorkingHours.module.scss';

/** A schedule that is already on, used to show the "in action" scenes. */
const ENABLED_SCHEDULE: ScheduleState = { ...INITIAL_SCHEDULE, enabled: true };

export default function WorkingHours() {
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

  // DM partner's simulated local time (drives the late-hours notice).
  const [teammateOutside, setTeammateOutside] = useState(true);

  const now = outside ? NOW_OUTSIDE : NOW_INSIDE;

  // Outside working hours: optionally switch to DND (unless the user manually
  // picked a status — that sticks until the next cycle) and optionally set a
  // custom status.
  const outsideHours = schedule.enabled && !isWithinSchedule(schedule, now);
  const scheduleDnd = outsideHours && schedule.dndOutside && !manualOverride;
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
        case 'dm':
          setTeammateOutside(true);
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
        ariaLabel="Working hours entry points"
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
        {scene === 'dm' && (
          <>
            <span className={styles['controls__label']}>
              {TEAMMATE.name}&apos;s local time
            </span>
            <Button
              size="small"
              emphasis={teammateOutside ? 'tertiary' : 'secondary'}
              aria-pressed={!teammateOutside}
              onClick={() => setTeammateOutside(false)}
            >
              {formatTime(TEAMMATE.localInside, clock24)} (working hours)
            </Button>
            <Button
              size="small"
              emphasis={teammateOutside ? 'secondary' : 'tertiary'}
              aria-pressed={teammateOutside}
              onClick={() => setTeammateOutside(true)}
            >
              {formatTime(TEAMMATE.localOutside, clock24)} (late)
            </Button>
          </>
        )}
      </div>
    ),
    [outside, clock24, scene, teammateOutside, setClockOutside],
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
        view={scene === 'dm' ? 'dm' : 'channel'}
        teammateLocalTime={
          teammateOutside ? TEAMMATE.localOutside : TEAMMATE.localInside
        }
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
