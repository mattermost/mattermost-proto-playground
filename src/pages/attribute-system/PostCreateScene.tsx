import { useMemo, useState } from 'react';
import LinkVariantIcon from '@mattermost/compass-icons/components/link-variant';
import LockOutlineIcon from '@mattermost/compass-icons/components/lock-outline';
import Icon from '@/components/ui/Icon/Icon';
import Select from '@/components/ui/Select/Select';
import AdminPanel from '@/components/ui/AdminPanel/AdminPanel';
import SectionNotice from '@/components/ui/SectionNotice/SectionNotice';
import RankedValueChip from '@/components/ui/RankedValueChip/RankedValueChip';
import { TYPE_ICON } from './attrIcons';
import {
  inheritanceIsActive,
  postBinding,
  channelBinding,
} from './data';
import type { AttrDef, Binding } from './data';
import styles from './AttributeSystem.module.scss';

/** Demo channel value for #fires-watch — Classification = SECRET. */
const CHANNEL_CLASSIFICATION = 's';

interface SceneProps {
  defs: AttrDef[];
  /** Live channel attribute values (prototype: classification on #fires-watch). */
  channelValues?: Record<string, string>;
}

function authorCanOverride(binding: Binding): boolean {
  if (binding.mutability === 'Locked' || binding.mutability === 'Approval') {
    return false;
  }
  return binding.inheritanceMode === 'channel-default';
}

/**
 * End-user composer — demonstrates post attribute inheritance from channel.
 * Classification inherits SECRET from #fires-watch (locked). Mission tag is
 * post-only and editable.
 */
export default function PostCreateScene({
  defs,
  channelValues = { classification: CHANNEL_CLASSIFICATION },
}: SceneProps) {
  const applicable = defs.filter((d) => d.appliesTo.includes('Posts'));

  const initialAssigned = useMemo(() => {
    const next: Record<string, string> = {};
    for (const def of applicable) {
      const binding = postBinding(def);
      const channel = channelBinding(def);
      if (
        binding &&
        channel?.propagateToPosts &&
        binding.inheritanceMode &&
        binding.inheritanceMode !== 'none' &&
        channelValues[def.id]
      ) {
        next[def.id] = channelValues[def.id];
      }
    }
    return next;
  }, [applicable, channelValues]);

  const [draft, setDraft] = useState<Record<string, string>>(initialAssigned);
  const [body, setBody] = useState('');

  const channelClassificationLabel =
    defs
      .find((d) => d.id === 'classification')
      ?.values.find((v) => v.id === channelValues.classification)?.label ??
    '—';

  return (
    <>
      <SectionNotice
        type="Hint"
        title="Composer · #fires-watch"
        description="New posts inherit channel classification at creation. If the channel classification changes later, only posts created after that change receive the new value."
      />

      <div className={styles.headerPreview}>
        <span className={styles.headerPreview__name}># fires-watch</span>
        <div className={styles.values}>
          <RankedValueChip label={channelClassificationLabel} />
        </div>
        <span className={styles.headerPreview__meta}>
          Channel classification · inherited by new posts
        </span>
      </div>

      <AdminPanel
        title="New message"
        subtitle="Attributes on this post"
        expandable
        defaultExpandedState="Expanded"
      >
        <div className={styles.composer}>
          <textarea
            className={styles.composer__body}
            placeholder="Write to #fires-watch…"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={4}
          />

          <div className={styles.composer__attrs}>
            {applicable.map((def) => {
              const binding = postBinding(def);
              if (!binding) return null;
              const inherited = inheritanceIsActive(def);
              const valueId = draft[def.id] ?? '';
              const locked =
                inherited &&
                (binding.inheritanceMode === 'channel-locked' ||
                  !authorCanOverride(binding));
              const valueLabel =
                def.values.find((v) => v.id === valueId)?.label ?? '—';

              return (
                <div key={def.id} className={styles.composer__attr}>
                  <div className={styles.composer__attrHead}>
                    <span className={styles.composer__attrName}>
                      <Icon size="16" glyph={TYPE_ICON[def.type]} />
                      {def.name}
                    </span>
                    {inherited && (
                      <span className={styles.inheritBadge}>
                        <Icon size="12" glyph={<LinkVariantIcon />} />
                        Inherited from channel
                      </span>
                    )}
                    {locked && (
                      <span className={styles.inheritBadge}>
                        <Icon size="12" glyph={<LockOutlineIcon />} />
                        Locked at compose
                      </span>
                    )}
                  </div>

                  {locked ? (
                    <div className={styles.composer__locked}>
                      {def.type === 'Ranked' ? (
                        <RankedValueChip label={valueLabel} />
                      ) : (
                        <span>{valueLabel}</span>
                      )}
                    </div>
                  ) : (
                    <Select
                      size="Small"
                      value={valueId}
                      onChange={(e) =>
                        setDraft((prev) => ({
                          ...prev,
                          [def.id]: e.target.value,
                        }))
                      }
                    >
                      <option value="">Select…</option>
                      {def.values.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.label}
                        </option>
                      ))}
                    </Select>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </AdminPanel>
    </>
  );
}
