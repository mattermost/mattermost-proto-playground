import type { ComponentType, ReactNode } from 'react';
import AccountOutlineIcon from '@mattermost/compass-icons/components/account-outline';
import AccountMultipleOutlineIcon from '@mattermost/compass-icons/components/account-multiple-outline';
import BellOutlineIcon from '@mattermost/compass-icons/components/bell-outline';
import BookmarkOutlineIcon from '@mattermost/compass-icons/components/bookmark-outline';
import BookmarkIcon from '@mattermost/compass-icons/components/bookmark';
import CalendarOutlineIcon from '@mattermost/compass-icons/components/calendar-outline';
import CheckIcon from '@mattermost/compass-icons/components/check';
import ChevronRightIcon from '@mattermost/compass-icons/components/chevron-right';
import CloseIcon from '@mattermost/compass-icons/components/close';
import CogOutlineIcon from '@mattermost/compass-icons/components/cog-outline';
import DotsVerticalIcon from '@mattermost/compass-icons/components/dots-vertical';
import DownloadOutlineIcon from '@mattermost/compass-icons/components/download-outline';
import EmailOutlineIcon from '@mattermost/compass-icons/components/email-outline';
import FolderOutlineIcon from '@mattermost/compass-icons/components/folder-outline';
import GlobeIcon from '@mattermost/compass-icons/components/globe';
import HeartOutlineIcon from '@mattermost/compass-icons/components/heart-outline';
import HomeVariantOutlineIcon from '@mattermost/compass-icons/components/home-variant-outline';
import LinkVariantIcon from '@mattermost/compass-icons/components/link-variant';
import MagnifyIcon from '@mattermost/compass-icons/components/magnify';
import PaperclipIcon from '@mattermost/compass-icons/components/paperclip';
import PencilOutlineIcon from '@mattermost/compass-icons/components/pencil-outline';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import ShareVariantOutlineIcon from '@mattermost/compass-icons/components/share-variant-outline';
import StarOutlineIcon from '@mattermost/compass-icons/components/star-outline';
import StarIcon from '@mattermost/compass-icons/components/star';
import TrashCanOutlineIcon from '@mattermost/compass-icons/components/trash-can-outline';
import VideoOutlineIcon from '@mattermost/compass-icons/components/video-outline';

import FileGenericOutlineIcon from '@mattermost/compass-icons/components/file-generic-outline';
import FileImageOutlineIcon from '@mattermost/compass-icons/components/file-image-outline';
import FileWordOutlineIcon from '@mattermost/compass-icons/components/file-word-outline';
import FileExcelOutlineIcon from '@mattermost/compass-icons/components/file-excel-outline';
import FilePdfOutlineIcon from '@mattermost/compass-icons/components/file-pdf-outline';
import FilePowerpointOutlineIcon from '@mattermost/compass-icons/components/file-powerpoint-outline';
import FileVideoOutlineIcon from '@mattermost/compass-icons/components/file-video-outline';
import FileAudioOutlineIcon from '@mattermost/compass-icons/components/file-audio-outline';

import FileGenericOutlineLargeIcon from '@mattermost/compass-icons/components/file-generic-outline-large';
import FileImageOutlineLargeIcon from '@mattermost/compass-icons/components/file-image-outline-large';
import FileWordOutlineLargeIcon from '@mattermost/compass-icons/components/file-word-outline-large';
import FileExcelOutlineLargeIcon from '@mattermost/compass-icons/components/file-excel-outline-large';
import FilePdfOutlineLargeIcon from '@mattermost/compass-icons/components/file-pdf-outline-large';
import FilePowerpointOutlineLargeIcon from '@mattermost/compass-icons/components/file-powerpoint-outline-large';
import FileVideoOutlineLargeIcon from '@mattermost/compass-icons/components/file-video-outline-large';
import FileAudioOutlineLargeIcon from '@mattermost/compass-icons/components/file-audio-outline-large';

import styles from './IconSamples.module.scss';

type IconComp = ComponentType<{ size?: number }>;

interface CuratedIcon {
  icon: IconComp;
  name: string;
}

const CURATED: CuratedIcon[] = [
  { icon: HomeVariantOutlineIcon, name: 'Home' },
  { icon: AccountOutlineIcon, name: 'Account' },
  { icon: AccountMultipleOutlineIcon, name: 'People' },
  { icon: BellOutlineIcon, name: 'Notifications' },
  { icon: MagnifyIcon, name: 'Search' },
  { icon: CogOutlineIcon, name: 'Settings' },
  { icon: PencilOutlineIcon, name: 'Edit' },
  { icon: TrashCanOutlineIcon, name: 'Delete' },
  { icon: BookmarkOutlineIcon, name: 'Bookmark' },
  { icon: StarOutlineIcon, name: 'Favorite' },
  { icon: HeartOutlineIcon, name: 'Like' },
  { icon: EmailOutlineIcon, name: 'Email' },
  { icon: CalendarOutlineIcon, name: 'Calendar' },
  { icon: FolderOutlineIcon, name: 'Folder' },
  { icon: PaperclipIcon, name: 'Attach' },
  { icon: LinkVariantIcon, name: 'Link' },
  { icon: DownloadOutlineIcon, name: 'Download' },
  { icon: ShareVariantOutlineIcon, name: 'Share' },
  { icon: VideoOutlineIcon, name: 'Video' },
  { icon: GlobeIcon, name: 'Public' },
  { icon: PlusIcon, name: 'Add' },
  { icon: CloseIcon, name: 'Close' },
  { icon: CheckIcon, name: 'Confirm' },
  { icon: ChevronRightIcon, name: 'Next' },
  { icon: DotsVerticalIcon, name: 'More' },
];

