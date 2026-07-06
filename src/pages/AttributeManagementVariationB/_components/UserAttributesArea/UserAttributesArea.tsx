import { useRef, useState } from 'react';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import ChevronDownIcon from '@mattermost/compass-icons/components/chevron-down';
import DragVerticalIcon from '@mattermost/compass-icons/components/drag-vertical';
import DotsHorizontalIcon from '@mattermost/compass-icons/components/dots-horizontal';
import LockOutlineIcon from '@mattermost/compass-icons/components/lock-outline';
import SyncIcon from '@mattermost/compass-icons/components/sync';
import OpenInNewIcon from '@mattermost/compass-icons/components/open-in-new';
import PencilOutlineIcon from '@mattermost/compass-icons/components/pencil-outline';
import EyeOutlineIcon from '@mattermost/compass-icons/components/eye-outline';
import LinkVariantIcon from '@mattermost/compass-icons/components/link-variant';
import ContentCopyIcon from '@mattermost/compass-icons/components/content-copy';
import TrashCanOutlineIcon from '@mattermost/compass-icons/components/trash-can-outline';
import Icon from '@/components/ui/Icon/Icon';
import Button from '@/components/ui/Button/Button';
import IconButton from '@/components/ui/IconButton/IconButton';
import PopoverMenu, {
  PopoverMenuDivider,
} from '@/components/ui/PopoverMenu/PopoverMenu';
import MenuItem from '@/components/ui/MenuItem/MenuItem';
import Chip from '@/components/ui/Chip/Chip';
import RankedValueChip from '@/components/ui/RankedValueChip/RankedValueChip';
import { useOutsideClose } from '@/hooks/useOutsideClose';
import SourceHealthBadge from '../../../AttributeManagementV2/_components/SourceHealthBadge/SourceHealthBadge';
import { relativeAgo } from '../../../AttributeManagementV2/data';
import {
  BUILT_IN_PROFILE_FIELDS,
  isCrossCutting,
  siblingName,
  type Attribute,
} from '../../bData';
import styles from './UserAttributesArea.module.scss';

export interface UserAttributesAreaProps {
  /** Users-bound attributes (custom rows below the built-ins). */
  attributes: Attribute[];
  /** Force-render a specific state for review screenshots. */
  forceState?: 'default' | 'loading' | 'empty';
  /** Open the matching attribute's detail in the Attributes area (cross-area link). */
  onOpenInAttributesArea?: (id: string) => void;
  /** Open this attribute's own detail (for shared definition / edit). */
  onOpenDetail?: (id: string) => void;
}

function relativeSync(synced: Extract<Attribute['source'], { kind: 'synced' }>) {
  const stale = synced.state !== 'Synced';
  return {
    stale,
    state: synced.state,
    system: synced.system,
    lastSuccessISO: synced.lastSuccessISO,
  };
}

/**
 * User Attributes area — faithful to the shipped System-Console screen, but
 * rendered INSIDE the Agents shell (no SC sidebar) and MINUS Promote-to-Global.
 *
 * Property · Type · Values · Actions table:
 *   - Built-in profile fields read-only/locked on top (no drag handle, no menu).
 *   - Custom rows below with drag handles, sync provenance, value chips,
 *     lock + ⋯ row menu, and "+ Add attribute".
 *   - Cross-cutting attributes carry a `shared` marker + "Also applies to … ↗"
 *     link to their binding in the Attributes area.
 *   - Save / Cancel footer.
 */
