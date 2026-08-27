import { useCallback, useRef, useState } from 'react';
import CogOutlineIcon from '@mattermost/compass-icons/components/cog-outline';
import Checkbox from '@/components/ui/Checkbox/Checkbox';
import FixedPopoverMenu from '@/components/ui/FixedPopoverMenu/FixedPopoverMenu';
import Icon from '@/components/ui/Icon/Icon';
import IconButton from '@/components/ui/IconButton/IconButton';
import PopoverMenu, {
  PopoverMenuDivider,
  PopoverMenuTitle,
} from '@/components/ui/PopoverMenu/PopoverMenu';
import SceneSwitcher from '@/components/navigation/SceneSwitcher/SceneSwitcher';
import avatarLeonard from '@/assets/avatars/Leonard Riley.png';
import ChannelAttributesView from '@/pages/AttributeHubTeamSettings/ChannelAttributesView';
import ChannelClassificationBanner from '@/pages/AttributeHubTeamSettings/ChannelClassificationBanner';
import ChannelSettingsModal from '@/pages/AttributeHubTeamSettings/ChannelSettingsModal';
import { CHANNEL_VIEW_FIGMA_SEED } from '@/pages/AttributeHubTeamSettings/channelViewData';
import {
  clearChannelAttributeDetailParams,
  clearChannelNewAttributeParams,
  syncChannelAttributeDetailParams,
  syncChannelNewAttributeParams,
} from '@/pages/AttributeHubTeamSettings/channelData';
import { THREAD_ROOT, type ThreadDemoPost } from '@/pages/AttributeHubTeamSettings/postViewData';
import styles from './ChannelAttributesChannelView.module.scss';

const HEADER_LAYOUT_SCENES = [
  { id: 'stacked', label: 'Stacked' },
  { id: 'inline', label: 'Inline' },
] as const;

type HeaderLayout = (typeof HEADER_LAYOUT_SCENES)[number]['id'];

const RHS_SCENES = [
  { id: 'info', label: 'Info RHS' },
  { id: 'thread', label: 'Thread RHS' },
] as const;

type RhsPanel = (typeof RHS_SCENES)[number]['id'];

const GLOBAL_BANNER = {
  valueId: 's',
  label: 'SECRET',
} as const;

const FIGMA_LEONARD_POST: ThreadDemoPost = {
  ...THREAD_ROOT,
  avatarSrc: avatarLeonard,
  attributes: [
    { attributeId: 'classification', valueId: 'u', overridden: true },
    { attributeId: 'caveat', valueId: 'cav-noforn', overridden: true },
    { attributeId: 'mission-phase', valueId: 'mp-exec', overridden: true },
    { attributeId: 'engagement-tempo', valueId: 'et-surge', overridden: true },
  ],
};

/**
 * Channel view with attribute chips in the header and configurable classification
 * banners — global, channel, and reply (thread RHS). Matches Channel Attributes
 * Figma (4863:33132).
 */