interface IconShowcaseProps {
  /** Container size for each icon tile. Default 28. */
  size?: number;
}

export function IconShowcase({ size = 28 }: IconShowcaseProps) {
  return (
    <div className={styles['icon-grid']}>
      {CURATED.map(({ icon: Glyph, name }) => (
        <div key={name} className={styles['icon-grid__tile']}>
          <div className={styles['icon-grid__chip']}>
            <Glyph size={size} />
          </div>
          <span className={styles['icon-grid__label']}>{name}</span>
        </div>
      ))}
    </div>
  );
}

interface IconStylePair {
  outlined: IconComp;
  filled: IconComp;
  name: string;
}

const STYLE_PAIRS: IconStylePair[] = [
  { outlined: BookmarkOutlineIcon, filled: BookmarkIcon, name: 'Bookmark' },
  { outlined: StarOutlineIcon, filled: StarIcon, name: 'Star' },
];

export function IconStyleCompare() {
  return (
    <div className={styles['style-compare']}>
      <div className={styles['style-compare__col']}>
        <div className={styles['style-compare__heading']}>Outlined</div>
        <div className={styles['style-compare__hint']}>
          Default — use across the UI.
        </div>
        <div className={styles['style-compare__row']}>
          {STYLE_PAIRS.map(({ outlined: Glyph, name }) => (
            <div key={name} className={styles['style-compare__chip']}>
              <Glyph size={32} />
            </div>
          ))}
        </div>
      </div>
      <div className={styles['style-compare__col']}>
        <div className={styles['style-compare__heading']}>Filled</div>
        <div className={styles['style-compare__hint']}>
          Use sparingly — for active states and toggled-on indicators.
        </div>
        <div className={styles['style-compare__row']}>
          {STYLE_PAIRS.map(({ filled: Glyph, name }) => (
            <div key={name} className={styles['style-compare__chip']}>
              <Glyph size={32} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface FiletypeRow {
  label: string;
  size: number;
  icons: IconComp[];
}

const FILETYPES_SMALL: IconComp[] = [
  FileGenericOutlineIcon,
  FileWordOutlineIcon,
  FileExcelOutlineIcon,
  FilePowerpointOutlineIcon,
  FilePdfOutlineIcon,
  FileImageOutlineIcon,
  FileVideoOutlineIcon,
  FileAudioOutlineIcon,
];

const FILETYPES_LARGE: IconComp[] = [
  FileGenericOutlineLargeIcon,
  FileWordOutlineLargeIcon,
  FileExcelOutlineLargeIcon,
  FilePowerpointOutlineLargeIcon,
  FilePdfOutlineLargeIcon,
  FileImageOutlineLargeIcon,
  FileVideoOutlineLargeIcon,
  FileAudioOutlineLargeIcon,
];

const FILETYPE_ROWS: FiletypeRow[] = [
  {
    label: 'Small',
    size: 24,
    icons: FILETYPES_SMALL,
  },
  {
    label: 'Large',
    size: 56,
    icons: FILETYPES_LARGE,
  },
];

export function FiletypeShowcase() {
  return (
    <div className={styles['filetypes']}>
      {FILETYPE_ROWS.map(({ label, size, icons }) => (
        <div key={label} className={styles['filetypes__row']}>
          <div className={styles['filetypes__meta']}>
            <span className={styles['filetypes__label']}>{label}</span>
            <span className={styles['filetypes__hint']}>
              {label === 'Small'
                ? 'For attachment cards and inline lists'
                : 'For previews and large UI surfaces'}
            </span>
          </div>
          <div className={styles['filetypes__icons']}>
            {icons.map((Glyph, idx) => (
              <div key={idx} className={styles['filetypes__chip']}>
                <Glyph size={size} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

interface PrincipleProps {
  title: string;
  children: ReactNode;
}

export function Principle({ title, children }: PrincipleProps) {
  return (
    <div className={styles['principle']}>
      <div className={styles['principle__title']}>{title}</div>
      <div className={styles['principle__body']}>{children}</div>
    </div>
  );
}

export function PrincipleList({ children }: { children: ReactNode }) {
  return <div className={styles['principle-list']}>{children}</div>;
}
