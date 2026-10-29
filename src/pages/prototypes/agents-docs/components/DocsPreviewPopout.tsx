import styles from './DocsPreviewPopout.module.scss';

const s = styles;

// ── Sidebar nav tree ─────────────────────────────────────────────────────────

type NavNode = {
  text: string;
  depth?: number;
  active?: boolean;
  expanded?: boolean;
  hasChildren?: boolean;
};

const NAV: NavNode[] = [
  { text: 'Overview', depth: 0 },
  { text: 'Use Case Guide', depth: 0, hasChildren: true },
  { text: 'Deployment Guide', depth: 0, hasChildren: true },
  { text: 'Administration Guide', depth: 0, expanded: true, hasChildren: true },
  { text: 'Configure', depth: 1, hasChildren: true },
  { text: 'Onboard users', depth: 1, expanded: true, hasChildren: true },
  { text: 'Single sign-on', depth: 2, expanded: true, hasChildren: true },
  { text: 'SAML', depth: 3, active: true },
  { text: 'OpenID Connect SSO', depth: 3 },
  { text: 'Google SSO', depth: 3 },
  { text: 'GitLab SSO', depth: 3 },
  { text: 'Entra ID SSO', depth: 3 },
  { text: 'AD/LDAP', depth: 2 },
  { text: 'Multi-factor authentication', depth: 2 },
  { text: 'Guest accounts', depth: 2 },
  { text: 'Manage', depth: 1, hasChildren: true },
  { text: 'Monitor and troubleshoot', depth: 1, hasChildren: true },
  { text: 'Security Guide', depth: 0, hasChildren: true },
  { text: 'End User Guide', depth: 0, hasChildren: true },
  { text: 'Integrations Guide', depth: 0, hasChildren: true },
];

const TOC = [
  { label: 'Using SAML attributes to apply roles', active: false },
  { label: 'Username attribute', active: false },
  { label: 'Guest attribute', active: true },
  { label: 'Admin attribute', active: false },
  { label: 'Configuration assistance', active: false },
];

const DEPTH_CLASS: Record<number, string> = {
  0: '',
  1: s['docs-popout__sidebar-item--indent-1'],
  2: s['docs-popout__sidebar-item--indent-2'],
  3: s['docs-popout__sidebar-item--indent-3'],
};

// ── Component ────────────────────────────────────────────────────────────────

