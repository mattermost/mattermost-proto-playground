import { useRef, useState } from 'react';
import SortAscendingIcon from '@mattermost/compass-icons/components/sort-ascending';
import LinkVariantIcon from '@mattermost/compass-icons/components/link-variant';
import LinkVariantOffIcon from '@mattermost/compass-icons/components/link-variant-off';
import ChevronDownIcon from '@mattermost/compass-icons/components/chevron-down';
import Button from '@/components/ui/Button/Button';
import Icon from '@/components/ui/Icon/Icon';
import { useOutsideClose } from '@/hooks/useOutsideClose';
import Section from '../Section/Section';
import HelpPopover from '../HelpPopover/HelpPopover';
import DisabledControl from '../DisabledControl/DisabledControl';
import ReuseValuesPicker from '../ReuseValuesPicker/ReuseValuesPicker';
import {
  type Attribute,
  ATTRIBUTES,
  DISABLED_REASONS,
  HELP_COPY,
  isMirroring,
  isReadOnlyValues,
} from '../../data';
import styles from './DefinitionSection.module.scss';

export interface DefinitionSectionProps {
  attribute: Attribute;
  /** All attributes (for sibling lookup + reuse picker). */
  allAttributes?: Attribute[];
  onManageOrderClamp: () => void;
  onOpenLinkedAttribute?: (id: string) => void;
  /** Link this attribute's schema to a sibling (reuse values from…). */
  onReuse?: (siblingId: string) => void;
  /** Detach the shared-values link (with confirm copy). */
  onUnlink?: () => void;
  /**
   * Finding 5: open the policy-impact dry-run gate before unlinking a shared
   * schema. When provided, the Unlink trigger routes through this gate instead
   * of the lightweight inline confirm.
   */
  onRequestUnlink?: () => void;
}

function findSibling(
  id: string | undefined,
  pool: Attribute[],
): Attribute | undefined {
  if (!id) return undefined;
  return pool.find((a) => a.id === id);
}

