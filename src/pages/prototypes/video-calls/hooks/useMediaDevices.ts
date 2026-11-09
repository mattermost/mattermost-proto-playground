import { useCallback, useEffect, useState } from 'react';

export interface MediaDeviceOption {
  deviceId: string;
  label: string;
}

export interface UseMediaDevicesResult {
  microphones: MediaDeviceOption[];
  cameras: MediaDeviceOption[];
  speakers: MediaDeviceOption[];
  refresh: () => void;
  supportsSinkId: boolean;
}

const EMPTY: Pick<
  UseMediaDevicesResult,
  'microphones' | 'cameras' | 'speakers'
> = {
  microphones: [],
  cameras: [],
  speakers: [],
};

function toOptions(
  devices: MediaDeviceInfo[],
  kind: MediaDeviceKind,
  fallback: string,
) {
  return devices
    .filter((d) => d.kind === kind)
    .map((d, i) => ({
      deviceId: d.deviceId,
      label: d.label || `${fallback} ${i + 1}`,
    }));
}

/**
 * Lists audio/video devices for the pre-join and settings pickers. Enumeration
 * only, never prompts: labels stay generic until the host has permission.
 */
export function useMediaDevices({
  enabled,
}: {
  enabled: boolean;
}): UseMediaDevicesResult {
  const [lists, setLists] = useState(EMPTY);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);

  useEffect(() => {
    const md =
      typeof navigator !== 'undefined' ? navigator.mediaDevices : undefined;
    if (!enabled || !md || typeof md.enumerateDevices !== 'function') return;

    let cancelled = false;
    const load = () => {
      md.enumerateDevices()
        .then((devices) => {
          if (cancelled) return;
          setLists({
            microphones: toOptions(devices, 'audioinput', 'Microphone'),
            cameras: toOptions(devices, 'videoinput', 'Camera'),
            speakers: toOptions(devices, 'audiooutput', 'Speaker'),
          });
        })
        .catch(() => {
          if (!cancelled) setLists(EMPTY);
        });
    };
    load();
    md.addEventListener?.('devicechange', load);
    return () => {
      cancelled = true;
      md.removeEventListener?.('devicechange', load);
    };
  }, [enabled, tick]);

  const supportsSinkId =
    typeof HTMLMediaElement !== 'undefined' &&
    'setSinkId' in HTMLMediaElement.prototype;

  return { ...lists, refresh, supportsSinkId };
}
