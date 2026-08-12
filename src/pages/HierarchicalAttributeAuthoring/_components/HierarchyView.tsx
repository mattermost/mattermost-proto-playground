import { Fragment } from 'react';
import ChevronRightIcon from '@mattermost/compass-icons/components/chevron-right';
import SourceBranchIcon from '@mattermost/compass-icons/components/source-branch';
import LockOutlineIcon from '@mattermost/compass-icons/components/lock-outline';
import Icon from '@/components/ui/Icon/Icon';
import LabelTag from '@/components/ui/LabelTag/LabelTag';
import Spinner from '@/components/ui/Spinner/Spinner';
import {
  childrenOf,
  parentsOf,
  rootsOf,
  descendantsOf,
  type GraphOption,
} from '../graphModel';
import styles from './HierarchyView.module.scss';

interface HierarchyViewProps {
  options: GraphOption[];
  selectedId: string | null;
  hoveredId: string | null;
  /** Subtree id in a websocket sync window — dimmed + spinner (F-8). */
  refreshingId?: string | null;
  onSelect: (id: string | null) => void;
  onHover: (id: string | null) => void;
}

/**
 * Read-only multi-appears DAG projection (SD-3 "Map"). A multi-parent option
 * renders once under EACH parent, badged with its parent count so it can never
 * be mistaken for distinct nodes. Strictly read-only — no edit affordance can
 * introduce an edit-affects-all-copies mis-author (the hazard SD-3 excludes).
 */
export default function HierarchyView({
  options,
  selectedId,
  hoveredId,
  refreshingId = null,
  onSelect,
  onHover,
}: HierarchyViewProps) {
  const roots = rootsOf(options);
  const refreshingSet = refreshingId
    ? new Set<string>([refreshingId, ...descendantsOf(options, refreshingId)])
    : null;

  return (
    <div className={styles['hierarchy']}>
      <div className={styles['hierarchy__invariant']}>
        <Icon size="12" glyph={<SourceBranchIcon />} />
        <span>Read-only view · renders from the table · matches table</span>
      </div>
      <div
        className={styles['hierarchy__tree']}
        role="tree"
        aria-label="Program hierarchy (read-only)"
      >
        {roots.map((root) => (
          <TreeNode
            key={root.id}
            options={options}
            node={root}
            depth={0}
            selectedId={selectedId}
            hoveredId={hoveredId}
            refreshingSet={refreshingSet}
            onSelect={onSelect}
            onHover={onHover}
          />
        ))}
      </div>
    </div>
  );
}

function TreeNode({
  options,
  node,
  depth,
  selectedId,
  hoveredId,
  refreshingSet,
  onSelect,
  onHover,
}: {
  options: GraphOption[];
  node: GraphOption;
  depth: number;
  selectedId: string | null;
  hoveredId: string | null;
  refreshingSet: Set<string> | null;
  onSelect: (id: string | null) => void;
  onHover: (id: string | null) => void;
}) {
  const kids = childrenOf(options, node.id);
  const parents = parentsOf(options, node.id);
  const multiParent = parents.length > 1;
  const highlighted = selectedId === node.id || hoveredId === node.id;
  const refreshing = refreshingSet?.has(node.id) ?? false;

  const srLabel = multiParent
    ? `${node.label}, appears under ${parents.length} of ${parents.length} parents: ${parents
        .map((p) => p.label)
        .join(', ')}`
    : node.label;

  return (
    <Fragment>
      <div
        role="treeitem"
        aria-label={srLabel}
        aria-selected={selectedId === node.id}
        tabIndex={0}
        className={[
          styles['hierarchy__node'],
          highlighted && styles['hierarchy__node--highlighted'],
          refreshing && styles['hierarchy__node--refreshing'],
        ]
          .filter(Boolean)
          .join(' ')}
        style={{
          paddingLeft: `calc(${depth} * var(--spacing-l) + var(--spacing-s))`,
        }}
        onMouseEnter={() => onHover(node.id)}
        onMouseLeave={() => onHover(null)}
        onFocus={() => onHover(node.id)}
        onClick={() => onSelect(selectedId === node.id ? null : node.id)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelect(selectedId === node.id ? null : node.id);
          }
        }}
      >
        {kids.length > 0 ? (
          <span className={styles['hierarchy__twist']} aria-hidden>
            <Icon size="12" glyph={<ChevronRightIcon />} />
          </span>
        ) : (
          <span className={styles['hierarchy__twist-spacer']} aria-hidden />
        )}

        {node.color && (
          <span
            className={styles['hierarchy__swatch']}
            style={{ backgroundColor: node.color }}
            aria-hidden
          />
        )}

        <span className={styles['hierarchy__label']}>{node.label}</span>

        {multiParent && (
          <LabelTag
            label={`Appears under ${parents.length} parents`}
            type="Warning"
            size="X-Small"
            leadingIcon={<Icon size="12" glyph={<SourceBranchIcon />} />}
          />
        )}

        {refreshing && (
          <span className={styles['hierarchy__refreshing-tag']}>
            <Spinner size={12} aria-label="Refreshing" />
            Refreshing…
          </span>
        )}
      </div>

      {multiParent && (
        <div
          className={styles['hierarchy__also']}
          style={{
            paddingLeft: `calc(${depth + 1} * var(--spacing-l) + var(--spacing-s))`,
          }}
        >
          <Icon size="12" glyph={<LockOutlineIcon />} />
          Same node · also under: {parents.map((p) => p.label).join(', ')}
        </div>
      )}

      {kids.map((child) => (
        <TreeNode
          key={`${node.id}/${child.id}`}
          options={options}
          node={child}
          depth={depth + 1}
          selectedId={selectedId}
          hoveredId={hoveredId}
          refreshingSet={refreshingSet}
          onSelect={onSelect}
          onHover={onHover}
        />
      ))}
    </Fragment>
  );
}
