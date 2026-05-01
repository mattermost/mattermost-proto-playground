import type { ReactNode } from 'react';
import BookmarkOutlineIcon from '@mattermost/compass-icons/components/bookmark-outline';
import EmailOutlineIcon from '@mattermost/compass-icons/components/email-outline';
import PinOutlineIcon from '@mattermost/compass-icons/components/pin-outline';
import LinkVariantIcon from '@mattermost/compass-icons/components/link-variant';
import DotsHorizontalIcon from '@mattermost/compass-icons/components/dots-horizontal';
import ArrowUpIcon from '@mattermost/compass-icons/components/arrow-up';
import ChevronUpIcon from '@mattermost/compass-icons/components/chevron-up';
import ChevronDownIcon from '@mattermost/compass-icons/components/chevron-down';
import ArrowDownIcon from '@mattermost/compass-icons/components/arrow-down';
import Chip from '@/components/ui/Chip/Chip';
import Icon from '@/components/ui/Icon/Icon';
import MenuItem from '@/components/ui/MenuItem/MenuItem';
import styles from './ElevationSamples.module.scss';

interface ElevationStep {
  level: number;
  token?: string;
  summary: string;
  uses: string[];
}

const ELEVATION_STEPS: ElevationStep[] = [
  {
    level: 0,
    summary: 'The default surface; no shadow applied.',
    uses: [],
  },
  {
    level: 1,
    token: '--elevation-1',
    summary: 'Subtle lift off the base',
    uses: ['Message Hover Actions', 'Message Attachments', 'Cards'],
  },
  {
    level: 2,
    token: '--elevation-2',
    summary: 'Hovered state of Level 1 surfaces',
    uses: ['Message Attachments Hover', 'Cards Hover'],
  },
  {
    level: 3,
    token: '--elevation-3',
    summary: 'Transient surface above content',
    uses: ['Tooltip'],
  },
  {
    level: 4,
    token: '--elevation-4',
    summary: 'Floating menus and popovers',
    uses: [
      'Popover Parent Menu',
      'Channel Member Popover',
      'Profile Popover',
      'Status Popover',
      'Emoji Popover',
      'Autocomplete Popover Menus',
    ],
  },
  {
    level: 5,
    token: '--elevation-5',
    summary: 'Stacked above a Level 4 surface',
    uses: ['Popover Child Menu'],
  },
  {
    level: 6,
    token: '--elevation-6',
    summary: 'Page-blocking surfaces',
    uses: ['Modals'],
  },
];

export function ElevationScale() {
  return (
    <div className={styles['scale']}>
      {ELEVATION_STEPS.map(({ level, token, summary, uses }) => (
        <div key={level} className={styles['scale__row']}>
          <div className={styles['scale__stage']}>
            <div
              className={styles['scale__tile']}
              style={token ? { boxShadow: `var(${token})` } : undefined}
            >
              <span className={styles['scale__tile-level']}>{level}</span>
            </div>
          </div>
          <div className={styles['scale__meta']}>
            <div className={styles['scale__heading']}>
              <span className={styles['scale__name']}>Elevation {level}</span>
              {token && (
                <code className={styles['scale__token']}>{token}</code>
              )}
            </div>
            <div className={styles['scale__summary']}>{summary}</div>
            {uses.length > 0 && (
              <div className={styles['scale__uses']}>
                {uses.map((use) => (
                  <Chip key={use} size="Small">
                    {use}
                  </Chip>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

interface PopoverProps {
  level: 4 | 5;
  title: string;
  className?: string;
  children: ReactNode;
}

function PopoverCard({ level, title, className, children }: PopoverProps) {
  const cls = [styles['popover'], className].filter(Boolean).join(' ');
  return (
    <div className={cls} style={{ boxShadow: `var(--elevation-${level})` }}>
      <div className={styles['popover__label']}>Elevation {level}</div>
      <div className={styles['popover__title']}>{title}</div>
      <div className={styles['popover__items']}>{children}</div>
    </div>
  );
}

export function ElevationPopoverExample() {
  return (
    <div className={styles['stage']}>
      <div className={styles['stage__surface']} aria-hidden="true">
        <div className={styles['stage__line']} style={{ width: '60%' }} />
        <div className={styles['stage__line']} style={{ width: '85%' }} />
        <div className={styles['stage__line']} style={{ width: '45%' }} />
        <div className={styles['stage__line']} style={{ width: '72%' }} />
      </div>

      <PopoverCard
        level={4}
        title="Parent menu"
        className={styles['stage__parent']}
      >
        <MenuItem
          label="Mark as unread"
          leadingVisual={<Icon size="16" glyph={<EmailOutlineIcon />} />}
        />
        <MenuItem
          label="Save message"
          leadingVisual={<Icon size="16" glyph={<BookmarkOutlineIcon />} />}
        />
        <MenuItem
          label="Pin to channel"
          leadingVisual={<Icon size="16" glyph={<PinOutlineIcon />} />}
        />
        <MenuItem
          label="Copy link"
          leadingVisual={<Icon size="16" glyph={<LinkVariantIcon />} />}
        />
        <MenuItem
          label="More actions"
          leadingVisual={<Icon size="16" glyph={<DotsHorizontalIcon />} />}
        />
      </PopoverCard>

      <PopoverCard
        level={5}
        title="Child menu"
        className={styles['stage__child']}
      >
        <MenuItem
          label="Move to top"
          leadingVisual={<Icon size="16" glyph={<ArrowUpIcon />} />}
        />
        <MenuItem
          label="Move up"
          leadingVisual={<Icon size="16" glyph={<ChevronUpIcon />} />}
        />
        <MenuItem
          label="Move down"
          leadingVisual={<Icon size="16" glyph={<ChevronDownIcon />} />}
        />
        <MenuItem
          label="Move to bottom"
          leadingVisual={<Icon size="16" glyph={<ArrowDownIcon />} />}
        />
      </PopoverCard>
    </div>
  );
}