export default function DocsPreviewPopout() {
  return (
    <div className={s['docs-popout']}>

      {/* ── Staging notice (very top) ───────────────────────── */}
      <div className={s['docs-popout__staging-notice']}>
        <span>⚠</span>
        Staging preview — this version has not been published to the live site.
      </div>

      {/* ── Site header ────────────────────────────────────── */}
      <header className={s['docs-popout__header']}>
        <div className={s['docs-popout__logo']}>
          <span className={s['docs-popout__logo-wordmark']}>Mattermost</span>
          <span className={s['docs-popout__logo-sep']}>/</span>
          <span className={s['docs-popout__logo-docs']}>Docs</span>
        </div>
        <nav className={s['docs-popout__header-nav']}>
          <span className={s['docs-popout__header-link']}>Documentation</span>
          <span className={s['docs-popout__header-link']}>Developers</span>
          <span className={s['docs-popout__header-link']}>API</span>
        </nav>
        <div className={s['docs-popout__header-search']}>
          <span className={s['docs-popout__search-icon']}>⌕</span>
          <span className={s['docs-popout__search-text']}>Search</span>
          <span className={s['docs-popout__search-kbd']}>⌘K</span>
        </div>
      </header>

      {/* ── Body ───────────────────────────────────────────── */}
      <div className={s['docs-popout__body']}>

        {/* Left sidebar */}
        <nav className={s['docs-popout__sidebar']}>
          {NAV.map((node, i) => {
            const depth = node.depth ?? 0;
            const cls = [
              s['docs-popout__sidebar-item'],
              DEPTH_CLASS[depth] ?? '',
              node.active ? s['docs-popout__sidebar-item--active'] : '',
              !node.active && (node.expanded || node.hasChildren)
                ? s['docs-popout__sidebar-item--parent']
                : '',
            ].filter(Boolean).join(' ');
            return (
              <button key={i} type="button" className={cls}>
                {node.active && (
                  <span className={`${s['docs-popout__sidebar-dot']} ${s['docs-popout__sidebar-dot--active']}`} />
                )}
                {!node.active && node.hasChildren && (
                  <span className={s['docs-popout__sidebar-chevron']}>
                    {node.expanded ? '▾' : '▸'}
                  </span>
                )}
                {!node.active && !node.hasChildren && depth >= 3 && (
                  <span className={s['docs-popout__sidebar-dot']} />
                )}
                {node.text}
              </button>
            );
          })}
        </nav>

        {/* Main article */}
        <main className={s['docs-popout__main']}>
          <div className={s['docs-popout__breadcrumb']}>
            <span className={s['docs-popout__breadcrumb-link']}>Administration Guide</span>
            <span className={s['docs-popout__breadcrumb-sep']}>›</span>
            <span className={s['docs-popout__breadcrumb-link']}>Onboard users</span>
            <span className={s['docs-popout__breadcrumb-sep']}>›</span>
            <span className={s['docs-popout__breadcrumb-link']}>Single sign-on</span>
            <span className={s['docs-popout__breadcrumb-sep']}>›</span>
            <span className={s['docs-popout__breadcrumb-current']}>SAML</span>
          </div>

          <div className={s['docs-popout__plan-badge']}>
            Available on Entry, Professional, Enterprise, and Enterprise Advanced plans
          </div>

          <h1 className={s['docs-popout__article-title']}>SAML Single Sign-On</h1>

          <p className={s['docs-popout__p']}>
            SAML enables identity providers to pass credentials to service providers. Mattermost
            functions as a SAML 2.0 Service Provider and officially supports{' '}
            <strong>Okta</strong>, <strong>OneLogin</strong>, and{' '}
            <strong>Microsoft ADFS</strong> as identity providers.
          </p>
          <p className={s['docs-popout__p']}>
            Additional supported custom IdPs include miniOrange, Azure AD, DUO, PingFederate,
            Keycloak, and SimpleSAMLphp. Testing new versions in staging environments is
            recommended due to lack of official support testing.
          </p>

          <p className={s['docs-popout__p']}><strong>Key benefits</strong></p>
          <ul className={s['docs-popout__ul']}>
            <li className={s['docs-popout__li']}>Single sign-on with SAML credentials</li>
            <li className={s['docs-popout__li']}>Centralized identity management with automatic attribute sync</li>
            <li className={s['docs-popout__li']}>Automatic account provisioning on first sign-in</li>
            <li className={s['docs-popout__li']}>Sync groups to predefined roles via LDAP Group Sync</li>
            <li className={s['docs-popout__li']}>Compliance alignment through administrator management</li>
          </ul>

          <div className={s['docs-popout__warning']}>
            <span className={s['docs-popout__warning-label']}>Important: </span>
            SAML Single Sign-On itself does not support periodic updates of user attributes nor
            automatic deprovisioning. However, SAML with AD/LDAP sync can be configured to
            support these use cases.
          </div>

          <hr className={s['docs-popout__article-divider']} />

          {/* Using SAML attributes */}
          <h2 className={s['docs-popout__h2']}>Using SAML attributes to apply roles</h2>

          {/* Username attribute */}
          <h3 className={s['docs-popout__h3']}>Username attribute</h3>
          <p className={s['docs-popout__p']}>
            An optional SAML assertion filter for user searches. Users log in with their
            organizational credentials.
          </p>
          <ol className={s['docs-popout__ol']}>
            <li className={s['docs-popout__li']}>
              Navigate to <strong>System Console {'>'} Authentication {'>'} SAML 2.0</strong>.
            </li>
            <li className={s['docs-popout__li']}>Complete the <strong>Username Attribute</strong> field.</li>
            <li className={s['docs-popout__li']}>Choose <strong>Save</strong>.</li>
          </ol>

          {/* Guest attribute */}
          <h3 className={s['docs-popout__h3']}>Guest attribute</h3>
          <p className={s['docs-popout__p']}>
            Identifies external SAML users as guests with immediate guest role assignment.
            Guests demoted in SAML aren't auto-promoted; member users gaining the guest
            attribute are auto-demoted.
          </p>
          <ol className={s['docs-popout__ol']}>
            <li className={s['docs-popout__li']}>
              Enable Guest Access via <strong>System Console {'>'} SAML 2.0</strong>.
            </li>
            <li className={s['docs-popout__li']}>
              Navigate to <strong>System Console {'>'} Authentication {'>'} SAML 2.0</strong>.
            </li>
            <li className={s['docs-popout__li']}>Complete the <strong>Guest Attribute</strong> field.</li>
            <li className={s['docs-popout__li']}>Choose <strong>Save</strong>.</li>
          </ol>

          {/* Admin attribute */}
          <h3 className={s['docs-popout__h3']}>Admin attribute</h3>
          <p className={s['docs-popout__p']}>
            Optional designation of system admins via SAML assertion. Members identified as
            admins become admins on next login.
          </p>
          <ol className={s['docs-popout__ol']}>
            <li className={s['docs-popout__li']}>
              Navigate to <strong>System Console {'>'} Authentication {'>'} SAML 2.0</strong>.
            </li>
            <li className={s['docs-popout__li']}>
              Set <strong>Enable Admin Attribute</strong> to{' '}
              <code className={s['docs-popout__code']}>true</code>.
            </li>
            <li className={s['docs-popout__li']}>Complete the <strong>Admin Attribute</strong> field.</li>
            <li className={s['docs-popout__li']}>Choose <strong>Save</strong>.</li>
          </ol>
          <div className={s['docs-popout__note']}>
            <span className={s['docs-popout__note-label']}>Note: </span>
            If the <code className={s['docs-popout__code']}>admin</code> attribute is set to{' '}
            <code className={s['docs-popout__code']}>false</code>, the member's role as system
            admin is retained. Removing or changing the attribute demotes previously promoted
            admins. Manual demotion in{' '}
            <strong>System Console {'>'} User Management</strong> is recommended for immediate
            access restriction.
          </div>

          {/* Configuration assistance */}
          <h2 className={s['docs-popout__h2']}>Configuration assistance</h2>
          <p className={s['docs-popout__p']}>
            Mattermost provides technical configuration guidance for custom IdP setup but cannot
            guarantee functionality. Testing with new IdP versions is required before production
            deployment.
          </p>
          <p className={s['docs-popout__p']}>
            For providers not officially supported, refer to the feature idea portal to request
            official support testing, or consult the community documentation for your specific
            IdP.
          </p>

          {/* Article footer */}
          <div className={s['docs-popout__article-footer']}>
            <span className={s['docs-popout__edit-link']}>✏ Edit this page</span>
            <div className={s['docs-popout__prev-next']}>
              <span className={s['docs-popout__nav-arrow']}>← Single sign-on overview</span>
              <span className={s['docs-popout__nav-arrow']}>OpenID Connect SSO →</span>
            </div>
          </div>
        </main>

        {/* Right TOC */}
        <aside className={s['docs-popout__toc']}>
          <p className={s['docs-popout__toc-heading']}>On this page</p>
          <ul className={s['docs-popout__toc-list']}>
            {TOC.map((item) => (
              <li key={item.label}>
                <span
                  className={[
                    s['docs-popout__toc-link'],
                    item.active ? s['docs-popout__toc-link--active'] : '',
                  ].filter(Boolean).join(' ')}
                >
                  {item.label}
                </span>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  );
}
