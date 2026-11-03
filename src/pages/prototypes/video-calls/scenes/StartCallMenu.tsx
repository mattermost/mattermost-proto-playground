import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import CogOutlineIcon from '@mattermost/compass-icons/components/cog-outline';
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
};

/** How long the "Call link copied" notice stays. */
const NOTICE_MS = 3000;
/** Matches `--duration-quick` (the notice's fade). */
const NOTICE_EXIT_MS = 150;

/**
 * Opens User Settings on the Calls tab, where the pre-join setting lives. Below a
 * separator because it is not a way to call.
 */
const CALL_SETTINGS_OPTION: StartCallOption = {
  id: 'call-settings',
  label: 'Call settings',
  icon: <Icon size="16" glyph={<CogOutlineIcon />} />,
  dividerBefore: true,
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
  const { state, actions, startCallMenuOpen, setSettingsOpen } = useVideoCall();
  const { features, callContext } = state;
  const [open, setOpen] = useState(false);
  // A walkthrough step can hold the menu open; outside click and Escape stay off then.
  const menuOpen = startCallMenuOpen || open;
  const ref = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);
  useOutsideClose(ref, menuOpen && !startCallMenuOpen, close);
  useEffect(() => {
    if (!menuOpen || startCallMenuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [menuOpen, startCallMenuOpen]);

  // "Call link copied" confirmation, a Toast under the button (the call notice
  // stack only renders inside the call and is not used here).
  const [notice, setNotice] = useState<{
    message: string;
    tone: 'default' | 'error';
    icon?: ReactNode;
  } | null>(null);
  const [noticeOpen, setNoticeOpen] = useState(false);
  const noticeAnim = useExitAnimation(noticeOpen, NOTICE_EXIT_MS);
  useEffect(() => {
    if (!noticeOpen) return;
    const t = window.setTimeout(() => setNoticeOpen(false), NOTICE_MS);
    return () => window.clearTimeout(t);
  }, [noticeOpen]);

  const copyLink = async () => {
    let ok = true;
    try {
      await navigator.clipboard.writeText(INTERNAL_LINK);
    } catch {
      ok = false;
    }
    setNotice(
      ok
        ? {
            message: 'Call link copied',
            tone: 'default',
            icon: <ContentCopyIcon />,
          }
        : { message: "Couldn't copy call link", tone: 'error' },
    );
    setNoticeOpen(true);
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
    // Copy call link closes the Mattermost call group, directly under the
    // start options; the phone group follows it.
    const link = mattermost({ ...COPY_LINK_OPTION });
    return withPhone
      ? [...rows, link, PHONE_OPTION, CALL_SETTINGS_OPTION]
      : [...rows, link, CALL_SETTINGS_OPTION];
  }, [features.video, withPhone]);

  const start = (id: string) => {
    setOpen(false);
    if (id === 'copy-link') void copyLink();
    else if (id === 'call-settings') setSettingsOpen(true);
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
        open={menuOpen}
        onOpenChange={setOpen}
        onSelect={start}
        menuFocusId={menuOpen ? 'start-call-menu' : undefined}
      />
      {noticeAnim.rendered && notice && (
        <div
          className={[
            styles['start-call-menu__notice'],
            noticeAnim.exiting && styles['start-call-menu__notice--exiting'],
          ]
            .filter(Boolean)
            .join(' ')}
          role="status"
        >
          <Toast
            type={notice.tone === 'error' ? 'danger' : 'success'}
            icon={notice.icon ? <Icon glyph={notice.icon} /> : undefined}
            message={notice.message}
            onDismiss={() => setNoticeOpen(false)}
          />
        </div>
      )}
    </div>
  );
}
