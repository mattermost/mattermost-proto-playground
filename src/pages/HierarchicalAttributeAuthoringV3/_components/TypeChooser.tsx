import { useState } from 'react';
import LockOutlineIcon from '@mattermost/compass-icons/components/lock-outline';
import Button from '@/components/ui/Button/Button';
import Icon from '@/components/ui/Icon/Icon';
import Radio from '@/components/ui/Radio/Radio';
import SectionNotice from '@/components/ui/SectionNotice/SectionNotice';
import TextInput from '@/components/ui/TextInput/TextInput';
import HoverTip from './HoverTip';
import styles from './TypeChooser.module.scss';

type Answer = 'ladder' | 'groups' | 'both';

interface AnswerCopy {
  id: Answer;
  title: string;
  example: string;
  /** What the author ends up with. Named plainly, not as a type-picker label. */
  result: string;
  /** The access rule in one sentence. */
  access: string;
  /** What it cannot express. */
  limit: string;
}

const ANSWERS: AnswerCopy[] = [
  {
    id: 'ladder',
    title: 'One ordered ladder, where any two values can be compared',
    example: 'Confidential is below Secret, which is below Top Secret.',
    result: 'A Ranked attribute',
    access: 'Anyone at or above the level passes.',
    limit:
      'Every value sits on the same single line. It cannot express two values that are simply different rather than higher or lower.',
  },
  {
    id: 'groups',
    title: 'Separate groups — or values that belong to more than one group',
    example: 'Programs, org units, mission areas.',
    result: 'A Hierarchical attribute',
    access:
      'Anyone holding the value, or a value above it, passes. Values in different groups can’t be compared, so holding one grants nothing on the other.',
    limit:
      'It cannot rank two branches against each other. If everything you have is one straight line, a Ranked attribute says it more directly.',
  },
  {
    id: 'both',
    title: 'Both — levels and groups',
    example: 'A clearance level, plus the programs a person is read into.',
    result: 'Two attributes, one for each axis',
    access:
      'A policy can require both: the level check and the group check run separately, and a channel can demand one, the other, or both.',
    limit:
      'Merging the two into one Hierarchical attribute breaks in both directions at once, which is why this is split before any value exists.',
  },
];

export interface TypeChooserProps {
  onCreateHierarchical: (name: string) => void;
}

/**
 * Create-state type chooser (F5).
 *
 * `rank` (Ranked) and `graph` (Hierarchical) are mutually exclusive with NO
 * conversion in either direction, ever. A wrong pick costs a new attribute plus
 * re-assigning every user and channel plus rewriting every policy — so the
 * chooser leads with the discriminating question rather than with type names, and
 * states the irreversibility on the chooser itself instead of in a footnote.
 *
 * The third answer is the one that earns this screen: merging a classification
 * level axis and a program axis into a single Hierarchical attribute is a
 * known-bad pattern — unrelated roots collapse coverage to exact match on the
 * level axis, while a caveat hung under a tier is satisfied by anyone holding
 * that tier. Intercepting it at creation is far cheaper than unwinding it later.
 */
