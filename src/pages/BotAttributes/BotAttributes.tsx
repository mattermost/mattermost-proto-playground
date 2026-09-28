import { useSearchParams } from 'react-router-dom';
import {
  BOT_ATTRIBUTES_SCENES,
  type BotAttributesSceneId,
} from './botAttributesScenes';
import AttributeHubScene from './scenes/AttributeHubScene';
import BotAccountScene from './scenes/BotAccountScene';
import BotChannelScene from './scenes/BotChannelScene';
import PermissionPolicyScene from './scenes/PermissionPolicyScene';
import styles from './BotAttributes.module.scss';

const SCENE_IDS = new Set(
  BOT_ATTRIBUTES_SCENES.map((scene) => scene.id),
);

function readScene(raw: string | null): BotAttributesSceneId {
  if (raw && SCENE_IDS.has(raw as BotAttributesSceneId)) {
    return raw as BotAttributesSceneId;
  }
  return 'attribute-hub';
}

/** Full-bleed scenes — no page chrome; navigation is the prototypes sidebar. */
export default function BotAttributes() {
  const [params] = useSearchParams();
  const activeId = readScene(params.get('scene'));

  return (
    <div className={styles['bot-attr']}>
      {activeId === 'attribute-hub' && <AttributeHubScene />}
      {activeId === 'bot-account' && <BotAccountScene />}
      {activeId === 'bot-channel' && <BotChannelScene />}
      {activeId === 'permission-policy' && <PermissionPolicyScene />}
    </div>
  );
}
