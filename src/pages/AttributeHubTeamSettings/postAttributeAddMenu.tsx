import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from 'react';
import { createPortal } from 'react-dom';
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

const LOCKED_HINT_TOOLTIP_GAP = 8;
const LOCKED_HINT_TOOLTIP_Z_INDEX = 1100;
const LOCKED_HINT_TOOLTIP_ESTIMATED_HEIGHT = 72;

type LockedHintPlacement = 'above' | 'below';

function LockedInheritedMenuItemHint({
  children,
}: {
  children: ReactNode;
}) {
  const hintRef = useRef<HTMLSpanElement>(null);
  const bubbleRef = useRef<HTMLSpanElement>(null);
  const [hovered, setHovered] = useState(false);
  const [placement, setPlacement] = useState<LockedHintPlacement>('above');
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(
    null,
  );

  const updateCoords = useCallback(() => {
    const hint = hintRef.current;
    if (!hint) return;

    const rect = hint.getBoundingClientRect();
    const bubbleHeight =
      bubbleRef.current?.offsetHeight ?? LOCKED_HINT_TOOLTIP_ESTIMATED_HEIGHT;
    const spaceAbove = rect.top;
    const spaceBelow = window.innerHeight - rect.bottom;
    const nextPlacement: LockedHintPlacement =
      spaceAbove >= bubbleHeight + LOCKED_HINT_TOOLTIP_GAP ||
      spaceAbove >= spaceBelow
        ? 'above'
        : 'below';

    setPlacement(nextPlacement);
    setCoords({
      left: rect.left + rect.width / 2,
      top:
        nextPlacement === 'above'
          ? rect.top - LOCKED_HINT_TOOLTIP_GAP
          : rect.bottom + LOCKED_HINT_TOOLTIP_GAP,
    });
  }, []);

  useLayoutEffect(() => {
    if (!hovered) return;
    updateCoords();
  }, [hovered, updateCoords]);

  useEffect(() => {
    if (!hovered) return;

    const dismiss = () => setHovered(false);
    window.addEventListener('scroll', dismiss, true);
    window.addEventListener('resize', dismiss);

    return () => {
      window.removeEventListener('scroll', dismiss, true);
      window.removeEventListener('resize', dismiss);
    };
  }, [hovered]);

  const translate =
    placement === 'above' ? 'translate(-50%, -100%)' : 'translate(-50%, 0)';
  const bubbleStyle: CSSProperties | undefined = coords
    ? {
        position: 'fixed',
        top: coords.top,
        left: coords.left,
        zIndex: LOCKED_HINT_TOOLTIP_Z_INDEX,
        transform: `${translate} scale(${hovered ? 1 : 0.9})`,
        transformOrigin:
          placement === 'above' ? 'bottom center' : 'top center',
        opacity: hovered ? 1 : 0,
        transition: hovered
          ? `opacity var(--duration-quick) var(--ease-entrance), transform var(--duration-quick) var(--ease-entrance)`
          : `opacity var(--duration-quick) var(--ease-exit), transform var(--duration-quick) var(--ease-exit)`,
      }
    : undefined;

  const tooltipBubble =
    hovered &&
    coords &&
    createPortal(
      <span
        ref={bubbleRef}
        className={menuStyles['thread-reply-input__menu-item-hint-bubble']}
        style={bubbleStyle}
        aria-hidden
      >
        <Tooltip
          label={LOCKED_INHERITED_ATTRIBUTE_TOOLTIP}
          arrow={placement === 'above' ? 'Bottom' : 'Top'}
        />
      </span>,
      document.body,
    );

  return (
    <span
      ref={hintRef}
      className={menuStyles['thread-reply-input__menu-item-hint']}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        setCoords(null);
      }}
    >
      {children}
      {tooltipBubble}
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
  const availableConfigured = useMemo(
    () => sections.configured.filter((item) => !attachedIds.includes(item.id)),
    [sections.configured, attachedIds],
  );
  const availableInherited = useMemo(
    () => sections.inherited.filter((item) => !attachedIds.includes(item.id)),
    [sections.inherited, attachedIds],
  );
  const filteredConfigured = useMemo(
    () => filterPostAttributeMenuItems(availableConfigured, query),
    [availableConfigured, query],
  );
  const filteredInherited = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return availableInherited;
    return availableInherited.filter(
      (item) =>
        item.label.toLowerCase().includes(normalized) ||
        item.valueLabel.toLowerCase().includes(normalized),
    );
  }, [availableInherited, query]);

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
