import { useAgents } from '../context/AgentsContext';
import PlaybookPreviewPanel from './PlaybookPreviewPanel';
import styles from './PlaybookPreviewRhs.module.scss';

/** Shell-level right sidebar for views that have no RHS slot of their own. */
export default function PlaybookPreviewRhs() {
  const { playbookPreview } = useAgents();
  const open = Boolean(playbookPreview);

  return (
    <div
      className={[styles['playbook-rhs'], open ? styles['playbook-rhs--open'] : '']
        .filter(Boolean)
        .join(' ')}
      aria-hidden={!open}
    >
      <div className={styles['playbook-rhs__inner']}>
        <PlaybookPreviewPanel />
      </div>
    </div>
  );
}
