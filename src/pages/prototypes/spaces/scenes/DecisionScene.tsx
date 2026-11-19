import { useState } from 'react';
import { Button } from '@mattermost/compass-ui/components/button';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { Radio } from '@mattermost/compass-ui/components/radio';
import { Scrollbar } from '@mattermost/compass-ui/components/scrollbar';
import { SectionNotice } from '@mattermost/compass-ui/components/section-notice';
import { Tag } from '@mattermost/compass-ui/components/tag';
import { TextArea } from '@mattermost/compass-ui/components/text-area';
import { UserAvatar } from '@mattermost/compass-ui/components/user-avatar';
import BellRingOutlineIcon from '@mattermost/compass-icons/components/bell-ring-outline';
import FlagOutlineIcon from '@mattermost/compass-icons/components/flag-outline';
import AlertOutlineIcon from '@mattermost/compass-icons/components/alert-outline';
import FileTextOutlineIcon from '@mattermost/compass-icons/components/file-text-outline';
import { PEOPLE } from '../spacesData';
import { hardeningDone, type StoryState } from '../spacesStory';
import shared from '../Spaces.module.scss';
import styles from './DecisionScene.module.scss';

const HISTORY = [
  {
    icon: <BellRingOutlineIcon />,
    text: 'Reminded Austin Arthur: "Replace the legacy mail client" is due Thursday',
    when: 'Oct 26',
  },
  {
    icon: <AlertOutlineIcon />,
    text: 'Austin marked it blocked: the release servers need an exception',
    when: 'Oct 27',
  },
  {
    icon: <BellRingOutlineIcon />,
    text: 'Reminded Austin again; no change after 24 hours',
    when: 'Oct 28',
  },
  {
    icon: <FlagOutlineIcon />,
    text: 'Escalated to Alex Reid as a risk decision, per the template rule',
    when: 'Oct 29',
  },
];

const OPTIONS = [
  {
    key: 'exception',
    label: 'Grant a 30-day exception',
    detail:
      'Release servers keep the legacy client behind an IP allowlist, with a detection rule on every login. Hardening can finish.',
  },
  {
    key: 'deny',
    label: 'Deny the exception',
    detail:
      'Release servers lose mail alerts until the client is replaced (about 2 weeks). The campaign end date moves.',
  },
];

const LOG = [
  {
    title: 'Treat the fake Okta pages as part of the campaign',
    by: 'jthomas',
    when: 'Oct 19',
  },
  { title: 'Share IOC set v3 with the ISAC', by: 'areid', when: 'Oct 14' },
  {
    title: 'Open the campaign Space and name Jackson lead',
    by: 'areid',
    when: 'Oct 5',
  },
];

export interface DecisionSceneProps {
  story: StoryState;
  onStoryChange: (update: Partial<StoryState>) => void;
}

