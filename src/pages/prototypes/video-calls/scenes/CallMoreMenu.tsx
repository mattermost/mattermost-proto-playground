import HandRightIcon from '@mattermost/compass-icons/components/hand-right';
import HandRightOutlineIcon from '@mattermost/compass-icons/components/hand-right-outline';
import MicrophoneIcon from '@mattermost/compass-icons/components/microphone';
import VideoOutlineIcon from '@mattermost/compass-icons/components/video-outline';
import ChevronRightIcon from '@mattermost/compass-icons/components/chevron-right';
import InformationOutlineIcon from '@mattermost/compass-icons/components/information-outline';
import MessageTextOutlineIcon from '@mattermost/compass-icons/components/message-text-outline';
import RecordCircleOutlineIcon from '@mattermost/compass-icons/components/record-circle-outline';
import RecordSquareOutlineIcon from '@mattermost/compass-icons/components/record-square-outline';
import VolumeHighIcon from '@mattermost/compass-icons/components/volume-high';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { MenuItem } from '@mattermost/compass-ui/components/menu-item';
import {
  PopoverMenu,
  PopoverMenuDivider,
} from '@mattermost/compass-ui/components/popover-menu';

export interface CallMoreMenuProps {
  open: boolean;
  recording: boolean;
  /** Label of the selected speaker, shown as the secondary label. */
  outputLabel: string;
  /** Raise / lower hand row; omitted where the surface has its own hand button. */
  handRaised?: boolean;
  onToggleHand?: () => void;
  /** Device rows (secondary label = selected device); omitted where the surface has chevron pickers. */
  micLabel?: string;
  onShowMic?: () => void;
  cameraLabel?: string;
  onShowCamera?: () => void;
  onShowOutput: () => void;
  onToggleRecording: () => void;
  onShowChat: () => void;
  onShowInfo: () => void;
}

/**
 * The call's "More" menu, shared by the widget and the window. Mirrors the
 * compass-proto `CallWidget` menu recipe (Audio output, Record call, Show chat
 * thread, Call info). Microphone and Camera rows are omitted because the
 * segmented controls already carry their device menus.
 */
export default function CallMoreMenu({
  open,
  recording,
  outputLabel,
  micLabel,
  onShowMic,
  cameraLabel,
  onShowCamera,
  handRaised = false,
  onToggleHand,
  onShowOutput,
  onToggleRecording,
  onShowChat,
  onShowInfo,
}: CallMoreMenuProps) {
  return (
    <PopoverMenu open={open} role="menu" aria-label="More options">
      {onShowMic && (
        <MenuItem
          role="menuitem"
          label="Microphone"
          secondaryLabel={micLabel}
          leadingVisual={<Icon size="16" glyph={<MicrophoneIcon />} />}
          trailingElement
          trailingVisual={<Icon size="16" glyph={<ChevronRightIcon />} />}
          onClick={onShowMic}
        />
      )}
      {onShowCamera && (
        <MenuItem
          role="menuitem"
          label="Camera"
          secondaryLabel={cameraLabel}
          leadingVisual={<Icon size="16" glyph={<VideoOutlineIcon />} />}
          trailingElement
          trailingVisual={<Icon size="16" glyph={<ChevronRightIcon />} />}
          onClick={onShowCamera}
        />
      )}
      <MenuItem
        role="menuitem"
        label="Audio output"
        secondaryLabel={outputLabel}
        leadingVisual={<Icon size="16" glyph={<VolumeHighIcon />} />}
        trailingElement
        trailingVisual={<Icon size="16" glyph={<ChevronRightIcon />} />}
        onClick={onShowOutput}
      />
      <PopoverMenuDivider />
      {onToggleHand && (
        <MenuItem
          role="menuitem"
          label={handRaised ? 'Lower hand' : 'Raise hand'}
          leadingVisual={
            <Icon
              size="16"
              glyph={handRaised ? <HandRightIcon /> : <HandRightOutlineIcon />}
            />
          }
          onClick={onToggleHand}
        />
      )}
      <MenuItem
        role="menuitem"
        label={recording ? 'Stop recording' : 'Record call'}
        leadingVisual={
          <Icon
            size="16"
            glyph={
              recording ? (
                <RecordSquareOutlineIcon />
              ) : (
                <RecordCircleOutlineIcon />
              )
            }
          />
        }
        onClick={onToggleRecording}
      />
      <MenuItem
        role="menuitem"
        label="Show chat thread"
        leadingVisual={<Icon size="16" glyph={<MessageTextOutlineIcon />} />}
        onClick={onShowChat}
      />
      <MenuItem
        role="menuitem"
        label="Call info"
        leadingVisual={<Icon size="16" glyph={<InformationOutlineIcon />} />}
        onClick={onShowInfo}
      />
    </PopoverMenu>
  );
}
