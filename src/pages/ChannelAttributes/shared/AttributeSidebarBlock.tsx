import { useState } from 'react';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import DotsHorizontalIcon from '@mattermost/compass-icons/components/dots-horizontal';
import ContentCopyIcon from '@mattermost/compass-icons/components/content-copy';
import CheckIcon from '@mattermost/compass-icons/components/check';
import Icon from '@/components/ui/Icon/Icon';
import LabelTag from '@/components/ui/LabelTag/LabelTag';
import Chip from '@/components/ui/Chip/Chip';
import Switch from '@/components/ui/Switch/Switch';
import ClassificationPill from './ClassificationPill';
import {
  catalogById,
  classificationOf,
  resolvedDisplayIn,
  type ChannelAttributePayload,
  type DisplayLocation,
  type DisplayOverrides,
} from './channelAttrData';
import styles from './sidebar.module.scss';

export interface AttributeSidebarBlockProps {
  payload: ChannelAttributePayload;
  overrides?: DisplayOverrides;
  /** admin = inline edit affordances; member = read-only (FR-7, FR-8). */
  mode: 'admin' | 'member';
  /** Which attribute's config popover is open (admin only). */
  openConfigFor?: string | null;
  onToggleConfig?: (attrId: string | null) => void;
  /** Trigger the governed-change (reclassification) flow for a locked attribute. */
  onGovernedChange?: () => void;
  /** Empty state: admin sees "+ Add attribute"; member sees nothing (block absent). */
}

const DISPLAY_LABELS: Record<DisplayLocation, string> = {
  header: 'Channel header label',
  banner: 'Channel banner',
  sidebar: 'Channel info sidebar',
};

/**
 * Channel info sidebar attribute block. Renders ONLY the attributes present in
 * the payload (masking is server-side; member with empty cleared set sees the
 * block absent entirely — FR-7). Admin gets inline edit + per-attribute config
 * popover (DISPLAY IN toggles + Duplicate; NO Rename per V2).
 */
export default function AttributeSidebarBlock({
  payload,
  overrides,
  mode,
  openConfigFor,
  onToggleConfig,
  onGovernedChange,
}: AttributeSidebarBlockProps) {
  const isAdmin = mode === 'admin';
  const rows = payload.values;

  // Member with no cleared values: block absent entirely (no empty-state text).
  if (!isAdmin && rows.length === 0) return null;

  return (
    <div className={styles['attr-block']}>
      {rows.map((pv) => {
        const attr = catalogById(pv.attributeId);
        const isClassification = attr.id === 'classification';
        const locked = attr.mutability === 'locked';
        return (
          <div key={attr.id} className={styles['attr-row']}>
            <span className={styles['attr-row__label']}>{attr.name}</span>
            <div className={styles['attr-row__value']}>
              {isClassification ? (
                <ClassificationPill
                  level={classificationOf(payload)!}
                  locked={isAdmin && locked}
                  onClick={isAdmin && locked ? onGovernedChange : undefined}
                />
              ) : attr.type === 'multi-select' ? (
                pv.values.map((v) =>
                  isAdmin ? (
                    <Chip key={v} tone="info" onRemove={() => {}}>
                      {v}
                    </Chip>
                  ) : (
                    <LabelTag key={v} label={v} type="Default" size="Small" />
                  ),
                )
              ) : isAdmin && attr.id === 'mission_tag' ? (
                <Chip tone="success" onRemove={() => {}}>
                  {pv.values[0]}
                </Chip>
              ) : (
                <LabelTag label={pv.values[0]} type="Default" size="Small" />
              )}

              {isAdmin && (
                <div className={styles['attr-row__config']}>
                  <button
                    type="button"
                    className={styles['attr-row__config-btn']}
                    aria-label={`Display options for ${attr.name}`}
                    aria-haspopup="menu"
                    aria-expanded={openConfigFor === attr.id}
                    onClick={() =>
                      onToggleConfig?.(openConfigFor === attr.id ? null : attr.id)
                    }
                  >
                    <Icon size="16" glyph={<DotsHorizontalIcon />} />
                  </button>
                  {openConfigFor === attr.id && (
                    <ConfigPopover attr={attr} overrides={overrides} />
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}

      {isAdmin && (
        <button type="button" className={styles['attr-block__add']}>
          <Icon size="16" glyph={<PlusIcon />} />
          <span>Add attribute</span>
        </button>
      )}
    </div>
  );
}

// Per-attribute config popover — DISPLAY IN toggles + Duplicate ONLY. NO Rename
// (V2: rename is system-wide, in System Console). Mandatory-display locations are
// forced-on / non-interactive (FR-15, counters T-3).
function ConfigPopover({
  attr,
  overrides,
}: {
  attr: ReturnType<typeof catalogById>;
  overrides?: DisplayOverrides;
}) {
  const active = resolvedDisplayIn(attr, overrides);
  const locations: DisplayLocation[] = ['header', 'banner', 'sidebar'];
  const [local, setLocal] = useState<Set<DisplayLocation>>(new Set(active));

  return (
    <div className={styles['config-popover']} role="menu">
      <div className={styles['config-popover__section-title']}>DISPLAY IN</div>
      {locations.map((loc) => {
        const forced = attr.displayMandatory && attr.displayIn.includes(loc);
        const on = local.has(loc) || forced;
        return (
          <div key={loc} className={styles['config-popover__row']}>
            <Switch
              size="Small"
              checked={on}
              disabled={forced}
              onChange={() => {
                if (forced) return;
                setLocal((prev) => {
                  const next = new Set(prev);
                  if (next.has(loc)) next.delete(loc);
                  else next.add(loc);
                  return next;
                });
              }}
            >
              {DISPLAY_LABELS[loc]}
            </Switch>
            {forced && (
              <span className={styles['config-popover__forced']} aria-hidden>
                <Icon size="16" glyph={<CheckIcon />} />
              </span>
            )}
          </div>
        );
      })}
      <div className={styles['config-popover__divider']} />
      <button type="button" className={styles['config-popover__action']} role="menuitem">
        <Icon size="16" glyph={<ContentCopyIcon />} />
        <span>Duplicate property</span>
      </button>
    </div>
  );
}
