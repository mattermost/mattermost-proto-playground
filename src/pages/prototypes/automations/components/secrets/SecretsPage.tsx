import { Scrollbar } from '@mattermost/compass-ui';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAutomations } from '../../context/AutomationsContext';
import VariableSecretsManager from '../variables/VariableSecretsManager';
import styles from './SecretsPage.module.scss';

export default function SecretsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    systemVariables,
    addSystemVariable,
    removeSystemVariable,
  } = useAutomations();

  const [defaultAddOpen] = useState(() => searchParams.get('add') === '1');

  useEffect(() => {
    if (searchParams.get('add') !== '1') return;
    const next = new URLSearchParams(searchParams);
    next.delete('add');
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  return (
    <div className={styles.secrets}>
      <div className={styles.secrets__pagehead}>
        <h1 className={styles.secrets__title}>Variables & secrets</h1>
        <p className={styles.secrets__subtitle}>
          System-wide values available to every automation. Use variables for
          readable config and secrets for credentials that must stay encrypted.
        </p>
      </div>
      <div className={styles.secrets__body}>
        <Scrollbar style={{ height: '100%' }}>
          <div className={styles.secrets__inner}>
            <VariableSecretsManager
              items={systemVariables}
              onAdd={addSystemVariable}
              onRemove={removeSystemVariable}
              addLabel="Add"
              addEmphasis="Primary"
              defaultAddOpen={defaultAddOpen}
            />
          </div>
        </Scrollbar>
      </div>
    </div>
  );
}
