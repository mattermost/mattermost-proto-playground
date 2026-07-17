import type { ComponentType, SVGProps } from 'react';
import { Link } from 'react-router-dom';
import { Illustration } from '@mattermost/compass-ui';
import { btnStyles } from '@mattermost/compass-ui';
import LayoutPreview from '@/guidelines/_components/LayoutPreview';
import FoundationsCardArt from '@/assets/home/card-foundations.svg?react';
import ComponentsCardArt from '@/assets/home/card-components.svg?react';
import LayoutsCardArt from '@/assets/home/card-layouts.svg?react';
import PatternsDocumentCardArt from '@/assets/home/card-resources.svg?react';
import { categoryFirstTopicPath } from '@/manifests/categoryFirstTopicPath';
import styles from './Home.module.scss';

type CardSvg = ComponentType<SVGProps<SVGSVGElement>>;

const DESTINATIONS: {
  label: string;
  path: string;
  description: string;
  Illustration: CardSvg;
}[] = [
  {
    label: 'Foundations',
    path: '/foundations',
    description: 'Color, typography, spacing, and the rest of the system base.',
    Illustration: FoundationsCardArt,
  },
  {
    label: 'Components',
    path: categoryFirstTopicPath('components'),
    description: 'Reusable building blocks that make up the interface.',
    Illustration: ComponentsCardArt,
  },
  {
    label: 'Patterns',
    path: categoryFirstTopicPath('patterns'),
    description: 'Larger compositions that solve common product problems.',
    Illustration: PatternsDocumentCardArt,
  },
  {
    label: 'Layouts',
    path: categoryFirstTopicPath('layouts'),
    description: 'Complete screens—sidebars, headers, and primary content working together.',
    Illustration: LayoutsCardArt,
  },
];

export default function Home() {
  return (
    <div className={styles.home}>
      <section className={styles['home__hero']} aria-labelledby="home-hero-heading">
        <div className={styles['home__hero-inner']}>
          <div className={styles['home__hero-main']}>
            <div className={styles['home__hero-copy']}>
              <div className={styles['home__hero-head']}>
                <p className={styles['home__hero-eyebrow']}>COMPASS</p>
                <h1 id="home-hero-heading" className={styles['home__hero-title']}>
                  Explore the Mattermost Design System
                </h1>
              </div>
              <p className={styles['home__hero-lede']}>
                Compass is the source of truth for styles, components, and patterns
                in the Mattermost platform — built for teams who need data control,
                speed, and clarity under pressure.
              </p>
              <div className={styles['home__hero-ctas']}>
                <Link
                  to="/foundations/why-compass"
                  className={[
                    btnStyles.button,
                    btnStyles['button--emphasis-primary'],
                    btnStyles['button--size-large'],
                  ].join(' ')}
                >
                  <span className={btnStyles.button__label}>Get started</span>
                </Link>
                <Link
                  to={categoryFirstTopicPath('components')}
                  className={styles['home__hero-cta-secondary']}
                >
                  Browse components
                </Link>
              </div>
            </div>
            <div className={styles['home__hero-visual']} aria-hidden>
              <div className={styles['home__hero-layout']}>
                <LayoutPreview />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className={styles['home__body']}>
        <div className={styles['home__grid']}>
          {DESTINATIONS.map((d) => (
            <Link key={d.path} to={d.path} className={styles['home__card']}>
              <div className={styles['home__card-art']} aria-hidden="true">
                <Illustration className={styles['home__card-illustration']}>
                  <d.Illustration />
                </Illustration>
              </div>
              <div className={styles['home__card-body']}>
                <span className={styles['home__card-label']}>{d.label}</span>
                <span className={styles['home__card-arrow']}>→</span>
              </div>
              <p className={styles['home__card-desc']}>{d.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
