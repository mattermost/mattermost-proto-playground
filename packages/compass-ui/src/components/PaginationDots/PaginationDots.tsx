import styles from './PaginationDots.module.scss';

export type PaginationDotsOrientation = 'Horizontal' | 'Vertical';
export type PaginationDotsStyle = 'Default' | 'Inverted' | 'OnPrimary';

export interface PaginationDotsProps {
  /** Total number of pages/steps. */
  pages: number;
  /** Currently active page (1-indexed). */
  activePage: number;
  /** Layout orientation. Default: Horizontal. */
  orientation?: PaginationDotsOrientation;
  /** Color style. Default: Default. */
  dotStyle?: PaginationDotsStyle;
  /** Called when a dot is clicked. Receives the 1-indexed page number. */
  onPageChange?: (page: number) => void;
  /** Optional CSS class name. */
  className?: string;
}

/**
 * Pagination Dots — step/progress indicator dots for multi-step flows.
 * Horizontal and vertical orientations. Default, inverted (sidebar), and
 * on-primary (light dots on `--button-bg` / info surfaces via `--button-color`).
 * Used in onboarding wizards.
 */
export default function PaginationDots({
  pages,
  activePage,
  orientation = 'Horizontal',
  dotStyle = 'Default',
  onPageChange,
  className = '',
}: PaginationDotsProps) {
  const isVertical = orientation === 'Vertical';
  const isInverted = dotStyle === 'Inverted';
  const isOnPrimary = dotStyle === 'OnPrimary';

  const orientationClass = isVertical
    ? styles['pagination-dots--vertical']
    : styles['pagination-dots--horizontal'];
  const styleClass = isInverted
    ? styles['pagination-dots--inverted']
    : isOnPrimary
      ? styles['pagination-dots--on-primary']
      : '';

  return (
    <div
      className={[
        styles['pagination-dots'],
        orientationClass,
        styleClass,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      role="tablist"
      aria-label="Pages"
    >
      {Array.from({ length: pages }, (_, i) => {
        const page = i + 1;
        const isActive = page === activePage;
        const dotClass = [
          styles['pagination-dots__dot'],
          isActive ? styles['pagination-dots__dot--active'] : '',
        ]
          .filter(Boolean)
          .join(' ');

        return (
          <button
            key={page}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-label={`Page ${page}`}
            className={styles['pagination-dots__item']}
            onClick={() => onPageChange?.(page)}
          >
            <span className={dotClass} />
          </button>
        );
      })}
    </div>
  );
}
