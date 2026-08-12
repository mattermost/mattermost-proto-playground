import type { ReactNode } from 'react';
import FormatLetterCaseIcon from '@mattermost/compass-icons/components/format-letter-case';
import ChevronDownCircleOutlineIcon from '@mattermost/compass-icons/components/chevron-down-circle-outline';
import FormatListBulletedIcon from '@mattermost/compass-icons/components/format-list-bulleted';
import FormatListNumberedIcon from '@mattermost/compass-icons/components/format-list-numbered';
import SitemapIcon from '@mattermost/compass-icons/components/sitemap';
import type { AttrType } from '@/pages/AttributeManagementHub/hubData';

/** Compass glyphs for hub attribute types (matches attribute-system conventions). */
export const MVP_ATTR_TYPE_ICON: Record<AttrType, ReactNode> = {
  Text: <FormatLetterCaseIcon />,
  Select: <ChevronDownCircleOutlineIcon />,
  Multiselect: <FormatListBulletedIcon />,
  Ranked: <FormatListNumberedIcon />,
  'Ranked-hierarchical': <SitemapIcon />,
};

export function mvpAttrTypeIcon(type: AttrType): ReactNode {
  return MVP_ATTR_TYPE_ICON[type];
}
