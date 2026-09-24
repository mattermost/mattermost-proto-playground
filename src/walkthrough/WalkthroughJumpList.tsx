import { MenuGroupHeading } from '@mattermost/compass-ui/components/menu-group-heading';
import { MenuItem } from '@mattermost/compass-ui/components/menu-item';
import { Tag } from '@mattermost/compass-ui/components/tag';
import { Scrollbar } from '@mattermost/compass-ui/components/scrollbar';
import type { WalkthroughDocument, WalkthroughStep } from '@/walkthrough/types';
import styles from './WalkthroughJumpList.module.scss';

type WalkthroughJumpListProps = {
  document: WalkthroughDocument;
  activeStepId: string;
  onSelect: (stepId: string) => void;
};

function stepsForSection(
  steps: WalkthroughStep[],
  sectionId: string,
): WalkthroughStep[] {
  return steps.filter((s) => s.section === sectionId);
}

function groupsInSection(steps: WalkthroughStep[]): (string | undefined)[] {
  const seen: (string | undefined)[] = [];
  steps.forEach((s) => {
    if (!seen.includes(s.railGroup)) seen.push(s.railGroup);
  });
  return seen;
}

export default function WalkthroughJumpList({
  document,
  activeStepId,
  onSelect,
}: WalkthroughJumpListProps) {
  return (
    <nav className={styles['wt-jump']} aria-label="Jump to a section">
      <p className={styles['wt-jump__label']}>Jump to a section</p>
      <Scrollbar className={styles['wt-jump__scroll']}>
        {document.sections.map((section) => {
          const sectionSteps = stepsForSection(document.steps, section.id);
          if (!sectionSteps.length) return null;
          return (
            <div key={section.id} className={styles['wt-jump__section']}>
              <div className={styles['wt-jump__section-head']}>
                <p className={styles['wt-jump__section-title']}>{section.label}</p>
                {section.badge && (
                  <Tag
                    label={section.badge.label}
                    type={section.badge.appearance ?? 'default'}
                    size="x-small"
                    casing="all-caps"
                  />
                )}
              </div>
              {groupsInSection(sectionSteps).map((group) => (
                <div key={group ?? 'ungrouped'} className={styles['wt-jump__group']}>
                  {group != null && <MenuGroupHeading label={group} />}
                  <ul className={styles['wt-jump__list']}>
                    {sectionSteps
                      .filter((s) => s.railGroup === group)
                      .map((step) => (
                        <li key={step.id}>
                          <MenuItem
                            label={step.title}
                            leadingElement={false}
                            active={step.id === activeStepId}
                            onClick={() => onSelect(step.id)}
                            className={
                              group != null ? styles['wt-jump__item--nested'] : undefined
                            }
                          />
                        </li>
                      ))}
                  </ul>
                </div>
              ))}
            </div>
          );
        })}
      </Scrollbar>
    </nav>
  );
}
