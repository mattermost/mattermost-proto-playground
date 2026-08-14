import { useState } from 'react';
import GlobeIcon from '@mattermost/compass-icons/components/globe';
import avatarEmma from '@/assets/avatars/Emma Novak.png';
import avatarArjun from '@/assets/avatars/Arjun Patel.png';
import avatarSofia from '@/assets/avatars/Sofia Bauer.png';
import { Combobox, Icon, UserAvatar } from '@mattermost/compass-ui';
import type { ComboboxOption } from '@mattermost/compass-ui';
import styles from '@/styles/library-demo/components.module.scss';

const CHANNEL_OPTIONS: ComboboxOption[] = [
  { value: 'town-square', label: 'Town Square' },
  { value: 'off-topic', label: 'Off-Topic' },
  { value: 'design', label: 'Design' },
  { value: 'engineering', label: 'Engineering' },
  { value: 'releases', label: 'Releases' },
];

const PEOPLE_OPTIONS: ComboboxOption[] = [
  {
    value: 'emma',
    label: 'Emma Novak',
    secondaryLabel: '@emma',
    leadingAvatar: { src: avatarEmma, alt: 'Emma Novak' },
    leadingVisual: <UserAvatar src={avatarEmma} alt="Emma Novak" size="24" />,
  },
  {
    value: 'arjun',
    label: 'Arjun Patel',
    secondaryLabel: '@arjun',
    leadingAvatar: { src: avatarArjun, alt: 'Arjun Patel' },
    leadingVisual: <UserAvatar src={avatarArjun} alt="Arjun Patel" size="24" />,
  },
  {
    value: 'sofia',
    label: 'Sofia Bauer',
    secondaryLabel: '@sofia',
    leadingAvatar: { src: avatarSofia, alt: 'Sofia Bauer' },
    leadingVisual: <UserAvatar src={avatarSofia} alt="Sofia Bauer" size="24" />,
  },
];

function MultiPeopleCombobox() {
  const [value, setValue] = useState<string[]>(['emma', 'arjun']);
  return (
    <Combobox
      label="Invite people"
      placeholder="Search people…"
      multiple
      options={PEOPLE_OPTIONS}
      value={value}
      onChange={(next: string | string[] | null) =>
        setValue((next as string[]) ?? [])
      }
    />
  );
}

export default function ComboboxLibrary() {
  return (
    <>
      <div className={styles['components__button-block']}>
        <div className={styles['components__button-row']}>
          <span className={styles['components__instance-label']}>Sizes</span>
          <Combobox size="Small" label="Small" options={CHANNEL_OPTIONS} />
          <Combobox size="Medium" label="Medium" options={CHANNEL_OPTIONS} />
          <Combobox size="Large" label="Large" options={CHANNEL_OPTIONS} />
        </div>
        <div className={styles['components__button-row']}>
          <span className={styles['components__instance-label']}>Single</span>
          <Combobox
            label="Channel"
            placeholder="Search channels…"
            defaultValue="design"
            leadingIcon={<Icon glyph={<GlobeIcon />} size="16" />}
            options={CHANNEL_OPTIONS}
          />
        </div>
        <div className={styles['components__button-row']}>
          <span className={styles['components__instance-label']}>Multi</span>
          <MultiPeopleCombobox />
        </div>
        <div className={styles['components__button-row']}>
          <span className={styles['components__instance-label']}>States</span>
          <Combobox
            label="Invalid"
            invalid
            defaultValue="design"
            options={CHANNEL_OPTIONS}
          />
          <Combobox
            label="Disabled"
            disabled
            defaultValue="design"
            options={CHANNEL_OPTIONS}
          />
        </div>
      </div>
    </>
  );
}
