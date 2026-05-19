import { useRef, useState } from 'react';
import AlertOutlineIcon from '@mattermost/compass-icons/components/alert-outline';
import CreationOutlineIcon from '@mattermost/compass-icons/components/creation-outline';
import FileTextOutlineIcon from '@mattermost/compass-icons/components/file-text-outline';
import HelpCircleOutlineIcon from '@mattermost/compass-icons/components/help-circle-outline';
import KeyboardOutlineIcon from '@mattermost/compass-icons/components/keyboard-outline';
import LightbulbOutlineIcon from '@mattermost/compass-icons/components/lightbulb-outline';
import StarOutlineIcon from '@mattermost/compass-icons/components/star-outline';
import Button from '@/components/ui/Button/Button';
import ChannelHeader from '@/components/ui/ChannelHeader/ChannelHeader';
import ChannelShell from '@/components/ui/ChannelShell/ChannelShell';
import GlobalBanner from '@/components/ui/GlobalBanner/GlobalBanner';
import Icon from '@/components/ui/Icon/Icon';
import MenuItem from '@/components/ui/MenuItem/MenuItem';
import Message from '@/components/ui/Message/Message';
import MessageInput from '@/components/ui/MessageInput';
import MessageSeparator from '@/components/ui/MessageSeparator/MessageSeparator';
import Modal from '@/components/ui/Modal/Modal';
import PopoverMenu, {
  PopoverMenuDivider,
  PopoverMenuGroup,
} from '@/components/ui/PopoverMenu';
import Scrollbars from '@/components/ui/Scrollbars/Scrollbars';
import SceneSwitcher from '@/components/navigation/SceneSwitcher/SceneSwitcher';
import TourPoint from '@/components/ui/TourPoint/TourPoint';
import { useOutsideClose } from '@/hooks/useOutsideClose';
import shellStyles from '@/components/ui/ChannelShell/ChannelShell.module.scss';
import {
  AGENT,
  WORKSPACE_NAME,
  buildStandardSidebarModel,
} from '../onboarding.fixtures';
import styles from './FeatureIntroVignette.module.scss';

type Pattern = 'whats-new' | 'coachmark' | 'pre-alpha-banner';

const PATTERNS: { id: Pattern; label: string }[] = [
  { id: 'whats-new', label: 'Help menu · What’s new badge' },
  { id: 'coachmark', label: 'Coachmark (in-context)' },
  { id: 'pre-alpha-banner', label: 'Pre-alpha banner' },
];

const WHATS_NEW_ITEMS = [
  {
    title: 'Mattermost Agent in channels',
    blurb:
      'Summon Agent from any channel for summaries, drafts, and decision history.',
  },
  {
    title: 'Scheduled posts',
    blurb: 'Compose now, deliver later — works across time zones.',
  },
  {
    title: 'Playbooks 2.0',
    blurb: 'Streamlined run UI and improved status updates.',
  },
];

