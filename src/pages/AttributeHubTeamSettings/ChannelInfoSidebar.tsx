import { useRef, useState } from 'react';
import StarOutlineIcon from '@mattermost/compass-icons/components/star-outline';
import BellOutlineIcon from '@mattermost/compass-icons/components/bell-outline';
import AccountPlusOutlineIcon from '@mattermost/compass-icons/components/account-plus-outline';
import LinkVariantIcon from '@mattermost/compass-icons/components/link-variant';
import CogOutlineIcon from '@mattermost/compass-icons/components/cog-outline';
import BellOutlineIconMenu from '@mattermost/compass-icons/components/bell-outline';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import ActionButton from '@/components/ui/ActionButton/ActionButton';
import Divider from '@/components/ui/Divider/Divider';
import FixedPopoverMenu from '@/components/ui/FixedPopoverMenu/FixedPopoverMenu';
import Icon from '@/components/ui/Icon/Icon';
import MenuItem from '@/components/ui/MenuItem/MenuItem';
import PopoverMenu from '@/components/ui/PopoverMenu/PopoverMenu';
import type { AttrType } from '@/pages/AttributeManagementHub/hubData';
import { CHANNEL_NAME } from './channelData';
import ChannelAttributesPanel from './ChannelAttributesPanel';
import { attributeTypeIcon } from './postAttributeAddMenu';
import {
  CHANNEL_ATTRIBUTE_TYPES,
  type ChannelCustomAttribute,
  type ChannelDemoState,
  type ChannelBindingOverride,
} from './channelViewData';
import styles from './ChannelInfoSidebar.module.scss';

export interface ChannelInfoSidebarProps {
  channel: ChannelDemoState;
  readOnly?: boolean;
  onAddCustomAttribute?: (type: AttrType) => void;
  onUpdateCustomAttribute?: (
    id: string,
    patch: Partial<Pick<ChannelCustomAttribute, 'name' | 'selectedValueId'>>,
  ) => void;
  onAddCustomAttributeValue?: (id: string, label: string) => void;
  onRemoveAttribute?: (attributeId: string) => void;
  onRemoveCustomAttribute?: (id: string) => void;
  onUpdateAttributeValue?: (attributeId: string, valueId: string) => void;
  onPatchBindingOverride?: (
    attributeId: string,
    patch: Partial<ChannelBindingOverride>,
  ) => void;
  onEditAttribute?: (attributeId: string) => void;
}

export default function ChannelInfoSidebar({
  channel,
  readOnly = false,
  onAddCustomAttribute,
  onUpdateCustomAttribute,
  onAddCustomAttributeValue,
  onRemoveAttribute,
  onRemoveCustomAttribute,
  onUpdateAttributeValue,
  onPatchBindingOverride,
  onEditAttribute,
}: ChannelInfoSidebarProps) {
  const [typeMenuOpen, setTypeMenuOpen] = useState(false);
  const addTriggerRef = useRef<HTMLButtonElement>(null);

  const closeTypeMenu = () => setTypeMenuOpen(false);

  const pickType = (type: AttrType) => {
    onAddCustomAttribute?.(type);
    closeTypeMenu();
  };

  return (
    <div className={styles['channel-info']}>
      <div className={styles['channel-info__actions']}>
        <ActionButton
          className={styles['channel-info__action']}
          icon={<Icon size="20" glyph={<StarOutlineIcon />} />}
          label="Favorite"
        />
        <ActionButton
          className={styles['channel-info__action']}
          icon={<Icon size="20" glyph={<BellOutlineIcon />} />}
          label="Mute"
        />
        <ActionButton
          className={styles['channel-info__action']}
          icon={<Icon size="20" glyph={<AccountPlusOutlineIcon />} />}
          label="Add people"
        />
        <ActionButton
          className={styles['channel-info__action']}
          icon={<Icon size="20" glyph={<LinkVariantIcon />} />}
          label="Copy Link"
        />
      </div>

      <div className={styles['channel-info__about']}>
        <h3 className={styles['channel-info__name']}>#{CHANNEL_NAME}</h3>

        <div className={styles['channel-info__group']}>
          <span className={styles['channel-info__group-title']}>Channel attributes</span>
          <div className={styles['channel-info__attrs']}>
            <ChannelAttributesPanel
              channel={channel}
              readOnly={readOnly}
              onUpdateCustomAttribute={onUpdateCustomAttribute}
              onAddCustomAttributeValue={onAddCustomAttributeValue}
              onRemoveAttribute={onRemoveAttribute}
              onRemoveCustomAttribute={onRemoveCustomAttribute}
              onUpdateAttributeValue={onUpdateAttributeValue}
              onPatchBindingOverride={onPatchBindingOverride}
              onEditAttribute={onEditAttribute}
            />
            {!readOnly && (
              <button
                ref={addTriggerRef}
                type="button"
                className={styles['channel-info__add']}
                aria-label="Add attribute"
                aria-haspopup="menu"
                aria-expanded={typeMenuOpen}
                onClick={() => setTypeMenuOpen(true)}
              >
                <span className={styles['channel-info__add-icon']} aria-hidden>
                  <Icon size="16" glyph={<PlusIcon />} />
                </span>
                Add attribute
              </button>
            )}
          </div>
        </div>

        <div className={styles['channel-info__group']}>
          <span className={styles['channel-info__group-title']}>Channel purpose</span>
          <p className={styles['channel-info__body-text']}>
            Program ALPHA · Team coordination through sustainment.
          </p>
        </div>
      </div>

      {!readOnly && (
        <FixedPopoverMenu
          open={typeMenuOpen}
          onClose={closeTypeMenu}
          anchorRef={addTriggerRef}
          align="start"
          preferAbove={false}
          minWidthFloor={220}
        >
          <PopoverMenu aria-label="Attribute type">
            {CHANNEL_ATTRIBUTE_TYPES.map((type) => (
              <MenuItem
                key={type}
                label={type}
                leadingVisual={attributeTypeIcon(type)}
                onClick={() => pickType(type)}
              />
            ))}
          </PopoverMenu>
        </FixedPopoverMenu>
      )}

      <Divider />

      <nav className={styles['channel-info__menu']}>
        {!readOnly && (
          <MenuItem
            label="Channel settings"
            leadingVisual={<Icon size="16" glyph={<CogOutlineIcon />} />}
          />
        )}
        <MenuItem
          label="Notification preferences"
          leadingVisual={<Icon size="16" glyph={<BellOutlineIconMenu />} />}
        />
      </nav>
    </div>
  );
}
