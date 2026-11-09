import { useCallback, useEffect, useMemo, useState } from 'react';
import DeviceFrame from '@/components/layout/DeviceFrame';
import { TimeSwitch } from '@/pages/prototypes/working-hours/components/TimeSwitch';
import SceneSwitcher from '@/components/navigation/SceneSwitcher/SceneSwitcher';
import { usePrototypeChrome } from '@/contexts/PrototypeChromeContext';
import {
  formatTime,
  INITIAL_SCHEDULE,
  isWithinSchedule,
  formatMoment,
  simulatedTimes,
  outsideHoursStatus,
  scheduleActive,
  TEAMMATE,
  untilLabel,
  type EffectiveStatus,
  type ManualStatus,
  type ScheduleState,
} from '@/pages/prototypes/working-hours/workingHoursData';
import { MobileFlow, type MobilePage } from './components/MobileFlow';
import { SCENES, type SceneId } from './workingHoursMobile.scenes';
import styles from './WorkingHoursMobile.module.scss';

export default function WorkingHoursMobile() {
  const { setCenterSlot } = usePrototypeChrome();
  const [scene, setScene] = useState<SceneId>('settings');
  const [page, setPage] = useState<MobilePage>('notifications');
  const [schedule, setSchedule] = useState<ScheduleState>(INITIAL_SCHEDULE);
  const clock24 = false;

  // Simulated clock + status.
  const [outside, setOutside] = useState(false);
  const [manualStatus, setManualStatus] = useState<ManualStatus>('online');
  const [manualOverride, setManualOverride] = useState(false);

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
  const customStatus =
    outsideHours && schedule.statusOutside
      ? outsideHoursStatus(schedule)
      : null;
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
      if (id === 'settings') {
        setPage('notifications');
      } else if (id === 'dm') {
        setTeammateOutside(true);
        setPage('dm');
      } else {
        // This scene is the schedule in effect, even if it was never saved.
        setSchedule((s) => ({
          ...s,
          configured: true,
          enabled: true,
          statusOutside: true,
        }));
        setClockOutside(true);
        setPage('profile');
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
        ariaLabel="Working hours mobile entry points"
      />,
    );
    return () => setCenterSlot(null);
  }, [scene, goToScene, setCenterSlot]);

  return (
    <div className={styles['page']}>
      <div className={styles['page__mobile']}>
        <DeviceFrame insetContent={false} statusBarStyle="light">
          <MobileFlow
            page={page}
            onPageChange={setPage}
            schedule={schedule}
            onScheduleChange={setSchedule}
            clock24={clock24}
            status={status}
            dndUntil={dndUntil}
            customStatus={customStatus}
            teammateLocalTime={
              teammateOutside ? TEAMMATE.localOutside : TEAMMATE.localInside
            }
            onPickStatus={pickStatus}
          />
        </DeviceFrame>
      </div>
      <div
        className={[styles['controls'], styles['controls--floating']].join(' ')}
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
    </div>
  );
}
