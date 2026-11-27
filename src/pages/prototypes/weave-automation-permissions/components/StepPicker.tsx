import { useMemo, useState } from 'react';
import ChevronRightIcon from '@mattermost/compass-icons/components/chevron-right';
import { Button } from '@mattermost/compass-ui/components/button';
import { Checkbox } from '@mattermost/compass-ui/components/checkbox';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { IconButton } from '@mattermost/compass-ui/components/icon-button';
import { MenuGroupHeading } from '@mattermost/compass-ui/components/menu-group-heading';
import { SearchInput } from '@mattermost/compass-ui/components/search-input';
import { Tag } from '@mattermost/compass-ui/components/tag';
import { WithTooltip } from '@mattermost/compass-proto';
import {
  STEP_GROUP_NOTES,
  type Step,
  type StepCategory,
} from '../weaveAutomationPermissionsData';
import { FormatVerticalAlignCenterIcon, ArrowUpDownIcon } from './ExpandIcons';
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
  /** Category ids to start open (a walkthrough step may ask for these). */
  initialExpanded?: string[];
  /** `data-wt-focus` for the toolbar (search, select all, expand all). */
  focusId?: string;
}

/** Splits a category's steps into titled sections, in first-seen order. */
function sectionsOf(steps: Step[]): { title?: string; steps: Step[] }[] {
  const sections: { title?: string; steps: Step[] }[] = [];
  steps.forEach((step) => {
    let section = sections.find((sec) => sec.title === step.group);
    if (!section) {
      section = { title: step.group, steps: [] };
      sections.push(section);
    }
    section.steps.push(step);
  });
  return sections;
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
  initialExpanded = [],
  focusId,
}: StepPickerProps) {
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState<Set<string>>(
    () =>
      new Set([
        ...catalog
          .filter((c) => c.steps.some((s) => highlight.includes(s.id)))
          .map((c) => c.id),
        ...initialExpanded,
      ]),
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

  const allExpanded =
    visible.length > 0 && visible.every((c) => expanded.has(c.id));
  const searching = query.trim() !== '';

  // Selecting acts on what is listed, so a search narrows it to the matches.
  const listedIds = visible.flatMap((c) => c.steps.map((st) => st.id));
  const listedOn = listedIds.filter((id) => selected.has(id)).length;
  const allSelected = listedIds.length > 0 && listedOn === listedIds.length;

  function selectAll(on: boolean) {
    const next = new Set(selected);
    listedIds.forEach((id) => (on ? next.add(id) : next.delete(id)));
    onChange(next);
  }

  function toggleAll() {
    setExpanded(allExpanded ? new Set() : new Set(catalog.map((c) => c.id)));
  }

  return (
    <div className={styles['step-picker']}>
      <div className={styles['step-picker__toolbar']} data-wt-focus={focusId}>
        <Checkbox
          className={styles['step-picker__select-all']}
          checked={allSelected}
          indeterminate={listedOn > 0 && !allSelected}
          disabled={listedIds.length === 0}
          onChange={(e) => selectAll(e.target.checked)}
        >
          Select all
        </Checkbox>
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
        <div className={styles['step-picker__toolbar-actions']}>
          <Button
            emphasis="dim"
            size="small"
            compact
            trailingIcon={
              <Icon
                glyph={
                  allExpanded ? (
                    <FormatVerticalAlignCenterIcon />
                  ) : (
                    <ArrowUpDownIcon />
                  )
                }
              />
            }
            disabled={searching}
            onClick={toggleAll}
          >
            {allExpanded ? 'Collapse all' : 'Expand all'}
          </Button>
        </div>
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
              {/* The row opens and closes the category, except over the checkbox
                  label, which checks it. The chevron is the keyboard path: its
                  click bubbles up here, so it has no handler of its own. */}
              {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
              <div
                className={
                  isOpen
                    ? `${styles['step-picker__row']} ${styles['step-picker__row--open']}`
                    : styles['step-picker__row']
                }
                onClick={(e) => {
                  if ((e.target as HTMLElement).closest('label')) return;
                  toggleExpanded(cat.id);
                }}
              >
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
                  />
                </WithTooltip>
                <Checkbox
                  className={styles['step-picker__check']}
                  checked={on === all.steps.length}
                  indeterminate={on > 0 && on < all.steps.length}
                  onChange={(e) => toggleCategory(all, e.target.checked)}
                >
                  <span className={styles['step-picker__label']}>
                    {cat.label}
                  </span>
                </Checkbox>
                <span className={styles['step-picker__spacer']} />
                {newCount > 0 && (
                  <Tag label={`${newCount} new`} type="warning" />
                )}
                <span className={styles['step-picker__meta']}>
                  {on} of {all.steps.length}
                </span>
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
                  {sectionsOf(cat.steps).map((section) => (
                    <div
                      key={section.title ?? 'all'}
                      className={styles['step-picker__section']}
                      data-wt-focus={
                        section.title === 'Blocking hooks'
                          ? 'blocking-hooks'
                          : undefined
                      }
                    >
                      {section.title && (
                        <MenuGroupHeading
                          className={styles['step-picker__group-title']}
                          label={section.title}
                        />
                      )}
                      {section.title && STEP_GROUP_NOTES[section.title] && (
                        <p className={styles['step-picker__group-note']}>
                          {STEP_GROUP_NOTES[section.title]}
                        </p>
                      )}
                      <ul className={styles['step-picker__steps']}>
                        {section.steps.map((step) => {
                          const Glyph = glyphForStep(step.type);
                          return (
                            <li
                              key={step.id}
                              className={styles['step-picker__step']}
                            >
                              <Checkbox
                                className={styles['step-picker__step-check']}
                                checked={selected.has(step.id)}
                                tabIndex={isOpen ? 0 : -1}
                                onChange={(e) =>
                                  toggleStep(step.id, e.target.checked)
                                }
                              >
                                <span
                                  className={styles['step-picker__step-label']}
                                >
                                  <Icon glyph={<Glyph />} size="16" />
                                  <span>
                                    {step.label}
                                    {highlight.includes(step.id) && (
                                      <Tag
                                        className={
                                          styles['step-picker__new-tag']
                                        }
                                        label="New"
                                        type="warning"
                                      />
                                    )}
                                  </span>
                                </span>
                              </Checkbox>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
