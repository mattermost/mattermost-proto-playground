import { useState } from 'react';
import CreationOutlineIcon from '@mattermost/compass-icons/components/creation-outline';
import Button from '@/components/ui/Button/Button';
import ChannelHeader from '@/components/ui/ChannelHeader/ChannelHeader';
import ChannelShell from '@/components/ui/ChannelShell/ChannelShell';
import GlobalBanner from '@/components/ui/GlobalBanner/GlobalBanner';
import Icon from '@/components/ui/Icon/Icon';
import Message from '@/components/ui/Message/Message';
import MessageInput from '@/components/ui/MessageInput';
import MessageSeparator from '@/components/ui/MessageSeparator/MessageSeparator';
import RightSidebar, {
  RightSidebarHeader,
} from '@/components/ui/RightSidebar';
import Scrollbars from '@/components/ui/Scrollbars/Scrollbars';
import SceneSwitcher from '@/components/navigation/SceneSwitcher/SceneSwitcher';
import TourPoint from '@/components/ui/TourPoint/TourPoint';
import shellStyles from '@/components/ui/ChannelShell/ChannelShell.module.scss';
import {
  AGENT,
  WORKSPACE_NAME,
  buildStandardSidebarModel,
} from '../onboarding.fixtures';
import styles from './FeatureIntroVignette.module.scss';

type Pattern = 'whats-new' | 'coachmark' | 'pre-alpha-banner';

const PATTERNS: { id: Pattern; label: string }[] = [
  { id: 'whats-new', label: "What's new (passive)" },
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
  const [whatsNewOpen, setWhatsNewOpen] = useState(false);
  const [coachmarkDismissed, setCoachmarkDismissed] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  return (
    <div className={styles['feature-intro']}>
      <div className={styles['feature-intro__sub-switcher']}>
        <SceneSwitcher
          scenes={PATTERNS}
          activeId={pattern}
          onChange={(id) => setPattern(id as Pattern)}
          ariaLabel="Feature introduction pattern"
        />
      </div>

      <div className={styles['feature-intro__stage']}>
        <ChannelShell
          channelsSidebarModel={buildStandardSidebarModel({
            activeChannel: 'Engineering',
          })}
          teamName={WORKSPACE_NAME}
          channelHeader={
            <ChannelHeader
              type="Channel"
              name="Engineering"
              description="Builds, deploys, ops"
              memberCount={28}
              callButton={
                pattern === 'coachmark' ? (
                  <div className={styles['feature-intro__agent-anchor']}>
                    <Button
                      emphasis="Tertiary"
                      size="Small"
                      leadingIcon={
                        <Icon size="16" glyph={<CreationOutlineIcon />} />
                      }
                    >
                      Agent
                    </Button>
                  </div>
                ) : undefined
              }
            />
          }
          trailing={
            pattern === 'whats-new' && whatsNewOpen ? (
              <RightSidebar
                header={
                  <RightSidebarHeader
                    title="What’s new"
                    labelTag="3"
                    labelTagType="Info"
                    onClose={() => setWhatsNewOpen(false)}
                  />
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
                        Learn more
                      </a>
                    </article>
                  ))}
                </div>
              </RightSidebar>
            ) : undefined
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

        {pattern === 'whats-new' && (
          <button
            type="button"
            className={styles['feature-intro__help-dot']}
            onClick={() => setWhatsNewOpen((open) => !open)}
            aria-label="Open what's new"
          >
            <span className={styles['feature-intro__dot']} aria-hidden />
            Help
          </button>
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
      </div>
    </div>
  );
}
