import { useCallback, useLayoutEffect, useState } from 'react';
import ChannelHeader from '@/components/ui/ChannelHeader/ChannelHeader';
import ChannelShell from '@/components/ui/ChannelShell/ChannelShell';
import MessageInput from '@/components/ui/MessageInput';
import MessageSeparator from '@/components/ui/MessageSeparator/MessageSeparator';
import Message from '@/components/ui/Message/Message';
import Scrollbars from '@/components/ui/Scrollbars/Scrollbars';
import SceneSwitcher from '@/components/navigation/SceneSwitcher/SceneSwitcher';
import { usePrototypeChrome } from '@/contexts/PrototypeChromeContext';
import avatarAikoTan from '@/assets/avatars/Aiko Tan.png';
import avatarLeonard from '@/assets/avatars/Leonard Riley.png';
import avatarSofia from '@/assets/avatars/Sofia Bauer.png';
import shellStyles from '@/components/ui/ChannelShell/ChannelShell.module.scss';
import TeamSettingsModal from './TeamSettingsModal';
import ChannelSettingsModal from './ChannelSettingsModal';
import ChannelThreadView from './ChannelThreadView';
import styles from './AttributeHubTeamSettings.module.scss';

export type ResourceSettingsView = 'team' | 'channel' | 'channel-thread';

const VIEW_SCENES = [
  { id: 'team', label: 'Team settings' },
  { id: 'channel', label: 'Channel settings' },
  { id: 'channel-thread', label: 'Channel · thread' },
] as const;

function readView(): ResourceSettingsView {
  if (typeof window === 'undefined') return 'team';
  const view = new URLSearchParams(window.location.search).get('view');
  if (view === 'channel') return 'channel';
  if (view === 'channel-thread') return 'channel-thread';
  return 'team';
}

function syncViewParam(view: ResourceSettingsView) {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  url.searchParams.set('view', view);
  window.history.replaceState(null, '', url);
}

function syncChannelNewAttributeParams() {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  url.searchParams.set('tab', 'attributes');
  url.searchParams.set('flow', 'new');
  url.searchParams.set('applies', 'Posts');
  window.history.replaceState(null, '', url);
}

function clearChannelNewAttributeParams() {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  url.searchParams.delete('flow');
  url.searchParams.delete('applies');
  window.history.replaceState(null, '', url);
}

/**
 * Resource-level attribute management inside Team and Channel settings modals.
 * Post attributes are configured in Channel settings — no separate post surface.
 */
export default function AttributeHubTeamSettings() {
  const { setCenterSlot } = usePrototypeChrome();
  const [modalOpen, setModalOpen] = useState(
    () => readView() !== 'channel-thread',
  );
  const [view, setView] = useState<ResourceSettingsView>(readView);
  const [channelSettingsFromThreadOpen, setChannelSettingsFromThreadOpen] =
    useState(false);
  const [channelSettingsSession, setChannelSettingsSession] = useState(0);

  const handleViewChange = useCallback((id: string) => {
    const next: ResourceSettingsView =
      id === 'channel'
        ? 'channel'
        : id === 'channel-thread'
          ? 'channel-thread'
          : 'team';
    setView(next);
    syncViewParam(next);
    if (next === 'channel-thread') {
      setModalOpen(false);
    } else {
      setModalOpen(true);
    }
  }, []);

  useLayoutEffect(() => {
    setCenterSlot(
      <SceneSwitcher
        scenes={[...VIEW_SCENES]}
        activeId={view}
        onChange={handleViewChange}
        ariaLabel="Resource settings views"
      />,
    );
    return () => setCenterSlot(null);
  }, [view, handleViewChange, setCenterSlot]);

  const openChannelNewAttribute = useCallback(() => {
    syncChannelNewAttributeParams();
    setChannelSettingsSession((current) => current + 1);
    setChannelSettingsFromThreadOpen(true);
  }, []);

  const closeChannelSettingsFromThread = useCallback(() => {
    clearChannelNewAttributeParams();
    setChannelSettingsFromThreadOpen(false);
  }, []);

  const reopenLabel =
    view === 'team' ? 'Reopen Team settings' : 'Reopen Channel settings';

  if (view === 'channel-thread') {
    return (
      <div className={styles['scene']}>
        <ChannelThreadView onCreateAttribute={openChannelNewAttribute} />

        {channelSettingsFromThreadOpen && (
          <div className={styles['scene__overlay']} role="presentation">
            <button
              type="button"
              className={styles['scene__backdrop']}
              aria-label="Close Channel settings"
              onClick={closeChannelSettingsFromThread}
            />
            <div className={styles['scene__dialog']}>
              <ChannelSettingsModal
                key={channelSettingsSession}
                channelName="alpha-coordination"
                onClose={closeChannelSettingsFromThread}
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={styles['scene']}>
      <ChannelShell
        layout="fullscreen"
        userAvatarSrc={avatarLeonard}
        userAvatarAlt="Leonard Riley"
        channelHeader={
          <ChannelHeader
            type="Channel"
            name="alpha-coordination"
            description="Program ALPHA · Team coordination"
            memberCount={28}
            pinnedCount={2}
            favorited
          />
        }
      >
        <>
          <div className={shellStyles['channel-shell__messages']}>
            <Scrollbars>
              <div className={shellStyles['channel-shell__messages-list']}>
                <MessageSeparator type="Date" label="Today" />
                <Message
                  avatarSrc={avatarSofia}
                  avatarAlt="Sofia Bauer"
                  username="Sofia Bauer"
                  timestamp="09:12"
                >
                  <p className={shellStyles['channel-shell__post-text']}>
                    Use the tabs in the header to switch between Team settings
                    and Channel settings.
                  </p>
                </Message>
                <Message
                  avatarSrc={avatarAikoTan}
                  avatarAlt="Aiko Tan"
                  username="Aiko Tan"
                  timestamp="09:18"
                >
                  <p className={shellStyles['channel-shell__post-text']}>
                    Post attributes are configured in Channel settings under the
                    same catalog — there is no separate post settings modal.
                  </p>
                </Message>
              </div>
            </Scrollbars>
          </div>
          <div className={shellStyles['channel-shell__message-input']}>
            <MessageInput placeholder="Write to alpha-coordination" />
          </div>
        </>
      </ChannelShell>

      {modalOpen && (
        <div className={styles['scene__overlay']} role="presentation">
          <button
            type="button"
            className={styles['scene__backdrop']}
            aria-label={`Close ${view === 'team' ? 'Team' : 'Channel'} settings`}
            onClick={() => setModalOpen(false)}
          />
          <div className={styles['scene__dialog']}>
            {view === 'team' ? (
              <TeamSettingsModal
                teamName="Program ALPHA"
                onClose={() => setModalOpen(false)}
              />
            ) : (
              <ChannelSettingsModal
                channelName="alpha-coordination"
                onClose={() => setModalOpen(false)}
              />
            )}
          </div>
        </div>
      )}

      {!modalOpen && (
        <button
          type="button"
          className={styles['scene__reopen']}
          onClick={() => setModalOpen(true)}
        >
          {reopenLabel}
        </button>
      )}
    </div>
  );
}
