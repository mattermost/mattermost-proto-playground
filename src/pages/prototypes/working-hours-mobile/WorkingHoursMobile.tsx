import { useCallback, useEffect, useState } from 'react';
import { Button } from '@mattermost/compass-ui/components/button';
import { Switch } from '@mattermost/compass-ui/components/switch';
import DeviceFrame from '@/components/layout/DeviceFrame';
import SceneSwitcher from '@/components/navigation/SceneSwitcher/SceneSwitcher';
import { usePrototypeChrome } from '@/contexts/PrototypeChromeContext';
import {
  formatTime,
  INITIAL_SCHEDULE,
  isWithinSchedule,
  NOW_INSIDE,
  NOW_OUTSIDE,
  OUTSIDE_HOURS_STATUS,
  TEAMMATE,
  untilLabel,
  type EffectiveStatus,
  type ManualStatus,
  type ScheduleState,
} from '@/pages/prototypes/working-hours/workingHoursData';
import { MobileFlow, type MobilePage } from './components/MobileFlow';
import { SCENES, type SceneId } from './workingHoursMobile.scenes';
import styles from './WorkingHoursMobile.module.scss';

/** A schedule that is already on, used to show the "in action" scene. */
const ENABLED_SCHEDULE: ScheduleState = { ...INITIAL_SCHEDULE, enabled: true };

export default function WorkingHoursMobile() {
  const { setCenterSlot } = usePrototypeChrome();
  const [scene, setScene] = useState<SceneId>('settings');
  const [page, setPage] = useState<MobilePage>('notifications');
  const [schedule, setSchedule] = useState<ScheduleState>(INITIAL_SCHEDULE);
  const [clock24, setClock24] = useState(false);

  // Simulated clock + status.
  const [outside, setOutside] = useState(false);
  const [manualStatus, setManualStatus] = useState<ManualStatus>('online');
  const [manualOverride, setManualOverride] = useState(false);

  // DM partner's simulated local time (drives the late-hours notice).
  const [teammateOutside, setTeammateOutside] = useState(true);

  const now = outside ? NOW_OUTSIDE : NOW_INSIDE;

  // Outside working hours: optionally switch to DND (unless the user manually
  // picked a status — that sticks until the next cycle) and optionally set a
  // custom status.
  const outsideHours = schedule.enabled && !isWithinSchedule(schedule, now);
  const scheduleDnd = outsideHours && schedule.dndOutside && !manualOverride;
  const customStatus =
    outsideHours && schedule.statusOutside ? OUTSIDE_HOURS_STATUS : null;
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
        setSchedule((s) => (s.enabled ? s : ENABLED_SCHEDULE));
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
    </div>
  );
}
