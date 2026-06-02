import PageHero from '@/components/layout/PageHero/PageHero';
import shellStyles from '@/pages/_shell/DocShell.module.scss';

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
        <p>Coming soon.</p>
      </div>
    </div>
  );
}
