import { useMemo, useState } from 'react';
import {
  buildDefaultChannelsSidebarModel,
  ChannelHeader,
  ChannelsSidebar,
  GlobalHeader,
  layoutStyles,
  Message,
  MessageInput,
  TeamSidebar,
} from '@mattermost/compass-proto';
import { MessageSeparator } from '@mattermost/compass-ui/components/message-separator';
import avatarLeonard from '@/assets/avatars/Leonard Riley.png';
import avatarAiko from '@/assets/avatars/Aiko Tan.png';
import avatarArjun from '@/assets/avatars/Arjun Patel.png';
import avatarDanielle from '@/assets/avatars/Danielle Okoro.png';
import avatarDarius from '@/assets/avatars/Darius Cole.png';
import avatarDavid from '@/assets/avatars/David Liang.png';
import avatarEmma from '@/assets/avatars/Emma Novak.png';
import avatarEthan from '@/assets/avatars/Ethan Brooks.png';
import { AccountMenu } from '../components/AccountMenu';
import { LateHoursNotice } from '../components/LateHoursNotice';
import { SettingsModal } from '../components/SettingsModal';
import {
  formatTime,
  isWithinRange,
  TEAMMATE,
  type EffectiveStatus,
  type ManualStatus,
  type ScheduleState,
} from '../workingHoursData';
import styles from '../WorkingHours.module.scss';

type Props = {
  schedule: ScheduleState;
  clock24: boolean;
  status: EffectiveStatus;
  dndUntil: string | null;
  /** Channel backdrop, or the DM with a teammate (shows the late-hours notice). */
  /** Custom status auto-set outside working hours, shown in the header like the webapp. */
  customStatus: { emoji: string; text: string } | null;
  view: 'channel' | 'dm';
  /** The DM partner's simulated local time, in minutes from midnight. */
  teammateLocalTime: number;
  menuOpen: boolean;
  submenuInitiallyOpen: boolean;
  settingsOpen: boolean;
  settingsExpanded: boolean;
  onToggleMenu: () => void;
  onCloseMenu: () => void;
  onOpenSettings: (expanded: boolean) => void;
  onCloseSettings: () => void;
  onPickStatus: (s: ManualStatus) => void;
  onClearCustomStatus: () => void;
  onSaveSchedule: (next: ScheduleState) => void;
};

/** Desktop webapp shell: Global header, sidebars and a channel as the backdrop. */
export function DesktopScene(p: Props) {
  const isDm = p.view === 'dm';
  // Scope the Settings scrim to the shell so the prototype chrome stays usable.
  const [shellEl, setShellEl] = useState<HTMLDivElement | null>(null);

  const sidebarModel = useMemo(
    () =>
      buildDefaultChannelsSidebarModel({
        showUnreadsCategory: false,
        avatarAikoTan: avatarAiko,
        avatarArjunPatel: avatarArjun,
        avatarDanielleOkoro: avatarDanielle,
        avatarDariusCole: avatarDarius,
        avatarDavidLiang: avatarDavid,
        avatarEmmaNovak: avatarEmma,
        avatarEthanBrooks: avatarEthan,
      }),
    [],
  );

  return (
    <div className={styles['shell']} ref={setShellEl}>
      <div className={styles['shell__global-header']}>
        <GlobalHeader
          product="channels"
          userAvatarSrc={avatarLeonard}
          userAvatarAlt="Leonard Riley"
          status={p.status}
          customStatus={p.customStatus ?? undefined}
          onAccountClick={p.onToggleMenu}
          accountActive={p.menuOpen}
          onSettingsClick={() => p.onOpenSettings(false)}
          settingsActive={p.settingsOpen}
        />
        <div className={styles['shell__menu-anchor']}>
          <AccountMenu
            open={p.menuOpen}
            onClose={p.onCloseMenu}
            status={p.status}
            dndUntil={p.dndUntil}
            customStatus={p.customStatus}
            onClearCustomStatus={p.onClearCustomStatus}
            scheduleOn={p.schedule.enabled}
            submenuInitiallyOpen={p.submenuInitiallyOpen}
            onPickStatus={p.onPickStatus}
            onOpenSchedule={() => p.onOpenSettings(true)}
          />
        </div>
      </div>

      <div className={styles['shell__body']}>
        <TeamSidebar
          activeTeamId="contributors"
          teams={[
            { id: 'contributors', name: 'Contributors', initials: 'Co' },
            { id: 'design', name: 'Design', initials: 'De', unread: true },
          ]}
        />
        <div className={styles['shell__outer-panel']}>
          <div className={styles['shell__channels-sidebar']}>
            <ChannelsSidebar
              teamName="Contributors"
              showFilter
              model={sidebarModel}
              activeChannelName={isDm ? TEAMMATE.name : 'UX Design'}
            />
          </div>
          <div className={styles['shell__center']}>
            {isDm ? (
              <ChannelHeader
                type="dm"
                name={TEAMMATE.name}
                avatarSrc={avatarAiko}
                avatarStatus
              />
            ) : (
              <ChannelHeader
                type="channel"
                name="UX Design"
                memberCount={12}
                pinnedCount={1}
              />
            )}
            <div className={layoutStyles['channel-shell__messages']}>
              <MessageSeparator type="date" label="Today" />
              <Message
                avatarSrc={avatarAiko}
                avatarAlt="Aiko Tan"
                username="Aiko Tan"
                timestamp="9:12 AM"
              >
                <p className={layoutStyles['channel-shell__post-text']}>
                  Pushed the new settings layouts to Figma. Feedback welcome
                  before the end of the day.
                </p>
              </Message>
              {isDm ? (
                <Message
                  avatarSrc={avatarLeonard}
                  avatarAlt="Leonard Riley"
                  username="Leonard Riley"
                  timestamp="9:40 AM"
                >
                  <p className={layoutStyles['channel-shell__post-text']}>
                    Thanks Aiko, I will take a look after the stand-up.
                  </p>
                </Message>
              ) : (
                <Message
                  avatarSrc={avatarDavid}
                  avatarAlt="David Liang"
                  username="David Liang"
                  timestamp="9:40 AM"
                >
                  <p className={layoutStyles['channel-shell__post-text']}>
                    Looks great. I will go through it after the stand-up.
                  </p>
                </Message>
              )}
            </div>
            <div className={layoutStyles['channel-shell__message-input']}>
              {isDm && !isWithinRange(p.teammateLocalTime, TEAMMATE.hours) && (
                <LateHoursNotice
                  name={TEAMMATE.name}
                  time={formatTime(p.teammateLocalTime, p.clock24)}
                />
              )}
              <MessageInput
                placeholder={`Message ${isDm ? TEAMMATE.name : 'UX Design'}`}
              />
            </div>
          </div>
        </div>
      </div>

      <SettingsModal
        open={p.settingsOpen}
        container={shellEl}
        onClose={p.onCloseSettings}
        startExpanded={p.settingsExpanded}
        schedule={p.schedule}
        clock24={p.clock24}
        onSave={p.onSaveSchedule}
      />
    </div>
  );
}
