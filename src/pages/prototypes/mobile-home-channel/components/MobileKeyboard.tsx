import styles from '../MobileHomeChannel.module.scss';

const KEYBOARD_LETTER_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
] as const;

const KEYBOARD_SUGGESTIONS = ['I', 'The', "I'm"];

function KeyboardShiftIcon() {
  return (
    <svg width='18' height='16' viewBox='0 0 18 16' aria-hidden>
      <path fill='currentColor' d='M9 0 0 9h5v7h8V9h5L9 0Z' />
    </svg>
  );
}

function KeyboardDeleteIcon() {
  return (
    <svg width='22' height='16' viewBox='0 0 22 16' aria-hidden>
      <path
        fill='none'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinejoin='round'
        d='M7.5 1H20a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H7.5L1 8l6.5-7Z'
      />
      <path
        fill='none'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        d='m10 5 6 6M16 5l-6 6'
      />
    </svg>
  );
}

function KeyboardEmojiIcon() {
  return (
    <svg width='22' height='22' viewBox='0 0 22 22' aria-hidden>
      <circle cx='11' cy='11' r='9' fill='none' stroke='currentColor' strokeWidth='1.4' />
      <circle cx='8' cy='9' r='1.1' fill='currentColor' />
      <circle cx='14' cy='9' r='1.1' fill='currentColor' />
      <path
        fill='none'
        stroke='currentColor'
        strokeWidth='1.4'
        strokeLinecap='round'
        d='M7.5 13.5c1.2 1.4 2.7 2 3.5 2s2.3-.6 3.5-2'
      />
    </svg>
  );
}

function KeyboardGlobeIcon() {
  return (
    <svg width='22' height='22' viewBox='0 0 22 22' aria-hidden>
      <circle cx='11' cy='11' r='8' fill='none' stroke='currentColor' strokeWidth='1.4' />
      <ellipse cx='11' cy='11' rx='3.5' ry='8' fill='none' stroke='currentColor' strokeWidth='1.4' />
      <path
        fill='none'
        stroke='currentColor'
        strokeWidth='1.4'
        d='M3 11h16M4.5 7h13M4.5 15h13'
      />
    </svg>
  );
}

function KeyboardMicIcon() {
  return (
    <svg width='14' height='22' viewBox='0 0 14 22' aria-hidden>
      <rect x='4' y='1' width='6' height='11' rx='3' fill='currentColor' />
      <path
        fill='none'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        d='M1.5 10.5a5.5 5.5 0 0 0 11 0M7 16v4M4 20h6'
      />
    </svg>
  );
}

type MobileKeyboardProps = {
  open: boolean;
};

export default function MobileKeyboard({open}: MobileKeyboardProps) {
  return (
    <div
      className={[
        styles['mobile-home-channel__keyboard'],
        open && styles['mobile-home-channel__keyboard--open'],
      ]
        .filter(Boolean)
        .join(' ')}
      aria-hidden
      onMouseDown={(event) => event.preventDefault()}
      onPointerDown={(event) => event.preventDefault()}
    >
      <div className={styles['mobile-home-channel__keyboard-inner']}>
        <div className={styles['mobile-home-channel__keyboard-suggestions']}>
          {KEYBOARD_SUGGESTIONS.map((suggestion, index) => (
            <span
              key={suggestion}
              className={styles['mobile-home-channel__keyboard-suggestion']}
            >
              {index > 0 && (
                <span
                  className={styles['mobile-home-channel__keyboard-suggestion-divider']}
                  aria-hidden
                />
              )}
              <span className={styles['mobile-home-channel__keyboard-suggestion-label']}>
                {suggestion}
              </span>
            </span>
          ))}
        </div>

        <div className={styles['mobile-home-channel__keyboard-keys']}>
          <div className={styles['mobile-home-channel__keyboard-row']}>
            {KEYBOARD_LETTER_ROWS[0].map((key) => (
              <span key={key} className={styles['mobile-home-channel__keyboard-key']}>
                {key}
              </span>
            ))}
          </div>

          <div
            className={[
              styles['mobile-home-channel__keyboard-row'],
              styles['mobile-home-channel__keyboard-row--inset'],
            ].join(' ')}
          >
            {KEYBOARD_LETTER_ROWS[1].map((key) => (
              <span key={key} className={styles['mobile-home-channel__keyboard-key']}>
                {key}
              </span>
            ))}
          </div>

          <div className={styles['mobile-home-channel__keyboard-row']}>
            <span
              className={[
                styles['mobile-home-channel__keyboard-key'],
                styles['mobile-home-channel__keyboard-key--mod'],
              ].join(' ')}
            >
              <KeyboardShiftIcon />
            </span>
            {KEYBOARD_LETTER_ROWS[2].map((key) => (
              <span key={key} className={styles['mobile-home-channel__keyboard-key']}>
                {key}
              </span>
            ))}
            <span
              className={[
                styles['mobile-home-channel__keyboard-key'],
                styles['mobile-home-channel__keyboard-key--mod'],
                styles['mobile-home-channel__keyboard-key--action'],
              ].join(' ')}
            >
              <KeyboardDeleteIcon />
            </span>
          </div>

          <div className={styles['mobile-home-channel__keyboard-row']}>
            <span
              className={[
                styles['mobile-home-channel__keyboard-key'],
                styles['mobile-home-channel__keyboard-key--mod'],
                styles['mobile-home-channel__keyboard-key--action'],
                styles['mobile-home-channel__keyboard-key--label'],
              ].join(' ')}
            >
              123
            </span>
            <span
              className={[
                styles['mobile-home-channel__keyboard-key'],
                styles['mobile-home-channel__keyboard-key--mod'],
                styles['mobile-home-channel__keyboard-key--action'],
              ].join(' ')}
            >
              <KeyboardEmojiIcon />
            </span>
            <span
              className={[
                styles['mobile-home-channel__keyboard-key'],
                styles['mobile-home-channel__keyboard-key--space'],
                styles['mobile-home-channel__keyboard-key--label'],
              ].join(' ')}
            >
              space
            </span>
            <span
              className={[
                styles['mobile-home-channel__keyboard-key'],
                styles['mobile-home-channel__keyboard-key--mod'],
                styles['mobile-home-channel__keyboard-key--action'],
                styles['mobile-home-channel__keyboard-key--return'],
                styles['mobile-home-channel__keyboard-key--label'],
              ].join(' ')}
            >
              return
            </span>
          </div>
        </div>

        <div className={styles['mobile-home-channel__keyboard-toolbar']}>
          <span className={styles['mobile-home-channel__keyboard-toolbar-btn']}>
            <KeyboardGlobeIcon />
          </span>
          <span className={styles['mobile-home-channel__keyboard-toolbar-btn']}>
            <KeyboardMicIcon />
          </span>
        </div>
      </div>
    </div>
  );
}
