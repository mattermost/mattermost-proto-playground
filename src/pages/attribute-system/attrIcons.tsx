import type { ReactNode } from 'react';
import FormatLetterCaseIcon from '@mattermost/compass-icons/components/format-letter-case';
import MenuDownIcon from '@mattermost/compass-icons/components/menu-down';
import FormatListBulletedIcon from '@mattermost/compass-icons/components/format-list-bulleted';
import FormatListNumberedIcon from '@mattermost/compass-icons/components/format-list-numbered';
import CalendarOutlineIcon from '@mattermost/compass-icons/components/calendar-outline';
import ImageOutlineIcon from '@mattermost/compass-icons/components/image-outline';
import AtIcon from '@mattermost/compass-icons/components/at';
import type { AttrType } from './data';

export const TYPE_ICON: Record<AttrType, ReactNode> = {
  Text: <FormatLetterCaseIcon />,
  Select: <MenuDownIcon />,
  Multiselect: <FormatListBulletedIcon />,
  Ranked: <FormatListNumberedIcon />,
  Date: <CalendarOutlineIcon />,
  Image: <ImageOutlineIcon />,
  Email: <AtIcon />,
};
