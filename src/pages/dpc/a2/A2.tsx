/**
 * DPC A2 — Baseline + Intent-Wizard (Phase 6a prototype).
 *
 * Wires the A2-specific surfaces from Phase 5 §3.2.13:
 *   1. Channel Settings → Info tab with the Discoverable toggle (OFF / PENDING / ON)
 *   2. Wizard Step 1 — scope choice radio (open-to-team vs restrict-by-rules)
 *   3. Wizard Step 2A — deliberately-empty open-to-team confirmation (KD-5 honesty)
 *   4. Wizard Step 2B — Access Control tab with deferred-commit banner + atomic save
 *   5. V-A2-1 discard-warning toast on Back-with-dirty-rules
 *   6. Audit panel including the three wizard-lifecycle events
 *   7. Shared surfaces (Browse, Request-to-Join, Pending Requests, DM previews,
 *      Rejoinable Channels) implemented inline so the prototype is standalone.
 *
 * Persona / viewport switching is provided by PrototypeShell.
 * Trailing control in the harness header is the "Channel has ABAC rules"
 * picker per intake — switches between the open-to-team and restrict-by-rules
 * default paths for demo purposes.
 *
 * Mobile (360px) renders end-user surfaces only; admin wizard surfaces show
 * a "Web only at launch (KD-8)" notice on mobile per §3.2.11.
 */
import { useState } from 'react';
import LaptopIcon from '@mattermost/compass-icons/components/laptop';
import {
  PrototypeShell,
  useViewport,
  usePersona,
} from '@/pages/dpc/shared';
import SectionNotice from '@/components/ui/SectionNotice/SectionNotice';
import LabelTag from '@/components/ui/LabelTag/LabelTag';
import Icon from '@/components/ui/Icon/Icon';
import { useA2Store } from './useA2Store';
import ChannelSettings from './_states/ChannelSettings';
import WizardStep1 from './_states/WizardStep1';
import WizardStep2A from './_states/WizardStep2A';
import DiscardWarningToast from './_states/DiscardWarningToast';
import BrowseChannels from './_states/BrowseChannels';
import RequestToJoinModal from './_states/RequestToJoinModal';
import PendingRequestsRail from './_states/PendingRequestsRail';
import DmNotificationPreview from './_states/DmNotificationPreview';
import AuditPanel from './_states/AuditPanel';
import RejoinableChannelsSurface from './_states/RejoinableChannelsSurface';
import { CHANNELS } from '@/pages/dpc/shared';
import styles from './A2.module.scss';

type AbacScenario = 'no-abac' | 'has-abac';

function ScenarioPicker({
  scenario,
  onChange,
}: {
  scenario: AbacScenario;
  onChange: (next: AbacScenario) => void;
}) {
  return (
    <label className={styles['dpc-a2__scenario']}>
      <span className={styles['dpc-a2__scenario-label']}>ABAC scenario</span>
      <select
        className={styles['dpc-a2__scenario-select']}
        value={scenario}
        onChange={(e) => onChange(e.target.value as AbacScenario)}
      >
        <option value="no-abac">
          No-ABAC majority — exercises Step 2A (KD-5 surface)
        </option>
        <option value="has-abac">
          Has ABAC rules — exercises Step 2B deferred-commit
        </option>
      </select>
    </label>
  );
}

function A2Body({ scenario }: { scenario: AbacScenario }) {
  const store = useA2Store();
  const { viewport } = useViewport();
  const { persona } = usePersona();
  const [rejoinChannelId, setRejoinChannelId] = useState<string | null>(null);

  const isAdmin = persona === 'channel-admin';
  const isMobile = viewport === 'mobile';
  const rejoinChannel = rejoinChannelId
    ? CHANNELS.find((c) => c.id === rejoinChannelId)
    : null;

  return (
    <div className={styles['dpc-a2']}>
      <header className={styles['dpc-a2__intro']}>
        <div className={styles['dpc-a2__intro-head']}>
          <h2 className={styles['dpc-a2__intro-title']}>
            A2 — Baseline + Intent-Wizard
          </h2>
          <LabelTag
            label={
              scenario === 'no-abac' ? 'Step 2A demo path' : 'Step 2B demo path'
            }
            type="Info Dim"
            size="X-Small"
          />
        </div>
        <p className={styles['dpc-a2__intro-copy']}>
          Channel admin flips the Discoverable toggle → 2-step wizard. Step 1
          asks for access scope. Step 2A confirms open-to-team (deliberately
          empty for the no-ABAC majority — KD-5 honesty surface). Step 2B
          routes to the Access Control tab with a deferred-commit banner;
          Save atomically commits Discoverable + rules.
        </p>
      </header>

      {isMobile && isAdmin && (
        <SectionNotice
          type="Info"
          icon={<Icon glyph={<LaptopIcon />} size="20" />}
          title="Admin wizard is web-only at launch (KD-8)"
          description="The Intent-Wizard, Channel Settings → Info tab, and the Pending Requests queue ship web-only in v1 per §3.2.11. Switch back to Desktop to interact with the admin surfaces."
        />
      )}

      <div
        className={[
          styles['dpc-a2__columns'],
          isMobile ? styles['dpc-a2__columns--mobile'] : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {isAdmin && !isMobile && (
          <div className={styles['dpc-a2__column']}>
            <ChannelSettings store={store} />
            <PendingRequestsRail store={store} />
          </div>
        )}

        <div className={styles['dpc-a2__column']}>
          <BrowseChannels store={store} />
          <RejoinableChannelsSurface
            store={store}
            onRequestClick={(channelId) => setRejoinChannelId(channelId)}
          />
        </div>

        {!isMobile && (
          <div className={styles['dpc-a2__column']}>
            <AuditPanel store={store} />
            <DmNotificationPreview store={store} />
          </div>
        )}
      </div>

      {isMobile && !isAdmin && (
        <div className={styles['dpc-a2__column']}>
          <DmNotificationPreview store={store} />
        </div>
      )}

      {/* Wizard overlays — only when channel-admin is the active persona. */}
      {isAdmin && !isMobile && (
        <>
          {store.wizardStep === 'step1' && <WizardStep1 store={store} />}
          {store.wizardStep === 'step2a' && <WizardStep2A store={store} />}
          <DiscardWarningToast store={store} />
        </>
      )}

      {/* Rejoin entry point routes through the standard Request-to-Join modal. */}
      {rejoinChannel && (
        <RequestToJoinModal
          store={store}
          channelId={rejoinChannel.id}
          channelName={rejoinChannel.displayName}
          channelPurpose={rejoinChannel.purpose}
          priorMembership
          onClose={() => setRejoinChannelId(null)}
        />
      )}
    </div>
  );
}

export default function A2() {
  const [scenario, setScenario] = useState<AbacScenario>('no-abac');

  return (
    <PrototypeShell
      label="DPC — A2: Baseline + Intent-Wizard"
      trailingControl={
        <ScenarioPicker scenario={scenario} onChange={setScenario} />
      }
    >
      <A2Body scenario={scenario} />
    </PrototypeShell>
  );
}