export default function DecisionScene({
  story,
  onStoryChange,
}: DecisionSceneProps) {
  const [choice, setChoice] = useState('exception');
  const [note, setNote] = useState(
    'Approved with the allowlist and login alerting. Review on Nov 30.',
  );
  const decided = story.decision === 'approved';
  const austin = PEOPLE.aarthur!;
  const reid = PEOPLE.areid!;
  const hardening = hardeningDone(story);

  const record = () => {
    onStoryChange({
      decision: 'approved',
      tasks: story.tasks.map((t) =>
        t.id === 't11' ? { ...t, status: 'in-progress', note: undefined } : t,
      ),
    });
  };

  return (
    <Scrollbar className={shared['spaces__scroll']}>
      <div className={shared['spaces__body']}>
        <div className={shared['spaces__grid']}>
          <div className={shared['spaces__column']}>
            <section
              className={shared['spaces__panel']}
              aria-labelledby="decision-title"
            >
              <div className={shared['spaces__panel-header']}>
                <span
                  className={`${shared['spaces__icon-tile']} ${shared['spaces__icon-tile--danger']}`}
                  aria-hidden
                >
                  <Icon glyph={<FlagOutlineIcon />} size="20" />
                </span>
                <div className={shared['spaces__row-main']}>
                  <h2
                    id="decision-title"
                    className={shared['spaces__panel-title']}
                  >
                    Exception for the legacy mail client on the release servers
                  </h2>
                  <span className={shared['spaces__muted']}>
                    Risk decision for {reid.name} · from Hardening · Product
                    Engineering
                  </span>
                </div>
                <Tag
                  label={decided ? 'Decided' : 'Waiting 2 days · decide by Fri'}
                  type={decided ? 'success' : 'danger'}
                  size="small"
                />
              </div>
              <div className={shared['spaces__panel-body']}>
                <div className={styles['decision-scene__context']}>
                  <UserAvatar src={austin.avatar} alt={austin.name} size="32" />
                  <p>
                    <strong>{austin.name}:</strong> &ldquo;The release servers
                    send build alerts through a mail client that can&rsquo;t do
                    modern auth. Replacing it is a two-week job. I need an
                    exception or a new date.&rdquo;
                  </p>
                </div>
                <p className={styles['decision-scene__impact']}>
                  Why it matters: hardening is at {hardening.done} of 5 business
                  units. The campaign can&rsquo;t meet its exit criteria until
                  legacy authentication is retired everywhere.
                </p>

                {decided ? (
                  <SectionNotice
                    type="success"
                    title="Decision recorded"
                    description="Saved to the Decision log page. Austin's run is unblocked and the Space is back on track."
                  />
                ) : (
                  <fieldset className={styles['decision-scene__options']}>
                    <legend className={styles['decision-scene__legend']}>
                      Your call
                    </legend>
                    {OPTIONS.map((o) => (
                      <Radio
                        key={o.key}
                        className={styles['decision-scene__option']}
                        name="decision"
                        value={o.key}
                        checked={choice === o.key}
                        onChange={() => setChoice(o.key)}
                      >
                        <span className={styles['decision-scene__option-text']}>
                          <span className={shared['spaces__row-title']}>
                            {o.label}
                          </span>
                          <span className={shared['spaces__row-meta']}>
                            {o.detail}
                          </span>
                        </span>
                      </Radio>
                    ))}
                    <TextArea
                      label="Note for the decision log"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                    />
                    <div>
                      <Button emphasis="primary" onClick={record}>
                        Record decision
                      </Button>
                    </div>
                  </fieldset>
                )}
              </div>
            </section>

            <section
              className={shared['spaces__panel']}
              aria-labelledby="history-title"
            >
              <div className={shared['spaces__panel-header']}>
                <h2
                  id="history-title"
                  className={shared['spaces__panel-title']}
                >
                  How it got here
                </h2>
                <span className={shared['spaces__panel-aside']}>
                  Reminders and escalation are rule-based
                </span>
              </div>
              <ol className={shared['spaces__list']}>
                {HISTORY.map((h) => (
                  <li key={h.text} className={shared['spaces__row']}>
                    <Icon glyph={h.icon} size="16" />
                    <div className={shared['spaces__row-main']}>
                      <span className={shared['spaces__row-meta']}>
                        {h.text}
                      </span>
                    </div>
                    <span className={shared['spaces__muted']}>{h.when}</span>
                  </li>
                ))}
              </ol>
            </section>
          </div>

          <div className={shared['spaces__column']}>
            <section
              className={shared['spaces__panel']}
              aria-labelledby="log-title"
            >
              <div className={shared['spaces__panel-header']}>
                <Icon glyph={<FileTextOutlineIcon />} size="16" />
                <h2 id="log-title" className={shared['spaces__panel-title']}>
                  Decision log
                </h2>
                <span className={shared['spaces__panel-aside']}>
                  Page in this Space
                </span>
              </div>
              <ul className={shared['spaces__list']} aria-live="polite">
                {decided ? (
                  <li
                    className={`${shared['spaces__row']} ${shared['spaces__row--arrived']}`}
                  >
                    <div className={shared['spaces__row-main']}>
                      <span className={shared['spaces__row-title']}>
                        {OPTIONS.find((o) => o.key === choice)!.label}
                      </span>
                      <span className={shared['spaces__row-meta']}>{note}</span>
                      <span className={shared['spaces__row-meta']}>
                        {reid.name} · Oct 29
                      </span>
                    </div>
                  </li>
                ) : null}
                {LOG.map((l) => (
                  <li key={l.title} className={shared['spaces__row']}>
                    <div className={shared['spaces__row-main']}>
                      <span className={shared['spaces__row-title']}>
                        {l.title}
                      </span>
                      <span className={shared['spaces__row-meta']}>
                        {PEOPLE[l.by]!.name} · {l.when}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>
      </div>
    </Scrollbar>
  );
}
