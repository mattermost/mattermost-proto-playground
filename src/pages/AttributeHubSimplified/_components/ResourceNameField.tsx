import { useState } from 'react';
import PencilOutlineIcon from '@mattermost/compass-icons/components/pencil-outline';
import Icon from '@/components/ui/Icon/Icon';
import TextInput from '@/components/ui/TextInput/TextInput';
import type { HubAttribute, ResourceKind } from '@/pages/AttributeManagementHub/hubData';
import { resourceName, setResourceName } from './simplifiedModel';
import styles from './ResourceNameField.module.scss';

export interface ResourceNameFieldProps {
  attribute: HubAttribute;
  resource: ResourceKind;
  /** Inline field for Advanced section; default is a quiet expand toggle. */
  variant?: 'toggle' | 'inline';
}

/**
 * "Name on {resource}" — per-resource naming. Default: collapsed toggle;
 * inline variant renders inside Advanced (MVP-aligned).
 */
export default function ResourceNameField({
  attribute,
  resource,
  variant = 'toggle',
}: ResourceNameFieldProps) {
  const existing = resourceName(attribute.id, resource);
  const [open, setOpen] = useState(existing.length > 0 || variant === 'inline');
  const [draft, setDraft] = useState(existing);

  if (variant === 'inline') {
    return (
      <div className={[styles['name'], styles['name--inline']].join(' ')}>
        <span className={styles['name__label']}>Name on {resource}</span>
        <div className={styles['name__field']}>
          <TextInput
            className={styles['name__input']}
            size="Medium"
            placeholder={attribute.name || 'Attribute name'}
            value={draft}
            aria-label={`Name on ${resource}`}
            onChange={(e) => {
              setDraft(e.target.value);
              setResourceName(attribute.id, resource, e.target.value);
            }}
          />
          <p className={styles['name__hint']}>
            Show a different label for this attribute on{' '}
            {resource.toLowerCase()} (e.g. “Clearance” on users for a
            “Classification” attribute). Leave blank to use the attribute name.
          </p>
        </div>
      </div>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        className={styles['name__toggle']}
        onClick={() => setOpen(true)}
      >
        <Icon size="12" glyph={<PencilOutlineIcon />} />
        Rename on {resource.toLowerCase()}
      </button>
    );
  }

  return (
    <div className={styles['name']}>
      <span className={styles['name__label']}>Name on {resource.toLowerCase()}</span>
      <TextInput
        size="Small"
        placeholder={attribute.name || 'Same as attribute name'}
        value={draft}
        aria-label={`Name on ${resource}`}
        onChange={(e) => {
          setDraft(e.target.value);
          setResourceName(attribute.id, resource, e.target.value);
        }}
      />
      <span className={styles['name__hint']}>
        Shown to people in place of “{attribute.name || 'this attribute'}” on{' '}
        {resource.toLowerCase()}. Advanced — most attributes keep one name.
      </span>
    </div>
  );
}
