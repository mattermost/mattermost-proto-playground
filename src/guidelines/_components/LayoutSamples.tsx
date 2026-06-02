import type { CSSProperties, ReactNode } from 'react';
import styles from './LayoutSamples.module.scss';

// ============================================================
// Spacing scale
// ============================================================

interface SpacingStep {
  px: number;
  note?: string;
}

const SPACING_STEPS: SpacingStep[] = [
  { px: 2, note: 'Hairline gaps inside dense controls' },
  { px: 4, note: '4px baseline — small elements' },
  { px: 6 },
  { px: 8, note: '8px baseline — default rhythm' },
  { px: 10 },
  { px: 12 },
  { px: 16 },
  { px: 20 },
  { px: 24 },
  { px: 32 },
  { px: 40 },
  { px: 48 },
];

export function SpacingScale() {
  return (
    <div className={styles['scale']}>
      {SPACING_STEPS.map(({ px, note }) => (
        <div key={px} className={styles['scale__row']}>
          <div className={styles['scale__meta']}>
            <span className={styles['scale__px']}>{px}px</span>
          </div>
          <div className={styles['scale__bar-track']}>
            <div
              className={styles['scale__bar']}
              style={{ width: `${px}px` }}
            />
          </div>
          {note && <div className={styles['scale__note']}>{note}</div>}
        </div>
      ))}
    </div>
  );
}

// ============================================================
// Padding example
// ============================================================

export function PaddingExample() {
  return (
    <div className={styles['padding-demo']}>
      <div className={styles['padding-demo__container']}>
        <div className={styles['padding-demo__content']}>
          <div className={styles['padding-demo__title']}>Card title</div>
          <div className={styles['padding-demo__body']}>
            Body copy fills the container while padding holds it off the edges.
          </div>
        </div>
        <div className={`${styles['padding-demo__label']} ${styles['padding-demo__label--top']}`}>16px</div>
        <div className={`${styles['padding-demo__label']} ${styles['padding-demo__label--right']}`}>16px</div>
        <div className={`${styles['padding-demo__label']} ${styles['padding-demo__label--bottom']}`}>16px</div>
        <div className={`${styles['padding-demo__label']} ${styles['padding-demo__label--left']}`}>16px</div>
      </div>
    </div>
  );
}

// ============================================================
// Grid overlay (8px / 4px) on a small UI sample
// ============================================================

interface GridOverlayProps {
  /** Cell size in px. */
  size: 4 | 8;
  caption: string;
}

export function GridOverlay({ size, caption }: GridOverlayProps) {
  return (
    <figure className={styles['grid-overlay']}>
      <div
        className={styles['grid-overlay__stage']}
        style={
          {
            '--grid-overlay-size': `${size}px`,
          } as CSSProperties
        }
      >
        <div className={styles['grid-overlay__sample']}>
          <div className={styles['grid-overlay__avatar']} />
          <div className={styles['grid-overlay__lines']}>
            <div className={`${styles['grid-overlay__line']} ${styles['grid-overlay__line--strong']}`} />
            <div className={styles['grid-overlay__line']} />
            <div className={`${styles['grid-overlay__line']} ${styles['grid-overlay__line--short']}`} />
          </div>
        </div>
      </div>
      <figcaption className={styles['grid-overlay__caption']}>{caption}</figcaption>
    </figure>
  );
}

// ============================================================
// Grid anatomy diagram
// ============================================================

interface GridAnatomyProps {
  columns?: number;
  margins?: number;
  gutter?: number;
}

