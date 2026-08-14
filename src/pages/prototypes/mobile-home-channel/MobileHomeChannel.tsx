import {useEffect, useState} from 'react';
import DeviceFrame from '@/components/layout/DeviceFrame';
import MobileModalStage from '@/components/layout/MobileModalStage';
import SceneSwitcher from '@/components/navigation/SceneSwitcher/SceneSwitcher';
import {usePrototypeChrome} from '@/contexts/PrototypeChromeContext';
import {
  DEFAULT_CHANNEL_NAME,
  SCENES,
  isTabScene,
  type ModalPeek,
  type SceneId,
  type TabSceneId,
} from './mobileHomeChannel.scenes';
import {getChannelMeta, type ChannelMeta} from './mobileHomeChannelData';
import ChannelScene from './scenes/ChannelScene';
import HomeScene from './scenes/HomeScene';
import ModalScene from './scenes/ModalScene';
import styles from './MobileHomeChannel.module.scss';

export default function MobileHomeChannel() {
  const {setCenterSlot} = usePrototypeChrome();
  const [scene, setScene] = useState<SceneId>('home');
  const [lastTab, setLastTab] = useState<TabSceneId>('home');
  const [modalPeek, setModalPeek] = useState<ModalPeek>('channel');
  const [channel, setChannel] = useState<ChannelMeta>(() =>
    getChannelMeta(DEFAULT_CHANNEL_NAME),
  );

  const modalOpen = scene === 'modal';
  const channelOpen =
    scene === 'channel' || (modalOpen && modalPeek === 'channel');

  const activeTab: TabSceneId = isTabScene(scene)
    ? scene
    : modalOpen && isTabScene(modalPeek)
      ? modalPeek
      : lastTab;

  const openModal = (peek: ModalPeek) => {
    setModalPeek(peek);
    setScene('modal');
  };

  const closeModal = () => setScene(modalPeek);

  const goToTab = (tab: TabSceneId) => {
    setLastTab(tab);
    setScene(tab);
  };

  const ensureDefaultChannel = () => {
    setChannel(getChannelMeta(DEFAULT_CHANNEL_NAME));
  };

  useEffect(() => {
    setCenterSlot(
      <SceneSwitcher
        scenes={SCENES}
        activeId={scene}
        onChange={(id) => {
          const next = id as SceneId;
          if (next === 'modal') {
            if (isTabScene(scene) || scene === 'channel') {
              openModal(scene === 'channel' ? 'channel' : scene);
            }
            return;
          }
          if (next === 'channel') {
            if (isTabScene(scene) || (modalOpen && isTabScene(modalPeek))) {
              ensureDefaultChannel();
            }
            setScene('channel');
            return;
          }
          if (isTabScene(next)) {
            goToTab(next);
          }
        }}
        ariaLabel='Prototype entry points'
      />,
    );
    return () => setCenterSlot(null);
  }, [scene, modalPeek, modalOpen, setCenterSlot]);

  const openChannel = (name: string) => {
    setChannel(getChannelMeta(name));
    setScene('channel');
  };

  return (
    <div className={styles['mobile-home-channel']}>
      <DeviceFrame insetContent={false} statusBarStyle='light'>
        <MobileModalStage
          open={modalOpen}
          modal={<ModalScene onClose={closeModal} />}
        >
          <div className={styles['mobile-home-channel__stack']}>
            <div
              className={[
                styles['mobile-home-channel__layer'],
                styles['mobile-home-channel__home-layer'],
                channelOpen && styles['mobile-home-channel__home-layer--behind'],
              ]
                .filter(Boolean)
                .join(' ')}
              aria-hidden={channelOpen}
            >
              <HomeScene
                activeTab={activeTab}
                onTabChange={goToTab}
                onChannelClick={openChannel}
              />
            </div>
            <div
              className={[
                styles['mobile-home-channel__layer'],
                styles['mobile-home-channel__channel-layer'],
                channelOpen &&
                  styles['mobile-home-channel__channel-layer--open'],
              ]
                .filter(Boolean)
                .join(' ')}
              aria-hidden={!channelOpen}
            >
              <ChannelScene
                channel={channel}
                modalOpen={modalOpen}
                onOpenModal={() => openModal('channel')}
                onBack={() => goToTab(lastTab)}
              />
            </div>
          </div>
        </MobileModalStage>
      </DeviceFrame>
    </div>
  );
}
