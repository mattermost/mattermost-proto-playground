/**
 * Call sounds for the video-call prototype. Framework-free; no React.
 *
* Sounds are disabled until the host calls setSoundsEnabled(true); the
 * prototype chrome does so (default on, with a toggle). Browsers block
 * audio before a user gesture, so play() rejections (NotAllowedError) are
 * swallowed silently.
 *
 * Files come from mattermost-plugin-calls (see src/assets/sounds/README.md).
 * The plugin ships only `ringback` (no distinct incoming ringtone), so
 * 'ring-incoming' reuses it at full volume and 'ring-outgoing' reuses it at a
 * lower volume. 'notification' has no counterpart and is intentionally unmapped.
 */
import ringbackUrl from '@/assets/sounds/ringback.mp3';
import joinUrl from '@/assets/sounds/join_user.mp3';
import leaveUrl from '@/assets/sounds/leave_self.mp3';

export type CallSoundName =
  'ring-incoming' | 'ring-outgoing' | 'join' | 'leave' | 'notification';

type SoundDef = { url: string; volume?: number };

const SOUND_MAP: Partial<Record<CallSoundName, SoundDef>> = {
  'ring-incoming': { url: ringbackUrl },
  'ring-outgoing': { url: ringbackUrl, volume: 0.5 },
  join: { url: joinUrl },
  leave: { url: leaveUrl },
};

let enabled = false;
const playing = new Map<CallSoundName, HTMLAudioElement>();

function release(name: CallSoundName) {
  const el = playing.get(name);
  if (!el) {
    return;
  }
  playing.delete(name);
  el.onended = null;
  el.pause();
  el.removeAttribute('src');
  el.load();
}

export function stopSound(name?: CallSoundName): void {
  if (name) {
    release(name);
    return;
  }
  Array.from(playing.keys()).forEach(release);
}

export function playSound(
  name: CallSoundName,
  opts: { loop?: boolean } = {},
): void {
  const def = SOUND_MAP[name];
  if (!enabled || !def || typeof Audio === 'undefined') {
    return;
  }
  release(name); // never leak or stack elements for the same sound
  const el = new Audio(def.url);
  el.loop = Boolean(opts.loop);
  el.volume = def.volume ?? 1;
  playing.set(name, el);
  el.onended = () => {
    if (playing.get(name) === el) {
      release(name);
    }
  };
  try {
    el.play().catch(() => {
      // Autoplay blocked or aborted: fail silently.
      if (playing.get(name) === el) {
        release(name);
      }
    });
  } catch {
    release(name);
  }
}

export function setSoundsEnabled(value: boolean): void {
  enabled = value;
  if (!value) {
    stopSound();
  }
}

export function isSoundsEnabled(): boolean {
  return enabled;
}
