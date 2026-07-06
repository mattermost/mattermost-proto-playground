import { useId, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import Modal from '@/components/ui/Modal/Modal';
import Button from '@/components/ui/Button/Button';
import Switch from '@/components/ui/Switch/Switch';
import Radio from '@/components/ui/Radio/Radio';
import {
  appliesToPostsAndChannels,
  channelBinding,
  INHERITANCE_MODE_DESC,
  INHERITANCE_MODE_LABEL,
  MUTABILITY_LABEL,
  postBinding,
  WRITE_FLOOR_DESC,
  WRITE_FLOOR_LABEL,
  WRITE_PRIVILEGE_ORDER,
} from './data';
import type {
  AttrDef,
  Binding,
  Mutability,
  PostInheritanceMode,
  WriteTier,
} from './data';
import sharedStyles from './AttributeSystem.module.scss';
import styles from './ChannelAttributesScene.module.scss';

/**
 * Configure modal for a single Channel attribute. Opens from the per-row
 * Configure cog in `ChannelAttributesScene` (Direction C — Quick-toggle
 * columns + Configure modal).
 *
 * Two layout modes:
 *   - `mode='tabbed'`  — primary inline variant. Two tabs: Behavior, Posts.
 *     Behavior carries the two multi-option radio axes (Mutability, Who can
 *     set). Posts carries the inheritance mode radio (only rendered when the
 *     attribute applies to Posts).
 *   - `mode='grouped'` — hybrid variant. Display, Governance, and Inherited to
 *     posts each get a tab so the modal body stays within the viewport.
 *
 * Apply behavior: changes stage into `pending*` local state and are flushed
 * to the parent in a single atomic `onApply(channelPatch, postsPatch?)` call
 * so the two binding updates can never race a React snapshot. The System
 * Console-level Save/Cancel (rendered by `ConsoleFooter` via
 * `AttributeSystem.tsx`) is the canonical commit point — this modal does
 * NOT auto-save.
 */
export interface ChannelConfigModalProps {
  def: AttrDef;
  mode: 'tabbed' | 'grouped';
  /**
   * Single atomic apply hook. The scene translates the channel patch (and
   * optional posts patch) into ONE `onPatch` call so the two updates never
   * race against React's snapshot of `defs`.
   */
  onApply: (
    defId: string,
    channelPatch: Partial<Binding>,
    postsPatch?: Partial<Binding>,
  ) => void;
  onClose: () => void;
}

type Tab = 'behavior' | 'posts';
type GroupedTab = 'display' | 'governance' | 'posts';

export default function ChannelConfigModal({
  def,
  mode,
  onApply,
  onClose,
}: ChannelConfigModalProps) {
  const channel = channelBinding(def);
  const post = postBinding(def);
  const appliesToPosts = appliesToPostsAndChannels(def);

  // Pending (staged) state — committed to the parent on Apply.
  const [pendRequired, setPendRequired] = useState<boolean>(
    channel?.required === 'Required',
  );
  const [pendShowInHeader, setPendShowInHeader] = useState<boolean>(
    Boolean(channel?.showInHeader),
  );
  const [pendOpenVocab, setPendOpenVocab] = useState<boolean>(
    channel?.vocabulary === 'Open',
  );
  const [pendMutability, setPendMutability] = useState<Mutability>(
    channel?.mutability ?? 'Editable',
  );
  const [pendWhoCanSet, setPendWhoCanSet] = useState<WriteTier>(
    channel?.whoCanSet ?? 'admin',
  );

  /**
   * Inheritance is a compound axis: `channel.propagateToPosts` plus the
   * Posts-binding `inheritanceMode`. We model the user-facing 3-state choice
   * as a single union: 'off' | 'inherit' | 'inherit-locked', matching the
   * row's segmented control.
   */
  type InheritState = 'off' | 'inherit' | 'inherit-locked';
  const initialInherit: InheritState = useMemo(() => {
    if (!appliesToPosts) return 'off';
    if (!channel?.propagateToPosts) return 'off';
    if (post?.inheritanceMode === 'channel-locked') return 'inherit-locked';
    return 'inherit';
  }, [appliesToPosts, channel?.propagateToPosts, post?.inheritanceMode]);
  const [pendInherit, setPendInherit] =
    useState<InheritState>(initialInherit);

  const [tab, setTab] = useState<Tab>('behavior');

  const externallyManaged = Boolean(def.owner);

  function handleApply() {
    const channelPatch: Partial<Binding> = {
      required: pendRequired ? 'Required' : 'Optional',
      showInHeader: pendShowInHeader,
      vocabulary: pendOpenVocab ? 'Open' : 'Closed',
      mutability: pendMutability,
      whoCanSet: pendWhoCanSet,
    };
    if (appliesToPosts) {
      channelPatch.propagateToPosts = pendInherit !== 'off';
    }

    let postsPatch: Partial<Binding> | undefined;
    if (appliesToPosts) {
      const postMode: PostInheritanceMode =
        pendInherit === 'off'
          ? 'none'
          : pendInherit === 'inherit-locked'
            ? 'channel-locked'
            : 'channel-default';
      postsPatch = { inheritanceMode: postMode };
    }

    onApply(def.id, channelPatch, postsPatch);
    onClose();
  }

  const tabbed = mode === 'tabbed';

  return (
    <div
      className={sharedStyles.modalOverlay}
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <Modal
        size="Medium"
        title={`Configure ‘${def.name}’`}
        subtitle={tabbed ? 'Channels' : `${def.name} · Channels`}
        onClose={onClose}
        footer={
          <>
            <span className={styles.cfgApplyNote}>
              Apply stages your changes. They take effect when you Save the
              System Console.
            </span>
            <Button emphasis="Tertiary" onClick={onClose}>
              Cancel
            </Button>
            <Button emphasis="Primary" onClick={handleApply}>
              Apply
            </Button>
          </>
        }
      >
        {tabbed ? (
          <TabbedBody
            tab={tab}
            setTab={setTab}
            appliesToPosts={appliesToPosts}
            pendMutability={pendMutability}
            setPendMutability={setPendMutability}
            pendWhoCanSet={pendWhoCanSet}
            setPendWhoCanSet={setPendWhoCanSet}
            pendInherit={pendInherit}
            setPendInherit={setPendInherit}
          />
        ) : (
          <GroupedBody
            externallyManaged={externallyManaged}
            appliesToPosts={appliesToPosts}
            pendRequired={pendRequired}
            setPendRequired={setPendRequired}
            pendShowInHeader={pendShowInHeader}
            setPendShowInHeader={setPendShowInHeader}
            pendOpenVocab={pendOpenVocab}
            setPendOpenVocab={setPendOpenVocab}
            pendMutability={pendMutability}
            setPendMutability={setPendMutability}
            pendWhoCanSet={pendWhoCanSet}
            setPendWhoCanSet={setPendWhoCanSet}
            pendInherit={pendInherit}
            setPendInherit={setPendInherit}
          />
        )}
      </Modal>
    </div>
  );
}

/* ─── Tabbed body (inline variant) ──────────────────────────────────────── */

function TabbedBody({
  tab,
  setTab,
  appliesToPosts,
  pendMutability,
  setPendMutability,
  pendWhoCanSet,
  setPendWhoCanSet,
  pendInherit,
  setPendInherit,
}: {
  tab: Tab;
  setTab: (t: Tab) => void;
  appliesToPosts: boolean;
  pendMutability: Mutability;
  setPendMutability: (m: Mutability) => void;
  pendWhoCanSet: WriteTier;
  setPendWhoCanSet: (t: WriteTier) => void;
  pendInherit: 'off' | 'inherit' | 'inherit-locked';
  setPendInherit: (i: 'off' | 'inherit' | 'inherit-locked') => void;
}) {
  return (
    <>
      <CfgTabBar
        tabs={[
          { id: 'behavior', label: 'Behavior' },
          ...(appliesToPosts ? [{ id: 'posts', label: 'Posts' }] : []),
        ]}
        activeId={tab}
        onSelect={(id) => setTab(id as Tab)}
      />

      {tab === 'behavior' && (
        <div className={styles.cfgSection}>
          <RadioFieldset
            legend="Value editability after set"
            helper="Controls whether the channel's assigned value can change after it is first saved."
            name="mutability"
            options={(Object.keys(MUTABILITY_LABEL) as Mutability[]).map(
              (m) => ({
                value: m,
                title: shortMutability(m),
                desc: longMutability(m),
              }),
            )}
            value={pendMutability}
            onChange={(v) => setPendMutability(v as Mutability)}
          />
          <RadioFieldset
            legend="Who can set the value"
            helper="The lowest-privilege role permitted to assign or change this attribute's value on a channel."
            name="who-can-set"
            options={WRITE_PRIVILEGE_ORDER.map((tier) => ({
              value: tier,
              title: WRITE_FLOOR_LABEL[tier],
              desc: WRITE_FLOOR_DESC[tier],
            }))}
            value={pendWhoCanSet}
            onChange={(v) => setPendWhoCanSet(v as WriteTier)}
          />
        </div>
      )}

      {tab === 'posts' && appliesToPosts && (
        <div className={styles.cfgSection}>
          <div className={styles.cfgSummaryBox}>
            <span className={styles.cfgSummaryBox__title}>
              How posts inherit this attribute
            </span>
            <div className={styles.cfgSummaryBox__body}>
              When a post is created in a channel, the channel's current value
              for this attribute can be copied onto the post — optionally
              locked at the composer so authors cannot change it.
            </div>
          </div>
          <RadioFieldset
            legend="Inheritance mode"
            helper="Mirrors the column's 3-state choice and chooses between an overridable default and a composer-locked copy."
            name="inheritance"
            options={[
              {
                value: 'off',
                title: 'Off — posts do not inherit',
                desc: INHERITANCE_MODE_DESC.none,
              },
              {
                value: 'inherit',
                title: INHERITANCE_MODE_LABEL['channel-default'],
                desc: INHERITANCE_MODE_DESC['channel-default'],
              },
              {
                value: 'inherit-locked',
                title: INHERITANCE_MODE_LABEL['channel-locked'],
                desc: INHERITANCE_MODE_DESC['channel-locked'],
              },
            ]}
            value={pendInherit}
            onChange={(v) =>
              setPendInherit(v as 'off' | 'inherit' | 'inherit-locked')
            }
          />
        </div>
      )}
    </>
  );
}

/* ─── Grouped body (hybrid variant — everything in one modal) ─────────── */

function GroupedBody({
  externallyManaged,
  appliesToPosts,
  pendRequired,
  setPendRequired,
  pendShowInHeader,
  setPendShowInHeader,
  pendOpenVocab,
  setPendOpenVocab,
  pendMutability,
  setPendMutability,
  pendWhoCanSet,
  setPendWhoCanSet,
  pendInherit,
  setPendInherit,
}: {
  externallyManaged: boolean;
  appliesToPosts: boolean;
  pendRequired: boolean;
  setPendRequired: (v: boolean) => void;
  pendShowInHeader: boolean;
  setPendShowInHeader: (v: boolean) => void;
  pendOpenVocab: boolean;
  setPendOpenVocab: (v: boolean) => void;
  pendMutability: Mutability;
  setPendMutability: (m: Mutability) => void;
  pendWhoCanSet: WriteTier;
  setPendWhoCanSet: (t: WriteTier) => void;
  pendInherit: 'off' | 'inherit' | 'inherit-locked';
  setPendInherit: (i: 'off' | 'inherit' | 'inherit-locked') => void;
}) {
  const [tab, setTab] = useState<GroupedTab>('display');

  return (
    <>
      <CfgTabBar
        tabs={[
          { id: 'display', label: 'Display' },
          { id: 'governance', label: 'Governance' },
          ...(appliesToPosts ? [{ id: 'posts', label: 'Inherited to posts' }] : []),
        ]}
        activeId={tab}
        onSelect={(id) => setTab(id as GroupedTab)}
      />

      {tab === 'display' && (
        <div className={styles.cfgSection}>
          <QuickRow
            title="Required on save"
            helper="Channel admins must assign a value before saving."
            control={
              <Switch
                size="Small"
                checked={pendRequired}
                onChange={(e) =>
                  setPendRequired((e.target as HTMLInputElement).checked)
                }
                aria-label="Required on save"
              />
            }
          />
          <QuickRow
            title="Show in channel header"
            helper="Surface the assigned value in the channel header strip and members' channel info."
            control={
              <Switch
                size="Small"
                checked={pendShowInHeader}
                onChange={(e) =>
                  setPendShowInHeader((e.target as HTMLInputElement).checked)
                }
                aria-label="Show in channel header"
              />
            }
          />
          <QuickRow
            title="Allow new options"
            helper={
              externallyManaged
                ? 'Disabled — value catalog is owned by an external source.'
                : 'Resource admins may add values to the catalog from the channel.'
            }
            control={
              <Switch
                size="Small"
                checked={pendOpenVocab}
                disabled={externallyManaged}
                onChange={(e) =>
                  setPendOpenVocab((e.target as HTMLInputElement).checked)
                }
                aria-label="Allow new options"
              />
            }
          />
        </div>
      )}

      {tab === 'governance' && (
        <div className={styles.cfgSection}>
          <RadioFieldset
            legend="Value editability after set"
            helper="Controls whether the channel's assigned value can change after it is first saved."
            name="h-mutability"
            options={(Object.keys(MUTABILITY_LABEL) as Mutability[]).map(
              (m) => ({
                value: m,
                title: shortMutability(m),
                desc: longMutability(m),
              }),
            )}
            value={pendMutability}
            onChange={(v) => setPendMutability(v as Mutability)}
          />
          <RadioFieldset
            legend="Who can set the value"
            helper="Lowest-privilege role permitted to assign or change this attribute's value on a channel."
            name="h-who"
            options={WRITE_PRIVILEGE_ORDER.map((tier) => ({
              value: tier,
              title: WRITE_FLOOR_LABEL[tier],
              desc: WRITE_FLOOR_DESC[tier],
            }))}
            value={pendWhoCanSet}
            onChange={(v) => setPendWhoCanSet(v as WriteTier)}
          />
        </div>
      )}

      {tab === 'posts' && appliesToPosts && (
        <div className={styles.cfgSection}>
          <RadioFieldset
            legend="Inheritance mode"
            helper="Mirrors the column's 3-state choice — Off, Inherit (overridable), or Inherit + lock (composer-locked)."
            name="h-inherit"
            options={[
              {
                value: 'off',
                title: 'Off — posts do not inherit',
                desc: INHERITANCE_MODE_DESC.none,
              },
              {
                value: 'inherit',
                title: INHERITANCE_MODE_LABEL['channel-default'],
                desc: INHERITANCE_MODE_DESC['channel-default'],
              },
              {
                value: 'inherit-locked',
                title: INHERITANCE_MODE_LABEL['channel-locked'],
                desc: INHERITANCE_MODE_DESC['channel-locked'],
              },
            ]}
            value={pendInherit}
            onChange={(v) =>
              setPendInherit(v as 'off' | 'inherit' | 'inherit-locked')
            }
          />
        </div>
      )}
    </>
  );
}

/* ─── Shared bits ──────────────────────────────────────────────────────── */

function CfgTabBar({
  tabs,
  activeId,
  onSelect,
}: {
  tabs: Array<{ id: string; label: string }>;
  activeId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div
      className={styles.cfgTabs}
      role="tablist"
      aria-label="Configure attribute"
    >
      {tabs.map((t) => (
        <button
          key={t.id}
          type="button"
          role="tab"
          aria-selected={activeId === t.id}
          className={[
            styles.cfgTab,
            activeId === t.id ? styles['cfgTab--active'] : '',
          ]
            .filter(Boolean)
            .join(' ')}
          onClick={() => onSelect(t.id)}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

function QuickRow({
  title,
  helper,
  control,
}: {
  title: string;
  helper: string;
  control: ReactNode;
}) {
  return (
    <div className={styles.cfgQuickRow}>
      <div className={styles.cfgQuickRow__label}>
        <span className={styles.cfgQuickRow__title}>{title}</span>
        <span className={styles.cfgQuickRow__helper}>{helper}</span>
      </div>
      <div className={styles.cfgQuickRow__control}>{control}</div>
    </div>
  );
}

interface RadioOption {
  value: string;
  title: string;
  desc: string;
}

function RadioFieldset({
  legend,
  helper,
  name,
  options,
  value,
  onChange,
}: {
  legend: string;
  helper: string;
  name: string;
  options: RadioOption[];
  value: string;
  onChange: (v: string) => void;
}) {
  const legendId = useId();
  return (
    <fieldset
      className={styles.cfgFieldset}
      aria-labelledby={`${legendId}-title`}
    >
      <legend className={styles.cfgLegend}>
        <span id={`${legendId}-title`} className={styles.cfgLegend__title}>
          {legend}
        </span>
        <span className={styles.cfgLegend__helper}>{helper}</span>
      </legend>
      <ul className={styles.cfgRadioList} role="radiogroup">
        {options.map((opt) => {
          const selected = value === opt.value;
          return (
            <li key={opt.value}>
              {/* Row is a click-target; the DS Radio carries its own <label>
                  so we use a <div> here to avoid nested-label HTML. */}
              <div
                className={[
                  styles.cfgRadioRow,
                  selected ? styles['cfgRadioRow--selected'] : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => onChange(opt.value)}
                onKeyDown={(e) => {
                  if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault();
                    onChange(opt.value);
                  }
                }}
                role="presentation"
              >
                <span className={styles.cfgRadioRow__radio}>
                  <Radio
                    size="Small"
                    name={name}
                    value={opt.value}
                    checked={selected}
                    onChange={() => onChange(opt.value)}
                  />
                </span>
                <span className={styles.cfgRadioRow__body}>
                  <span className={styles.cfgRadioRow__title}>{opt.title}</span>
                  <span className={styles.cfgRadioRow__desc}>{opt.desc}</span>
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </fieldset>
  );
}

/* The strings in MUTABILITY_LABEL bundle title + dash + description. We split
 * them here so the radio row can show a clean two-line layout. */
function shortMutability(m: Mutability): string {
  switch (m) {
    case 'Editable':
      return 'Editable';
    case 'Ratchet':
      return 'Ratchet — raise only';
    case 'Locked':
      return 'Locked after set';
    case 'Approval':
      return 'Requires approval';
  }
}

function longMutability(m: Mutability): string {
  switch (m) {
    case 'Editable':
      return 'Value can change freely after it is first set.';
    case 'Ratchet':
      return 'Value may only be raised, never lowered (e.g. classification level can go up but not down).';
    case 'Locked':
      return 'Once set, only a system admin can change the value.';
    case 'Approval':
      return 'Changes require a second-person review before they take effect.';
  }
}
