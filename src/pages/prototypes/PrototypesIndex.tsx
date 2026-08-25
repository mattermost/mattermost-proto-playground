import { Link } from 'react-router-dom';
import { PROTOTYPES } from '@/manifests/prototypes';
import PageHero from '@/components/layout/PageHero/PageHero';
import styles from './PrototypesIndex.module.scss';

const COMPASS_DESIGN_URL = 'https://mattermost.github.io/compass-design/';

export default function PrototypesIndex() {
  return (
    <div className={styles['prototypes-index']}>
      <PageHero
        breadcrumb="Internal catalog"
        title="Prototypes"
        description={
          <>
            Multi-scene Compass flow prototypes for design exploration and review. Component
            guidelines and Storybook live in the{' '}
            <a href={COMPASS_DESIGN_URL} target="_blank" rel="noreferrer">
              Compass design system
            </a>
            .
          </>
        }
      />

      <div className={styles['prototypes-index__body']}>
        {PROTOTYPES.length === 0 && (
          <p className={styles['prototypes-index__empty']}>
            No prototypes registered yet. Add entries to <code>PROTOTYPES</code> in{' '}
            <code>src/manifests/prototypes.ts</code>.
          </p>
        )}

        <ul className={styles['prototypes-index__list']}>
          {PROTOTYPES.map((p) => (
            <li key={p.id}>
              <Link to={p.path}>{p.label}</Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
