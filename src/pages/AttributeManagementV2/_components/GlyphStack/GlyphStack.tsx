import type { MouseEvent, ReactNode } from 'react';
import AlertOutlineIcon from '@mattermost/compass-icons/components/alert-outline';
import LockOutlineIcon from '@mattermost/compass-icons/components/lock-outline';
import LinkVariantIcon from '@mattermost/compass-icons/components/link-variant';
import DotsHorizontalIcon from '@mattermost/compass-icons/components/dots-horizontal';
import CircleOutlineIcon from '@mattermost/compass-icons/components/circle-outline';
import styles from './GlyphStack.module.scss';

/**
 * Glyph kinds with locked priority order (left → right in the stack):
 *   1. health     → ⚠️  (Stale / Failed)
 *   2. governance → ⊙   (In use by N policies — blast radius)
 *   3. relationship → 🔗 (Shares values with another attribute)
 *
 * Per re-review §2.1: cap the stack at 3 semantic + ⋯ overflow. Beyond 3,
 * the lowest-priority glyph collapses into a neutral "more flags" indicator.
 */

export type GlyphKind = 'health' | 'governance' | 'relationship';

export interface GlyphItem {
  kind: GlyphKind;
  /** Plain-language description bound to the icon for assistive tech. */
  label: string;
  /** Click handler (e.g. open detail or open blast-radius preview). */
  onActivate?: (e: MouseEvent<HTMLButtonElement>) => void;
}

const PRIORITY: Record<GlyphKind, number> = {
  health: 0,
  governance: 1,
  relationship: 2,
};

function GlyphIcon({ kind }: { kind: GlyphKind }): ReactNode {
  if (kind === 'health') return <AlertOutlineIcon size={16} />;
  if (kind === 'governance') return <LockOutlineIcon size={16} />;
  return <LinkVariantIcon size={16} />;
}

export interface GlyphStackProps {
  glyphs: GlyphItem[];
  /** Overflow menu trigger (⋯). Always rendered at the trailing edge. */
  onOverflow?: () => void;
  overflowLabel?: string;
}

const SEMANTIC_CAP = 3;

export default function GlyphStack({
  glyphs,
  onOverflow,
  overflowLabel = 'More actions',
}: GlyphStackProps) {
  const sorted = [...glyphs].sort((a, b) => PRIORITY[a.kind] - PRIORITY[b.kind]);

  const visible = sorted.slice(0, SEMANTIC_CAP);
  const collapsed = sorted.slice(SEMANTIC_CAP);

  return (
    <div className={styles['stack']}>
      {visible.map((g, i) => (
        <button
          key={`${g.kind}-${i}`}
          type="button"
          className={`${styles['stack__glyph']} ${styles[`stack__glyph--${g.kind}`]}`}
          aria-label={g.label}
          title={g.label}
          onClick={(e) => {
            e.stopPropagation();
            g.onActivate?.(e);
          }}
        >
          <GlyphIcon kind={g.kind} />
        </button>
      ))}
      {collapsed.length > 0 && (
        <button
          type="button"
          className={styles['stack__glyph']}
          aria-label={`${collapsed.length} more ${collapsed.length === 1 ? 'flag' : 'flags'}`}
          title={`${collapsed.length} more ${collapsed.length === 1 ? 'flag' : 'flags'}`}
        >
          <CircleOutlineIcon size={12} />
        </button>
      )}
      <button
        type="button"
        className={`${styles['stack__glyph']} ${styles['stack__glyph--overflow']}`}
        aria-label={overflowLabel}
        title={overflowLabel}
        onClick={(e) => {
          e.stopPropagation();
          onOverflow?.();
        }}
      >
        <DotsHorizontalIcon size={16} />
      </button>
    </div>
  );
}
