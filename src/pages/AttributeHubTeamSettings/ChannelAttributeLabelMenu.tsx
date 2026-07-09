import {
  useId,
  useMemo,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import PencilOutlineIcon from '@mattermost/compass-icons/components/pencil-outline';
import UploadOutlineIcon from '@mattermost/compass-icons/components/upload-outline';
import ContentCopyIcon from '@mattermost/compass-icons/components/content-copy';
import ChevronRightIcon from '@mattermost/compass-icons/components/chevron-right';
import Checkbox from '@/components/ui/Checkbox/Checkbox';
import Icon from '@/components/ui/Icon/Icon';
import MenuItem from '@/components/ui/MenuItem/MenuItem';
import PopoverMenu, {
  PopoverMenuDivider,
} from '@/components/ui/PopoverMenu/PopoverMenu';
import {
  channelDisplayIncludes,
  supportsChannelBanner,
  toggleChannelLocation,
  type DisplayWhere,
  type HubAttribute,
} from '@/pages/AttributeManagementHub/hubData';
import type { EffectiveChannelBinding } from './channelViewData';
import menuStyles from './ChannelAttributeLabelMenu.module.scss';

function SubmenuRow({
  label,
  icon,
  secondaryLabel,
  secondaryLabelPosition = 'Inline',
  children,
}: {
  label: string;
  icon?: ReactNode;
  secondaryLabel?: string;
  secondaryLabelPosition?: 'Inline' | 'Below';
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const subId = useId();

  const onKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      setOpen(true);
    } else if (e.key === 'ArrowLeft' || e.key === 'Escape') {
      if (open) {
        e.preventDefault();
        e.stopPropagation();
        setOpen(false);
      }
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setOpen((current) => !current);
    }
  };

  return (
    <div
      className={menuStyles['sub-wrap']}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <MenuItem
        label={label}
        leadingVisual={icon}
        secondaryLabel={secondaryLabel}
        secondaryLabelPosition={secondaryLabelPosition}
        trailingElement
        trailingVisual={<Icon size="16" glyph={<ChevronRightIcon />} />}
        active={open}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={subId}
        role="menuitem"
        onClick={() => setOpen((current) => !current)}
        onKeyDown={onKey}
      />
      {open && (
        <div
          className={menuStyles.submenu}
          id={subId}
          role="menu"
          aria-label={label}
          onClick={(e) => e.stopPropagation()}
        >
          <PopoverMenu variant="child" className={menuStyles['menu-root']}>
            {children}
          </PopoverMenu>
        </div>
      )}
    </div>
  );
}

function DisplayLocationSubmenu({
  attribute,
  showWhere,
  readOnly,
  headerDisabled,
  onChangeShowWhere,
}: {
  attribute?: HubAttribute;
  showWhere: DisplayWhere[];
  readOnly: boolean;
  headerDisabled?: boolean;
  onChangeShowWhere: (next: DisplayWhere[]) => void;
}) {
  const bannerSupported = attribute ? supportsChannelBanner(attribute) : false;
  const headerOff = headerDisabled ?? false;

  const toggle = (loc: 'Header' | 'Sidebar' | 'Banner') => {
    if (readOnly || (loc === 'Header' && headerOff)) return;
    onChangeShowWhere(toggleChannelLocation(showWhere, loc));
  };

  return (
    <div
      className={[
        menuStyles['display-locations'],
        readOnly ? menuStyles['display-locations--readonly'] : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className={menuStyles['display-locations__list']}>
        <Checkbox
          size="Medium"
          className={menuStyles['display-locations__checkbox']}
          checked={headerOff ? false : channelDisplayIncludes(showWhere, 'Header')}
          disabled={readOnly || headerOff}
          onChange={() => toggle('Header')}
        >
          Header
        </Checkbox>
        <Checkbox
          size="Medium"
          className={menuStyles['display-locations__checkbox']}
          checked={channelDisplayIncludes(showWhere, 'Sidebar')}
          disabled={readOnly}
          onChange={() => toggle('Sidebar')}
        >
          Sidebar
        </Checkbox>
        {bannerSupported && (
          <Checkbox
            size="Medium"
            className={menuStyles['display-locations__checkbox']}
            checked={channelDisplayIncludes(showWhere, 'Banner')}
            disabled={readOnly}
            onChange={() => toggle('Banner')}
          >
            Channel banner
          </Checkbox>
        )}
        {!readOnly && (
          <p className={menuStyles['display-locations__hint']}>
            Multiple locations can be selected. Uncheck all to hide.
          </p>
        )}
      </div>
    </div>
  );
}

export interface ChannelAttributeLabelMenuProps {
  name: string;
  locked: boolean;
  isClassification: boolean;
  attribute?: HubAttribute;
  binding: EffectiveChannelBinding;
  onPatchBinding: (patch: Partial<EffectiveChannelBinding>) => void;
  onDuplicate?: () => void;
  onEditAttribute?: () => void;
  onClose: () => void;
}

export default function ChannelAttributeLabelMenu({
  name,
  locked,
  isClassification,
  attribute,
  binding,
  onPatchBinding,
  onDuplicate,
  onEditAttribute,
  onClose,
}: ChannelAttributeLabelMenuProps) {
  const displayLocationReadOnly = locked && isClassification;
  const classificationHeaderDisabled = isClassification;
  const displaySummary = useMemo(() => {
    const parts: string[] = [];
    if (
      !classificationHeaderDisabled &&
      channelDisplayIncludes(binding.showWhere, 'Header')
    ) {
      parts.push('Header');
    }
    if (channelDisplayIncludes(binding.showWhere, 'Sidebar')) parts.push('Sidebar');
    if (channelDisplayIncludes(binding.showWhere, 'Banner')) {
      parts.push('Channel banner');
    }
    return parts.length > 0 ? parts.join(', ') : 'Hidden';
  }, [binding.showWhere, classificationHeaderDisabled]);

  const displayLocationSubmenu = (
    <DisplayLocationSubmenu
      attribute={attribute}
      showWhere={binding.showWhere}
      readOnly={displayLocationReadOnly}
      headerDisabled={classificationHeaderDisabled}
      onChangeShowWhere={(next) => onPatchBinding({ showWhere: next })}
    />
  );

  if (locked) {
    return (
      <PopoverMenu
        aria-label={`${name} actions`}
        className={menuStyles['menu-root']}
      >
        <SubmenuRow
          label="Display location"
          icon={<Icon size="16" glyph={<UploadOutlineIcon />} />}
          secondaryLabel={displaySummary}
          secondaryLabelPosition="Below"
        >
          {displayLocationSubmenu}
        </SubmenuRow>
      </PopoverMenu>
    );
  }

  return (
    <PopoverMenu
      aria-label={`${name} actions`}
      className={menuStyles['menu-root']}
    >
      <SubmenuRow
        label="Display location"
        icon={<Icon size="16" glyph={<UploadOutlineIcon />} />}
        secondaryLabel={displaySummary}
        secondaryLabelPosition="Below"
      >
        {displayLocationSubmenu}
      </SubmenuRow>

      <PopoverMenuDivider />

      <MenuItem
        label="Duplicate attribute"
        leadingVisual={<Icon size="16" glyph={<ContentCopyIcon />} />}
        onClick={() => {
          onDuplicate?.();
          onClose();
        }}
      />

      {onEditAttribute && (
        <MenuItem
          label="Edit attribute"
          leadingVisual={<Icon size="16" glyph={<PencilOutlineIcon />} />}
          onClick={() => {
            onEditAttribute();
            onClose();
          }}
        />
      )}
    </PopoverMenu>
  );
}
