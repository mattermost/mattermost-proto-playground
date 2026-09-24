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

export default function WalkthroughJumpList({
  document,
  activeStepId,
  onSelect,
}: WalkthroughJumpListProps) {
  return (
    <nav className={styles['wt-jump']} aria-label="Jump to a step">
      <p className={styles['wt-jump__label']}>Jump to</p>
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
              <ul className={styles['wt-jump__list']}>
                {sectionSteps.map((step) => (
                  <li key={step.id}>
                    <MenuItem
                      label={step.title}
                      leadingElement={false}
                      active={step.id === activeStepId}
                      onClick={() => onSelect(step.id)}
                    />
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </Scrollbar>
    </nav>
  );
}
