/**
 * Outbound-only (not for `main`): wraps MessageInput with a `tel:` autocomplete
 * that lists all contacts × phones and inserts `tel:<number>` on click.
 */
import { useCallback, useRef, useState } from 'react';
import Icon from '@/components/ui/Icon/Icon';
import MenuItem from '@/components/ui/MenuItem/MenuItem';
import MessageInput from '@/components/ui/MessageInput';
import UserAvatar from '@/components/ui/UserAvatar/UserAvatar';
import { useOutsideClose } from '@/hooks/useOutsideClose';
import { CONTACTS } from '@/pages/OutboundCalls/outboundCallData';
import { phoneGlyphFor } from '@/pages/OutboundCalls/OutboundCallPhoneGlyphs';
import type { Contact, Phone } from '@/types/outboundCall';
import styles from './OutboundCalls.module.scss';

type TelToken = { start: number; end: number; query: string };

type Suggestion = {
  contact: Contact;
  phone: Phone;
  phoneIndex: number;
};

const TEL_REGEX = /(?<=^|\s)tel:([^\s]*)$/;

function detectTelToken(value: string, cursor: number): TelToken | null {
  const before = value.slice(0, cursor);
  const match = TEL_REGEX.exec(before);
  if (!match) return null;
  return { start: match.index, end: cursor, query: match[1] };
}

function digitsOnly(s: string): string {
  return s.replace(/\D/g, '');
}

function buildSuggestions(query: string): Suggestion[] {
  const q = query.trim().toLowerCase();
  const qDigits = digitsOnly(query);
  const out: Suggestion[] = [];
  for (const c of CONTACTS) {
    for (let i = 0; i < c.phones.length; i++) {
      const p = c.phones[i];
      if (q.length === 0) {
        out.push({ contact: c, phone: p, phoneIndex: i });
        continue;
      }
      const nameMatch = c.name.toLowerCase().includes(q);
      const handleMatch = c.handle.toLowerCase().includes(q);
      const labelMatch = p.label.toLowerCase().includes(q);
      const numberMatch = qDigits.length > 0 && digitsOnly(p.number).includes(qDigits);
      if (nameMatch || handleMatch || labelMatch || numberMatch) {
        out.push({ contact: c, phone: p, phoneIndex: i });
      }
    }
  }
  return out;
}

export interface TelAutocompleteMessageInputProps {
  placeholder?: string;
}

export default function TelAutocompleteMessageInput({
  placeholder,
}: TelAutocompleteMessageInputProps) {
  const [value, setValue] = useState('');
  const [token, setToken] = useState<TelToken | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  const recompute = useCallback((nextValue: string) => {
    const el = textareaRef.current;
    if (!el) {
      setToken(null);
      return;
    }
    const cursor = el.selectionStart ?? nextValue.length;
    const collapsed = el.selectionStart === el.selectionEnd;
    setToken(collapsed ? detectTelToken(nextValue, cursor) : null);
  }, []);

  const handleChange = (next: string) => {
    setValue(next);
    recompute(next);
  };

  const handleSelectionChange = () => {
    recompute(value);
  };

  useOutsideClose(wrapRef, token != null, () => setToken(null));

  const suggestions = token ? buildSuggestions(token.query) : [];
  const open = token != null && suggestions.length > 0;

  const insert = (phone: Phone) => {
    if (!token) return;
    const inserted = `tel:${phone.number}`;
    const next = value.slice(0, token.start) + inserted + value.slice(token.end);
    const cursor = token.start + inserted.length;
    setValue(next);
    setToken(null);
    requestAnimationFrame(() => {
      const el = textareaRef.current;
      if (!el) return;
      el.focus();
      el.setSelectionRange(cursor, cursor);
    });
  };

  return (
    <div className={styles['tel-autocomplete']} ref={wrapRef}>
      {open && (
        <ul
          className={styles['tel-autocomplete__menu']}
          role="listbox"
          aria-label="Phone number suggestions"
        >
          {suggestions.map((s) => (
            <li
              key={`${s.contact.id}:${s.phoneIndex}`}
              className={styles['tel-autocomplete__item']}
            >
              <MenuItem
                role="option"
                label={s.contact.name}
                secondaryLabel={`${s.phone.label} · ${s.phone.number}`}
                leadingVisual={
                  <UserAvatar src={s.contact.avatar} alt={s.contact.name} size="24" />
                }
                trailingVisual={
                  <Icon
                    glyph={phoneGlyphFor(s.phone.kind, styles['phone-icon--secure'])}
                    size="16"
                  />
                }
                onClick={() => insert(s.phone)}
              />
            </li>
          ))}
        </ul>
      )}
      <MessageInput
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        onSelectionChange={handleSelectionChange}
        inputRef={textareaRef}
      />
    </div>
  );
}
