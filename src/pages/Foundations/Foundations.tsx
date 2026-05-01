import { useState } from 'react';
import PlayOutlineIcon from '@mattermost/compass-icons/components/play-outline';
import Icon from '@/components/ui/Icon/Icon';
import IconButton, {
  ICON_BUTTON_ICON_SIZES,
} from '@/components/ui/IconButton/IconButton';
import styles from './Foundations.module.scss';

// ── Data ──────────────────────────────────────────────────────────────────────

const PALETTES = [
  {
    name: 'Neutral',
    prefix: 'color-neutral',
    steps: [
      0, 50, 100, 150, 200, 250, 300, 350, 400, 450, 500, 550, 600, 650, 700,
      750, 800, 850, 900, 950, 1000, 1050, 1100, 1150, 1200,
    ],
  },
  {
    name: 'Blue',
    prefix: 'color-blue',
    steps: [100, 200, 300, 400, 500, 600, 700, 800],
  },
  {
    name: 'Cyan',
    prefix: 'color-cyan',
    steps: [100, 200, 300, 400, 500, 600, 700, 800],
  },
  {
    name: 'Green',
    prefix: 'color-green',
    steps: [100, 200, 300, 400, 500, 600, 700, 800],
  },
  {
    name: 'Indigo',
    prefix: 'color-indigo',
    steps: [100, 200, 300, 400, 500, 600, 700, 800],
  },
  {
    name: 'Orange',
    prefix: 'color-orange',
    steps: [100, 200, 300, 400, 500, 600, 700, 800],
  },
  {
    name: 'Purple',
    prefix: 'color-purple',
    steps: [100, 200, 300, 400, 500, 600, 700, 800],
  },
  {
    name: 'Red',
    prefix: 'color-red',
    steps: [100, 200, 300, 400, 500, 600, 700, 800],
  },
  {
    name: 'Teal',
    prefix: 'color-teal',
    steps: [100, 200, 300, 400, 500, 600, 700, 800],
  },
  {
    name: 'Yellow',
    prefix: 'color-yellow',
    steps: [100, 200, 300, 400, 500, 600, 700, 800],
  },
];

const THEME_GROUPS = [
  {
    name: 'Sidebar',
    tokens: [
      { name: 'BG', token: '--sidebar-bg' },
      { name: 'Header BG', token: '--sidebar-header-bg' },
      { name: 'Team BG', token: '--sidebar-team-bg' },
      { name: 'Text', token: '--sidebar-text' },
      { name: 'Hover BG', token: '--sidebar-text-hover-bg' },
      { name: 'Active Border', token: '--sidebar-text-active-border' },
    ],
  },
  {
    name: 'Center Channel',
    tokens: [
      { name: 'BG', token: '--center-channel-bg' },
      { name: 'Color', token: '--center-channel-color' },
    ],
  },
  {
    name: 'Buttons',
    tokens: [
      { name: 'BG', token: '--button-bg' },
      { name: 'Color', token: '--button-color' },
    ],
  },
  {
    name: 'Interactions',
    tokens: [
      { name: 'Link', token: '--link-color' },
      { name: 'Error', token: '--error-text' },
      { name: 'Mention BG', token: '--mention-bg' },
      { name: 'Mention Color', token: '--mention-color' },
      { name: 'Highlight BG', token: '--mention-highlight-bg' },
      { name: 'New Message', token: '--new-message-separator' },
    ],
  },
  {
    name: 'Status',
    tokens: [
      { name: 'Online', token: '--online-indicator' },
      { name: 'Away', token: '--away-indicator' },
      { name: 'Do Not Disturb', token: '--dnd-indicator' },
    ],
  },
];

