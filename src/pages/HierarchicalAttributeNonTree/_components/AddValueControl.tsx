import { useState } from 'react';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import Icon from '@/components/ui/Icon/Icon';
import Button from '@/components/ui/Button/Button';
import TextInput from '@/components/ui/TextInput/TextInput';
import styles from './AddValueControl.module.scss';

export interface AddValueControlProps {
  /** Adds a new top-level value (root). Returns nothing. */
  onAdd: (label: string) => void;
  /** Emphasis of the add button when collapsed. Default Tertiary. */
  emphasis?: 'Primary' | 'Secondary' | 'Tertiary';
}

/**
 * Create-from-scratch affordance shared by all three representations. A new
 * value is always added as a top-level root with no parents — the admin then
 * links it under a parent using each surface's own edge-editing gesture
 * (chip-picker in the table/list, a cell toggle in the matrix).
 */
export default function AddValueControl({
  onAdd,
  emphasis = 'Tertiary',
}: AddValueControlProps) {
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState('');

  const commit = () => {
    const trimmed = label.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setLabel('');
    setOpen(false);
  };

  if (!open) {
    return (
      <Button
        emphasis={emphasis}
        size="Small"
        leadingIcon={<Icon size="16" glyph={<PlusIcon />} />}
        onClick={() => setOpen(true)}
      >
        Add value
      </Button>
    );
  }

  return (
    <div className={styles['add']}>
      <TextInput
        size="Small"
        value={label}
        placeholder="New value name…"
        aria-label="New value name"
        onChange={(e) => setLabel(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commit();
          if (e.key === 'Escape') {
            setOpen(false);
            setLabel('');
          }
        }}
      />
      <Button emphasis="Secondary" size="Small" disabled={!label.trim()} onClick={commit}>
        Add
      </Button>
      <Button
        emphasis="Tertiary"
        size="Small"
        onClick={() => {
          setOpen(false);
          setLabel('');
        }}
      >
        Cancel
      </Button>
    </div>
  );
}
