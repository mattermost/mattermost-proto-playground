import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import ChevronLeftIcon from '@mattermost/compass-icons/components/chevron-left';
import ChevronRightIcon from '@mattermost/compass-icons/components/chevron-right';
import EyeOffOutlineIcon from '@mattermost/compass-icons/components/eye-off-outline';
import EyeOutlineIcon from '@mattermost/compass-icons/components/eye-outline';
import LightbulbOutlineIcon from '@mattermost/compass-icons/components/lightbulb-outline';
import OpenInNewIcon from '@mattermost/compass-icons/components/open-in-new';
import Button from '@/components/ui/Button/Button';
import Icon from '@/components/ui/Icon/Icon';
import {
  CLOSING_ASK,
  HOW_TO_RUN,
  QUESTIONS,
  type QuestionScreen,
} from './questionSet';
import styles from './ClassificationClearanceQuestions.module.scss';

function assetUrl(path: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return `${base}/${path.replace(/^\//, '')}`;
}

function screenUrl(screen: QuestionScreen): string {
  return screen.source.kind === 'iframe'
    ? assetUrl(screen.source.path)
    : assetUrl(screen.source.src);
}

/**
 * Classification & Clearance — customer conversation.
 *
 * A running order for the four questions, not a new set of screens. Every stage
 * is an existing prototype loaded at a deep-linked state, or the existing
 * markings mockup.
 *
 * Two behaviors carry the intent:
 *   - A question's screens stay hidden until the presenter reveals them. While
 *     asking, the question fills the view and the presenter notes are open; on
 *     reveal the ask collapses to a strip and the prototype takes the screen.
 *   - Alternatives are grouped by APPROACH, picked before the screen within it,
 *     so three ways of doing something never read as one three-step flow.
 *
 * Deep link: `?q=1..4`.
 */
