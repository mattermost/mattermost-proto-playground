/**
 * DPC A1 — Baseline + Confirm-and-Commit (full implementation).
 *
 * Layout (per Stage 2 contract):
 *   ┌─────────────────────────────────────────────────────────────────┐
 *   │ ScenarioHeader (persona + viewport + ABAC policy picker)        │
 *   ├─────────────────────────────────────────────────────────────────┤
 *   │ Optional toast (post-save / session-expiry rejection)           │
 *   ├──────────────────────────┬──────────────────────────────────────┤
 *   │ Left column              │ Right column                         │
 *   │  ─ channel-admin:        │  ─ channel-admin:                    │
 *   │    ChannelSettings       │    PendingRequestsRail + AuditPanel  │
 *   │  ─ end-user-tenured:     │  ─ end-user-tenured:                 │
 *   │    BrowseChannels +      │    DmNotificationPreview             │
 *   │    L&R overlay surface   │                                      │
 *   │  ─ end-user-newer:       │  ─ end-user-newer:                   │
 *   │    BrowseChannels        │    DmNotificationPreview             │
 *   │  ─ guest:                │  ─ guest:                            │
 *   │    BrowseChannels        │    (NFR-2 demo notice)               │
 *   │    (NFR-2 empty)         │                                      │
 *   │  ─ system-admin:         │  ─ system-admin:                     │
 *   │    AuditPanel            │    PendingRequestsRail (read-only)   │
 *   └──────────────────────────┴──────────────────────────────────────┘
 *
 * Mobile (per useViewport): collapses to single column; admin surfaces hide
 * with a "Web-only at launch (KD-8)" notice; only the end-user surfaces
 * render at 360 CSS px parity (FR-16 / NFR-8).
 *
 * The ConfirmCommitModal renders as an absolute-positioned overlay anchored
 * to the prototype canvas; it sits above the layout when active.
 *
 * Annotated user-action → state-change → audit-event flow:
 *   Channel admin → ChannelSettings → toggle ON + Save Changes
 *     → store.openToggleConfirm → modal renders
 *     → store.confirmToggleEnable → audit `discoverable.toggle.enabled`
 *
 *   End user → BrowseChannels → Request to Join
 *     → store.submitRequest → audit `request.submitted`
 *
 *   Channel admin → PendingRequestsRail → Approve / Deny
 *     → store.approveRequest / store.denyRequest
 *     → audit `request.approved` / `request.denied` + DM dispatched
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
import PendingRequestsRail from './_states/PendingRequestsRail';
import DmNotificationPreview from './_states/DmNotificationPreview';
import AuditPanel from './_states/AuditPanel';
import RejoinableChannelsSurface from './_states/RejoinableChannelsSurface';
import { useA1Store, type A1StoreApi } from './useA1Store';
import styles from './A1.module.scss';

function A1Inner({ store }: { store: A1StoreApi }) {
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
          leftColumn: <ChannelSettings store={store} />,
          rightColumn: (
            <>
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
            </>
          ),
          rightColumn: <DmNotificationPreview store={store} />,
        };
      case 'end-user-newer':
        return {
          leftColumn: <BrowseChannels store={store} />,
          rightColumn: <DmNotificationPreview store={store} />,
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
          leftColumn: <AuditPanel store={store} />,
          rightColumn: <PendingRequestsRail store={store} />,
        };
    }
  }, [persona, store]);

  return (
    <div
      className={[
        styles['dpc-a1'],
        styles[`dpc-a1--viewport-${viewport}`],
        styles[`dpc-a1--persona-${persona}`],
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {store.state.recentlySaved && (
        <div className={styles['dpc-a1__toast']}>
          <ToastBanner
            type="Success"
            message="Discoverable enabled. Audit event recorded."
            onDismiss={() => store.dismissToast()}
          />
        </div>
      )}

      {adminSurfacesHiddenOnMobile ? (
        <div className={styles['dpc-a1__mobile-admin-notice']}>
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
        <div className={styles['dpc-a1__columns']}>
          <div className={styles['dpc-a1__left']}>{leftColumn}</div>
          <div className={styles['dpc-a1__right']}>{rightColumn}</div>
        </div>
      )}

      {/* The Confirm-and-Commit modal renders only when pendingToggle=true.
          Anchored to the prototype canvas — overlays the column layout. */}
      <ConfirmCommitModal store={store} />
    </div>
  );
}

export default function A1() {
  const store = useA1Store();

  return (
    <PrototypeShell
      label="DPC — A1: Baseline + Confirm-and-Commit"
      trailingControl={
        <AbacPolicyPicker
          value={store.state.abacPolicy}
          onChange={store.selectAbacPolicy}
        />
      }
    >
      <A1Inner store={store} />
    </PrototypeShell>
  );
}
