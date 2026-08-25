import type { ComponentType, SVGProps } from 'react';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import PencilOutlineIcon from '@mattermost/compass-icons/components/pencil-outline';
import TrashCanOutlineIcon from '@mattermost/compass-icons/components/trash-can-outline';
import FormatLetterCaseIcon from '@mattermost/compass-icons/components/format-letter-case';
import CogOutlineIcon from '@mattermost/compass-icons/components/cog-outline';
import Chip from '@/components/ui/Chip/Chip';
import Icon from '@/components/ui/Icon/Icon';
import LabelTag from '@/components/ui/LabelTag/LabelTag';
import type { TagType } from '@/components/ui/LabelTag/LabelTag';
import styles from './AttributeDeletionRenameDecisions.module.scss';

type Decision = 'Allowed' | 'Blocked' | 'Conditional';
type ActionKind = 'Delete' | 'Rename' | 'Change type' | 'Add' | 'Update settings';

interface DecisionRow {
  action: ActionKind;
  decision: Decision;
  rule: string;
  notes?: string;
}

interface DecisionCategory {
  id: string;
  title: string;
  description: string;
  rows: DecisionRow[];
}

type Glyph = ComponentType<SVGProps<SVGSVGElement>>;

const ACTION_ICON: Record<ActionKind, Glyph> = {
  Delete: TrashCanOutlineIcon,
  Rename: FormatLetterCaseIcon,
  'Change type': CogOutlineIcon,
  Add: PlusIcon,
  'Update settings': PencilOutlineIcon,
};

const DECISION_TAG: Record<Decision, TagType> = {
  Allowed: 'Success',
  Blocked: 'Danger',
  Conditional: 'Warning',
};

const CATEGORIES: DecisionCategory[] = [
  {
    id: 'global-attributes',
    title: 'Global attributes',
    description:
      'Rules for the attribute itself — delete, rename, and changing type.',
    rows: [
      {
        action: 'Delete',
        decision: 'Conditional',
        rule: 'Cannot be deleted if used anywhere.',
        notes: 'Unused attributes can be deleted.',
      },
      {
        action: 'Rename',
        decision: 'Allowed',
        rule: 'Can be renamed whether used or unused.',
      },
      {
        action: 'Change type',
        decision: 'Conditional',
        rule: 'Type cannot be changed if the attribute is used anywhere.',
        notes: 'Same gate as attribute deletion. Unused attributes can change type.',
      },
    ],
  },
  {
    id: 'global-attribute-individual-values',
    title: 'Global attribute individual values',
    description:
      'Rules for Select and Multiselect option values. Classification values are controlled separately.',
    rows: [
      {
        action: 'Add',
        decision: 'Allowed',
        rule: 'Values can be added.',
      },
      {
        action: 'Rename',
        decision: 'Allowed',
        rule: 'Values can be renamed.',
      },
      {
        action: 'Delete',
        decision: 'Conditional',
        rule: 'Cannot be deleted if the value is being used.',
        notes: 'Same logic as attribute deletion. Unused values can be deleted.',
      },
    ],
  },
  {
    id: 'resource-level-attribute',
    title: 'Resource-level attribute',
    description: 'Rules for attributes scoped to a single resource binding.',
    rows: [
      {
        action: 'Delete',
        decision: 'Conditional',
        rule: 'Cannot be deleted if it is being used.',
        notes: 'Unused resource-level attributes can be deleted.',
      },
      {
        action: 'Update settings',
        decision: 'Allowed',
        rule: 'All other settings can be updated even if it is being used.',
      },
    ],
  },
];

/**
 * Decision table for Attribute Management delete / rename rules.
 */
export default function AttributeDeletionRenameDecisions() {
  return (
    <div className={styles['page']}>
      <header className={styles['page__head']}>
        <p className={styles['page__eyebrow']}>Attribute Management</p>
        <h1 className={styles['page__title']}>Deletion & rename decisions</h1>
        <p className={styles['page__intro']}>
          Confirmed rules for deleting and renaming global attributes, changing
          attribute type, managing individual values, and deleting resource-level
          attributes.
        </p>
      </header>

      <div className={styles['categories']}>
        {CATEGORIES.map((category) => (
          <section key={category.id} className={styles['category']}>
            <div className={styles['category__head']}>
              <h2 className={styles['category__title']}>{category.title}</h2>
              <p className={styles['category__description']}>
                {category.description}
              </p>
            </div>

            <div className={styles['table-wrap']}>
              <table className={styles['table']}>
                <thead>
                  <tr>
                    <th scope="col">Action</th>
                    <th scope="col">Decision</th>
                    <th scope="col">Rule</th>
                    <th scope="col">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {category.rows.map((row) => {
                    const ActionIcon = ACTION_ICON[row.action];
                    return (
                      <tr key={`${category.id}-${row.action}`}>
                        <td>
                          <Chip
                            size="Small"
                            leadingIcon={<Icon size="12" glyph={<ActionIcon />} />}
                          >
                            {row.action}
                          </Chip>
                        </td>
                        <td>
                          <LabelTag
                            label={row.decision}
                            type={DECISION_TAG[row.decision]}
                            size="Small"
                          />
                        </td>
                        <td>{row.rule}</td>
                        <td className={styles['table__notes']}>
                          {row.notes ?? '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
