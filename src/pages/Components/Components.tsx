import UserAvatar from '@/components/ui/UserAvatar/UserAvatar';
import Button from '@/components/ui/Button/Button';
import ChannelSidebarItem from '@/components/ui/ChannelSidebarItem/ChannelSidebarItem';
import Checkbox from '@/components/ui/Checkbox/Checkbox';
import Chip from '@/components/ui/Chip/Chip';
import Radio from '@/components/ui/Radio/Radio';
import Switch from '@/components/ui/Switch/Switch';
import StatusBadge from '@/components/ui/StatusBadge/StatusBadge';
import Emoji from '@/components/ui/Emoji/Emoji';
import Icon from '@/components/ui/Icon/Icon';
import IconButton, {
  ICON_BUTTON_ICON_SIZES,
} from '@/components/ui/IconButton/IconButton';
import TextInput from '@/components/ui/TextInput/TextInput';
import Illustration from '@/components/ui/Illustration/Illustration';
import Spinner from '@/components/ui/Spinner/Spinner';
import LabelTag from '@/components/ui/LabelTag/LabelTag';
import Divider from '@/components/ui/Divider/Divider';
import MentionBadge from '@/components/ui/MentionBadge/MentionBadge';
import MenuItem from '@/components/ui/MenuItem/MenuItem';
import MessageHeader from '@/components/ui/MessageHeader/MessageHeader';
import ActionButton from '@/components/ui/ActionButton/ActionButton';
import AttachmentCard from '@/components/ui/AttachmentCard';
import AppBarItem from '@/components/ui/AppBarItem/AppBarItem';
import CallParticipantAvatar from '@/components/ui/CallParticipantAvatar/CallParticipantAvatar';
import ChannelInfoMsgHeader from '@/components/ui/ChannelInfoMsgHeader/ChannelInfoMsgHeader';
import DateRangePicker from '@/components/ui/DateRangePicker/DateRangePicker';
import Dropdown from '@/components/ui/Dropdown/Dropdown';
import EmptyState from '@/components/ui/EmptyState/EmptyState';
import ErrorMessage from '@/components/ui/ErrorMessage/ErrorMessage';
import FeatureDiscoveryPanel from '@/components/ui/FeatureDiscoveryPanel/FeatureDiscoveryPanel';
import GlobalBanner from '@/components/ui/GlobalBanner/GlobalBanner';
import ImagePreview from '@/components/ui/ImagePreview/ImagePreview';
import LinkPreview from '@/components/ui/LinkPreview/LinkPreview';
import MessageActions from '@/components/ui/MessageActions/MessageActions';
import MessageReactions from '@/components/ui/MessageReactions/MessageReactions';
import MessageSeparator from '@/components/ui/MessageSeparator/MessageSeparator';
import MoreUnreadsBanner from '@/components/ui/MoreUnreadsBanner/MoreUnreadsBanner';
import NewMessageBanner from '@/components/ui/NewMessageBanner/NewMessageBanner';
import PaginationDots from '@/components/ui/PaginationDots/PaginationDots';
import PermalinkPreview from '@/components/ui/PermalinkPreview/PermalinkPreview';
import PopoverNotice from '@/components/ui/PopoverNotice/PopoverNotice';
import ProgressBar from '@/components/ui/ProgressBar/ProgressBar';
import ReactionPill from '@/components/ui/ReactionPill/ReactionPill';
import RecordingPill from '@/components/ui/RecordingPill/RecordingPill';
import Scrollbar from '@/components/ui/Scrollbar/Scrollbar';
import SearchInput from '@/components/ui/SearchInput/SearchInput';
import SearchTipBanner from '@/components/ui/SearchTipBanner/SearchTipBanner';
import SectionNotice from '@/components/ui/SectionNotice/SectionNotice';
import Select from '@/components/ui/Select/Select';
import Tabs from '@/components/ui/Tabs/Tabs';
import Tags from '@/components/ui/Tags/Tags';
import TeamAvatar from '@/components/ui/TeamAvatar/TeamAvatar';
import TextArea from '@/components/ui/TextArea/TextArea';
import ThreadFooter from '@/components/ui/ThreadFooter/ThreadFooter';
import ThreadListItem from '@/components/ui/ThreadListItem/ThreadListItem';
import ToastBanner from '@/components/ui/ToastBanner/ToastBanner';
import Tooltip from '@/components/ui/Tooltip/Tooltip';
import UnreadBadge from '@/components/ui/UnreadBadge/UnreadBadge';
import UserAvatarGroup from '@/components/ui/UserAvatarGroup/UserAvatarGroup';
import GlobeIcon from '@mattermost/compass-icons/components/globe';
import EmoticonHappyOutlineIcon from '@mattermost/compass-icons/components/emoticon-happy-outline';
import StarOutlineIcon from '@mattermost/compass-icons/components/star-outline';
import LightbulbOutlineIcon from '@mattermost/compass-icons/components/lightbulb-outline';
import StarIcon from '@mattermost/compass-icons/components/star';
import BellOutlineIcon from '@mattermost/compass-icons/components/bell-outline';
import BellOffOutlineIcon from '@mattermost/compass-icons/components/bell-off-outline';
import TrashCanOutlineIcon from '@mattermost/compass-icons/components/trash-can-outline';
import LinkVariantIcon from '@mattermost/compass-icons/components/link-variant';
import AICopilotIllustration from '@/assets/illustrations/ai-copilot-intro.svg?react';
import GroupsIllustration from '@/assets/illustrations/groups.svg?react';
import SearchIllustration from '@/assets/illustrations/search.svg?react';
import avatarLeonard from '@/assets/avatars/Leonard Riley.png';
import avatarStaffTeam from '@/assets/avatars/Staff Team.png';
import avatarDanielle from '@/assets/avatars/Danielle Okoro.png';
import avatarMarco from '@/assets/avatars/Marco Rinaldi.png';
import avatarEmma from '@/assets/avatars/Emma Novak.png';
import avatarSofia from '@/assets/avatars/Sofia Bauer.png';
import styles from './Components.module.scss';

