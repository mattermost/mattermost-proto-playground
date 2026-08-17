import ContentCopyIcon from '@mattermost/compass-icons/components/content-copy';
import PencilOutlineIcon from '@mattermost/compass-icons/components/pencil-outline';
import TrashCanOutlineIcon from '@mattermost/compass-icons/components/trash-can-outline';
import Icon from '@/components/ui/Icon/Icon';
import MenuItem from '@/components/ui/MenuItem/MenuItem';
import PopoverMenu, {
  PopoverMenuDivider,
} from '@/components/ui/PopoverMenu/PopoverMenu';
import type { HubAttribute } from '@/pages/AttributeManagementHub/hubData';

export interface ResourceSettingsMenuContentProps {
  attribute: HubAttribute;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onClose: () => void;
}

export default function ResourceSettingsMenuContent({
  attribute,
  onEdit,
  onDuplicate,
  onDelete,
  onClose,
}: ResourceSettingsMenuContentProps) {
  return (
    <PopoverMenu aria-label={`${attribute.name} actions`}>
      <MenuItem
        label="Edit attribute"
        leadingVisual={<Icon size="16" glyph={<PencilOutlineIcon />} />}
        onClick={() => {
          onEdit();
          onClose();
        }}
      />
      <MenuItem
        label="Duplicate attribute"
        leadingVisual={<Icon size="16" glyph={<ContentCopyIcon />} />}
        onClick={() => {
          onDuplicate();
          onClose();
        }}
      />
      <PopoverMenuDivider />
      <MenuItem
        label="Delete attribute"
        destructive
        leadingVisual={<Icon size="16" glyph={<TrashCanOutlineIcon />} />}
        onClick={() => {
          onDelete();
          onClose();
        }}
      />
    </PopoverMenu>
  );
}
