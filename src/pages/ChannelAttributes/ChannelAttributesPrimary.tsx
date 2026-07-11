import { useState } from 'react';
import SceneHarness, { type SceneDef } from './shared/SceneHarness';
import DesktopChannelFrame from './surfaces/DesktopChannelFrame';
import MobileChannelFrame from './surfaces/MobileChannelFrame';
import MobileInfoPanel from './surfaces/MobileInfoPanel';
import CreateChannelModal, { type CreateModalState } from './surfaces/CreateChannelModal';
import MobileCreateChannel from './surfaces/MobileCreateChannel';
import AttributeSidebarBlock from './shared/AttributeSidebarBlock';
import ReclassificationModal, { type ReclassPhase } from './shared/ReclassificationModal';
import ModalBackdrop from './shared/ModalBackdrop';
import {
  CLEARED_VIEWER_PAYLOAD,
  UNCLEARED_VIEWER_PAYLOAD_B1,
  UNCLEARED_VIEWER_PAYLOAD_B3,
  CHANNEL_NAME,
  type ChannelAttributePayload,
} from './shared/channelAttrData';

// A payload where the uncleared viewer has NO cleared attributes at all (block absent).
const NO_CLEARED_PAYLOAD: ChannelAttributePayload = {
  channelId: 'operation-aurora',
  channelName: CHANNEL_NAME,
  values: [],
};

// Admin sidebar block wired with local config-popover + governed-change state.
function AdminSidebar({ payload }: { payload: ChannelAttributePayload }) {
  const [openConfig, setOpenConfig] = useState<string | null>(null);
  const [reclassOpen, setReclassOpen] = useState(false);
  return (
    <>
      <AttributeSidebarBlock
        payload={payload}
        mode="admin"
        openConfigFor={openConfig}
        onToggleConfig={setOpenConfig}
        onGovernedChange={() => setReclassOpen(true)}
      />
      {reclassOpen && (
        <ModalBackdrop>
          <ReclassificationModal
            oldValue="SECRET"
            onCancel={() => setReclassOpen(false)}
            onConfirm={() => setReclassOpen(false)}
          />
        </ModalBackdrop>
      )}
    </>
  );
}

// Config popover open by default (state-matrix display).
function AdminSidebarConfigOpen({ payload }: { payload: ChannelAttributePayload }) {
  const [openConfig, setOpenConfig] = useState<string | null>('programs');
  return (
    <AttributeSidebarBlock
      payload={payload}
      mode="admin"
      openConfigFor={openConfig}
      onToggleConfig={setOpenConfig}
      onGovernedChange={() => {}}
    />
  );
}

function createScene(state: CreateModalState) {
  return (
    <ModalBackdrop>
      <CreateChannelModal state={state} />
    </ModalBackdrop>
  );
}

function reclassScene(phase?: ReclassPhase) {
  return (
    <ModalBackdrop>
      <ReclassificationModal oldValue="SECRET" forcePhase={phase} />
    </ModalBackdrop>
  );
}

