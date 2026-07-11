import { useMemo, useState } from 'react';
import ChevronLeftIcon from '@mattermost/compass-icons/components/chevron-left';
import ChevronRightIcon from '@mattermost/compass-icons/components/chevron-right';
import OpenInNewIcon from '@mattermost/compass-icons/components/open-in-new';

import Button from '@/components/ui/Button/Button';
import Icon from '@/components/ui/Icon/Icon';

import {
  GMP_WALKTHROUGH_STEPS,
  WALKTHROUGH_SECTION_LABELS,
  stepPanelLabel,
  type WalkthroughRailGroup,
  type WalkthroughSection,
  type WalkthroughStep,
} from './gmpWalkthroughSteps';

import styles from './GlobalMembershipPolicyWalkthrough.module.scss';

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
  GMP_WALKTHROUGH_STEPS.forEach((item) => {
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

export default function GlobalMembershipPolicyWalkthrough() {
  const [stepIndex, setStepIndex] = useState(0);
  const step = GMP_WALKTHROUGH_STEPS[stepIndex];
  const iframeSrc = previewSrc(step);

  const sections = useMemo(() => {
    const order: WalkthroughSection[] = [];
    GMP_WALKTHROUGH_STEPS.forEach((item) => {
      if (!order.includes(item.section)) {
        order.push(item.section);
      }
    });
    return order;
  }, []);

  const goNext = () =>
    setStepIndex((index) => Math.min(index + 1, GMP_WALKTHROUGH_STEPS.length - 1));
  const goBack = () => setStepIndex((index) => Math.max(index - 1, 0));

  return (
    <div className={styles['gmp-tour']}>
      <header className={styles['gmp-tour__header']}>
        <div>
          <p className={styles['gmp-tour__eyebrow']}>Design proposal walkthrough</p>
          <h1 className={styles['gmp-tour__title']}>Global Membership Policies</h1>
          <p className={styles['gmp-tour__subtitle']}>
            Channel-attribute references, scope targeting, and save impact — step by step.
          </p>
        </div>
        <p className={styles['gmp-tour__progress']}>
          Step {stepIndex + 1} of {GMP_WALKTHROUGH_STEPS.length}
        </p>
      </header>

      <div className={styles['gmp-tour__layout']}>
        <aside className={styles['gmp-tour__rail']}>
          <p className={styles['gmp-tour__rail-label']}>Jump to a section</p>
          {sections.map((section) => (
            <div key={section} className={styles['gmp-tour__section']}>
              <p className={styles['gmp-tour__section-title']}>
                {WALKTHROUGH_SECTION_LABELS[section]}
              </p>
              {railGroupsForSection(section).map((group) => (
                <div key={group ?? 'ungrouped'} className={styles['gmp-tour__group']}>
                  {group != null && (
                    <p className={styles['gmp-tour__group-title']}>{group}</p>
                  )}
                  <ul className={styles['gmp-tour__section-list']}>
                    {GMP_WALKTHROUGH_STEPS.map((item, index) => {
                      if (item.section !== section || item.railGroup !== group) {
                        return null;
                      }
                      const active = index === stepIndex;
                      return (
                        <li key={item.id}>
                          <button
                            type="button"
                            className={[
                              styles['gmp-tour__step-btn'],
                              group != null
                                ? styles['gmp-tour__step-btn--nested']
                                : '',
                              active ? styles['gmp-tour__step-btn--active'] : '',
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

        <section className={styles['gmp-tour__panel']}>
          <p className={styles['gmp-tour__section-tag']}>{stepPanelLabel(step)}</p>
          <h2 className={styles['gmp-tour__step-title']}>{step.title}</h2>

          {step.useCase != null && (
            <p className={styles['gmp-tour__use-case']}>{step.useCase}</p>
          )}

          {step.lead != null && (
            <p className={styles['gmp-tour__lead']}>{step.lead}</p>
          )}

          {step.lookFor.length > 0 && (
            <div className={styles['gmp-tour__look-for']}>
              <p className={styles['gmp-tour__look-for-label']}>On screen</p>
              <ul className={styles['gmp-tour__look-for-list']}>
                {step.lookFor.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          <ul className={styles['gmp-tour__bullets']}>
            {step.bullets.map((bullet) => {
              if (typeof bullet === 'string') {
                return <li key={bullet}>{bullet}</li>;
              }

              return (
                <li key={bullet.text}>
                  {bullet.text}
                  {bullet.sub != null && bullet.sub.length > 0 && (
                    <ul className={styles['gmp-tour__sub-bullets']}>
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
            <p className={styles['gmp-tour__callout']}>{step.callout}</p>
          )}

          <div className={styles['gmp-tour__nav']}>
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
              disabled={stepIndex === GMP_WALKTHROUGH_STEPS.length - 1}
              onClick={goNext}
            >
              Next
            </Button>
          </div>
        </section>

        <section className={styles['gmp-tour__preview']}>
          <div className={styles['gmp-tour__preview-head']}>
            <p className={styles['gmp-tour__preview-label']}>Live prototype</p>
            <a
              className={styles['gmp-tour__preview-link']}
              href={iframeSrc}
              target="_blank"
              rel="noreferrer"
            >
              Open in new tab
              <Icon size="16" glyph={<OpenInNewIcon />} />
            </a>
          </div>

          <div className={styles['gmp-tour__preview-frame']}>
            <iframe
              key={iframeSrc}
              className={styles['gmp-tour__iframe']}
              title={`Prototype preview: ${step.title}`}
              src={iframeSrc}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
