import { lazy, Suspense, useMemo } from 'react';
import {
  Navigate,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom';
import {
  findTopic,
  type Topic,
  type TopicCategory,
} from '@/manifests/topics';
import PageHero from '@/components/layout/PageHero/PageHero';
import Tabs from '@/components/ui/Tabs/Tabs';
import OnThisPage from '@/components/layout/OnThisPage/OnThisPage';
import docStyles from '@/pages/_shell/DocPage.module.scss';
import styles from '@/pages/_shell/DocShell.module.scss';

const VALID_CATEGORIES: TopicCategory[] = [
  'foundations',
  'components',
  'patterns',
  'layouts',
];

const CATEGORY_LABELS: Record<TopicCategory, string> = {
  foundations: 'Foundations',
  components: 'Components',
  patterns: 'Patterns',
  layouts: 'Layouts',
};

type TopicView = 'guidelines' | 'specimen';

function resolveTopic(
  rawCategory: string | undefined,
  rawSlug: string | undefined,
): Topic | undefined {
  if (!rawCategory || !rawSlug) return undefined;
  if (!VALID_CATEGORIES.includes(rawCategory as TopicCategory)) return undefined;
  return findTopic(rawCategory as TopicCategory, rawSlug);
}

export default function TopicRoute() {
  const { category, slug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const topic = useMemo(() => resolveTopic(category, slug), [category, slug]);
  const view: TopicView = location.pathname.endsWith('/specimen')
    ? 'specimen'
    : 'guidelines';

  const GuidelinePage = useMemo(
    () => (topic ? lazy(topic.guidelinePage) : null),
    [topic],
  );
  const SpecimenPage = useMemo(
    () => (topic && topic.specimenPage ? lazy(topic.specimenPage) : null),
    [topic],
  );

  if (!topic || !GuidelinePage) {
    return (
      <div className={styles['doc-shell']}>
        <PageHero breadcrumb="Docs" title="Not found" />
        <div className={styles['doc-shell__body']}>
          <div className={docStyles['doc-page__prose']}>
            <p>
              No topic registered for this URL. Check{' '}
              <code>src/manifests/topics.ts</code>.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Specimen URL on a topic that has no specimen — redirect to Guidelines.
  if (view === 'specimen' && !SpecimenPage) {
    return <Navigate to={`/${topic.category}/${topic.slug}`} replace />;
  }

  const hasTabs = SpecimenPage !== null;
  const tabsBase = `/${topic.category}/${topic.slug}`;
  const fullBleed = view === 'specimen' && topic.fullBleedSpecimen;

  const handleTabChange = (key: string) => {
    navigate(key === 'specimen' ? `${tabsBase}/specimen` : tabsBase);
  };

  return (
    <div className={styles['doc-shell']}>
      <div className={styles['doc-shell__top']}>
        <PageHero
          breadcrumb={CATEGORY_LABELS[topic.category]}
          title={topic.name}
          description={topic.description}
          status={topic.status}
        />
        {hasTabs && (
          <div className={styles['doc-shell__tabs']}>
            <Tabs
              tabs={[
                { key: 'guidelines', label: 'Guidelines' },
                { key: 'specimen', label: 'Specimen' },
              ]}
              activeKey={view}
              onChange={handleTabChange}
            />
          </div>
        )}
      </div>
      {fullBleed && SpecimenPage ? (
        <Suspense fallback={null}>
          <SpecimenPage />
        </Suspense>
      ) : view === 'guidelines' ? (
        <div className={styles['doc-shell__columns']}>
          <div className={styles['doc-shell__body']} data-doc-body>
            <Suspense fallback={<p>Loading…</p>}>
              <div className={docStyles['doc-page__prose']}>
                <GuidelinePage />
              </div>
            </Suspense>
          </div>
          <aside className={styles['doc-shell__toc']}>
            <OnThisPage />
          </aside>
        </div>
      ) : (
        <div
          className={`${styles['doc-shell__body']} ${styles['doc-shell__body--standalone']}`}
        >
          <Suspense fallback={<p>Loading…</p>}>
            {SpecimenPage && <SpecimenPage />}
          </Suspense>
        </div>
      )}
    </div>
  );
}
