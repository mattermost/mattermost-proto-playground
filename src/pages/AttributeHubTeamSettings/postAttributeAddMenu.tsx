import {
  useMemo,
  useState,
  type ChangeEvent,
  type ReactNode,
  type RefObject,
} from 'react';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import Icon from '@/components/ui/Icon/Icon';
import MenuItem from '@/components/ui/MenuItem/MenuItem';
import PopoverMenu, {
  PopoverMenuDivider,
  PopoverMenuGroup,
  PopoverMenuScroll,
} from '@/components/ui/PopoverMenu/PopoverMenu';
import SearchInput from '@/components/ui/SearchInput/SearchInput';
import FixedPopoverMenu, {
  type FixedPopoverAlign,
} from '@/components/ui/FixedPopoverMenu/FixedPopoverMenu';
import type { HubAttribute } from '@/pages/AttributeManagementHub/hubData';
import { attributeTypeIcon } from '@/pages/AttributeManagementHub/attrTypeIcon';
import ClassificationPill from '@/pages/attribute-system/ClassificationPill';
import {
  channelDefaultValueId,
  effectivePostAttributeValueId,
  effectivePostAttributeValueLabel,
  isInheritedPostBinding,
  isPostAttributeLocked,
  postBinding,
  postScopedAttributes,
  valueLabel,
  type ThreadDemoPost,
} from './postViewData';
import menuStyles from './ThreadReplyMessageInput.module.scss';

export interface PostAttributeMenuItem {
  id: string;
  label: string;
  icon: ReactNode;
}

export interface InheritedPostAttributeMenuItem extends PostAttributeMenuItem {
  valueId: string;
  valueLabel: string;
  locked: boolean;
}

export { attributeTypeIcon };

export function postAttributeIcon(attribute: HubAttribute): ReactNode {
  return attributeTypeIcon(attribute.type);
}

export function buildPostAttributeMenuSections(
  attributes: HubAttribute[] = postScopedAttributes(),
) {
  const configured: PostAttributeMenuItem[] = [];
  const inherited: InheritedPostAttributeMenuItem[] = [];

  for (const attribute of attributes) {
    const binding = postBinding(attribute);
    if (!binding) continue;

    const item: PostAttributeMenuItem = {
      id: attribute.id,
      label: attribute.name,
      icon: postAttributeIcon(attribute),
    };

    if (isInheritedPostBinding(binding)) {
      const valueId =
        channelDefaultValueId(attribute.id) ?? attribute.values[0]?.id ?? '';
      inherited.push({
        ...item,
        valueId,
        valueLabel: valueLabel(attribute, valueId),
        locked: isPostAttributeLocked(attribute, binding),
      });
      continue;
    }

    configured.push(item);
  }

  return { configured, inherited };
}

/** Flat list of every post-scoped attribute (no inherited/configured split). */
export function buildAvailablePostAttributeItems(
  attributes: HubAttribute[] = postScopedAttributes(),
): PostAttributeMenuItem[] {
  const items: PostAttributeMenuItem[] = [];
  for (const attribute of attributes) {
    const binding = postBinding(attribute);
    if (!binding) continue;
    items.push({
      id: attribute.id,
      label: attribute.name,
      icon: postAttributeIcon(attribute),
    });
  }
  return items;
}

export function filterPostAttributeMenuItems(
  items: PostAttributeMenuItem[],
  query: string,
): PostAttributeMenuItem[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return items;
  return items.filter((item) => item.label.toLowerCase().includes(normalized));
}

export function defaultValueForPostAttribute(attribute: HubAttribute): string {
  const channelDefault = channelDefaultValueId(attribute.id);
  if (channelDefault) return channelDefault;
  return attribute.values[0]?.id ?? '';
}

export interface PostAttributeAddMenuRow {
  id: string;
  label: string;
  icon: ReactNode;
  valueId: string | null;
  valueLabel: string | null;
  attached: boolean;
  locked: boolean;
}

export function buildPostAttributeAddMenuRows(
  post: ThreadDemoPost,
  attributes: HubAttribute[] = postScopedAttributes(),
): PostAttributeAddMenuRow[] {
  const rows: PostAttributeAddMenuRow[] = [];

  for (const attribute of attributes) {
    const binding = postBinding(attribute);
    if (!binding) continue;

    const attached = post.attributes.some(
      (row) => row.attributeId === attribute.id,
    );

    rows.push({
      id: attribute.id,
      label: attribute.name,
      icon: postAttributeIcon(attribute),
      valueId: effectivePostAttributeValueId(post, attribute),
      valueLabel: effectivePostAttributeValueLabel(post, attribute),
      attached,
      locked: isPostAttributeLocked(attribute, binding),
    });
  }

  return rows;
}

export interface PostAttributeAddMenuProps {
  open: boolean;
  onClose: () => void;
  anchorRef: RefObject<HTMLElement | null>;
  attachedIds: string[];
  onPickAttribute: (attributeId: string) => void;
  onCreateNew?: () => void;
  attributes?: HubAttribute[];
  /** When set, shows current attribute values and an Attributes header. */
  post?: ThreadDemoPost;
  /** Opens the full attributes editor (modal). */
  onEditAttributes?: () => void;
  /** Horizontal anchor — use `end` in narrow RHS so the menu extends leftward. */
  align?: FixedPopoverAlign;
}

