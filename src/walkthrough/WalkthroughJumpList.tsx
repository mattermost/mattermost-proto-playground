import { Fragment } from 'react';
import { MenuGroupHeading } from '@mattermost/compass-ui/components/menu-group-heading';
import { MenuItem } from '@mattermost/compass-ui/components/menu-item';
import {
  PopoverMenu,
  PopoverMenuDivider,
  PopoverMenuScroll,
} from '@mattermost/compass-ui/components/popover-menu';
import { Scrollbar } from '@mattermost/compass-ui/components/scrollbar';
import type { WalkthroughDocument, WalkthroughStep } from '@/walkthrough/types';
import styles from './WalkthroughJumpList.module.scss';

type WalkthroughJumpListProps = {
  document: WalkthroughDocument;
  activeStepId: string;
  onSelect: (stepId: string) => void;
  /** `popover` under Jump to; `panel` for the wide-viewport docked column. */
  variant?: 'popover' | 'panel';
};

function stepsForSection(
  steps: WalkthroughStep[],
  sectionId: string,
): WalkthroughStep[] {
  return steps.filter((s) => s.section === sectionId);
}

function JumpListGroups({
  document,
  activeStepId,
  onSelect,
  withDividers,
}: {
  document: WalkthroughDocument;
  activeStepId: string;
  onSelect: (stepId: string) => void;
  withDividers: boolean;
}) {
  const groups = document.sections
    .map((section) => ({
      section,
      steps: stepsForSection(document.steps, section.id),
    }))
    .filter((group) => group.steps.length > 0);

  return (
    <>
      {groups.map((group, index) => (
        <Fragment key={group.section.id}>
          {withDividers && index > 0 && <PopoverMenuDivider />}
          {!withDividers && index > 0 && (
            <div className={styles['wt-jump__divider']} role="separator" />
          )}
          <MenuGroupHeading label={group.section.label} />
          {group.steps.map((step) => (
            <MenuItem
              key={step.id}
              className={styles['wt-jump__item']}
              role="menuitem"
              label={step.title}
              leadingElement={false}
              active={step.id === activeStepId}
              onClick={() => onSelect(step.id)}
            />
          ))}
        </Fragment>
      ))}
    </>
  );
}

export default function WalkthroughJumpList({
  document,
  activeStepId,
  onSelect,
  variant = 'popover',
}: WalkthroughJumpListProps) {
  if (variant === 'panel') {
    return (
      <nav className={styles['wt-jump-panel']} aria-label="Jump to a step">
        <div className={styles['wt-jump-panel__body']}>
          <Scrollbar>
            <div className={styles['wt-jump-panel__list']}>
              <JumpListGroups
                document={document}
                activeStepId={activeStepId}
                onSelect={onSelect}
                withDividers={false}
              />
            </div>
          </Scrollbar>
        </div>
      </nav>
    );
  }

  return (
    <PopoverMenu
      className={styles['wt-jump']}
      role="menu"
      aria-label="Jump to a step"
    >
      <PopoverMenuScroll maxHeight={360}>
        <JumpListGroups
          document={document}
          activeStepId={activeStepId}
          onSelect={onSelect}
          withDividers
        />
      </PopoverMenuScroll>
    </PopoverMenu>
  );
}
