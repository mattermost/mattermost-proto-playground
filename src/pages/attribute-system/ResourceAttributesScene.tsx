import CogOutlineIcon from '@mattermost/compass-icons/components/cog-outline';
import TuneIcon from '@mattermost/compass-icons/components/tune';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import ArrowUpBoldIcon from '@mattermost/compass-icons/components/arrow-up-bold-circle-outline';
import LockOutlineIcon from '@mattermost/compass-icons/components/lock-outline';
import Icon from '@/components/ui/Icon/Icon';
import Button from '@/components/ui/Button/Button';
import Switch from '@/components/ui/Switch/Switch';
import Select from '@/components/ui/Select/Select';
import AdminPanel from '@/components/ui/AdminPanel/AdminPanel';
import SectionNotice from '@/components/ui/SectionNotice/SectionNotice';
import { TYPE_ICON } from './attrIcons';
import BindingSummary from './bindingSummary';
import {
  appliesToPostsAndChannels,
  INHERITANCE_MODE_LABEL,
  inheritanceStatus,
  INHERITANCE_STATUS_LABEL,
  SCOPE_LABEL,
  canPromote,
  ownerBadgeText,
  postBinding,
} from './data';
import type { AttrDef, Binding, PostInheritanceMode, ResourceType } from './data';
import styles from './AttributeSystem.module.scss';

interface SceneProps {
  resource: ResourceType;
  defs: AttrDef[];
  onAdd: () => void;
  onPromote: (defId: string) => void;
  onConfigureBinding: (defId: string, resource: ResourceType) => void;
  onConfigureAccess: (defId: string) => void;
  onPatchBinding?: (
    defId: string,
    resource: ResourceType,
    patch: Partial<Binding>,
  ) => void;
}

function singular(resource: ResourceType): string {
  return resource.toLowerCase().replace(/s$/, '');
}

function sceneNotice(resource: ResourceType): {
  title: string;
  description: string;
} {
  if (resource === 'Posts') {
    return {
      title: 'Post Attributes — inheritance + post-only values',
      description:
        'Posts may use post-only attributes or inherit from the parent channel at creation. Inheritance requires two settings: propagation on Channel Attributes and an inheritance mode here. Channel changes apply only to new posts.',
    };
  }
  if (resource === 'Channels') {
    return {
      title: 'Channel Attributes — propagation to posts',
      description:
        'For attributes that also apply to posts, enable “New posts inherit” so the channel value is copied when a post is created. Set inheritance mode on Post Attributes (or in Configure binding) — both must be on.',
    };
  }
  const noun = singular(resource);
  return {
    title: `${resource.replace(/s$/, '')} Attributes — the ${noun} binding`,
    description: `Add an existing global attribute to ${noun}s, or create a new ${noun}-scoped one. Global attributes are read-only at the definition level; behavior is configured per resource type.`,
  };
}

