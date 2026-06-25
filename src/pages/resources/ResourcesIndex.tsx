import PageHero from '@/components/layout/PageHero/PageHero';
import shellStyles from '@/pages/_shell/DocShell.module.scss';

const PROTOTYPES_CATALOG_URL =
  'https://mattermost.github.io/mattermost-proto-playground/prototypes';

export default function ResourcesIndex() {
  return (
    <div className={shellStyles['doc-shell']}>
      <div className={shellStyles['doc-shell__top']}>
        <PageHero
          breadcrumb="Design system"
          title="Resources"
          description="External links, downloads, and reference material."
        />
      </div>
      <div
        className={`${shellStyles['doc-shell__body']} ${shellStyles['doc-shell__body--standalone']}`}
      >
        <section>
          <h2>Prototypes catalog</h2>
          <p>
            Flow experiments and interactive prototypes live in a separate
            catalog — not in these guidelines.
          </p>
          <p>
            <a href={PROTOTYPES_CATALOG_URL} target="_blank" rel="noreferrer">
              Browse the prototypes catalog
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
