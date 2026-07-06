import { useRef, useState } from 'react';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import ChevronDownIcon from '@mattermost/compass-icons/components/chevron-down';
import DragVerticalIcon from '@mattermost/compass-icons/components/drag-vertical';
import DotsHorizontalIcon from '@mattermost/compass-icons/components/dots-horizontal';
import LockOutlineIcon from '@mattermost/compass-icons/components/lock-outline';
import SyncIcon from '@mattermost/compass-icons/components/sync';
import PencilOutlineIcon from '@mattermost/compass-icons/components/pencil-outline';
import EyeOutlineIcon from '@mattermost/compass-icons/components/eye-outline';
import LinkVariantIcon from '@mattermost/compass-icons/components/link-variant';
import ContentCopyIcon from '@mattermost/compass-icons/components/content-copy';
import TrashCanOutlineIcon from '@mattermost/compass-icons/components/trash-can-outline';
import CogOutlineIcon from '@mattermost/compass-icons/components/cog-outline';
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
import InfoHint from '../../../AttributeManagementV2/_components/InfoHint/InfoHint';
import {
  relativeAgo,
  ATTRIBUTES,
  type Attribute,
} from '../../../AttributeManagementV2/data';
import {
  isCrossCutting,
} from '../../../AttributeManagementVariationB/bData';
import type { ResourceFilterKey } from '../CatalogFilterBar/CatalogFilterBar';
import styles from './AttributeCatalogTable.module.scss';

export interface AttributeCatalogTableProps {
  attributes: Attribute[];
  /** Full catalog for sibling name resolution. */
  allAttributes?: Attribute[];
  resourceFilter: ResourceFilterKey;
  onOpenDetail: (id: string) => void;
  onOpenLinked?: (siblingId: string) => void;
  onInUseClick?: (id: string) => void;
  onNewAttribute?: () => void;
  onDeactivateAttempt?: (id: string) => void;
}

