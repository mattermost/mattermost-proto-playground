import {
  forwardRef,
  useCallback,
  useRef,
  type CSSProperties,
  type ReactNode,
} from 'react';
import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css';
import styles from './Scrollbar.module.scss';

export interface ScrollbarProps {
  /** Scrollable content. */
  children: ReactNode;
  /**
   * CSS variable name (including the leading `--`) for the thumb RGB triplet.
   * Use this to recolor the thumb in dark surfaces (e.g. `--sidebar-text-rgb`).
   * When omitted, the thumb uses `--center-channel-color-rgb`.
   */
  color?: string;
  /**
   * Disable auto-hide; the thumb is visible whenever content overflows.
   * Default: false (auto-hide).
   */
  alwaysVisible?: boolean;
  /** Class applied to the SimpleBar root. */
  className?: string;
  /** Inline style applied to the SimpleBar root. */
  style?: CSSProperties;
  /** Scroll handler attached to the inner scrollable element. */
  onScroll?: (e: Event) => void;
}

/**
 * Scrollbar — wraps content in a SimpleBar overlay scroller.
 *
 * The forwarded ref points at the inner scrollable `<div>`, so consumers can
 * call `.scrollTo(...)` or read `.scrollTop` for things like "scroll to item"
 * or "more unreads above/below" indicators.
 *
 * @see https://compass.mattermost.com/29be2c109/p/88cb9c-scrollbars
 */
const Scrollbar = forwardRef<HTMLDivElement, ScrollbarProps>(function Scrollbar(
  { children, color, alwaysVisible = false, className, style, onScroll },
  ref,
) {
  const cleanup = useRef<(() => void) | undefined>(undefined);

  const setScrollNode = useCallback(
    (el: HTMLDivElement | null) => {
      cleanup.current?.();
      cleanup.current = undefined;

      if (el && onScroll) {
        el.addEventListener('scroll', onScroll);
        cleanup.current = () => el.removeEventListener('scroll', onScroll);
      }

      if (typeof ref === 'function') {
        ref(el);
      } else if (ref) {
        (ref as React.MutableRefObject<HTMLDivElement | null>).current = el;
      }
    },
    [onScroll, ref],
  );

  const mergedStyle: CSSProperties = {
    ...style,
    ...(color
      ? ({ '--scrollbar-color': `var(${color})` } as CSSProperties)
      : null),
  };

  const rootClass = [styles.scrollbar, className].filter(Boolean).join(' ');

  return (
    <SimpleBar
      autoHide={!alwaysVisible}
      scrollableNodeProps={{ ref: setScrollNode }}
      className={rootClass}
      style={mergedStyle}
      tabIndex={-1}
    >
      {children}
    </SimpleBar>
  );
});

export default Scrollbar;
