import type { HubAttribute } from '@/pages/AttributeManagementHub/hubData';
import Select from '@/components/ui/Select/Select';
import {
  editabilityLabel,
  editabilityOptionsFor,
  editabilityResources,
  plainPolicyCaveat,
  usersManagedBy,
  type ValueEditability,
} from './editabilityModel';
import { displayType } from './simplifiedModel';
import styles from './ValueEditabilityField.module.scss';

export interface ValueEditabilityFieldProps {
  attribute: HubAttribute;
  value: ValueEditability;
  onChange: (next: ValueEditability) => void;
}

export default function ValueEditabilityField({
  attribute,
  value,
  onChange,
}: ValueEditabilityFieldProps) {
  const type = displayType(attribute);
  const scope = editabilityResources(attribute);
  const managedBy = usersManagedBy(attribute);
  const caveat = plainPolicyCaveat(attribute, value);

  if (scope.length === 0) {
    return (
      <p className={styles['reflection']}>
        {managedBy
          ? `Values are set by ${managedBy}. Editability is controlled at the source.`
          : 'This attribute applies only to users. Editability follows who can set the value on the Users binding.'}
      </p>
    );
  }

  return (
    <div className={styles['editability']}>
      <Select
        size="Medium"
        width="fit"
        value={value}
        aria-label="Changing the value"
        onChange={(e) => onChange(e.target.value as ValueEditability)}
      >
        {editabilityOptionsFor(type).map((option) => (
          <option key={option} value={option}>
            {editabilityLabel(option, type)}
          </option>
        ))}
      </Select>

      <p className={styles['editability__scope']}>
        Applies to {scope.join(', ')}.
        {managedBy
          ? ` User values are set by ${managedBy} — editability there is controlled at the source.`
          : ''}
      </p>

      {caveat && <p className={styles['editability__caveat']}>{caveat}</p>}
    </div>
  );
}
