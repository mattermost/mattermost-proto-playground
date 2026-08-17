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
import FixedPopoverMenu from '@/components/ui/FixedPopoverMenu/FixedPopoverMenu';
import type { HubAttribute } from '@/pages/AttributeManagementHub/hubData';
import { attributeTypeIcon } from '@/pages/AttributeManagementHub/attrTypeIcon';
import {
  channelDefaultValueId,
  isInheritedPostBinding,
  isPostAttributeLocked,
  postBinding,
  postScopedAttributes,
  valueLabel,
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

export interface PostAttributeAddMenuProps {
  open: boolean;
  onClose: () => void;
  anchorRef: RefObject<HTMLElement | null>;
  attachedIds: string[];
  onPickAttribute: (attributeId: string) => void;
  onCreateNew?: () => void;
  attributes?: HubAttribute[];
}

export function PostAttributeAddMenu({
  open,
  onClose,
  anchorRef,
  attachedIds,
  onPickAttribute,
  onCreateNew,
  attributes,
}: PostAttributeAddMenuProps) {
  const [query, setQuery] = useState('');

  const available = useMemo(
    () =>
      buildAvailablePostAttributeItems(attributes).filter(
        (item) => !attachedIds.includes(item.id),
      ),
    [attributes, attachedIds],
  );
  const filtered = useMemo(
    () => filterPostAttributeMenuItems(available, query),
    [available, query],
  );

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

  return (
    <FixedPopoverMenu
      open={open}
      onClose={closeMenu}
      anchorRef={anchorRef}
      align="start"
      minWidthFloor={300}
      className={menuStyles['thread-reply-input__menu']}
    >
      <PopoverMenu
        aria-label="Add attribute"
        className={menuStyles['thread-reply-input__attr-menu']}
      >
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
          {filtered.length > 0 ? (
            <PopoverMenuGroup aria-label="Available attributes">
              {filtered.map((item) => (
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
