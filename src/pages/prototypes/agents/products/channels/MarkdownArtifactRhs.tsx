import { Scrollbar } from '@mattermost/compass-ui/components/scrollbar';
import styles from './MarkdownArtifactRhs.module.scss';

/** Full formatted root cause analysis report, rendered as structured content. */
export default function MarkdownArtifactRhs() {
  return (
    <Scrollbar>
      <article className={styles['artifact-report']}>
        <header className={styles['artifact-report__header']}>
          <h1 className={styles['artifact-report__h1']}>
            INC-4471: Root Cause Analysis
          </h1>
          <dl className={styles['artifact-report__meta']}>
            <div className={styles['artifact-report__meta-row']}>
              <dt>Incident</dt>
              <dd>PayForge Webhook Error Spike</dd>
            </div>
            <div className={styles['artifact-report__meta-row']}>
              <dt>Severity</dt>
              <dd>P1 — Active</dd>
            </div>
            <div className={styles['artifact-report__meta-row']}>
              <dt>Opened</dt>
              <dd>Today, 2:14 PM</dd>
            </div>
            <div className={styles['artifact-report__meta-row']}>
              <dt>Generated</dt>
              <dd>Today, 2:18 PM by Cipher</dd>
            </div>
          </dl>
        </header>

        <section className={styles['artifact-report__section']}>
          <h2 className={styles['artifact-report__h2']}>Summary</h2>
          <p className={styles['artifact-report__p']}>
            Starting at 2:13 PM, the PayForge webhook error rate climbed to 5.2%, exceeding
            the 5.0% alert threshold. The onset correlates exactly with the deployment of{' '}
            <strong>build 8842</strong> at 2:13 PM. Analysis of 847 error traces confirms a
            single root cause affecting all retry paths.
          </p>
        </section>

        <section className={styles['artifact-report__section']}>
          <h2 className={styles['artifact-report__h2']}>Findings</h2>

          <h3 className={styles['artifact-report__h3']}>Error Distribution</h3>
          <ul className={styles['artifact-report__ul']}>
            <li className={styles['artifact-report__li']}>
              <strong>Total errors:</strong> 847 (window: 2:13 PM – 2:18 PM)
            </li>
            <li className={styles['artifact-report__li']}>
              <strong>Error type:</strong> HTTP 401 Unauthorized (100% of spike)
            </li>
            <li className={styles['artifact-report__li']}>
              <strong>Baseline error rate:</strong> 0.3% (pre-deployment)
            </li>
            <li className={styles['artifact-report__li']}>
              <strong>Spike error rate:</strong> 5.2% (post-deployment)
            </li>
          </ul>

          <h3 className={styles['artifact-report__h3']}>Root Cause</h3>
          <p className={styles['artifact-report__p']}>
            The <code className={styles['artifact-report__code']}>WebhookClient.sendWithRetry</code>{' '}
            method strips all request headers on HTTP redirect. When PayForge returns a{' '}
            <code className={styles['artifact-report__code']}>302 Found</code> to its auth
            endpoint, the retry sends the request without the{' '}
            <code className={styles['artifact-report__code']}>Authorization</code> header,
            causing the downstream payment gateway to reject the call with a 401.
          </p>
          <ul className={styles['artifact-report__ul']}>
            <li className={styles['artifact-report__li']}>
              <strong>Affected code path:</strong>{' '}
              <code className={styles['artifact-report__code']}>WebhookClient.sendWithRetry</code>{' '}
              →{' '}
              <code className={styles['artifact-report__code']}>HttpClient.redirect</code>{' '}
              → [headers dropped]
            </li>
            <li className={styles['artifact-report__li']}>
              <strong>Change in build 8842:</strong> A refactor of the redirect-follow logic
              introduced a{' '}
              <code className={styles['artifact-report__code']}>new Request(url)</code> call
              that does not clone original headers, resetting them to empty.
            </li>
          </ul>

          <h3 className={styles['artifact-report__h3']}>Impact</h3>
          <ul className={styles['artifact-report__ul']}>
            <li className={styles['artifact-report__li']}>
              Every webhook retry since 2:13 PM has resulted in a failed transaction
            </li>
            <li className={styles['artifact-report__li']}>
              Checkout failures scale with retry volume — currently ~12 retries/minute
            </li>
            <li className={styles['artifact-report__li']}>
              No data loss — events are queued and can be replayed after the fix
            </li>
          </ul>
        </section>

        <section className={styles['artifact-report__section']}>
          <h2 className={styles['artifact-report__h2']}>Recommendation</h2>
          <p className={styles['artifact-report__p']}>
            Restore header propagation in{' '}
            <code className={styles['artifact-report__code']}>WebhookClient.sendWithRetry</code>.
            Ensure the <code className={styles['artifact-report__code']}>Authorization</code>{' '}
            header and all original request headers are forwarded when following redirects.
            Clone the original request headers onto the redirected request before sending.
          </p>

          <h3 className={styles['artifact-report__h3']}>Next Steps</h3>
          <ol className={styles['artifact-report__ol']}>
            <li className={styles['artifact-report__li']}>
              Apply the fix in{' '}
              <code className={styles['artifact-report__code']}>WebhookClient.sendWithRetry</code>
            </li>
            <li className={styles['artifact-report__li']}>
              Deploy to production — estimated 15 minutes
            </li>
            <li className={styles['artifact-report__li']}>
              Monitor error rate for recovery to baseline (&lt; 0.5%)
            </li>
            <li className={styles['artifact-report__li']}>
              Replay queued webhook events once fix is confirmed live
            </li>
          </ol>
        </section>

        <section className={styles['artifact-report__section']}>
          <h2 className={styles['artifact-report__h2']}>References</h2>
          <ul className={styles['artifact-report__ul']}>
            <li className={styles['artifact-report__li']}>Build 8842 deployment log</li>
            <li className={styles['artifact-report__li']}>
              PayForge webhook error traces (847 samples)
            </li>
            <li className={styles['artifact-report__li']}>HTTP 401 timeline graph</li>
          </ul>
        </section>
      </article>
    </Scrollbar>
  );
}