export default function DefinitionSection({
  attribute,
  allAttributes = ATTRIBUTES,
  onManageOrderClamp,
  onOpenLinkedAttribute,
  onReuse,
  onUnlink,
  onRequestUnlink,
}: DefinitionSectionProps) {
  const isRanked = attribute.type === 'Ranked';
  const takesValues =
    attribute.type === 'Ranked' ||
    attribute.type === 'Select' ||
    attribute.type === 'Multiselect' ||
    attribute.type === 'Hierarchical';
  const mirrors = isMirroring(attribute);
  const externalValues = isReadOnlyValues(attribute);
  // Reuse ("Reuse values from…") is offered ONLY when this attribute's values
  // are locally managed AND not already linked. It is hidden when the values
  // come from an external source (externallyOwned) OR when this attribute
  // already mirrors a sibling (sharesValuesLink.direction === 'mirrors').
  const canReuse = !mirrors && !externalValues;
  const sibling = findSibling(attribute.sharedValuesLink?.siblingId, allAttributes);
  const locked = attribute.inUseByPolicies > 0;

  const [pickerOpen, setPickerOpen] = useState(false);
  const [unlinkOpen, setUnlinkOpen] = useState(false);
  const unlinkRef = useRef<HTMLDivElement>(null);
  useOutsideClose(unlinkRef, unlinkOpen, () => setUnlinkOpen(false));

  // ─── Restricted / externally-owned values (Program) ──────────────────────────
  const restricted = attribute.restrictedValues;
  const held = restricted
    ? attribute.values.filter((v) =>
        (attribute.adminHeldValueIds ?? []).includes(v.id),
      )
    : attribute.values;

  return (
    <Section
      title="Definition"
      description="Name, type, and the value options this attribute uses."
    >
      <dl className={styles['def']}>
        <div className={styles['def__row']}>
          <dt className={styles['def__label']}>Name</dt>
          <dd className={styles['def__value']}>{attribute.name}</dd>
        </div>

        <div className={styles['def__row']}>
          <dt className={styles['def__label']}>Type</dt>
          <dd className={styles['def__value']}>
            <span className={styles['def__type-line']}>
              <span className={styles['def__type-pill']}>{attribute.type}</span>
              {(attribute.type === 'Ranked' ||
                attribute.type === 'Hierarchical') && (
                <HelpPopover
                  triggerLabel="How ranking works"
                  title="Ranked values"
                  body={HELP_COPY.rankedType}
                />
              )}
            </span>
          </dd>
        </div>

        <div className={styles['def__row']}>
          <dt className={styles['def__label']}>Values</dt>
          <dd className={styles['def__value']}>
            {/* Text/Date are free-entry: no fixed option set, no order editor. */}
            {!takesValues ? (
              <p className={styles['def__freeform']}>
                {attribute.type === 'Date'
                  ? 'Free date entry. This attribute has no fixed list of values.'
                  : 'Free text entry. This attribute has no fixed list of values.'}
              </p>
            ) : (
              <div className={styles['def__values']}>
                {held.map((v) => (
                  <span key={v.id} className={styles['def__chip']}>
                    {isRanked && (
                      <span className={styles['def__chip-rank']} aria-hidden>
                        {(v.rank ?? 0) + 1}
                      </span>
                    )}
                    <span>{v.label}</span>
                  </span>
                ))}
              </div>
            )}

            {/* Restricted external values — no count leak (§3) */}
            {restricted && (
              <p className={styles['def__masked']}>
                Other values are managed by {sourceSystem(attribute)} and
                restricted. You see only values assigned to you.
              </p>
            )}

            {/* Manage values & order (§4) — disabled when externally owned */}
            {takesValues ? (
              <div className={styles['def__values-toolbar']}>
                {attribute.externallyOwned ? (
                  <DisabledControl
                    reason={DISABLED_REASONS.externalValues(
                      sourceSystem(attribute),
                    )}
                  >
                    <span className={styles['def__disabled-btn']}>
                      <Icon glyph={<SortAscendingIcon />} size="16" />
                      Manage values &amp; order
                    </span>
                  </DisabledControl>
                ) : mirrors && sibling ? (
                  <DisabledControl
                    reason={DISABLED_REASONS.manageLinked(sibling.name)}
                  >
                    <span className={styles['def__disabled-btn']}>
                      <Icon glyph={<SortAscendingIcon />} size="16" />
                      Manage values &amp; order
                    </span>
                  </DisabledControl>
                ) : (
                  <Button
                    emphasis="Tertiary"
                    size="Small"
                    leadingIcon={<Icon glyph={<SortAscendingIcon />} size="16" />}
                    onClick={onManageOrderClamp}
                  >
                    Manage values &amp; order
                  </Button>
                )}
              </div>
            ) : null}

            {/* Linked (mirroring) read-only state (§5 step 2) */}
            {mirrors && sibling && (
              <div className={styles['def__linked']}>
                <span className={styles['def__linked-icon']} aria-hidden>
                  <LinkVariantIcon size={14} />
                </span>
                <span className={styles['def__linked-text']}>
                  Linked to <strong>{sibling.name}</strong>. Values and order
                  are shared{locked ? ' and locked while in use by policies' : ''}.{' '}
                  <button
                    type="button"
                    className={styles['def__linked-link']}
                    onClick={() => onOpenLinkedAttribute?.(sibling.id)}
                  >
                    Open {sibling.name} ↗
                  </button>
                </span>
                {(onUnlink || onRequestUnlink) && (
                  <div className={styles['def__unlink']} ref={unlinkRef}>
                    <button
                      type="button"
                      className={styles['def__unlink-trigger']}
                      onClick={() => {
                        // Finding 5: route through the policy-impact dry-run gate
                        // when available; fall back to the inline confirm.
                        if (onRequestUnlink) {
                          onRequestUnlink();
                        } else {
                          setUnlinkOpen((o) => !o);
                        }
                      }}
                    >
                      <LinkVariantOffIcon size={14} />
                      Unlink
                    </button>
                    {!onRequestUnlink && unlinkOpen && (
                      <div className={styles['def__confirm']}>
                        <p className={styles['def__confirm-body']}>
                          Unlink keeps a copy of the current values on this
                          attribute. They will no longer stay in sync with{' '}
                          {sibling.name}.
                        </p>
                        <div className={styles['def__confirm-actions']}>
                          <Button
                            emphasis="Tertiary"
                            size="Small"
                            onClick={() => setUnlinkOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button
                            emphasis="Primary"
                            size="Small"
                            onClick={() => {
                              setUnlinkOpen(false);
                              onUnlink?.();
                            }}
                          >
                            Unlink
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Reuse values from… (§5 step 1) — only for editable, unlinked,
                non-external attributes. Hidden for mirroring attributes
                (Classification) and externally-owned sources (Clearance,
                Program, Department, Rank, Cost center, COI). */}
            {canReuse && onReuse && (
              <div className={styles['def__reuse']}>
                <button
                  type="button"
                  className={styles['def__reuse-trigger']}
                  aria-expanded={pickerOpen}
                  onClick={() => setPickerOpen(true)}
                >
                  Reuse values from…
                  <ChevronDownIcon size={14} />
                </button>
                <span className={styles['def__reuse-hint']}>
                  Mirror another attribute’s values instead of maintaining a
                  separate set.
                </span>
              </div>
            )}

            {/* Owner note when this attribute is mirrored by others (§5 step 3).
                This is the source/owner side of a shared scheme — it is NOT a
                reuse picker and NOT a mirror banner. */}
            {attribute.sharedWith && attribute.sharedWith.length > 0 && !locked && (
              <p className={styles['def__shared-note']}>
                Shared with {attribute.sharedWith.length} other attribute
                {attribute.sharedWith.length === 1 ? '' : 's'} (
                {attribute.sharedWith.join(', ')}).{' '}
                {externalValues
                  ? `These values come from ${sourceSystem(attribute)}; the linked attribute inherits the same scale.`
                  : 'Editing the order here updates them too.'}
              </p>
            )}

            {/* Finding 5: owner side is BOTH shared AND order-locked while
                policy-bound — the lock propagates across the link. */}
            {attribute.sharedWith && attribute.sharedWith.length > 0 && locked && (
              <p className={styles['def__shared-locked']}>
                <span className={styles['def__shared-locked-icon']} aria-hidden>
                  <LinkVariantIcon size={14} />
                </span>
                <span>
                  Shared with {attribute.sharedWith.join(', ')}.{' '}
                  {externalValues
                    ? `The scale is owned by ${sourceSystem(attribute)} and inherited by ${attribute.sharedWith.join(', ')}. `
                    : ''}
                  The order is locked while {attribute.inUseByPolicies} active{' '}
                  {attribute.inUseByPolicies === 1 ? 'policy' : 'policies'} use
                  it. The lock propagates across the link — the linked
                  attribute is shared and locked too.
                </span>
              </p>
            )}
          </dd>
        </div>
      </dl>

      <ReuseValuesPicker
        open={pickerOpen}
        currentId={attribute.id}
        attributes={allAttributes}
        onClose={() => setPickerOpen(false)}
        onPick={(id) => {
          setPickerOpen(false);
          onReuse?.(id);
        }}
      />
    </Section>
  );
}

function sourceSystem(a: Attribute): string {
  return a.source.kind === 'synced' ? a.source.system : 'the source';
}
