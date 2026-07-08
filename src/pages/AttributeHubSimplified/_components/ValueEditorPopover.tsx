import { useState } from 'react';
import CheckIcon from '@mattermost/compass-icons/components/check';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import CloseIcon from '@mattermost/compass-icons/components/close';
import ChevronRightIcon from '@mattermost/compass-icons/components/chevron-right';
import ChevronLeftIcon from '@mattermost/compass-icons/components/chevron-left';
import SortAscendingIcon from '@mattermost/compass-icons/components/sort-ascending';
import CancelIcon from '@mattermost/compass-icons/components/cancel';
import TrashCanOutlineIcon from '@mattermost/compass-icons/components/trash-can-outline';
import GlobeIcon from '@mattermost/compass-icons/components/globe';
import TranslateIcon from '@mattermost/compass-icons/components/translate';
import Icon from '@/components/ui/Icon/Icon';
import TextInput from '@/components/ui/TextInput/TextInput';
import Button from '@/components/ui/Button/Button';
import Select from '@/components/ui/Select/Select';
import FixedPopoverMenu from '@/components/ui/FixedPopoverMenu/FixedPopoverMenu';
import type { RefObject } from 'react';
import type { AttrValue } from '@/pages/AttributeManagementHub/hubData';
import {
  OPTION_LOCALES,
  OPTION_SWATCHES,
  localeLabel,
  optionMeta,
  setOptionMeta,
  type OptionMeta,
} from './simplifiedModel';
import styles from './ValueEditorPopover.module.scss';

export interface ValueEditorPopoverProps {
  value: AttrValue;
  /** Whether this option carries a tier/rank (ranked types only). */
  ranked: boolean;
  /** Total ranked positions, for the rank picker range. */
  tierCount: number;
  /** Editing disabled (policy-locked or source-owned). */
  readOnly: boolean;
  anchorRef: RefObject<HTMLElement | null>;
  onClose: () => void;
  onRelabel: (label: string) => void;
  onSetRank: (tier: number) => void;
  onDeactivate: () => void;
  onRemove: () => void;
}

/**
 * Rich option editor — the chip-click popover (ref: value-editor screenshot):
 * editable label, Rank/Tier chevron, Colors swatch row (incl. a color coming
 * from the connected external source), Translations, Deactivate, Remove.
 *
 * Color + translations live in the scene-local option-meta side table; label,
 * rank, deactivate and remove flow back through the parent's value mutators.
 */
