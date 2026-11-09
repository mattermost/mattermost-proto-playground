export type CallsSectionId = 'audio' | 'screen' | 'video';

export type CallsSettingsValues = {
  microphone: string;
  speaker: string;
  shareSound: 'on' | 'off';
  camera: string;
  mirrorVideo: boolean;
  blurBackground: boolean;
};

/** Fields stored locally; device ids live in the call's MediaPrefs. */
export type DeviceField = 'microphone' | 'speaker' | 'camera';

export const DEFAULT_LOCAL_SETTINGS: Omit<CallsSettingsValues, DeviceField> = {
  shareSound: 'on',
  mirrorVideo: true,
  blurBackground: false,
};

export type DeviceOption = { value: string; label: string };

/** Used when the browser lists no devices (no permission, or no hardware). */
export const FALLBACK_MICROPHONES: DeviceOption[] = [
  { value: 'fallback-mic-1', label: 'Default microphone' },
  { value: 'fallback-mic-2', label: 'External USB microphone' },
];

export const FALLBACK_SPEAKERS: DeviceOption[] = [
  { value: 'fallback-speaker-1', label: 'Default speakers' },
  { value: 'fallback-speaker-2', label: 'External speakers' },
];

export const FALLBACK_CAMERAS: DeviceOption[] = [
  { value: 'fallback-camera-1', label: 'Built-in camera' },
  { value: 'fallback-camera-2', label: 'External webcam' },
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
