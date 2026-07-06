/**
 * Masking Notice Options — prototype for PR 36517 review.
 *
 * Shows the current masked-policy notice state, presents copy variations on
 * the page-level edit-view banner (the current copy is also the recommended
 * Surface 1 copy), shows the consolidated Surface 2 / Surface 3 wording for
 * the delete-section banner and the defensive 403 modal, evaluates visual
 * treatments for the Advanced-mode dual-banner stack (Options 1–5), and
 * presents the recommended combined design (current edit-view copy + Visual
 * Option 4 + consolidated S2 / S3 copy).
 *
 * See `pr_36517_consolidated_copy.md` for the final cross-surface copy and
 * `pr_36517_masking_notice_analysis.md` for the visual-treatment ideation.
 */
import { useState } from 'react';
import SectionNotice from '@/components/ui/SectionNotice/SectionNotice';
import Tooltip from '@/components/ui/Tooltip/Tooltip';
import Chip from '@/components/ui/Chip/Chip';
import Button from '@/components/ui/Button/Button';
import Icon from '@/components/ui/Icon/Icon';
import LockOutlineIcon from '@mattermost/compass-icons/components/lock-outline';
import CheckIcon from '@mattermost/compass-icons/components/check';
import TrashCanOutlineIcon from '@mattermost/compass-icons/components/trash-can-outline';
import FormatListBulletedIcon from '@mattermost/compass-icons/components/format-list-bulleted';
import MenuIcon from '@mattermost/compass-icons/components/menu';
import CheckCircleOutlineIcon from '@mattermost/compass-icons/components/check-circle-outline';
import styles from './MaskingNoticeOptions.module.scss';

type Mode = 'simple' | 'advanced';

// ---------------------------------------------------------------------------
// Copy options for the Simple-mode banner.
// ---------------------------------------------------------------------------

interface CopyOption {
  id: string;
  label: string;
  title: string;
  body: string;
  type: 'Warning' | 'Info' | 'Danger' | 'Hint';
  note?: string;
}

// NOTE — v3 copy revision (2026-05-19).
// Two changes from v2:
//   1. Surface 2 banner removed. The disabled Delete button gets a tooltip
//      mirroring the existing TestButton tooltip pattern. One key reused
//      across the list-page Delete menu item and the policy details Delete
//      Policy button. The Delete section on the policy details page no
//      longer has its own banner.
//   2. "in ways you cannot fully anticipate" reads slightly accusatory —
//      the first sentence already establishes the admin's limited view
//      ("values you cannot see"), so repeating "you cannot" in the second
//      sentence piles the constraint back on the user. Five alternatives
//      below; recommended is the mirror-structure variant that rhymes
//      "values you cannot see" with "users you cannot see" so the symmetry
//      reads as craft rather than negation.