export default function ChannelAttributesChannelView() {
  const settingsTriggerRef = useRef<HTMLDivElement>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [showGlobalBanner, setShowGlobalBanner] = useState(true);
  const [showChannelBanner, setShowChannelBanner] = useState(true);
  const [showReplyBanner, setShowReplyBanner] = useState(true);
  const [showChannelHeaderText, setShowChannelHeaderText] = useState(false);
  const [showBookmarksBar, setShowBookmarksBar] = useState(true);
  const [headerAttributeLayout, setHeaderAttributeLayout] =
    useState<HeaderLayout>('inline');
  const [rhsPanel, setRhsPanel] = useState<RhsPanel>('thread');
  const [channelSettingsOpen, setChannelSettingsOpen] = useState(false);
  const [channelSettingsSession, setChannelSettingsSession] = useState(0);

  const openChannelNewAttribute = useCallback(() => {
    syncChannelNewAttributeParams();
    setChannelSettingsSession((current) => current + 1);
    setChannelSettingsOpen(true);
  }, []);

  const openChannelEditAttribute = useCallback((attributeId: string) => {
    syncChannelAttributeDetailParams(attributeId);
    setChannelSettingsSession((current) => current + 1);
    setChannelSettingsOpen(true);
  }, []);

  const closeChannelSettings = useCallback(() => {
    clearChannelNewAttributeParams();
    clearChannelAttributeDetailParams();
    setChannelSettingsOpen(false);
  }, []);

  return (
    <div className={styles['scene']}>
      <div className={styles['scene__settings']} ref={settingsTriggerRef}>
        <IconButton
          aria-label="Display settings"
          aria-haspopup="dialog"
          aria-expanded={settingsOpen}
          size="Medium"
          icon={<Icon size="20" glyph={<CogOutlineIcon />} />}
          onClick={() => setSettingsOpen((open) => !open)}
        />
        <FixedPopoverMenu
          open={settingsOpen}
          onClose={() => setSettingsOpen(false)}
          anchorRef={settingsTriggerRef}
          align="end"
          minWidthFloor={280}
        >
          <PopoverMenu aria-label="Display settings">
            <PopoverMenuTitle>Display settings</PopoverMenuTitle>
            <div className={styles['scene__settings-body']}>
              <p className={styles['scene__settings-group-label']}>Banners</p>
              <div className={styles['scene__settings-checks']}>
                <Checkbox
                  checked={showGlobalBanner}
                  onChange={(event) => setShowGlobalBanner(event.target.checked)}
                >
                  Global banner
                </Checkbox>
                <Checkbox
                  checked={showChannelBanner}
                  onChange={(event) => setShowChannelBanner(event.target.checked)}
                >
                  Channel banner
                </Checkbox>
                <Checkbox
                  checked={showReplyBanner}
                  onChange={(event) => setShowReplyBanner(event.target.checked)}
                >
                  Reply banner
                </Checkbox>
              </div>

              <PopoverMenuDivider />

              <p className={styles['scene__settings-group-label']}>Header</p>
              <div className={styles['scene__settings-checks']}>
                <Checkbox
                  checked={showChannelHeaderText}
                  onChange={(event) =>
                    setShowChannelHeaderText(event.target.checked)
                  }
                >
                  Channel header text
                </Checkbox>
                <Checkbox
                  checked={showBookmarksBar}
                  onChange={(event) => setShowBookmarksBar(event.target.checked)}
                >
                  Bookmarks bar
                </Checkbox>
              </div>

              <SceneSwitcher
                label="Header layout"
                scenes={[...HEADER_LAYOUT_SCENES]}
                activeId={headerAttributeLayout}
                onChange={(id) =>
                  setHeaderAttributeLayout(id === 'inline' ? 'inline' : 'stacked')
                }
                ariaLabel="Header attribute layout"
              />

              <PopoverMenuDivider />

              <SceneSwitcher
                label="Right sidebar"
                scenes={[...RHS_SCENES]}
                activeId={rhsPanel}
                onChange={(id) => setRhsPanel(id === 'thread' ? 'thread' : 'info')}
                ariaLabel="Right sidebar panel"
              />
            </div>
          </PopoverMenu>
        </FixedPopoverMenu>
      </div>

      <div className={styles['scene__viewport']}>
        <ChannelAttributesView
          key={`${rhsPanel}-${headerAttributeLayout}`}
          initialChannelSeed={CHANNEL_VIEW_FIGMA_SEED}
          initialLeonardPost={FIGMA_LEONARD_POST}
          initialInfoSidebarOpen={rhsPanel === 'info'}
          initialThreadOpen={rhsPanel === 'thread'}
          bannerVisibility={{
            channel: showChannelBanner,
            reply: showReplyBanner,
          }}
          showChannelHeaderText={showChannelHeaderText}
          showBookmarksBar={showBookmarksBar}
          headerAttributeLayout={headerAttributeLayout}
          replyClassificationCeiling={GLOBAL_BANNER}
          globalBanner={
            showGlobalBanner ? (
              <ChannelClassificationBanner
                valueId={GLOBAL_BANNER.valueId}
                label={GLOBAL_BANNER.label}
              />
            ) : undefined
          }
          onCreateAttribute={openChannelNewAttribute}
          onEditAttribute={openChannelEditAttribute}
        />
      </div>

      {channelSettingsOpen && (
        <div className={styles['scene__overlay']} role="presentation">
          <button
            type="button"
            className={styles['scene__backdrop']}
            aria-label="Close Channel settings"
            onClick={closeChannelSettings}
          />
          <div className={styles['scene__dialog']}>
            <ChannelSettingsModal
              key={channelSettingsSession}
              channelName="field-coordination"
              onClose={closeChannelSettings}
            />
          </div>
        </div>
      )}
    </div>
  );
}
