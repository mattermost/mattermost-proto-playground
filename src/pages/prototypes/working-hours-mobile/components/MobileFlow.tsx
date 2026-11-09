import {
  useEffect,
  useId,
  useRef,
  useState,
  type ComponentProps,
} from 'react';
import AccountOutlineIcon from '@mattermost/compass-icons/components/account-outline';
import BellOutlineIcon from '@mattermost/compass-icons/components/bell-outline';
import ChevronRightIcon from '@mattermost/compass-icons/components/chevron-right';
import CogOutlineIcon from '@mattermost/compass-icons/components/cog-outline';
import ClockOutlineIcon from '@mattermost/compass-icons/components/clock-outline';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { Scrollbar } from '@mattermost/compass-ui/components/scrollbar';
import { StatusBadge } from '@mattermost/compass-ui/components/status-badge';
import { Switch } from '@mattermost/compass-ui/components/switch';
import { MessageSeparator } from '@mattermost/compass-ui/components/message-separator';
import {
  MobileMenuItem,
  MobileMessage,
  MobileMessageInput,
  MobileModal,
  MobileNavigationBar,
  MobileProfile,
  MobileTabBar,
  mobileMessageStyles,
} from '@mattermost/compass-proto';
import { DEVICE_SAFE_TOP } from '@/components/layout/DeviceFrame';
import avatarAiko from '@/assets/avatars/Aiko Tan.png';
import avatarLeonard from '@/assets/avatars/Leonard Riley.png';
import { CustomStatusFields } from '@/pages/prototypes/working-hours/components/CustomStatusFields';
import { LateHoursNotice } from './LateHoursNotice';
import { MobileScheduleForm } from './MobileScheduleForm';
import {
  activeWindows,
  formatTime,
  isWithinRange,
  MANUAL_STATUS_LABEL,
  statusInvalid,
  TEAMMATE,
  type EffectiveStatus,
  scheduleSummary,
  type ManualStatus,
  type ScheduleState,
} from '@/pages/prototypes/working-hours/workingHoursData';
import styles from '../WorkingHoursMobile.module.scss';

export type MobilePage =
  'profile' | 'settings' | 'notifications' | 'schedule' | 'dm';

/** Settings drill-in order. A direct message sits beside the profile, not in this stack. */
const SCREEN_STACK: MobilePage[] = [
  'profile',
  'settings',
  'notifications',
  'schedule',
];

/** Matches `--duration-moderate`. */
const SCREEN_TRANSITION_MS = 300;

function screenDirection(
  from: MobilePage,
  to: MobilePage,
): 'forward' | 'back' {
  if (from === 'dm' || to === 'dm') return to === 'dm' ? 'forward' : 'back';
  return SCREEN_STACK.indexOf(to) > SCREEN_STACK.indexOf(from)
    ? 'forward'
    : 'back';
}

const bodyTextClass = mobileMessageStyles['mobile-message__body-text'];

type Props = {
  page: MobilePage;
  onPageChange: (p: MobilePage) => void;
  schedule: ScheduleState;
  onScheduleChange: (next: ScheduleState) => void;
  clock24: boolean;
  status: EffectiveStatus;
  dndUntil: string | null;
  /** Custom status auto-set outside working hours. */
  customStatus: { emoji: string; text: string } | null;
  /** The DM partner's simulated local time, in minutes from midnight. */
  teammateLocalTime: number;
  onPickStatus: (s: ManualStatus) => void;
};

const chevron = <Icon glyph={<ChevronRightIcon />} size="20" />;