export default function ResourceAttributesScene({
  resource,
  defs,
  onAdd,
  onPromote,
  onConfigureBinding,
  onConfigureAccess,
  onPatchBinding,
}: SceneProps) {
  const applicable = defs.filter((d) => d.appliesTo.includes(resource));
  const noun = singular(resource);
  const notice = sceneNotice(resource);

  return (
    <>
      <SectionNotice
        type="Info"
        title={notice.title}
        description={notice.description}
      />

      <AdminPanel
        title={`Attributes on ${noun}s`}
        subtitle={`How each attribute behaves when applied to a ${noun}`}
        showEnterpriseLabel
        expandable
        defaultExpandedState="Expanded"
        headerActions={
          <Button
            emphasis="Primary"
            size="X-Small"
            leadingIcon={<Icon size="12" glyph={<PlusIcon />} />}
            onClick={onAdd}
          >
            Add {noun} attribute
          </Button>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {applicable.length === 0 && (
            <p className={styles.copy}>
              No attributes applied to {noun}s yet. Use “Add {noun} attribute”.
            </p>
          )}
          {applicable.map((def) => {
            const binding = def.bindings.find((b) => b.resource === resource);
            const promotable = canPromote(def);
            const dual = appliesToPostsAndChannels(def);
            const postB = postBinding(def);
            const inheritState = dual ? inheritanceStatus(def) : 'off';

            return (
              <div key={def.id} className={styles.assignCard}>
                <div className={styles.assignCard__row}>
                  <span className={styles.assignCard__name}>
                    <Icon size="16" glyph={TYPE_ICON[def.type]} />
                    {def.name}
                    <span
                      className={`${styles.tag} ${
                        def.scope === 'global'
                          ? styles['tag--accent']
                          : styles['tag--neutral']
                      }`}
                      style={{ marginLeft: 6 }}
                    >
                      {SCOPE_LABEL[def.scope]}
                    </span>
                    {def.owner && (
                      <span className={styles.ownerBadge}>
                        <span className={styles.ownerBadge__icon}>
                          <Icon size="12" glyph={<LockOutlineIcon />} />
                        </span>
                        {ownerBadgeText(def.owner)}
                      </span>
                    )}
                  </span>
                  <span style={{ display: 'flex', gap: 8 }}>
                    {promotable && (
                      <Button
                        emphasis="Tertiary"
                        size="X-Small"
                        leadingIcon={
                          <Icon size="12" glyph={<ArrowUpBoldIcon />} />
                        }
                        onClick={() => onPromote(def.id)}
                      >
                        Promote to global
                      </Button>
                    )}
                    <Button
                      emphasis="Tertiary"
                      size="X-Small"
                      leadingIcon={<Icon size="12" glyph={<TuneIcon />} />}
                      onClick={() => onConfigureAccess(def.id)}
                    >
                      Access
                    </Button>
                    <Button
                      emphasis="Secondary"
                      size="X-Small"
                      leadingIcon={<Icon size="12" glyph={<CogOutlineIcon />} />}
                      onClick={() => onConfigureBinding(def.id, resource)}
                    >
                      Configure binding
                    </Button>
                  </span>
                </div>

                {resource === 'Channels' &&
                  dual &&
                  binding &&
                  onPatchBinding && (
                    <div className={styles.inheritInline}>
                      <Switch
                        size="Small"
                        checked={Boolean(binding.propagateToPosts)}
                        onChange={(e) =>
                          onPatchBinding(def.id, 'Channels', {
                            propagateToPosts: (e.target as HTMLInputElement)
                              .checked,
                          })
                        }
                      >
                        New posts inherit this channel value
                      </Switch>
                      <span
                        className={`${styles.tag} ${
                          inheritState === 'active'
                            ? styles['tag--accent']
                            : styles['tag--neutral']
                        }`}
                      >
                        {INHERITANCE_STATUS_LABEL[inheritState]}
                      </span>
                      {postB && inheritState === 'needs-post' && (
                        <p className={styles.inheritInline__meta}>
                          Propagation is on — set inheritance mode on Post
                          Attributes to activate.
                        </p>
                      )}
                    </div>
                  )}

                {resource === 'Posts' &&
                  dual &&
                  postB &&
                  onPatchBinding && (
                    <div className={styles.inheritInline}>
                      <div className={styles.inheritInline__row}>
                        <span className={styles.inheritInline__label}>
                          Channel inheritance
                        </span>
                        <Select
                          size="Small"
                          className={styles.inheritInline__select}
                          value={postB.inheritanceMode ?? 'none'}
                          onChange={(e) =>
                            onPatchBinding(def.id, 'Posts', {
                              inheritanceMode: e.target
                                .value as PostInheritanceMode,
                            })
                          }
                        >
                          {(Object.keys(INHERITANCE_MODE_LABEL) as PostInheritanceMode[]).map(
                            (mode) => (
                              <option key={mode} value={mode}>
                                {INHERITANCE_MODE_LABEL[mode]}
                              </option>
                            ),
                          )}
                        </Select>
                      </div>
                      <span
                        className={`${styles.tag} ${
                          inheritState === 'active'
                            ? styles['tag--inherit']
                            : inheritState === 'off'
                              ? styles['tag--neutral']
                              : styles['tag--danger']
                        }`}
                      >
                        {INHERITANCE_STATUS_LABEL[inheritState]}
                      </span>
                      {inheritState === 'needs-channel' && (
                        <p className={styles.inheritInline__meta}>
                          Turn on “New posts inherit” on Channel Attributes for
                          this attribute.
                        </p>
                      )}
                      {inheritState === 'active' && (
                        <p className={styles.inheritInline__meta}>
                          New posts copy the channel value at creation. Authors{' '}
                          {postB.inheritanceMode === 'channel-default'
                            ? 'may override while composing if editability allows.'
                            : 'cannot change the inherited value in the composer.'}
                        </p>
                      )}
                    </div>
                  )}

                {resource === 'Posts' &&
                  !dual &&
                  postB &&
                  postB.inheritanceMode === 'none' && (
                    <p className={styles.inheritInline__meta}>
                      Post-only attribute — not inherited from channel.
                    </p>
                  )}

                {binding && <BindingSummary binding={binding} def={def} />}
              </div>
            );
          })}
        </div>
      </AdminPanel>
    </>
  );
}
