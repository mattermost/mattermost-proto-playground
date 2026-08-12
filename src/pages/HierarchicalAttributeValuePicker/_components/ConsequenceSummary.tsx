import { useState } from 'react';
import AccountMultipleOutlineIcon from '@mattermost/compass-icons/components/account-multiple-outline';
import ChevronDownIcon from '@mattermost/compass-icons/components/chevron-down';
import ChevronRightIcon from '@mattermost/compass-icons/components/chevron-right';
import Button from '@/components/ui/Button/Button';
import Icon from '@/components/ui/Icon/Icon';
import SectionNotice from '@/components/ui/SectionNotice/SectionNotice';
import UserAvatar from '@/components/ui/UserAvatar/UserAvatar';
import UserAvatarGroup from '@/components/ui/UserAvatarGroup/UserAvatarGroup';
import type { GraphOption } from '@/pages/HierarchicalAttributeAuthoring/graphModel';
import {
  crossHierarchyNotice,
  dominatedPairs,
  effectiveRequirement,
  inertMarkingNotice,
  labelsFor,
  listLabels,
  qualifyingSentence,
  qualifyingUsers,
  qualifyingVia,
  redundancyNotice,
  resourceConsequence,
  subjectConsequence,
  ZERO_QUALIFYING_CONFIRMED,
  zeroQualifyingNotice,
  type PickerSide,
  type ViewerMode,
} from '@/pages/HierarchicalAttributeValuePicker/pickerModel';
import styles from './ConsequenceSummary.module.scss';

export interface ConsequenceSummaryProps {
  side: PickerSide;
  viewer: ViewerMode;
  /** Viewer-scoped graph. */
  options: GraphOption[];
  selected: string[];
  /** Whose access the subject side is describing. */
  personName: string;
  onRemove: (ids: string[]) => void;
  zeroConfirmed: boolean;
  onConfirmZero: () => void;
}

/**
 * P1 · The consequence of the current selection, rendered as a live sentence.
 *
 * This is the single highest-value element on the screen, so it is prose in the
 * reading order — not an icon, not a tooltip, not a hover. The subject and
 * resource readings of the SAME selection are produced by two different sentence
 * builders (P1/P2) and the same relation drives a soft flag on one side and a
 * hard warning on the other (P3).
 */
