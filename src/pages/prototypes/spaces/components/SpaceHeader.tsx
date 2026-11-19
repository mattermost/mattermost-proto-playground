import type { ReactNode } from 'react';
import { Tabs } from '@mattermost/compass-ui/components/tabs';
import { Tag } from '@mattermost/compass-ui/components/tag';
import { UserAvatarGroup } from '@mattermost/compass-ui/components/user-avatar-group';
import { Icon } from '@mattermost/compass-ui/components/icon';
import LayersOutlineIcon from '@mattermost/compass-icons/components/layers-outline';
import {
  HEALTH_LABEL,
  HEALTH_TAG,
  PEOPLE,
  SPACE,
  type Health,
} from '../spacesData';
import styles from './SpaceHeader.module.scss';

export type SpaceTab = 'overview' | 'board' | 'pages';

export interface SpaceHeaderProps {
  health: Health;
  lifecycle: (typeof SPACE.lifecycle)[number];
  tab: SpaceTab;
  onTabChange: (tab: SpaceTab) => void;
  boardCount: number;
  /** Shown at the right of the title row (e.g. viewing-as chip). */
  aside?: ReactNode;
}

const MEMBERS = [
  'jthomas',
  'ataylor',
  'kchegg',
  'mcruz',
  'hanas',
  'hstevens',
  'admin',
  'aarthur',
  'rhull',
  'areid',
  'wdaniel',
  'amccall',
];

export function SpaceHeader({
  health,
  lifecycle,
  tab,
  onTabChange,
  boardCount,
  aside,
}: SpaceHeaderProps) {
  const current = SPACE.lifecycle.indexOf(lifecycle);
  return (
    <header className={styles['space-header']}>
      <div className={styles['space-header__eyebrow']}>
        <Icon glyph={<LayersOutlineIcon />} size="16" />
        <span>Space · {SPACE.type}</span>
      </div>
      <div className={styles['space-header__title-row']}>
        <h1 className={styles['space-header__title']}>{SPACE.name}</h1>
        <Tag
          label={HEALTH_LABEL[health]}
          type={HEALTH_TAG[health]}
          size="small"
        />
        <div className={styles['space-header__aside']}>{aside}</div>
      </div>
      <p className={styles['space-header__outcome']}>{SPACE.outcome}</p>
      <div className={styles['space-header__meta']}>
        <ol
          className={styles['space-header__lifecycle']}
          aria-label="Lifecycle"
        >
          {SPACE.lifecycle.map((step, i) => (
            <li
              key={step}
              className={`${styles['space-header__step']} ${
                i < current ? styles['space-header__step--past'] : ''
              } ${i === current ? styles['space-header__step--current'] : ''}`}
              aria-current={i === current ? 'step' : undefined}
            >
              {step}
            </li>
          ))}
        </ol>
        <span className={styles['space-header__fact']}>
          Lead <strong>{PEOPLE[SPACE.leadId]!.name}</strong>
        </span>
        <span className={styles['space-header__fact']}>
          Sponsor <strong>{PEOPLE[SPACE.sponsorId]!.name}</strong>
        </span>
        <span className={styles['space-header__fact']}>
          Target end <strong>{SPACE.targetEnd}</strong>
        </span>
        <UserAvatarGroup
          size="24"
          max={5}
          avatars={MEMBERS.map((id) => ({
            key: id,
            src: PEOPLE[id]!.avatar,
            name: PEOPLE[id]!.name,
          }))}
        />
      </div>
      <Tabs
        appearance="underlined"
        activeKey={tab}
        onChange={(key) => onTabChange(key as SpaceTab)}
        tabs={[
          { key: 'overview', label: 'Overview' },
          { key: 'board', label: 'Campaign board', countBadge: boardCount },
          { key: 'pages', label: 'Pages and library' },
        ]}
      />
    </header>
  );
}
