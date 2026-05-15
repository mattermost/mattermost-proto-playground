/**
 * DPC V2 A1 — Revised Baseline + Confirm-and-Commit (Phase 2-6 re-run).
 *
 * Wave 1 scaffolding. The orchestrator mounts every required state surface so
 * Wave 2 can fill in the implementations without further routing work.
 *
 * Layout (per Phase 5 V2 contract):
 *   ┌─────────────────────────────────────────────────────────────────┐
 *   │ ScenarioHeader (persona + viewport + ABAC policy picker)        │
 *   ├─────────────────────────────────────────────────────────────────┤
 *   │ Optional toast (post-save / session-expiry rejection)           │
 *   ├──────────────────────────┬──────────────────────────────────────┤
 *   │ Left column              │ Right column                         │
 *   │  Persona-aware primary   │  Persona-aware supporting surfaces   │
 *   ├─────────────────────────────────────────────────────────────────┤
 *   │ Cross-surface showcase row (V2)                                 │
 *   │  PermalinkUnfurl · ChannelSwitcher · IndicatorShowcase ·        │
 *   │  PermissionSchemeEntry · LhsPendingDot · ChannelHeaderIndicator │
 *   │  · InChannelAdminSysMsg                                         │
 *   └─────────────────────────────────────────────────────────────────┘
 *
 * Mobile: collapses to single column; admin surfaces hide with the same
 * "Web-only at launch (KD-8)" notice carried over from V1.
 *
 * Modals (ConfirmCommitModal, DeclineModal) render as absolute-positioned
 * overlays anchored to the prototype canvas.
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
import LhsPendingDot from './_states/LhsPendingDot';
import DeclineModal from './_states/DeclineModal';
import PermissionSchemeEntry from './_states/PermissionSchemeEntry';
import ChannelHeaderIndicator from './_states/ChannelHeaderIndicator';
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

  const adminSurfacesHiddenOnMobile = isMobile && persona === 'channel-admin';

  // Layout per persona. Mobile collapses to single column.
  const { leftColumn, rightColumn } = useMemo(() => {
    switch (persona) {
      case 'channel-admin':
        return {
          leftColumn: (
            <>
              <ChannelSettings store={store} />
              <ChannelHeaderIndicator store={store} />
              <InChannelAdminSysMsg store={store} />
            </>
          ),
          rightColumn: (
            <>
              <LhsPendingDot store={store} />
              <PendingRequestsRail store={store} />
              <AuditPanel store={store} />
            </>
          ),
        };
      case 'end-user-tenured':
        return {
          leftColumn: (
            <>
              <BrowseChannels store={store} />
              <RejoinableChannelsSurface store={store} />
              <ChannelHeaderIndicator store={store} />
            </>
          ),
          rightColumn: (
            <>
              <DmNotificationPreview store={store} />
              <RequestToJoinModal store={store} />
            </>
          ),
        };
      case 'end-user-newer':
        return {
          leftColumn: (
            <>
              <BrowseChannels store={store} />
              <ChannelHeaderIndicator store={store} />
            </>
          ),
          rightColumn: (
            <>
              <DmNotificationPreview store={store} />
              <RequestToJoinModal store={store} />
            </>
          ),
        };
      case 'guest':
        return {
          leftColumn: <BrowseChannels store={store} />,
          rightColumn: (
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
          ),
        };
      case 'system-admin':
        return {
          leftColumn: (
            <>
              <AuditPanel store={store} />
              <PermissionSchemeEntry store={store} />
            </>
          ),
          rightColumn: (
            <>
              <PendingRequestsRail store={store} />
              <LhsPendingDot store={store} />
            </>
          ),
        };
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
            title="Web-only at launch (KD-8)"
            description={
              <>
                The Discoverable toggle and Pending Requests queue are admin
                surfaces and are not part of v1 mobile parity (FR-16 / NFR-8).
                Switch the viewport back to Desktop · 1280 to exercise the
                Confirm-and-Commit flow.
              </>
            }
          />
        </div>
      ) : (
        <>
          <div className={styles['dpc-a1-v2__columns']}>
            <div className={styles['dpc-a1-v2__left']}>{leftColumn}</div>
            <div className={styles['dpc-a1-v2__right']}>{rightColumn}</div>
          </div>

          {/* V2 cross-surface showcase row — visible for every non-guest
              persona so reviewers can audit the new surfaces in one scroll. */}
          {persona !== 'guest' && (
            <div className={styles['dpc-a1-v2__showcase']}>
              <PermalinkUnfurl store={store} />
              <ChannelSwitcher store={store} />
              <IndicatorShowcase store={store} />
            </div>
          )}
        </>
      )}

      {/* Modals — anchored to the prototype canvas. */}
      <ConfirmCommitModal store={store} />
      <DeclineModal store={store} />
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
