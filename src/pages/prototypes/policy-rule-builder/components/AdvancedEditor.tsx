// [AI DRAFT] Advanced mode: editable CEL with guardrails (designer, intake Q7).
//
// The shipped editor is a Monaco code editor with autocomplete and a debounced
// /access_control_policies/cel/check. Compass has no code editor, so this is a
// TextArea with a Compass menu for completions. Guardrails:
//   - completions are grouped by party, using the active vocabulary, so the
//     names an admin types are the names Simple mode shows
//   - syntax and type errors show inline (Compass ErrorMessage, role="alert")
//   - an expression Simple mode can't show stays here with a readback. It is
//     never shown as a partial table, because a dropped clause widens the policy
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react';
import { ErrorMessage } from '@mattermost/compass-ui/components/error-message';
import { MenuGroupHeading } from '@mattermost/compass-ui/components/menu-group-heading';
import { MenuItem } from '@mattermost/compass-ui/components/menu-item';
import { PopoverMenu } from '@mattermost/compass-ui/components/popover-menu';
import InformationOutlineIcon from '@mattermost/compass-icons/components/information-outline';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { TextArea } from '@mattermost/compass-ui/components/text-area';
import type { PartyId } from '../model/catalog';
import {
  celCompletions,
  parseCel,
  type GroupingMode,
  type ParseOptions,
  type ParseResult,
} from '../model/celParse';
import type { Vocabulary } from '../model/vocabulary';
import { ADVANCED, SAVE_BLOCK } from '../copy';
import styles from './AdvancedEditor.module.scss';

export interface AdvancedEditorProps {
  value: string;
  onChange: (cel: string, result: ParseResult) => void;
  vocab: Vocabulary;
  grouping: GroupingMode;
  /** Parties the policy's permissions can supply, for completions. */
  parties: PartyId[];
  parseOptions?: ParseOptions;
  /** Id of the status line (error or "can't show in Simple mode"), for aria-describedby. */
  statusId?: string;
  /**
   * Expression field only. Skips the prototype's advanced-mode updates:
   * party-grouped completions, line-and-column errors, and the extra
   * "can't show as a table" sentence. Simple still disables when the
   * expression can't be a table, with the shipped reason.
   */
  plain?: boolean;
}

interface Completion {
  path: string;
  label: string;
  heading: string;
}

function lineAndColumn(src: string, at: number): { line: number; col: number } {
  const before = src.slice(0, at);
  const lines = before.split('\n');
  return { line: lines.length, col: lines[lines.length - 1].length + 1 };
}

