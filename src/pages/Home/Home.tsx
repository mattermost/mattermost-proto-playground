import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './Home.module.scss';

const IFRAME_W = 1280;

const DESTINATIONS = [
  {
    label: 'Guidelines',
    path: '/guidelines',
    description: 'Written documentation for the design system.',
  },
  {
    label: 'Library',
    path: '/library',
    description:
      'Live reference for tokens, components, patterns, and layouts.',
  },
  {
    label: 'Prototypes',
    path: '/prototypes',
    description: 'End-to-end flow prototypes for design exploration.',
  },
];

function CardThumbnail({ src }: { src: string }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setScale(entry.contentRect.width / IFRAME_W);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={wrapperRef}
      className={styles['home__card-thumb']}
      aria-hidden="true"
    >
      <iframe
        className={styles['home__card-iframe']}
        src={src}
        title="Section preview"
        tabIndex={-1}
        aria-hidden="true"
        scrolling="no"
        style={{ transform: `scale(${scale})` }}
      />
    </div>
  );
}

export default function Home() {
  return (
    <div className={styles.home}>
      <header className={styles['home__header']}>
        <h1 className={styles['home__heading']}>Mattermost Design System</h1>
        <p className={styles['home__subheading']}>
          Guidelines, library, and prototypes — all in one place.
        </p>
      </header>

      <div className={styles['home__grid']}>
        {DESTINATIONS.map((d) => (
          <Link key={d.path} to={d.path} className={styles['home__card']}>
            <CardThumbnail src={d.path} />
            <div className={styles['home__card-body']}>
              <span className={styles['home__card-label']}>{d.label}</span>
              <span className={styles['home__card-arrow']}>→</span>
            </div>
            <p className={styles['home__card-desc']}>{d.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
