import { useState } from 'react';
import ChannelHeader from '@/components/ui/ChannelHeader/ChannelHeader';
import ChannelShell from '@/components/ui/ChannelShell/ChannelShell';
import MessageInput from '@/components/ui/MessageInput';
import MessageSeparator from '@/components/ui/MessageSeparator/MessageSeparator';
import Message from '@/components/ui/Message/Message';
import CallWidget from '@/components/ui/CallWidget/CallWidget';
import Scrollbars from '@/components/ui/Scrollbars/Scrollbars';
import avatarLeonard from '@/assets/avatars/Leonard Riley.png';
import avatarMarco from '@/assets/avatars/Marco Rinaldi.png';
import avatarSofia from '@/assets/avatars/Sofia Bauer.png';
import shellStyles from '@/components/ui/ChannelShell/ChannelShell.module.scss';
import {
  DIAL_IN_NUMBER,
  DIAL_IN_PIN,
  EXTERNAL_LINK,
  INTERNAL_LINK,
} from '@/fixtures/calls/callConstants';
import { CALL_PARTICIPANTS } from '@/fixtures/calls/callParticipants';

const callLinkProps = {
  internalLink: INTERNAL_LINK,
  externalLink: EXTERNAL_LINK,
  dialInNumber: DIAL_IN_NUMBER,
  dialInPin: DIAL_IN_PIN,
};

export default function CallWidgetLayout() {
  const [externalEnabled, setExternalEnabled] = useState(false);
  const [widgetOverlay, setWidgetOverlay] = useState<
    'menu' | 'info' | 'participants' | null
  >(null);
  const [muted, setMuted] = useState(true);
  const [handRaised, setHandRaised] = useState(false);
  const [sharing, setSharing] = useState(false);

  return (
    <ChannelShell
      channelHeader={
        <ChannelHeader
          type="Channel"
          name="UX Design"
          description="Design reviews and ongoing work."
          memberCount={24}
          pinnedCount={2}
        />
      }
      floating={
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
          onExpand={() => undefined}
          onLeave={() => undefined}
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
      }
    >
      <div className={shellStyles['channel-shell__messages']}>
        <Scrollbars>
          <div className={shellStyles['channel-shell__messages-list']}>
            <MessageSeparator type="Date" label="Today" />

            <Message
              avatarSrc={avatarSofia}
              avatarAlt="Sofia Bauer"
              username="Sofia Bauer"
              timestamp="9:02 AM"
            >
              <p className={shellStyles['channel-shell__post-text']}>
                We&rsquo;re jumping on the call with the partner team in a few minutes
                — sharing the external link so Priya can join without a Mattermost
                account.
              </p>
            </Message>

            <Message
              avatarSrc={avatarMarco}
              avatarAlt="Marco Rinaldi"
              username="Marco Rinaldi"
              timestamp="9:14 AM"
            >
              <p className={shellStyles['channel-shell__post-text']}>
                I&rsquo;ll dial in from the shop floor — no browser there. Drop the
                SIP number and PIN in the thread please.
              </p>
            </Message>
          </div>
        </Scrollbars>
      </div>

      <div className={shellStyles['channel-shell__message-input']}>
        <MessageInput placeholder="Write to UX Design" />
      </div>
    </ChannelShell>
  );
}
