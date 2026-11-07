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
import {
  MobileMenuItem,
  MobileModal,
  MobileProfile,
  MobileTabBar,
} from '@mattermost/compass-proto';
import { DEVICE_SAFE_TOP } from '@/components/layout/DeviceFrame';
import avatarLeonard from '@/assets/avatars/Leonard Riley.png';
import { MobileScheduleForm } from './MobileScheduleForm';
import {
  MANUAL_STATUS_LABEL,
  type EffectiveStatus,
  scheduleSummary,
  type ManualStatus,
  type ScheduleState,
} from '@/pages/prototypes/notification-schedule/notificationScheduleData';
import styles from '../NotificationScheduleMobile.module.scss';

export type MobilePage = 'profile' | 'settings' | 'notifications' | 'schedule';

type Props = {
  page: MobilePage;
  onPageChange: (p: MobilePage) => void;
  schedule: ScheduleState;
  onScheduleChange: (next: ScheduleState) => void;
  clock24: boolean;
  status: EffectiveStatus;
  dndUntil: string | null;
  onPickStatus: (s: ManualStatus) => void;
};

const chevron = <Icon glyph={<ChevronRightIcon />} size="20" />;

/** In-frame mobile navigation: Profile → Settings → Notifications → Notifications schedule. */
export function MobileFlow({
  page,
  onPageChange,
  schedule,
  onScheduleChange,
  clock24,
  status,
  dndUntil,
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
          label="Notifications schedule"
          secondaryLabel={scheduleSummary(schedule, clock24)}
          leadingVisual={<Icon size="20" glyph={<ClockOutlineIcon />} />}
          trailingElement
          trailingVisual={chevron}
          onClick={() => onPageChange('schedule')}
        />
      </MobileModal>
    );
  } else {
    body = (
      <MobileModal
        title="Schedule"
        variant="child"
        onBackClick={() => onPageChange('notifications')}
      >
        <div className={styles['mobile-form__switch']}>
          <Switch
            checked={schedule.enabled}
            onChange={(e) =>
              onScheduleChange({ ...schedule, enabled: e.target.checked })
            }
            secondaryLabel="Outside these hours your status is set to Do Not Disturb."
          >
            Enable notifications schedule
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
      </MobileModal>
    );
  }

  return (
    <div className={styles['mobile-flow']} ref={setFrameEl}>
      {page === 'profile' ? (
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
