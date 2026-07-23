import FolderOutlineIcon from '@mattermost/compass-icons/components/folder-outline';
import { Icon, Scrollbar } from '@mattermost/compass-ui';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AUTOMATION_FOLDERS } from '../../data/automationsData';
import { useAutomations } from '../../context/AutomationsContext';
import styles from './FoldersPage.module.scss';

const BASE = '/prototypes/automations';

export default function FoldersPage() {
  const navigate = useNavigate();
  const { automations } = useAutomations();

  const folders = useMemo(
    () =>
      AUTOMATION_FOLDERS.map((folder) => ({
        ...folder,
        count: automations.filter((a) => a.folderId === folder.id).length,
      })),
    [automations],
  );

  return (
    <div className={styles.folders}>
      <div>
        <h1 className={styles.folders__title}>Folders</h1>
        <p className={styles.folders__subtitle}>
          Organize automations by team. Open a folder to view its automations on
          Home.
        </p>
      </div>
      <div className={styles.folders__body}>
        <Scrollbar style={{ height: '100%' }}>
          <div className={styles.folders__list}>
            {folders.map((folder) => (
              <button
                key={folder.id}
                type="button"
                className={styles.folders__row}
                onClick={() => navigate(BASE)}
              >
                <span className={styles.folders__icon} aria-hidden>
                  <Icon size="20" glyph={<FolderOutlineIcon />} />
                </span>
                <span className={styles.folders__text}>
                  <span className={styles.folders__name}>{folder.name}</span>
                  {folder.description ? (
                    <span className={styles.folders__desc}>{folder.description}</span>
                  ) : null}
                </span>
                <span className={styles.folders__count}>{folder.count}</span>
              </button>
            ))}
          </div>
        </Scrollbar>
      </div>
    </div>
  );
}