const COPY_OPTIONS: CopyOption[] = [
  {
    id: 'current',
    label: 'Current (in PR 36517)',
    title: 'This policy contains restricted values',
    body: 'Some rules include attribute values you cannot see. Editing or deleting these rules may change who has access in ways you cannot fully anticipate.',
    type: 'Warning',
    note: 'Baseline. Honest but "you cannot" repeats twice — the first sentence establishes the admin\'s limited view, the second sentence repeats it back as a constraint on the user. Reads slightly accusatory.',
  },
  {
    id: 'B',
    label: 'Option B — Mirror structure (recommended)',
    title: 'This policy contains restricted values',
    body: 'Some rules include attribute values you cannot see. Editing or deleting these rules may change access for users you cannot see.',
    type: 'Warning',
    note: 'Symmetric "values you cannot see / users you cannot see" — the repetition reads as intentional craft, not piling on. Names the concrete stake (real users). Same word count as current.',
  },
  {
    id: 'A',
    label: 'Option A — Neutral consequence',
    title: 'This policy contains restricted values',
    body: 'Some rules include attribute values you cannot see. Editing or deleting these rules may change access in unpredictable ways.',
    type: 'Warning',
    note: 'Drops the second "you cannot" entirely. "Unpredictable" is slightly alarming for a routine policy state.',
  },
  {
    id: 'C',
    label: 'Option C — Soft consequence',
    title: 'This policy contains restricted values',
    body: 'Some rules include attribute values you cannot see. Editing or deleting these rules may have unexpected effects on access.',
    type: 'Warning',
    note: 'Tightest. "Unexpected effects" is neutral but loses the "who" anchor — the user doesn\'t learn what\'s at stake.',
  },
  {
    id: 'D',
    label: 'Option D — System-side framing',
    title: 'This policy contains restricted values',
    body: 'Some rules include attribute values you cannot see. Editing or deleting these rules may change access in ways the system cannot show you.',
    type: 'Warning',
    note: 'Shifts the limitation to the system rather than the admin. Diplomatic but longer; "the system" is slightly abstract.',
  },
  {
    id: 'E',
    label: 'Option E — Visibility framing',
    title: 'This policy contains restricted values',
    body: 'Some rules include attribute values you cannot see. Editing or deleting these rules may change access in ways that aren\'t visible here.',
    type: 'Warning',
    note: 'Points back at the UI ("here") rather than the admin. Passive; works if the "system" framing in Option D feels too abstract.',
  },
  {
    id: 'S3',
    label: 'Surface 3 — Defensive 403 modal',
    title: 'Policy could not be deleted',
    body: 'This policy contains restricted attribute values.',
    type: 'Danger',
    note: 'Past-tense title for the postmortem framing. Body simplified to just the cause — title already states the action and outcome.',
  },
];

// ---------------------------------------------------------------------------
// Visual treatment options for the Advanced-mode dual-banner stack.
// ---------------------------------------------------------------------------

type AdvancedVariant =
  | 'current'
  | 'merge'
  | 'suppress'
  | 'differentiate'
  | 'editorChrome'
  | 'chromeOnly';

interface AdvancedOption {
  id: AdvancedVariant;
  label: string;
  note?: string;
}

const ADVANCED_OPTIONS: AdvancedOption[] = [
  {
    id: 'current',
    label: 'Current (in PR 36517)',
    note: 'Two stacked banners with similar titles; gray bg + red icon mismatch on Banner 2.',
  },
  {
    id: 'merge',
    label: 'Option 1 — Merge into single banner',
    note: 'Zero stacking; body changes between modes, banner feels reactive.',
  },
  {
    id: 'suppress',
    label: 'Option 2 — Suppress page-level in Advanced',
    note: 'Banner appears/disappears with mode switch; user loses policy-level context.',
  },
  {
    id: 'differentiate',
    label: 'Option 3 — Differentiate visual class',
    note: 'Both signals preserved; new "inline note" component class needed.',
  },
  {
    id: 'editorChrome',
    label: 'Option 4 — Recommended (editor chrome strip)',
    note: 'Policy banner persists; editor state lives on editor; clear hierarchy.',
  },
  {
    id: 'chromeOnly',
    label: 'Option 5 — Editor chrome only, no strip',
    note: 'Cleanest visual; weak discoverability; no inline switch-mode affordance.',
  },
];

// ---------------------------------------------------------------------------
// Sub-components — mock pieces of the rule editor.
// ---------------------------------------------------------------------------

function MaskedChip() {
  return (
    <Chip
      size="Medium"
      tone="neutral"
      aria-label="Hidden values that you do not have permission to view"
      role="img"
      className={styles['masked-chip']}
    >
      ••••••••
    </Chip>
  );
}

