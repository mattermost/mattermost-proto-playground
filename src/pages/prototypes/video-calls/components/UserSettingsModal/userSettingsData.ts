export type CallsSectionId = 'audio' | 'screen' | 'video';

export type CallsSettingsValues = {
  microphone: string;
  speaker: string;
  shareSound: 'on' | 'off';
  camera: string;
  mirrorVideo: boolean;
  blurBackground: boolean;
};

export const DEFAULT_CALLS_SETTINGS: CallsSettingsValues = {
  microphone: 'yeti',
  speaker: 'default',
  shareSound: 'on',
  camera: 'webcam',
  mirrorVideo: true,
  blurBackground: false,
};

export const MICROPHONE_OPTIONS = [
  { value: 'yeti', label: 'Yeti Stereo Microphone (046d:0ab7)' },
  { value: 'macbook', label: 'MacBook Pro Microphone' },
  { value: 'airpods', label: 'AirPods Pro' },
];

export const SPEAKER_OPTIONS = [
  { value: 'default', label: 'Default - MacBook Pro Speakers' },
  { value: 'airpods', label: 'AirPods Pro' },
  { value: 'jabra', label: 'Jabra Evolve2 65' },
];

export const CAMERA_OPTIONS = [
  { value: 'webcam', label: 'Full HD webcam (1bcf:2284)' },
  { value: 'facetime', label: 'FaceTime HD Camera' },
];

export const CALLS_SECTIONS: {
  id: CallsSectionId;
  title: string;
  description: string;
}[] = [
  {
    id: 'audio',
    title: 'Audio devices',
    description: 'Set up audio devices to be used for Mattermost calls',
  },
  {
    id: 'screen',
    title: 'Screen sharing settings',
    description: 'Configure your screen sharing settings.',
  },
  {
    id: 'video',
    title: 'Video devices',
    description: 'Set up video devices to be used for Mattermost calls',
  },
];

/** Expanded-section titles differ from the collapsed rows (matches product). */
export const EXPANDED_TITLES: Record<CallsSectionId, string> = {
  audio: 'Audio devices',
  screen: 'Share sound with screen',
  video: 'Video devices',
};
