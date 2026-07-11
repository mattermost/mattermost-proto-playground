import { useState } from 'react';
import LabelTag from '@/components/ui/LabelTag/LabelTag';
import PopoverNotice from '@/components/ui/PopoverNotice/PopoverNotice';
import ClassificationPill from './ClassificationPill';
import {
  classificationOf,
  payloadAttributesForLocation,
  type ChannelAttributePayload,
  type DisplayOverrides,
} from './channelAttrData';
import styles from './shared.module.scss';

export interface HeaderPillsProps {
  payload: ChannelAttributePayload;
  overrides?: DisplayOverrides;
  /**
   * Number of non-Classification pills shown before collapsing to +N (A2 fixed
   * priority). Classification is ALWAYS first and never overflowed (FR-18).
   */
  visibleSlots?: number;
  /**
   * A3 mode — Classification only in the header; no other pills and no +N.
   * Every other attribute lives in the info sidebar. Overrides visibleSlots.
   */
  classificationOnly?: boolean;
}

/**
 * Channel header pills — Variant A2 (fixed-priority truncation + masking-aware
 * +N popover). The visible set and the +N count derive ONLY from the payload
 * handed in (FR-21, C-14): N = header-flagged-in-payload − Classification − shown.
 * No total-minus-shown, no client filter.
 */
export default function HeaderPills({
  payload,
  overrides,
  visibleSlots = 1,
  classificationOnly = false,
}: HeaderPillsProps) {
  const [open, setOpen] = useState(false);
  const level = classificationOf(payload);
  if (!level) return null;

  // A3: Classification pill only; no other pills, no +N.
  if (classificationOnly) {
    return (
      <div className={styles['header-pills']}>
        <ClassificationPill level={level} />
      </div>
    );
  }

  // All header-flagged attributes PRESENT in the payload, minus Classification.
  const headerAttrs = payloadAttributesForLocation(payload, 'header', overrides).filter(
    (e) => e.attr.id !== 'classification',
  );
  // Flatten to individual pills (a multi-select contributes one pill per value).
  const pillItems = headerAttrs.flatMap(({ attr, values }) =>
    values.map((v) => ({ key: `${attr.id}:${v}`, label: v, attrName: attr.name })),
  );

  const shown = pillItems.slice(0, visibleSlots);
  const overflow = pillItems.slice(visibleSlots);

  return (
    <div className={styles['header-pills']}>
      <ClassificationPill level={level} />
      {shown.map((p) => (
        <LabelTag key={p.key} label={p.label} type="Default" size="Small" />
      ))}
      {overflow.length > 0 && (
        <span className={styles['header-pills__overflow']}>
          <button
            type="button"
            className={styles['header-pills__more-btn']}
            onClick={() => setOpen((o) => !o)}
            aria-haspopup="dialog"
            aria-expanded={open}
            aria-label={`${overflow.length} more attributes`}
          >
            <LabelTag label={`+${overflow.length}`} type="Default" size="Small" />
          </button>
          {open && (
            <div className={styles['header-pills__popover']}>
              <PopoverNotice
                title="Channel attributes"
                variant="info"
                onClose={() => setOpen(false)}
              >
                <ul className={styles['header-pills__popover-list']}>
                  {overflow.map((p) => (
                    <li key={p.key} className={styles['header-pills__popover-item']}>
                      <span className={styles['header-pills__popover-name']}>{p.attrName}</span>
                      <LabelTag label={p.label} type="Default" size="X-Small" />
                    </li>
                  ))}
                </ul>
              </PopoverNotice>
            </div>
          )}
        </span>
      )}
    </div>
  );
}
