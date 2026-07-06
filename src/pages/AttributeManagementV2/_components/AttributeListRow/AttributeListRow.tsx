import type { KeyboardEvent } from 'react';
import GlyphStack, {
  type GlyphItem,
} from '../GlyphStack/GlyphStack';
import SourceHealthBadge from '../SourceHealthBadge/SourceHealthBadge';
import { type Attribute, type Resource } from '../../data';
import styles from './AttributeListRow.module.scss';

export interface AttributeListRowProps {
  attribute: Attribute;
  onSelect: (id: string) => void;
  onSharedValuesClick?: (siblingId: string) => void;
  onInUseClick?: (id: string) => void;
  onSourceHealthClick?: (id: string) => void;
}

const APPLIES_TO_VISIBLE_CAP = 3;

function formatAppliesToChips(resources: Resource[]): {
  visible: Resource[];
  extra: number;
} {
  if (resources.length <= APPLIES_TO_VISIBLE_CAP + 1) {
    return { visible: resources, extra: 0 };
  }
  return {
    visible: resources.slice(0, APPLIES_TO_VISIBLE_CAP),
    extra: resources.length - APPLIES_TO_VISIBLE_CAP,
  };
}

export default function AttributeListRow({
  attribute,
  onSelect,
  onSharedValuesClick,
  onInUseClick,
  onSourceHealthClick,
}: AttributeListRowProps) {
  const resources = attribute.appliesTo.map((b) => b.resource);
  const { visible, extra } = formatAppliesToChips(resources);

  const glyphs: GlyphItem[] = [];

  // Source-health (finding 3): non-healthy sources render as a LABELED pill
  // (icon + word), not a bare triangle. Synced stays quiet (no pill, no glyph).
  const unhealthy =
    attribute.source.kind === 'synced' && attribute.source.state !== 'Synced'
      ? attribute.source.state
      : null;

  // Governance glyph — only when bound to at least one policy. Distinct tooltip
  // from a source-owned lock: this lock means "locked for policy use".
  if (attribute.inUseByPolicies > 0) {
    glyphs.push({
      kind: 'governance',
      label: `Locked for policy use — in use by ${attribute.inUseByPolicies} active ${attribute.inUseByPolicies === 1 ? 'policy' : 'policies'}. Changing it re-evaluates access.`,
      onActivate: () => onInUseClick?.(attribute.id),
    });
  } else if (attribute.externallyOwned) {
    // Source-owned lock — values come from an external system; distinct WHY.
    const sys =
      attribute.source.kind === 'synced' ? attribute.source.system : 'a source';
    glyphs.push({
      kind: 'governance',
      label: `Source-owned — values are managed by ${sys} and read-only here.`,
      onActivate: () => onSelect(attribute.id),
    });
  }

  // Relationship glyph — only when linked to a sibling attribute.
  if (attribute.sharedValuesLink) {
    glyphs.push({
      kind: 'relationship',
      label: `Shares values with another attribute — open it to edit the shared scale.`,
      onActivate: () =>
        onSharedValuesClick?.(attribute.sharedValuesLink!.siblingId),
    });
  }

  const handleRowKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(attribute.id);
    }
  };

  return (
    <div
      className={styles['row']}
      role="button"
      tabIndex={0}
      onClick={() => onSelect(attribute.id)}
      onKeyDown={handleRowKey}
      aria-label={`Open ${attribute.name}`}
    >
      <div className={styles['row__main']}>
        <span className={styles['row__name']}>{attribute.name}</span>
        <span className={styles['row__type']}>{attribute.type}</span>
        <span className={styles['row__sep']} aria-hidden>
          ·
        </span>
        <div
          className={styles['row__applies']}
          aria-label={`Applies to ${resources.join(', ')}`}
        >
          {visible.map((r) => (
            <span key={r} className={styles['row__chip']}>
              {r}
            </span>
          ))}
          {extra > 0 && (
            <span
              className={`${styles['row__chip']} ${styles['row__chip--more']}`}
            >
              +{extra}
            </span>
          )}
        </div>
      </div>
      <div className={styles['row__meta']}>
        {unhealthy && (
          <button
            type="button"
            className={styles['row__health']}
            title={
              unhealthy === 'Stale'
                ? 'Source is stale — last successful sync is outside the configured window. Open for details.'
                : 'Last sync failed — open for the error and a Sync now retry.'
            }
            aria-label={`Source ${unhealthy}. Open for details.`}
            onClick={(e) => {
              e.stopPropagation();
              onSourceHealthClick?.(attribute.id);
            }}
          >
            <SourceHealthBadge state={unhealthy} />
          </button>
        )}
        <GlyphStack glyphs={glyphs} />
      </div>
    </div>
  );
}
