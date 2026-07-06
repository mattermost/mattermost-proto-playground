import CheckIcon from '@mattermost/compass-icons/components/check';
import CloseIcon from '@mattermost/compass-icons/components/close';
import AlertOutlineIcon from '@mattermost/compass-icons/components/alert-outline';
import DownloadOutlineIcon from '@mattermost/compass-icons/components/download-outline';
import Button from '@/components/ui/Button/Button';
import Icon from '@/components/ui/Icon/Icon';
import {
  isEligibleForPolicies,
  freshnessCaveat,
  textTypeCaveat,
  type Attribute,
} from '../../data';
import styles from './EligibilityAuditTable.module.scss';

export interface EligibilityAuditTableProps {
  attributes: Attribute[];
  onExport?: () => void;
}

/**
 * Eligibility audit view: a derived table lens on the same catalog.
 * NOT a new top-level area — toggled via [List] [Eligibility audit] beside search.
 *
 * Columns: Name · Type · Applies-to · Eligible? · Reason
 * Sort: Eligible? — group No on top (surfaces the gaps).
 * Eligible badge is non-color-only (icon + label).
 */
export default function EligibilityAuditTable({
  attributes,
  onExport,
}: EligibilityAuditTableProps) {
  // Sort so No (disqualified) appears on top.
  const sorted = [...attributes].sort((a, b) => {
    const ae = isEligibleForPolicies(a).eligible ? 1 : 0;
    const be = isEligibleForPolicies(b).eligible ? 1 : 0;
    return ae - be;
  });

  return (
    <div className={styles['audit']}>
      <div className={styles['audit__toolbar']}>
        <p className={styles['audit__lede']}>
          Which attributes can drive access policies, and why. Attributes
          become eligible when end users can&apos;t self-edit their own
          value.
        </p>
        <Button
          emphasis="Tertiary"
          size="Small"
          leadingIcon={<Icon glyph={<DownloadOutlineIcon />} size="16" />}
          onClick={onExport}
        >
          Export CSV
        </Button>
      </div>

      <table className={styles['audit__table']}>
        <thead>
          <tr>
            <th scope="col">Name</th>
            <th scope="col">Type</th>
            <th scope="col">Applies to</th>
            <th scope="col">Eligible?</th>
            <th scope="col">Reason</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((a) => {
            const { eligible, reason } = isEligibleForPolicies(a);
            const fresh = freshnessCaveat(a);
            const text = textTypeCaveat(a);
            // A clean green "Yes" is only allowed when eligible AND fresh AND
            // not free-text (findings 1 + 4).
            const caveated = eligible && (fresh != null || text != null);
            return (
              <tr key={a.id}>
                <td className={styles['audit__name']}>{a.name}</td>
                <td className={styles['audit__type']}>{a.type}</td>
                <td>
                  <span className={styles['audit__applies']}>
                    {a.appliesTo.map((b) => b.resource).join(' · ')}
                  </span>
                </td>
                <td>
                  <span
                    className={`${styles['audit__badge']} ${
                      !eligible
                        ? styles['audit__badge--no']
                        : caveated
                          ? styles['audit__badge--caveat']
                          : styles['audit__badge--yes']
                    }`}
                  >
                    <span
                      className={styles['audit__badge-icon']}
                      aria-hidden
                    >
                      {!eligible ? (
                        <CloseIcon size={12} />
                      ) : caveated ? (
                        <AlertOutlineIcon size={12} />
                      ) : (
                        <CheckIcon size={12} />
                      )}
                    </span>
                    <span>{eligible ? 'Yes' : 'No'}</span>
                  </span>
                  {/* Distinct caveat chips next to the Yes (findings 1 + 4). */}
                  {fresh && (
                    <span
                      className={`${styles['audit__caveat']} ${fresh.state === 'Stale' ? styles['audit__caveat--warn'] : styles['audit__caveat--danger']}`}
                    >
                      {fresh.short}
                    </span>
                  )}
                  {text && (
                    <span
                      className={`${styles['audit__caveat']} ${styles['audit__caveat--warn']}`}
                    >
                      free text
                    </span>
                  )}
                </td>
                <td className={styles['audit__reason']}>
                  {reason}
                  {fresh && (
                    <span className={styles['audit__reason-caveat']}>
                      Eligible by rule, but {fresh.long} — value may be
                      out of date.
                    </span>
                  )}
                  {text && (
                    <span className={styles['audit__reason-caveat']}>
                      No validated value set — policies match the exact
                      string.
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
