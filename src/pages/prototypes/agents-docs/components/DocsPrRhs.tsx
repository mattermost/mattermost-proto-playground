import { Scrollbar } from '@mattermost/compass-ui/components/scrollbar';
import styles from '../../agents/products/channels/MarkdownArtifactRhs.module.scss';

/** PR #1851 details panel — CollapsibleStep component. */
export default function DocsPrRhs() {
  return (
    <Scrollbar>
      <article className={styles['artifact-report']}>
        <header className={styles['artifact-report__header']}>
          <h1 className={styles['artifact-report__h1']}>PR #1851 — CollapsibleStep component</h1>
          <dl className={styles['artifact-report__meta']}>
            <div className={styles['artifact-report__meta-row']}>
              <dt>Repo</dt>
              <dd>mattermost/docs</dd>
            </div>
            <div className={styles['artifact-report__meta-row']}>
              <dt>Branch</dt>
              <dd>feat/collapsible-step</dd>
            </div>
            <div className={styles['artifact-report__meta-row']}>
              <dt>Status</dt>
              <dd>Open · 3 files changed</dd>
            </div>
            <div className={styles['artifact-report__meta-row']}>
              <dt>Author</dt>
              <dd>Coder (agent)</dd>
            </div>
          </dl>
        </header>

        <section className={styles['artifact-report__section']}>
          <h2 className={styles['artifact-report__h2']}>Summary</h2>
          <p className={styles['artifact-report__p']}>
            Adds a reusable <code className={styles['artifact-report__code']}>CollapsibleStep</code> React
            component to the docs component library and wires it into the SAML configuration section
            of the SSO setup page. The component renders a numbered step with an expand/collapse
            toggle so users can show or hide detailed sub-steps without leaving the page.
          </p>
        </section>

        <section className={styles['artifact-report__section']}>
          <h2 className={styles['artifact-report__h2']}>Files changed</h2>
          <ul className={styles['artifact-report__ul']}>
            <li className={styles['artifact-report__li']}>
              <code className={styles['artifact-report__code']}>src/components/CollapsibleStep/CollapsibleStep.tsx</code>
              {' '}— new component (added)
            </li>
            <li className={styles['artifact-report__li']}>
              <code className={styles['artifact-report__code']}>src/components/CollapsibleStep/CollapsibleStep.module.scss</code>
              {' '}— component styles (added)
            </li>
            <li className={styles['artifact-report__li']}>
              <code className={styles['artifact-report__code']}>content/administration/sso-setup.mdx</code>
              {' '}— wires CollapsibleStep into SAML steps 2–5 (modified)
            </li>
          </ul>
        </section>

        <section className={styles['artifact-report__section']}>
          <h2 className={styles['artifact-report__h2']}>Component API</h2>
          <p className={styles['artifact-report__p']}>
            The component accepts a <code className={styles['artifact-report__code']}>title</code> string
            (the step label shown when collapsed) and <code className={styles['artifact-report__code']}>children</code> (the
            expanded detail content). An optional <code className={styles['artifact-report__code']}>defaultOpen</code> boolean
            controls initial state.
          </p>
        </section>

        <section className={styles['artifact-report__section']}>
          <h2 className={styles['artifact-report__h2']}>Testing notes</h2>
          <p className={styles['artifact-report__p']}>
            Verified expand/collapse behaviour in Chromium and Firefox. Keyboard accessible via Enter/Space.
            No regressions on the existing SSO page layout observed in the staging preview.
          </p>
        </section>
      </article>
    </Scrollbar>
  );
}
