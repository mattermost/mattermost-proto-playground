import { useRef, useState } from 'react';
import LockOutlineIcon from '@mattermost/compass-icons/components/lock-outline';
import DotsHorizontalIcon from '@mattermost/compass-icons/components/dots-horizontal';
import PencilOutlineIcon from '@mattermost/compass-icons/components/pencil-outline';
import PowerPlugOutlineIcon from '@mattermost/compass-icons/components/power-plug-outline';
import TrashCanOutlineIcon from '@mattermost/compass-icons/components/trash-can-outline';
import ViewGridPlusOutlineIcon from '@mattermost/compass-icons/components/view-grid-plus-outline';
import Icon from '@/components/ui/Icon/Icon';
import IconButton from '@/components/ui/IconButton/IconButton';
import Chip from '@/components/ui/Chip/Chip';
import EmptyState from '@/components/ui/EmptyState/EmptyState';
import PopoverMenu, {
  PopoverMenuDivider,
} from '@/components/ui/PopoverMenu/PopoverMenu';
import MenuItem from '@/components/ui/MenuItem/MenuItem';
import { useOutsideClose } from '@/hooks/useOutsideClose';
import InfoHint from '../InfoHint/InfoHint';
import SyncPill from '../SyncPill/SyncPill';
import {
  isPolicyLocked,
  isSourceOwned,
  policyLabel,
  valueCountLabel,
  type HubAttribute,
} from '../../hubData';
import styles from './CatalogTable.module.scss';

export interface CatalogTableProps {
  attributes: HubAttribute[];
  onOpenDetail: (id: string) => void;
  onBulk: (id: string) => void;
  onDeactivate: (id: string) => void;
  onDelete: (id: string) => void;
  onNewAttribute: () => void;
  /** Empty because filters exclude everything (vs. no attributes at all). */
  filteredEmpty: boolean;
}

export default function CatalogTable({
  attributes,
  onOpenDetail,
  onBulk,
  onDeactivate,
  onDelete,
  onNewAttribute,
  filteredEmpty,
}: CatalogTableProps) {
  const [menuId, setMenuId] = useState<string | null>(null);
  const menuWrapRef = useRef<HTMLDivElement>(null);
  useOutsideClose(menuWrapRef, menuId !== null, () => setMenuId(null));

  if (attributes.length === 0) {
    return (
      <div className={styles['catalog__empty']}>
        <EmptyState
          title={filteredEmpty ? 'No attributes match these filters' : 'No attributes yet'}
          description={
            filteredEmpty
              ? 'Adjust the resource type, source, or search to see more.'
              : 'Define your first attribute to make it available across users, channels, and posts.'
          }
          action={
            filteredEmpty
              ? undefined
              : { children: 'New attribute', onClick: onNewAttribute }
          }
        />
      </div>
    );
  }

  return (
    <div className={styles['catalog']}>
      <table className={styles['catalog__grid']}>
        <thead>
          <tr>
            <th>Attribute</th>
            <th className={styles['catalog__col-type']}>Type</th>
            <th>Applies to</th>
            <th>Source</th>
            <th className={styles['catalog__col-count']}>Values</th>
            <th>Usage</th>
            <th className={styles['catalog__col-actions']} aria-label="Actions" />
          </tr>
        </thead>
        <tbody>
          {attributes.map((a) => {
            const synced = isSourceOwned(a);
            const locked = isPolicyLocked(a);
            return (
              <tr
                key={a.id}
                className={styles['catalog__row']}
                onClick={() => onOpenDetail(a.id)}
              >
                <td>
                  <div className={styles['catalog__name-cell']}>
                    <div className={styles['catalog__name-block']}>
                      <span className={styles['catalog__name']}>{a.name}</span>
                      {a.valuesLink && (
                        <span className={styles['catalog__sub']}>
                          Linked to {a.valuesLink.attributeName}
                        </span>
                      )}
                    </div>
                  </div>
                </td>
                <td>
                  <span className={styles['catalog__type']}>{a.type}</span>
                </td>
                <td>
                  <div className={styles['catalog__chips']}>
                    {a.appliesTo
                      .filter((c) => c.resource !== 'Teams')
                      .map((c) => (
                      <Chip key={c.resource} size="Small">
                        {c.resource}
                      </Chip>
                    ))}
                  </div>
                </td>
                <td>
                  {synced && a.source.state ? (
                    <SyncPill state={a.source.state} system={a.source.system} />
                  ) : (
                    <span className={styles['catalog__muted']}>Managed here</span>
                  )}
                </td>
                <td className={styles['catalog__col-count']}>
                  <span className={styles['catalog__count']}>
                    {valueCountLabel(a)}
                  </span>
                </td>
                <td>
                  {a.usedByPolicies > 0 ? (
                    <span className={styles['catalog__usage']}>
                      {policyLabel(a.usedByPolicies)}
                    </span>
                  ) : (
                    <span className={styles['catalog__muted']}>Not in use</span>
                  )}
                </td>
                <td
                  className={styles['catalog__actions']}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className={styles['catalog__actions-row']}>
                    {locked && (
                      <InfoHint
                        label={`Locked — ${policyLabel(a.usedByPolicies).toLowerCase()}`}
                        arrow="Right"
                      >
                        <span className={styles['catalog__lock']}>
                          <Icon size="12" glyph={<LockOutlineIcon />} />
                        </span>
                      </InfoHint>
                    )}
                    <div
                      className={styles['catalog__menu-wrap']}
                      ref={menuId === a.id ? menuWrapRef : undefined}
                    >
                      <IconButton
                        size="Small"
                        aria-label={`More actions for ${a.name}`}
                        aria-haspopup="menu"
                        aria-expanded={menuId === a.id}
                        icon={<Icon size="16" glyph={<DotsHorizontalIcon />} />}
                        onClick={() =>
                          setMenuId((c) => (c === a.id ? null : a.id))
                        }
                      />
                      {menuId === a.id && (
                        <div className={styles['catalog__menu']}>
                          <PopoverMenu aria-label={`${a.name} actions`}>
                            <MenuItem
                              label="Edit attribute"
                              leadingVisual={
                                <Icon size="16" glyph={<PencilOutlineIcon />} />
                              }
                              onClick={() => {
                                setMenuId(null);
                                onOpenDetail(a.id);
                              }}
                            />
                            <MenuItem
                              label="Bulk operations…"
                              leadingVisual={
                                <Icon
                                  size="16"
                                  glyph={<ViewGridPlusOutlineIcon />}
                                />
                              }
                              onClick={() => {
                                setMenuId(null);
                                onBulk(a.id);
                              }}
                            />
                            <PopoverMenuDivider />
                            <MenuItem
                              label="Deactivate attribute"
                              destructive
                              leadingVisual={
                                <Icon size="16" glyph={<PowerPlugOutlineIcon />} />
                              }
                              onClick={() => {
                                setMenuId(null);
                                onDeactivate(a.id);
                              }}
                            />
                            <MenuItem
                              label="Delete attribute"
                              destructive
                              leadingVisual={
                                <Icon size="16" glyph={<TrashCanOutlineIcon />} />
                              }
                              onClick={() => {
                                setMenuId(null);
                                onDelete(a.id);
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
          })}
        </tbody>
      </table>
    </div>
  );
}
