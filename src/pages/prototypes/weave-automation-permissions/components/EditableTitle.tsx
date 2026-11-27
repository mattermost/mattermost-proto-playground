import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import PencilOutlineIcon from '@mattermost/compass-icons/components/pencil-outline';
import { Icon } from '@mattermost/compass-ui/components/icon';
import styles from './EditableTitle.module.scss';

interface EditableTitleProps {
  value: string;
  onChange: (next: string) => void;
  /** What is being renamed, for the accessible names ("group"). */
  noun?: string;
}

/**
 * Page title that renames in place: hover shows a pencil, clicking anywhere on
 * the name swaps it for an input. Enter or blur commits, Escape cancels, and an
 * empty name reverts. Compass has no inline-edit control, so this is
 * prototype-only; it inherits the heading's type so the swap doesn't shift.
 */
export default function EditableTitle({
  value,
  onChange,
  noun = 'item',
}: EditableTitleProps) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  // Escape unmounts the focused input, which can fire a blur that would commit.
  const cancelled = useRef(false);

  useEffect(() => {
    if (editing) inputRef.current?.select();
  }, [editing]);

  function start() {
    setText(value);
    cancelled.current = false;
    setEditing(true);
  }

  function commit() {
    if (cancelled.current) return;
    const next = text.trim();
    if (next && next !== value) onChange(next);
    setEditing(false);
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      commit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancelled.current = true;
      setEditing(false);
    }
  }

  if (editing) {
    return (
      <span className={styles['editable-title__field']} data-value={text}>
        <input
          ref={inputRef}
          className={styles['editable-title__input']}
          value={text}
          aria-label={`Rename ${noun}`}
          onChange={(e) => setText(e.target.value)}
          onBlur={commit}
          onKeyDown={onKeyDown}
        />
      </span>
    );
  }

  return (
    <button
      type="button"
      className={styles['editable-title__trigger']}
      aria-label={`Rename ${noun}: ${value}`}
      onClick={start}
    >
      <span className={styles['editable-title__text']}>{value}</span>
      <span className={styles['editable-title__pencil']} aria-hidden="true">
        <Icon glyph={<PencilOutlineIcon />} size="16" />
      </span>
    </button>
  );
}
