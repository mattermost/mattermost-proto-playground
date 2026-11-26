// [AI DRAFT] Plain-text drafting inside Policy expression. A prompt that
// becomes rules is shown in the table, not repeated here. A reply is shown
// only when the prompt can't be mapped, or it needs an answer.
import { useEffect, useId, useRef, useState } from 'react';
import CreationOutlineIcon from '@mattermost/compass-icons/components/creation-outline';
import SendIcon from '@mattermost/compass-icons/components/send';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { AI } from '../copy';
import { draftFromPrompt, type AiKind, type AiResult } from '../model/aiDraft';
import type { Group, Policy } from '../model/rules';
import type { Vocabulary } from '../model/vocabulary';
import styles from './CreateWithAi.module.scss';

/** The table already shows a mapped rule. Speak only when it can't, or when asked. */
function needsReply(kind: AiKind): boolean {
  return kind === 'question' || kind === 'unmatched' || kind === 'unchanged';
}

export default function CreateWithAi({
  policy,
  vocab,
  onApply,
}: {
  policy: Policy;
  vocab: Vocabulary;
  /** Writes the drafted rules into the policy. */
  onApply: (root: Group) => void;
}) {
  const headingId = useId();
  const inputId = useId();
  const [draft, setDraft] = useState('');
  const [notice, setNotice] = useState<AiResult | null>(null);
  const [landed, setLanded] = useState<'created' | 'updated' | 'removed' | null>(null);
  const [busy, setBusy] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  const policyRef = useRef(policy);
  policyRef.current = policy;
  const applyRef = useRef(onApply);
  applyRef.current = onApply;

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const send = () => {
    const prompt = draft.trim();
    if (!prompt || busy) return;
    setDraft('');
    setBusy(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      const current = policyRef.current;
      const result = draftFromPrompt(prompt, current, vocab);
      if (result.root) applyRef.current(result.root);
      setNotice(needsReply(result.kind) ? result : null);
      if (result.kind === 'created' || result.kind === 'updated' || result.kind === 'removed') {
        setLanded(result.kind);
      }
      setBusy(false);
    }, 350);
  };

  return (
    <section className={styles['ai']} aria-labelledby={headingId}>
      <div className={styles['ai__intro']}>
        <h3 id={headingId} className={styles['ai__title']}>
          <Icon glyph={<CreationOutlineIcon />} size="16" />
          {AI.title}
        </h3>
        {notice || busy ? null : (
          <p className={styles['ai__hint']} role={landed ? 'status' : undefined}>
            {landed === 'created' ? AI.hintAdded : landed ? AI.hintUpdated : AI.hint}
          </p>
        )}
      </div>
      {notice || busy ? (
        <div role="status">
          {notice ? <AiReply result={notice} /> : null}
          {busy ? <p className={styles['ai__pending']}>{AI.sending}…</p> : null}
        </div>
      ) : null}
      <form
        className={styles['ai__composer']}
        onSubmit={(event) => {
          event.preventDefault();
          send();
        }}
      >
        <input
          id={inputId}
          className={styles['ai__field']}
          type="text"
          value={draft}
          placeholder={notice || landed ? AI.followPlaceholder : AI.placeholder}
          aria-label={notice || landed ? AI.followPlaceholder : AI.placeholder}
          autoFocus
          onChange={(event) => setDraft(event.target.value)}
        />
        <button
          type="submit"
          className={styles['ai__send']}
          disabled={!draft.trim() || busy}
          aria-label={busy ? AI.sending : AI.send}
        >
          <Icon glyph={<SendIcon />} size="16" />
        </button>
      </form>
    </section>
  );
}

function leadFor(result: AiResult): string {
  const count = result.rules.length;
  switch (result.kind) {
    case 'created':
      return AI.created(count);
    case 'updated':
      return AI.updated(count);
    case 'removed':
      return AI.removed(count);
    case 'unchanged':
      return AI.unchanged;
    case 'question':
      return AI.question;
    case 'unmatched':
      return result.body;
    default: {
      const exhausted: never = result.kind;
      return exhausted;
    }
  }
}

function AiReply({ result }: { result: AiResult }) {
  const lead = leadFor(result);
  const showBody = result.kind !== 'unmatched' && result.body.length > 0;
  return (
    <div className={styles['ai__reply']}>
      <p className={styles['ai__lead']}>{lead}</p>
      {showBody ? <p className={styles['ai__body']}>{result.body}</p> : null}
      {result.expression ? (
        <div className={styles['ai__expression']}>
          <span className={styles['ai__who']}>{AI.expression}</span>
          <pre className={styles['ai__code']}>{result.expression}</pre>
        </div>
      ) : null}
    </div>
  );
}
