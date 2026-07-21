import { Scrollbar } from '@mattermost/compass-ui';
import { useNavigate } from 'react-router-dom';
import { useAutomations } from '../../context/AutomationsContext';
import styles from './TemplatesPage.module.scss';

const BASE = '/prototypes/automations';

export default function TemplatesPage() {
  const navigate = useNavigate();
  const { templates, createFromTemplateId, recordRecent } = useAutomations();

  const applyTemplate = (templateId: string) => {
    const id = createFromTemplateId(templateId);
    if (!id) return;
    recordRecent(id);
    navigate(`${BASE}/${id}/editor`);
  };

  return (
    <div className={styles.templates}>
      <div>
        <h1 className={styles.templates__title}>Start from a template</h1>
        <p className={styles.templates__subtitle}>
          Templates are imported as disabled drafts you can review and customize
          before enabling.
        </p>
      </div>
      <div className={styles.templates__body}>
        <Scrollbar style={{ height: '100%' }}>
          <div className={styles.templates__grid}>
            {templates.map((t) => (
              <button
                key={t.id}
                type="button"
                className={styles.templates__card}
                onClick={() => applyTemplate(t.id)}
              >
                <p className={styles.templates__category}>{t.category}</p>
                <h2 className={styles.templates__name}>{t.name}</h2>
                <p className={styles.templates__desc}>{t.description}</p>
                <span className={styles.templates__cta}>Use template</span>
              </button>
            ))}
          </div>
        </Scrollbar>
      </div>
    </div>
  );
}
