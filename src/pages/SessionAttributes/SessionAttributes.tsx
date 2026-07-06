import { useEffect, useState } from 'react';
import ListingPage from './screens/ListingPage';
import SettingsPage from './screens/SettingsPage';
import PolicyEditorSimple from './screens/PolicyEditorSimple';
import UserSessionsModal from './screens/UserSessionsModal';
import styles from './SessionAttributes.module.scss';

type ScreenId =
  | 'listing'
  | 'settings'
  | 'policy-editor-system'
  | 'policy-editor-channel'
  | 'user-sessions'
  | 'user-sessions-empty';

interface Scenario {
  id: ScreenId;
  group: 'Admin Console' | 'Policy Authoring' | 'Session Management';
  tag: string;
  title: string;
  body: string;
  v34?: boolean;
}

const SCENARIOS: Scenario[] = [
  {
    id: 'listing',
    group: 'Admin Console',
    tag: 'System Console · Listing',
    title: 'Session Attributes — Listing Page',
    body: 'Editable per-attribute: Status, TTL, Grace, supported Platforms — all via the row context menu. Includes the 13 client-native + 5 server-native attributes from the tech spec.',
  },
  {
    id: 'settings',
    group: 'Admin Console',
    tag: 'System Console · Settings',
    title: 'Session Attribute Settings',
    body: 'EnforceDeviceIDConsistency toggle + feature-flag / license info. No per-attribute timing here — that lives on the listing page row menu.',
  },
  {
    id: 'policy-editor-system',
    group: 'Policy Authoring',
    tag: 'Permission Policies · Simple Mode',
    title: 'Policy Editor — System Admin',
    body: 'User attributes + Session attributes side-by-side. Picker section header reads "SESSION ATTRIBUTES." CEL prefix shown inline as user.session.<name>. Soft platform-coverage warning at save.',
  },
  {
    id: 'policy-editor-channel',
    group: 'Policy Authoring',
    tag: 'Channel Settings · Channel Admin',
    title: 'Policy Editor — Channel Admin',
    body: 'Channel-scoped variant. Same attribute picker; channel-membership-bounded test data scope.',
  },
  {
    id: 'user-sessions',
    group: 'Session Management',
    tag: 'System Console · Users · Sessions modal',
    title: 'User Sessions modal — view + revoke',
    body: 'New v3.4 design (Figma 6644:52781). Per-user modal listing active sessions with device, OS, last active, created. Per-row "Revoke session" + page-level "Revoke All Sessions." Session attributes intentionally not shown.',
    v34: true,
  },
  {
    id: 'user-sessions-empty',
    group: 'Session Management',
    tag: 'System Console · Users · Empty state',
    title: 'User Sessions modal — empty state',
    body: 'Same modal when the targeted user has no active sessions to revoke.',
    v34: true,
  },
];

const GROUPS = [
  'Admin Console',
  'Policy Authoring',
  'Session Management',
] as const;

export default function SessionAttributes() {
  const [activeId, setActiveId] = useState<ScreenId | null>(null);

  useEffect(() => {
    if (!activeId) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setActiveId(null);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeId]);

  const close = () => setActiveId(null);

  function renderScreen(id: ScreenId) {
    switch (id) {
      case 'listing':
        return <ListingPage onOpenSettings={() => setActiveId('settings')} />;
      case 'settings':
        return <SettingsPage onBack={close} />;
      case 'policy-editor-system':
        return <PolicyEditorSimple role="system" onBack={close} />;
      case 'policy-editor-channel':
        return <PolicyEditorSimple role="channel" onBack={close} />;
      case 'user-sessions':
        return <UserSessionsModal onBack={close} />;
      case 'user-sessions-empty':
        return <UserSessionsModal onBack={close} variant="empty" />;
      default:
        return null;
    }
  }

  return (
    <div className={styles['sa-hub']}>
      <div className={styles['sa-hub__intro']}>
        <h1 className={styles['sa-hub__intro-title']}>
          Session Attributes for Zero Trust ABAC — interactive prototype
        </h1>
        <p className={styles['sa-hub__intro-body']}>
          Companion to UX spec v3.4. Aligned with the tech spec
          <em> [WIP] Session Attributes v1.0 (MVF)</em> by Devin Binnie (May 15).
          Scenarios marked <span className={styles['sa-hub__chip']}>v3.4</span> are
          new in this revision — the User Sessions modal replaces the prior
          master-detail diagnostics view; end-user denial UX and session-limit
          eviction modals are removed as scope.
        </p>
      </div>

      {GROUPS.map((group) => (
        <div key={group}>
          <div className={styles['sa-hub__section-title']}>{group}</div>
          <div className={styles['sa-hub__cards']}>
            {SCENARIOS.filter((s) => s.group === group).map((s) => (
              <a
                key={s.id}
                className={styles['sa-hub__card']}
                href={`#${s.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  setActiveId(s.id);
                }}
              >
                <div className={styles['sa-hub__card-tag-row']}>
                  <span className={styles['sa-hub__card-tag']}>{s.tag}</span>
                  {s.v34 && <span className={styles['sa-hub__chip']}>v3.4</span>}
                </div>
                <h3 className={styles['sa-hub__card-title']}>{s.title}</h3>
                <p className={styles['sa-hub__card-body']}>{s.body}</p>
              </a>
            ))}
          </div>
        </div>
      ))}

      {activeId && (
        <div
          className={styles['sa-hub__overlay']}
          onClick={(e) => {
            if (e.target === e.currentTarget) close();
          }}
        >
          <div className={styles['sa-hub__stage']}>
            <button
              type="button"
              className={styles['sa-hub__stage-close']}
              onClick={close}
              aria-label="Close scenario"
            >
              ✕
            </button>
            {renderScreen(activeId)}
          </div>
        </div>
      )}
    </div>
  );
}
