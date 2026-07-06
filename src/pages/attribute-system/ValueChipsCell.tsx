import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import Icon from '@/components/ui/Icon/Icon';
import Chip from '@/components/ui/Chip/Chip';
import RankedValueChip from '@/components/ui/RankedValueChip/RankedValueChip';
import TextInput from '@/components/ui/TextInput/TextInput';
import {
  hasMaskedValuesForCaller,
  isExternallyManagedCatalog,
  MASKED_VALUE_TOKEN,
  visibleValuesForCaller,
} from './data';
import type { AttrDef, AttrValue } from './data';
import styles from './AttributeSystem.module.scss';

/**
 * Inline value-catalog chips for a table cell. Plan §4.1 + §12.1.
 *
 *  - Renders each `def.values` as a chip; `RankedValueChip` for Ranked, `Chip`
 *    otherwise. Each chip has an inline remove (`<button aria-label="Remove {value}">`).
 *  - Trailing `+` opens a small inline input/picker to add a value.
 *  - Masking-aware: when `hasMaskedValuesForCaller(def)`, render a single
 *    masked chip with `aria-label="Masked value"` (never announce the bullets).
 *  - Read-only when the value catalog is externally managed (LDAP/plugin) or
 *    `read==='Plugin-managed'`. For Text/Date types show "Free text" / "Date".
 */

export interface ValueChipsCellProps {
  def: AttrDef;
  onPatch: (values: AttrValue[]) => void;
}

function slug(label: string): string {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export default function ValueChipsCell({ def, onPatch }: ValueChipsCellProps) {
  if (def.type === 'Text') {
    return <span className={styles.valueChips__placeholder}>Free text</span>;
  }
  if (def.type === 'Date') {
    return <span className={styles.valueChips__placeholder}>Date</span>;
  }
  if (def.type === 'Image' || def.type === 'Email') {
    return <span className={styles.valueChips__placeholder}>—</span>;
  }

  const external = isExternallyManagedCatalog(def);
  const readOnly = external || def.read === 'Plugin-managed';
  const visible = visibleValuesForCaller(def);
  const masked = hasMaskedValuesForCaller(def);
  const ranked = def.type === 'Ranked';

  return (
    <ChipsRow
      def={def}
      onPatch={onPatch}
      readOnly={readOnly}
      ranked={ranked}
      visible={visible}
      masked={masked}
    />
  );
}

function ChipsRow({
  def,
  onPatch,
  readOnly,
  ranked,
  visible,
  masked,
}: {
  def: AttrDef;
  onPatch: (values: AttrValue[]) => void;
  readOnly: boolean;
  ranked: boolean;
  visible: AttrValue[];
  masked: boolean;
}) {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const addBtnRef = useRef<HTMLButtonElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (adding) inputRef.current?.focus();
  }, [adding]);

  function remove(valId: string) {
    const next = def.values.filter((v) => v.id !== valId);
    onPatch(next);
    // Return focus to the add affordance after removal (plan §12.1).
    requestAnimationFrame(() => addBtnRef.current?.focus());
  }

  function commitAdd() {
    const trimmed = draft.trim();
    if (!trimmed) {
      setAdding(false);
      setDraft('');
      return;
    }
    const id = `${slug(trimmed) || 'value'}-${def.values.length}`;
    const next: AttrValue[] = [
      ...def.values,
      {
        id,
        label: trimmed,
        rank: ranked ? def.values.length + 1 : undefined,
      },
    ];
    onPatch(next);
    setDraft('');
    setAdding(false);
    requestAnimationFrame(() => addBtnRef.current?.focus());
  }

  function onInputKey(e: ReactKeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      commitAdd();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setDraft('');
      setAdding(false);
      requestAnimationFrame(() => addBtnRef.current?.focus());
    }
  }

  return (
    <div ref={rowRef} className={styles.valueChips}>
      {visible.map((v) =>
        ranked ? (
          <RankedValueChip
            key={v.id}
            label={v.label}
            rank={v.rank}
            onRemove={readOnly ? undefined : () => remove(v.id)}
            removeLabel={`Remove ${v.label}`}
          />
        ) : (
          <Chip
            key={v.id}
            size="Small"
            onRemove={readOnly ? undefined : () => remove(v.id)}
            removeLabel={`Remove ${v.label}`}
          >
            {v.label}
          </Chip>
        ),
      )}

      {masked && (
        <span
          className={styles.valueChips__masked}
          role="img"
          aria-label="Masked value"
          title="One or more values are hidden from you"
        >
          {MASKED_VALUE_TOKEN}
        </span>
      )}

      {visible.length === 0 && !masked && readOnly && (
        <span className={styles.valueChips__placeholder}>—</span>
      )}

      {!readOnly && !adding && (
        <button
          ref={addBtnRef}
          type="button"
          className={styles.valueChips__add}
          aria-label={`Add value to ${def.name}`}
          onClick={() => setAdding(true)}
        >
          <Icon size="12" glyph={<PlusIcon />} />
        </button>
      )}

      {!readOnly && adding && (
        <span className={styles.valueChips__addInput}>
          <TextInput
            ref={inputRef}
            size="Small"
            value={draft}
            placeholder="New value"
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={onInputKey}
            onBlur={commitAdd}
            aria-label={`New value for ${def.name}`}
          />
        </span>
      )}
    </div>
  );
}
