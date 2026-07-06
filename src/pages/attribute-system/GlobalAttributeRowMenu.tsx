import { useEffect, useRef, useState } from 'react';
import PencilOutlineIcon from '@mattermost/compass-icons/components/pencil-outline';
import TuneIcon from '@mattermost/compass-icons/components/tune';
import SitemapIcon from '@mattermost/compass-icons/components/sitemap';
import ContentCopyIcon from '@mattermost/compass-icons/components/content-copy';
import TrashCanOutlineIcon from '@mattermost/compass-icons/components/trash-can-outline';
import ChevronRightIcon from '@mattermost/compass-icons/components/chevron-right';
import CogOutlineIcon from '@mattermost/compass-icons/components/cog-outline';
import Icon from '@/components/ui/Icon/Icon';
import MenuItem from '@/components/ui/MenuItem/MenuItem';
import PopoverMenu from '@/components/ui/PopoverMenu/PopoverMenu';
import Switch from '@/components/ui/Switch/Switch';
import Tooltip from '@/components/ui/Tooltip/Tooltip';
import Button from '@/components/ui/Button/Button';
import { ALL_RESOURCE_TYPES } from './data';
import type { AttrDef, ResourceType } from './data';
import styles from './AttributeSystem.module.scss';

interface RowMenuProps {
  def: AttrDef;
  open: boolean;
  onClose: () => void;
  onRename: () => void;
  onConfigureAccess: () => void;
  onToggleResource: (resource: ResourceType, on: boolean) => void;
  onConfigureBinding: (resource: ResourceType) => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

/**
 * Redesigned Global Attribute overflow menu.
 *
 * Adds the missing layers to the mockup menu:
 *  - Configure access → (Definition layer: read/write/owners)
 *  - Applies to → drill-in per resource (Binding layer), replacing the
 *    binary toggle-only submenu.
 */
export default function GlobalAttributeRowMenu({
  def,
  open,
  onClose,
  onRename,
  onConfigureAccess,
  onToggleResource,
  onConfigureBinding,
  onDuplicate,
  onDelete,
}: RowMenuProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [appliesOpen, setAppliesOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    function onMouseDown(e: MouseEvent) {
      if (wrapRef.current?.contains(e.target as Node)) return;
      onClose();
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        if (appliesOpen) setAppliesOpen(false);
        else onClose();
      }
    }
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, onClose, appliesOpen]);

  const deleteBlocked = def.protected || def.policyCount > 0;
  const deleteMessage = def.protected
    ? 'System attribute — cannot be deleted.'
    : `Used in ${def.policyCount} ${def.policyCount === 1 ? 'policy' : 'policies'}; cannot delete.`;

  return (
    <div className={styles.overflow} ref={wrapRef}>
      {open && (
        <div className={styles.overflowMenu}>
          <PopoverMenu>
            <MenuItem
              label="Rename"
              leadingVisual={<Icon size="16" glyph={<PencilOutlineIcon />} />}
              onClick={() => {
                onRename();
                onClose();
              }}
            />

            <MenuItem
              label="Configure access"
              secondaryLabel={def.read}
              secondaryLabelPosition="Inline"
              leadingVisual={<Icon size="16" glyph={<TuneIcon />} />}
              trailingElement
              trailingVisual={<Icon size="16" glyph={<ChevronRightIcon />} />}
              onClick={() => {
                onConfigureAccess();
                onClose();
              }}
            />

            {/* Applies to → per-resource binding drill-in */}
            <div
              className={styles.subWrap}
              onMouseEnter={() => setAppliesOpen(true)}
              onMouseLeave={() => setAppliesOpen(false)}
            >
              <MenuItem
                label="Applies to"
                secondaryLabel={`${def.appliesTo.length} resources`}
                secondaryLabelPosition="Inline"
                leadingVisual={<Icon size="16" glyph={<SitemapIcon />} />}
                trailingElement
                trailingVisual={<Icon size="16" glyph={<ChevronRightIcon />} />}
                aria-haspopup="menu"
                aria-expanded={appliesOpen}
                onClick={() => setAppliesOpen((c) => !c)}
              />
              {appliesOpen && (
                <div className={styles.submenu}>
                  <PopoverMenu variant="child">
                    {ALL_RESOURCE_TYPES.map((resource) => {
                      const on = def.appliesTo.includes(resource);
                      return (
                        <div key={resource} className={styles.menuRow}>
                          <span className={styles.menuRow__leading}>
                            <span className={styles.menuRow__label}>
                              {resource}
                            </span>
                          </span>
                          <span
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 8,
                            }}
                          >
                            {on && (
                              <Button
                                emphasis="Quaternary"
                                size="X-Small"
                                leadingIcon={
                                  <Icon size="12" glyph={<CogOutlineIcon />} />
                                }
                                aria-label={`Configure ${def.name} on ${resource}`}
                                onClick={() => {
                                  onConfigureBinding(resource);
                                  setAppliesOpen(false);
                                  onClose();
                                }}
                              >
                                Configure
                              </Button>
                            )}
                            <Switch
                              size="Small"
                              checked={on}
                              onChange={(e) =>
                                onToggleResource(
                                  resource,
                                  (e.target as HTMLInputElement).checked,
                                )
                              }
                              aria-label={`Apply ${def.name} to ${resource}`}
                            />
                          </span>
                        </div>
                      );
                    })}
                  </PopoverMenu>
                </div>
              )}
            </div>

            <div className={styles.menuDivider} role="separator" />

            <MenuItem
              label="Duplicate attribute"
              leadingVisual={<Icon size="16" glyph={<ContentCopyIcon />} />}
              onClick={() => {
                onDuplicate();
                onClose();
              }}
            />

            {deleteBlocked ? (
              <div className={styles.subWrap}>
                <MenuItem
                  label="Delete attribute"
                  leadingVisual={
                    <Icon size="16" glyph={<TrashCanOutlineIcon />} />
                  }
                  destructive
                  disabled
                />
                <div
                  style={{ position: 'absolute', right: '100%', top: 4 }}
                  aria-hidden
                >
                  <Tooltip label={deleteMessage} arrow="Right" />
                </div>
              </div>
            ) : (
              <MenuItem
                label="Delete attribute"
                leadingVisual={<Icon size="16" glyph={<TrashCanOutlineIcon />} />}
                destructive
                onClick={() => {
                  onDelete();
                  onClose();
                }}
              />
            )}
          </PopoverMenu>
        </div>
      )}
    </div>
  );
}
