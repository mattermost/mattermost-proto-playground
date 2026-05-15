import { useState } from 'react';
import CallPopout from '@/components/ui/CallPopout/CallPopout';
import {
  DIAL_IN_NUMBER,
  DIAL_IN_PIN,
  EXTERNAL_LINK,
  INTERNAL_LINK,
} from '@/pages/ExternalCallParticipants/externalCallParticipants.constants';
import { CALL_PARTICIPANTS } from '@/pages/ExternalCallParticipants/externalCallParticipants.fixtures';
import styles from './call-popout.specimen.module.scss';

const callLinkProps = {
  internalLink: INTERNAL_LINK,
  externalLink: EXTERNAL_LINK,
  dialInNumber: DIAL_IN_NUMBER,
  dialInPin: DIAL_IN_PIN,
};

export default function CallPopoutLayout() {
  const [externalEnabled, setExternalEnabled] = useState(false);
  const [callInfoOpen, setCallInfoOpen] = useState(false);
  const [muted, setMuted] = useState(true);

  return (
    <div className={styles['call-popout-preview']}>
      <CallPopout
        participants={CALL_PARTICIPANTS}
        currentUserId="leonard"
        muted={muted}
        onToggleMute={() => setMuted((m) => !m)}
        onCollapse={() => undefined}
        onLeave={() => undefined}
        infoOpen={callInfoOpen}
        onInfoToggle={() => setCallInfoOpen((v) => !v)}
        externalEnabled={externalEnabled}
        onExternalEnabledChange={setExternalEnabled}
        {...callLinkProps}
      />
    </div>
  );
}
