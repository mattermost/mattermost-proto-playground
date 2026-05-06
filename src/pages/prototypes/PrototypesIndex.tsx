import { Link } from 'react-router-dom';
import { PROTOTYPES } from '@/router';
import PageHero from '@/components/layout/PageHero/PageHero';
import shellStyles from '@/pages/_shell/DocShell.module.scss';
import styles from './PrototypesIndex.module.scss';

export default function PrototypesIndex() {
  return (
    <div className={shellStyles['doc-shell']}>
      <div className={shellStyles['doc-shell__top']}>
        <PageHero
          breadcrumb="Design system"
          title="Prototypes"
          description="End-to-end flow prototypes used for design exploration and review."
        />
      </div>
      <div
        className={`${shellStyles['doc-shell__body']} ${shellStyles['doc-shell__body--standalone']}`}
      >
        {PROTOTYPES.length === 0 && (
          <p className={styles['prototypes-index__empty']}>
            No prototypes registered yet. Add entries to <code>PROTOTYPES</code>{' '}
            in <code>src/router/index.tsx</code>.
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
