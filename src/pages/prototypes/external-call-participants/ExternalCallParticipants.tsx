import { useEffect, useState } from 'react';
import { MessageInput } from '@mattermost/compass-ui/components/message-input';
import { MessageSeparator } from '@mattermost/compass-ui/components/message-separator';
import { Message } from '@mattermost/compass-ui/components/message';
import { CallPopout } from '@mattermost/compass-proto';
import { CallWidget } from '@mattermost/compass-proto';
import SceneSwitcher from '@/components/navigation/SceneSwitcher/SceneSwitcher';
import { Scrollbar } from '@mattermost/compass-ui/components/scrollbar';
import avatarLeonard from '@/assets/avatars/Leonard Riley.png';
import avatarMarco from '@/assets/avatars/Marco Rinaldi.png';
import avatarSofia from '@/assets/avatars/Sofia Bauer.png';
import type { Participant } from '@/types/callParticipant';
import { shellStyles } from '@mattermost/compass-proto';
import {
  DIAL_IN_NUMBER,
  DIAL_IN_PIN,
  EXTERNAL_LINK,
  INTERNAL_LINK,
} from '@/fixtures/calls/callConstants';
import { CALL_PARTICIPANTS } from '@/fixtures/calls/callParticipants';
import { SCENES, type SceneId } from './externalCallParticipants.scenes';
import { usePrototypeChrome } from '@/contexts/PrototypeChromeContext';
import ExternalCallChannelsShell from './ExternalCallChannelsShell';
import WelcomeScene from './WelcomeScene';

export default function ExternalCallParticipants() {
  const { setCenterSlot } = usePrototypeChrome();
  const [externalEnabled, setExternalEnabled] = useState(false);
  const [scene, setScene] = useState<SceneId>('widget');
  const [callInfoOpen, setCallInfoOpen] = useState(false);
  const [widgetOverlay, setWidgetOverlay] = useState<
    'menu' | 'info' | 'participants' | null
  >(null);
  const [muted, setMuted] = useState(true);
  const [handRaised, setHandRaised] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [guestName, setGuestName] = useState('');

  const popoutOpen = scene === 'popout';

  useEffect(() => {
    setCenterSlot(
      <SceneSwitcher
        scenes={SCENES}
        activeId={scene}
        onChange={(id) => setScene(id as SceneId)}
        ariaLabel="Prototype entry points"
      />,
    );
    return () => setCenterSlot(null);
  }, [scene, setCenterSlot]);

  const guestParticipants: Participant[] = CALL_PARTICIPANTS.map((p) =>
    p.id === 'external-james' && guestName.trim()
      ? { ...p, name: guestName.trim() }
      : p,
  );

  const callLinkProps = {
    internalLink: INTERNAL_LINK,
    externalLink: EXTERNAL_LINK,
    dialInNumber: DIAL_IN_NUMBER,
    dialInPin: DIAL_IN_PIN,
  };

  if (scene === 'welcome') {
    return (
      <WelcomeScene
        channelName="UX Design"
        onJoin={(name) => {
          setGuestName(name);
          setScene('guest');
        }}
      />
    );
  }

  if (scene === 'guest') {
    return (
      <CallPopout
        variant="fullscreen"
        guestView
        participants={guestParticipants}
        currentUserId="external-james"
        muted={muted}
        onToggleMute={() => setMuted((m) => !m)}
        onLeave={() => setScene('welcome')}
        infoOpen={callInfoOpen}
        onInfoToggle={() => setCallInfoOpen((v) => !v)}
        externalEnabled={externalEnabled}
        onExternalEnabledChange={setExternalEnabled}
        {...callLinkProps}
      />
    );
  }

  return (
    <ExternalCallChannelsShell
      floating={
        !popoutOpen ? (
          <CallWidget
            participants={CALL_PARTICIPANTS}
            currentUserId="leonard"
            talkerName="Leonard R."
            talkerAvatarSrc={avatarLeonard}
            channelName="UX Design"
            muted={muted}
            onToggleMute={() => setMuted((m) => !m)}
            handRaised={handRaised}
            onToggleHand={() => setHandRaised((h) => !h)}
            sharing={sharing}
            onToggleShare={() => setSharing((s) => !s)}
            onExpand={() => setScene('popout')}
            onLeave={() => setScene('widget')}
            overlay={widgetOverlay}
            onToggleMenu={() =>
              setWidgetOverlay((v) => (v === 'menu' ? null : 'menu'))
            }
            onToggleParticipants={() =>
              setWidgetOverlay((v) =>
                v === 'participants' ? null : 'participants',
              )
            }
            onOpenCallInfo={() => setWidgetOverlay('info')}
            onCloseCallInfo={() => setWidgetOverlay(null)}
            externalEnabled={externalEnabled}
            onExternalEnabledChange={setExternalEnabled}
            {...callLinkProps}
          />
        ) : undefined
      }
      overlay={
        popoutOpen ? (
          <CallPopout
            participants={CALL_PARTICIPANTS}
            currentUserId="leonard"
            muted={muted}
            onToggleMute={() => setMuted((m) => !m)}
            onCollapse={() => {
              setScene('widget');
              setCallInfoOpen(false);
            }}
            onLeave={() => setScene('widget')}
            infoOpen={callInfoOpen}
            onInfoToggle={() => setCallInfoOpen((v) => !v)}
            externalEnabled={externalEnabled}
            onExternalEnabledChange={setExternalEnabled}
            {...callLinkProps}
          />
        ) : undefined
      }
    >
      <div className={shellStyles['channel-shell__messages']}>
        <Scrollbar>
          <div className={shellStyles['channel-shell__messages-list']}>
            <MessageSeparator type="date" label="Today" />

            <Message
              avatarSrc={avatarSofia}
              avatarAlt="Sofia Bauer"
              username="Sofia Bauer"
              timestamp="9:02 AM"
            >
              <p className={shellStyles['channel-shell__post-text']}>
                We&rsquo;re jumping on the call with the partner team in a few
                minutes — sharing the external link so Priya can join without a
                Mattermost account.
              </p>
            </Message>

            <Message
              avatarSrc={avatarMarco}
              avatarAlt="Marco Rinaldi"
              username="Marco Rinaldi"
              timestamp="9:14 AM"
            >
              <p className={shellStyles['channel-shell__post-text']}>
                I&rsquo;ll dial in from the shop floor — no browser there. Drop
                the SIP number and PIN in the thread please.
              </p>
            </Message>
          </div>
        </Scrollbar>
      </div>

      <div className={shellStyles['channel-shell__message-input']}>
        <MessageInput placeholder="Write to UX Design" />
      </div>
    </ExternalCallChannelsShell>
  );
}
