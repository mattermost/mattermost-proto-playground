import ArrowLeftIcon from '@mattermost/compass-icons/components/arrow-left';
import { Button, Icon, IconButton, Scrollbar } from '@mattermost/compass-ui';
import { useNavigate, useParams } from 'react-router-dom';
import { useAutomations } from '../../context/AutomationsContext';
import styles from './history.module.scss';

const BASE = '/prototypes/automations';

export default function ChangeHistoryPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { getAutomation, getHistoryFor, showToast } = useAutomations();
  const automation = getAutomation(id);
  const revisions = getHistoryFor(id);

  if (!automation) {
    return (
      <div className={styles.history}>
        <p>Automation not found</p>
        <Button emphasis="Tertiary" size="Small" onClick={() => navigate(BASE)}>
          Back
        </Button>
      </div>
    );
  }

  return (
    <div className={styles.history}>
      <div className={styles.history__header}>
        <div className={styles['history__title-row']}>
          <IconButton
            aria-label="Back to editor"
            size="Small"
            padding="Compact"
            icon={<Icon size="16" glyph={<ArrowLeftIcon />} />}
            onClick={() => navigate(`${BASE}/${id}/editor`)}
          />
          <h1 className={styles.history__title}>History · {automation.name}</h1>
        </div>
        <Button emphasis="Tertiary" size="X-Small" onClick={() => undefined}>
          Refresh
        </Button>
      </div>
      <div className={styles['history__table-wrap']}>
        <Scrollbar style={{ height: '100%' }}>
          <table className={styles.history__table}>
            <thead>
              <tr>
                <th>Revision</th>
                <th>Change</th>
                <th>By</th>
                <th>When</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {revisions.map((rev) => (
                <tr key={rev.id}>
                  <td>#{rev.revision}</td>
                  <td>{rev.change}</td>
                  <td style={{ fontFamily: 'ui-monospace, monospace', fontSize: 12 }}>
                    {rev.by}
                  </td>
                  <td>{new Date(rev.when).toLocaleString()}</td>
                  <td>
                    <button
                      type="button"
                      className={styles.history__link}
                      onClick={() =>
                        showToast('Restore is not available in this prototype', 'Info')
                      }
                    >
                      Restore
                    </button>
                  </td>
                </tr>
              ))}
              {revisions.length === 0 ? (
                <tr>
                  <td colSpan={5}>No change history yet.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </Scrollbar>
      </div>
    </div>
  );
}
