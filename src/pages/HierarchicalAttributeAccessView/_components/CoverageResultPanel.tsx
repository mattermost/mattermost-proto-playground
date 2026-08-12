import ArrowRightIcon from '@mattermost/compass-icons/components/arrow-right';
import ShareVariantOutlineIcon from '@mattermost/compass-icons/components/share-variant-outline';
import SourceBranchIcon from '@mattermost/compass-icons/components/source-branch';
import ChartBarIcon from '@mattermost/compass-icons/components/chart-bar';
import Chip from '@/components/ui/Chip/Chip';
import Icon from '@/components/ui/Icon/Icon';
import Select from '@/components/ui/Select/Select';
import {
  grantsSentence,
  labelOf,
  reachSentence,
  reachableBySentence,
  relationOf,
  relationSentence,
  unrelatedSentence,
  usageSentence,
  type CoverageResult,
  type GraphOption,
} from '../accessModel';
import styles from './CoverageResultPanel.module.scss';

export interface CoverageResultPanelProps {
  options: GraphOption[];
  /** Null when nothing is selected. */
  result: CoverageResult | null;
  compareId: string | null;
  onCompareChange: (id: string | null) => void;
  onSelect: (id: string) => void;
}

const RELATION_TONE = {
  same: 'neutral',
  above: 'success',
  below: 'info',
  unrelated: 'warning',
} as const;

/**
 * The results panel beside the diagram — the reason two stakeholders asked for
 * the reference implementation to be productised ("when you click, what access
 * you have"). It answers both directions of the same edge, in words:
 *
 *   forward  — what holding this value grants,
 *   reverse  — who already reaches this value without being granted it.
 *
 * Both matter. The forward answer is what an admin is about to hand out; the
 * reverse answer is the exposure that already exists and is the one people
 * forget to check.
 *
 * Every sentence comes from `accessModel`, so the panel, the diagram highlight
 * and the lineage table cannot disagree.
 */
export default function CoverageResultPanel({
  options,
  result,
  compareId,
  onCompareChange,
  onSelect,
}: CoverageResultPanelProps) {
  if (!result) {
    return (
      <aside className={styles['result']} aria-label="Coverage result">
        <p className={styles['result__idle-title']}>No value selected</p>
        <p className={styles['result__idle-text']}>
          Select a value in the diagram or the lineage table to see what holding
          it grants, who can already reach it, and how much it is being used.
        </p>
      </aside>
    );
  }

  const compareRelation = compareId
    ? relationOf(options, result.id, compareId)
    : null;

  return (
    <aside
      className={styles['result']}
      aria-label={`Coverage result for ${result.label}`}
    >
      <header className={styles['result__header']}>
        <p className={styles['result__eyebrow']}>Selected value</p>
        <h3 className={styles['result__title']}>{result.label}</h3>
      </header>

      <section className={styles['result__section']}>
        <p className={styles['result__section-title']}>
          <Icon size="16" glyph={<ArrowRightIcon />} />
          What holding it grants
        </p>
        <p className={styles['result__sentence']}>
          {grantsSentence(options, result)}
        </p>
        {result.grantsIds.length > 0 && (
          <ul className={styles['result__chips']}>
            {result.grantsIds.map((id) => (
              <li key={id} className={styles['result__chip']}>
                <Chip
                  size="Small"
                  as="button"
                  tone="success"
                  onClick={() => onSelect(id)}
                >
                  {labelOf(options, id)}
                </Chip>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className={styles['result__section']}>
        <p className={styles['result__section-title']}>
          <Icon size="16" glyph={<ShareVariantOutlineIcon />} />
          Who can already reach it
        </p>
        <p className={styles['result__sentence']}>
          {reachableBySentence(options, result)}
        </p>
        {result.reachableByIds.length > 0 && (
          <ul className={styles['result__chips']}>
            {result.reachableByIds.map((id) => (
              <li key={id} className={styles['result__chip']}>
                <Chip
                  size="Small"
                  as="button"
                  tone="info"
                  onClick={() => onSelect(id)}
                >
                  {labelOf(options, id)}
                </Chip>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className={styles['result__section']}>
        <p className={styles['result__section-title']}>
          <Icon size="16" glyph={<ChartBarIcon />} />
          Usage
        </p>
        <p className={styles['result__sentence']}>
          {usageSentence(options, result)}
        </p>
        <p className={styles['result__sentence']}>{reachSentence(result)}</p>
      </section>

      <section className={styles['result__section']}>
        <p className={styles['result__section-title']}>
          <Icon size="16" glyph={<SourceBranchIcon />} />
          Unrelated branches
        </p>
        <p className={styles['result__sentence']}>
          {unrelatedSentence(result)}
        </p>
        {/* Incomparability made checkable for a SPECIFIC pair. Two values on
            different branches is normal, not an error — so the answer is a
            sentence, not an empty result. */}
        <label className={styles['result__compare']}>
          <span className={styles['result__compare-label']}>
            Compare {result.label} with
          </span>
          <Select
            size="Small"
            width="full"
            value={compareId ?? ''}
            onChange={(e) => onCompareChange(e.target.value || null)}
          >
            <option value="">Choose a value…</option>
            {options
              .filter((o) => o.id !== result.id)
              .map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
          </Select>
        </label>
        {compareId && compareRelation && (
          <div className={styles['result__compare-answer']}>
            <Chip size="Small" tone={RELATION_TONE[compareRelation]}>
              {compareRelation === 'unrelated'
                ? 'Unrelated branches'
                : compareRelation === 'above'
                  ? 'Above'
                  : compareRelation === 'below'
                    ? 'Below'
                    : 'Same value'}
            </Chip>
            <p className={styles['result__sentence']}>
              {relationSentence(options, result.id, compareId)}
            </p>
          </div>
        )}
      </section>
    </aside>
  );
}