export default function ClassificationClearanceQuestions() {
  const [index, setIndex] = useState(() => {
    const raw =
      typeof window !== 'undefined'
        ? new URLSearchParams(window.location.search).get('q')
        : null;
    const n = Number(raw);
    return Number.isFinite(n) && n >= 1 && n <= QUESTIONS.length ? n - 1 : 0;
  });
  /** Which questions have had their demo revealed. Sticky, so going back works. */
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [approachIndex, setApproachIndex] = useState(0);
  const [screenIndex, setScreenIndex] = useState(0);
  /** null = follow the default for the current state (open while asking). */
  const [notesOverride, setNotesOverride] = useState<boolean | null>(null);
  const [howToOpen, setHowToOpen] = useState(false);

  const question = QUESTIONS[index];
  const isRevealed = revealed[question.id] ?? false;
  const notesOpen = notesOverride ?? !isRevealed;

  const approach =
    question.approaches[
      Math.min(approachIndex, question.approaches.length - 1)
    ];
  const screen =
    approach.screens[Math.min(screenIndex, approach.screens.length - 1)];
  const multiApproach = question.approaches.length > 1;

  // A new question starts on its first approach and screen, notes back to default.
  useEffect(() => {
    setApproachIndex(0);
    setScreenIndex(0);
    setNotesOverride(null);
  }, [question.id]);

  // Bring the relevant band of the tall markings mockup into view.
  //
  // The mockup is one tall image shown at several different regions, so the
  // scroll has to survive both a first uncached load (no intrinsic height yet at
  // effect time) and a re-show from cache (`load` never fires again). Retry
  // across a few frames until the container is actually scrollable, then stop.
  const imageScrollRef = useRef<HTMLDivElement | null>(null);
  useLayoutEffect(() => {
    const el = imageScrollRef.current;
    if (!el || screen.source.kind !== 'image') return;

    const pct = screen.source.scrollToPct ?? 0;
    let raf = 0;
    let attempts = 0;

    const apply = () => {
      const max = el.scrollHeight - el.clientHeight;
      if (max > 0) {
        // `pct` is a position in the image, so scale by the image's own height
        // and clamp — scaling by the scrollable distance lands short.
        el.scrollTop = Math.min(max, Math.max(0, el.scrollHeight * pct));
        return;
      }
      // Image has no laid-out height yet — try again next frame.
      if (attempts++ < 30) raf = requestAnimationFrame(apply);
    };

    apply();
    const img = el.querySelector('img');
    img?.addEventListener('load', apply);

    return () => {
      cancelAnimationFrame(raf);
      img?.removeEventListener('load', apply);
    };
    // `isRevealed` matters: the container does not exist until the demo is
    // revealed, and `screen` alone does not change on that transition.
  }, [screen, isRevealed]);

  const setReveal = (next: boolean) => {
    setRevealed((prev) => ({ ...prev, [question.id]: next }));
    setApproachIndex(0);
    setScreenIndex(0);
    setNotesOverride(null);
  };

  const goTo = (next: number) =>
    setIndex(Math.max(0, Math.min(next, QUESTIONS.length - 1)));

  const cx = (...names: Array<string | false | undefined>) =>
    names.filter(Boolean).join(' ');

  return (
    <div className={cx(styles['ccq'], isRevealed && styles['ccq--revealed'])}>
      <header className={styles['ccq__header']}>
        <div>
          <p className={styles['ccq__eyebrow']}>Customer conversation</p>
          <h1 className={styles['ccq__title']}>
            Classification &amp; Clearance
          </h1>
        </div>
        <div className={styles['ccq__header-side']}>
          <p className={styles['ccq__progress']}>
            Question {index + 1} of {QUESTIONS.length}
          </p>
          <button
            type="button"
            className={styles['ccq__notes-toggle']}
            aria-expanded={howToOpen}
            onClick={() => setHowToOpen((o) => !o)}
          >
            <Icon size="12" glyph={<LightbulbOutlineIcon />} />
            {howToOpen ? 'Hide how to run this' : 'How to run this'}
          </button>
        </div>
      </header>

      <div className={styles['ccq__layout']}>
        <aside className={styles['ccq__rail']}>
          <p className={styles['ccq__rail-label']}>The four questions</p>
          <ul className={styles['ccq__rail-list']}>
            {QUESTIONS.map((q, i) => (
              <li key={q.id}>
                <button
                  type="button"
                  className={cx(
                    styles['ccq__rail-btn'],
                    i === index && styles['ccq__rail-btn--active'],
                  )}
                  onClick={() => goTo(i)}
                >
                  <span
                    className={cx(
                      styles['ccq__rail-num'],
                      revealed[q.id] && styles['ccq__rail-num--answered'],
                    )}
                  >
                    {i + 1}
                  </span>
                  {q.navLabel}
                </button>
              </li>
            ))}
          </ul>

          {howToOpen && (
            <div className={styles['ccq__rail-foot']}>
              <p className={styles['ccq__rail-label']}>How to run this</p>
              <ul className={styles['ccq__notes-list']}>
                {HOW_TO_RUN.map((rule) => (
                  <li key={rule} className={styles['ccq__notes-item']}>
                    {rule}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>

        <main className={styles['ccq__main']}>
          <section
            className={cx(
              styles['ccq__ask-card'],
              isRevealed && styles['ccq__ask-card--compact'],
            )}
          >
            <p className={styles['ccq__ask-label']}>Question {index + 1}</p>
            <p className={styles['ccq__ask']}>{question.ask}</p>
            {question.probe && (
              <p className={styles['ccq__probe']}>{question.probe}</p>
            )}

            <div className={styles['ccq__ask-actions']}>
              {isRevealed ? (
                <Button
                  emphasis="Tertiary"
                  size="Small"
                  leadingIcon={<Icon size="16" glyph={<EyeOffOutlineIcon />} />}
                  onClick={() => setReveal(false)}
                >
                  Hide the visuals
                </Button>
              ) : (
                <>
                  <Button
                    emphasis="Primary"
                    leadingIcon={<Icon size="16" glyph={<EyeOutlineIcon />} />}
                    onClick={() => setReveal(true)}
                  >
                    {question.revealLabel}
                  </Button>
                  <span className={styles['ccq__ask-hint']}>
                    Get their answer on the record first.
                  </span>
                </>
              )}
              <span className={styles['ccq__nav-spacer']} />
              <button
                type="button"
                className={styles['ccq__notes-toggle']}
                aria-expanded={notesOpen}
                onClick={() => setNotesOverride(!notesOpen)}
              >
                <Icon size="12" glyph={<LightbulbOutlineIcon />} />
                {notesOpen ? 'Hide presenter notes' : 'Presenter notes'}
              </button>
            </div>

            {notesOpen && (
              <div className={styles['ccq__notes']}>
                <p className={styles['ccq__notes-label']}>Listen for</p>
                <ul className={styles['ccq__notes-list']}>
                  {question.listenFor.map((item) => (
                    <li key={item} className={styles['ccq__notes-item']}>
                      {item}
                    </li>
                  ))}
                </ul>
                <p className={styles['ccq__notes-label']}>What it decides</p>
                <p className={styles['ccq__notes-decides']}>
                  {question.decides}
                </p>
              </div>
            )}
          </section>

          {isRevealed && (
            <section className={styles['ccq__demo']}>
              {multiApproach ? (
                <div
                  className={styles['ccq__approaches']}
                  role="tablist"
                  aria-label="Approaches"
                >
                  {question.approaches.map((a, i) => (
                    <button
                      key={a.id}
                      type="button"
                      role="tab"
                      aria-selected={i === approachIndex}
                      className={cx(
                        styles['ccq__approach'],
                        i === approachIndex && styles['ccq__approach--active'],
                      )}
                      onClick={() => {
                        setApproachIndex(i);
                        setScreenIndex(0);
                      }}
                    >
                      <span className={styles['ccq__approach-label']}>
                        {a.label ?? `Option ${i + 1}`}
                      </span>
                      <span className={styles['ccq__approach-title']}>
                        {a.title}
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className={styles['ccq__single-approach']}>
                  {approach.title}
                </div>
              )}

              <div className={styles['ccq__tabs']}>
                {approach.screens.length > 1 ? (
                  approach.screens.map((s, i) => (
                    <button
                      key={s.id}
                      type="button"
                      className={cx(
                        styles['ccq__tab'],
                        i === screenIndex && styles['ccq__tab--active'],
                      )}
                      onClick={() => setScreenIndex(i)}
                    >
                      <span className={styles['ccq__tab-num']}>{i + 1}</span>
                      {s.label}
                    </button>
                  ))
                ) : (
                  <span className={styles['ccq__tab-static']}>
                    {screen.label}
                  </span>
                )}
                <span className={styles['ccq__tabs-spacer']} />
                <a
                  className={styles['ccq__open-link']}
                  href={screenUrl(screen)}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open in new tab
                  <Icon size="12" glyph={<OpenInNewIcon />} />
                </a>
              </div>

              <p className={styles['ccq__caption']}>{screen.caption}</p>

              <div className={styles['ccq__stage']}>
                {screen.source.kind === 'iframe' ? (
                  <iframe
                    key={screenUrl(screen)}
                    className={styles['ccq__iframe']}
                    title={`${question.navLabel} — ${screen.label}`}
                    src={screenUrl(screen)}
                  />
                ) : (
                  <div
                    className={styles['ccq__image-scroll']}
                    ref={imageScrollRef}
                  >
                    <img
                      className={styles['ccq__image']}
                      src={screenUrl(screen)}
                      alt={screen.source.alt}
                    />
                  </div>
                )}
              </div>
            </section>
          )}

          <div className={styles['ccq__nav']}>
            <Button
              emphasis="Tertiary"
              leadingIcon={<Icon size="16" glyph={<ChevronLeftIcon />} />}
              disabled={index === 0}
              onClick={() => goTo(index - 1)}
            >
              Previous question
            </Button>
            <span className={styles['ccq__nav-spacer']} />
            <Button
              emphasis="Secondary"
              trailingIcon={<Icon size="16" glyph={<ChevronRightIcon />} />}
              disabled={index === QUESTIONS.length - 1}
              onClick={() => goTo(index + 1)}
            >
              Next question
            </Button>
          </div>

          {index === QUESTIONS.length - 1 && !isRevealed && (
            <section className={styles['ccq__closing']}>
              <p className={styles['ccq__closing-label']}>
                The one ask to close on
              </p>
              <p className={styles['ccq__closing-text']}>{CLOSING_ASK}</p>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