export default function AdvancedEditor({
  value,
  onChange,
  vocab,
  grouping,
  parties,
  parseOptions,
  statusId = 'prb-cel-status',
  plain = false,
}: AdvancedEditorProps) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [caret, setCaret] = useState<number | null>(null);
  const [active, setActive] = useState(0);
  const [dismissed, setDismissed] = useState(false);
  const result = useMemo(
    () => parseCel(value, vocab, grouping, parseOptions),
    [value, vocab, grouping, parseOptions],
  );

  const all = useMemo<Completion[]>(
    () =>
      celCompletions(vocab, parties).flatMap((g) =>
        g.items.map((i) => ({ ...i, heading: g.heading })),
      ),
    [vocab, parties],
  );

  // The word being typed at the caret: letters, digits, underscores, dots.
  const prefix = useMemo(() => {
    if (caret === null) return '';
    const m = /[A-Za-z_][A-Za-z0-9_.]*$/.exec(value.slice(0, caret));
    return m ? m[0] : '';
  }, [value, caret]);

  const matches = useMemo(
    () =>
      prefix.length < 2
        ? []
        : all
            .filter((c) => c.path.startsWith(prefix) && c.path !== prefix)
            .slice(0, 8),
    [all, prefix],
  );
  const open = matches.length > 0 && !dismissed;

  useEffect(() => setActive(0), [prefix]);

  const insert = useCallback(
    (c: Completion) => {
      if (caret === null) return;
      const start = caret - prefix.length;
      const next = value.slice(0, start) + c.path + value.slice(caret);
      const pos = start + c.path.length;
      onChange(next, parseCel(next, vocab, grouping, parseOptions));
      setDismissed(true);
      requestAnimationFrame(() => {
        ref.current?.focus();
        ref.current?.setSelectionRange(pos, pos);
        setCaret(pos);
      });
    },
    [caret, prefix, value, onChange, vocab, grouping, parseOptions],
  );

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (!open) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => (i + 1) % matches.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => (i - 1 + matches.length) % matches.length);
    } else if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();
      insert(matches[active]);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setDismissed(true);
    }
  };

  const headings = Array.from(new Set(matches.map((m) => m.heading)));
  const error =
    result.kind === 'error'
      ? (() => {
          const { line, col } = lineAndColumn(value, result.at);
          return ADVANCED.error(line, col, result.message);
        })()
      : null;
  const completionsOpen = open && !plain;

  return (
    <div className={styles['advanced-editor']}>
      <div className={styles['advanced-editor__field']}>
        <TextArea
          ref={ref}
          className={styles['advanced-editor__input']}
          aria-label={ADVANCED.ariaLabel}
          aria-invalid={result.kind === 'error' || undefined}
          aria-describedby={result.kind !== 'simple' ? statusId : undefined}
          aria-autocomplete={plain ? undefined : 'list'}
          aria-expanded={plain ? undefined : completionsOpen}
          aria-controls={completionsOpen ? 'prb-cel-completions' : undefined}
          invalid={result.kind === 'error'}
          rows={6}
          spellCheck={false}
          value={value}
          onChange={(e) => {
            setDismissed(false);
            setCaret(e.target.selectionStart);
            onChange(e.target.value, parseCel(e.target.value, vocab, grouping, parseOptions));
          }}
          onKeyDown={plain ? undefined : onKeyDown}
          onClick={(e) => setCaret(e.currentTarget.selectionStart)}
          onKeyUp={(e) => {
            if (!['ArrowDown', 'ArrowUp', 'Enter', 'Tab', 'Escape'].includes(e.key)) {
              setCaret(e.currentTarget.selectionStart);
            }
          }}
          onBlur={() => window.setTimeout(() => setDismissed(true), 150)}
        />
        {completionsOpen ? (
          <PopoverMenu
            id="prb-cel-completions"
            className={styles['advanced-editor__completions']}
            role="listbox"
            aria-label={ADVANCED.completionsLabel}
          >
            {headings.map((h) => (
              <div key={h}>
                <MenuGroupHeading label={h} />
                {matches
                  .filter((m) => m.heading === h)
                  .map((m) => (
                    <MenuItem
                      key={m.path}
                      label={m.path}
                      secondaryLabel={m.label}
                      secondaryLabelPosition="inline"
                      leadingElement={false}
                      active={matches.indexOf(m) === active}
                      role="option"
                      aria-selected={matches.indexOf(m) === active}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        insert(m);
                      }}
                    />
                  ))}
              </div>
            ))}
          </PopoverMenu>
        ) : null}
      </div>
      {!plain && error ? (
        <div id={statusId} className={styles['advanced-editor__error']}>
          <ErrorMessage message={error} />
        </div>
      ) : null}
      {plain && result.kind === 'error' ? (
        <div id={statusId} className={styles['advanced-editor__status']} role="status">
          {SAVE_BLOCK.celError}
        </div>
      ) : null}
      {plain && result.kind === 'complex' ? (
        <div id={statusId} className={styles['advanced-editor__status']} role="status">
          <Icon glyph={<InformationOutlineIcon />} size="16" />
          <strong>{ADVANCED.complexTooltip}</strong>
        </div>
      ) : null}
      {!plain && result.kind === 'complex' ? (
        // A status line, not another notice panel (cycle 1, VIS-5).
        // A div: the Compass Icon is a block element, so it can't sit in a <p> (QA2-8).
        <div id={statusId} className={styles['advanced-editor__status']} role="status">
          <Icon glyph={<InformationOutlineIcon />} size="16" />
          <span>
            <strong>{ADVANCED.complexTooltip}</strong> {ADVANCED.complexBody(result.reason)}
          </span>
        </div>
      ) : null}
    </div>
  );
}
