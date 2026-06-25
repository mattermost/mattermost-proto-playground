import { TourPoint } from '@mattermost/compass-ui';
import type { TourPointPointerPosition } from '@mattermost/compass-ui';
import styles from '@/styles/library-demo/patterns.module.scss';

const POINTER_VARIANTS: TourPointPointerPosition[] = [
  'top-center',
  'top-left',
  'top-right',
  'bottom-center',
  'bottom-left',
  'bottom-right',
  'left-center',
  'right-center',
];

function labelFor(position: TourPointPointerPosition) {
  return position
    .split('-')
    .map((word: string) => word[0].toUpperCase() + word.slice(1))
    .join(' ');
}

export default function TourPointLibrary() {
  return (
    <div className={styles['patterns']}>
      <header className={styles['patterns__header']}>
        <h1 className={styles['patterns__heading']}>Tour Point</h1>
        <p className={styles['patterns__subheading']}>
          Pointer placement, optional series chrome, and a variant without an
          arrow.
        </p>
      </header>

      <section className={styles['patterns__section']}>
        <h2 className={styles['patterns__section-title']}>Pointer placement</h2>
        <p className={styles['patterns__variant-label']}>
          Same inner content; only the arrow attachment changes.
        </p>
        <div className={styles['patterns__tour-point-demo']}>
          {POINTER_VARIANTS.map((pointerPosition) => (
            <div
              key={pointerPosition}
              className={styles['patterns__tour-point-demo-cell']}
            >
              <p className={styles['patterns__variant-label']}>
                {labelFor(pointerPosition)}
              </p>
              <TourPoint
                title="Tour point title"
                pointerPosition={pointerPosition}
                onClose={() => {}}
                progress={{ pages: 3, activePage: 1 }}
                primaryAction={{ label: 'Next', onClick: () => {} }}
              >
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer vel
                orci id urna facilisis luctus.
              </TourPoint>
            </div>
          ))}
        </div>
      </section>

      <section className={styles['patterns__section']}>
        <h2 className={styles['patterns__section-title']}>No pointer</h2>
        <p className={styles['patterns__variant-label']}>
          Omit the arrow when the card is not tied to an on-canvas anchor.
        </p>
        <div className={styles['patterns__tour-point-single-demo']}>
          <TourPoint
            title="Standalone tour copy"
            pointerPosition="none"
            onClose={() => {}}
            primaryAction={{ label: 'Got it', onClick: () => {} }}
          >
            Set pointerPosition to none when the card is shown without an on-canvas
            anchor.
          </TourPoint>
        </div>
      </section>
    </div>
  );
}