/** A settings toggle on the mobile menu-item row, with the switch in the trailing slot. */
function ToggleRow({
  label,
  secondaryLabel,
  checked,
  onChange,
  ...rest
}: {
  label: string;
  secondaryLabel?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
} & Pick<
  ComponentProps<typeof MobileMenuItem>,
  'aria-expanded' | 'aria-controls' | 'divider'
>) {
  return (
    <MobileMenuItem
      {...rest}
      className={styles['mobile-form__toggle']}
      label={label}
      secondaryLabel={secondaryLabel}
      leadingElement={false}
      trailingElement
      trailingVisual={
        <span className={styles['mobile-form__switch']} aria-hidden>
          <Switch
            size="large"
            checked={checked}
            tabIndex={-1}
            onChange={() => undefined}
          />
        </span>
      }
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
    />
  );
}

/** In-frame mobile navigation: Profile → Settings → Notifications → Working hours, plus a DM. */
export function MobileFlow({
  page,
  onPageChange,
  schedule,
  onScheduleChange,
  clock24,
  status,
  dndUntil,
  customStatus,
  teammateLocalTime,
  onPickStatus,
}: Props) {
  // Keep Select menus inside the device frame.
  const hoursId = useId();
  const [frameEl, setFrameEl] = useState<HTMLDivElement | null>(null);
  const [displayed, setDisplayed] = useState(page);
  const [outgoing, setOutgoing] = useState<MobilePage | null>(null);
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');
  const [entered, setEntered] = useState(true);
  const displayedRef = useRef(displayed);
  displayedRef.current = displayed;

  // Keep the previous screen mounted so a push can slide it aside.
  useEffect(() => {
    if (page === displayedRef.current) return;
    setDirection(screenDirection(displayedRef.current, page));
    setOutgoing(displayedRef.current);
    setDisplayed(page);
    setEntered(false);
  }, [page]);

  useEffect(() => {
    if (entered || !outgoing) return;
    let innerId = 0;
    const outerId = requestAnimationFrame(() => {
      innerId = requestAnimationFrame(() => setEntered(true));
    });
    return () => {
      cancelAnimationFrame(outerId);
      cancelAnimationFrame(innerId);
    };
  }, [displayed, outgoing, entered]);

  useEffect(() => {
    if (!outgoing) return;
    const timeoutId = window.setTimeout(
      () => setOutgoing(null),
      SCREEN_TRANSITION_MS,
    );
    return () => window.clearTimeout(timeoutId);
  }, [outgoing, displayed]);
  const dnd = status === 'do-not-disturb';

  // Mobile has no Save step, so a custom schedule with every day off stays here as
  // editable state and is only applied once at least one day is selected.
  const [draft, setDraft] = useState(schedule);
  useEffect(() => setDraft(schedule), [schedule, page]);
  const changeSchedule = (next: ScheduleState) => {
    // An unset schedule stays unset until Enable is turned on. Edits before
    // that stay in the draft. Off keeps a saved setup and pauses every effect.
    if (!next.enabled && !schedule.configured) {
      setDraft({ ...next, configured: false, enabled: false });
      return;
    }
    const saved = { ...next, configured: true };
    setDraft(saved);
    const valid =
      Object.keys(activeWindows(saved)).length > 0 && !statusInvalid(saved);
    if (!saved.enabled || valid) onScheduleChange(saved);
  };

  const renderPage = (current: MobilePage) => {
    if (current === 'profile') {
    return (
      <>
        <MobileProfile
          avatarSrc={avatarLeonard}
          avatarAlt="Leonard Riley"
          displayName="Leonard Riley"
          username="@leonard.riley"
          status={status === 'online'}
        >
          <Scrollbar>
            <div className={styles['mobile-menu']}>
              {(['online', 'away'] as const).map((s) => (
                <MobileMenuItem
                  key={s}
                  label={MANUAL_STATUS_LABEL[s]}
                  leadingVisual={<StatusBadge size="medium" status={s} />}
                  trailingElement={status === s}
                  onClick={() => onPickStatus(s)}
                />
              ))}
              <MobileMenuItem
                label="Do Not Disturb"
                secondaryLabel={dnd ? (dndUntil ?? undefined) : undefined}
                leadingVisual={
                  <StatusBadge size="medium" status="do-not-disturb" />
                }
                trailingElement={dnd}
                active={dnd}
              />
              <MobileMenuItem
                label="Offline"
                leadingVisual={<StatusBadge size="medium" status="offline" />}
                trailingElement={status === 'offline'}
                onClick={() => onPickStatus('offline')}
              />
              {customStatus && (
                <MobileMenuItem
                  label={customStatus.text}
                  leadingVisual={
                    <span
                      className={styles['mobile-menu__status-emoji']}
                      aria-hidden
                    >
                      {customStatus.emoji}
                    </span>
                  }
                />
              )}
              <div
                className={styles['mobile-menu__divider']}
                role="separator"
              />
              <MobileMenuItem
                label="Your Profile"
                leadingVisual={
                  <Icon size="20" glyph={<AccountOutlineIcon />} />
                }
              />
              <MobileMenuItem
                label="Settings"
                leadingVisual={<Icon size="20" glyph={<CogOutlineIcon />} />}
                onClick={() => onPageChange('settings')}
              />
            </div>
          </Scrollbar>
        </MobileProfile>
        <MobileTabBar
          activeTab="profile"
          profileSrc={avatarLeonard}
          profileAlt="Leonard Riley"
        />
      </>
    );
    } else if (current === 'settings') {
    return (
      <MobileModal
        title="Settings"
        variant="child"
        onBackClick={() => onPageChange('profile')}
      >
        <MobileMenuItem
          label="Notifications"
          leadingVisual={<Icon size="20" glyph={<BellOutlineIcon />} />}
          trailingElement
          trailingVisual={chevron}
          onClick={() => onPageChange('notifications')}
        />
        <MobileMenuItem
          label="Display"
          leadingVisual={<Icon size="20" glyph={<CogOutlineIcon />} />}
          trailingElement
          trailingVisual={chevron}
        />
      </MobileModal>
    );
    } else if (current === 'notifications') {
    return (
      <MobileModal
        title="Notifications"
        variant="child"
        onBackClick={() => onPageChange('settings')}
      >
        <MobileMenuItem
          label="Mentions"
          leadingVisual={<Icon size="20" glyph={<BellOutlineIcon />} />}
          trailingElement
          trailingVisual={chevron}
        />
        <MobileMenuItem
          label="Working hours"
          secondaryLabel={scheduleSummary(schedule, clock24)}
          leadingVisual={<Icon size="20" glyph={<ClockOutlineIcon />} />}
          trailingElement
          trailingVisual={chevron}
          onClick={() => onPageChange('schedule')}
        />
      </MobileModal>
    );
    } else if (current === 'dm') {
    const late = !isWithinRange(teammateLocalTime, TEAMMATE.hours);
    return (
      <div className={styles['mobile-dm']}>
        <MobileNavigationBar
          variant="dm"
          name={TEAMMATE.name}
          onBackClick={() => onPageChange('profile')}
        />
        <div className={styles['mobile-dm__body']}>
          <Scrollbar>
            <div className={styles['mobile-dm__messages']}>
              <MessageSeparator type="date" label="Today" />
              <MobileMessage
                avatarSrc={avatarAiko}
                avatarAlt={TEAMMATE.name}
                username={TEAMMATE.name}
                timestamp="9:12 AM"
              >
                <p className={bodyTextClass}>
                  Pushed the new settings layouts to Figma. Feedback welcome.
                </p>
              </MobileMessage>
              <MobileMessage
                avatarSrc={avatarLeonard}
                avatarAlt="Leonard Riley"
                username="Leonard Riley"
                timestamp="9:40 AM"
              >
                <p className={bodyTextClass}>
                  Thanks Aiko, I will take a look after the stand-up.
                </p>
              </MobileMessage>
            </div>
          </Scrollbar>
        </div>
        <div className={styles['mobile-dm__composer']}>
          {late && (
            <LateHoursNotice
              name={TEAMMATE.name}
              time={formatTime(teammateLocalTime, clock24)}
            />
          )}
          <MobileMessageInput placeholder={`Message ${TEAMMATE.name}`} />
        </div>
      </div>
    );
  } else {
    return (
      <MobileModal
        title="Working hours"
        variant="child"
        onBackClick={() => onPageChange('notifications')}
      >
        <ToggleRow
          label="Enable working hours"
          secondaryLabel="Applies this schedule. Off keeps the setup and pauses every effect."
          checked={draft.enabled}
          divider
          aria-expanded={draft.enabled}
          aria-controls={hoursId}
          onChange={(enabled) => changeSchedule({ ...draft, enabled })}
        />
        <div
          id={hoursId}
          className={[
            styles['mobile-form__details'],
            draft.enabled && styles['mobile-form__details--expanded'],
          ]
            .filter(Boolean)
            .join(' ')}
          inert={!draft.enabled}
          aria-hidden={!draft.enabled}
        >
          <div className={styles['mobile-form__details-inner']}>
            <MobileScheduleForm
              schedule={draft}
              clock24={clock24}
              onChange={changeSchedule}
              portalContainer={frameEl}
            />
            {Object.keys(activeWindows(draft)).length === 0 && (
              <p className={styles['mobile-form__error']} role="alert">
                Select at least one day.
              </p>
            )}
            <div className={styles['mobile-form__options']}>
              <ToggleRow
                label="Do Not Disturb outside working hours"
                checked={draft.dndOutside}
                divider
                onChange={(dndOutside) =>
                  changeSchedule({ ...draft, dndOutside })
                }
              />
              <ToggleRow
                label="Set a custom status outside working hours"
                checked={draft.statusOutside}
                onChange={(statusOutside) =>
                  changeSchedule({ ...draft, statusOutside })
                }
              />
              <div className={styles['mobile-form__status']}>
                <CustomStatusFields
                  size="large"
                  open={draft.statusOutside}
                  emoji={draft.statusEmoji}
                  text={draft.statusText}
                  onChange={({ emoji, text }) =>
                    changeSchedule({
                      ...draft,
                      statusEmoji: emoji,
                      statusText: text,
                    })
                  }
                />
              </div>
            </div>
          </div>
        </div>
        <div className={styles['mobile-form__safe']} />
      </MobileModal>
    );
  }
  };

  const layerClass = (role: 'incoming' | 'outgoing') => {
    const classes = [styles['mobile-flow__layer']];
    if (!outgoing) return classes.join(' ');

    const above =
      (role === 'incoming' && direction === 'forward') ||
      (role === 'outgoing' && direction === 'back');
    if (above) classes.push(styles['mobile-flow__layer--above']);

    if (role === 'outgoing') {
      if (entered) {
        classes.push(
          direction === 'forward'
            ? styles['mobile-flow__layer--to-left']
            : styles['mobile-flow__layer--to-right'],
        );
      }
      return classes.join(' ');
    }

    if (!entered) {
      classes.push(
        direction === 'forward'
          ? styles['mobile-flow__layer--from-right']
          : styles['mobile-flow__layer--from-left'],
      );
    } else {
      classes.push(styles['mobile-flow__layer--entered']);
    }
    return classes.join(' ');
  };

  const screen = (id: MobilePage) =>
    id === 'profile' || id === 'dm' ? (
      renderPage(id)
    ) : (
      // MobileModal doesn't own the status-bar spacer; inset it below the Dynamic Island.
      <div
        className={styles['mobile-flow__inset']}
        style={{ paddingTop: DEVICE_SAFE_TOP }}
      >
        {renderPage(id)}
      </div>
    );

  return (
    <div className={styles['mobile-flow']} ref={setFrameEl}>
      <div className={styles['mobile-flow__stack']}>
        {outgoing && (
          <div className={layerClass('outgoing')} aria-hidden>
            {screen(outgoing)}
          </div>
        )}
        <div className={layerClass('incoming')}>{screen(displayed)}</div>
      </div>
    </div>
  );
}
