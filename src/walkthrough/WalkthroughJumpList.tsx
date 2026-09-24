import { Fragment } from 'react';
import { MenuGroupHeading } from '@mattermost/compass-ui/components/menu-group-heading';
import { MenuItem } from '@mattermost/compass-ui/components/menu-item';
import {
  PopoverMenu,
  PopoverMenuDivider,
  PopoverMenuScroll,
} from '@mattermost/compass-ui/components/popover-menu';
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
  const groups = document.sections
    .map((section) => ({
      section,
      steps: stepsForSection(document.steps, section.id),
    }))
    .filter((group) => group.steps.length > 0);

  return (
    <PopoverMenu
      className={styles['wt-jump']}
      role="menu"
      aria-label="Jump to a step"
    >
      <PopoverMenuScroll maxHeight={360}>
        {groups.map((group, index) => (
          <Fragment key={group.section.id}>
            {index > 0 && <PopoverMenuDivider />}
            <MenuGroupHeading label={group.section.label} />
            {group.steps.map((step) => (
              <MenuItem
                key={step.id}
                role="menuitem"
                label={step.title}
                leadingElement={false}
                active={step.id === activeStepId}
                onClick={() => onSelect(step.id)}
              />
            ))}
          </Fragment>
        ))}
      </PopoverMenuScroll>
    </PopoverMenu>
  );
}
