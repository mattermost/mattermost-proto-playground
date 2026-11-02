import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import HeadphonesIcon from '@mattermost/compass-icons/components/headphones';
import PhoneIcon from '@mattermost/compass-icons/components/phone';
import VideoOutlineIcon from '@mattermost/compass-icons/components/video-outline';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { useOutsideClose } from '@/hooks/useOutsideClose';
import { CallHeaderButton } from '../components/CallHeaderButton';
import {
  StartCallButton,
  type StartCallOption,
} from '../components/StartCallButton';
import { useVideoCall } from '../videoCallContext';
import { PHONE_NUMBER } from '../videoCallsData';

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
 * - No call: "Start call". With video or phone on it opens a menu (Start video
 *   call, Start audio call; in a DM a "Phone call" group with the number). With
 *   only one way to call (video off, no phone) there is no chevron or menu and
 *   a click starts the call.
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
    return withPhone ? [...rows, PHONE_OPTION] : rows;
  }, [features.video, withPhone]);

  const start = (id: string) => {
    setOpen(false);
    if (id === 'phone') actions.startCall({ phone: true });
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

  // One way to call (video off, no phone): no menu, just Start call.
  if (options.length === 1) {
    return (
      <CallHeaderButton
        state="start"
        label="Start call"
        onClick={() => start(options[0].id)}
      />
    );
  }

  return (
    <div ref={ref}>
      <StartCallButton
        options={options}
        open={open}
        onOpenChange={setOpen}
        onSelect={start}
      />
    </div>
  );
}
