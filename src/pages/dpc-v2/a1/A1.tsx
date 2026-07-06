/**
 * DPC V2 A1 — Revised Baseline + Confirm-and-Commit (refactored May 2026).
 *
 * Layout is now a vertical scroll of full-width "screens", each
 * rendering inside a `ScreenCanvas` with its own product chrome (a
 * real `ChannelShell` where the state warrants it). Reviewers see each
 * surface exactly as it lives in product, then a "Review notes" block
 * below each canvas calls out the load-bearing details that previously
 * sat inside the UI as dashed-border meta-annotations (Change 3).
 *
 * Per-persona filtering still applies: each persona only sees the
 * screens that match its viewpoint. The mobile cutline for admin
 * surfaces (KD-8) is preserved.
 *
 * ConfirmCommitModal and DeclineModal continue to render as page-level
 * overlays when triggered through the store; their standalone canvas
 * entries (re)appear in the showcase row so reviewers can scrub all
 * scenario templates without firing the trigger.
 */
import { useEffect, useMemo } from 'react';
import {
  PrototypeShell,
  usePersona,
  useViewport,
} from '@/pages/dpc/shared';
import ToastBanner from '@/components/ui/ToastBanner/ToastBanner';
import SectionNotice from '@/components/ui/SectionNotice/SectionNotice';
import AbacPolicyPicker from './_components/AbacPolicyPicker';
import ChannelSettings from './_states/ChannelSettings';
import ConfirmCommitModal from './_states/ConfirmCommitModal';
import BrowseChannels from './_states/BrowseChannels';
import RequestToJoinModal from './_states/RequestToJoinModal';
import PendingRequestsRail from './_states/PendingRequestsRail';
import DmNotificationPreview from './_states/DmNotificationPreview';
import AuditPanel from './_states/AuditPanel';
import RejoinableChannelsSurface from './_states/RejoinableChannelsSurface';
import PermalinkUnfurl from './_states/PermalinkUnfurl';
import ChannelSwitcher from './_states/ChannelSwitcher';
import InChannelAdminSysMsg from './_states/InChannelAdminSysMsg';
import PendingRequestIndicators from './_states/PendingRequestIndicators';
import DeclineModal from './_states/DeclineModal';
import PermissionSchemeEntry from './_states/PermissionSchemeEntry';
import IndicatorShowcase from './_states/IndicatorShowcase';
import { useA1V2Store, type A1V2StoreApi } from './useA1V2Store';
import styles from './A1.module.scss';

function A1V2Inner({ store }: { store: A1V2StoreApi }) {
  const { persona } = usePersona();
  const { viewport } = useViewport();
  const isMobile = viewport === 'mobile';

  // Auto-dismiss the post-save toast after 4s (UX micro-affordance).
  useEffect(() => {
    if (!store.state.recentlySaved) return;
    const t = window.setTimeout(() => store.dismissToast(), 4000);
    return () => window.clearTimeout(t);
  }, [store, store.state.recentlySaved]);

  // v2 VP-5 mobile parity expansion: SG1 toggle + SG2 modal + SG5 panel +
  // SG12 modal all ship at 360px parity. Only the System Console Permission
  // Scheme editor remains web-only, so we gate just system-admin on mobile.
  const adminSurfacesHiddenOnMobile = isMobile && persona === 'system-admin';

  // Persona-aware screen stack. Each entry is rendered full-width in a
  // single vertical column so the underlying ChannelShell chrome has
  // room to breathe.
  const screens = useMemo(() => {
    switch (persona) {
      case 'channel-admin':
        return (
          <>
            <ChannelSettings store={store} />
            <ConfirmCommitModal store={store} standalone />
            <PendingRequestIndicators store={store} />
            <PendingRequestsRail store={store} />
            <DeclineModal store={store} standalone />
            <InChannelAdminSysMsg store={store} />
            <PermalinkUnfurl store={store} />
            <ChannelSwitcher store={store} />
            <IndicatorShowcase store={store} />
            <AuditPanel store={store} />
          </>
        );
      case 'end-user-tenured':
        return (
          <>
            <BrowseChannels store={store} />
            <PermalinkUnfurl store={store} />
            <ChannelSwitcher store={store} />
            <RejoinableChannelsSurface store={store} />
            <RequestToJoinModal store={store} standalone />
            <DmNotificationPreview store={store} />
            <IndicatorShowcase store={store} />
          </>
        );
      case 'end-user-newer':
        return (
          <>
            <BrowseChannels store={store} />
            <PermalinkUnfurl store={store} />
            <ChannelSwitcher store={store} />
            <RequestToJoinModal store={store} standalone />
            <DmNotificationPreview store={store} />
            <IndicatorShowcase store={store} />
          </>
        );
      case 'guest':
        return (
          <>
            <BrowseChannels store={store} />
            <SectionNotice
              type="Info"
              title="Server-side guest filter (NFR-2)"
              description={
                <>
                  Guests receive the same zero-result response shape as a
                  non-guest with no eligible channels. No distinguishable error,
                  no enumeration vector — T-1 mitigation per PRD §9.
                </>
              }
            />
          </>
        );
      case 'system-admin':
        return (
          <>
            <PermissionSchemeEntry store={store} />
            <AuditPanel store={store} />
            <PendingRequestIndicators store={store} />
            <PendingRequestsRail store={store} />
            <ConfirmCommitModal store={store} standalone />
            <DeclineModal store={store} standalone />
          </>
        );
    }
  }, [persona, store]);

  return (
    <div
      className={[
        styles['dpc-a1-v2'],
        styles[`dpc-a1-v2--viewport-${viewport}`],
        styles[`dpc-a1-v2--persona-${persona}`],
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {store.state.recentlySaved && (
        <div className={styles['dpc-a1-v2__toast']}>
          <ToastBanner
            type="Success"
            message="Discoverable enabled. Audit event recorded."
            onDismiss={() => store.dismissToast()}
          />
        </div>
      )}

      {adminSurfacesHiddenOnMobile ? (
        <div className={styles['dpc-a1-v2__mobile-admin-notice']}>
          <SectionNotice
            type="Info"
            title="Permission Scheme editor — web-only (System Console)"
            description={
              <>
                v2 expanded mobile parity (VP-5). The Discoverable toggle,
                Confirm-and-Commit modal, Pending Requests panel, and Decline
                modal all ship at 360px parity. The remaining web-only cutline
                is the Permission Scheme editor — it lives in System Console.
                Switch to Desktop · 1280 to see the system-admin advisory.
              </>
            }
          />
        </div>
      ) : (
        <div className={styles['dpc-a1-v2__stack']}>{screens}</div>
      )}

      {/* Page-level modal overlays — render when triggered via store. */}
      <ConfirmCommitModal store={store} />
      <DeclineModal store={store} />
      <RequestToJoinModal store={store} />
    </div>
  );
}

export default function A1V2() {
  const store = useA1V2Store();

  return (
    <PrototypeShell
      label="DPC V2 A1: Revised Baseline + Confirm-and-Commit"
      trailingControl={
        <AbacPolicyPicker
          value={store.state.abacPolicy}
          onChange={store.selectAbacPolicy}
        />
      }
    >
      <A1V2Inner store={store} />
    </PrototypeShell>
  );
}
