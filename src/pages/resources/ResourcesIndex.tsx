import DocPage from '@/pages/_shell/DocPage';
import PageHero from '@/components/layout/PageHero/PageHero';

export default function ResourcesIndex() {
  return (
    <DocPage
      hero={
        <PageHero
          breadcrumb="Design system"
          title="Resources"
          description="External links, downloads, and reference material."
        />
      }
    >
      <p>Coming soon.</p>
    </DocPage>
  );
}
