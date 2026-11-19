import { Button } from '@mattermost/compass-ui/components/button';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { Scrollbar } from '@mattermost/compass-ui/components/scrollbar';
import { SectionNotice } from '@mattermost/compass-ui/components/section-notice';
import { Tag } from '@mattermost/compass-ui/components/tag';
import ArchiveOutlineIcon from '@mattermost/compass-icons/components/archive-outline';
import ArrowRightIcon from '@mattermost/compass-icons/components/arrow-right';
import CheckCircleIcon from '@mattermost/compass-icons/components/check-circle';
import FileTextOutlineIcon from '@mattermost/compass-icons/components/file-text-outline';
import MessageTextOutlineIcon from '@mattermost/compass-icons/components/message-text-outline';
import { hardeningDone, visibleRuns, type StoryState } from '../spacesStory';
import shared from '../Spaces.module.scss';
import styles from './CloseScene.module.scss';

export interface CloseSceneProps {
  story: StoryState;
  onStoryChange: (update: Partial<StoryState>) => void;
}

export default function CloseScene({ story, onStoryChange }: CloseSceneProps) {
  const hardening = hardeningDone(story);
  const runs = visibleRuns(story);
  const leftovers = story.tasks.filter((t) => t.status !== 'done');

  const criteria = [
    {
      label: `Legacy authentication retired in ${hardening.done} of ${hardening.total} business units`,
      met: hardening.done === hardening.total,
    },
    {
      label: '14 days with no successful spray (last: INC-1294 on Oct 14)',
      met: true,
    },
    { label: 'Every incident run closed with an after-action', met: true },
  ];

  const stats = [
    { value: '6 weeks', label: 'Oct 5 to Nov 13, on the target date' },
    { value: '2', label: 'incidents, both contained in under 4 h' },
    { value: '1', label: 'risk decision, made in 2 days' },
    { value: '31%', label: 'of hardening time spent waiting on people' },
  ];

  return (
    <Scrollbar className={shared['spaces__scroll']}>
      <div className={shared['spaces__body']}>
        {story.closed ? (
          <SectionNotice
            type="success"
            title="Space closed"
            description={`${runs.length} runs archived together. The after-action page and the summary in ~incident-status-updates link back here.`}
          />
        ) : null}
        <div className={shared['spaces__grid']}>
          <div className={shared['spaces__column']}>
            <section
              className={shared['spaces__panel']}
              aria-labelledby="criteria-title"
            >
              <div className={shared['spaces__panel-header']}>
                <h2
                  id="criteria-title"
                  className={shared['spaces__panel-title']}
                >
                  Exit criteria
                </h2>
                <Tag label="All met" type="success" size="x-small" />
              </div>
              <ul className={shared['spaces__list']}>
                {criteria.map((c) => (
                  <li key={c.label} className={shared['spaces__row']}>
                    <Icon
                      glyph={<CheckCircleIcon />}
                      size="20"
                      className={styles['close-scene__met']}
                    />
                    <div className={shared['spaces__row-main']}>
                      <span className={shared['spaces__row-title']}>
                        {c.label}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            <section
              className={shared['spaces__panel']}
              aria-labelledby="measure-title"
            >
              <div className={shared['spaces__panel-header']}>
                <h2
                  id="measure-title"
                  className={shared['spaces__panel-title']}
                >
                  How the campaign went
                </h2>
                <span className={shared['spaces__panel-aside']}>
                  Computed from logged times
                </span>
              </div>
              <div className={styles['close-scene__stats']}>
                {stats.map((s) => (
                  <div key={s.label} className={styles['close-scene__stat']}>
                    <span className={styles['close-scene__stat-value']}>
                      {s.value}
                    </span>
                    <span className={shared['spaces__muted']}>{s.label}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className={shared['spaces__column']}>
            <section
              className={shared['spaces__panel']}
              aria-labelledby="close-title"
            >
              <div className={shared['spaces__panel-header']}>
                <h2 id="close-title" className={shared['spaces__panel-title']}>
                  When you close
                </h2>
              </div>
              <ul className={shared['spaces__list']}>
                <li className={shared['spaces__row']}>
                  <Icon glyph={<ArchiveOutlineIcon />} size="16" />
                  <span className={shared['spaces__row-meta']}>
                    {runs.length} runs and boards archive together
                  </span>
                </li>
                <li className={shared['spaces__row']}>
                  <Icon glyph={<FileTextOutlineIcon />} size="16" />
                  <span className={shared['spaces__row-meta']}>
                    After-action page covers INC-1281 and INC-1294
                  </span>
                </li>
                <li className={shared['spaces__row']}>
                  <Icon glyph={<MessageTextOutlineIcon />} size="16" />
                  <span className={shared['spaces__row-meta']}>
                    Summary posts to ~incident-status-updates
                  </span>
                </li>
                {leftovers.map((t) => (
                  <li key={t.id} className={shared['spaces__row']}>
                    <Icon glyph={<ArrowRightIcon />} size="16" />
                    <div className={shared['spaces__row-main']}>
                      <span className={shared['spaces__row-meta']}>
                        &ldquo;{t.title}&rdquo; moves to{' '}
                        <strong>Detection engineering</strong>
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
              <div className={shared['spaces__panel-body']}>
                <div>
                  <Button
                    emphasis="primary"
                    disabled={story.closed}
                    onClick={() => onStoryChange({ closed: true })}
                  >
                    {story.closed ? 'Closed' : 'Close Space'}
                  </Button>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </Scrollbar>
  );
}
