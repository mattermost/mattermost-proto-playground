import CheckIcon from '@mattermost/compass-icons/components/check';
import CloseIcon from '@mattermost/compass-icons/components/close';
import LinkVariantIcon from '@mattermost/compass-icons/components/link-variant';
import SourceBranchIcon from '@mattermost/compass-icons/components/source-branch';
import Button from '@/components/ui/Button/Button';
import EmptyState from '@/components/ui/EmptyState/EmptyState';
import Icon from '@/components/ui/Icon/Icon';
import IconButton from '@/components/ui/IconButton/IconButton';
import LabelTag from '@/components/ui/LabelTag/LabelTag';
import Scrollbars from '@/components/ui/Scrollbars/Scrollbars';
import {
  depthOf,
  parentsOf,
} from '@/pages/HierarchicalAttributeAuthoring/graphModel';
import {
  offeredValueIds,
  optionLabel,
  type CapResolution,
  type ValueScheme,
} from '../boundsModel';
import {
  CLEAR_ACTION,
  CLEAR_HELP,
  CLEAR_NO_REVERT_NOTE,
  UNRESOLVABLE_ACTION,
  UNRESOLVABLE_EMPTY_TITLE,
  capExplainer,
  capHeader,
  inheritedDetail,
  noun,
  unresolvableEmptyDetail,
  unresolvableNotNoLimit,
} from '../copy';
import styles from './BoundedValuePicker.module.scss';

export interface BoundedValuePickerProps {
  scheme: ValueScheme;
  cap: CapResolution;
  /** The value stored on the object. `null` = nothing stored → inheriting. */
  storedValueId: string | null;
  /** The value currently shown (stored value, or the derived one). */
  effectiveValueId: string | null;
  onPick: (valueId: string) => void;
  onClear: () => void;
  onClose: () => void;
  /** Opens the channel settings surface from the fail-closed empty state. */
  onOpenReference?: () => void;
}

/**
 * The composer-side value picker for a bounded field.
 *
 * `read.option.bounds` in the flesh: the list contains ONLY values at-or-below
 * the reference. Values above the cap are not rendered at all — not greyed out,
 * not struck through — because they are not offered. What IS rendered is the
 * reason the list is short: the cap, and where the cap comes from. Otherwise a
 * narrowed list is indistinguishable from a broken one.
 *
 * When the cap cannot be resolved the list is empty and says so as fail-closed,
 * not as "nothing configured".
 */
export default function BoundedValuePicker({
  scheme,
  cap,
  storedValueId,
  effectiveValueId,
  onPick,
  onClear,
  onClose,
  onOpenReference,
}: BoundedValuePickerProps) {
  const offered = offeredValueIds(scheme, cap);
  const resolved = cap.status === 'resolved' && cap.capId != null;
  const capDepth = resolved ? depthOf(scheme.options, cap.capId!) : 0;

  return (
    <div
      className={styles['bounded-picker']}
      role="dialog"
      aria-label={`${scheme.fieldLabel} — choose a value`}
    >
      <div className={styles['bounded-picker__head']}>
        <div className={styles['bounded-picker__head-text']}>
          <span className={styles['bounded-picker__title']}>
            {resolved
              ? capHeader(scheme, cap.sourceLabel, cap.capId!)
              : `No ${noun(scheme)} available`}
          </span>
          <span className={styles['bounded-picker__explainer']}>
            {resolved
              ? capExplainer(scheme, cap.sourceLabel, cap.capId!)
              : unresolvableNotNoLimit(scheme)}
          </span>
        </div>
        <IconButton
          icon={<Icon size="12" glyph={<CloseIcon />} />}
          size="Small"
          aria-label="Close picker"
          onClick={onClose}
        />
      </div>

      <div className={styles['bounded-picker__body']}>
        {offered.length === 0 ? (
          <EmptyState
            className={styles['bounded-picker__empty']}
            title={UNRESOLVABLE_EMPTY_TITLE}
            description={unresolvableEmptyDetail(scheme, cap.sourceLabel)}
            action={
              onOpenReference
                ? {
                    children: UNRESOLVABLE_ACTION,
                    emphasis: 'Tertiary',
                    onClick: onOpenReference,
                  }
                : undefined
            }
          />
        ) : (
          <Scrollbars style={{ maxHeight: 232 }}>
            <ul className={styles['bounded-picker__list']}>
              {offered.map((id) => {
                const isCap = id === cap.capId;
                const selected = id === effectiveValueId;
                const indent =
                  scheme.fieldType === 'hierarchical'
                    ? Math.max(0, depthOf(scheme.options, id) - capDepth)
                    : 0;
                const otherParents = parentsOf(scheme.options, id).filter(
                  (p) => p.id !== cap.capId && !offered.includes(p.id),
                );
                return (
                  <li key={id} className={styles['bounded-picker__item']}>
                    <button
                      type="button"
                      className={[
                        styles['bounded-picker__row'],
                        selected ? styles['bounded-picker__row--selected'] : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      onClick={() => onPick(id)}
                      aria-pressed={selected}
                    >
                      <span
                        className={styles['bounded-picker__indent']}
                        style={{ width: `${indent * 14}px` }}
                        aria-hidden
                      />
                      <span
                        className={styles['bounded-picker__dot']}
                        style={{
                          backgroundColor: scheme.options.find(
                            (o) => o.id === id,
                          )?.color,
                        }}
                        aria-hidden
                      />
                      <span className={styles['bounded-picker__row-text']}>
                        <span className={styles['bounded-picker__row-label']}>
                          {optionLabel(scheme, id)}
                        </span>
                        {otherParents.length > 0 && (
                          <span className={styles['bounded-picker__row-note']}>
                            <Icon size="10" glyph={<SourceBranchIcon />} />
                            {`Also inside ${otherParents
                              .map((p) => p.label)
                              .join(', ')}`}
                          </span>
                        )}
                      </span>
                      {isCap && (
                        <LabelTag
                          label="Channel’s value"
                          type="Info"
                          size="X-Small"
                        />
                      )}
                      {selected && (
                        <span className={styles['bounded-picker__check']}>
                          <Icon size="16" glyph={<CheckIcon />} />
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </Scrollbars>
        )}
      </div>

      <div className={styles['bounded-picker__foot']}>
        {storedValueId != null ? (
          <>
            <Button
              emphasis="Tertiary"
              size="Small"
              destructive
              leadingIcon={<Icon size="16" glyph={<CloseIcon />} />}
              onClick={onClear}
            >
              {CLEAR_ACTION}
            </Button>
            <span className={styles['bounded-picker__foot-text']}>
              {CLEAR_HELP}
              <span className={styles['bounded-picker__foot-sub']}>
                {CLEAR_NO_REVERT_NOTE}
              </span>
            </span>
          </>
        ) : (
          <span className={styles['bounded-picker__foot-text']}>
            <span className={styles['bounded-picker__foot-icon']}>
              <Icon size="12" glyph={<LinkVariantIcon />} />
            </span>
            {resolved
              ? inheritedDetail(scheme, cap.sourceLabel, cap.capId!)
              : unresolvableEmptyDetail(scheme, cap.sourceLabel)}
          </span>
        )}
      </div>
    </div>
  );
}
