import { useState } from 'react';
import { ChannelHeader } from '@mattermost/compass-ui';
import { ChannelShell } from '@mattermost/compass-proto';
import { defaultChannelsSidebarDemoModel } from '@/fixtures/channelsSidebarDemo';
import { MessageInput } from '@mattermost/compass-ui';
import { MessageSeparator } from '@mattermost/compass-ui';
import { Message } from '@mattermost/compass-ui';
import { CallWidget } from '@mattermost/compass-proto';
import { Scrollbar } from '@mattermost/compass-ui';
import avatarLeonard from '@/assets/avatars/Leonard Riley.png';
import avatarMarco from '@/assets/avatars/Marco Rinaldi.png';
import avatarSofia from '@/assets/avatars/Sofia Bauer.png';
import { shellStyles } from '@mattermost/compass-proto';
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
      channelsSidebarModel={defaultChannelsSidebarDemoModel}
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
        <Scrollbar>
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
        </Scrollbar>
      </div>

      <div className={shellStyles['channel-shell__message-input']}>
        <MessageInput placeholder="Write to UX Design" />
      </div>
    </ChannelShell>
  );
}
