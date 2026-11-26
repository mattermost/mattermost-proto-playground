// [AI DRAFT] "What this policy does": the explanation built from the rules,
// in every placement under test (round 2, M7).
//
// The designer kept the explanation generated from the rules (it works
// without Agents and on air-gapped servers, and matches CEL) and asked for a
// better place for it. Each placement shows the same content, so they differ
// only in where and when it appears:
//   button       today's baseline: "Explain this policy" beside Warnings
//   summary      a live sentence as the Policy expression subtitle
//   views        Simple | Plain language | Advanced views of one expression
//   permissions  each permission row says when it's allowed
//   savebar      a summary in a Save bar that stays in view
//   panel        a side panel that stays open while editing
//   rail         the designer's Sections rail: the reading under an in-page
//                nav, beside the form (2026-10-31, the default)
import { useId, useLayoutEffect, useRef, useState } from 'react';
import AlertCircleOutlineIcon from '@mattermost/compass-icons/components/alert-circle-outline';
import AlertOutlineIcon from '@mattermost/compass-icons/components/alert-outline';
import { Button } from '@mattermost/compass-ui/components/button';
import { Icon } from '@mattermost/compass-ui/components/icon';
import type { Vocabulary } from '../model/vocabulary';
import { READBACK } from '../copy';
import { hasDetails, type Explanation } from './explanation';
import styles from './Explain.module.scss';

