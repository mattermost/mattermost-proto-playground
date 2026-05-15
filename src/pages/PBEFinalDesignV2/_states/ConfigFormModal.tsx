import type { ReactNode } from 'react';
import PowerPlugOutlineIcon from '@mattermost/compass-icons/components/power-plug-outline';
import CheckCircleOutlineIcon from '@mattermost/compass-icons/components/check-circle-outline';
import Modal from '@/components/ui/Modal/Modal';
import Button from '@/components/ui/Button/Button';
import TextInput from '@/components/ui/TextInput/TextInput';
import Select from '@/components/ui/Select/Select';
import SectionNotice from '@/components/ui/SectionNotice/SectionNotice';
import Icon from '@/components/ui/Icon/Icon';
import styles from './ConfigFormModal.module.scss';

export interface ConfigFormDefaults {
  name: string;
  tokenLabel: string;
  pin: string;
  kekLabel: string;
  lease: string;
}

export interface ConfigFormModalProps {
  /** Modal title — "Add Configuration" or "Edit Configuration". */
  title: ReactNode;
  /** Toggles the SectionNotice and primary button label. Default: false. */
  isAdd?: boolean;
  /** Pre-fill values. Defaults to empty (Add). */
  defaults?: ConfigFormDefaults;
  /** Called when the user cancels or closes the modal. */
  onCancel: () => void;
  /** Called when the user saves / adds the configuration. */
  onSave: () => void;
  /** Optional: when true, render the inline test-success indicator. */
  showTestSuccess?: boolean;
  /** Test Configuration click handler. */
  onTest?: () => void;
}

const EMPTY: ConfigFormDefaults = {
  name: '',
  tokenLabel: '',
  pin: '',
  kekLabel: '',
  lease: '60',
};

interface FieldProps {
  helpText?: ReactNode;
  children: ReactNode;
}

/**
 * Small page-local wrapper that renders helper copy below a form
 * control. The control owns its own (floating) label.
 */
function Field({ helpText, children }: FieldProps) {
  return (
    <div className={styles['config-form__field']}>
      {children}
      {helpText && (
        <span className={styles['config-form__field-help']}>{helpText}</span>
      )}
    </div>
  );
}

/**
 * Add / Edit Configuration sub-modal (States 4 and 5). Rendered inside
 * `StackedModalLayer` by the parent state so it stacks above the EM
 * modal's overlay.
 */
export default function ConfigFormModal({
  title,
  isAdd = false,
  defaults = EMPTY,
  onCancel,
  onSave,
  showTestSuccess = false,
  onTest,
}: ConfigFormModalProps) {
  return (
    <Modal
      size="Small"
      title={title}
      onClose={onCancel}
      footer={
        <div className={styles['config-form__footer']}>
          <Button emphasis="Tertiary" onClick={onCancel}>
            Cancel
          </Button>
          <Button emphasis="Primary" onClick={onSave}>
            {isAdd ? 'Add Configuration' : 'Save'}
          </Button>
        </div>
      }
    >
      <div className={styles['config-form']}>
        {isAdd && (
          <SectionNotice
            type="Info"
            title="Multiple configurations support is coming soon"
            description="This form shows the full configuration flow for preview purposes."
          />
        )}

        <Field
          helpText="Select the Key Manager for this configuration. Additional Key Manager types will be supported in future releases."
        >
          <Select label="Key Manager" defaultValue="pkcs11">
            <option value="pkcs11">PKCS#11 — libsofthsm2.so (Active)</option>
            <option value="aws" disabled>
              AWS KMS (Coming Soon)
            </option>
            <option value="azure" disabled>
              Azure Key Vault (Coming Soon)
            </option>
            <option value="gcloud" disabled>
              Google Cloud KMS (Coming Soon)
            </option>
          </Select>
        </Field>

        <Field>
          <TextInput
            label="Configuration Name"
            defaultValue={defaults.name}
            placeholder="e.g., Program Alpha"
          />
        </Field>

        <Field helpText="The token label for the Key Manager partition.">
          <TextInput
            label="Token Label"
            defaultValue={defaults.tokenLabel}
            placeholder="Enter the token label provisioned on your Key Manager"
          />
        </Field>

        <Field helpText="The crypto-user PIN for the Key Manager partition.">
          <TextInput
            label="PIN"
            type="password"
            defaultValue={defaults.pin}
          />
        </Field>

        <Field helpText="The label of the Key Encryption Key on the Key Manager.">
          <TextInput
            label="KEK Label"
            defaultValue={defaults.kekLabel}
            placeholder="Enter the Key Encryption Key label"
          />
        </Field>

        <Field helpText="Minutes before the Data Encryption Key is refreshed from the Key Manager.">
          <TextInput
            label="DEK Lease Duration (minutes)"
            defaultValue={defaults.lease}
          />
        </Field>

        <div className={styles['config-form__test-row']}>
          <Button
            size="Small"
            emphasis="Secondary"
            leadingIcon={<Icon size="16" glyph={<PowerPlugOutlineIcon />} />}
            onClick={onTest}
          >
            Test Configuration
          </Button>
          {showTestSuccess && (
            <span className={styles['config-form__test-success']}>
              <CheckCircleOutlineIcon size={16} aria-hidden />
              Configuration test successful
            </span>
          )}
        </div>
      </div>
    </Modal>
  );
}
