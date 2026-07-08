import { useState } from 'react';
import Modal from '@/components/ui/Modal/Modal';
import Button from '@/components/ui/Button/Button';
import Radio from '@/components/ui/Radio/Radio';
import LabelTag from '@/components/ui/LabelTag/LabelTag';
import SectionNotice from '@/components/ui/SectionNotice/SectionNotice';
import {
  isSourceOwned,
  type HubAttribute,
  type SourceSystem,
} from '@/pages/AttributeManagementHub/hubData';
import styles from './ConnectSourceModal.module.scss';

export interface SourceProviderOption {
  id: string;
  label: string;
  description: string;
  system?: SourceSystem;
}

export const SOURCE_PROVIDER_OPTIONS: SourceProviderOption[] = [
  {
    id: 'ldap',
    label: 'LDAP directory',
    description: 'Map an LDAP attribute to these options.',
    system: 'LDAP',
  },
  {
    id: 'saml',
    label: 'SAML identity provider',
    description:
      'Map a SAML assertion attribute to these options when users sign in.',
    system: 'SAML',
  },
  {
    id: 'scim',
    label: 'SCIM provisioning',
    description:
      'Provision and keep values in sync through your identity provider’s SCIM API.',
    system: 'SCIM',
  },
  {
    id: 'uas',
    label: 'UAS provider (plugin)',
    description: 'Connect a User Attribute Service plugin installed on this server.',
    system: 'UAS',
  },
  {
    id: 'custom',
    label: 'Custom integration',
    description: 'Use a server-side integration, webhook, or other connector.',
  },
];

export interface ConnectSourceModalProps {
  attribute: HubAttribute;
  mode?: 'connect' | 'manage';
  onClose: () => void;
}

function ConnectionDetails({ attribute }: { attribute: HubAttribute }) {
  const { source } = attribute;
  const connected = source.state === 'Synced';

  return (
    <dl className={styles['connect__details']}>
      <div className={styles['connect__detail-row']}>
        <dt>Status</dt>
        <dd className={styles['connect__detail-chips']}>
          <LabelTag
            label={connected ? 'Connected' : 'Connection broken'}
            type={connected ? 'Success' : 'Danger'}
            size="Small"
          />
        </dd>
      </div>

      <div className={styles['connect__detail-row']}>
        <dt>Provider</dt>
        <dd>{source.system ?? 'External source'}</dd>
      </div>

      {!connected && (
        <div className={styles['connect__detail-row']}>
          <dt>Details</dt>
          <dd className={styles['connect__warning']}>
            This connection isn’t syncing. Reconfigure it to restore sync.
          </dd>
        </div>
      )}
    </dl>
  );
}

/**
 * Stub entry point for the external-source setup wizard.
 * Provider selection is in scope; the multi-step connection flow is not.
 */
export default function ConnectSourceModal({
  attribute,
  mode = 'connect',
  onClose,
}: ConnectSourceModalProps) {
  const [selected, setSelected] = useState<string>(SOURCE_PROVIDER_OPTIONS[0].id);
  const [showStub, setShowStub] = useState(false);
  const [reconfiguring, setReconfiguring] = useState(false);
  const provider = SOURCE_PROVIDER_OPTIONS.find((option) => option.id === selected);
  const synced = isSourceOwned(attribute);
  const showDetails = mode === 'manage' && synced && !reconfiguring && !showStub;

  const title = showDetails
    ? 'Manage external connection'
    : mode === 'manage'
      ? 'Reconfigure external connection'
      : 'Connect external source';

  const subtitle = showDetails
    ? `${attribute.name || 'This attribute'} · ${attribute.source.system ?? 'External'}`
    : mode === 'manage'
      ? `${attribute.name || 'This attribute'} · choose a provider to reconfigure`
      : `${attribute.name || 'New attribute'} · choose where values should sync from`;

  return (
    <div className={styles['connect']} role="presentation">
      <button
        type="button"
        className={styles['connect__scrim']}
        aria-label="Close"
        onClick={onClose}
      />
      <div className={styles['connect__dialog']}>
        <Modal
          size="Small"
          title={title}
          subtitle={subtitle}
          onClose={onClose}
          footer={
            <div className={styles['connect__footer']}>
              {showDetails ? (
                <>
                  <Button emphasis="Tertiary" onClick={onClose}>
                    Close
                  </Button>
                  <Button emphasis="Secondary" onClick={() => setReconfiguring(true)}>
                    Reconfigure
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    emphasis="Tertiary"
                    onClick={() => {
                      if (reconfiguring) {
                        setReconfiguring(false);
                        setShowStub(false);
                        return;
                      }
                      onClose();
                    }}
                  >
                    {reconfiguring ? 'Back' : 'Cancel'}
                  </Button>
                  <Button
                    emphasis="Primary"
                    disabled={!selected}
                    onClick={() => setShowStub(true)}
                  >
                    Continue
                  </Button>
                </>
              )}
            </div>
          }
        >
          {showDetails ? (
            <ConnectionDetails attribute={attribute} />
          ) : showStub ? (
            <SectionNotice
              type="Info"
              title="Connection wizard not built in this prototype"
              description={`The ${provider?.label ?? 'external source'} setup flow — field mapping, cadence, credentials, and test sync — opens in a dedicated modal wizard in production. This prototype stops here.`}
            />
          ) : (
            <div className={styles['connect__list']}>
              {SOURCE_PROVIDER_OPTIONS.map((option) => (
                <label key={option.id} className={styles['connect__option']}>
                  <Radio
                    checked={selected === option.id}
                    onChange={() => setSelected(option.id)}
                  />
                  <div className={styles['connect__option-body']}>
                    <span className={styles['connect__option-name']}>
                      {option.label}
                    </span>
                    <span className={styles['connect__option-desc']}>
                      {option.description}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}