/** Everything after the sentence: "Not allowed when …" and the one-way note. */
export function ExplainDetails({
  e,
  vocab,
}: {
  e: Explanation;
  vocab: Vocabulary;
}) {
  const { rb, direction } = e;
  return (
    <>
      {rb?.denied ? (
        <p className={styles['explain__text']}>
          <span className={styles['explain__lead']}>{READBACK.notAllowedLabel}</span> {rb.denied}.
        </p>
      ) : null}
      {rb?.deniedList ? (
        <div className={styles['explain__text']}>
          <span className={styles['explain__lead']}>{rb.deniedAny ? READBACK.notAllowedAny : READBACK.notAllowedAll}</span>
          <ul className={styles['explain__list']}>
            {rb.deniedList.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        </div>
      ) : null}
      {direction === 'one-way' ? (
        <p className={styles['explain__note']}>{READBACK.oneWayNote(vocab.noun.user, vocab.noun.recipient)}</p>
      ) : null}
    </>
  );
}

/**
 * "What this policy does" in the designer's Sections rail (2026-10-31).
 * Beside the form. A short reading shows in full. A long one stops after
 * six lines, with Read more for the rest (designer, 2026-10-31). Not a live
 * region (UX1-2). A change is visible in the sentence itself; it is not
 * tinted (designer, 2026-10-31).
 */
export function ExplainPanel({
  e,
  vocab,
  stale = false,
  blocked = false,
  muted = false,
}: {
  e: Explanation;
  vocab: Vocabulary;
  /** The expression doesn't parse: this is the last reading that did (UX1-1). */
  stale?: boolean;
  /** Rules no permission can hold: the sentence says to fix them. */
  blocked?: boolean;
  /** Nothing written yet: the sentence is a prompt, not a reading. */
  muted?: boolean;
}) {
  const headingId = useId();
  const bodyId = useId();
  const panelRef = useRef<HTMLElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [overflows, setOverflows] = useState(false);
  const reading = !stale && !blocked;
  const { rb } = e;
  const readingKey = `${e.sentence}\n${rb?.denied ?? ''}\n${rb?.deniedList?.join('|') ?? ''}\n${e.direction}`;
  const [seen, setSeen] = useState(readingKey);
  if (seen !== readingKey) {
    setSeen(readingKey);
    setOpen(false);
  }
  // Six lines is the preview. Shorter readings never offer Read more.
  // Open, the reading uses the room left in the rail and scrolls inside it.
  useLayoutEffect(() => {
    const el = bodyRef.current;
    const panel = panelRef.current;
    if (!el || !panel) return undefined;
    const measure = () => {
      if (!open) {
        panel.style.maxHeight = '';
        setOverflows(el.scrollHeight > el.clientHeight + 1);
        return;
      }
      const rail = panel.parentElement;
      if (!rail) return;
      const room = rail.clientHeight - panel.offsetTop;
      panel.style.maxHeight = `${Math.max(room, 0)}px`;
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    if (panel.parentElement) ro.observe(panel.parentElement);
    return () => ro.disconnect();
  }, [readingKey, open]);
  // An expression it can't read gets the caution look, not a reading's (VIS3-1).
  const caution = reading && rb === null && !e.pending;
  const clamped = !open;
  return (
    <aside ref={panelRef} className={styles['explain__panel']} aria-labelledby={headingId}>
      <div className={styles['explain__panel-head']}>
        <h2 id={headingId} className={styles['explain__panel-title']}>
          {READBACK.heading}
        </h2>
        {blocked ? (
          <span className={styles['explain__error-icon']}>
            <Icon glyph={<AlertCircleOutlineIcon />} size="16" />
          </span>
        ) : caution ? (
          <span className={styles['explain__caution-icon']}>
            <Icon glyph={<AlertOutlineIcon />} size="16" />
          </span>
        ) : null}
      </div>
      <div
        id={bodyId}
        ref={bodyRef}
        className={[
          styles['explain__panel-body'],
          clamped ? styles['explain__panel-body--clamped'] : '',
          clamped && overflows ? styles['explain__panel-body--fade'] : '',
        ].join(' ')}
      >
        <div className={styles['explain__summary-line']}>
          <p
            className={[
              styles['explain__text'],
              stale || muted ? styles['explain__text--muted'] : '',
            ].join(' ')}
          >
            {e.sentence}
          </p>
        </div>
        {stale ? (
          <div className={styles['explain__stale']} role="note">
            <Icon glyph={<AlertCircleOutlineIcon />} size="12" />
            {READBACK.stale}
          </div>
        ) : null}
        {reading ? <ExplainDetails e={e} vocab={vocab} /> : null}
      </div>
      {overflows || open ? (
        <div className={styles['explain__panel-more']}>
          <Button
            emphasis="link"
            size="x-small"
            aria-expanded={open}
            aria-controls={bodyId}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? READBACK.showLess : READBACK.readMore}
          </Button>
        </div>
      ) : null}
    </aside>
  );
}

/** The boxed explanation: heading, sentence, details. */
export function ExplainBox({
  e,
  vocab,
  id,
  live,
  className,
}: {
  e: Explanation;
  vocab: Vocabulary;
  id?: string;
  live: boolean;
  className?: string;
}) {
  return (
    <div id={id} className={[styles['explain__box'], className ?? ''].join(' ')} aria-live={live ? 'polite' : 'off'}>
      <div className={styles['explain__head']}>
        <h3 className={styles['explain__title']}>{READBACK.heading}</h3>
      </div>
      <p className={styles['explain__text']}>{e.sentence}</p>
      <ExplainDetails e={e} vocab={vocab} />
    </div>
  );
}

/**
 * The meaning as the Policy expression subtitle (M7, "Live summary"; kept by
 * both lenses in iteration 1). Two lines at most, so edits don't move the
 * rules table (VIS1-1); the rest, and anything cut off, is a click away. It
 * isn't a live region: the page's status line announces warnings (UX1-2).
 */
export function ExplainSummary({
  e,
  vocab,
  fallback,
  stale = false,
}: {
  e: Explanation;
  vocab: Vocabulary;
  /** Shown while there's nothing to explain (no rules, or a rules error). */
  fallback?: string;
  /** The expression doesn't parse: this is the last version that did (UX1-1). */
  stale?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const textRef = useRef<HTMLParagraphElement>(null);
  const [cut, setCut] = useState(false);
  const id = useId();
  // Offer "Show details" whenever the two-line cap hides part of the sentence.
  // Measured while closed only, so the label doesn't change once opened (UX2-4).
  useLayoutEffect(() => {
    const el = textRef.current;
    if (!el || open) return undefined;
    const measure = () => setCut(el.scrollHeight > el.clientHeight + 1);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [e.sentence, open]);
  if (e.pending && fallback) return <p className={styles['explain__fallback']}>{fallback}</p>;
  const details = hasDetails(e);
  // An expression it can't read gets the caution look, not a reading's (VIS3-1).
  const caution = e.rb === null && !e.pending;
  // "…when it isn't allowed" only when that's all the details hold (UX2-4).
  const barrierOnly = Boolean(e.rb?.denied || e.rb?.deniedList) && e.direction !== 'one-way' && !cut;
  return (
    <div className={styles['explain__summary']}>
      <div className={styles['explain__summary-line']}>
        {caution ? (
          <span className={styles['explain__caution-icon']}>
            <Icon glyph={<AlertOutlineIcon />} size="16" />
          </span>
        ) : null}
        <p
          ref={textRef}
          className={[
            styles['explain__summary-text'],
            !open ? styles['explain__summary-text--clamped'] : '',
            stale ? styles['explain__summary-text--stale'] : '',
          ].join(' ')}
        >
          <span className={styles['explain__visually-hidden']}>{READBACK.heading}: </span>
          {e.sentence}
        </p>
      </div>
      {stale ? (
        // Full-strength text with the error icon, as on flagged rows (VIS2-3).
        // A div: the icon renders a block element.
        <div className={styles['explain__stale']} role="note">
          <Icon glyph={<AlertCircleOutlineIcon />} size="12" />
          {READBACK.stale}
        </div>
      ) : details || cut || open ? (
        <>
          <Button
            emphasis="link"
            size="x-small"
            aria-expanded={open}
            aria-controls={id}
            onClick={() => setOpen(!open)}
          >
            {barrierOnly
              ? open
                ? READBACK.hideBarrier
                : READBACK.showBarrier
              : open
                ? READBACK.hideDetails
                : READBACK.showDetails}
          </Button>
          <div
            id={id}
            className={[styles['explain__collapse'], open ? styles['explain__collapse--open'] : ''].join(' ')}
            aria-hidden={!open}
          >
            <div className={styles['explain__collapse-inner']}>
              <div className={styles['explain__details']}>
                <ExplainDetails e={e} vocab={vocab} />
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
