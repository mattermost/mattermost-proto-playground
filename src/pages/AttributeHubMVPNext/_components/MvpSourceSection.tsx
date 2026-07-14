import { useState } from 'react';
import PowerPlugOutlineIcon from '@mattermost/compass-icons/components/power-plug-outline';
import Icon from '@/components/ui/Icon/Icon';
import Button from '@/components/ui/Button/Button';
import Modal from '@/components/ui/Modal/Modal';
import {
  isSourceOwned,
  type HubAttribute,
  type SourceSystem,
} from '@/pages/AttributeManagementHub/hubData';
import { CONNECT_SOURCE_OPTIONS } from './mvpTerms';
import styles from './MvpSourceSection.module.scss';

export interface MvpSourceSectionProps {
  attribute: HubAttribute;
  /** Demo connect — records the chosen source for the running prototype. */
  onConnect: (system: SourceSystem) => void;
}

/**
 * Connect affordance for manually-managed attributes (LDAP / SAML only).
 * Synced attributes use MvpManagedSourceBar at the top of the Definition panel.
 */
export default function MvpSourceSection({
  attribute,
  onConnect,
}: MvpSourceSectionProps) {
  const [connectOpen, setConnectOpen] = useState(false);

  if (isSourceOwned(attribute)) {
    return null;
  }

  return (
    <div className={styles['source']}>
      <button
        type="button"
        className={styles['source__connect']}
        onClick={() => setConnectOpen(true)}
      >
        <Icon size="16" glyph={<PowerPlugOutlineIcon />} />
        Connect an external source
      </button>

      {connectOpen && (
        <div className={styles['connect']} role="presentation">
          <button
            type="button"
            className={styles['connect__scrim']}
            aria-label="Close"
            onClick={() => setConnectOpen(false)}
          />
          <div className={styles['connect__dialog']}>
            <Modal
              size="Small"
              title="Connect an external source"
              subtitle="Sync this attribute's options and values from an identity provider."
              onClose={() => setConnectOpen(false)}
              footer={
                <Button
                  emphasis="Tertiary"
                  onClick={() => setConnectOpen(false)}
                >
                  Cancel
                </Button>
              }
            >
              <div className={styles['connect__body']}>
                <p className={styles['connect__lead']}>
                  Choose a provider. Once connected, options and assigned values
                  become read-only in Mattermost and are managed at the source.
                </p>
                <div className={styles['connect__options']}>
                  {CONNECT_SOURCE_OPTIONS.map((opt) => (
                    <button
                      key={opt.system}
                      type="button"
                      className={styles['connect__option']}
                      onClick={() => {
                        onConnect(opt.system);
                        setConnectOpen(false);
                      }}
                    >
                      <span className={styles['connect__option-title']}>
                        {opt.title}
                      </span>
                      <span className={styles['connect__option-desc']}>
                        {opt.description}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </Modal>
          </div>
        </div>
      )}
    </div>
  );
}
