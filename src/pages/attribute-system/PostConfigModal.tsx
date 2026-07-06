import { useId, useState } from 'react';
import Modal from '@/components/ui/Modal/Modal';
import Button from '@/components/ui/Button/Button';
import Radio from '@/components/ui/Radio/Radio';
import {
  appliesToPostsAndChannels,
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
import styles from './PostAttributesScene.module.scss';

/**
 * Configure modal for a single Post attribute. Opens from the per-row
 * Configure cog in `PostAttributesScene`.
 *
 * Carries the two multi-option radio axes that don't fit a switch:
 *  - Value editability after set (Mutability)
 *  - Who can set the value (write floor)
 *
 * When the attribute also applies to Channels, the modal additionally surfaces
 * a read-only summary of how channel inheritance is currently configured —
 * the editable 3-state segmented control lives on the row, where it can be
 * adjusted in context.
 *
 * Apply behavior: changes stage into `pending*` local state and are flushed
 * to the parent in a single `onApply(postsPatch)` call. Unlike the Channel
 * variant, no cross-binding atomic write is needed — Posts owns its own
 * `inheritanceMode` axis and never writes the Channels side from here.
 */
export interface PostConfigModalProps {
  def: AttrDef;
  /** Single apply hook. Writes only the Posts binding. */
  onApply: (defId: string, postsPatch: Partial<Binding>) => void;
  onClose: () => void;
}

export default function PostConfigModal({
  def,
  onApply,
  onClose,
}: PostConfigModalProps) {
  const post = postBinding(def);
  const supportsChannels = appliesToPostsAndChannels(def);

  // Pending (staged) state — committed to the parent on Apply.
  const [pendMutability, setPendMutability] = useState<Mutability>(
    post?.mutability ?? 'Editable',
  );
  const [pendWhoCanSet, setPendWhoCanSet] = useState<WriteTier>(
    post?.whoCanSet ?? 'member',
  );

  function handleApply() {
    const postsPatch: Partial<Binding> = {
      mutability: pendMutability,
      whoCanSet: pendWhoCanSet,
    };
    onApply(def.id, postsPatch);
    onClose();
  }

  const inheritanceMode: PostInheritanceMode = post?.inheritanceMode ?? 'none';

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
        subtitle={`${def.name} · Posts`}
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
        <div className={styles.cfgSection}>
          <RadioFieldset
            legend="Value editability after set"
            helper="Controls whether the post's assigned value can change after it is first saved."
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
            helper="The lowest-privilege role permitted to assign or change this attribute's value on a post."
            name="who-can-set"
            options={WRITE_PRIVILEGE_ORDER.map((tier) => ({
              value: tier,
              title: WRITE_FLOOR_LABEL[tier],
              desc: WRITE_FLOOR_DESC[tier],
            }))}
            value={pendWhoCanSet}
            onChange={(v) => setPendWhoCanSet(v as WriteTier)}
          />

          {supportsChannels && (
            <div className={styles.cfgSummaryBox}>
              <span className={styles.cfgSummaryBox__title}>
                Channel inheritance — currently set in the row
              </span>
              <div className={styles.cfgSummaryBox__body}>
                <strong>{INHERITANCE_MODE_LABEL[inheritanceMode]}.</strong>{' '}
                {INHERITANCE_MODE_DESC[inheritanceMode]} Change this from the
                Channel inheritance column on the attributes table.
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}

/* ─── Shared bits ──────────────────────────────────────────────────────── */

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