function RuleRow({
  attribute,
  operator,
  values,
  masked,
  locked,
}: {
  attribute: string;
  operator: string;
  values: string[];
  masked?: boolean;
  locked?: boolean;
}) {
  return (
    <div
      className={`${styles['rule-row']} ${
        locked ? styles['rule-row--locked'] : ''
      }`}
    >
      <div className={styles['rule-row__cell']}>
        <Icon
          size="12"
          glyph={
            attribute === 'Program' ? (
              <FormatListBulletedIcon />
            ) : (
              <MenuIcon />
            )
          }
        />
        <span>{attribute}</span>
      </div>
      <div className={styles['rule-row__cell']}>
        {operator === 'has any of' ? <Icon size="12" glyph={<CheckIcon />} /> : null}
        <span>{operator}</span>
      </div>
      <div className={styles['rule-row__cell']}>
        {values.map((v) => (
          <Chip key={v} size="Medium" tone="neutral">
            {v}
          </Chip>
        ))}
        {masked ? <MaskedChip /> : null}
      </div>
      <button
        type="button"
        className={styles['rule-row__delete']}
        aria-label={`Delete ${attribute} rule`}
      >
        <Icon size="16" glyph={<TrashCanOutlineIcon />} />
      </button>
    </div>
  );
}

function SimpleEditor({ banner }: { banner: CopyOption }) {
  return (
    <div className={styles['editor']}>
      <div className={styles['editor__header']}>
        <div>
          <h3 className={styles['editor__title']}>
            Attribute-based membership rules
          </h3>
          <p className={styles['editor__subtitle']}>
            Select user attributes and values that qualifying users must have
          </p>
        </div>
        <Button emphasis="Primary">Switch to Advanced mode</Button>
      </div>

      <SectionNotice
        type={banner.type}
        title={banner.title}
        description={banner.body}
      />

      <div className={styles['rule-table']}>
        <div className={styles['rule-table__head']}>
          <span>Attribute</span>
          <span>Operator</span>
          <span>Values</span>
        </div>
        <RuleRow attribute="Dept" operator="is" values={['Admin']} />
        <RuleRow attribute="Text" operator="is" values={['No']} />
        <RuleRow
          attribute="Program"
          operator="has any of"
          values={['Alpha']}
          masked
          locked
        />
        <div className={styles['rule-table__add']}>
          <Button emphasis="Tertiary" size="Small">
            + Add attribute
          </Button>
        </div>
      </div>

      <p className={styles['editor__helper']}>
        Each row is a single condition that must be met for a user to comply
        with the policy. All rules are combined with logical AND operator (
        <code>&amp;&amp;</code> ).
      </p>
    </div>
  );
}

function CelMonacoMock({ readOnly }: { readOnly?: boolean }) {
  return (
    <div
      className={`${styles['cel-editor']} ${
        readOnly ? styles['cel-editor--readonly'] : ''
      }`}
    >
      <pre className={styles['cel-editor__code']}>
        <code>
          <span className={styles['cel-editor__var']}>user.attributes.Dept</span>{' '}
          == <span className={styles['cel-editor__str']}>"Admin"</span>{' '}
          &amp;&amp;{' '}
          <span className={styles['cel-editor__var']}>user.attributes.Text</span>{' '}
          == <span className={styles['cel-editor__str']}>"No"</span> &amp;&amp;
          {'\n'}(
          <span className={styles['cel-editor__str']}>"Alpha"</span> in{' '}
          <span className={styles['cel-editor__var']}>
            user.attributes.Program
          </span>{' '}
          ||{' '}
          <span className={styles['cel-editor__masked']}>"--------"</span> in{' '}
          <span className={styles['cel-editor__var']}>
            user.attributes.Program
          </span>
          )
        </code>
      </pre>
      <div className={styles['cel-editor__status']}>
        <span className={styles['cel-editor__valid']}>
          <CheckCircleOutlineIcon size={14} /> Valid
        </span>
        <span className={styles['cel-editor__loc']}>L1:1</span>
      </div>
    </div>
  );
}

