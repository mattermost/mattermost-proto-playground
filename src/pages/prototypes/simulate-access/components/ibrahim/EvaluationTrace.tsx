import styles from './IbrahimVariant.module.scss';

/**
 * Evaluation trace tree for the Decision details modal.
 * Per the meeting: traces are only shown for denials at the current rule level.
 * Upper-scope (system) policies remain opaque — no trace rendered.
 */
export interface TraceNode {
  /** Display label — usually a CEL fragment or AND/OR group label. */
  label: string;
  /** Whether the node passed in evaluation. */
  pass: boolean;
  /** The actual value seen in evaluation, when relevant. */
  actual?: string;
  /** Child nodes for groups (AND/OR). */
  children?: TraceNode[];
}

export interface EvaluationTraceProps {
  ruleHeader: string;
  root: TraceNode;
}

function Node({ node, depth = 0 }: { node: TraceNode; depth?: number }) {
  const cls = [
    styles['iv-trace-node'],
    node.pass ? styles['iv-trace-node--pass'] : styles['iv-trace-node--fail'],
  ].join(' ');
  return (
    <div className={cls}>
      <div className={styles['iv-trace-node__row']}>
        <span className={styles['iv-trace-node__indicator']}>{node.pass ? '✓' : '✕'}</span>
        <span className={styles['iv-trace-node__label']}>{node.label}</span>
        {node.actual && (
          <span className={styles['iv-trace-node__actual']}>Actual: {node.actual}</span>
        )}
      </div>
      {node.children && node.children.length > 0 && (
        <div className={styles['iv-trace-node__children']}>
          {node.children.map((c, i) => (
            <Node key={i} node={c} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function EvaluationTrace({ ruleHeader, root }: EvaluationTraceProps) {
  return (
    <div className={styles['iv-trace']}>
      <div className={styles['iv-trace__header']}>{ruleHeader}</div>
      <Node node={root} />
    </div>
  );
}