export default function ConsequenceSummary({
  side,
  viewer,
  options,
  selected,
  personName,
  onRemove,
  zeroConfirmed,
  onConfirmZero,
}: ConsequenceSummaryProps) {
  const [showQualifiers, setShowQualifiers] = useState(false);

  const isResource = side === 'resource';
  const consequence = isResource
    ? resourceConsequence(options, selected, viewer)
    : subjectConsequence(options, selected, personName);

  const pairs = dominatedPairs(options, selected);
  const redundancy = !isResource
    ? redundancyNotice(options, pairs, personName)
    : null;
  const inert = isResource ? inertMarkingNotice(options, pairs) : null;
  const crossHierarchy = crossHierarchyNotice(
    options,
    selected,
    side,
    personName,
  );

  const qualifiers = isResource ? qualifyingUsers(selected) : [];
  const zeroQualifying = isResource && selected.length > 0 && qualifiers.length === 0;

  const effective = isResource ? effectiveRequirement(options, selected) : [];
  const collapsed = isResource && effective.length < selected.length;

  return (
    <div className={styles['consequence']}>
      <div
        className={[
          styles['consequence__card'],
          isResource
            ? styles['consequence__card--resource']
            : styles['consequence__card--subject'],
        ].join(' ')}
        role="status"
        aria-live="polite"
      >
        <span className={styles['consequence__eyebrow']}>
          {isResource ? 'Who can enter this channel' : `What ${personName} can reach`}
        </span>
        <p className={styles['consequence__headline']}>{consequence.headline}</p>
        <p className={styles['consequence__detail']}>{consequence.detail}</p>

        {collapsed && (
          <p className={styles['consequence__effective']}>
            Effective requirement:{' '}
            <span className={styles['consequence__effective-value']}>
              {listLabels(labelsFor(options, effective))} or above
            </span>
          </p>
        )}

        {isResource && selected.length > 0 && (
          <div className={styles['consequence__qualifiers']}>
            <span className={styles['consequence__qualifiers-icon']} aria-hidden>
              <Icon size="16" glyph={<AccountMultipleOutlineIcon />} />
            </span>
            <span
              className={[
                styles['consequence__qualifiers-count'],
                zeroQualifying
                  ? styles['consequence__qualifiers-count--zero']
                  : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {qualifyingSentence(qualifiers.length)}
            </span>
            {qualifiers.length > 0 && (
              <>
                <UserAvatarGroup
                  className={styles['consequence__qualifiers-avatars']}
                  size="20"
                  max={4}
                  avatars={qualifiers.map((u) => ({
                    key: u.id,
                    src: u.avatarSrc,
                    name: u.name,
                  }))}
                />
                <button
                  type="button"
                  className={styles['consequence__qualifiers-toggle']}
                  aria-expanded={showQualifiers}
                  onClick={() => setShowQualifiers((v) => !v)}
                >
                  <Icon
                    size="12"
                    glyph={
                      showQualifiers ? <ChevronDownIcon /> : <ChevronRightIcon />
                    }
                  />
                  {showQualifiers ? 'Hide' : 'Show'} who qualifies
                </button>
              </>
            )}
          </div>
        )}

        {isResource && showQualifiers && qualifiers.length > 0 && (
          <ul className={styles['consequence__list']}>
            {qualifiers.map((u) => (
              <li key={u.id} className={styles['consequence__list-item']}>
                <UserAvatar size="20" src={u.avatarSrc} alt={u.name} />
                <span className={styles['consequence__list-name']}>{u.name}</span>
                {/* A restricted viewer sees names only. A user can qualify
                    through an ancestor outside the restricted pool, so naming
                    the satisfying value would leak a withheld value (P6). */}
                {viewer === 'admin' && (
                  <span className={styles['consequence__list-via']}>
                    via {listLabels(qualifyingVia(u, selected))}
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* P3 · same relation, opposite severity. */}
      {redundancy != null && (
        <SectionNotice
          type="Hint"
          title={redundancy.title}
          description={redundancy.description}
          secondaryButtonLabel={
            pairs.length === 1 ? 'Remove redundant value' : 'Remove redundant values'
          }
          onSecondaryAction={() => onRemove(pairs.map((p) => p.inertId))}
        />
      )}

      {inert != null && (
        <SectionNotice
          type="Warning"
          title={inert.title}
          description={
            <>
              <span className={styles['consequence__notice-text']}>
                {inert.description}
              </span>
              <span className={styles['consequence__notice-actions']}>
                <Button
                  emphasis="Secondary"
                  size="Small"
                  onClick={() => onRemove(pairs.map((p) => p.dominantId))}
                >
                  Remove{' '}
                  {listLabels(labelsFor(options, [
                    ...new Set(pairs.map((p) => p.dominantId)),
                  ]))}
                </Button>
                <Button
                  emphasis="Tertiary"
                  size="Small"
                  onClick={() => onRemove(pairs.map((p) => p.inertId))}
                >
                  Remove{' '}
                  {listLabels(labelsFor(options, pairs.map((p) => p.inertId)))}
                </Button>
              </span>
            </>
          }
        />
      )}

      {crossHierarchy != null && (
        <SectionNotice
          type="Info"
          title={crossHierarchy.title}
          description={crossHierarchy.description}
        />
      )}

      {zeroQualifying && !zeroConfirmed && (
        <SectionNotice
          type="Danger"
          title={zeroQualifyingNotice(options, selected).title}
          description={zeroQualifyingNotice(options, selected).description}
          secondaryButtonLabel="Mark it anyway"
          onSecondaryAction={onConfirmZero}
        />
      )}

      {zeroQualifying && zeroConfirmed && (
        <SectionNotice
          type="Success"
          title={ZERO_QUALIFYING_CONFIRMED.title}
          description={ZERO_QUALIFYING_CONFIRMED.description}
        />
      )}
    </div>
  );
}