function panelCopy(filter: ResourceFilterKey): {
  title: string;
  subtitle: string;
} {
  switch (filter) {
    case 'Users':
      return {
        title: 'Configure user attributes',
        subtitle: 'Customize the attributes shown in user profiles.',
      };
    case 'Channels':
      return {
        title: 'Configure channel attributes',
        subtitle: 'Attributes applied when creating or editing channels.',
      };
    case 'Posts':
      return {
        title: 'Configure post attributes',
        subtitle: 'Attributes applied when composing or editing posts.',
      };
    case 'Teams':
      return {
        title: 'Configure team attributes',
        subtitle: 'Attributes applied to team workspaces.',
      };
    default:
      return {
        title: 'Configure attributes',
        subtitle:
          'Define an attribute once and apply it across users, channels, posts, and teams.',
      };
  }
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

function visibleValues(attr: Attribute) {
  if (!attr.restrictedValues) return attr.values;
  return attr.values.filter((v) =>
    (attr.adminHeldValueIds ?? []).includes(v.id),
  );
}

function ValuesCell({ attr }: { attr: Attribute }) {
  const synced = attr.source.kind === 'synced' ? attr.source : null;
  const sync = synced ? relativeSync(synced) : null;
  const takesValues =
    attr.type === 'Ranked' ||
    attr.type === 'Select' ||
    attr.type === 'Multiselect' ||
    attr.type === 'Hierarchical';

  if (!takesValues) {
    return (
      <span className={styles['table__values-empty']}>
        {attr.type === 'Text' ? 'Free text' : '—'}
      </span>
    );
  }

  if (sync) {
    return (
      <span
        className={`${styles['table__provenance']} ${sync.stale ? styles['table__provenance--stale'] : ''}`}
      >
        {sync.stale ? (
          <SourceHealthBadge state={sync.state} />
        ) : (
          <span
            className={styles['table__provenance-icon']}
            title="Synced — last sync succeeded within the configured window."
          >
            <Icon size="12" glyph={<SyncIcon />} />
          </span>
        )}
        <span>Managed by {sync.system}</span>
        <span className={styles['table__provenance-meta']}>
          · Last synced {relativeAgo(sync.lastSuccessISO)} ago
        </span>
      </span>
    );
  }

  const held = visibleValues(attr);
  return (
    <div className={styles['table__values']}>
      <div className={styles['table__chips']}>
        {held.map((v) =>
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
      {attr.restrictedValues && (
        <p className={styles['table__masked']}>
          Other values are managed by the source and restricted. You see only
          values assigned to you.
        </p>
      )}
    </div>
  );
}

/**
 * Property · Type · Values · Actions table — faithful to the shipped User
 * Attributes console screen, generalized for the unified catalog. Built-in
 * profile fields appear only when filtered to Users.
 */
export default function AttributeCatalogTable({
  attributes,
  allAttributes = ATTRIBUTES,
  resourceFilter,
  onOpenDetail,
  onOpenLinked,
  onInUseClick,
  onNewAttribute,
  onDeactivateAttempt,
}: AttributeCatalogTableProps) {
  const [menuId, setMenuId] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const addWrapRef = useRef<HTMLDivElement>(null);
  const menuWrapRef = useRef<HTMLDivElement>(null);

  useOutsideClose(addWrapRef, addOpen, () => setAddOpen(false));
  useOutsideClose(menuWrapRef, menuId !== null, () => setMenuId(null));

  const { title, subtitle } = panelCopy(resourceFilter);

  return (
    <div className={styles['table']}>
      <div className={styles['table__panel']}>
        <div className={styles['table__panel-head']}>
          <h2 className={styles['table__panel-title']}>{title}</h2>
          <p className={styles['table__panel-subtitle']}>{subtitle}</p>
        </div>

        <div className={styles['table__table-wrap']}>
          <table className={styles['table__grid']}>
            <thead>
              <tr>
                <th className={styles['table__col-handle']} aria-label="Reorder" />
                <th>Property</th>
                <th className={styles['table__col-applies']}>Applies to</th>
                <th className={styles['table__col-type']}>Type</th>
                <th>Values</th>
                <th className={styles['table__col-actions']}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {attributes.length === 0 ? (
                <tr>
                  <td aria-hidden />
                  <td colSpan={5}>
                    <p className={styles['table__empty']}>
                      No attributes match the current filters.
                    </p>
                  </td>
                </tr>
              ) : (
                attributes.map((attr) => {
                  const synced =
                    attr.source.kind === 'synced' ? attr.source : null;
                  const cross = isCrossCutting(attr);
                  const linkedSiblingId = attr.sharedValuesLink?.siblingId;
                  const linkedName = linkedSiblingId
                    ? allAttributes.find((a) => a.id === linkedSiblingId)?.name
                    : null;
                  const policyLocked = attr.inUseByPolicies > 0;
                  const sourceLocked = attr.externallyOwned;
                  const appliesResources = attr.appliesTo.map((b) => b.resource);
                  const appliesToUsers = appliesResources.includes('Users');

                  return (
                    <tr
                      key={attr.id}
                      className={styles['table__row--clickable']}
                      onClick={() => onOpenDetail(attr.id)}
                    >
                      <td
                        className={styles['table__handle']}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span
                          className={styles['table__drag']}
                          aria-label={`Reorder ${attr.name}`}
                        >
                          <Icon size="16" glyph={<DragVerticalIcon />} />
                        </span>
                      </td>
                      <td>
                        <div className={styles['table__property-cell']}>
                          <div className={styles['table__property-row']}>
                            <span className={styles['table__property']}>
                              {attr.name}
                            </span>
                            {cross && (
                              <span
                                className={styles['table__shared']}
                                title="Also bound to other resources"
                              >
                                shared
                              </span>
                            )}
                            {linkedName && linkedSiblingId && (
                              <InfoHint
                                label={`Shares values with ${linkedName}`}
                                hint="Values and order stay in sync across both attributes. Click to open."
                                arrow="Top"
                              >
                                <button
                                  type="button"
                                  className={styles['table__meta-link']}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onOpenLinked?.(linkedSiblingId);
                                  }}
                                >
                                  <Icon size="16" glyph={<LinkVariantIcon />} />
                                  <span className={styles['table__meta-link-sr']}>
                                    Shares values with {linkedName}
                                  </span>
                                </button>
                              </InfoHint>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className={styles['table__applies']}>
                          {appliesResources.map((r) => (
                            <span
                              key={r}
                              className={styles['table__applies-chip']}
                            >
                              {r}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td>
                        <span className={styles['table__type']}>{attr.type}</span>
                      </td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <ValuesCell attr={attr} />
                      </td>
                      <td
                        className={styles['table__actions']}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className={styles['table__actions-group']}>
                          {(policyLocked || sourceLocked) && (
                            <button
                              type="button"
                              className={styles['table__lock']}
                              title={
                                policyLocked
                                  ? `Locked for policy use — in use by ${attr.inUseByPolicies} active ${attr.inUseByPolicies === 1 ? 'policy' : 'policies'}.`
                                  : `Source-owned — values are managed by ${synced?.system ?? 'a source'} and read-only here.`
                              }
                              aria-label={
                                policyLocked
                                  ? 'Locked for policy use'
                                  : 'Source-owned, read-only'
                              }
                              onClick={() =>
                                policyLocked
                                  ? onInUseClick?.(attr.id)
                                  : onOpenDetail(attr.id)
                              }
                            >
                              <Icon size="16" glyph={<LockOutlineIcon />} />
                            </button>
                          )}
                          <div
                            className={styles['table__menu-wrap']}
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
                              <div className={styles['table__menu']}>
                                <PopoverMenu
                                  aria-label={`${attr.name} actions`}
                                >
                                  <MenuItem
                                    label="Open definition"
                                    secondaryLabel="Full configuration and applies-to"
                                    secondaryLabelPosition="Below"
                                    leadingVisual={
                                      <Icon
                                        size="16"
                                        glyph={<CogOutlineIcon />}
                                      />
                                    }
                                    onClick={() => {
                                      setMenuId(null);
                                      onOpenDetail(attr.id);
                                    }}
                                  />
                                  {appliesToUsers && (
                                    <MenuItem
                                      label="Editable by users"
                                      secondaryLabel={
                                        policyLocked
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
                                            policyLocked || sourceLocked ? (
                                              <LockOutlineIcon />
                                            ) : (
                                              <PencilOutlineIcon />
                                            )
                                          }
                                        />
                                      }
                                      disabled={
                                        sourceLocked || policyLocked
                                      }
                                      onClick={() => setMenuId(null)}
                                    />
                                  )}
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
                                  {linkedSiblingId && (
                                    <MenuItem
                                      label="Open linked attribute"
                                      leadingVisual={
                                        <Icon
                                          size="16"
                                          glyph={<LinkVariantIcon />}
                                        />
                                      }
                                      onClick={() => {
                                        setMenuId(null);
                                        onOpenLinked?.(linkedSiblingId);
                                      }}
                                    />
                                  )}
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
                                    label="Delete attribute"
                                    destructive
                                    disabled={policyLocked}
                                    leadingVisual={
                                      <Icon
                                        size="16"
                                        glyph={<TrashCanOutlineIcon />}
                                      />
                                    }
                                    onClick={() => {
                                      setMenuId(null);
                                      if (policyLocked) {
                                        onDeactivateAttempt?.(attr.id);
                                      }
                                    }}
                                  />
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
        </div>
      </div>

      <div className={styles['table__add-wrap']} ref={addWrapRef}>
        <button
          type="button"
          className={styles['table__add']}
          aria-haspopup="menu"
          aria-expanded={addOpen}
          onClick={() => setAddOpen((c) => !c)}
        >
          <Icon size="16" glyph={<PlusIcon />} />
          Add attribute
          <Icon size="12" glyph={<ChevronDownIcon />} />
        </button>
        {addOpen && (
          <div className={styles['table__add-menu']}>
            <PopoverMenu aria-label="Add attribute options">
              <MenuItem
                label="Reuse an existing attribute"
                secondaryLabel="Mirror values from another attribute"
                secondaryLabelPosition="Below"
                leadingVisual={
                  <Icon size="16" glyph={<LinkVariantIcon />} />
                }
                onClick={() => {
                  setAddOpen(false);
                  onNewAttribute?.();
                }}
              />
              <MenuItem
                label="Create new attribute"
                secondaryLabel="Define a new attribute"
                secondaryLabelPosition="Below"
                leadingVisual={<Icon size="16" glyph={<PlusIcon />} />}
                onClick={() => {
                  setAddOpen(false);
                  onNewAttribute?.();
                }}
              />
            </PopoverMenu>
          </div>
        )}
      </div>

      <div className={styles['table__footer']}>
        <Button emphasis="Tertiary">Cancel</Button>
        <Button emphasis="Primary">Save</Button>
      </div>
    </div>
  );
}
