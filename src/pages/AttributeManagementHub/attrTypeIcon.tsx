import type { ReactNode } from 'react';
import FormatListBulletedIcon from '@mattermost/compass-icons/components/format-list-bulleted';
import FormatListNumberedIcon from '@mattermost/compass-icons/components/format-list-numbered';
import MenuDownIcon from '@mattermost/compass-icons/components/menu-down';
import SourceBranchIcon from '@mattermost/compass-icons/components/source-branch';
import TextLongIcon from '@mattermost/compass-icons/components/text-long';
import Icon from '@/components/ui/Icon/Icon';
import type { AttrType } from './hubData';

/** Leading icon for an attribute type in menus and type pickers. */
export function attributeTypeIcon(type: AttrType): ReactNode {
  switch (type) {
    case 'Text':
      return <Icon size="16" glyph={<TextLongIcon />} />;
    case 'Select':
      return <Icon size="16" glyph={<MenuDownIcon />} />;
    case 'Multiselect':
      return <Icon size="16" glyph={<FormatListBulletedIcon />} />;
    case 'Ranked':
      return <Icon size="16" glyph={<FormatListNumberedIcon />} />;
    case 'Ranked-hierarchical':
      return <Icon size="16" glyph={<SourceBranchIcon />} />;
    default: {
      const _exhaustive: never = type;
      return _exhaustive;
    }
  }
}