export default function Components() {
  return (
    <div className={styles.components}>
      <header className={styles['components__header']}>
        <h1 className={styles['components__heading']}>Components</h1>
        <p className={styles['components__subheading']}>
          Use this page to add and test component instances. Copy any block
          below to try different props or add new components.
        </p>
      </header>

      <section className={styles['components__section']}>
        <h2 className={styles['components__section-title']}>Action Button</h2>
        <div className={styles['components__button-block']}>
          <div className={styles['components__button-row']}>
            <span className={styles['components__instance-label']}>
              Default
            </span>
            <ActionButton
              icon={<EmoticonHappyOutlineIcon size={20} />}
              label="Action"
              aria-label="Action"
            />
            <ActionButton
              icon={<StarOutlineIcon size={20} />}
              label="Favorite"
              aria-label="Favorite"
            />
            <ActionButton
              icon={<BellOutlineIcon size={20} />}
              label="Mute"
              aria-label="Mute"
            />
            <ActionButton
              icon={<LinkVariantIcon size={20} />}
              label="Copy Link"
              aria-label="Copy link"
            />
          </div>
          <div className={styles['components__button-row']}>
            <span className={styles['components__instance-label']}>Active</span>
            <ActionButton
              icon={<EmoticonHappyOutlineIcon size={20} />}
              label="Action"
              aria-label="Action"
              active
            />
            <ActionButton
              icon={<StarIcon size={20} />}
              label="Favorited"
              aria-label="Favorited"
              active
            />
            <ActionButton
              icon={<BellOffOutlineIcon size={20} />}
              label="Muted"
              aria-label="Muted"
              active
            />
          </div>
          <div className={styles['components__button-row']}>
            <span className={styles['components__instance-label']}>
              Destructive
            </span>
            <ActionButton
              icon={<TrashCanOutlineIcon size={20} />}
              label="Delete"
              aria-label="Delete"
              destructive
            />
          </div>
          <div className={styles['components__button-row']}>
            <span className={styles['components__instance-label']}>
              Disabled
            </span>
            <ActionButton
              icon={<EmoticonHappyOutlineIcon size={20} />}
              label="Action"
              aria-label="Action"
              disabled
            />
          </div>
        </div>
      </section>

      <section className={styles['components__section']}>
        <h2 className={styles['components__section-title']}>App Bar Item</h2>
        <div className={styles['components__button-block']}>
          <div className={styles['components__button-row']}>
            <span className={styles['components__instance-label']}>States</span>
            <AppBarItem
              icon={<EmoticonHappyOutlineIcon size={20} />}
              label="Emoji"
              state="Default"
            />
            <AppBarItem
              icon={<GlobeIcon size={20} />}
              label="Channels"
              state="Selected"
            />
          </div>
          <div className={styles['components__button-row']}>
            <span className={styles['components__instance-label']}>Badges</span>
            <AppBarItem
              icon={<BellOutlineIcon size={20} />}
              label="Notifications"
              mentionBadge={3}
            />
            <AppBarItem
              icon={<StarOutlineIcon size={20} />}
              label="Favorites"
              unreadBadge
            />
          </div>
        </div>
      </section>

      <section className={styles['components__section']}>
        <h2 className={styles['components__section-title']}>Attachment Card</h2>
        <div className={styles['components__row']}>
          <AttachmentCard
            fileName="Filename_goes_here.txt"
            fileMeta="TXT 15KB"
            fileType="text"
          />
          <AttachmentCard
            fileName="Filename_goes_here.docx"
            fileMeta="DOCX 2.4MB"
            fileType="word"
            channelTag="UX Design"
            dateTimeStamp="Sep 24 5:14 PM"
          />
          <AttachmentCard
            fileName="Spreadsheet_Q3_results.xlsx"
            fileMeta="XLSX 842KB"
            fileType="excel"
          />
        </div>
        <div className={styles['components__row']}>
          <AttachmentCard
            fileName="Presentation.pptx"
            fileMeta="PPTX 12MB"
            fileType="powerpoint"
          />
          <AttachmentCard
            fileName="Design_spec.pdf"
            fileMeta="PDF 3.1MB"
            fileType="pdf"
          />
          <AttachmentCard
            fileName="photo.jpg"
            fileMeta="JPG 2.2MB"
            fileType="image-icon"
          />
        </div>
        <div className={styles['components__row']}>
          <AttachmentCard
            fileName="thumbnail.jpg"
            fileMeta="JPG 2.2MB"
            fileType="image-thumbnail"
            thumbnailSrc="https://picsum.photos/seed/mm/80/80"
          />
          <AttachmentCard
            fileName="screencast.mp4"
            fileMeta="MP4 48MB"
            fileType="video"
          />
          <AttachmentCard
            fileName="podcast_ep12.mp3"
            fileMeta="MP3 28MB"
            fileType="audio"
          />
        </div>
        <div className={styles['components__row']}>
          <AttachmentCard
            fileName="patch-0001.diff"
            fileMeta="DIFF 14KB"
            fileType="patch"
          />
          <AttachmentCard
            fileName="archive.zip"
            fileMeta="ZIP 156MB"
            fileType="zip"
          />
          <AttachmentCard
            fileName="index.ts"
            fileMeta="TS 4KB"
            fileType="code"
          />
        </div>
        <div className={styles['components__row']}>
          <AttachmentCard
            fileName="uploading_file.psd"
            fileType="generic"
            state="uploading"
            progress={56}
          />
          <AttachmentCard
            fileName="uploaded_file.psd"
            fileMeta="PSD 48MB"
            fileType="generic"
            state="uploaded"
          />
        </div>
      </section>

      <section className={styles['components__section']}>
        <h2 className={styles['components__section-title']}>Button</h2>
        <div className={styles['components__button-block']}>
          <div className={styles['components__button-row']}>
            <span className={styles['components__instance-label']}>
              Primary
            </span>
            <Button>Primary</Button>
            <Button leadingIcon={<Icon glyph={<GlobeIcon />} size="16" />}>
              With leading icon
            </Button>
            <Button trailingIcon={<Icon glyph={<GlobeIcon />} size="16" />}>
              With trailing icon
            </Button>
          </div>
          <div className={styles['components__button-row']}>
            <span className={styles['components__instance-label']}>
              Secondary
            </span>
            <Button emphasis="Secondary">Secondary</Button>
            <Button emphasis="Tertiary">Tertiary</Button>
            <Button emphasis="Quaternary">Quaternary</Button>
            <Button emphasis="Link">Link</Button>
          </div>
          <div className={styles['components__button-row']}>
            <span className={styles['components__instance-label']}>Sizes</span>
            <Button size="X-Small">X-Small</Button>
            <Button size="Small">Small</Button>
            <Button size="Medium">Medium</Button>
            <Button size="Large">Large</Button>
          </div>
          <div className={styles['components__button-row']}>
            <span className={styles['components__instance-label']}>
              Destructive
            </span>
            <Button destructive>Delete</Button>
            <Button destructive emphasis="Secondary">
              Cancel
            </Button>
          </div>
          <div className={styles['components__button-row']}>
            <span className={styles['components__instance-label']}>
              Disabled
            </span>
            <Button disabled>Disabled</Button>
            <Button emphasis="Secondary" disabled>
              Disabled
            </Button>
          </div>
          <div
            className={[
              styles['components__button-row'],
              styles['components__button-row--inverted-bg'],
            ].join(' ')}
          >
            <span className={styles['components__instance-label']}>
              Inverted
            </span>
            <Button appearance="Inverted">Primary</Button>
            <Button appearance="Inverted" emphasis="Secondary">
              Secondary
            </Button>
            <Button appearance="Inverted" emphasis="Tertiary">
              Tertiary
            </Button>
          </div>
        </div>
      </section>

      <section className={styles['components__section']}>
        <h2 className={styles['components__section-title']}>
          Call Participant Avatar
        </h2>
        <div
          className={`${styles['components__button-block']} ${styles['components__button-block--calls-bg']}`}
        >
          <div className={styles['components__button-row']}>
            <span className={styles['components__instance-label']}>Sizes</span>
            <CallParticipantAvatar
              src={avatarLeonard}
              alt="Leonard Riley"
              size="XS"
              name="Leonard R."
            />
            <CallParticipantAvatar
              src={avatarDanielle}
              alt="Danielle Okoro"
              size="Small"
              name="Danielle O."
            />
            <CallParticipantAvatar
              src={avatarMarco}
              alt="Marco Rinaldi"
              size="Medium"
              name="Marco R."
            />
          </div>
          <div className={styles['components__button-row']}>
            <span className={styles['components__instance-label']}>States</span>
            <CallParticipantAvatar
              src={avatarLeonard}
              alt="Leonard Riley"
              size="Small"
              muteState="muted"
              name="Muted"
            />
            <CallParticipantAvatar
              src={avatarDanielle}
              alt="Danielle Okoro"
              size="Small"
              muteState="unmuted"
              name="Unmuted"
              talking
            />
            <CallParticipantAvatar
              src={avatarMarco}
              alt="Marco Rinaldi"
              size="Small"
              host
              name="Host"
            />
            <CallParticipantAvatar
              src={avatarEmma}
              alt="Emma Novak"
              size="Small"
              reaction="🎉"
              name="Reaction"
            />
          </div>
        </div>
      </section>

      <section className={styles['components__section']}>
        <h2 className={styles['components__section-title']}>
          Channel Info Msg Header
        </h2>
        <div className={styles['components__button-block']}>
          <div className={styles['components__button-row']}>
            <span className={styles['components__instance-label']}>
              Default
            </span>
            <ChannelInfoMsgHeader />
          </div>
          <div className={styles['components__button-row']}>
            <span className={styles['components__instance-label']}>
              Multiple tabs
            </span>
            <ChannelInfoMsgHeader
              tabs={[
                { label: 'Spec Reviews', active: true },
                { label: 'Files' },
                { label: 'Pinned' },
              ]}
              teamName="Contributors"
            />
          </div>
        </div>
      </section>

      <section className={styles['components__section']}>
        <h2 className={styles['components__section-title']}>
          Channel Sidebar Item
        </h2>
        <div className={styles['components__button-block']}>
          <div className={styles['components__button-row']}>
            <span className={styles['components__instance-label']}>
              Leading visuals
            </span>
            <div className={styles['components__sidebar-demo']}>
              <ChannelSidebarItem leadingVisual="Public" name="Design" />
              <ChannelSidebarItem leadingVisual="Private" name="Engineering" />
              <ChannelSidebarItem
                leadingVisual="Group Message"
                name="Design Team"
                memberCount={4}
              />
              <ChannelSidebarItem
                leadingVisual="Direct Message"
                name="Leonard Riley"
                avatarSrc={avatarLeonard}
                avatarAlt="Leonard Riley"
                showAvatarStatus
              />
              <ChannelSidebarItem leadingVisual="Threads" name="Threads" />
              <ChannelSidebarItem leadingVisual="Drafts" name="Drafts" />
              <ChannelSidebarItem leadingVisual="Insights" name="Insights" />
            </div>
          </div>
          <div className={styles['components__button-row']}>
            <span className={styles['components__instance-label']}>Status</span>
            <div className={styles['components__sidebar-demo']}>
              <ChannelSidebarItem
                leadingVisual="Public"
                name="Read channel"
                status="Read"
              />
              <ChannelSidebarItem
                leadingVisual="Public"
                name="Unread channel"
                status="Unread"
              />
              <ChannelSidebarItem
                leadingVisual="Public"
                name="Mention channel"
                status="Mention"
                mentionCount={3}
              />
            </div>
          </div>
          <div className={styles['components__button-row']}>
            <span className={styles['components__instance-label']}>
              Active & muted
            </span>
            <div className={styles['components__sidebar-demo']}>
              <ChannelSidebarItem
                leadingVisual="Public"
                name="Active channel"
                active
              />
              <ChannelSidebarItem
                leadingVisual="Public"
                name="Muted channel"
                muted
              />
              <ChannelSidebarItem
                leadingVisual="Direct Message"
                name="Danielle Okoro"
                avatarSrc={avatarDanielle}
                avatarAlt="Danielle Okoro"
                muted
              />
            </div>
          </div>
          <div className={styles['components__button-row']}>
            <span className={styles['components__instance-label']}>
              Shared / call / emoji
            </span>
            <div className={styles['components__sidebar-demo']}>
              <ChannelSidebarItem
                leadingVisual="Public"
                name="Shared channel"
                sharedChannel
              />
              <ChannelSidebarItem
                leadingVisual="Private"
                name="Call active"
                callActive
              />
              <ChannelSidebarItem
                leadingVisual="Direct Message"
                name="Marco Rinaldi"
                avatarSrc={avatarMarco}
                avatarAlt="Marco Rinaldi"
                customStatusEmoji="🏄"
              />
            </div>
          </div>
        </div>
      </section>

      <section className={styles['components__section']}>
        <h2 className={styles['components__section-title']}>Checkbox</h2>
        <p
          className={styles['components__subheading']}
          style={{ marginBottom: 'var(--spacing-m)' }}
        >
          Native HTML checkbox with Figma Checkbox (Checkbox Selector) v2.0.2
          styles. Supports checked, unchecked, and indeterminate.
        </p>
        <div className={styles['components__button-block']}>
          <div className={styles['components__button-row']}>
            <span className={styles['components__instance-label']}>States</span>
            <Checkbox size="Medium">Unchecked</Checkbox>
            <Checkbox size="Medium" defaultChecked>
              Checked
            </Checkbox>
            <Checkbox size="Medium" indeterminate>
              Indeterminate
            </Checkbox>
          </div>
          <div className={styles['components__button-row']}>
            <span className={styles['components__instance-label']}>Sizes</span>
            <Checkbox size="Small">Small</Checkbox>
            <Checkbox size="Medium" defaultChecked>
              Medium
            </Checkbox>
            <Checkbox size="Large" defaultChecked>
              Large
            </Checkbox>
          </div>
          <div className={styles['components__button-row']}>
            <span className={styles['components__instance-label']}>
              Invalid
            </span>
            <Checkbox size="Medium" valid={false}>
              Unchecked invalid
            </Checkbox>
            <Checkbox size="Medium" defaultChecked valid={false}>
              Checked invalid
            </Checkbox>
            <Checkbox size="Medium" indeterminate valid={false}>
              Indeterminate invalid
            </Checkbox>
          </div>
          <div className={styles['components__button-row']}>
            <span className={styles['components__instance-label']}>
              Disabled
            </span>
            <Checkbox size="Medium" disabled>
              Disabled unchecked
            </Checkbox>
            <Checkbox size="Medium" defaultChecked disabled>
              Disabled checked
            </Checkbox>
            <Checkbox size="Medium" indeterminate disabled>
              Disabled indeterminate
            </Checkbox>
          </div>
        </div>
      </section>

      <section className={styles['components__section']}>
        <h2 className={styles['components__section-title']}>Chip</h2>
        <div className={styles['components__button-block']}>
          <div className={styles['components__button-row']}>
            <span className={styles['components__instance-label']}>Sizes</span>
            <Chip size="Small" onRemove={() => {}}>
              Label
            </Chip>
            <Chip size="Medium" onRemove={() => {}}>
              Label
            </Chip>
            <Chip size="Medium Compact" onRemove={() => {}}>
              Label
            </Chip>
            <Chip size="Large" onRemove={() => {}}>
              Label
            </Chip>
          </div>
          <div className={styles['components__button-row']}>
            <span className={styles['components__instance-label']}>
              Leading
            </span>
            <Chip size="Medium" onRemove={() => {}}>
              No leading
            </Chip>
            <Chip
              size="Medium"
              leadingIcon={<EmoticonHappyOutlineIcon size={12} />}
              onRemove={() => {}}
            >
              With icon
            </Chip>
            <Chip
              size="Medium"
              leadingAvatar={{ src: avatarLeonard, alt: 'Leonard Riley' }}
              onRemove={() => {}}
            >
              Leonard Riley
            </Chip>
          </div>
          <div className={styles['components__button-row']}>
            <span className={styles['components__instance-label']}>States</span>
            <Chip size="Medium" onRemove={() => {}}>
              Default
            </Chip>
            <Chip size="Medium" error onRemove={() => {}}>
              Error
            </Chip>
            <Chip size="Medium" colored onRemove={() => {}}>
              Colored
            </Chip>
          </div>
          <div className={styles['components__button-row']}>
            <span className={styles['components__instance-label']}>
              No remove
            </span>
            <Chip size="Small">Small</Chip>
            <Chip size="Medium">Medium</Chip>
            <Chip size="Large">Large</Chip>
          </div>
        </div>
      </section>

      <section className={styles['components__section']}>
        <h2 className={styles['components__section-title']}>
          Date &amp; Range Picker
        </h2>
        <div className={styles['components__button-block']}>
          <div className={styles['components__button-row']}>
            <span className={styles['components__instance-label']}>
              Single date
            </span>
            <DateRangePicker mode="date" />
          </div>
          <div className={styles['components__button-row']}>
            <span className={styles['components__instance-label']}>
              Date range
            </span>
            <DateRangePicker mode="range" />
          </div>
        </div>
      </section>

      <section className={styles['components__section']}>
        <h2 className={styles['components__section-title']}>Divider</h2>
        <div className={styles['components__divider-demo']}>
          <p className={styles['components__demo-text']}>Content above</p>
          <Divider />
          <p className={styles['components__demo-text']}>Content below</p>
        </div>
      </section>

      <section className={styles['components__section']}>
        <h2 className={styles['components__section-title']}>Dropdown</h2>
        <div className={styles['components__button-block']}>
          <div className={styles['components__button-row']}>
            <span className={styles['components__instance-label']}>Sizes</span>
            <Dropdown size="X-Small">X-Small</Dropdown>
            <Dropdown size="Small">Small</Dropdown>
            <Dropdown size="Medium">Medium</Dropdown>
            <Dropdown size="Large">Large</Dropdown>
            <Dropdown size="X-Large">X-Large</Dropdown>
          </div>
          <div className={styles['components__button-row']}>
            <span className={styles['components__instance-label']}>States</span>
            <Dropdown>Default</Dropdown>
            <Dropdown isOpen>Open</Dropdown>
            <Dropdown disabled>Disabled</Dropdown>
          </div>
          <div
            className={[
              styles['components__button-row'],
              styles['components__button-row--inverted-bg'],
            ].join(' ')}
          >
            <span className={styles['components__instance-label']}>
              Inverted
            </span>
            <Dropdown appearance="Inverted">Inverted</Dropdown>
          </div>
        </div>
      </section>

      <section className={styles['components__section']}>
        <h2 className={styles['components__section-title']}>Emoji</h2>
        <div className={styles['components__row']}>
          <div className={styles['components__instance']}>
            <span className={styles['components__instance-label']}>
              size 16
            </span>
            <Emoji emoji="👍" size="16" />
          </div>
          <div className={styles['components__instance']}>
            <span className={styles['components__instance-label']}>
              size 24 (default)
            </span>
            <Emoji emoji="🎉" size="24" />
          </div>
          <div className={styles['components__instance']}>
            <span className={styles['components__instance-label']}>
              size 32
            </span>
            <Emoji emoji="🚀" size="32" />
          </div>
          <div className={styles['components__instance']}>
            <span className={styles['components__instance-label']}>
              size 40
            </span>
            <Emoji emoji="✨" size="40" />
          </div>
        </div>
      </section>

      <section className={styles['components__section']}>
        <h2 className={styles['components__section-title']}>Empty State</h2>
        <div className={styles['components__button-block']}>
          <div className={styles['components__button-row']}>
            <span className={styles['components__instance-label']}>
              With illustration
            </span>
            <EmptyState
              illustration={{
                'aria-label': 'Search',
                width: '120px',
                height: '80px',
                children: <SearchIllustration />,
              }}
              title="No results found"
              description="Try adjusting your search or filters to find what you're looking for."
              action={{ children: 'Clear filters' }}
            />
          </div>
          <div className={styles['components__button-row']}>
            <span className={styles['components__instance-label']}>
              Text only
            </span>
            <EmptyState
              title="No messages yet"
              description="Be the first to start the conversation."
            />
          </div>
        </div>
      </section>

      <section className={styles['components__section']}>
        <h2 className={styles['components__section-title']}>Error Message</h2>
        <div className={styles['components__button-block']}>
          <div className={styles['components__button-row']}>
            <span className={styles['components__instance-label']}>
              Examples
            </span>
            <ErrorMessage message="This field is required." />
            <ErrorMessage message="Invalid email address." />
            <ErrorMessage message="Password must be at least 8 characters." />
          </div>
        </div>
      </section>

      <section className={styles['components__section']}>
        <h2 className={styles['components__section-title']}>
          Feature Discovery Panel
        </h2>
        <div className={styles['components__button-block']}>
          <div className={styles['components__button-row']}>
            <span className={styles['components__instance-label']}>
              With illustration
            </span>
            <FeatureDiscoveryPanel
              skuLabel="PROFESSIONAL"
              title="Synchronize your Active Directory/LDAP groups"
              description="Use AD/LDAP groups to organize and apply actions to multiple users at once. Manage team and channel memberships, permissions, and more."
              primaryAction={{ children: 'Contact sales' }}
              secondaryAction={{ emphasis: 'Tertiary', children: 'Learn more' }}
              illustration={{
                children: <GroupsIllustration />,
                width: '276px',
                height: '170px',
                'aria-label': 'Groups illustration',
              }}
            />
          </div>
          <div className={styles['components__button-row']}>
            <span className={styles['components__instance-label']}>
              Text only
            </span>
            <FeatureDiscoveryPanel
              skuLabel="PROFESSIONAL"
              title="Unlock advanced reporting"
              description="Get deeper insights into your workspace with advanced analytics and custom dashboards available on the Professional plan."
              primaryAction={{ children: 'Upgrade now' }}
              secondaryAction={{ emphasis: 'Tertiary', children: 'Learn more' }}
            />
          </div>
          <div className={styles['components__button-row']}>
            <span className={styles['components__instance-label']}>
              No SKU tag
            </span>
            <FeatureDiscoveryPanel
              skuLabel={null}
              title="Enable compliance exports"
              description="Configure automated message exports for regulatory compliance."
              primaryAction={{ children: 'Enable' }}
            />
          </div>
        </div>
      </section>

      <section className={styles['components__section']}>
        <h2 className={styles['components__section-title']}>Global Banner</h2>
        <div className={styles['components__button-block']}>
          <div className={styles['components__button-row']}>
            <span className={styles['components__instance-label']}>Types</span>
          </div>
          <GlobalBanner
            message="Your license expires in 14 days."
            type="General"
            actionLabel="Renew"
            onAction={() => {}}
            onDismiss={() => {}}
          />
          <GlobalBanner
            message="Scheduled maintenance window tonight from 2–4 AM UTC."
            type="Warning"
            onDismiss={() => {}}
          />
          <GlobalBanner
            message="Critical security update required. Please update immediately."
            type="Danger"
            actionLabel="Update now"
            onAction={() => {}}
          />
          <GlobalBanner
            message="New version of Mattermost is available."
            type="Info"
            actionLabel="Learn more"
            onAction={() => {}}
            onDismiss={() => {}}
          />
          <GlobalBanner
            message="Your data export is ready to download."
            type="Success"
            actionLabel="Download"
            onAction={() => {}}
            onDismiss={() => {}}
          />
        </div>
      </section>

      <section className={styles['components__section']}>
        <h2 className={styles['components__section-title']}>Icon</h2>
        <div className={styles['components__row']}>
          <div className={styles['components__instance']}>
            <span className={styles['components__instance-label']}>
              16, Globe
            </span>
            <Icon glyph={<GlobeIcon />} size="16" />
          </div>
          <div className={styles['components__instance']}>
            <span className={styles['components__instance-label']}>
              24, default glyph
            </span>
            <Icon size="24" />
          </div>
          <div className={styles['components__instance']}>
            <span className={styles['components__instance-label']}>
              32, Emoticon
            </span>
            <Icon glyph={<EmoticonHappyOutlineIcon />} size="32" />
          </div>
          <div className={styles['components__instance']}>
            <span className={styles['components__instance-label']}>
              40, Globe
            </span>
            <Icon glyph={<GlobeIcon />} size="40" />
          </div>
        </div>
      </section>

      <section className={styles['components__section']}>
        <h2 className={styles['components__section-title']}>Icon Button</h2>
        <div className={styles['components__button-block']}>
          <div className={styles['components__button-row']}>
            <span className={styles['components__instance-label']}>
              Default
            </span>
            <IconButton
              aria-label="Icon button"
              icon={
                <Icon
                  glyph={<GlobeIcon />}
                  size={ICON_BUTTON_ICON_SIZES.Medium}
                />
              }
            />
          </div>
          <div className={styles['components__button-row']}>
            <span className={styles['components__instance-label']}>Sizes</span>
            <IconButton
              aria-label="X-Small"
              icon={<Icon glyph={<GlobeIcon />} size="12" />}
              size="X-Small"
            />
            <IconButton
              aria-label="Small"
              icon={<Icon glyph={<GlobeIcon />} size="16" />}
              size="Small"
            />
            <IconButton
              aria-label="Medium"
              icon={<Icon glyph={<GlobeIcon />} size="20" />}
              size="Medium"
            />
            <IconButton
              aria-label="Large"
              icon={<Icon glyph={<GlobeIcon />} size="24" />}
              size="Large"
            />
          </div>
          <div className={styles['components__button-row']}>
            <span className={styles['components__instance-label']}>
              Compact, rounded, toggled
            </span>
            <IconButton
              aria-label="Compact"
              icon={<Icon glyph={<GlobeIcon />} size="16" />}
              padding="Compact"
              size="Small"
            />
            <IconButton
              aria-label="Rounded"
              icon={<Icon glyph={<GlobeIcon />} size="20" />}
              rounded
            />
            <IconButton
              aria-label="Toggled"
              icon={<Icon glyph={<GlobeIcon />} size="20" />}
              toggled
            />
          </div>
          <div className={styles['components__button-row']}>
            <span className={styles['components__instance-label']}>
              Destructive & disabled
            </span>
            <IconButton
              aria-label="Destructive"
              destructive
              icon={<Icon glyph={<GlobeIcon />} size="20" />}
            />
            <IconButton
              aria-label="Disabled"
              disabled
              icon={<Icon glyph={<GlobeIcon />} size="20" />}
            />
          </div>
          <div className={styles['components__button-row']}>
            <span className={styles['components__instance-label']}>Count</span>
            <IconButton
              aria-label="12 notifications, X-Small"
              count={12}
              icon={<Icon glyph={<GlobeIcon />} size="12" />}
              size="X-Small"
            />
            <IconButton
              aria-label="48 notifications, Small"
              count={48}
              icon={<Icon glyph={<GlobeIcon />} size="16" />}
              size="Small"
            />
            <IconButton
              aria-label="425 notifications, Medium"
              count={425}
              icon={<Icon glyph={<GlobeIcon />} size="20" />}
            />
            <IconButton
              aria-label="9 notifications, Large"
              count={9}
              icon={<Icon glyph={<GlobeIcon />} size="24" />}
              size="Large"
            />
          </div>
          <div className={styles['components__button-row']}>
            <span className={styles['components__instance-label']}>
              Unread badge
            </span>
            <IconButton
              aria-label="Unread, X-Small"
              icon={<Icon glyph={<GlobeIcon />} size="12" />}
              size="X-Small"
              unreadBadge
            />
            <IconButton
              aria-label="Unread, Small"
              icon={<Icon glyph={<GlobeIcon />} size="16" />}
              size="Small"
              unreadBadge
            />
            <IconButton
              aria-label="Unread, Medium"
              icon={<Icon glyph={<GlobeIcon />} size="20" />}
              unreadBadge
            />
            <IconButton
              aria-label="Unread, Large"
              icon={<Icon glyph={<GlobeIcon />} size="24" />}
              size="Large"
              unreadBadge
            />
            <IconButton
              aria-label="Unread, toggled"
              icon={<Icon glyph={<GlobeIcon />} size="20" />}
              toggled
              unreadBadge
            />
            <IconButton
              aria-label="Unread with count"
              count={3}
              icon={<Icon glyph={<GlobeIcon />} size="20" />}
              unreadBadge
            />
          </div>
          <div
            className={[
              styles['components__button-row'],
              styles['components__button-row--inverted-bg'],
            ].join(' ')}
          >
            <span className={styles['components__instance-label']}>
              Style = Inverted
            </span>
            <IconButton
              aria-label="Inverted icon button"
              icon={<Icon glyph={<GlobeIcon />} size="20" />}
              style="Inverted"
            />
            <IconButton
              aria-label="Inverted with count"
              count={7}
              icon={<Icon glyph={<GlobeIcon />} size="20" />}
              style="Inverted"
            />
            <IconButton
              aria-label="Inverted with unread badge"
              icon={<Icon glyph={<GlobeIcon />} size="20" />}
              style="Inverted"
              unreadBadge
            />
          </div>
        </div>
      </section>

      <section className={styles['components__section']}>
        <h2 className={styles['components__section-title']}>Illustration</h2>
        <div className={styles['components__row']}>
          <div className={styles['components__instance']}>
            <span className={styles['components__instance-label']}>
              AI Copilot (default size)
            </span>
            <Illustration aria-label="AI Copilot intro">
              <AICopilotIllustration />
            </Illustration>
          </div>
          <div className={styles['components__instance']}>
            <span className={styles['components__instance-label']}>
              Search, 200px width
            </span>
            <Illustration aria-label="Search" width="200px" height="120px">
              <SearchIllustration />
            </Illustration>
          </div>
        </div>
      </section>

      <section className={styles['components__section']}>
        <h2 className={styles['components__section-title']}>Image Preview</h2>
        <div className={styles['components__button-block']}>
          <div className={styles['components__button-row']}>
            <span className={styles['components__instance-label']}>16:9</span>
            <ImagePreview
              src="https://picsum.photos/seed/mm1/480/270"
              alt="Sample image"
              onCopyLink={() => {}}
              onDownload={() => {}}
              onToggleCollapse={() => {}}
            />
          </div>
          <div className={styles['components__button-row']}>
            <span className={styles['components__instance-label']}>1:1</span>
            <ImagePreview
              src="https://picsum.photos/seed/mm2/200/200"
              alt="Square image"
              aspectRatio="1:1"
              onCopyLink={() => {}}
              onDownload={() => {}}
            />
          </div>
          <div className={styles['components__button-row']}>
            <span className={styles['components__instance-label']}>
              Collapsed
            </span>
            <ImagePreview
              src="https://picsum.photos/seed/mm3/480/270"
              alt="Collapsed image"
              collapsed
              onToggleCollapse={() => {}}
            />
          </div>
        </div>
      </section>

      <section className={styles['components__section']}>
        <h2 className={styles['components__section-title']}>Label Tag</h2>
        <div className={styles['components__button-row']}>
          <span className={styles['components__instance-label']}>
            Types · X-Small
          </span>
          <LabelTag label="Default" type="Default" />
          <LabelTag label="Info" type="Info" />
          <LabelTag label="Info Dim" type="Info Dim" />
          <LabelTag label="Danger" type="Danger" />
          <LabelTag label="Success" type="Success" />
          <LabelTag label="Warning" type="Warning" />
        </div>
        <div className={styles['components__button-row']}>
          <span className={styles['components__instance-label']}>
            Types · Small
          </span>
          <LabelTag label="Default" type="Default" size="Small" />
          <LabelTag label="Info" type="Info" size="Small" />
          <LabelTag label="Info Dim" type="Info Dim" size="Small" />
          <LabelTag label="Danger" type="Danger" size="Small" />
          <LabelTag label="Success" type="Success" size="Small" />
          <LabelTag label="Warning" type="Warning" size="Small" />
        </div>
        <div className={styles['components__button-row']}>
          <span className={styles['components__instance-label']}>All Caps</span>
          <LabelTag label="Tag" type="Default" casing="All Caps" />
          <LabelTag label="Tag" type="Info" casing="All Caps" />
          <LabelTag label="Tag" type="Info Dim" casing="All Caps" />
          <LabelTag label="Tag" type="Danger" casing="All Caps" />
          <LabelTag label="Tag" type="Success" casing="All Caps" />
          <LabelTag label="Tag" type="Warning" casing="All Caps" />
        </div>
        <div className={styles['components__button-row']}>
          <span className={styles['components__instance-label']}>
            With icon
          </span>
          <LabelTag
            label="PROFESSIONAL"
            type="Default"
            casing="All Caps"
            leadingIcon={<GlobeIcon size={10} />}
          />
          <LabelTag
            label="Info"
            type="Info"
            leadingIcon={<GlobeIcon size={10} />}
          />
          <LabelTag
            label="Success"
            type="Success"
            size="Small"
            leadingIcon={<GlobeIcon size={12} />}
          />
        </div>
      </section>

      <section className={styles['components__section']}>
        <h2 className={styles['components__section-title']}>Link Preview</h2>
        <div className={styles['components__button-block']}>
          <div className={styles['components__button-row']}>
            <span className={styles['components__instance-label']}>
              Default
            </span>
            <LinkPreview />
          </div>
          <div className={styles['components__button-row']}>
            <span className={styles['components__instance-label']}>Custom</span>
            <LinkPreview
              siteName="GitHub"
              title="mattermost/mattermost - Open source platform for developer collaboration"
              description="Mattermost is written in Golang and React. Open source, self-hosted Slack-alternative."
            />
          </div>
        </div>
      </section>

      <section className={styles['components__section']}>
        <h2 className={styles['components__section-title']}>Mention Badge</h2>
        <div className={styles['components__button-block']}>
          <div
            className={`${styles['components__button-row']} ${styles['components__button-row--inverted-bg']}`}
          >
            <span className={styles['components__instance-label']}>
              Sidebar
            </span>
            <MentionBadge count={1} location="Sidebar" size="Small" />
            <MentionBadge count={22} location="Sidebar" size="Small" />
            <MentionBadge count={100} location="Sidebar" size="Small" />
          </div>
          <div
            className={`${styles['components__button-row']} ${styles['components__button-row--inverted-bg']}`}
          >
            <span className={styles['components__instance-label']}>
              Sidebar Medium
            </span>
            <MentionBadge count={1} location="Sidebar" size="Medium" />
            <MentionBadge count={22} location="Sidebar" size="Medium" />
            <MentionBadge count={100} location="Sidebar" size="Medium" />
          </div>
          <div
            className={`${styles['components__button-row']} ${styles['components__button-row--inverted-bg']}`}
          >
            <span className={styles['components__instance-label']}>
              Sidebar Large
            </span>
            <MentionBadge count={1} location="Sidebar" size="Large" />
            <MentionBadge count={22} location="Sidebar" size="Large" />
            <MentionBadge count={100} location="Sidebar" size="Large" />
          </div>
          <div className={styles['components__button-row']}>
            <span className={styles['components__instance-label']}>
              Menu Item
            </span>
            <MentionBadge count={1} location="Menu Item" size="Small" />
            <MentionBadge count={22} location="Menu Item" size="Medium" />
            <MentionBadge count={100} location="Menu Item" size="Large" />
          </div>
          <div className={styles['components__button-row']}>
            <span className={styles['components__instance-label']}>
              Icon Button
            </span>
            <MentionBadge count={1} location="Icon Button" size="Small" />
            <MentionBadge count={22} location="Icon Button" size="Small" />
            <MentionBadge count={100} location="Icon Button" size="Small" />
          </div>
        </div>
      </section>

      <section className={styles['components__section']}>
        <h2 className={styles['components__section-title']}>Menu Item</h2>
        <div className={styles['components__button-block']}>
          <div className={styles['components__button-row']}>
            <span className={styles['components__instance-label']}>
              Default
            </span>
            <div className={styles['components__menu-demo']}>
              <MenuItem label="Menu Item" />
              <MenuItem label="With trailing check" trailingElement />
              <MenuItem label="No leading visual" leadingElement={false} />
            </div>
          </div>
          <div className={styles['components__button-row']}>
            <span className={styles['components__instance-label']}>
              Secondary label
            </span>
            <div className={styles['components__menu-demo']}>
              <MenuItem
                label="Menu Item"
                secondaryLabel="Descriptive text below"
              />
              <MenuItem
                label="Menu Item"
                secondaryLabel="Inline text"
                secondaryLabelPosition="Inline"
              />
            </div>
          </div>
          <div className={styles['components__button-row']}>
            <span className={styles['components__instance-label']}>
              Badges & tag
            </span>
            <div className={styles['components__menu-demo']}>
              <MenuItem label="New feature" tag />
              <MenuItem label="Mentions" mentionCount={3} />
              <MenuItem label="Custom status" customStatusEmoji="🏄" />
            </div>
          </div>
          <div className={styles['components__button-row']}>
            <span className={styles['components__instance-label']}>
              Destructive
            </span>
            <div className={styles['components__menu-demo']}>
              <MenuItem label="Delete item" destructive />
              <MenuItem label="Delete item" destructive trailingElement />
            </div>
          </div>
          <div className={styles['components__button-row']}>
            <span className={styles['components__instance-label']}>
              Disabled
            </span>
            <div className={styles['components__menu-demo']}>
              <MenuItem label="Menu Item" disabled />
              <MenuItem label="With badge" disabled mentionCount={2} />
              <MenuItem label="Destructive" destructive disabled />
            </div>
          </div>
        </div>
      </section>

      <section className={styles['components__section']}>
        <h2 className={styles['components__section-title']}>Message Actions</h2>
        <div className={styles['components__button-block']}>
          <div className={styles['components__button-row']}>
            <span className={styles['components__instance-label']}>
              Center Channel
            </span>
            <MessageActions type="Center Channel" />
          </div>
          <div className={styles['components__button-row']}>
            <span className={styles['components__instance-label']}>RHS</span>
            <MessageActions type="RHS" />
          </div>
          <div className={styles['components__button-row']}>
            <span className={styles['components__instance-label']}>
              Search Results
            </span>
            <MessageActions type="Search Results" />
          </div>
        </div>
      </section>

      <section className={styles['components__section']}>
        <h2 className={styles['components__section-title']}>Message Header</h2>
        <div className={styles['components__button-block']}>
          <div className={styles['components__button-row']}>
            <span className={styles['components__instance-label']}>Normal</span>
            <MessageHeader
              username="Leonard Riley"
              timestamp="Today at 9:41 AM"
            />
          </div>
          <div className={styles['components__button-row']}>
            <span className={styles['components__instance-label']}>Bot</span>
            <MessageHeader
              username="Mattermost"
              timestamp="Today at 9:41 AM"
              isBot
            />
          </div>
          <div className={styles['components__button-row']}>
            <span className={styles['components__instance-label']}>
              Bot (custom label)
            </span>
            <MessageHeader
              username="PagerDuty"
              timestamp="Yesterday at 2:15 PM"
              isBot
              botLabel="APP"
            />
          </div>
        </div>
      </section>

      <section className={styles['components__section']}>
        <h2 className={styles['components__section-title']}>
          Message Reactions
        </h2>
        <div className={styles['components__button-block']}>
          <div className={styles['components__button-row']}>
            <span className={styles['components__instance-label']}>
              Default
            </span>
            <MessageReactions />
          </div>
          <div className={styles['components__button-row']}>
            <span className={styles['components__instance-label']}>
              With add button
            </span>
            <MessageReactions
              reactions={[
                { emoji: '👍', count: 5, byCurrentUser: true },
                { emoji: '🎉', count: 2 },
              ]}
              showAddReaction
            />
          </div>
          <div className={styles['components__button-row']}>
            <span className={styles['components__instance-label']}>
              Acknowledge — unclicked
            </span>
            <MessageReactions
              reactions={[]}
              acknowledged
              acknowledgeCount={0}
              currentUserAcknowledged={false}
            />
          </div>
          <div className={styles['components__button-row']}>
            <span className={styles['components__instance-label']}>
              Acknowledge — clicked
            </span>
            <MessageReactions
              reactions={[]}
              acknowledged
              acknowledgeCount={3}
              currentUserAcknowledged
            />
          </div>
        </div>
      </section>

      <section className={styles['components__section']}>
        <h2 className={styles['components__section-title']}>
          Message Separator
        </h2>
        <div className={styles['components__button-block']}>
          <div className={styles['components__button-row']}>
            <span className={styles['components__instance-label']}>Date</span>
            <MessageSeparator type="Date" label="Today" />
          </div>
          <div className={styles['components__button-row']}>
            <span className={styles['components__instance-label']}>
              New Messages
            </span>
            <MessageSeparator type="New Messages" showAiSummary />
          </div>
          <div className={styles['components__button-row']}>
            <span className={styles['components__instance-label']}>
              Reply Count
            </span>
            <MessageSeparator type="Reply Count" label="6 replies" />
          </div>
        </div>
      </section>

      <section className={styles['components__section']}>
        <h2 className={styles['components__section-title']}>
          More Unreads Banner
        </h2>
        <div className={styles['components__button-block']}>
          <div className={styles['components__button-row']}>
            <span className={styles['components__instance-label']}>
              Directions
            </span>
            <MoreUnreadsBanner direction="Up" />
            <MoreUnreadsBanner direction="Down" />
          </div>
          <div className={styles['components__button-row']}>
            <span className={styles['components__instance-label']}>Sizes</span>
            <MoreUnreadsBanner size="Small" />
            <MoreUnreadsBanner size="Medium" />
            <MoreUnreadsBanner size="Large" />
          </div>
        </div>
      </section>

      <section className={styles['components__section']}>
        <h2 className={styles['components__section-title']}>
          New Message Banner
        </h2>
        <div className={styles['components__button-block']}>
          <div className={styles['components__button-row']}>
            <span className={styles['components__instance-label']}>
              Jump to unreads
            </span>
            <NewMessageBanner
              type="JumpToUnreads"
              countLabel="21 new messages since Saturday"
              onDismiss={() => {}}
            />
          </div>
          <div className={styles['components__button-row']}>
            <span className={styles['components__instance-label']}>
              New replies
            </span>
            <NewMessageBanner type="NewReplies" onDismiss={() => {}} />
          </div>
        </div>
      </section>

      <section className={styles['components__section']}>
        <h2 className={styles['components__section-title']}>Pagination Dots</h2>
        <div className={styles['components__button-block']}>
          <div className={styles['components__button-row']}>
            <span className={styles['components__instance-label']}>
              Horizontal
            </span>
            <PaginationDots pages={5} activePage={2} orientation="Horizontal" />
          </div>
          <div className={styles['components__button-row']}>
            <span className={styles['components__instance-label']}>
              Vertical
            </span>
            <PaginationDots pages={4} activePage={1} orientation="Vertical" />
          </div>
          <div
            className={[
              styles['components__button-row'],
              styles['components__button-row--inverted-bg'],
            ].join(' ')}
          >
            <span className={styles['components__instance-label']}>
              Inverted
            </span>
            <PaginationDots pages={5} activePage={3} dotStyle="Inverted" />
          </div>
        </div>
      </section>

      <section className={styles['components__section']}>
        <h2 className={styles['components__section-title']}>
          Permalink Preview
        </h2>
        <div className={styles['components__button-block']}>
          <div className={styles['components__button-row']}>
            <span className={styles['components__instance-label']}>
              Default
            </span>
            <PermalinkPreview avatarSrc={avatarLeonard} />
          </div>
          <div className={styles['components__button-row']}>
            <span className={styles['components__instance-label']}>
              With avatar
            </span>
            <PermalinkPreview
              authorName="Danielle Okoro"
              avatarSrc={avatarDanielle}
              timestamp="Yesterday at 3:22 PM"
              messageText="The new design looks great! Let's move forward with this approach for the next sprint."
              originalChannel="~ux-design"
            />
          </div>
        </div>
      </section>

      <section className={styles['components__section']}>
        <h2 className={styles['components__section-title']}>Popover Notice</h2>
        <div className={styles['components__button-block']}>
          <div className={styles['components__button-row']}>
            <span className={styles['components__instance-label']}>
              Default
            </span>
            <PopoverNotice
              title="Keyboard shortcut"
              onClose={() => {}}
              actions={[
                { label: 'Got it', emphasis: 'primary' },
                { label: 'Dismiss', emphasis: 'tertiary' },
              ]}
            >
              Press <kbd>Ctrl+K</kbd> to open the quick switcher and jump to any
              channel.
            </PopoverNotice>
          </div>
          <div className={styles['components__button-row']}>
            <span className={styles['components__instance-label']}>Info</span>
            <PopoverNotice
              title="Keyboard shortcut updated"
              variant="info"
              onClose={() => {}}
            >
              The quick switcher is now opened with <kbd>Ctrl+K</kbd>.
            </PopoverNotice>
          </div>
          <div className={styles['components__button-row']}>
            <span className={styles['components__instance-label']}>
              Success
            </span>
            <PopoverNotice
              title="Changes saved"
              variant="success"
              onClose={() => {}}
              actions={[{ label: 'Got it', emphasis: 'primary' }]}
            >
              Your notification preferences have been updated.
            </PopoverNotice>
          </div>
          <div className={styles['components__button-row']}>
            <span className={styles['components__instance-label']}>
              Warning
            </span>
            <PopoverNotice
              title="Session expiring soon"
              variant="warning"
              onClose={() => {}}
              actions={[
                { label: 'Stay signed in', emphasis: 'primary' },
                { label: 'Dismiss', emphasis: 'tertiary' },
              ]}
            >
              You will be signed out in 5 minutes due to inactivity.
            </PopoverNotice>
          </div>
          <div className={styles['components__button-row']}>
            <span className={styles['components__instance-label']}>Danger</span>
            <PopoverNotice
              title="Permission required"
              variant="danger"
              onClose={() => {}}
              actions={[{ label: 'Review permissions', emphasis: 'primary' }]}
            >
              You don't have access to post in this channel.
            </PopoverNotice>
          </div>
          <div className={styles['components__button-row']}>
            <span className={styles['components__instance-label']}>
              With checkbox
            </span>
            <PopoverNotice
              title="New feature available"
              showCheckbox
              onClose={() => {}}
            >
              You can now forward messages directly to other channels.
            </PopoverNotice>
          </div>
        </div>
      </section>

      <section className={styles['components__section']}>
        <h2 className={styles['components__section-title']}>Progress Bar</h2>
        <div className={styles['components__button-block']}>
          <div className={styles['components__button-row']}>
            <span className={styles['components__instance-label']}>Values</span>
            <ProgressBar value={0} aria-label="0%" />
            <ProgressBar value={35} aria-label="35%" />
            <ProgressBar value={70} aria-label="70%" />
            <ProgressBar value={100} aria-label="100%" />
          </div>
          <div className={styles['components__button-row']}>
            <span className={styles['components__instance-label']}>Sizes</span>
            <ProgressBar value={60} size="Small" aria-label="Small 60%" />
            <ProgressBar value={60} size="Large" aria-label="Large 60%" />
          </div>
          <div className={styles['components__button-row']}>
            <span className={styles['components__instance-label']}>
              Semantic colors
            </span>
            <ProgressBar value={30} semanticColors aria-label="30% success" />
            <ProgressBar value={75} semanticColors aria-label="75% warning" />
            <ProgressBar value={95} semanticColors aria-label="95% danger" />
          </div>
        </div>
      </section>

      <section className={styles['components__section']}>
        <h2 className={styles['components__section-title']}>Radio</h2>
        <p
          className={styles['components__subheading']}
          style={{ marginBottom: 'var(--spacing-m)' }}
        >
          Native HTML radio with Figma Radio v2.0.0 styles. Use the same{' '}
          <code>name</code> to group options.
        </p>
        <div className={styles['components__button-block']}>
          <div className={styles['components__button-row']}>
            <span className={styles['components__instance-label']}>Group</span>
            <Radio name="demo-size" value="a" size="Medium">
              Option A
            </Radio>
            <Radio name="demo-size" value="b" defaultChecked size="Medium">
              Option B
            </Radio>
            <Radio name="demo-size" value="c" size="Medium">
              Option C
            </Radio>
          </div>
          <div className={styles['components__button-row']}>
            <span className={styles['components__instance-label']}>Sizes</span>
            <Radio name="demo-sizes" value="s" size="Small">
              Small
            </Radio>
            <Radio name="demo-sizes" value="m" defaultChecked size="Medium">
              Medium
            </Radio>
            <Radio name="demo-sizes" value="l" size="Large">
              Large
            </Radio>
          </div>
          <div className={styles['components__button-row']}>
            <span className={styles['components__instance-label']}>
              Invalid
            </span>
            <Radio name="demo-invalid" value="u" valid={false} size="Medium">
              Unchecked invalid
            </Radio>
            <Radio
              name="demo-invalid"
              value="c"
              defaultChecked
              valid={false}
              size="Medium"
            >
              Checked invalid
            </Radio>
          </div>
          <div className={styles['components__button-row']}>
            <span className={styles['components__instance-label']}>
              Disabled
            </span>
            <Radio name="demo-disabled" value="u" disabled size="Medium">
              Disabled unchecked
            </Radio>
            <Radio
              name="demo-disabled"
              value="c"
              defaultChecked
              disabled
              size="Medium"
            >
              Disabled checked
            </Radio>
          </div>
        </div>
      </section>

      <section className={styles['components__section']}>
        <h2 className={styles['components__section-title']}>Reaction Pill</h2>
        <div className={styles['components__button-block']}>
          <div className={styles['components__button-row']}>
            <span className={styles['components__instance-label']}>Types</span>
            <ReactionPill type="Reaction" emoji="🎉" label="Leonard R." />
            <ReactionPill type="Hand Raise" label="Danielle O." />
            <ReactionPill
              type="Other"
              message="You have been muted by the host"
            />
          </div>
          <div className={styles['components__button-row']}>
            <span className={styles['components__instance-label']}>Sizes</span>
            <ReactionPill
              type="Reaction"
              emoji="👍"
              label="Marco R."
              size="Small"
            />
            <ReactionPill
              type="Reaction"
              emoji="👍"
              label="Marco R."
              size="Medium"
            />
            <ReactionPill
              type="Reaction"
              emoji="👍"
              label="Marco R."
              size="Large"
            />
          </div>
        </div>
      </section>

      <section className={styles['components__section']}>
        <h2 className={styles['components__section-title']}>Recording Pill</h2>
        <div className={styles['components__button-block']}>
          <div className={styles['components__button-row']}>
            <span className={styles['components__instance-label']}>States</span>
            <RecordingPill state="Initializing" />
            <RecordingPill state="Recording" />
            <RecordingPill state="Hover" onStop={() => {}} />
          </div>
        </div>
      </section>

      <section className={styles['components__section']}>
        <h2 className={styles['components__section-title']}>Scrollbar</h2>
        <div className={styles['components__button-block']}>
          <div className={styles['components__button-row']}>
            <span className={styles['components__instance-label']}>
              Vertical
            </span>
            <Scrollbar
              orientation="Vertical"
              thumbSize="25%"
              scrollPosition={0}
            />
            <Scrollbar
              orientation="Vertical"
              thumbSize="33%"
              scrollPosition={50}
            />
            <Scrollbar
              orientation="Vertical"
              thumbSize="50%"
              scrollPosition={100}
            />
          </div>
          <div className={styles['components__button-row']}>
            <span className={styles['components__instance-label']}>
              Horizontal
            </span>
            <Scrollbar
              orientation="Horizontal"
              thumbSize="25%"
              scrollPosition={0}
            />
            <Scrollbar
              orientation="Horizontal"
              thumbSize="50%"
              scrollPosition={50}
            />
          </div>
        </div>
      </section>

      <section className={styles['components__section']}>
        <h2 className={styles['components__section-title']}>Search Input</h2>
        <div className={styles['components__button-block']}>
          <div className={styles['components__button-row']}>
            <span className={styles['components__instance-label']}>Sizes</span>
            <SearchInput size="Small" placeholder="Small search..." />
            <SearchInput size="Medium" placeholder="Medium search..." />
            <SearchInput size="Large" placeholder="Large search..." />
          </div>
          <div className={styles['components__button-row']}>
            <span className={styles['components__instance-label']}>
              With label
            </span>
            <SearchInput
              label="Search channels"
              placeholder="Find a channel..."
            />
          </div>
        </div>
      </section>

      <section className={styles['components__section']}>
        <h2 className={styles['components__section-title']}>
          Search Tip Banner
        </h2>
        <div className={styles['components__button-block']}>
          <div className={styles['components__button-row']}>
            <span className={styles['components__instance-label']}>
              Default
            </span>
            <SearchTipBanner onDismiss={() => {}} />
          </div>
          <div className={styles['components__button-row']}>
            <span className={styles['components__instance-label']}>
              Custom keys
            </span>
            <SearchTipBanner
              prefix="Tip: Use"
              suffix="to open quick switcher"
              shortcutKeys={[{ label: '⌘' }, { label: 'K' }]}
              onDismiss={() => {}}
            />
          </div>
        </div>
      </section>

      <section className={styles['components__section']}>
        <h2 className={styles['components__section-title']}>Section Notice</h2>
        <div className={styles['components__button-block']}>
          <SectionNotice
            type="Info"
            title="Email notifications are enabled."
            description="You will receive notifications at your registered email address."
          />
          <SectionNotice
            type="Warning"
            title="Your session will expire soon."
            description="Save your work before the session ends."
            primaryButtonLabel="Extend session"
            onPrimaryAction={() => {}}
          />
          <SectionNotice
            type="Danger"
            title="This action cannot be undone."
            description="Deleting this workspace will permanently remove all data."
            primaryButtonLabel="Delete"
            onPrimaryAction={() => {}}
            secondaryButtonLabel="Cancel"
            onSecondaryAction={() => {}}
          />
          <SectionNotice
            type="Success"
            title="Configuration saved successfully."
            onDismiss={() => {}}
          />
          <SectionNotice
            type="Hint"
            title="Tip: You can drag and drop files to upload them."
            icon={<Icon size="20" glyph={<LightbulbOutlineIcon />} />}
            onDismiss={() => {}}
          />
        </div>
      </section>

      <section className={styles['components__section']}>
        <h2 className={styles['components__section-title']}>Select</h2>
        <div className={styles['components__button-block']}>
          <div className={styles['components__button-row']}>
            <span className={styles['components__instance-label']}>Sizes</span>
            <Select size="Small" label="Small">
              <option value="">Select…</option>
              <option value="a">Option A</option>
              <option value="b">Option B</option>
            </Select>
            <Select size="Medium" label="Medium">
              <option value="">Select…</option>
              <option value="a">Option A</option>
              <option value="b">Option B</option>
            </Select>
            <Select size="Large" label="Large">
              <option value="">Select…</option>
              <option value="a">Option A</option>
              <option value="b">Option B</option>
            </Select>
          </div>
          <div className={styles['components__button-row']}>
            <span className={styles['components__instance-label']}>States</span>
            <Select label="Invalid" invalid defaultValue="">
              <option value="">Select…</option>
              <option value="a">Option A</option>
            </Select>
            <Select label="Disabled" disabled defaultValue="">
              <option value="">Select…</option>
              <option value="a">Option A</option>
            </Select>
          </div>
        </div>
      </section>

      <section className={styles['components__section']}>
        <h2 className={styles['components__section-title']}>Spinner</h2>
        <div className={styles['components__button-block']}>
          <div className={styles['components__button-row']}>
            <span className={styles['components__instance-label']}>Sizes</span>
            <Spinner size={10} />
            <Spinner size={12} />
            <Spinner size={16} />
            <Spinner size={20} />
            <Spinner size={24} />
            <Spinner size={28} />
            <Spinner size={32} />
          </div>
          <div
            className={[
              styles['components__button-row'],
              styles['components__button-row--inverted-bg'],
            ].join(' ')}
          >
            <span className={styles['components__instance-label']}>
              Inverted
            </span>
            <Spinner size={16} inverted />
            <Spinner size={20} inverted />
            <Spinner size={24} inverted />
          </div>
        </div>
      </section>

      <section className={styles['components__section']}>
        <h2 className={styles['components__section-title']}>Status Badge</h2>
        <p
          className={styles['components__subheading']}
          style={{ marginBottom: 'var(--spacing-m)' }}
        >
          Figma Status Badge v2.0.1 — standalone; also used on UserAvatar when
          status is on.
        </p>
        <div className={styles['components__button-block']}>
          <div className={styles['components__button-row']}>
            <span className={styles['components__instance-label']}>Status</span>
            <StatusBadge status="Online" />
            <StatusBadge status="Away" />
            <StatusBadge status="Do Not Disturb" />
            <StatusBadge status="Offline" />
          </div>
          <div className={styles['components__button-row']}>
            <span className={styles['components__instance-label']}>Sizes</span>
            <StatusBadge size="XX-Small" status="Online" />
            <StatusBadge size="X-Small" status="Online" />
            <StatusBadge size="Small" status="Online" />
            <StatusBadge size="Medium" status="Online" />
            <StatusBadge size="Large" status="Online" />
          </div>
        </div>
      </section>

      <section className={styles['components__section']}>
        <h2 className={styles['components__section-title']}>Switch</h2>
        <p
          className={styles['components__subheading']}
          style={{ marginBottom: 'var(--spacing-m)' }}
        >
          Native HTML checkbox with <code>role="switch"</code> for toggle
          semantics. Figma Switch v2.0.0 — track + sliding knob; checked = on
          (right), unchecked = off (left).
        </p>
        <div className={styles['components__button-block']}>
          <div className={styles['components__button-row']}>
            <span className={styles['components__instance-label']}>States</span>
            <Switch size="Medium">Unchecked</Switch>
            <Switch size="Medium" defaultChecked>
              Checked
            </Switch>
          </div>
          <div className={styles['components__button-row']}>
            <span className={styles['components__instance-label']}>Sizes</span>
            <Switch size="Small">Small</Switch>
            <Switch size="Medium" defaultChecked>
              Medium
            </Switch>
            <Switch size="Large" defaultChecked>
              Large
            </Switch>
          </div>
          <div className={styles['components__button-row']}>
            <span className={styles['components__instance-label']}>
              With secondary label
            </span>
            <Switch size="Medium" secondaryLabel="Optional description text">
              Label
            </Switch>
            <Switch
              size="Medium"
              defaultChecked
              secondaryLabel="Optional description"
            >
              Label
            </Switch>
          </div>
          <div className={styles['components__button-row']}>
            <span className={styles['components__instance-label']}>
              Semi-bold & disabled
            </span>
            <Switch size="Medium" semiBold>
              Semi-bold label
            </Switch>
            <Switch size="Medium" disabled>
              Disabled unchecked
            </Switch>
            <Switch size="Medium" defaultChecked disabled>
              Disabled checked
            </Switch>
          </div>
        </div>
      </section>

      <section className={styles['components__section']}>
        <h2 className={styles['components__section-title']}>Tabs</h2>
        <div className={styles['components__button-block']}>
          <div className={styles['components__button-row']}>
            <span className={styles['components__instance-label']}>
              Default
            </span>
            <Tabs
              tabs={[
                { key: 'messages', label: 'Messages' },
                { key: 'files', label: 'Files', countBadge: 12 },
                { key: 'pinned', label: 'Pinned', unreadBadge: true },
                { key: 'members', label: 'Members' },
              ]}
              activeKey="messages"
              onChange={() => {}}
            />
          </div>
        </div>
      </section>

      <section className={styles['components__section']}>
        <h2 className={styles['components__section-title']}>Tags</h2>
        <div className={styles['components__button-block']}>
          <div className={styles['components__button-row']}>
            <span className={styles['components__instance-label']}>Types</span>
            <Tags type="General">General</Tags>
            <Tags type="Info">Info</Tags>
            <Tags type="Danger">Danger</Tags>
            <Tags type="Success">Success</Tags>
            <Tags type="Warning">Warning</Tags>
            <Tags type="Info Dim">Info Dim</Tags>
          </div>
          <div className={styles['components__button-row']}>
            <span className={styles['components__instance-label']}>Sizes</span>
            <Tags size="X-Small" type="Info">
              X-Small
            </Tags>
            <Tags size="Small" type="Info">
              Small
            </Tags>
          </div>
          <div className={styles['components__button-row']}>
            <span className={styles['components__instance-label']}>
              All caps
            </span>
            <Tags type="General" casing="All Caps">
              professional
            </Tags>
            <Tags type="Success" casing="All Caps">
              active
            </Tags>
          </div>
        </div>
      </section>

      <section className={styles['components__section']}>
        <h2 className={styles['components__section-title']}>Team Avatar</h2>
        <div
          className={`${styles['components__button-block']} ${styles['components__button-block--sidebar-header-bg']}`}
        >
          <div className={styles['components__button-row']}>
            <span className={styles['components__instance-label']}>
              Default — Image (hover to preview)
            </span>
            <TeamAvatar src={avatarStaffTeam} alt="Staff Team" size="24" />
            <TeamAvatar src={avatarStaffTeam} alt="Staff Team" size="32" />
            <TeamAvatar src={avatarStaffTeam} alt="Staff Team" size="40" />
            <TeamAvatar src={avatarStaffTeam} alt="Staff Team" size="48" />
            <TeamAvatar src={avatarStaffTeam} alt="Staff Team" size="56" />
            <TeamAvatar src={avatarStaffTeam} alt="Staff Team" size="64" />
          </div>
          <div className={styles['components__button-row']}>
            <span className={styles['components__instance-label']}>
              Active — Image
            </span>
            <TeamAvatar
              src={avatarStaffTeam}
              alt="Staff Team"
              size="24"
              state="Active"
            />
            <TeamAvatar
              src={avatarStaffTeam}
              alt="Staff Team"
              size="32"
              state="Active"
            />
            <TeamAvatar
              src={avatarStaffTeam}
              alt="Staff Team"
              size="40"
              state="Active"
            />
            <TeamAvatar
              src={avatarStaffTeam}
              alt="Staff Team"
              size="48"
              state="Active"
            />
            <TeamAvatar
              src={avatarStaffTeam}
              alt="Staff Team"
              size="56"
              state="Active"
            />
            <TeamAvatar
              src={avatarStaffTeam}
              alt="Staff Team"
              size="64"
              state="Active"
            />
          </div>
          <div className={styles['components__button-row']}>
            <span className={styles['components__instance-label']}>
              Default — Fallback (hover to preview)
            </span>
            <TeamAvatar initials="Ac" alt="Core Team" size="24" />
            <TeamAvatar initials="Ac" alt="Core Team" size="32" />
            <TeamAvatar initials="Ac" alt="Core Team" size="40" />
            <TeamAvatar initials="Ac" alt="Core Team" size="48" />
            <TeamAvatar initials="Ac" alt="Core Team" size="56" />
            <TeamAvatar initials="Ac" alt="Core Team" size="64" />
          </div>
          <div className={styles['components__button-row']}>
            <span className={styles['components__instance-label']}>
              Active — Fallback
            </span>
            <TeamAvatar
              initials="Ac"
              alt="Design Team"
              size="24"
              state="Active"
            />
            <TeamAvatar
              initials="Ac"
              alt="Design Team"
              size="32"
              state="Active"
            />
            <TeamAvatar
              initials="Ac"
              alt="Design Team"
              size="40"
              state="Active"
            />
            <TeamAvatar
              initials="Ac"
              alt="Design Team"
              size="48"
              state="Active"
            />
            <TeamAvatar
              initials="Ac"
              alt="Design Team"
              size="56"
              state="Active"
            />
            <TeamAvatar
              initials="Ac"
              alt="Design Team"
              size="64"
              state="Active"
            />
          </div>
          <div className={styles['components__button-row']}>
            <span className={styles['components__instance-label']}>Badge</span>
            <TeamAvatar
              src={avatarStaffTeam}
              alt="Staff Team"
              size="32"
              badge={1}
            />
            <TeamAvatar
              src={avatarStaffTeam}
              alt="Staff Team"
              size="40"
              badge={5}
            />
            <TeamAvatar
              src={avatarStaffTeam}
              alt="Staff Team"
              size="56"
              badge={99}
            />
          </div>
        </div>
      </section>

      <section className={styles['components__section']}>
        <h2 className={styles['components__section-title']}>Text Area</h2>
        <div className={styles['components__button-block']}>
          <div className={styles['components__button-row']}>
            <span className={styles['components__instance-label']}>Sizes</span>
            <TextArea size="Small" placeholder="Small…" />
            <TextArea size="Medium" placeholder="Medium…" />
            <TextArea size="Large" placeholder="Large…" />
          </div>
          <div className={styles['components__button-row']}>
            <span className={styles['components__instance-label']}>
              With label
            </span>
            <TextArea label="Description" placeholder="Enter a description…" />
            <TextArea
              label="With value"
              defaultValue="Some existing content here."
            />
          </div>
          <div className={styles['components__button-row']}>
            <span className={styles['components__instance-label']}>
              Character counter & invalid
            </span>
            <TextArea
              label="Bio"
              placeholder="Write your bio…"
              maxLength={200}
              showCharacterCount
            />
            <TextArea
              label="Error field"
              invalid
              placeholder="Required field"
            />
          </div>
          <div className={styles['components__button-row']}>
            <span className={styles['components__instance-label']}>
              Disabled & read-only
            </span>
            <TextArea label="Disabled" disabled placeholder="Disabled" />
            <TextArea
              label="Read-only"
              readOnly
              defaultValue="Read only content."
            />
          </div>
        </div>
      </section>

      <section className={styles['components__section']}>
        <h2 className={styles['components__section-title']}>Text Input</h2>
        <p
          className={styles['components__subheading']}
          style={{ marginBottom: 'var(--spacing-m)' }}
        >
          Figma Text Input v2.0.1 (Border=On). Floating label when{' '}
          <code>label</code> is provided: resting when empty/unfocused, floated
          when focused or has value. Theme variables only.
        </p>
        <div className={styles['components__button-block']}>
          <div className={styles['components__button-row']}>
            <span className={styles['components__instance-label']}>Sizes</span>
            <TextInput size="Small" placeholder="Small" />
            <TextInput size="Medium" placeholder="Medium" />
            <TextInput size="Large" placeholder="Large" />
          </div>
          <div className={styles['components__button-row']}>
            <span className={styles['components__instance-label']}>
              With / without label
            </span>
            <TextInput label="Label" placeholder="Placeholder" />
            <TextInput placeholder="No label" />
            <TextInput label="With value" defaultValue="Some text" />
          </div>
          <div className={styles['components__button-row']}>
            <span className={styles['components__instance-label']}>
              Leading / trailing icons
            </span>
            <TextInput
              label="Search"
              placeholder="Search..."
              leadingIcon={<Icon glyph={<GlobeIcon />} size="16" />}
            />
            <TextInput
              placeholder="Trailing only"
              trailingIcon={<Icon glyph={<GlobeIcon />} size="16" />}
            />
            <TextInput
              label="Both"
              placeholder="Leading and trailing"
              leadingIcon={<Icon glyph={<GlobeIcon />} size="16" />}
              trailingIcon={<Icon glyph={<GlobeIcon />} size="16" />}
            />
          </div>
          <div className={styles['components__button-row']}>
            <span className={styles['components__instance-label']}>
              Invalid
            </span>
            <TextInput label="Error" invalid placeholder="Invalid state" />
            <TextInput
              label="Error with value"
              invalid
              defaultValue="Invalid"
            />
          </div>
          <div className={styles['components__button-row']}>
            <span className={styles['components__instance-label']}>
              Character counter
            </span>
            <TextInput
              label="Description"
              placeholder="Enter text..."
              maxLength={100}
              showCharacterCount
            />
            <TextInput
              label="With value"
              defaultValue="Already filled"
              maxLength={50}
              showCharacterCount
            />
          </div>
          <div className={styles['components__button-row']}>
            <span className={styles['components__instance-label']}>
              Disabled & read-only
            </span>
            <TextInput label="Disabled" disabled placeholder="Disabled" />
            <TextInput
              label="Read-only"
              readOnly
              defaultValue="Read only value"
            />
          </div>
        </div>
      </section>

      <section className={styles['components__section']}>
        <h2 className={styles['components__section-title']}>Thread Footer</h2>
        <div className={styles['components__button-block']}>
          <div className={styles['components__button-row']}>
            <span className={styles['components__instance-label']}>
              Default
            </span>
            <ThreadFooter
              replyCount={4}
              avatars={[
                { src: avatarLeonard, alt: 'Leonard Riley' },
                { src: avatarDanielle, alt: 'Danielle Okoro' },
                { src: avatarMarco, alt: 'Marco Rinaldi' },
              ]}
            />
          </div>
          <div className={styles['components__button-row']}>
            <span className={styles['components__instance-label']}>
              Following
            </span>
            <ThreadFooter
              replyCount={2}
              avatars={[
                { src: avatarEmma, alt: 'Emma Novak' },
                { src: avatarSofia, alt: 'Sofia Bauer' },
              ]}
              following
              lastReplyTime="2 mins ago"
            />
          </div>
          <div className={styles['components__button-row']}>
            <span className={styles['components__instance-label']}>Badges</span>
            <ThreadFooter
              replyCount={3}
              badge="Unread"
              avatars={[{ src: avatarLeonard, alt: 'Leonard' }]}
            />
            <ThreadFooter
              replyCount={1}
              badge="Mention"
              avatars={[{ src: avatarDanielle, alt: 'Danielle' }]}
            />
          </div>
        </div>
      </section>

      <section className={styles['components__section']}>
        <h2 className={styles['components__section-title']}>
          Thread List Item
        </h2>
        <div className={styles['components__button-block']}>
          <div className={styles['components__button-row']}>
            <span className={styles['components__instance-label']}>
              Default
            </span>
            <ThreadListItem />
          </div>
          <div className={styles['components__button-row']}>
            <span className={styles['components__instance-label']}>
              Active & unread
            </span>
            <ThreadListItem active />
            <ThreadListItem
              badge="Unread"
              authorName="Danielle Okoro"
              channelLabel="DESIGN TEAM"
              replyCount={7}
              timestamp="12 mins ago"
            />
          </div>
        </div>
      </section>

      <section className={styles['components__section']}>
        <h2 className={styles['components__section-title']}>Toast Banner</h2>
        <div className={styles['components__button-block']}>
          <ToastBanner
            message="Link copied to clipboard."
            type="General"
            onDismiss={() => {}}
          />
          <ToastBanner
            message="Message saved successfully."
            type="Success"
            onDismiss={() => {}}
          />
          <ToastBanner
            message="Failed to send message. Please try again."
            type="Danger"
            actionLabel="Retry"
            onAction={() => {}}
            onDismiss={() => {}}
          />
          <ToastBanner
            message="Your session will expire in 5 minutes."
            type="Warning"
            onDismiss={() => {}}
          />
          <ToastBanner
            message="New update available. Refresh to apply."
            type="Info"
            actionLabel="Refresh"
            onAction={() => {}}
            onDismiss={() => {}}
          />
        </div>
      </section>

      <section className={styles['components__section']}>
        <h2 className={styles['components__section-title']}>Tooltip</h2>
        <div className={styles['components__button-block']}>
          <div className={styles['components__button-row']}>
            <span className={styles['components__instance-label']}>Arrows</span>
            <Tooltip label="Top arrow" arrow="Top" />
            <Tooltip label="Right arrow" arrow="Right" />
            <Tooltip label="Bottom arrow" arrow="Bottom" />
            <Tooltip label="Left arrow" arrow="Left" />
          </div>
          <div className={styles['components__button-row']}>
            <span className={styles['components__instance-label']}>
              With shortcut & hint
            </span>
            <Tooltip
              label="Bold"
              arrow="Bottom"
              shortcutKeys={[{ label: '⌘' }, { label: 'B' }]}
            />
            <Tooltip
              label="Open quick switcher"
              arrow="Right"
              hint="Jump to any channel or direct message"
              shortcutKeys={[{ label: '⌘' }, { label: 'K' }]}
            />
          </div>
        </div>
      </section>

      <section className={styles['components__section']}>
        <h2 className={styles['components__section-title']}>Unread Badge</h2>
        <div className={styles['components__button-block']}>
          <div className={styles['components__button-row']}>
            <span className={styles['components__instance-label']}>Sizes</span>
            <UnreadBadge size="6" context="Team Icon" />
            <UnreadBadge size="8" context="Team Icon" />
          </div>
          <div className={styles['components__button-row']}>
            <span className={styles['components__instance-label']}>
              Contexts
            </span>
            <UnreadBadge size="8" context="Team Icon" />
            <UnreadBadge size="8" context="Icon Button" />
          </div>
        </div>
      </section>

      <section className={styles['components__section']}>
        <h2 className={styles['components__section-title']}>User Avatar</h2>
        <p
          className={styles['components__subheading']}
          style={{ marginBottom: 'var(--spacing-m)' }}
        >
          User Avatar (Image type only; Fallback and System variants not
          implemented).
        </p>
        <div className={styles['components__row']}>
          <div className={styles['components__instance']}>
            <span className={styles['components__instance-label']}>
              24, no status
            </span>
            <UserAvatar alt="Leonard Riley" src={avatarLeonard} size="24" />
          </div>
          <div className={styles['components__instance']}>
            <span className={styles['components__instance-label']}>32</span>
            <UserAvatar alt="Danielle Okoro" src={avatarDanielle} size="32" />
          </div>
          <div className={styles['components__instance']}>
            <span className={styles['components__instance-label']}>
              48 (default), status
            </span>
            <UserAvatar
              alt="Marco Rinaldi"
              src={avatarMarco}
              size="48"
              status
            />
          </div>
          <div className={styles['components__instance']}>
            <span className={styles['components__instance-label']}>64</span>
            <UserAvatar alt="Emma Novak" src={avatarEmma} size="64" />
          </div>
          <div className={styles['components__instance']}>
            <span className={styles['components__instance-label']}>
              96, status
            </span>
            <UserAvatar alt="Sofia Bauer" src={avatarSofia} size="96" status />
          </div>
        </div>
      </section>

      <section className={styles['components__section']}>
        <h2 className={styles['components__section-title']}>
          User Avatar Group
        </h2>
        <div className={styles['components__button-block']}>
          {(['24', '32', '40'] as const).map((size) => (
            <div key={size} className={styles['components__button-row']}>
              <span className={styles['components__instance-label']}>
                {size}
              </span>
              <UserAvatarGroup
                size={size}
                avatars={[
                  { key: 'leonard', src: avatarLeonard, name: 'Leonard Riley' },
                  {
                    key: 'danielle',
                    src: avatarDanielle,
                    name: 'Danielle Okoro',
                  },
                  { key: 'marco', src: avatarMarco, name: 'Marco Rinaldi' },
                  { key: 'emma', src: avatarEmma, name: 'Emma Novak' },
                  { key: 'sofia', src: avatarSofia, name: 'Sofia Bauer' },
                ]}
                max={3}
              />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