const ELEVATIONS = [
  { level: '1', token: '--elevation-1', desc: 'Subtle — hover, dropdowns' },
  { level: '2', token: '--elevation-2', desc: 'Low — chips, small cards' },
  { level: '3', token: '--elevation-3', desc: 'Medium — menus, tooltips' },
  { level: '4', token: '--elevation-4', desc: 'High — modals, popovers' },
  { level: '5', token: '--elevation-5', desc: 'Higher — dialogs, drawers' },
  { level: '6', token: '--elevation-6', desc: 'Highest — overlays' },
];

const RADII = [
  { name: 'XS', token: '--radius-xs', value: '2px' },
  { name: 'S', token: '--radius-s', value: '4px' },
  { name: 'M', token: '--radius-m', value: '8px' },
  { name: 'L', token: '--radius-l', value: '12px' },
  { name: 'XL', token: '--radius-xl', value: '16px' },
  { name: 'Full', token: '--radius-full', value: '50%' },
];

const TYPE_SCALE = [
  { step: '25', size: '10px', lineHeight: '16px' },
  { step: '50', size: '11px', lineHeight: '16px' },
  { step: '75', size: '12px', lineHeight: '16px' },
  { step: '100', size: '14px', lineHeight: '20px' },
  { step: '200', size: '16px', lineHeight: '24px' },
  { step: '300', size: '18px', lineHeight: '24px' },
  { step: '400', size: '20px', lineHeight: '28px' },
  { step: '500', size: '22px', lineHeight: '28px' },
  { step: '600', size: '25px', lineHeight: '30px' },
  { step: '700', size: '28px', lineHeight: '36px' },
  { step: '800', size: '32px', lineHeight: '40px' },
  { step: '900', size: '36px', lineHeight: '44px' },
  { step: '1000', size: '40px', lineHeight: '48px' },
];

const FONT_WEIGHTS = [
  { name: 'Light', value: '300', token: '--font-weight-light' },
  { name: 'Regular', value: '400', token: '--font-weight-regular' },
  { name: 'Semibold', value: '600', token: '--font-weight-semibold' },
  { name: 'Bold', value: '700', token: '--font-weight-bold' },
];

const FONT_FAMILIES = [
  { name: 'Heading', token: '--font-family-heading', value: 'Metropolis' },
  { name: 'Body', token: '--font-family-body', value: 'Open Sans' },
  { name: 'Mono', token: '--font-family-mono', value: 'Menlo' },
];

const DURATIONS = [
  {
    name: 'Quick',
    token: '--duration-quick',
    value: '150ms',
    desc: 'Default — hover states, small reveals',
  },
  {
    name: 'Moderate',
    token: '--duration-moderate',
    value: '300ms',
    desc: 'Large movements — panels, drawers',
  },
];