export function PostAttributeAddMenu({
  open,
  onClose,
  anchorRef,
  attachedIds,
  onPickAttribute,
  onCreateNew,
  attributes,
  post,
  onEditAttributes,
  align = 'start',
}: PostAttributeAddMenuProps) {
  const [query, setQuery] = useState('');

  const postRows = useMemo(() => {
    if (!post) return null;
    return buildPostAttributeAddMenuRows(post, attributes);
  }, [attributes, post]);

  const available = useMemo(
    () =>
      buildAvailablePostAttributeItems(attributes).filter(
        (item) => !attachedIds.includes(item.id),
      ),
    [attributes, attachedIds],
  );

  const filteredAvailable = useMemo(
    () => filterPostAttributeMenuItems(available, query),
    [available, query],
  );

  const filteredPostRows = useMemo(() => {
    if (!postRows) return [];
    return filterPostAttributeMenuItems(postRows, query);
  }, [postRows, query]);

  const closeMenu = () => {
    setQuery('');
    onClose();
  };

  const pickAttribute = (attributeId: string) => {
    if (attachedIds.includes(attributeId)) return;
    onPickAttribute(attributeId);
    closeMenu();
  };

  const handleCreateNew = () => {
    closeMenu();
    onCreateNew?.();
  };

  const handleEdit = () => {
    closeMenu();
    onEditAttributes?.();
  };

  const showPostSummary = postRows != null;

  return (
    <FixedPopoverMenu
      open={open}
      onClose={closeMenu}
      anchorRef={anchorRef}
      align={align}
      minWidthFloor={300}
      className={menuStyles['thread-reply-input__menu']}
    >
      <PopoverMenu
        aria-label={showPostSummary ? 'Attributes' : 'Add attribute'}
        className={menuStyles['thread-reply-input__attr-menu']}
      >
        {showPostSummary && (
          <>
            <div className={menuStyles['thread-reply-input__attr-menu-header']}>
              <span
                className={menuStyles['thread-reply-input__attr-menu-title']}
              >
                Attributes
              </span>
              {onEditAttributes && (
                <button
                  type="button"
                  className={menuStyles['thread-reply-input__attr-menu-edit']}
                  onClick={handleEdit}
                >
                  Edit
                </button>
              )}
            </div>
            <div
              className={menuStyles['thread-reply-input__attr-menu-divider']}
              aria-hidden
            />
          </>
        )}

        <div className={menuStyles['thread-reply-input__search']}>
          <SearchInput
            size="Small"
            placeholder="Search attributes…"
            aria-label="Search attributes"
            value={query}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              setQuery(event.target.value)
            }
            onClear={() => setQuery('')}
          />
        </div>

        <PopoverMenuScroll maxHeight="min(280px, var(--fixed-popover-max-height, 280px))">
          {showPostSummary ? (
            filteredPostRows.length > 0 ? (
              <PopoverMenuGroup aria-label="Post attributes">
                {filteredPostRows.map((item) => {
                  const isClassification =
                    item.id === 'classification' && item.valueLabel != null;
                  const classificationValueId =
                    item.valueId ??
                    (item.valueLabel ? 'u' : null);

                  return (
                    <MenuItem
                      key={item.id}
                      className={menuStyles['thread-reply-input__menu-item']}
                      label={item.label}
                      leadingVisual={item.icon}
                      secondaryLabel={
                        !isClassification && item.valueLabel ? (
                          <span
                            className={
                              menuStyles['thread-reply-input__menu-item-value']
                            }
                          >
                            {item.valueLabel}
                          </span>
                        ) : undefined
                      }
                      secondaryLabelPosition="Inline"
                      trailingElement={isClassification}
                      trailingVisual={
                        isClassification && classificationValueId ? (
                          <ClassificationPill
                            valueId={classificationValueId}
                            label={item.valueLabel!}
                            locked
                          />
                        ) : undefined
                      }
                      disabled={item.attached || item.locked}
                      onClick={() => pickAttribute(item.id)}
                    />
                  );
                })}
              </PopoverMenuGroup>
            ) : (
              <p className={menuStyles['thread-reply-input__empty']}>
                No matching attributes.
              </p>
            )
          ) : filteredAvailable.length > 0 ? (
            <PopoverMenuGroup aria-label="Available attributes">
              {filteredAvailable.map((item) => (
                <MenuItem
                  key={item.id}
                  className={menuStyles['thread-reply-input__menu-item']}
                  label={item.label}
                  leadingVisual={item.icon}
                  onClick={() => pickAttribute(item.id)}
                />
              ))}
            </PopoverMenuGroup>
          ) : (
            <p className={menuStyles['thread-reply-input__empty']}>
              No matching attributes.
            </p>
          )}
        </PopoverMenuScroll>

        {onCreateNew && (
          <>
            <PopoverMenuDivider />
            <button
              type="button"
              className={menuStyles['thread-reply-input__footer']}
              onClick={handleCreateNew}
            >
              <Icon size="16" glyph={<PlusIcon />} />
              Create new attribute
            </button>
          </>
        )}
      </PopoverMenu>
    </FixedPopoverMenu>
  );
}
