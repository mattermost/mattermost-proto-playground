import { useState } from 'react';
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
import { LateHoursNotice } from './LateHoursNotice';
import { MobileScheduleForm } from './MobileScheduleForm';
import {
  activeWindows,
  formatTime,
  isWithinRange,
  MANUAL_STATUS_LABEL,
  OUTSIDE_HOURS_STATUS,
  TEAMMATE,
  type EffectiveStatus,
  scheduleSummary,
  type ManualStatus,
  type ScheduleState,
} from '@/pages/prototypes/working-hours/workingHoursData';
import styles from '../WorkingHoursMobile.module.scss';

export type MobilePage =
  'profile' | 'settings' | 'notifications' | 'schedule' | 'dm';

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
  const [frameEl, setFrameEl] = useState<HTMLDivElement | null>(null);
  const dnd = status === 'do-not-disturb';

  let body;
  if (page === 'profile') {
    body = (
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
                  customStatusEmoji={customStatus.emoji}
                  leadingVisual={
                    <Icon size="20" glyph={<ClockOutlineIcon />} />
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
  } else if (page === 'settings') {
    body = (
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
  } else if (page === 'notifications') {
    body = (
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
  } else if (page === 'dm') {
    const late = !isWithinRange(teammateLocalTime, TEAMMATE.hours);
    body = (
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
    body = (
      <MobileModal
        title="Working hours"
        variant="child"
        onBackClick={() => onPageChange('notifications')}
      >
        <div className={styles['mobile-form__switch']}>
          <Switch
            checked={schedule.enabled}
            onChange={(e) =>
              onScheduleChange({ ...schedule, enabled: e.target.checked })
            }
            secondaryLabel="Teammates see when it is outside your working hours."
          >
            Enable working hours
          </Switch>
        </div>
        {schedule.enabled && (
          <MobileScheduleForm
            schedule={schedule}
            clock24={clock24}
            onChange={onScheduleChange}
            portalContainer={frameEl}
          />
        )}
        {schedule.enabled &&
          Object.keys(activeWindows(schedule)).length === 0 && (
            <p className={styles['mobile-form__error']} role="alert">
              Select at least one day.
            </p>
          )}
        {schedule.enabled && (
          <div className={styles['mobile-form__options']}>
            <Switch
              checked={schedule.dndOutside}
              onChange={(e) =>
                onScheduleChange({ ...schedule, dndOutside: e.target.checked })
              }
              secondaryLabel="Silence notifications and set your status to Do Not Disturb."
            >
              Do Not Disturb outside working hours
            </Switch>
            <Switch
              checked={schedule.statusOutside}
              onChange={(e) =>
                onScheduleChange({
                  ...schedule,
                  statusOutside: e.target.checked,
                })
              }
              secondaryLabel={`Sets ${OUTSIDE_HOURS_STATUS.emoji} “${OUTSIDE_HOURS_STATUS.text}” as your custom status.`}
            >
              Set a custom status outside working hours
            </Switch>
          </div>
        )}
      </MobileModal>
    );
  }

  return (
    <div className={styles['mobile-flow']} ref={setFrameEl}>
      {page === 'profile' || page === 'dm' ? (
        body
      ) : (
        // MobileModal doesn't own the status-bar spacer; inset it below the Dynamic Island.
        <div
          className={styles['mobile-flow__inset']}
          style={{ paddingTop: DEVICE_SAFE_TOP }}
        >
          {body}
        </div>
      )}
    </div>
  );
}
