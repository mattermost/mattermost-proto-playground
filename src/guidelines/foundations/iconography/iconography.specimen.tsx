import { lazy, Suspense } from 'react';
import type { LazyExoticComponent } from 'react';
import {
  COMPASS_ICON_LOADERS,
  type CompassSvgIcon,
} from './compassIconImports.generated';
import styles from '@/styles/library-demo/foundations.module.scss';

const lazyIconByGlyph = new Map<string, LazyExoticComponent<CompassSvgIcon>>();

for (const [glyph, loader] of Object.entries(COMPASS_ICON_LOADERS)) {
  lazyIconByGlyph.set(glyph, lazy(loader));
}

const SORTED_GLYPHS = [...lazyIconByGlyph.keys()].sort((a, b) =>
  a.localeCompare(b),
);

export function IconographyGridContent() {
  if (SORTED_GLYPHS.length === 0) {
    return <p>No icons could be loaded from the Compass Icons package.</p>;
  }

  return (
    <Suspense fallback={<p>Loading icons…</p>}>
      <div className={styles['foundations__icon-library']}>
        <div className={styles['foundations__icon-grid']}>
          {SORTED_GLYPHS.map((glyph) => {
            const LazyIcon = lazyIconByGlyph.get(glyph);
            if (!LazyIcon) return null;
            return (
              <div key={glyph} className={styles['foundations__icon-cell']}>
                <span
                  className={styles['foundations__icon-preview']}
                  aria-hidden
                >
                  <LazyIcon size={24} />
                </span>
                <span className={styles['foundations__icon-token']}>{glyph}</span>
              </div>
            );
          })}
        </div>
      </div>
    </Suspense>
  );
}

export default function IconographyLibrary() {
  return <IconographyGridContent />;
}