const EASINGS = [
  {
    name: 'Transition',
    token: '--ease-transition',
    value: 'ease-in-out',
    desc: 'Element already on screen',
  },
  {
    name: 'Entrance',
    token: '--ease-entrance',
    value: 'ease-out',
    desc: 'Element entering the screen',
  },
  {
    name: 'Exit',
    token: '--ease-exit',
    value: 'ease-in',
    desc: 'Element leaving the screen',
  },
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function Foundations() {
  const [playKeys, setPlayKeys] = useState<Record<string, number>>({});
  const replay = (token: string) =>
    setPlayKeys((prev) => ({ ...prev, [token]: (prev[token] ?? 0) + 1 }));

  return (
    <div className={styles.foundations}>
      <header className={styles['foundations__header']}>
        <h1 className={styles['foundations__heading']}>Foundations</h1>
        <p className={styles['foundations__subheading']}>
          Core design tokens — color, elevation, typography, and shape.
        </p>
      </header>

      {/* ── Foundation Colors ── */}
      <section className={styles['foundations__section']}>
        <h2 className={styles['foundations__section-title']}>
          Foundation Colors
        </h2>
        <div className={styles['foundations__palettes']}>
          {PALETTES.map(({ name, prefix, steps }) => (
            <div key={name} className={styles['foundations__palette-row']}>
              <span className={styles['foundations__palette-name']}>
                {name}
              </span>
              <div className={styles['foundations__swatch-strip']}>
                {steps.map((step) => (
                  <div
                    key={step}
                    className={styles['foundations__swatch']}
                    title={`--${prefix}-${step}`}
                  >
                    <div
                      className={styles['foundations__swatch-color']}
                      style={{ background: `var(--${prefix}-${step})` }}
                    />
                    <span className={styles['foundations__swatch-step']}>
                      {step}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Theme Colors ── */}
      <section className={styles['foundations__section']}>
        <h2 className={styles['foundations__section-title']}>Theme Colors</h2>
        <p className={styles['foundations__section-desc']}>
          Semantic tokens — values adapt to the active theme.
        </p>
        <div className={styles['foundations__theme-groups']}>
          {THEME_GROUPS.map(({ name, tokens }) => (
            <div key={name} className={styles['foundations__theme-group']}>
              <h3 className={styles['foundations__theme-group-name']}>
                {name}
              </h3>
              <div className={styles['foundations__theme-swatches']}>
                {tokens.map(({ name: tokenName, token }) => (
                  <div
                    key={token}
                    className={styles['foundations__theme-swatch']}
                  >
                    <div
                      className={styles['foundations__theme-swatch-color']}
                      style={{ background: `var(${token})` }}
                    />
                    <span className={styles['foundations__theme-swatch-name']}>
                      {tokenName}
                    </span>
                    <code className={styles['foundations__theme-swatch-token']}>
                      {token}
                    </code>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Elevation ── */}
      <section className={styles['foundations__section']}>
        <h2 className={styles['foundations__section-title']}>Elevation</h2>
        <div className={styles['foundations__elevations']}>
          {ELEVATIONS.map(({ level, token, desc }) => (
            <div key={level} className={styles['foundations__elevation']}>
              <div
                className={styles['foundations__elevation-box']}
                style={{ boxShadow: `var(${token})` }}
              />
              <span className={styles['foundations__elevation-level']}>
                Level {level}
              </span>
              <span className={styles['foundations__elevation-desc']}>
                {desc}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Typography ── */}
      <section className={styles['foundations__section']}>
        <h2 className={styles['foundations__section-title']}>Typography</h2>

        <h3 className={styles['foundations__subsection-title']}>Families</h3>
        <div className={styles['foundations__type-families']}>
          {FONT_FAMILIES.map(({ name, token, value }) => (
            <div key={name} className={styles['foundations__type-family']}>
              <span
                className={styles['foundations__type-family-sample']}
                style={{ fontFamily: `var(${token})` }}
              >
                Aa
              </span>
              <div className={styles['foundations__type-family-meta']}>
                <span className={styles['foundations__type-family-name']}>
                  {name}
                </span>
                <span className={styles['foundations__type-family-value']}>
                  {value}
                </span>
                <code className={styles['foundations__type-family-token']}>
                  {token}
                </code>
              </div>
            </div>
          ))}
        </div>

        <h3 className={styles['foundations__subsection-title']}>Scale</h3>
        <div className={styles['foundations__type-scale']}>
          {TYPE_SCALE.map(({ step, size, lineHeight }) => (
            <div key={step} className={styles['foundations__type-row']}>
              <div className={styles['foundations__type-meta']}>
                <span className={styles['foundations__type-step']}>{step}</span>
                <span className={styles['foundations__type-dim']}>
                  {size} / {lineHeight}
                </span>
              </div>
              <span
                className={styles['foundations__type-sample']}
                style={{
                  fontSize: `var(--font-size-${step})`,
                  lineHeight: `var(--line-height-${step})`,
                }}
              >
                The quick brown fox
              </span>
            </div>
          ))}
        </div>

        <h3 className={styles['foundations__subsection-title']}>Weights</h3>
        <div className={styles['foundations__type-weights']}>
          {FONT_WEIGHTS.map(({ name, value, token }) => (
            <div key={name} className={styles['foundations__weight-row']}>
              <div className={styles['foundations__type-meta']}>
                <span className={styles['foundations__type-step']}>{name}</span>
                <span className={styles['foundations__type-dim']}>{value}</span>
              </div>
              <span
                className={styles['foundations__weight-sample']}
                style={{ fontWeight: `var(${token})` }}
              >
                The quick brown fox jumps over the lazy dog
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Animation ── */}
      <section className={styles['foundations__section']}>
        <h2 className={styles['foundations__section-title']}>Animation</h2>
        <p className={styles['foundations__section-desc']}>
          Always use animation tokens — never hard-code durations or easing
          keywords directly.
        </p>

        <h3 className={styles['foundations__subsection-title']}>Duration</h3>
        <div className={styles['foundations__anim-rows']}>
          {DURATIONS.map(({ name, token, value, desc }) => (
            <div key={name} className={styles['foundations__anim-row']}>
              <div className={styles['foundations__anim-meta']}>
                <span className={styles['foundations__anim-name']}>{name}</span>
                <code className={styles['foundations__anim-token']}>
                  {token}
                </code>
                <span className={styles['foundations__anim-value']}>
                  {value}
                </span>
                <span className={styles['foundations__anim-desc']}>{desc}</span>
              </div>
              <div className={styles['foundations__anim-track']}>
                <span
                  key={playKeys[token] ?? 0}
                  className={styles['foundations__anim-dot']}
                  style={{
                    animationDuration: `var(${token})`,
                    animationTimingFunction: 'var(--ease-transition)',
                    animationPlayState:
                      playKeys[token] !== undefined ? 'running' : 'paused',
                  }}
                />
              </div>
              <IconButton
                icon={
                  <Icon
                    glyph={<PlayOutlineIcon />}
                    size={ICON_BUTTON_ICON_SIZES['Small']}
                  />
                }
                size="Small"
                aria-label={`Play ${name} duration`}
                onClick={() => replay(token)}
              />
            </div>
          ))}
        </div>

        <h3 className={styles['foundations__subsection-title']}>Easing</h3>
        <div className={styles['foundations__anim-rows']}>
          {EASINGS.map(({ name, token, value, desc }) => (
            <div key={name} className={styles['foundations__anim-row']}>
              <div className={styles['foundations__anim-meta']}>
                <span className={styles['foundations__anim-name']}>{name}</span>
                <code className={styles['foundations__anim-token']}>
                  {token}
                </code>
                <span className={styles['foundations__anim-value']}>
                  {value}
                </span>
                <span className={styles['foundations__anim-desc']}>{desc}</span>
              </div>
              <div className={styles['foundations__anim-track']}>
                <span
                  key={playKeys[token] ?? 0}
                  className={styles['foundations__anim-dot']}
                  style={{
                    animationDuration: 'var(--duration-moderate)',
                    animationTimingFunction: `var(${token})`,
                    animationPlayState:
                      playKeys[token] !== undefined ? 'running' : 'paused',
                  }}
                />
              </div>
              <IconButton
                icon={
                  <Icon
                    glyph={<PlayOutlineIcon />}
                    size={ICON_BUTTON_ICON_SIZES['Small']}
                  />
                }
                size="Small"
                aria-label={`Play ${name} easing`}
                onClick={() => replay(token)}
              />
            </div>
          ))}
        </div>
      </section>

      {/* ── Shape ── */}
      <section className={styles['foundations__section']}>
        <h2 className={styles['foundations__section-title']}>Shape</h2>
        <div className={styles['foundations__radii']}>
          {RADII.map(({ name, token, value }) => (
            <div key={name} className={styles['foundations__radius']}>
              <div
                className={styles['foundations__radius-box']}
                style={{ borderRadius: `var(${token})` }}
              />
              <span className={styles['foundations__radius-name']}>{name}</span>
              <span className={styles['foundations__radius-value']}>
                {value}
              </span>
              <code className={styles['foundations__radius-token']}>
                {token}
              </code>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
