import { useEffect, useRef, useState, type ReactNode } from 'react';
import ChannelLayout from '@/guidelines/layouts/channel/channel.specimen';
import type { ThemeId } from '@/contexts/ThemeContext';
import styles from './LayoutPreview.module.scss';

interface LayoutPreviewProps {
  /** Theme to scope the preview to. Falls back to the active theme. */
  theme?: ThemeId;
  /** Caption shown above the frame. */
  label?: string;
  /** Reference width of the inner frame in px. Defaults to 1600. */
  referenceWidth?: number;
  /** Reference height of the inner frame in px. Defaults to 880. */
  referenceHeight?: number;
}

/**
 * Renders the Channel layout specimen scaled to fit its container, optionally
 * scoped to a specific data-theme. Use inside guideline pages to showcase
 * theme variations side-by-side.
 */
export default function LayoutPreview({
  theme,
  label,
  referenceWidth = 1600,
  referenceHeight = 880,
}: LayoutPreviewProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const w = entry.contentRect.width;
      if (w > 0) setScale(w / referenceWidth);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [referenceWidth]);

  return (
    <figure className={styles.preview}>
      <div
        ref={viewportRef}
        className={styles.preview__viewport}
        data-theme={theme}
        style={{ aspectRatio: `${referenceWidth} / ${referenceHeight}` }}
      >
        <div
          className={styles.preview__frame}
          aria-hidden
          style={{
            width: referenceWidth,
            height: referenceHeight,
            transform: `scale(${scale})`,
          }}
        >
          <ChannelLayout />
        </div>
      </div>
      {label && <figcaption className={styles.preview__label}>{label}</figcaption>}
    </figure>
  );
}

interface LayoutPreviewGridProps {
  children: ReactNode;
}

export function LayoutPreviewGrid({ children }: LayoutPreviewGridProps) {
  return <div className={styles.previewGrid}>{children}</div>;
}

interface SplitRowProps {
  children: ReactNode;
}

/**
 * Two-column row used to pair a preview with prose. First child fills the
 * left column, remaining children fill the right.
 */
export function SplitRow({ children }: SplitRowProps) {
  return <div className={styles.splitRow}>{children}</div>;
}