export function GridAnatomy({
  columns = 12,
  margins = 24,
  gutter = 24,
}: GridAnatomyProps) {
  return (
    <div className={styles['anatomy']}>
      <div className={styles['anatomy__frame']}>
        <span className={`${styles['anatomy__edge']} ${styles['anatomy__edge--left']}`}>
          <span className={styles['anatomy__edge-label']}>Margin {margins}px</span>
        </span>
        <span className={`${styles['anatomy__edge']} ${styles['anatomy__edge--right']}`}>
          <span className={styles['anatomy__edge-label']}>Margin {margins}px</span>
        </span>
        <div
          className={styles['anatomy__columns']}
          style={
            {
              gridTemplateColumns: `repeat(${columns}, 1fr)`,
              padding: `0 ${margins}px`,
              gap: `${gutter}px`,
            } as CSSProperties
          }
        >
          {Array.from({ length: columns }, (_, i) => (
            <div key={i} className={styles['anatomy__column']}>
              <span className={styles['anatomy__column-num']}>{i + 1}</span>
            </div>
          ))}
        </div>
        <div className={styles['anatomy__gutter-callout']}>
          Gutter {gutter}px
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Breakpoint table
// ============================================================

interface BreakpointRow {
  name: string;
  range: string;
  columns: number;
  gutter: number;
  margin: number;
  withSidebar?: boolean;
}

const BREAKPOINTS: BreakpointRow[] = [
  { name: 'XS', range: '320 – 575', columns: 4, gutter: 16, margin: 16 },
  { name: 'S', range: '576 – 767', columns: 8, gutter: 16, margin: 16 },
  { name: 'M', range: '768 – 991', columns: 8, gutter: 24, margin: 24 },
  { name: 'M (sidebar)', range: '768 – 991', columns: 4, gutter: 24, margin: 24, withSidebar: true },
  { name: 'L', range: '992 – 1199', columns: 12, gutter: 24, margin: 24 },
  { name: 'L (sidebar)', range: '992 – 1199', columns: 8, gutter: 24, margin: 24, withSidebar: true },
  { name: 'XL', range: '1200+', columns: 12, gutter: 24, margin: 24 },
  { name: 'XL (sidebar)', range: '1200+', columns: 8, gutter: 24, margin: 24, withSidebar: true },
];

export function BreakpointTable() {
  return (
    <table className={styles['bp-table']}>
      <thead>
        <tr>
          <th>Breakpoint</th>
          <th>Range (px)</th>
          <th>Columns</th>
          <th>Gutter</th>
          <th>Margin</th>
        </tr>
      </thead>
      <tbody>
        {BREAKPOINTS.map((bp) => (
          <tr
            key={bp.name}
            className={
              bp.withSidebar ? styles['bp-table__row--sidebar'] : undefined
            }
          >
            <td>
              <span className={styles['bp-table__name']}>{bp.name}</span>
            </td>
            <td>{bp.range}</td>
            <td>{bp.columns}</td>
            <td>{bp.gutter}px</td>
            <td>{bp.margin}px</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ============================================================
// Aspect ratios
// ============================================================

interface RatioCard {
  label: string;
  ratio: string;
  use: string;
}

const RATIOS: RatioCard[] = [
  { label: '1:1', ratio: '1 / 1', use: 'Avatars and square thumbnails.' },
  { label: '4:3', ratio: '4 / 3', use: 'Image attachments and previews.' },
  { label: '3:2', ratio: '3 / 2', use: 'Marketing and onboarding canvases.' },
  { label: '16:9', ratio: '16 / 9', use: 'Video embeds and full-width hero media.' },
];

export function AspectRatios() {
  return (
    <div className={styles['ratios']}>
      {RATIOS.map(({ label, ratio, use }) => (
        <div key={label} className={styles['ratios__card']}>
          <div
            className={styles['ratios__shape']}
            style={{ aspectRatio: ratio }}
          >
            <span className={styles['ratios__label']}>{label}</span>
          </div>
          <div className={styles['ratios__use']}>{use}</div>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// Interaction targets
// ============================================================

interface InteractionTargetProps {
  size: number;
  spacing: number;
  caption: string;
  label: string;
}

function InteractionTarget({ size, spacing, caption, label }: InteractionTargetProps) {
  return (
    <figure className={styles['target']}>
      <div className={styles['target__stage']}>
        <div
          className={styles['target__hit']}
          style={{ width: `${size}px`, height: `${size}px` }}
        >
          <span className={styles['target__hit-label']}>{label}</span>
        </div>
        <div
          className={styles['target__hit']}
          style={{ width: `${size}px`, height: `${size}px` }}
        >
          <span className={styles['target__hit-label']}>{label}</span>
        </div>
        <div className={styles['target__gap']}>{spacing}px</div>
      </div>
      <figcaption className={styles['target__caption']}>
        <strong>{caption}</strong>
        <span>
          {size}×{size} hit area · {spacing}px minimum spacing
        </span>
      </figcaption>
    </figure>
  );
}

export function InteractionTargets() {
  return (
    <div className={styles['targets']}>
      <InteractionTarget
        size={24}
        spacing={8}
        label="Click"
        caption="Mouse"
      />
      <InteractionTarget
        size={40}
        spacing={8}
        label="Tap"
        caption="Touch"
      />
    </div>
  );
}

// ============================================================
// Sidebar offset diagram
// ============================================================

interface SidebarOffsetProps {
  /** Render with both left and right sidebars. */
  both?: boolean;
}

export function SidebarOffset({ both = false }: SidebarOffsetProps) {
  return (
    <div className={styles['sidebar-offset']}>
      <div className={styles['sidebar-offset__panel']}>
        <span>Left sidebar</span>
      </div>
      <div className={styles['sidebar-offset__main']}>
        <span>Grid offset by panel widths</span>
      </div>
      {both && (
        <div className={styles['sidebar-offset__panel']}>
          <span>Right sidebar</span>
        </div>
      )}
    </div>
  );
}

// ============================================================
// Padding rhythm card grid
// ============================================================

interface DensityCardProps {
  label: string;
  padding: string;
  description: ReactNode;
}

export function DensityCard({ label, padding, description }: DensityCardProps) {
  return (
    <div className={styles['density']} style={{ padding }}>
      <div className={styles['density__label']}>{label}</div>
      <div className={styles['density__padding']}>{padding}</div>
      <div className={styles['density__desc']}>{description}</div>
    </div>
  );
}
