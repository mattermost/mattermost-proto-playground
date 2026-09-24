import { Scrollbar } from '@mattermost/compass-ui/components/scrollbar';
import styles from '../../agents/products/channels/MarkdownArtifactRhs.module.scss';

type DocsArtifactRhsProps = {
  title: string;
  approved?: boolean;
};

/** Rendered SSO setup page content — the final revised version. */
export default function DocsArtifactRhs({ title, approved }: DocsArtifactRhsProps) {
  return (
    <Scrollbar>
      <article className={styles['artifact-report']}>
        <header className={styles['artifact-report__header']}>
          <h1 className={styles['artifact-report__h1']}>{title}</h1>
          <dl className={styles['artifact-report__meta']}>
            <div className={styles['artifact-report__meta-row']}>
              <dt>Page</dt>
              <dd>docs.mattermost.com/administration/sso-setup</dd>
            </div>
            <div className={styles['artifact-report__meta-row']}>
              <dt>Status</dt>
              <dd className={approved ? styles['artifact-report__status--approved'] : undefined}>
                {approved ? 'Approved' : 'Draft — pending approval'}
              </dd>
            </div>
            <div className={styles['artifact-report__meta-row']}>
              <dt>Updated</dt>
              <dd>Today, 10:08 AM by Writer + Reviewer</dd>
            </div>
          </dl>
        </header>

        <section className={styles['artifact-report__section']}>
          <h2 className={styles['artifact-report__h2']}>Overview</h2>
          <p className={styles['artifact-report__p']}>
            Mattermost supports Single Sign-On (SSO) via SAML 2.0 and OAuth 2.0. Use this
            guide to connect your identity provider (IdP) and enable SSO for your workspace.
          </p>
        </section>

        <section className={styles['artifact-report__section']}>
          <h2 className={styles['artifact-report__h2']}>Prerequisites</h2>
          <ul className={styles['artifact-report__ul']}>
            <li className={styles['artifact-report__li']}>
              Mattermost v9.0 or later with E20 license
            </li>
            <li className={styles['artifact-report__li']}>
              Admin access to your IdP (Okta, Azure AD, OneLogin, or similar)
            </li>
            <li className={styles['artifact-report__li']}>
              System Admin role in Mattermost
            </li>
          </ul>
        </section>

        <section className={styles['artifact-report__section']}>
          <h2 className={styles['artifact-report__h2']}>Configure SAML 2.0</h2>

          <h3 className={styles['artifact-report__h3']}>1. Retrieve your IdP metadata URL</h3>
          <p className={styles['artifact-report__p']}>
            In your IdP admin console, locate the SAML metadata URL for your Mattermost
            application. Copy the full URL — you'll paste it into Mattermost in the next step.
          </p>

          <h3 className={styles['artifact-report__h3']}>2. Enter metadata in Mattermost</h3>
          <p className={styles['artifact-report__p']}>
            Go to <strong>System Console → Authentication → SAML 2.0</strong>. In the{' '}
            <strong>Identity Provider Metadata URL</strong> field, paste your IdP metadata URL.
            Mattermost will fetch the certificate and endpoint configuration automatically.
          </p>

          <h3 className={styles['artifact-report__h3']}>3. Enable IdP-initiated login</h3>
          <p className={styles['artifact-report__p']}>
            Toggle <strong>Enable IdP-initiated SSO</strong> to <strong>On</strong>. When
            enabled, users can log in directly from your IdP portal without visiting the
            Mattermost login page first.
          </p>
          <p className={styles['artifact-report__p']}>
            <strong>Note:</strong> The relay state step described in older versions of this
            guide no longer applies. IdP-initiated login now proceeds directly to the
            assertion consumer service (ACS) endpoint.
          </p>

          <h3 className={styles['artifact-report__h3']}>4. Map user attributes</h3>
          <p className={styles['artifact-report__p']}>
            Configure attribute mappings to match your IdP's attribute names:
          </p>
          <ul className={styles['artifact-report__ul']}>
            <li className={styles['artifact-report__li']}>
              <strong>Email attribute:</strong>{' '}
              <code className={styles['artifact-report__code']}>email</code> (or your IdP's equivalent)
            </li>
            <li className={styles['artifact-report__li']}>
              <strong>Username attribute:</strong>{' '}
              <code className={styles['artifact-report__code']}>username</code>
            </li>
            <li className={styles['artifact-report__li']}>
              <strong>First name attribute:</strong>{' '}
              <code className={styles['artifact-report__code']}>firstName</code>
            </li>
            <li className={styles['artifact-report__li']}>
              <strong>Last name attribute:</strong>{' '}
              <code className={styles['artifact-report__code']}>lastName</code>
            </li>
          </ul>

          <h3 className={styles['artifact-report__h3']}>5. Save and test</h3>
          <p className={styles['artifact-report__p']}>
            Click <strong>Save</strong>, then use the <strong>Test Configuration</strong> button
            to verify the connection. A successful test confirms your IdP certificate and
            attribute mappings are correct.
          </p>
        </section>

        <section className={styles['artifact-report__section']}>
          <h2 className={styles['artifact-report__h2']}>Configure OAuth 2.0</h2>
          <p className={styles['artifact-report__p']}>
            OAuth 2.0 configuration is unchanged. Follow the existing OAuth guide for your
            provider (Google, GitLab, Office 365, or a custom provider).
          </p>
          <ol className={styles['artifact-report__ol']}>
            <li className={styles['artifact-report__li']}>
              Register Mattermost as an OAuth application in your provider's console
            </li>
            <li className={styles['artifact-report__li']}>
              Copy the client ID and client secret into{' '}
              <strong>System Console → Authentication → OAuth 2.0</strong>
            </li>
            <li className={styles['artifact-report__li']}>
              Set the redirect URI to{' '}
              <code className={styles['artifact-report__code']}>
                https://your-mattermost-domain/login/oauth2/callback
              </code>
            </li>
          </ol>
        </section>

        <section className={styles['artifact-report__section']}>
          <h2 className={styles['artifact-report__h2']}>Verify your setup</h2>
          <p className={styles['artifact-report__p']}>
            After saving, open a private browser window and attempt to log in via SSO. If login
            fails, check the Mattermost server logs at{' '}
            <code className={styles['artifact-report__code']}>mattermost.log</code> for SAML
            assertion errors or attribute mapping issues.
          </p>
        </section>
      </article>
    </Scrollbar>
  );
}