export default function FeatureIntroVignette() {
  const [pattern, setPattern] = useState<Pattern>('whats-new');
  const [helpMenuOpen, setHelpMenuOpen] = useState(false);
  const [whatsNewSeen, setWhatsNewSeen] = useState(false);
  const [whatsNewModalOpen, setWhatsNewModalOpen] = useState(false);
  const [coachmarkDismissed, setCoachmarkDismissed] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const helpMenuRef = useRef<HTMLDivElement>(null);

  useOutsideClose(helpMenuRef, helpMenuOpen, () => setHelpMenuOpen(false));

  const showHelpDot = pattern === 'whats-new' && !whatsNewSeen;

  const openWhatsNew = () => {
    setWhatsNewSeen(true);
    setHelpMenuOpen(false);
    setWhatsNewModalOpen(true);
  };

  return (
    <div className={styles['feature-intro']}>
      <div className={styles['feature-intro__sub-switcher']}>
        <SceneSwitcher
          scenes={PATTERNS}
          activeId={pattern}
          onChange={(id) => {
            setPattern(id as Pattern);
            setHelpMenuOpen(false);
          }}
          ariaLabel="Feature introduction pattern"
        />
      </div>

      <div className={styles['feature-intro__stage']}>
        <ChannelShell
          channelsSidebarModel={buildStandardSidebarModel({
            activeChannel: 'Engineering',
          })}
          teamName={WORKSPACE_NAME}
          helpDotBadge={showHelpDot}
          onHelpClick={
            pattern === 'whats-new'
              ? () => setHelpMenuOpen((o) => !o)
              : undefined
          }
          channelHeader={
            <ChannelHeader
              type="Channel"
              name="Engineering"
              description="Builds, deploys, ops"
              memberCount={28}
              callButton={
                pattern === 'coachmark' ? (
                  <Button
                    emphasis="Tertiary"
                    size="Small"
                    leadingIcon={
                      <Icon size="16" glyph={<CreationOutlineIcon />} />
                    }
                  >
                    Agent
                  </Button>
                ) : undefined
              }
            />
          }
        >
          {pattern === 'pre-alpha-banner' && !bannerDismissed && (
            <GlobalBanner
              type="Info"
              message="Wikis · Pre-alpha — feedback welcome"
              actionLabel="Share feedback"
              onAction={() => undefined}
              onDismiss={() => setBannerDismissed(true)}
            />
          )}
          <div className={shellStyles['channel-shell__messages']}>
            <Scrollbars>
              <div className={shellStyles['channel-shell__messages-list']}>
                <MessageSeparator type="Date" label="Today" />
                <Message
                  avatarSrc={AGENT.avatarSrc}
                  avatarAlt={AGENT.name}
                  username={AGENT.name}
                  timestamp="9:14 AM"
                  isBot
                  botLabel={AGENT.botLabel}
                >
                  <p className={shellStyles['channel-shell__post-text']}>
                    {pattern === 'pre-alpha-banner'
                      ? 'Wikis is in pre-alpha. Try it on a sandbox channel and share what feels rough.'
                      : 'Engineering is the home for builds, deploys, and ops. Pin runbooks at the top so they’re easy to find.'}
                  </p>
                </Message>
              </div>
            </Scrollbars>
          </div>
          <div className={shellStyles['channel-shell__message-input']}>
            <MessageInput placeholder="Write to Engineering" />
          </div>
        </ChannelShell>

        {pattern === 'whats-new' && helpMenuOpen && (
          <div
            ref={helpMenuRef}
            className={styles['feature-intro__help-menu']}
          >
            <PopoverMenu style={{ width: '256px' }}>
              <PopoverMenuGroup>
                <MenuItem
                  label="What’s new"
                  leadingVisual={
                    <Icon glyph={<StarOutlineIcon />} size="16" />
                  }
                  trailingElement
                  trailingVisual={
                    !whatsNewSeen ? (
                      <span
                        className={styles['feature-intro__menu-dot']}
                        aria-label="Unread"
                      />
                    ) : (
                      <span aria-hidden />
                    )
                  }
                  onClick={openWhatsNew}
                />
              </PopoverMenuGroup>
              <PopoverMenuDivider />
              <PopoverMenuGroup>
                <MenuItem
                  label="Mattermost user guide"
                  leadingVisual={
                    <Icon glyph={<FileTextOutlineIcon />} size="16" />
                  }
                />
                <MenuItem
                  label="Training resources"
                  leadingVisual={
                    <Icon glyph={<LightbulbOutlineIcon />} size="16" />
                  }
                />
                <MenuItem
                  label="Ask the community"
                  leadingVisual={
                    <Icon glyph={<HelpCircleOutlineIcon />} size="16" />
                  }
                />
                <MenuItem
                  label="Report a problem"
                  leadingVisual={
                    <Icon glyph={<AlertOutlineIcon />} size="16" />
                  }
                />
                <MenuItem
                  label="Keyboard shortcuts"
                  leadingVisual={
                    <Icon glyph={<KeyboardOutlineIcon />} size="16" />
                  }
                />
              </PopoverMenuGroup>
            </PopoverMenu>
          </div>
        )}

        {pattern === 'coachmark' && !coachmarkDismissed && (
          <div className={styles['feature-intro__coachmark']}>
            <TourPoint
              title="Meet Mattermost Agent"
              pointerPosition="top-right"
              onClose={() => setCoachmarkDismissed(true)}
              primaryAction={{
                label: 'Try Agent',
                onClick: () => setCoachmarkDismissed(true),
              }}
            >
              Summon Agent right from the channel header to summarize threads or
              find decisions.
            </TourPoint>
          </div>
        )}

        {whatsNewModalOpen && (
          <div className={styles['feature-intro__modal-scrim']}>
            <Modal
              size="Medium"
              title="What’s new in Mattermost"
              subtitle="Recently shipped features worth checking out"
              onClose={() => setWhatsNewModalOpen(false)}
              footer={
                <div className={styles['feature-intro__modal-footer']}>
                  <Button
                    emphasis="Tertiary"
                    onClick={() => setWhatsNewModalOpen(false)}
                  >
                    Close
                  </Button>
                  <Button
                    emphasis="Primary"
                    onClick={() => setWhatsNewModalOpen(false)}
                  >
                    See all updates
                  </Button>
                </div>
              }
            >
              <div className={styles['feature-intro__whats-new']}>
                {WHATS_NEW_ITEMS.map((item) => (
                  <article
                    key={item.title}
                    className={styles['feature-intro__release-card']}
                  >
                    <div
                      className={styles['feature-intro__release-thumb']}
                      aria-hidden
                    />
                    <div className={styles['feature-intro__release-body']}>
                      <h3 className={styles['feature-intro__release-title']}>
                        {item.title}
                      </h3>
                      <p className={styles['feature-intro__release-blurb']}>
                        {item.blurb}
                      </p>
                      <a
                        href="#"
                        className={styles['feature-intro__release-link']}
                      >
                        Learn more →
                      </a>
                    </div>
                  </article>
                ))}
              </div>
            </Modal>
          </div>
        )}
      </div>
    </div>
  );
}
