import { Scrollbar } from '@mattermost/compass-ui/components/scrollbar';
import styles from '../../agents/products/channels/MarkdownArtifactRhs.module.scss';

export default function DocsRootCauseRhs() {
  return (
    <Scrollbar>
      <article className={styles['artifact-report']}>
        <header className={styles['artifact-report__header']}>
          <h1 className={styles['artifact-report__h1']}>INC-4472: Root Cause Analysis</h1>
          <dl className={styles['artifact-report__meta']}>
            <div className={styles['artifact-report__meta-row']}>
              <dt>Incident</dt>
              <dd>Docs site outage — docs.mattermost.com</dd>
            </div>
            <div className={styles['artifact-report__meta-row']}>
              <dt>Severity</dt>
              <dd>SEV-2 — Active</dd>
            </div>
            <div className={styles['artifact-report__meta-row']}>
              <dt>Opened</dt>
              <dd>Today, 3:14 AM</dd>
            </div>
            <div className={styles['artifact-report__meta-row']}>
              <dt>Generated</dt>
              <dd>Today, 3:15 AM by Coder</dd>
            </div>
          </dl>
        </header>

        <section className={styles['artifact-report__section']}>
          <h2 className={styles['artifact-report__h2']}>Summary</h2>
          <p className={styles['artifact-report__p']}>
            Starting at 3:09 AM, a CDN cache purge triggered by the infrastructure
            deploy began serving stale{' '}
            <code className={styles['artifact-report__code']}>503 Service Unavailable</code>{' '}
            responses for all static assets on docs.mattermost.com. The outage onset
            correlates exactly with the deploy timestamp. No backend nodes are affected —
            the issue is isolated to the CDN edge layer.
          </p>
        </section>

        <section className={styles['artifact-report__section']}>
          <h2 className={styles['artifact-report__h2']}>Findings</h2>

          <h3 className={styles['artifact-report__h3']}>Error Distribution</h3>
          <ul className={styles['artifact-report__ul']}>
            <li className={styles['artifact-report__li']}>
              <strong>Error type:</strong> HTTP 503 Service Unavailable (100% of requests)
            </li>
            <li className={styles['artifact-report__li']}>
              <strong>Affected assets:</strong> All static files — JS, CSS, images, fonts
            </li>
            <li className={styles['artifact-report__li']}>
              <strong>Onset:</strong> 3:09 AM — coincides with infrastructure deploy
            </li>
            <li className={styles['artifact-report__li']}>
              <strong>Backend health:</strong> Origin servers returning 200; issue is edge-only
            </li>
          </ul>

          <h3 className={styles['artifact-report__h3']}>Root Cause</h3>
          <p className={styles['artifact-report__p']}>
            The 3:09 AM deploy included a CDN cache purge that invalidated all edge-cached
            assets. The purge configuration contained an incorrect origin fallback rule —
            instead of re-fetching from the origin on a cache miss, the CDN returned a
            cached{' '}
            <code className={styles['artifact-report__code']}>503</code> error page that
            had been stored during a prior maintenance window. All subsequent requests
            received the stale error response.
          </p>
          <ul className={styles['artifact-report__ul']}>
            <li className={styles['artifact-report__li']}>
              <strong>Trigger:</strong> CDN cache purge in deploy at 3:09 AM
            </li>
            <li className={styles['artifact-report__li']}>
              <strong>Mechanism:</strong> Stale 503 error page served from edge cache on miss
            </li>
            <li className={styles['artifact-report__li']}>
              <strong>Config change:</strong>{' '}
              <code className={styles['artifact-report__code']}>cloudflare/purge-config.yaml</code>{' '}
              — origin fallback rule set to{' '}
              <code className={styles['artifact-report__code']}>cache_on_error: true</code>
            </li>
          </ul>

          <h3 className={styles['artifact-report__h3']}>Impact</h3>
          <ul className={styles['artifact-report__ul']}>
            <li className={styles['artifact-report__li']}>
              docs.mattermost.com fully unavailable for all visitors since 3:09 AM
            </li>
            <li className={styles['artifact-report__li']}>
              API subdomain (api.mattermost.com) unaffected — different CDN config
            </li>
            <li className={styles['artifact-report__li']}>
              No data loss — content and backend are intact
            </li>
          </ul>
        </section>

        <section className={styles['artifact-report__section']}>
          <h2 className={styles['artifact-report__h2']}>Recommendation</h2>
          <p className={styles['artifact-report__p']}>
            Roll back the CDN purge configuration to the pre-deploy state. Set{' '}
            <code className={styles['artifact-report__code']}>cache_on_error: false</code>{' '}
            so that cache misses fall through to the origin. Clear the stale 503 error
            page from all edge nodes before re-enabling the purge rule.
          </p>

          <h3 className={styles['artifact-report__h3']}>Next Steps</h3>
          <ol className={styles['artifact-report__ol']}>
            <li className={styles['artifact-report__li']}>
              Revert{' '}
              <code className={styles['artifact-report__code']}>cloudflare/purge-config.yaml</code>{' '}
              to pre-deploy state
            </li>
            <li className={styles['artifact-report__li']}>
              Flush all edge nodes — estimated 5 minutes
            </li>
            <li className={styles['artifact-report__li']}>
              Verify docs.mattermost.com returns 200 on all major paths
            </li>
            <li className={styles['artifact-report__li']}>
              Run Monitor&apos;s full health sweep across all subpaths
            </li>
          </ol>
        </section>

        <section className={styles['artifact-report__section']}>
          <h2 className={styles['artifact-report__h2']}>References</h2>
          <ul className={styles['artifact-report__ul']}>
            <li className={styles['artifact-report__li']}>3:09 AM deploy log — infrastructure pipeline</li>
            <li className={styles['artifact-report__li']}>Cloudflare edge error rate graph (3:09–3:15 AM)</li>
            <li className={styles['artifact-report__li']}>Origin health check logs — all green</li>
          </ul>
        </section>
      </article>
    </Scrollbar>
  );
}
