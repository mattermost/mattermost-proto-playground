// [AI DRAFT] Header drafting: a conversation that fills the whole policy
// and asks for the one piece that is still missing.
import { useEffect, useId, useRef, useState } from 'react';
import CloseIcon from '@mattermost/compass-icons/components/close';
import CreationOutlineIcon from '@mattermost/compass-icons/components/creation-outline';
import SendIcon from '@mattermost/compass-icons/components/send';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { IconButton } from '@mattermost/compass-ui/components/icon-button';
import { COACH } from '../copy';
import { policyBuild, coachTurn, type CoachPatch, type CoachTurn, type PolicyBuild } from '../model/policyCoach';
import type { Policy } from '../model/rules';
import type { Vocabulary } from '../model/vocabulary';
import styles from './PolicyCoach.module.scss';

interface Turn {
  id: number;
  prompt: string;
  result: CoachTurn | null;
}

export default function PolicyCoach({
  policy,
  description,
  vocab,
  onApply,
  onBuilding,
  onClose,
}: {
  policy: Policy;
  description: string;
  vocab: Vocabulary;
  onApply: (patch: CoachPatch) => void;
  /** Set while a prompt is writing section cards. Null when it only asks, or when the write finishes. */
  onBuilding: (build: PolicyBuild | null) => void;
  onClose: () => void;
}) {
  const headingId = useId();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const [draft, setDraft] = useState('');
  const [turns, setTurns] = useState<Turn[]>([]);
  const [busy, setBusy] = useState(false);
  const [pending, setPending] = useState<string | null>(null);
  const timers = useRef<number[]>([]);
  const policyRef = useRef(policy);
  policyRef.current = policy;
  const descriptionRef = useRef(description);
  descriptionRef.current = description;
  const applyRef = useRef(onApply);
  applyRef.current = onApply;
  const buildingRef = useRef(onBuilding);
  buildingRef.current = onBuilding;
  const seq = useRef(0);

  const clearTimers = () => {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
  };

  useEffect(
    () => () => {
      clearTimers();
      buildingRef.current(null);
    },
    [],
  );
  useEffect(() => {
    inputRef.current?.focus();
  }, []);
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [turns, busy]);

  const sendText = (text: string) => {
    const prompt = text.trim();
    if (!prompt || busy) return;
    const result = coachTurn(prompt, policyRef.current, descriptionRef.current, vocab);
    const build = policyBuild(result.patch);
    seq.current += 1;
    const id = seq.current;
    setDraft('');
    setBusy(true);
    setPending(build?.line ?? null);
    setTurns((current) => [...current, { id, prompt, result: null }]);
    buildingRef.current(build);
    clearTimers();
    // The light takes 2.8s, staggered down the page. Write the fields once it is on the cards, and leave it up until the last card has faded out.
    const applyAt = build ? 1500 : 400;
    const doneAt = build ? 3800 : 400;
    timers.current.push(
      window.setTimeout(() => {
        if (Object.keys(result.patch).length > 0) applyRef.current(result.patch);
      }, applyAt),
    );
    timers.current.push(
      window.setTimeout(() => {
        setTurns((current) => current.map((turn) => (turn.id === id ? { ...turn, result } : turn)));
        setBusy(false);
        setPending(null);
        buildingRef.current(null);
      }, doneAt),
    );
  };

  const send = () => sendText(draft);

  return (
    <aside
      id="prb-coach"
      className={styles['coach']}
      aria-labelledby={headingId}
      onKeyDown={(event) => {
        if (event.key === 'Escape') onClose();
      }}
    >
      <header className={styles['coach__header']}>
        <h2 id={headingId} className={styles['coach__title']}>
          <Icon glyph={<CreationOutlineIcon />} size="16" />
          {COACH.title}
        </h2>
        <IconButton size="small" icon={<Icon glyph={<CloseIcon />} />} aria-label={COACH.close} onClick={onClose} />
      </header>
      <div className={styles['coach__thread']}>
        {turns.length === 0 ? (
          <div className={styles['coach__empty']}>
            <p className={styles['coach__intro']}>{COACH.intro}</p>
            <ul className={styles['coach__fills']} aria-label={COACH.fillsLabel}>
              {COACH.fills.map((item) => (
                <li key={item} className={styles['coach__fill']}>
                  {item}
                </li>
              ))}
            </ul>
            <div className={styles['coach__examples']}>
              <p className={styles['coach__examples-label']}>{COACH.examplesLabel}</p>
              {COACH.examples.map((example) => (
                <button
                  key={example}
                  type="button"
                  className={styles['coach__example']}
                  disabled={busy}
                  onClick={() => sendText(example)}
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        ) : null}
        {turns.map((turn) => (
          <article key={turn.id} className={styles['coach__turn']}>
            <p className={styles['coach__you']}>
              <span className={styles['coach__who']}>{COACH.you}: </span>
              {turn.prompt}
            </p>
            {turn.result ? (
              <div className={styles['coach__reply']} role="status">
                {turn.result.summary ? <p>{turn.result.summary}</p> : null}
                {turn.result.ask ? <p>{turn.result.ask}</p> : null}
              </div>
            ) : (
              <p className={styles['coach__pending']} role={pending ? undefined : 'status'} aria-hidden={pending ? true : undefined}>
                {pending ?? COACH.buildingRead}
              </p>
            )}
          </article>
        ))}
        <div ref={endRef} />
      </div>
      <form
        className={styles['coach__composer']}
        onSubmit={(event) => {
          event.preventDefault();
          send();
        }}
      >
        <textarea
          ref={inputRef}
          className={styles['coach__field']}
          rows={2}
          value={draft}
          placeholder={turns.length > 0 ? COACH.followPlaceholder : COACH.placeholder}
          aria-label={turns.length > 0 ? COACH.followPlaceholder : COACH.placeholder}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
              event.preventDefault();
              send();
            }
          }}
        />
        <button
          type="submit"
          className={styles['coach__send']}
          disabled={!draft.trim() || busy}
          aria-label={busy ? (pending ?? COACH.buildingRead) : COACH.send}
        >
          <Icon glyph={<SendIcon />} size="16" />
        </button>
      </form>
    </aside>
  );
}
