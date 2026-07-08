import { useMemo, useState, type ReactNode, type RefObject } from 'react';
import FormatLetterCaseIcon from '@mattermost/compass-icons/components/format-letter-case';
import FormatListBulletedIcon from '@mattermost/compass-icons/components/format-list-bulleted';
import FormatListNumberedIcon from '@mattermost/compass-icons/components/format-list-numbered';
import LockOutlineIcon from '@mattermost/compass-icons/components/lock-outline';
import MenuDownIcon from '@mattermost/compass-icons/components/menu-down';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import SourceBranchIcon from '@mattermost/compass-icons/components/source-branch';
import FixedPopoverMenu from '@/components/ui/FixedPopoverMenu/FixedPopoverMenu';
import Icon from '@/components/ui/Icon/Icon';
import MenuItem from '@/components/ui/MenuItem/MenuItem';
import ClassificationPill from '@/pages/attribute-system/ClassificationPill';
import PopoverMenu, {
  PopoverMenuDivider,
  PopoverMenuGroup,
  PopoverMenuGroupTitle,
  PopoverMenuScroll,
} from '@/components/ui/PopoverMenu/PopoverMenu';
import SearchInput from '@/components/ui/SearchInput/SearchInput';
import Tooltip from '@/components/ui/Tooltip/Tooltip';
import type { AttrType, HubAttribute } from '@/pages/AttributeManagementHub/hubData';
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

export function attributeTypeIcon(type: AttrType): ReactNode {
  switch (type) {
    case 'Select':
      return <Icon size="16" glyph={<MenuDownIcon />} />;
    case 'Multiselect':
      return <Icon size="16" glyph={<FormatListBulletedIcon />} />;
    case 'Ranked':
      return <Icon size="16" glyph={<FormatListNumberedIcon />} />;
    case 'Ranked-hierarchical':
      return <Icon size="16" glyph={<SourceBranchIcon />} />;
    case 'Text':
      return <Icon size="16" glyph={<FormatLetterCaseIcon />} />;
  }
}

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
  preferAbove?: boolean;
  repositionKey?: string;
}

const LOCKED_INHERITED_ATTRIBUTE_TOOLTIP =
  'Automatically applied to every post. This attribute is locked and cannot be overridden.';

function LockedInheritedMenuItemHint({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <span className={menuStyles['thread-reply-input__menu-item-hint']}>
      {children}
      <span
        className={menuStyles['thread-reply-input__menu-item-hint-bubble']}
        aria-hidden
      >
        <Tooltip label={LOCKED_INHERITED_ATTRIBUTE_TOOLTIP} arrow="Bottom" />
      </span>
    </span>
  );
}

function InheritedAttributeMenuItem({
  item,
  className,
  onPick,
}: {
  item: InheritedPostAttributeMenuItem;
  className?: string;
  onPick: () => void;
}) {
  const isClassification = item.id === 'classification';

  const menuItem = (
    <MenuItem
      className={className}
      label={item.label}
      secondaryLabel={isClassification ? undefined : item.valueLabel}
      secondaryVisual={
        isClassification ? (
          <ClassificationPill valueId={item.valueId} label={item.valueLabel} />
        ) : undefined
      }
      leadingVisual={item.icon}
      trailingElement={item.locked}
      trailingVisual={
        item.locked ? <Icon size="16" glyph={<LockOutlineIcon />} /> : undefined
      }
      aria-disabled={item.locked || undefined}
      onClick={item.locked ? undefined : onPick}
    />
  );

  if (item.locked) {
    return <LockedInheritedMenuItemHint>{menuItem}</LockedInheritedMenuItemHint>;
  }

  return menuItem;
}

export function PostAttributeAddMenu({
  open,
  onClose,
  anchorRef,
  attachedIds,
  onPickAttribute,
  onCreateNew,
  attributes,
  preferAbove = true,
  repositionKey,
}: PostAttributeAddMenuProps) {
  const [query, setQuery] = useState('');

  const sections = useMemo(
    () => buildPostAttributeMenuSections(attributes),
    [attributes],
  );
  const filteredConfigured = useMemo(
    () => filterPostAttributeMenuItems(sections.configured, query),
    [sections.configured, query],
  );
  const filteredInherited = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return sections.inherited;
    return sections.inherited.filter(
      (item) =>
        item.label.toLowerCase().includes(normalized) ||
        item.valueLabel.toLowerCase().includes(normalized),
    );
  }, [sections.inherited, query]);

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
      preferAbove={preferAbove}
      minWidthFloor={300}
      repositionKey={repositionKey}
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
            onChange={(event) => setQuery(event.target.value)}
            onClear={() => setQuery('')}
          />
        </div>

        <PopoverMenuScroll maxHeight={280}>
          {filteredConfigured.length > 0 && (
            <PopoverMenuGroup aria-label="Post attributes">
              {filteredConfigured.map((item) => (
                <MenuItem
                  key={item.id}
                  className={menuStyles['thread-reply-input__menu-item']}
                  label={item.label}
                  leadingVisual={item.icon}
                  onClick={() => pickAttribute(item.id)}
                />
              ))}
            </PopoverMenuGroup>
          )}

          {filteredInherited.length > 0 && (
            <PopoverMenuGroup aria-label="Inherited attributes">
              <PopoverMenuGroupTitle>Inherited attributes</PopoverMenuGroupTitle>
              {filteredInherited.map((item) => (
                <InheritedAttributeMenuItem
                  key={item.id}
                  item={item}
                  className={menuStyles['thread-reply-input__menu-item']}
                  onPick={() => pickAttribute(item.id)}
                />
              ))}
            </PopoverMenuGroup>
          )}

          {filteredConfigured.length === 0 && filteredInherited.length === 0 && (
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