export default function TypeChooser({
  onCreateHierarchical,
}: TypeChooserProps) {
  const [answer, setAnswer] = useState<Answer | null>(null);
  const [name, setName] = useState('');

  return (
    <div className={styles['chooser']}>
      <SectionNotice
        type="Warning"
        icon={<Icon size="20" glyph={<LockOutlineIcon />} />}
        title="This choice can’t be changed later"
        description="Ranked and Hierarchical can’t be converted into each other — not now, not later. Changing your mind means creating a second attribute, re-assigning every user and channel, and rewriting every policy that references the first one."
      />

      <div>
        <p className={styles['chooser__question']}>
          What shape are this attribute’s values?
        </p>
        <p className={styles['chooser__lede']}>
          Answer for the values themselves. The type follows from the answer.
        </p>
      </div>

      <div
        className={styles['chooser__options']}
        role="radiogroup"
        aria-label="What shape are this attribute’s values?"
      >
        {ANSWERS.map((option) => {
          const selected = option.id === answer;
          return (
            <div
              key={option.id}
              className={[
                styles['chooser__option'],
                selected ? styles['chooser__option--selected'] : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <div className={styles['chooser__option-head']}>
                <Radio
                  name="value-shape"
                  size="Medium"
                  checked={selected}
                  onChange={() => setAnswer(option.id)}
                  aria-label={option.title}
                />
                <span className={styles['chooser__option-copy']}>
                  <span className={styles['chooser__option-title']}>
                    {option.title}
                  </span>
                  <span className={styles['chooser__option-example']}>
                    {option.example}
                  </span>
                </span>
              </div>

              {selected && (
                <div className={styles['chooser__outcome']}>
                  <span className={styles['chooser__outcome-row']}>
                    <span className={styles['chooser__outcome-key']}>
                      You get
                    </span>
                    <span>{option.result}</span>
                  </span>
                  <span className={styles['chooser__outcome-row']}>
                    <span className={styles['chooser__outcome-key']}>
                      Access
                    </span>
                    <span>{option.access}</span>
                  </span>
                  <span className={styles['chooser__outcome-row']}>
                    <span className={styles['chooser__outcome-key']}>
                      It can’t
                    </span>
                    <span>{option.limit}</span>
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {answer === 'both' && (
        <div className={styles['chooser__plan']}>
          <p className={styles['chooser__lede']}>
            Two axes need two attributes. One graph cannot hold both: if the
            levels are separate roots, nothing above compares to anything below,
            so Secret stops being able to read Confidential. And if a group is
            hung under a level, then holding that level satisfies the group —
            the group stops restricting anything.
          </p>
          <div className={styles['chooser__plan-row']}>
            <span className={styles['chooser__plan-index']}>1</span>
            <span className={styles['chooser__plan-copy']}>
              <span className={styles['chooser__plan-title']}>
                Level — a Ranked attribute
              </span>
              <span className={styles['chooser__plan-detail']}>
                One ordered ladder. Anyone at or above the level passes.
              </span>
            </span>
          </div>
          <div className={styles['chooser__plan-row']}>
            <span className={styles['chooser__plan-index']}>2</span>
            <span className={styles['chooser__plan-copy']}>
              <span className={styles['chooser__plan-title']}>
                Groups — a Hierarchical attribute
              </span>
              <span className={styles['chooser__plan-detail']}>
                Separate branches, multiple parents allowed. Anyone holding the
                value, or a value above it, passes.
              </span>
            </span>
          </div>
          <p className={styles['chooser__lede']}>
            A policy can then require both at once, and each axis stays
            independently editable.
          </p>
        </div>
      )}

      {answer === 'groups' && (
        <div className={styles['chooser__field']}>
          <span className={styles['chooser__field-label']}>Attribute name</span>
          <TextInput
            size="Medium"
            value={name}
            placeholder="e.g. Program"
            aria-label="Attribute name"
            onChange={(e) => setName(e.target.value)}
          />
        </div>
      )}

      <div className={styles['chooser__actions']}>
        {answer === 'groups' && (
          <Button
            emphasis="Primary"
            disabled={name.trim().length === 0}
            onClick={() => onCreateHierarchical(name.trim())}
          >
            Create the Hierarchical attribute
          </Button>
        )}
        {answer === 'ladder' && (
          <HoverTip
            label="Ranked setup continues on its own screen"
            hint="Ranked values are ordered on a single ladder, so they are edited in a list rather than a hierarchy."
          >
            <Button emphasis="Secondary" disabled>
              Continue in Ranked setup
            </Button>
          </HoverTip>
        )}
        {answer === 'both' && (
          <HoverTip
            label="Each attribute is created separately"
            hint="Start with the level ladder, then the groups. Neither one can be converted into the other afterwards."
          >
            <Button emphasis="Secondary" disabled>
              Set up both attributes
            </Button>
          </HoverTip>
        )}
        {answer == null && (
          <HoverTip label="Answer the question above to continue">
            <Button emphasis="Secondary" disabled>
              Create attribute
            </Button>
          </HoverTip>
        )}
      </div>
    </div>
  );
}