function AdvancedEditor({
  banner,
  variant,
}: {
  banner: CopyOption;
  variant: AdvancedVariant;
}) {
  const showPolicyBanner = variant !== 'suppress' && variant !== 'merge';
  const showSecondBanner =
    variant === 'current' || variant === 'suppress';
  const showMergedBanner = variant === 'merge';
  const showInlineNote = variant === 'differentiate';
  const showEditorStrip =
    variant === 'editorChrome' || variant === 'chromeOnly';
  const showStripText = variant === 'editorChrome';

  return (
    <div className={styles['editor']}>
      <div className={styles['editor__header']}>
        <div>
          <h3 className={styles['editor__title']}>
            Attribute-based membership rules
          </h3>
          <p className={styles['editor__subtitle']}>
            Select user attributes and values that qualifying users must have
          </p>
        </div>
        <Button
          emphasis={variant === 'editorChrome' ? 'Secondary' : 'Primary'}
        >
          Switch to Simple mode
        </Button>
      </div>

      {showPolicyBanner ? (
        <SectionNotice
          type={banner.type}
          title={banner.title}
          description={banner.body}
        />
      ) : null}

      {showMergedBanner ? (
        <SectionNotice
          type="Warning"
          title={banner.title}
          description={
            <>
              {banner.body}{' '}
              <strong>
                The Advanced editor is read-only because this expression
                contains restricted values.
              </strong>{' '}
              Switch to Simple mode to edit the values you have access to.
            </>
          }
        />
      ) : null}

      {showSecondBanner ? (
        <div className={styles['legacy-second-banner']}>
          <Icon size="16" glyph={<LockOutlineIcon />} />
          <span>
            This expression contains restricted values. Switch to Simple mode
            to edit the values you have access to.
          </span>
        </div>
      ) : null}

      {showInlineNote ? (
        <div className={styles['inline-note']}>
          <Icon size="12" glyph={<LockOutlineIcon />} />
          <span>
            Editor is read-only. Switch to Simple mode to edit the values you
            have access to.
          </span>
        </div>
      ) : null}

      <div
        className={`${styles['editor__cel-wrap']} ${
          variant === 'editorChrome' || variant === 'chromeOnly'
            ? styles['editor__cel-wrap--bordered']
            : ''
        }`}
      >
        {showEditorStrip ? (
          <div
            className={`${styles['editor-strip']} ${
              showStripText ? '' : styles['editor-strip--icon-only']
            }`}
          >
            <div className={styles['editor-strip__lhs']}>
              <Icon size="12" glyph={<LockOutlineIcon />} />
              {showStripText ? (
                <span>
                  Read-only — this expression contains restricted values.
                </span>
              ) : (
                <span className={styles['editor-strip__brief']}>Read-only</span>
              )}
            </div>
            {showStripText ? (
              <button
                type="button"
                className={styles['editor-strip__action']}
              >
                Switch to Simple mode
              </button>
            ) : null}
          </div>
        ) : null}

        <CelMonacoMock
          readOnly={
            variant === 'editorChrome' || variant === 'chromeOnly'
          }
        />
      </div>

      <p className={styles['editor__helper']}>
        Write rules like{' '}
        <code>user.attributes.&lt;attribute&gt; == &lt;value&gt;</code>. Use{' '}
        <code>&amp;&amp;</code> / <code>||</code> (and/or) for multiple
        conditions. Group conditions with <code>()</code>.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function MaskingNoticeOptions() {
  const [mode, setMode] = useState<Mode>('simple');
  const [copyOptionId, setCopyOptionId] = useState<string>('B');
  const [advancedVariant, setAdvancedVariant] =
    useState<AdvancedVariant>('editorChrome');

  const selectedCopy =
    COPY_OPTIONS.find((o) => o.id === copyOptionId) ?? COPY_OPTIONS[0];
  const selectedAdvanced =
    ADVANCED_OPTIONS.find((o) => o.id === advancedVariant) ??
    ADVANCED_OPTIONS[0];

  return (
    <div className={styles['page']}>
      <header className={styles['hero']}>
        <span className={styles['eyebrow']}>PR 36517 · UX Review</span>
        <h1 className={styles['title']}>Masked-policy notice options</h1>
        <p className={styles['lede']}>
          Interactive comparison of copy and visual-treatment options for the
          masked-policy notice in System Console → Access Policies (v3).
          Recommended combination: page-level banner with <strong>Option B</strong>{' '}
          (mirror structure) for Surface 1, <strong>tooltip on the disabled
          Delete button</strong> for Surface 2 (replaces the previous banner —
          mirrors the existing TestButton tooltip pattern), and a simplified
          past-tense title plus terse body for the Surface 3 defensive modal.
          Visual <strong>Option 4 (editor chrome strip)</strong> for Advanced
          mode. See <code>pr_36517_consolidated_copy.md</code> for the final
          cross-surface copy and{' '}
          <code>pr_36517_masking_notice_analysis.md</code> for the
          visual-treatment ideation.
        </p>
      </header>

      <section className={styles['controls']}>
        <div className={styles['control-group']}>
          <span className={styles['control-group__label']}>Mode</span>
          <div className={styles['toggle']} role="tablist">
            <button
              role="tab"
              aria-selected={mode === 'simple'}
              className={`${styles['toggle__btn']} ${
                mode === 'simple' ? styles['toggle__btn--active'] : ''
              }`}
              onClick={() => setMode('simple')}
            >
              Simple
            </button>
            <button
              role="tab"
              aria-selected={mode === 'advanced'}
              className={`${styles['toggle__btn']} ${
                mode === 'advanced' ? styles['toggle__btn--active'] : ''
              }`}
              onClick={() => setMode('advanced')}
            >
              Advanced
            </button>
          </div>
        </div>

        <div className={styles['control-group']}>
          <span className={styles['control-group__label']}>Copy option</span>
          <select
            value={copyOptionId}
            onChange={(e) => setCopyOptionId(e.target.value)}
            className={styles['select']}
          >
            {COPY_OPTIONS.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        {mode === 'advanced' ? (
          <div className={styles['control-group']}>
            <span className={styles['control-group__label']}>
              Visual treatment
            </span>
            <select
              value={advancedVariant}
              onChange={(e) =>
                setAdvancedVariant(e.target.value as AdvancedVariant)
              }
              className={styles['select']}
            >
              {ADVANCED_OPTIONS.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        ) : null}
      </section>

      <section className={styles['preview-shell']}>
        <div className={styles['preview-shell__chrome']}>
          <span className={styles['preview-shell__breadcrumb']}>
            System Console · User Management · Membership Policies ·
            Edit
          </span>
          <span className={styles['preview-shell__user']}>@user-1</span>
        </div>

        <div className={styles['preview-shell__body']}>
          <header className={styles['preview-policy-header']}>
            <span className={styles['preview-policy-header__back']}>
              &lt; Back
            </span>
            <h2 className={styles['preview-policy-header__title']}>
              Edit Membership Policy
            </h2>
          </header>

          {mode === 'simple' ? (
            <SimpleEditor banner={selectedCopy} />
          ) : (
            <AdvancedEditor
              banner={selectedCopy}
              variant={advancedVariant}
            />
          )}
        </div>
      </section>

      {selectedCopy.note ? (
        <aside className={styles['note']}>
          <strong>About this copy option:</strong> {selectedCopy.note}
        </aside>
      ) : null}

      {mode === 'advanced' && selectedAdvanced.note ? (
        <aside className={styles['note']}>
          <strong>About this visual treatment:</strong> {selectedAdvanced.note}
        </aside>
      ) : null}

      <section className={styles['matrix']}>
        <h2 className={styles['section-title']}>
          All copy options at a glance
        </h2>
        <p className={styles['section-lede']}>
          Each option shown in the same SectionNotice chrome so the difference
          is purely copy.
        </p>
        <div className={styles['matrix__grid']}>
          {COPY_OPTIONS.map((opt) => (
            <article
              key={opt.id}
              className={`${styles['matrix__card']} ${
                opt.id === copyOptionId
                  ? styles['matrix__card--selected']
                  : ''
              }`}
            >
              <header className={styles['matrix__card-head']}>
                <span className={styles['matrix__card-label']}>
                  {opt.label}
                </span>
                <button
                  type="button"
                  className={styles['matrix__card-pick']}
                  onClick={() => setCopyOptionId(opt.id)}
                >
                  {opt.id === copyOptionId ? 'Selected' : 'Preview above'}
                </button>
              </header>
              <SectionNotice
                type={opt.type}
                title={opt.title}
                description={opt.body}
              />
              {opt.note ? (
                <p className={styles['matrix__card-note']}>{opt.note}</p>
              ) : null}
            </article>
          ))}
        </div>
      </section>

      <section className={styles['recommendation']}>
        <h2 className={styles['section-title']}>Recommended final design</h2>
        <p className={styles['section-lede']}>
          Surface 1: page-level banner with Option B copy (mirror structure).
          Surface 2: tooltip on the disabled Delete button (no banner). Surface
          3: simplified past-tense modal error. Advanced mode pairs with Visual
          Option 4 (editor chrome strip).
        </p>

        <div className={styles['recommendation__pair']}>
          <div>
            <h3 className={styles['recommendation__heading']}>
              Surface 1 — Simple mode banner
            </h3>
            <div className={styles['recommendation__frame']}>
              <SimpleEditor
                banner={
                  COPY_OPTIONS.find((o) => o.id === 'B') ?? COPY_OPTIONS[0]
                }
              />
            </div>
          </div>

          <div>
            <h3 className={styles['recommendation__heading']}>
              Surface 1 — Advanced mode (banner + editor strip)
            </h3>
            <div className={styles['recommendation__frame']}>
              <AdvancedEditor
                banner={
                  COPY_OPTIONS.find((o) => o.id === 'B') ?? COPY_OPTIONS[0]
                }
                variant="editorChrome"
              />
            </div>
          </div>
        </div>

        <h3
          className={styles['recommendation__heading']}
          style={{ marginTop: 'var(--spacing-xxl)' }}
        >
          Surface 2 — Tooltip on disabled Delete button (replaces banner)
        </h3>
        <p className={styles['section-lede']}>
          Same tooltip key reused across the list-page Delete menu item and the
          policy details Delete Policy button. Mirrors the existing TestButton
          tooltip pattern shipped in this PR.
        </p>
        <div className={styles['recommendation__pair']}>
          <div>
            <h4 className={styles['recommendation__subheading']}>
              On the policy details page
            </h4>
            <div
              className={`${styles['recommendation__frame']} ${styles['tooltip-frame']}`}
            >
              <div className={styles['tooltip-anchor']}>
                <Button emphasis="Primary" destructive disabled>
                  Delete policy
                </Button>
                <div className={styles['tooltip-anchor__tip']}>
                  <Tooltip
                    arrow="Top"
                    label="Deletion is unavailable because this policy contains restricted attribute values."
                  />
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className={styles['recommendation__subheading']}>
              On the policies list page (Delete menu item)
            </h4>
            <div
              className={`${styles['recommendation__frame']} ${styles['tooltip-frame']}`}
            >
              <div className={styles['tooltip-anchor']}>
                <div className={styles['menu-item-mock']}>
                  <Icon size="16" glyph={<TrashCanOutlineIcon />} />
                  <span>Delete</span>
                </div>
                <div className={styles['tooltip-anchor__tip']}>
                  <Tooltip
                    arrow="Top"
                    label="Deletion is unavailable because this policy contains restricted attribute values."
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <h3
          className={styles['recommendation__heading']}
          style={{ marginTop: 'var(--spacing-xxl)' }}
        >
          Surface 3 — Defensive 403 modal (reachable only on stale-render race)
        </h3>
        <div className={styles['recommendation__frame']}>
          {(() => {
            const s3 =
              COPY_OPTIONS.find((o) => o.id === 'S3') ?? COPY_OPTIONS[0];
            return (
              <div className={styles['modal-mock']}>
                <div className={styles['modal-mock__header']}>
                  Confirm Policy Deletion
                </div>
                <div className={styles['modal-mock__body']}>
                  <p>
                    Are you sure you want to delete this policy? This action
                    cannot be undone.
                  </p>
                  <SectionNotice
                    type={s3.type}
                    title={s3.title}
                    description={s3.body}
                  />
                </div>
                <div className={styles['modal-mock__footer']}>
                  <Button emphasis="Tertiary">Cancel</Button>
                  <Button emphasis="Primary" destructive>
                    Delete policy
                  </Button>
                </div>
              </div>
            );
          })()}
        </div>
      </section>
    </div>
  );
}
