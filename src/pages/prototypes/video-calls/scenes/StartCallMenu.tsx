import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ContentCopyIcon from '@mattermost/compass-icons/components/content-copy';
import HeadphonesIcon from '@mattermost/compass-icons/components/headphones';
import PhoneIcon from '@mattermost/compass-icons/components/phone';
import VideoOutlineIcon from '@mattermost/compass-icons/components/video-outline';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { Toast } from '@mattermost/compass-ui/components/toast';
import { INTERNAL_LINK } from '@/fixtures/calls/callConstants';
import { useExitAnimation } from '@/hooks/useExitAnimation';
import { useOutsideClose } from '@/hooks/useOutsideClose';
import { CallHeaderButton } from '../components/CallHeaderButton';
import {
  StartCallButton,
  type StartCallOption,
} from '../components/StartCallButton';
import { useVideoCall } from '../videoCallContext';
import { PHONE_NUMBER } from '../videoCallsData';
import styles from './StartCallMenu.module.scss';

const VIDEO_OPTION: StartCallOption = {
  id: 'video',
  label: 'Start video call',
  icon: <Icon size="16" glyph={<VideoOutlineIcon />} />,
};

const AUDIO_OPTION: StartCallOption = {
  id: 'audio',
  label: 'Start audio call',
  icon: <Icon size="16" glyph={<HeadphonesIcon />} />,
};

/** Copies the call link without starting a call. Mattermost calls only. */
const COPY_LINK_OPTION: StartCallOption = {
  id: 'copy-link',
  label: 'Copy call link',
  icon: <Icon size="16" glyph={<ContentCopyIcon />} />,
  dividerBefore: true,
};

/** How long the "Call link copied" toast stays. */
const TOAST_MS = 3000;
/** Matches `--duration-quick` (the toast's fade). */
const TOAST_EXIT_MS = 150;

const PHONE_OPTION: StartCallOption = {
  id: 'phone',
  label: `Call ${PHONE_NUMBER.label}`,
  secondaryLabel: PHONE_NUMBER.number,
  icon: <Icon size="16" glyph={<PhoneIcon />} />,
  group: 'Phone call',
};

/**
 * The header call button: an icon-only phone that follows the conversation's
 * call state.
 *
 * - No call: "Start call", always a menu: Start video call (video on), Start
 *   audio call, Copy call link (copies the link, starts nothing), and in a DM
 *   a "Phone call" group with the number.
 * - A group / channel call is running without you: a green "Join call".
 * - You are ringing, setting up or in the call: a green, pressed "In call"
 *   (no action).
 *
 * Owns the menu's open state, outside click and Escape; picking an option
 * starts the call.
 */
export default function StartCallMenu() {
  const { state, actions } = useVideoCall();
  const { features, callContext } = state;
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);
  useOutsideClose(ref, open, close);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  // "Call link copied" confirmation. The call notice stack only renders inside
  // the call window, so the conversation shows its own toast under the button.
  const [toast, setToast] = useState<{ ok: boolean } | null>(null);
  const [toastOpen, setToastOpen] = useState(false);
  const toastAnim = useExitAnimation(toastOpen, TOAST_EXIT_MS);
  useEffect(() => {
    if (!toastOpen) return;
    const t = window.setTimeout(() => setToastOpen(false), TOAST_MS);
    return () => window.clearTimeout(t);
  }, [toastOpen]);

  const copyLink = async () => {
    let ok = true;
    try {
      await navigator.clipboard.writeText(INTERNAL_LINK);
    } catch {
      ok = false;
    }
    setToast({ ok });
    setToastOpen(true);
  };

  const withPhone = features.phone && callContext === 'dm';
  const options = useMemo<StartCallOption[]>(() => {
    // Group headings only appear once there are two groups to tell apart.
    const mattermost = (o: StartCallOption): StartCallOption => ({
      ...o,
      group: withPhone ? 'Mattermost call' : undefined,
    });
    const rows = features.video
      ? [
          mattermost({ ...VIDEO_OPTION }),
          mattermost({ ...AUDIO_OPTION, secondaryLabel: 'Camera off' }),
        ]
      : [mattermost({ ...AUDIO_OPTION })];
    // Copy call link closes the Mattermost call group (below a divider); the
    // phone group follows it.
    const link = mattermost({ ...COPY_LINK_OPTION });
    return withPhone ? [...rows, link, PHONE_OPTION] : [...rows, link];
  }, [features.video, withPhone]);

  const start = (id: string) => {
    setOpen(false);
    if (id === 'copy-link') void copyLink();
    else if (id === 'phone') actions.startCall({ phone: true });
    else
      actions.startCall({
        audioOnly: id === 'audio',
        video: id === 'video',
      });
  };

  // A call is running without you (group / channel): join it.
  if (state.phase === 'ongoing') {
    return (
      <CallHeaderButton
        state="join"
        label="Join call"
        onClick={() => actions.startCall()}
      />
    );
  }

  // You are ringing, setting up or in the call: the button shows it is live.
  if (state.phase !== 'idle') {
    return <CallHeaderButton state="in-call" label="In call" />;
  }

  return (
    <div ref={ref} className={styles['start-call-menu']}>
      <StartCallButton
        options={options}
        open={open}
        onOpenChange={setOpen}
        onSelect={start}
      />
      {toastAnim.rendered && toast && (
        <div
          className={[
            styles['start-call-menu__toast'],
            toastAnim.exiting && styles['start-call-menu__toast--exiting'],
          ]
            .filter(Boolean)
            .join(' ')}
          role="status"
        >
          <Toast
            type={toast.ok ? 'success' : 'danger'}
            message={toast.ok ? 'Call link copied' : "Couldn't copy call link"}
          />
        </div>
      )}
    </div>
  );
}
