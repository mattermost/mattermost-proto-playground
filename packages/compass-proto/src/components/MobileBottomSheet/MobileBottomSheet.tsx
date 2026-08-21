import {
  useEffect,
  useId,
  useLayoutEffect,
  useState,
  type ReactNode,
} from 'react';
import {useExitAnimation} from '@mattermost/compass-ui';
import styles from './MobileBottomSheet.module.scss';

/** Matches `--duration-moderate` (300ms) for enter/exit sheet animation. */
const EXIT_MS = 300;

export interface MobileBottomSheetProps {
  /** Controls visibility. */
  open: boolean;
  /** Called on backdrop click or Escape. */
  onClose?: () => void;
  /** Optional sheet title (Heading 600). */
  title?: ReactNode;
  /** Optional subtitle under the title (Body 200). */
  subtitle?: ReactNode;
  /** Optional visual above the title (e.g. TeamAvatar size 72). */
  leadingVisual?: ReactNode;
  /** Body content — typically MobileMenuItem rows. */
  children?: ReactNode;
  /** Footer slot — when set, shows a top hairline + this content. */
  footer?: ReactNode;
  /** Merged onto the overlay root. */
  className?: string;
}

/**
 * iOS bottom sheet shell from MM-44138 standards.
 *
 * @see https://www.figma.com/design/EabsgDqC6FvLxwPpp1NbCi/MM-44138-Bottom-Sheet-Standards?node-id=4303-3476
 */
export default function MobileBottomSheet({
  open,
  onClose,
  title,
  subtitle,
  leadingVisual,
  children,
  footer,
  className = '',
}: MobileBottomSheetProps) {
  const titleId = useId();
  const {rendered, exiting} = useExitAnimation(open, EXIT_MS);
  const [animateIn, setAnimateIn] = useState(false);

  const hasHeader =
    leadingVisual != null || title != null || subtitle != null;

  useLayoutEffect(() => {
    if (open) {
      setAnimateIn(false);
    }
  }, [open]);

  useEffect(() => {
    if (!rendered || exiting) return;
    const id = requestAnimationFrame(() => setAnimateIn(true));
    return () => cancelAnimationFrame(id);
  }, [rendered, exiting]);

  useEffect(() => {
    if (!rendered) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose?.();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [rendered, onClose]);

  if (!rendered) {
    return null;
  }

  const rootClass = [
    styles['mobile-bottom-sheet'],
    animateIn && !exiting ? styles['mobile-bottom-sheet--open'] : '',
    exiting ? styles['mobile-bottom-sheet--exiting'] : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={rootClass}>
      <button
        type='button'
        className={styles['mobile-bottom-sheet__backdrop']}
        aria-label='Dismiss'
        onClick={() => onClose?.()}
      />
      <div className={styles['mobile-bottom-sheet__panel']}>
        <div className={styles['mobile-bottom-sheet__handle']} aria-hidden>
          <span className={styles['mobile-bottom-sheet__handle-pill']} />
        </div>
        <div
          className={styles['mobile-bottom-sheet__card']}
          role='dialog'
          aria-modal='true'
          aria-labelledby={title != null ? titleId : undefined}
        >
          {hasHeader && (
            <div className={styles['mobile-bottom-sheet__header']}>
              {leadingVisual != null && (
                <div className={styles['mobile-bottom-sheet__leading']}>
                  {leadingVisual}
                </div>
              )}
              {title != null && (
                <h2
                  id={titleId}
                  className={styles['mobile-bottom-sheet__title']}
                >
                  {title}
                </h2>
              )}
              {subtitle != null && (
                <p className={styles['mobile-bottom-sheet__subtitle']}>
                  {subtitle}
                </p>
              )}
            </div>
          )}
          {children != null && (
            <div className={styles['mobile-bottom-sheet__body']}>{children}</div>
          )}
          {footer != null && (
            <div className={styles['mobile-bottom-sheet__footer']}>{footer}</div>
          )}
        </div>
      </div>
    </div>
  );
}
