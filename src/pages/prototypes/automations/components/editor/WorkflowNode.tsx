import { Icon } from '@mattermost/compass-ui';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { helpTextForStep } from '../../data/stepCatalog';
import type { WorkflowNodeData } from '../../data/types';
import { glyphForStep } from './paletteIcons';
import styles from './editor.module.scss';

export default function WorkflowNodeView({ data, selected }: NodeProps) {
  const nodeData = data as WorkflowNodeData;
  const Glyph = glyphForStep(nodeData.kind, nodeData.stepType);
  const description = nodeData.helpText ?? helpTextForStep(nodeData.stepType);
  const headerClass = [
    styles.node__header,
    nodeData.kind === 'trigger' ? styles['node__header--trigger'] : '',
    nodeData.kind === 'action' ? styles['node__header--action'] : '',
    nodeData.kind === 'flow' ? styles['node__header--flow'] : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={[styles.node, selected ? styles['node--selected'] : '']
        .filter(Boolean)
        .join(' ')}
    >
      <Handle type="target" position={Position.Left} />
      <div className={headerClass}>{nodeData.kind}</div>
      <div className={styles.node__body}>
        <span className={styles.node__icon} aria-hidden>
          <Icon size="16" glyph={<Glyph />} />
        </span>
        <div className={styles.node__text}>
          <span className={styles.node__label}>{nodeData.label}</span>
          {description ? (
            <span className={styles.node__description}>{description}</span>
          ) : null}
        </div>
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}
