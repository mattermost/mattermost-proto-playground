import { useMemo, useState } from 'react';
import ChevronLeftIcon from '@mattermost/compass-icons/components/chevron-left';
import ChevronRightIcon from '@mattermost/compass-icons/components/chevron-right';
import OpenInNewIcon from '@mattermost/compass-icons/components/open-in-new';

import Button from '@/components/ui/Button/Button';
import Icon from '@/components/ui/Icon/Icon';

import {
  ATTRIBUTE_MANAGEMENT_WALKTHROUGH_STEPS,
  WALKTHROUGH_SECTION_LABELS,
  stepPanelLabel,
  type WalkthroughRailGroup,
  type WalkthroughSection,
  type WalkthroughStep,
} from './AttributeManagementWalkthroughSteps';

import styles from './AttributeManagementWalkthrough.module.scss';

function previewSrc(step: WalkthroughStep): string {
  if (step.preview.kind === 'external') {
    return step.preview.url;
  }
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return `${base}${step.preview.path}`;
}

function railGroupsForSection(
  section: WalkthroughSection,
): Array<WalkthroughRailGroup | undefined> {
  const groups: Array<WalkthroughRailGroup | undefined> = [];
  ATTRIBUTE_MANAGEMENT_WALKTHROUGH_STEPS.forEach((item) => {
    if (item.section !== section) {
      return;
    }
    const group = item.railGroup;
    if (!groups.includes(group)) {
      groups.push(group);
    }
  });
  return groups;
}

export default function AttributeManagementWalkthrough() {
  const [stepIndex, setStepIndex] = useState(0);
  const step = ATTRIBUTE_MANAGEMENT_WALKTHROUGH_STEPS[stepIndex];
  const iframeSrc = previewSrc(step);

  const sections = useMemo(() => {
    const order: WalkthroughSection[] = [];
    ATTRIBUTE_MANAGEMENT_WALKTHROUGH_STEPS.forEach((item) => {
      if (!order.includes(item.section)) {
        order.push(item.section);
      }
    });
    return order;
  }, []);

  const goNext = () =>
    setStepIndex((index) =>
      Math.min(index + 1, ATTRIBUTE_MANAGEMENT_WALKTHROUGH_STEPS.length - 1),
    );
  const goBack = () => setStepIndex((index) => Math.max(index - 1, 0));

  return (
    <div className={styles['attr-tour']}>
      <header className={styles['attr-tour__header']}>
        <div>
          <p className={styles['attr-tour__eyebrow']}>Shipped MVP walkthrough</p>
          <h1 className={styles['attr-tour__title']}>Attribute Management (MVP / P0)</h1>
          <p className={styles['attr-tour__subtitle']}>
            Define an attribute once, then choose which of Users, Channels, and
            Posts use it — a step-by-step tour of the shipped `attribute-hub-mvp`
            prototype, grounded in the current spec.
          </p>
        </div>
        <p className={styles['attr-tour__progress']}>
          Step {stepIndex + 1} of {ATTRIBUTE_MANAGEMENT_WALKTHROUGH_STEPS.length}
        </p>
      </header>

      <div className={styles['attr-tour__layout']}>
        <aside className={styles['attr-tour__rail']}>
          <p className={styles['attr-tour__rail-label']}>Jump to a section</p>
          {sections.map((section) => (
            <div key={section} className={styles['attr-tour__section']}>
              <p className={styles['attr-tour__section-title']}>
                {WALKTHROUGH_SECTION_LABELS[section]}
              </p>
              {railGroupsForSection(section).map((group) => (
                <div key={group ?? 'ungrouped'} className={styles['attr-tour__group']}>
                  {group != null && (
                    <p className={styles['attr-tour__group-title']}>{group}</p>
                  )}
                  <ul className={styles['attr-tour__section-list']}>
                    {ATTRIBUTE_MANAGEMENT_WALKTHROUGH_STEPS.map((item, index) => {
                      if (item.section !== section || item.railGroup !== group) {
                        return null;
                      }
                      const active = index === stepIndex;
                      return (
                        <li key={item.id}>
                          <button
                            type="button"
                            className={[
                              styles['attr-tour__step-btn'],
                              group != null
                                ? styles['attr-tour__step-btn--nested']
                                : '',
                              active ? styles['attr-tour__step-btn--active'] : '',
                            ]
                              .filter(Boolean)
                              .join(' ')}
                            onClick={() => setStepIndex(index)}
                          >
                            {item.title}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          ))}
        </aside>

        <section className={styles['attr-tour__panel']}>
          <p className={styles['attr-tour__section-tag']}>{stepPanelLabel(step)}</p>
          <h2 className={styles['attr-tour__step-title']}>{step.title}</h2>

          {step.useCase != null && (
            <p className={styles['attr-tour__use-case']}>{step.useCase}</p>
          )}

          {step.lead != null && (
            <p className={styles['attr-tour__lead']}>{step.lead}</p>
          )}

          {step.lookFor.length > 0 && (
            <div className={styles['attr-tour__look-for']}>
              <p className={styles['attr-tour__look-for-label']}>On screen</p>
              <ul className={styles['attr-tour__look-for-list']}>
                {step.lookFor.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          <ul className={styles['attr-tour__bullets']}>
            {step.bullets.map((bullet) => {
              if (typeof bullet === 'string') {
                return <li key={bullet}>{bullet}</li>;
              }

              return (
                <li key={bullet.text}>
                  {bullet.text}
                  {bullet.sub != null && bullet.sub.length > 0 && (
                    <ul className={styles['attr-tour__sub-bullets']}>
                      {bullet.sub.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>

          {step.callout != null && (
            <p className={styles['attr-tour__callout']}>{step.callout}</p>
          )}

          <div className={styles['attr-tour__nav']}>
            <Button
              emphasis="Tertiary"
              size="Small"
              leadingIcon={<Icon size="16" glyph={<ChevronLeftIcon />} />}
              disabled={stepIndex === 0}
              onClick={goBack}
            >
              Back
            </Button>
            <Button
              emphasis="Primary"
              size="Small"
              trailingIcon={<Icon size="16" glyph={<ChevronRightIcon />} />}
              disabled={stepIndex === ATTRIBUTE_MANAGEMENT_WALKTHROUGH_STEPS.length - 1}
              onClick={goNext}
            >
              Next
            </Button>
          </div>
        </section>

        <section className={styles['attr-tour__preview']}>
          <div className={styles['attr-tour__preview-head']}>
            <p className={styles['attr-tour__preview-label']}>Live prototype</p>
            <a
              className={styles['attr-tour__preview-link']}
              href={iframeSrc}
              target="_blank"
              rel="noreferrer"
            >
              Open in new tab
              <Icon size="16" glyph={<OpenInNewIcon />} />
            </a>
          </div>

          <div className={styles['attr-tour__preview-frame']}>
            <iframe
              key={iframeSrc}
              className={styles['attr-tour__iframe']}
              title={`Prototype preview: ${step.title}`}
              src={iframeSrc}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
