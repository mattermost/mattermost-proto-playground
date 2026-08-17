import { useCallback, useLayoutEffect, useState } from 'react';
import ChannelHeader from '@/components/ui/ChannelHeader/ChannelHeader';
import ChannelShell from '@/components/ui/ChannelShell/ChannelShell';
import Message from '@/components/ui/Message/Message';
import MessageInput from '@/components/ui/MessageInput/MessageInput';
import MessageSeparator from '@/components/ui/MessageSeparator/MessageSeparator';
import Scrollbars from '@/components/ui/Scrollbars/Scrollbars';
import shellStyles from '@/components/ui/ChannelShell/ChannelShell.module.scss';
import SceneSwitcher from '@/components/navigation/SceneSwitcher/SceneSwitcher';
import { usePrototypeChrome } from '@/contexts/PrototypeChromeContext';
import avatarAikoTan from '@/assets/avatars/Aiko Tan.png';
import avatarLeonard from '@/assets/avatars/Leonard Riley.png';
import avatarSofia from '@/assets/avatars/Sofia Bauer.png';
import ChannelSettingsModal from '@/pages/AttributeHubTeamSettings/ChannelSettingsModal';
import ChannelThreadView from '@/pages/AttributeHubTeamSettings/ChannelThreadView';
import {
  clearChannelAttributeDetailParams,
  clearChannelNewAttributeParams,
  syncChannelAttributeDetailParams,
  syncChannelNewAttributeParams,
} from '@/pages/AttributeHubTeamSettings/channelData';
import styles from './PostAttributesChannelSettings.module.scss';

export type PostAttributesView = 'channel' | 'channel-thread' | 'attrs-modal';

const VIEW_SCENES = [
  { id: 'channel', label: 'Channel settings' },
  { id: 'channel-thread', label: 'Channel · thread' },
  { id: 'attrs-modal', label: 'Edit · modal' },
] as const;

function readView(): PostAttributesView {
  if (typeof window === 'undefined') return 'channel';
  const view = new URLSearchParams(window.location.search).get('view');
  if (view === 'channel-thread') return 'channel-thread';
  if (view === 'attrs-modal' || view === 'attrs-above') return 'attrs-modal';
  return 'channel';
}

function syncViewParam(view: PostAttributesView) {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  url.searchParams.set('view', view);
  window.history.replaceState(null, '', url);
}

function parseViewId(id: string): PostAttributesView {
  if (id === 'channel-thread') return 'channel-thread';
  if (id === 'attrs-modal') return 'attrs-modal';
  return 'channel';
}

/**
 * Focused post-attributes prototype: Channel settings, Channel · thread with
 * hover summary → Edit modal, and a scene that starts with the editor open.
 */
export default function PostAttributesChannelSettings() {
  const { setCenterSlot } = usePrototypeChrome();
  const [view, setView] = useState<PostAttributesView>(readView);
  const [modalOpen, setModalOpen] = useState(() => readView() === 'channel');
  const [channelSettingsFromThreadOpen, setChannelSettingsFromThreadOpen] =
    useState(false);
  const [channelSettingsSession, setChannelSettingsSession] = useState(0);

  const handleViewChange = useCallback((id: string) => {
    const next = parseViewId(id);
    setView(next);
    syncViewParam(next);
    setModalOpen(next === 'channel');
    setChannelSettingsFromThreadOpen(false);
  }, []);

  useLayoutEffect(() => {
    setCenterSlot(
      <SceneSwitcher
        scenes={[...VIEW_SCENES]}
        activeId={view}
        onChange={handleViewChange}
        ariaLabel="Post attributes views"
      />,
    );
    return () => setCenterSlot(null);
  }, [view, handleViewChange, setCenterSlot]);

  const openChannelNewAttribute = useCallback(() => {
    syncChannelNewAttributeParams();
    setChannelSettingsSession((current) => current + 1);
    setChannelSettingsFromThreadOpen(true);
  }, []);

  const openChannelEditAttribute = useCallback((attributeId: string) => {
    syncChannelAttributeDetailParams(attributeId);
    setChannelSettingsSession((current) => current + 1);
    setChannelSettingsFromThreadOpen(true);
  }, []);

  const closeChannelSettingsFromThread = useCallback(() => {
    clearChannelNewAttributeParams();
    clearChannelAttributeDetailParams();
    setChannelSettingsFromThreadOpen(false);
  }, []);

  const showThreadScene = view === 'channel-thread' || view === 'attrs-modal';

  if (showThreadScene) {
    return (
      <div className={styles['scene']}>
        <ChannelThreadView
          key={view}
          attributeReveal={view === 'attrs-modal' ? 'modal' : 'thread'}
          onCreateAttribute={openChannelNewAttribute}
          onEditAttribute={openChannelEditAttribute}
        />

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
        userAvatarSrc={avatarLeonard}
        userAvatarAlt="Leonard Riley"
        channelHeader={
          <ChannelHeader
            type="Channel"
            name="alpha-coordination"
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
                    Open Channel settings to create attributes for this channel
                    and its posts.
                  </p>
                </Message>
                <Message
                  avatarSrc={avatarAikoTan}
                  avatarAlt="Aiko Tan"
                  username="Aiko Tan"
                  timestamp="09:18"
                >
                  <p className={shellStyles['channel-shell__post-text']}>
                    In Channel · thread, hover attribute pills for a summary —
                    Edit opens the attributes modal.
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
            aria-label="Close Channel settings"
            onClick={() => setModalOpen(false)}
          />
          <div className={styles['scene__dialog']}>
            <ChannelSettingsModal
              channelName="alpha-coordination"
              onClose={() => setModalOpen(false)}
            />
          </div>
        </div>
      )}

      {!modalOpen && (
        <button
          type="button"
          className={styles['scene__reopen']}
          onClick={() => setModalOpen(true)}
        >
          Reopen Channel settings
        </button>
      )}
    </div>
  );
}
