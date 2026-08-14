import type { ReactNode } from 'react';
import CloseIcon from '@mattermost/compass-icons/components/close';
import ChevronRightIcon from '@mattermost/compass-icons/components/chevron-right';
import Button from '@/components/Button/Button';
import Icon from '@/components/Icon/Icon';
import IconButton from '@/components/IconButton/IconButton';
import PaginationDots from '@/components/PaginationDots/PaginationDots';
import { toKebab } from '@/utils/string';
import styles from './TourPoint.module.scss';

export type TourPointPointerPosition =
  | 'top-center'
  | 'top-left'
  | 'top-right'
  | 'bottom-center'
  | 'bottom-left'
  | 'bottom-right'
  | 'left-center'
  | 'right-center';

export interface TourPointProgress {
  pages: number;
  activePage: number;
  onPageChange?: (page: number) => void;
}

export interface TourPointPrimaryAction {
  label: string;
  onClick?: () => void;
}

export interface TourPointProps {
  title: string;
  children: ReactNode;
  /** Optional image between body copy and footer (e.g. screenshot as an img). */
  media?: ReactNode;
  /** Where the pointer sits on the card edge; omit or `none` to hide the pointer. */
  pointerPosition?: TourPointPointerPosition | 'none';
  /**
   * Animated marker at the arrow tip (Figma Pulsing Dot). Only applies when a
   * pointer is shown. Default on; set false for reduced motion preference at the
   * callsite or a static tour step.
   */
  showPulsingDot?: boolean;
  onClose?: () => void;
  progress?: TourPointProgress;
  primaryAction?: TourPointPrimaryAction;
  className?: string;
}

export default function TourPoint({
  title,
  children,
  media,
  pointerPosition = 'top-center',
  showPulsingDot = true,
  onClose,
  progress,
  primaryAction,
  className = '',
}: TourPointProps) {
  const showPointer = pointerPosition !== 'none';
  const pointerModifier =
    showPointer &&
    styles[`tour-point--pointer-${toKebab(pointerPosition as TourPointPointerPosition)}`];

  const rootClass = [
    styles['tour-point'],
    pointerModifier,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const showFooter = progress != null || primaryAction != null;

  return (
    <div className={rootClass}>
      {showPointer && (
        <span className={styles['tour-point__pointer']} aria-hidden>
          <span className={styles['tour-point__pointer-triangle']} />
          {showPulsingDot && (
            <span className={styles['tour-point__pointer-pulse']}>
              <span className={styles['tour-point__pointer-pulse-ring']} />
              <span
                className={[
                  styles['tour-point__pointer-pulse-ring'],
                  styles['tour-point__pointer-pulse-ring--delay'],
                ].join(' ')}
              />
              <span className={styles['tour-point__pointer-pulse-core']} />
            </span>
          )}
        </span>
      )}

      <div className={styles['tour-point__panel']}>
        <div className={styles['tour-point__header']}>
          <h2 className={styles['tour-point__title']}>{title}</h2>
          {onClose && (
            <IconButton
              className={styles['tour-point__close']}
              aria-label="Close"
              size="Small"
              padding="Compact"
              style="Default"
              icon={<Icon size="16" glyph={<CloseIcon />} />}
              onClick={onClose}
            />
          )}
        </div>

        <div className={styles['tour-point__body']}>
          <div className={styles['tour-point__description']}>{children}</div>
          {media != null && (
            <div className={styles['tour-point__media']}>{media}</div>
          )}
        </div>

        {showFooter && (
          <div className={styles['tour-point__footer']}>
            {progress != null ? (
              <PaginationDots
                className={styles['tour-point__progress']}
                pages={progress.pages}
                activePage={progress.activePage}
                dotStyle="OnPrimary"
                onPageChange={progress.onPageChange}
              />
            ) : (
              <span className={styles['tour-point__footer-spacer']} aria-hidden />
            )}

            {primaryAction != null ? (
              <div className={styles['tour-point__next-wrap']}>
                <Button
                  emphasis="Primary"
                  size="Small"
                  trailingIcon={
                    <Icon size="16" glyph={<ChevronRightIcon />} />
                  }
                  onClick={primaryAction.onClick}
                >
                  {primaryAction.label}
                </Button>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
