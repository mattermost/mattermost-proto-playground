import {
  useEffect,
  useLayoutEffect,
  useState,
  type ReactNode,
} from 'react';
import {useExitAnimation} from '@/hooks/useExitAnimation';
import styles from './MobileModalStage.module.scss';

/** Matches `--duration-moderate` (300ms). */
export const MOBILE_MODAL_STAGE_MS = 300;

export interface MobileModalStageProps {
  /** Controls modal presentation open state. */
  open: boolean;
  /** The modal sheet — typically a `MobileModal`. */
  modal: ReactNode;
  /** Previous view that scales/fades behind the modal. */
  children: ReactNode;
  /**
   * When false, skip enter animation and show the open presentation
   * immediately (useful for docs specimens). Default: true.
   */
  animate?: boolean;
  /** Merged onto the stage root. */
  className?: string;
}

/**
 * iOS-style mobile modal presenter for DeviceFrame prototypes and specimens.
 * Owns black letterbox, previous-view scale/fade, and modal slide-up motion.
 * Does not replace Compass `MobileModal` — pass that as `modal`.
 */
export default function MobileModalStage({
  open,
  modal,
  children,
  animate = true,
  className = '',
}: MobileModalStageProps) {
  const {rendered, exiting} = useExitAnimation(open, MOBILE_MODAL_STAGE_MS);
  const [entered, setEntered] = useState(!animate && open);

  useLayoutEffect(() => {
    if (!animate && open) {
      setEntered(true);
      return;
    }
    setEntered(false);
  }, [open, animate]);

  useEffect(() => {
    if (!animate || !rendered || exiting) return;
    let innerId = 0;
    const outerId = requestAnimationFrame(() => {
      innerId = requestAnimationFrame(() => setEntered(true));
    });
    return () => {
      cancelAnimationFrame(outerId);
      cancelAnimationFrame(innerId);
    };
  }, [animate, rendered, exiting]);

  const visible = rendered && entered && !exiting;

  const rootClass = [
    styles['mobile-modal-stage'],
    rendered && styles['mobile-modal-stage--open'],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={rootClass}>
      <div
        className={[
          styles['mobile-modal-stage__previous'],
          visible && styles['mobile-modal-stage__previous--behind'],
        ]
          .filter(Boolean)
          .join(' ')}
        aria-hidden={rendered}
        inert={rendered}
      >
        {children}
      </div>

      {rendered && (
        <div
          className={[
            styles['mobile-modal-stage__modal'],
            visible && styles['mobile-modal-stage__modal--open'],
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {modal}
        </div>
      )}
    </div>
  );
}
