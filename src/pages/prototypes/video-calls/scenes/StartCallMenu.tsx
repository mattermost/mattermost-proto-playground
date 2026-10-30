import { useCallback, useEffect, useRef, useState } from 'react';
import HeadphonesIcon from '@mattermost/compass-icons/components/headphones';
import VideoOutlineIcon from '@mattermost/compass-icons/components/video-outline';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { useOutsideClose } from '@/hooks/useOutsideClose';
import { StartCallButton } from '../components/StartCallButton';
import { useVideoCall } from '../videoCallContext';

const OPTIONS = [
  {
    id: 'video',
    label: 'Start video call',
    icon: <Icon size="16" glyph={<VideoOutlineIcon />} />,
  },
  {
    id: 'audio',
    label: 'Start audio call',
    secondaryLabel: 'Camera off',
    icon: <Icon size="16" glyph={<HeadphonesIcon />} />,
  },
] as const;

/**
 * Header "Start call" button as a menu (video / audio). Owns the menu's open
 * state, outside click and Escape; picking an option starts the call.
 */
export default function StartCallMenu() {
  const { actions } = useVideoCall();
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

  return (
    <div ref={ref}>
      <StartCallButton
        icon={<Icon glyph={<VideoOutlineIcon />} />}
        options={OPTIONS}
        open={open}
        onOpenChange={setOpen}
        onSelect={(id) => {
          setOpen(false);
          actions.startCall({ audioOnly: id === 'audio' });
        }}
      />
    </div>
  );
}
