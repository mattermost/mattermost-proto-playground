import { useMemo, useState } from 'react';
import ChevronRightIcon from '@mattermost/compass-icons/components/chevron-right';
import { Checkbox } from '@mattermost/compass-ui/components/checkbox';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { IconButton } from '@mattermost/compass-ui/components/icon-button';
import { SearchInput } from '@mattermost/compass-ui/components/search-input';
import { Tag } from '@mattermost/compass-ui/components/tag';
import { WithTooltip } from '@mattermost/compass-proto';
import type { StepCategory } from '../weaveAutomationPermissionsData';
import { glyphForStep } from './stepIcons';
import styles from './StepPicker.module.scss';

interface StepPickerProps {
  /** Categories and steps to offer. */
  catalog: StepCategory[];
  selected: Set<string>;
  onChange: (next: Set<string>) => void;
  /** Step ids to mark as new. Their categories start expanded. */
  highlight?: string[];
  /** Accessible name for the list. */
  label: string;
}

/**
 * Category checklist with expandable steps. Compass has no tree checklist, so
 * this composes Checkbox, IconButton and SearchInput (prototype-only).
 */
export default function StepPicker({
  catalog,
  selected,
  onChange,
  highlight = [],
  label,
}: StepPickerProps) {
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState<Set<string>>(
    () =>
      new Set(
        catalog
          .filter((c) => c.steps.some((s) => highlight.includes(s.id)))
          .map((c) => c.id),
      ),
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return catalog;
    return catalog
      .map((c) =>
        c.label.toLowerCase().includes(q)
          ? c
          : {
              ...c,
              steps: c.steps.filter((s) => s.label.toLowerCase().includes(q)),
            },
      )
      .filter((c) => c.steps.length > 0);
  }, [catalog, query]);

  const total = catalog.reduce((n, c) => n + c.steps.length, 0);
  const granted = catalog.reduce(
    (n, c) => n + c.steps.filter((s) => selected.has(s.id)).length,
    0,
  );

  function toggleCategory(cat: StepCategory, on: boolean) {
    const next = new Set(selected);
    cat.steps.forEach((s) => (on ? next.add(s.id) : next.delete(s.id)));
    onChange(next);
  }

  function toggleStep(id: string, on: boolean) {
    const next = new Set(selected);
    if (on) next.add(id);
    else next.delete(id);
    onChange(next);
  }

  function toggleExpanded(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className={styles['step-picker']}>
      <div className={styles['step-picker__toolbar']}>
        <SearchInput
          className={styles['step-picker__search']}
          size="small"
          placeholder="Search steps"
          aria-label="Search steps"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onClear={() => setQuery('')}
        />
        <span className={styles['step-picker__count']} aria-live="polite">
          {granted} of {total} steps
        </span>
      </div>

      <ul className={styles['step-picker__list']} aria-label={label}>
        {visible.map((cat) => {
          const all = catalog.find((c) => c.id === cat.id) ?? cat;
          const on = all.steps.filter((s) => selected.has(s.id)).length;
          const isOpen = query.trim() !== '' || expanded.has(cat.id);
          const newCount = all.steps.filter((s) =>
            highlight.includes(s.id),
          ).length;
          const regionId = `steps-${cat.id}`;
          return (
            <li key={cat.id} className={styles['step-picker__category']}>
              <div className={styles['step-picker__row']}>
                <Checkbox
                  checked={on === all.steps.length}
                  indeterminate={on > 0 && on < all.steps.length}
                  onChange={(e) => toggleCategory(all, e.target.checked)}
                >
                  <span className={styles['step-picker__label']}>
                    {cat.label}
                  </span>
                </Checkbox>
                {newCount > 0 && (
                  <Tag label={`${newCount} new`} type="warning" />
                )}
                <span className={styles['step-picker__meta']}>
                  {on} of {all.steps.length}
                </span>
                <WithTooltip label={isOpen ? 'Hide steps' : 'Show steps'}>
                  <IconButton
                    size="small"
                    padding="compact"
                    icon={<Icon glyph={<ChevronRightIcon />} />}
                    aria-label={`${isOpen ? 'Hide' : 'Show'} ${cat.label} steps`}
                    aria-expanded={isOpen}
                    aria-controls={regionId}
                    className={
                      isOpen
                        ? `${styles['step-picker__chevron']} ${styles['step-picker__chevron--open']}`
                        : styles['step-picker__chevron']
                    }
                    onClick={() => toggleExpanded(cat.id)}
                  />
                </WithTooltip>
              </div>
              <div
                id={regionId}
                className={
                  isOpen
                    ? `${styles['step-picker__collapse']} ${styles['step-picker__collapse--expanded']}`
                    : styles['step-picker__collapse']
                }
                aria-hidden={!isOpen}
              >
                <div className={styles['step-picker__collapse-inner']}>
                  <ul className={styles['step-picker__steps']}>
                    {cat.steps.map((step) => {
                      const Glyph = glyphForStep(step.type);
                      return (
                        <li
                          key={step.id}
                          className={styles['step-picker__step']}
                        >
                          <Checkbox
                            checked={selected.has(step.id)}
                            tabIndex={isOpen ? 0 : -1}
                            onChange={(e) =>
                              toggleStep(step.id, e.target.checked)
                            }
                          >
                            <span className={styles['step-picker__step-label']}>
                              <Icon glyph={<Glyph />} size="16" />
                              {step.label}
                            </span>
                          </Checkbox>
                          {highlight.includes(step.id) && (
                            <Tag label="New" type="warning" />
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
