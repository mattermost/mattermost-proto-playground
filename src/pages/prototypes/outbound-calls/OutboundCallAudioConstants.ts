import type { ComponentType, SVGProps } from 'react';
import VolumeHighIcon from '@mattermost/compass-icons/components/volume-high';
import HeadphonesIcon from '@mattermost/compass-icons/components/headphones';
import CellphoneIcon from '@mattermost/compass-icons/components/cellphone';
import type { AudioDevice, AudioDeviceKind } from '@/types/outboundCall';

export const AUDIO_DEVICES: AudioDevice[] = [
  { id: 'laptop', label: 'MacBook Pro Speakers', kind: 'laptop' },
  { id: 'airpods', label: 'AirPods Pro', kind: 'headphones' },
  { id: 'jabra', label: 'Jabra Evolve2 65', kind: 'external' },
  { id: 'iphone', label: 'iPhone (Handoff)', kind: 'phone' },
];

type CompassIcon = ComponentType<SVGProps<SVGSVGElement> & { size?: number }>;

export const AUDIO_ICON: Record<AudioDeviceKind, CompassIcon> = {
  laptop: VolumeHighIcon,
  headphones: HeadphonesIcon,
  external: HeadphonesIcon,
  phone: CellphoneIcon,
};
