/**
 * Call sounds for the video-call prototype. Framework-free; no React.
 *
 * Sounds are disabled until the host calls setSoundsEnabled(true); the
 * prototype chrome does so (default on, with a toggle). Browsers block
 * audio before a user gesture, so play() rejections (NotAllowedError) are
 * swallowed silently.
 *
 * Files come from mattermost-plugin-calls and the Mattermost webapp (see
 * src/assets/sounds/README.md). The names follow the plugin: `join-self` when
 * you connect, `join-user` when someone else joins, `leave` (the plugin's
 * leave_self) when you hang up. 'ring-outgoing' is the plugin's ringback (looped, as
 * in the plugin); 'ring-incoming' is the webapp's default call ringtone (Calm). 'notification'
 * has no counterpart and is intentionally unmapped.
 */
import callRingtoneUrl from '@/assets/sounds/calls_calm.mp3';
import joinSelfUrl from '@/assets/sounds/join_self.mp3';
import joinUserUrl from '@/assets/sounds/join_user.mp3';
import leaveUrl from '@/assets/sounds/leave_self.mp3';
import ringbackUrl from '@/assets/sounds/ringback.mp3';

export type CallSoundName =
  | 'ring-incoming'
  | 'ring-outgoing'
  | 'join-self'
  | 'join-user'
  | 'leave'
  | 'notification';

type SoundDef = { url: string; volume?: number };

const SOUND_MAP: Partial<Record<CallSoundName, SoundDef>> = {
  'ring-incoming': { url: callRingtoneUrl },
  'ring-outgoing': { url: ringbackUrl },
  'join-self': { url: joinSelfUrl },
  'join-user': { url: joinUserUrl },
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