const SCENES: SceneDef[] = [
  // ── Create-channel modal (desktop) ──────────────────────────────────────────
  {
    id: 'create-on',
    label: 'Default — toggle ON (mandatory)',
    group: 'Create modal · desktop',
    render: () => createScene('default-on'),
  },
  {
    id: 'create-off',
    label: 'Default — toggle OFF (optional)',
    group: 'Create modal · desktop',
    render: () => createScene('default-off'),
  },
  {
    id: 'create-picker',
    label: 'Programs picker open',
    group: 'Create modal · desktop',
    render: () => createScene('picker'),
  },
  {
    id: 'create-error',
    label: 'Error — unset mandatory on Save',
    group: 'Create modal · desktop',
    render: () => createScene('error'),
  },
  {
    id: 'create-loading',
    label: 'Loading — Save in flight',
    group: 'Create modal · desktop',
    render: () => createScene('loading'),
  },

  // ── Channel header + banner (desktop) ───────────────────────────────────────
  {
    id: 'header-cleared',
    label: 'Cleared viewer — pills + banner + tooltip',
    group: 'Header + banner · desktop',
    render: () => (
      <DesktopChannelFrame payload={CLEARED_VIEWER_PAYLOAD} visibleHeaderSlots={2} />
    ),
  },
  {
    id: 'header-overflow',
    label: 'Overflow — +N popover (1 slot)',
    group: 'Header + banner · desktop',
    render: () => (
      <DesktopChannelFrame payload={CLEARED_VIEWER_PAYLOAD} visibleHeaderSlots={1} />
    ),
  },
  {
    id: 'banner-b1',
    label: 'Uncleared B1 — generic Handling indicator',
    group: 'Header + banner · desktop',
    render: () => <DesktopChannelFrame payload={UNCLEARED_VIEWER_PAYLOAD_B1} />,
  },
  {
    id: 'banner-b3',
    label: 'Uncleared B3 — full omission',
    group: 'Header + banner · desktop',
    render: () => <DesktopChannelFrame payload={UNCLEARED_VIEWER_PAYLOAD_B3} />,
  },
  {
    id: 'dual-band',
    label: 'Dual band — global above channel',
    group: 'Header + banner · desktop',
    render: () => (
      <DesktopChannelFrame
        payload={CLEARED_VIEWER_PAYLOAD}
        globalBand={{ active: true, level: 'TOP SECRET' }}
      />
    ),
  },
  {
    id: 'elevated-warning',
    label: 'Channel > global — admin warning',
    group: 'Header + banner · desktop',
    render: () => (
      <DesktopChannelFrame
        payload={CLEARED_VIEWER_PAYLOAD}
        globalBand={{ active: true, level: 'CONFIDENTIAL' }}
        showElevatedWarning
      />
    ),
  },

  // ── Info sidebar (desktop) ──────────────────────────────────────────────────
  {
    id: 'sidebar-admin',
    label: 'Admin edit — inline + lock affordance',
    group: 'Info sidebar · desktop',
    render: () => (
      <DesktopChannelFrame
        payload={CLEARED_VIEWER_PAYLOAD}
        rightSidebar={<AdminSidebar payload={CLEARED_VIEWER_PAYLOAD} />}
      />
    ),
  },
  {
    id: 'sidebar-config',
    label: 'Admin — config popover (DISPLAY IN, no Rename)',
    group: 'Info sidebar · desktop',
    render: () => (
      <DesktopChannelFrame
        payload={CLEARED_VIEWER_PAYLOAD}
        rightSidebar={<AdminSidebarConfigOpen payload={CLEARED_VIEWER_PAYLOAD} />}
      />
    ),
  },
  {
    id: 'sidebar-member',
    label: 'Member read-only',
    group: 'Info sidebar · desktop',
    render: () => (
      <DesktopChannelFrame
        payload={CLEARED_VIEWER_PAYLOAD}
        rightSidebar={<AttributeSidebarBlock payload={CLEARED_VIEWER_PAYLOAD} mode="member" />}
      />
    ),
  },
  {
    id: 'sidebar-member-partial',
    label: 'Member — partially cleared',
    group: 'Info sidebar · desktop',
    render: () => (
      <DesktopChannelFrame
        payload={UNCLEARED_VIEWER_PAYLOAD_B1}
        rightSidebar={<AttributeSidebarBlock payload={UNCLEARED_VIEWER_PAYLOAD_B1} mode="member" />}
      />
    ),
  },
  {
    id: 'sidebar-empty-admin',
    label: 'Admin empty — “+ Add attribute” only',
    group: 'Info sidebar · desktop',
    render: () => (
      <DesktopChannelFrame
        payload={NO_CLEARED_PAYLOAD}
        rightSidebar={<AttributeSidebarBlock payload={NO_CLEARED_PAYLOAD} mode="admin" />}
        rightSidebarTitle="Info"
      />
    ),
  },

  // ── Reclassification modal (desktop) ────────────────────────────────────────
  {
    id: 'reclass-idle',
    label: 'Open — no new value (Confirm disabled)',
    group: 'Reclassification · desktop',
    render: () => reclassScene('idle'),
  },
  {
    id: 'reclass-loading',
    label: 'Loading — Confirm in flight',
    group: 'Reclassification · desktop',
    render: () => reclassScene('loading'),
  },
  {
    id: 'reclass-error',
    label: 'Server error',
    group: 'Reclassification · desktop',
    render: () => reclassScene('error'),
  },

  // ── Mobile ──────────────────────────────────────────────────────────────────
  {
    id: 'mobile-label',
    label: 'Header — label treatment',
    group: 'Mobile',
    render: () => (
      <MobileChannelFrame
        payload={CLEARED_VIEWER_PAYLOAD}
        treatment="label"
        globalBand={{ active: true, level: 'TOP SECRET' }}
      />
    ),
  },
  {
    id: 'mobile-banner',
    label: 'Header — banner treatment',
    group: 'Mobile',
    render: () => (
      <MobileChannelFrame
        payload={CLEARED_VIEWER_PAYLOAD}
        treatment="banner"
        globalBand={{ active: true, level: 'TOP SECRET' }}
      />
    ),
  },
  {
    id: 'mobile-info-member',
    label: 'Info modal — member read-only',
    group: 'Mobile',
    render: () => <MobileInfoPanel payload={CLEARED_VIEWER_PAYLOAD} mode="member" />,
  },
  {
    id: 'mobile-info-admin',
    label: 'Info modal — admin edit',
    group: 'Mobile',
    render: () => <MobileInfoPanel payload={CLEARED_VIEWER_PAYLOAD} mode="admin" />,
  },
  {
    id: 'mobile-create-on',
    label: 'Create — toggle ON (mandatory)',
    group: 'Mobile',
    render: () => <MobileCreateChannel state="default-on" />,
  },
  {
    id: 'mobile-create-error',
    label: 'Create — error (mandatory unset)',
    group: 'Mobile',
    render: () => <MobileCreateChannel state="error" />,
  },
];

export default function ChannelAttributesPrimary() {
  return <SceneHarness title="Channel Attributes · Primary" scenes={SCENES} />;
}