export default function ValueEditorPopover({
  value,
  ranked,
  tierCount,
  readOnly,
  anchorRef,
  onClose,
  onRelabel,
  onSetRank,
  onDeactivate,
  onRemove,
}: ValueEditorPopoverProps) {
  const [meta, setMeta] = useState<OptionMeta>(() => optionMeta(value.id));
  const [pane, setPane] = useState<'main' | 'rank' | 'translations'>('main');
  const [addingLocale, setAddingLocale] = useState<string>('');
  const [translationDraft, setTranslationDraft] = useState('');

  const commitMeta = (next: OptionMeta) => {
    const merged = { ...meta, ...next };
    setMeta(merged);
    setOptionMeta(value.id, merged);
  };

  const sourceColor = meta.colorFromSource;
  const translations = meta.translations ?? {};
  const translationEntries = Object.entries(translations);
  const usedLocales = new Set(Object.keys(translations));
  const availableLocales = OPTION_LOCALES.filter((l) => !usedLocales.has(l.code));

  const rankLabel = (tier: number): string => {
    if (tier === tierCount) return `${tier} (Highest)`;
    if (tier === 1) return `${tier} (Lowest)`;
    return String(tier);
  };

  return (
    <FixedPopoverMenu
      open
      onClose={onClose}
      anchorRef={anchorRef}
      minWidthFloor={320}
    >
      <div className={styles['ve']}>
        {pane === 'main' && (
          <>
            <div className={styles['ve__label-field']}>
              <TextInput
                size="Medium"
                value={value.label}
                readOnly={readOnly}
                aria-label="Option label"
                onChange={(e) => onRelabel(e.target.value)}
              />
            </div>

            {ranked && (
              <button
                type="button"
                className={styles['ve__nav-row']}
                disabled={readOnly}
                onClick={() => setPane('rank')}
              >
                <Icon size="20" glyph={<SortAscendingIcon />} />
                <span className={styles['ve__nav-label']}>Rank</span>
                <span className={styles['ve__nav-value']}>
                  {value.tier != null ? rankLabel(value.tier) : 'Unranked'}
                </span>
                <Icon size="16" glyph={<ChevronRightIcon />} />
              </button>
            )}

            <div className={styles['ve__section']}>
              <div className={styles['ve__section-head']}>
                <span className={styles['ve__section-title']}>Colors</span>
                {sourceColor && (
                  <span className={styles['ve__source-tag']}>
                    <Icon size="12" glyph={<GlobeIcon />} />
                    From source
                  </span>
                )}
              </div>
              <div className={styles['ve__swatches']}>
                {OPTION_SWATCHES.map((swatch) => {
                  const active = meta.color === swatch.token;
                  return (
                    <button
                      key={swatch.id}
                      type="button"
                      className={[
                        styles['ve__swatch'],
                        active ? styles['ve__swatch--active'] : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      style={{ backgroundColor: swatch.token }}
                      aria-label={swatch.label}
                      aria-pressed={active}
                      disabled={readOnly || sourceColor}
                      onClick={() =>
                        commitMeta({ color: swatch.token, colorFromSource: false })
                      }
                    >
                      {active && (
                        <Icon size="16" glyph={<CheckIcon />} />
                      )}
                    </button>
                  );
                })}
                <button
                  type="button"
                  className={styles['ve__swatch-add']}
                  aria-label="Add custom color"
                  disabled={readOnly || sourceColor}
                  onClick={() => commitMeta({ color: 'var(--color-blue-600)' })}
                >
                  <Icon size="16" glyph={<PlusIcon />} />
                </button>
              </div>
              {sourceColor && (
                <p className={styles['ve__source-note']}>
                  This color is provided by the connected external source and
                  can’t be changed here.
                </p>
              )}
            </div>

            <button
              type="button"
              className={styles['ve__nav-row']}
              disabled={readOnly}
              onClick={() => setPane('translations')}
            >
              <Icon size="20" glyph={<TranslateIcon />} />
              <span className={styles['ve__nav-label']}>Translations</span>
              <span className={styles['ve__nav-value']}>
                {translationEntries.length > 0
                  ? `${translationEntries.length} added`
                  : 'None'}
              </span>
              <Icon size="16" glyph={<ChevronRightIcon />} />
            </button>

            <div className={styles['ve__divider']} />

            <button
              type="button"
              className={[styles['ve__action'], styles['ve__action--danger']].join(' ')}
              disabled={readOnly}
              onClick={onDeactivate}
            >
              <Icon size="20" glyph={<CancelIcon />} />
              {value.disabled ? 'Reactivate option' : 'Deactivate option'}
            </button>
            <button
              type="button"
              className={[styles['ve__action'], styles['ve__action--danger']].join(' ')}
              disabled={readOnly}
              onClick={onRemove}
            >
              <Icon size="20" glyph={<TrashCanOutlineIcon />} />
              Remove option
            </button>
          </>
        )}

        {pane === 'rank' && (
          <div className={styles['ve__pane']}>
            <button
              type="button"
              className={styles['ve__back']}
              onClick={() => setPane('main')}
            >
              <Icon size="16" glyph={<ChevronLeftIcon />} />
              Rank
            </button>
            <div className={styles['ve__rank-list']}>
              {Array.from({ length: tierCount }, (_, i) => tierCount - i).map(
                (tier) => (
                  <button
                    key={tier}
                    type="button"
                    className={[
                      styles['ve__rank-item'],
                      value.tier === tier ? styles['ve__rank-item--active'] : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    onClick={() => {
                      onSetRank(tier);
                      setPane('main');
                    }}
                  >
                    <span>{rankLabel(tier)}</span>
                    {value.tier === tier && (
                      <Icon size="16" glyph={<CheckIcon />} />
                    )}
                  </button>
                ),
              )}
            </div>
          </div>
        )}

        {pane === 'translations' && (
          <div className={styles['ve__pane']}>
            <button
              type="button"
              className={styles['ve__back']}
              onClick={() => setPane('main')}
            >
              <Icon size="16" glyph={<ChevronLeftIcon />} />
              Translations
            </button>
            <div className={styles['ve__trans-list']}>
              {translationEntries.length === 0 && (
                <p className={styles['ve__trans-empty']}>
                  No translations yet. The default label is used everywhere else.
                </p>
              )}
              {translationEntries.map(([code, label]) => (
                <div key={code} className={styles['ve__trans-row']}>
                  <span className={styles['ve__trans-locale']}>
                    {localeLabel(code)}
                  </span>
                  <span className={styles['ve__trans-value']}>{label}</span>
                  <button
                    type="button"
                    className={styles['ve__trans-remove']}
                    aria-label={`Remove ${localeLabel(code)} translation`}
                    onClick={() => {
                      const next = { ...translations };
                      delete next[code];
                      commitMeta({ translations: next });
                    }}
                  >
                    <Icon size="12" glyph={<CloseIcon />} />
                  </button>
                </div>
              ))}
            </div>
            {availableLocales.length > 0 && (
              <div className={styles['ve__trans-add']}>
                <Select
                  size="Small"
                  value={addingLocale}
                  aria-label="Language"
                  onChange={(e) => setAddingLocale(e.target.value)}
                >
                  <option value="">Language…</option>
                  {availableLocales.map((l) => (
                    <option key={l.code} value={l.code}>
                      {l.label}
                    </option>
                  ))}
                </Select>
                <TextInput
                  size="Small"
                  placeholder="Translated label"
                  value={translationDraft}
                  onChange={(e) => setTranslationDraft(e.target.value)}
                />
                <Button
                  emphasis="Secondary"
                  size="Small"
                  disabled={!addingLocale || translationDraft.trim().length === 0}
                  onClick={() => {
                    commitMeta({
                      translations: {
                        ...translations,
                        [addingLocale]: translationDraft.trim(),
                      },
                    });
                    setAddingLocale('');
                    setTranslationDraft('');
                  }}
                >
                  Add
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </FixedPopoverMenu>
  );
}