export default function UserAttributesArea({
  attributes,
  forceState = 'default',
  onOpenInAttributesArea,
  onOpenDetail,
}: UserAttributesAreaProps) {
  const [menuId, setMenuId] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const addWrapRef = useRef<HTMLDivElement>(null);
  const menuWrapRef = useRef<HTMLDivElement>(null);

  useOutsideClose(addWrapRef, addOpen, () => setAddOpen(false));
  useOutsideClose(menuWrapRef, menuId !== null, () => setMenuId(null));

  const isLoading = forceState === 'loading';
  const isEmpty = forceState === 'empty' || attributes.length === 0;

  return (
    <div className={styles['ua']}>
      <div className={styles['ua__panel']}>
        <div className={styles['ua__panel-head']}>
          <h2 className={styles['ua__panel-title']}>Configure user attributes</h2>
          <p className={styles['ua__panel-subtitle']}>
            Customize the attributes shown in user profiles.
          </p>
        </div>

        <div className={styles['ua__table-wrap']}>
          <table className={styles['ua__table']}>
            <thead>
              <tr>
                <th className={styles['ua__col-handle']} aria-label="Reorder" />
                <th className={styles['ua__col-property']}>Property</th>
                <th className={styles['ua__col-type']}>Type</th>
                <th className={styles['ua__col-values']}>Values</th>
                <th className={styles['ua__col-actions']}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {/* Built-in profile fields — read-only, locked, on top. */}
              {BUILT_IN_PROFILE_FIELDS.map((field) => (
                <tr key={field.id} className={styles['ua__row--builtin']}>
                  <td className={styles['ua__handle']} aria-hidden />
                  <td>
                    <span className={styles['ua__property']}>{field.name}</span>
                  </td>
                  <td>
                    <span className={styles['ua__type']}>{field.type}</span>
                  </td>
                  <td>
                    <span className={styles['ua__values-empty']}>—</span>
                  </td>
                  <td className={styles['ua__actions']}>
                    <span
                      className={styles['ua__lock']}
                      title="Built-in field. Read-only."
                      aria-label="Built-in field, read-only"
                    >
                      <Icon size="16" glyph={<LockOutlineIcon />} />
                    </span>
                  </td>
                </tr>
              ))}

              {/* Custom / managed user attributes. */}
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={`sk-${i}`} className={styles['ua__row--skeleton']}>
                    <td className={styles['ua__handle']} aria-hidden />
                    <td>
                      <span className={styles['ua__sk']} style={{ width: 96 }} />
                    </td>
                    <td>
                      <span className={styles['ua__sk']} style={{ width: 56 }} />
                    </td>
                    <td>
                      <span className={styles['ua__sk']} style={{ width: 180 }} />
                    </td>
                    <td className={styles['ua__actions']}>
                      <span className={styles['ua__sk']} style={{ width: 24 }} />
                    </td>
                  </tr>
                ))
              ) : isEmpty ? (
                <tr>
                  <td aria-hidden />
                  <td colSpan={4}>
                    <p className={styles['ua__empty']}>
                      No custom user attributes yet. Use “Add attribute” to reuse
                      an existing attribute or create one scoped to users.
                    </p>
                  </td>
                </tr>
              ) : (
                attributes.map((attr) => {
                  const synced =
                    attr.source.kind === 'synced' ? attr.source : null;
                  const sync = synced ? relativeSync(synced) : null;
                  const cross = isCrossCutting(attr);
                  const sibName = siblingName(attr);
                  const locked = synced != null; // externally owned = locked rows
                  return (
                    <tr key={attr.id}>
                      <td className={styles['ua__handle']}>
                        <span
                          className={styles['ua__drag']}
                          aria-label={`Reorder ${attr.name}`}
                        >
                          <Icon size="16" glyph={<DragVerticalIcon />} />
                        </span>
                      </td>
                      <td>
                        <span className={styles['ua__property-cell']}>
                          <span className={styles['ua__property']}>
                            {attr.name}
                          </span>
                          {cross && (
                            <span
                              className={styles['ua__shared']}
                              title="Shared. Also bound to a resource."
                            >
                              shared
                            </span>
                          )}
                          {cross && (
                            <button
                              type="button"
                              className={styles['ua__cross-link']}
                              onClick={() => onOpenInAttributesArea?.(attr.id)}
                            >
                              Also applies to{' '}
                              {attr.appliesTo
                                .filter((b) => b.resource !== 'Users')
                                .map((b) => b.resource)
                                .join(' · ')}
                              <Icon
                                size="12"
                                glyph={<OpenInNewIcon />}
                              />
                            </button>
                          )}
                          {sibName && !cross && (
                            <span
                              className={styles['ua__linked']}
                              title={`Shares values with ${sibName}`}
                            >
                              <Icon
                                size="12"
                                glyph={<LinkVariantIcon />}
                              />
                              Shares values with {sibName}
                            </span>
                          )}
                        </span>
                      </td>
                      <td>
                        <span className={styles['ua__type']}>{attr.type}</span>
                      </td>
                      <td>
                        <div className={styles['ua__values']}>
                          {sync ? (
                            <span
                              className={`${styles['ua__provenance']} ${sync.stale ? styles['ua__provenance--stale'] : ''}`}
                            >
                              {/* Finding 3: a LABELED health pill for non-healthy
                                  states (not a bare unlabeled icon). Synced stays
                                  quiet with just the sync glyph. */}
                              {sync.stale ? (
                                <SourceHealthBadge state={sync.state} />
                              ) : (
                                <span
                                  className={styles['ua__provenance-icon']}
                                  title="Synced — last sync succeeded within the configured window."
                                >
                                  <Icon size="12" glyph={<SyncIcon />} />
                                </span>
                              )}
                              <span>Managed by {sync.system}</span>
                              <span className={styles['ua__provenance-meta']}>
                                · Last synced {relativeAgo(sync.lastSuccessISO)}{' '}
                                ago
                              </span>
                            </span>
                          ) : (
                            <div className={styles['ua__chips']}>
                              {attr.values.map((v) =>
                                attr.type === 'Ranked' ? (
                                  <RankedValueChip
                                    key={v.id}
                                    label={v.label}
                                    rank={(v.rank ?? 0) + 1}
                                  />
                                ) : (
                                  <Chip key={v.id} size="Small" tone="neutral">
                                    {v.label}
                                  </Chip>
                                ),
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className={styles['ua__actions']}>
                        <div className={styles['ua__actions-group']}>
                          {locked && (
                            <span
                              className={styles['ua__lock']}
                              title={
                                attr.inUseByPolicies > 0
                                  ? `Locked for policy use — in use by ${attr.inUseByPolicies} active ${attr.inUseByPolicies === 1 ? 'policy' : 'policies'}. Changing it re-evaluates access.`
                                  : `Source-owned — values are managed by ${synced?.system ?? 'a source'} and read-only here.`
                              }
                              aria-label={
                                attr.inUseByPolicies > 0
                                  ? 'Locked for policy use'
                                  : 'Source-owned, read-only'
                              }
                            >
                              <Icon size="16" glyph={<LockOutlineIcon />} />
                            </span>
                          )}
                          <div
                            className={styles['ua__menu-wrap']}
                            ref={menuId === attr.id ? menuWrapRef : undefined}
                          >
                            <IconButton
                              size="X-Small"
                              aria-label={`More actions for ${attr.name}`}
                              aria-haspopup="menu"
                              aria-expanded={menuId === attr.id}
                              icon={
                                <Icon
                                  size="16"
                                  glyph={<DotsHorizontalIcon />}
                                />
                              }
                              onClick={() =>
                                setMenuId((c) =>
                                  c === attr.id ? null : attr.id,
                                )
                              }
                            />
                            {menuId === attr.id && (
                              <div className={styles['ua__menu']}>
                                <PopoverMenu aria-label={`${attr.name} actions`}>
                                  {cross && (
                                    <MenuItem
                                      label={`Open shared definition`}
                                      secondaryLabel="One definition, edited in either area"
                                      secondaryLabelPosition="Below"
                                      leadingVisual={
                                        <Icon
                                          size="16"
                                          glyph={<LinkVariantIcon />}
                                        />
                                      }
                                      onClick={() => {
                                        setMenuId(null);
                                        onOpenDetail?.(attr.id);
                                      }}
                                    />
                                  )}
                                  {/* Finding 6: self-edit flips eligibility, so
                                      it is guarded when policy-bound (same posture
                                      as locked value order), not only when
                                      source-owned. */}
                                  <MenuItem
                                    label="Editable by users"
                                    secondaryLabel={
                                      attr.inUseByPolicies > 0
                                        ? `Locked · used by ${attr.inUseByPolicies} ${attr.inUseByPolicies === 1 ? 'policy' : 'policies'}`
                                        : attr.selfEdit
                                          ? 'On'
                                          : 'Off'
                                    }
                                    secondaryLabelPosition="Inline"
                                    leadingVisual={
                                      <Icon
                                        size="16"
                                        glyph={
                                          attr.inUseByPolicies > 0 ? (
                                            <LockOutlineIcon />
                                          ) : (
                                            <PencilOutlineIcon />
                                          )
                                        }
                                      />
                                    }
                                    disabled={locked || attr.inUseByPolicies > 0}
                                    onClick={() => setMenuId(null)}
                                  />
                                  <MenuItem
                                    label="Visibility"
                                    secondaryLabel="Hide when empty"
                                    secondaryLabelPosition="Inline"
                                    leadingVisual={
                                      <Icon
                                        size="16"
                                        glyph={<EyeOutlineIcon />}
                                      />
                                    }
                                    onClick={() => setMenuId(null)}
                                  />
                                  <PopoverMenuDivider />
                                  <MenuItem
                                    label="Duplicate attribute"
                                    leadingVisual={
                                      <Icon
                                        size="16"
                                        glyph={<ContentCopyIcon />}
                                      />
                                    }
                                    onClick={() => setMenuId(null)}
                                  />
                                  <MenuItem
                                    label={
                                      attr.inUseByPolicies > 0
                                        ? 'Delete attribute'
                                        : 'Delete attribute'
                                    }
                                    destructive
                                    disabled={attr.inUseByPolicies > 0}
                                    leadingVisual={
                                      <Icon
                                        size="16"
                                        glyph={<TrashCanOutlineIcon />}
                                      />
                                    }
                                    onClick={() => setMenuId(null)}
                                  />
                                  {/* NOTE: No "Promote to Global" — absent by design in B. */}
                                </PopoverMenu>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

          {/* "+ Add attribute" footer with a small dropdown. */}
          <div className={styles['ua__add-wrap']} ref={addWrapRef}>
            <button
              type="button"
              className={styles['ua__add']}
              aria-haspopup="menu"
              aria-expanded={addOpen}
              onClick={() => setAddOpen((c) => !c)}
            >
              <Icon size="16" glyph={<PlusIcon />} />
              Add attribute
              <Icon size="12" glyph={<ChevronDownIcon />} />
            </button>
            {addOpen && (
              <div className={styles['ua__add-menu']}>
                <PopoverMenu aria-label="Add attribute options">
                  <MenuItem
                    label="Reuse an existing attribute"
                    secondaryLabel="Bind a catalog attribute to user profiles"
                    secondaryLabelPosition="Below"
                    leadingVisual={
                      <Icon size="16" glyph={<LinkVariantIcon />} />
                    }
                    onClick={() => setAddOpen(false)}
                  />
                  <MenuItem
                    label="Create new attribute"
                    secondaryLabel="Define a new attribute scoped to users"
                    secondaryLabelPosition="Below"
                    leadingVisual={<Icon size="16" glyph={<PlusIcon />} />}
                    onClick={() => setAddOpen(false)}
                  />
                </PopoverMenu>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Save / Cancel footer — matches the shipped console footer. */}
      <div className={styles['ua__footer']}>
        <Button emphasis="Tertiary">Cancel</Button>
        <Button emphasis="Primary">Save</Button>
      </div>
    </div>
  );
}
