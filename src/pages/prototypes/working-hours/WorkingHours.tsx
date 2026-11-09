import { useCallback, useEffect, useMemo, useState } from 'react';
import SceneSwitcher from '@/components/navigation/SceneSwitcher/SceneSwitcher';
import { TimeSwitch } from './components/TimeSwitch';
import { usePrototypeChrome } from '@/contexts/PrototypeChromeContext';
import { useRegisterWalkthrough, useWalkthrough } from '@/walkthrough';
import type { WalkthroughSceneState } from '@/walkthrough';
import {
  formatTime,
  INITIAL_SCHEDULE,
  isWithinSchedule,
  outsideHoursStatus,
  scheduleActive,
  TEAMMATE,
  formatMoment,
  simulatedTimes,
  untilLabel,
  type EffectiveStatus,
  type ManualStatus,
  type ScheduleState,
} from './workingHoursData';
import { SCENES, type SceneId } from './workingHours.scenes';
import { workingHoursWalkthrough } from './workingHoursWalkthrough';
import { parseWorkingHoursWalkthroughApply } from './workingHoursWalkthroughApply';
import { DesktopScene } from './scenes/DesktopScene';
import styles from './WorkingHours.module.scss';

export default function WorkingHours() {
  const { setCenterSlot } = usePrototypeChrome();
  const { active: walkthroughActive } = useWalkthrough();
  const [scene, setScene] = useState<SceneId>('settings');
  const [schedule, setSchedule] = useState<ScheduleState>(INITIAL_SCHEDULE);
  const clock24 = false;

  // Simulated clock + status.
  const [outside, setOutside] = useState(false);
  const [manualStatus, setManualStatus] = useState<ManualStatus>('online');
  const [manualOverride, setManualOverride] = useState(false);
  // The user cleared the auto-set custom status; it stays cleared until the next cycle.
  const [statusCleared, setStatusCleared] = useState(false);

  // Desktop UI.
  const [menuOpen, setMenuOpen] = useState(false);
  const [submenuInitiallyOpen, setSubmenuInitiallyOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(true);
  const [settingsExpanded, setSettingsExpanded] = useState(false);
  // Bumped per walkthrough step so Settings remounts into the state the step asks for.
  const [settingsKey, setSettingsKey] = useState(0);

  // DM partner's simulated local time (drives the late-hours notice).
  const [teammateOutside, setTeammateOutside] = useState(true);

  // Simulated moments come from the saved schedule so "off hours" is really off hours.
  const sim = useMemo(() => simulatedTimes(schedule), [schedule]);
  // With no working day there is no in-hours moment, so stay on off hours.
  const effectiveOutside = outside || !sim.inside;
  const now = (!effectiveOutside && sim.inside) || sim.outside;

  // Outside working hours: optionally switch to DND (unless the user manually
  // picked a status — that sticks until the next cycle) and optionally set a
  // custom status.
  const outsideHours =
    scheduleActive(schedule) && !isWithinSchedule(schedule, now);
  const scheduleDnd = outsideHours && schedule.dndOutside && !manualOverride;
  const status: EffectiveStatus = scheduleDnd ? 'do-not-disturb' : manualStatus;
  const dndUntil = scheduleDnd ? untilLabel(schedule, now, clock24) : null;
  const customStatus =
    outsideHours && schedule.statusOutside && !statusCleared
      ? outsideHoursStatus(schedule)
      : null;

  const setClockOutside = useCallback((next: boolean) => {
    setOutside(next);
    setManualOverride(false); // a new cycle starts
    setStatusCleared(false);
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
          // This scene is the schedule in effect, even if it was never saved.
          setSchedule((s) => ({
            ...s,
            configured: true,
            enabled: true,
            statusOutside: true,
          }));
          setClockOutside(true);
          setMenuOpen(true);
          break;
      }
    },
    [setClockOutside],
  );

  const onWalkthroughScene = useCallback(
    (next: string, state?: WalkthroughSceneState) => {
      if (!SCENES.some((s) => s.id === next)) return;
      goToScene(next as SceneId);
      setSettingsKey((k) => k + 1);
      const apply = parseWorkingHoursWalkthroughApply(state);
      if (next === 'settings') {
        setSettingsOpen(true);
        setSettingsExpanded(apply.settings === 'editing');
      }
    },
    [goToScene],
  );

  useRegisterWalkthrough(workingHoursWalkthrough, {
    onScene: onWalkthroughScene,
  });

  useEffect(() => {
    if (walkthroughActive) {
      setCenterSlot(null);
      return () => setCenterSlot(null);
    }
    setCenterSlot(
      <SceneSwitcher
        scenes={SCENES}
        activeId={scene}
        onChange={(id) => goToScene(id as SceneId)}
        ariaLabel="Working hours entry points"
      />,
    );
    return () => setCenterSlot(null);
  }, [scene, goToScene, setCenterSlot, walkthroughActive]);

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
        <TimeSwitch
          label="Simulated time"
          value={effectiveOutside ? 'outside' : 'inside'}
          options={[
            {
              id: 'inside',
              label: sim.inside
                ? `${formatMoment(sim.inside, clock24)} (in hours)`
                : 'In hours (no working days)',
              disabled: !sim.inside,
            },
            {
              id: 'outside',
              label: `${formatMoment(sim.outside, clock24)} (off hours)`,
            },
          ]}
          onChange={(id) => setClockOutside(id === 'outside')}
        />
        {scene === 'dm' && (
          <TimeSwitch
            label={`${TEAMMATE.name}'s local time`}
            value={teammateOutside ? 'late' : 'working'}
            options={[
              {
                id: 'working',
                label: `${formatTime(TEAMMATE.localInside, clock24)} (working hours)`,
              },
              {
                id: 'late',
                label: `${formatTime(TEAMMATE.localOutside, clock24)} (late)`,
              },
            ]}
            onChange={(id) => setTeammateOutside(id === 'late')}
          />
        )}
      </div>
    ),
    [effectiveOutside, sim, clock24, scene, teammateOutside, setClockOutside],
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
        customStatus={customStatus}
        view={scene === 'dm' ? 'dm' : 'channel'}
        teammateLocalTime={
          teammateOutside ? TEAMMATE.localOutside : TEAMMATE.localInside
        }
        onClearCustomStatus={() => setStatusCleared(true)}
        onToggleMenu={() => setMenuOpen((o) => !o)}
        onCloseMenu={() => {
          setMenuOpen(false);
          setSubmenuInitiallyOpen(false);
        }}
        onOpenSettings={openSettings}
        onCloseSettings={() => setSettingsOpen(false)}
        onPickStatus={pickStatus}
        onSaveSchedule={setSchedule}
        walkthroughActive={walkthroughActive}
        settingsKey={settingsKey}
      />
      {controls}
    </div>
  );
}
