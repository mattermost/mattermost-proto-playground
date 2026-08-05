import ContentCopyIcon from '@mattermost/compass-icons/components/content-copy';
import PencilOutlineIcon from '@mattermost/compass-icons/components/pencil-outline';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import TrashCanOutlineIcon from '@mattermost/compass-icons/components/trash-can-outline';
import {
  Button,
  EmptyState,
  Icon,
  IconButton,
  Modal,
  Radio,
  SearchInput,
  Tabs,
  Tag,
  TextInput,
  type ButtonEmphasis,
} from '@mattermost/compass-ui';
import { useEffect, useId, useMemo, useState, type ChangeEvent } from 'react';
import type { FolderVariable } from '../../data/types';
import { useAutomations } from '../../context/AutomationsContext';
import styles from './VariableSecretsManager.module.scss';

export type VariableFilter = 'all' | 'var' | 'secret';

type VariableSecretsManagerProps = {
  items: FolderVariable[];
  onAdd: (input: {
    kind: FolderVariable['kind'];
    name: string;
    value: string;
  }) => boolean;
  onRemove: (name: string) => void;
  /** Optional heading above the toolbar. Omit when the page already has a title. */
  heading?: string;
  description?: string;
  addLabel?: string;
  /** Toolbar Add button emphasis. Defaults to Tertiary (e.g. folder detail). */
  addEmphasis?: ButtonEmphasis;
  /** Opens the add modal once on mount (e.g. deep-link from Home). */
  defaultAddOpen?: boolean;
};

function templateRef(item: Pick<FolderVariable, 'kind' | 'name'>) {
  return item.kind === 'secret'
    ? `{{.Secrets.${item.name}}}`
    : `{{.Vars.${item.name}}}`;
}

function normalizeName(raw: string) {
  return raw
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9_]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function formatUpdated(iso?: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString(undefined, {
    month: 'numeric',
    day: 'numeric',
    year: '2-digit',
  });
}

type ComposeModalProps = {
  open: boolean;
  initialKind?: FolderVariable['kind'];
  /** When set, modal updates an existing entry (same name). */
  editing?: FolderVariable | null;
  onClose: () => void;
  onSubmit: (input: {
    kind: FolderVariable['kind'];
    name: string;
    value: string;
  }) => boolean;
};

function ComposeModal({
  open,
  initialKind = 'secret',
  editing = null,
  onClose,
  onSubmit,
}: ComposeModalProps) {
  const { showToast } = useAutomations();
  const kindGroup = useId();
  const [kind, setKind] = useState<FolderVariable['kind']>(
    editing?.kind ?? initialKind,
  );
  const [name, setName] = useState(editing?.name ?? '');
  const [value, setValue] = useState(
    editing?.kind === 'var' ? (editing.value ?? '') : '',
  );

  if (!open) return null;

  const previewName = normalizeName(name) || 'NAME';
  const preview = templateRef({ kind, name: previewName });
  const isEdit = Boolean(editing);
  const canSubmit =
    Boolean(normalizeName(name)) &&
    (kind === 'var' ? Boolean(value.trim()) || isEdit : Boolean(value.trim()));

  const submit = () => {
    const nextValue =
      kind === 'var' && !value.trim() && editing?.value
        ? editing.value
        : value;
    const ok = onSubmit({ kind, name, value: nextValue });
    if (!ok) {
      showToast(
        kind === 'secret'
          ? 'Name and value are required for secrets'
          : 'Name is required',
        'Danger',
      );
      return;
    }
    showToast(
      isEdit
        ? kind === 'secret'
          ? 'Secret updated'
          : 'Variable updated'
        : kind === 'secret'
          ? 'Secret added'
          : 'Variable added',
      'Success',
    );
    onClose();
  };

  return (
    <div className={styles.manager__overlay} role="presentation" onClick={onClose}>
      <div
        className={styles.manager__dialog}
        role="presentation"
        onClick={(e) => e.stopPropagation()}
      >
        <Modal
          size="Small"
          title={
            isEdit
              ? kind === 'secret'
                ? 'Update secret'
                : 'Edit variable'
              : 'Add variable or secret'
          }
          subtitle={
            kind === 'secret'
              ? 'Secret values are encrypted and never shown again after you save.'
              : 'Variables are readable in workflows as template tokens.'
          }
          onClose={onClose}
          footer={
            <>
              <Button emphasis="Tertiary" onClick={onClose}>
                Cancel
              </Button>
              <Button
                emphasis="Primary"
                disabled={!canSubmit}
                onClick={submit}
              >
                {isEdit
                  ? kind === 'secret'
                    ? 'Update secret'
                    : 'Save variable'
                  : kind === 'secret'
                    ? 'Add secret'
                    : 'Add variable'}
              </Button>
            </>
          }
        >
          <div className={styles.manager__form}>
            {!isEdit ? (
              <fieldset className={styles.manager__kind}>
                <legend className={styles.manager__legend}>Type</legend>
                <div className={styles.manager__radioRow}>
                  <Radio
                    name={kindGroup}
                    value="secret"
                    checked={kind === 'secret'}
                    onChange={() => setKind('secret')}
                  >
                    Secret
                  </Radio>
                  <Radio
                    name={kindGroup}
                    value="var"
                    checked={kind === 'var'}
                    onChange={() => setKind('var')}
                  >
                    Variable
                  </Radio>
                </div>
              </fieldset>
            ) : null}
            <TextInput
              label="Name"
              placeholder="MY_TOKEN"
              value={name}
              disabled={isEdit}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setName(e.target.value)
              }
            />
            <TextInput
              label={kind === 'secret' ? 'Value' : 'Value'}
              type={kind === 'secret' ? 'password' : 'text'}
              placeholder={
                kind === 'secret'
                  ? isEdit
                    ? 'Enter a new value to rotate'
                    : 'Paste secret value'
                  : 'Readable value'
              }
              value={value}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setValue(e.target.value)
              }
              onKeyDown={(e) => {
                if (e.key === 'Enter') submit();
              }}
            />
            <div className={styles.manager__preview}>
              <span className={styles.manager__previewLabel}>
                Reference in workflows
              </span>
              <code className={styles.manager__previewCode}>{preview}</code>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}

export default function VariableSecretsManager({
  items,
  onAdd,
  onRemove,
  heading,
  description,
  addLabel = 'Add',
  addEmphasis = 'Tertiary',
  defaultAddOpen = false,
}: VariableSecretsManagerProps) {
  const { showToast } = useAutomations();
  const [filter, setFilter] = useState<VariableFilter>('all');
  const [query, setQuery] = useState('');
  const [composeOpen, setComposeOpen] = useState(defaultAddOpen);
  const [composeKind, setComposeKind] =
    useState<FolderVariable['kind']>('secret');
  const [editing, setEditing] = useState<FolderVariable | null>(null);

  useEffect(() => {
    if (defaultAddOpen) setComposeOpen(true);
  }, [defaultAddOpen]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items
      .filter((item) => (filter === 'all' ? true : item.kind === filter))
      .filter((item) => {
        if (!q) return true;
        return (
          item.name.toLowerCase().includes(q) ||
          (item.value ?? '').toLowerCase().includes(q) ||
          templateRef(item).toLowerCase().includes(q)
        );
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [items, filter, query]);

  const openAdd = (kind: FolderVariable['kind'] = 'secret') => {
    setEditing(null);
    setComposeKind(kind);
    setComposeOpen(true);
  };

  const openEdit = (item: FolderVariable) => {
    setEditing(item);
    setComposeKind(item.kind);
    setComposeOpen(true);
  };

  const copyRef = async (item: FolderVariable) => {
    const ref = templateRef(item);
    try {
      await navigator.clipboard.writeText(ref);
      showToast('Copied reference', 'Success');
    } catch {
      showToast('Could not copy', 'Danger');
    }
  };

  return (
    <div className={styles.manager}>
      {heading || description ? (
        <div className={styles.manager__intro}>
          {heading ? <h3 className={styles.manager__heading}>{heading}</h3> : null}
          {description ? (
            <p className={styles.manager__description}>{description}</p>
          ) : null}
        </div>
      ) : null}

      <div className={styles.manager__toolbar}>
        <Tabs
          className={styles.manager__tabs}
          activeKey={filter}
          onChange={(key) => setFilter(key as VariableFilter)}
          tabs={[
            { key: 'all', label: 'All' },
            { key: 'var', label: 'Variables' },
            { key: 'secret', label: 'Secrets' },
          ]}
        />
        <div className={styles.manager__toolbarEnd}>
          <SearchInput
            className={styles.manager__search}
            size="Small"
            placeholder="Search by name…"
            value={query}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setQuery(e.target.value)
            }
            onClear={() => setQuery('')}
          />
          <Button
            emphasis={addEmphasis}
            size="Small"
            leadingIcon={<PlusIcon size={16} />}
            onClick={() =>
              openAdd(filter === 'var' ? 'var' : 'secret')
            }
          >
            {addLabel}
          </Button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          className={styles.manager__empty}
          title={
            query
              ? 'No matches'
              : filter === 'secret'
                ? 'No secrets yet'
                : filter === 'var'
                  ? 'No variables yet'
                  : 'Nothing here yet'
          }
          description={
            query
              ? 'Try a different search, or clear the filter.'
              : 'Add a variable for readable config, or a secret for credentials that should stay encrypted.'
          }
          action={
            query
              ? undefined
              : {
                  children: addLabel,
                  onClick: () => openAdd(filter === 'var' ? 'var' : 'secret'),
                }
          }
        />
      ) : (
        <div className={styles.manager__tableWrap}>
          <table className={styles.manager__table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Reference</th>
                <th>Value</th>
                <th>Updated</th>
                <th>
                  <span className={styles.manager__srOnly}>Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={`${item.kind}:${item.name}`}>
                  <td>
                    <span className={styles.manager__name}>{item.name}</span>
                  </td>
                  <td>
                    <Tag
                      label={item.kind === 'secret' ? 'Secret' : 'Variable'}
                      size="X-Small"
                      type={item.kind === 'secret' ? 'Danger' : 'Info'}
                    />
                  </td>
                  <td>
                    <div className={styles.manager__refCell}>
                      <code className={styles.manager__ref}>
                        {templateRef(item)}
                      </code>
                      <IconButton
                        className={styles.manager__refCopy}
                        aria-label={`Copy reference for ${item.name}`}
                        title="Copy reference"
                        size="X-Small"
                        padding="Compact"
                        icon={
                          <Icon size="12" glyph={<ContentCopyIcon />} />
                        }
                        onClick={() => copyRef(item)}
                      />
                    </div>
                  </td>
                  <td>
                    {item.kind === 'secret' ? (
                      <span className={styles.manager__secretValue}>
                        Encrypted
                      </span>
                    ) : (
                      <span className={styles.manager__value}>
                        {item.value || '—'}
                      </span>
                    )}
                  </td>
                  <td className={styles.manager__muted}>
                    {formatUpdated(item.updatedAt)}
                  </td>
                  <td>
                    <div className={styles.manager__rowActions}>
                      <IconButton
                        aria-label={
                          item.kind === 'secret'
                            ? `Update ${item.name}`
                            : `Edit ${item.name}`
                        }
                        title={
                          item.kind === 'secret'
                            ? 'Update value'
                            : 'Edit variable'
                        }
                        size="Small"
                        icon={
                          <Icon size="16" glyph={<PencilOutlineIcon />} />
                        }
                        onClick={() => openEdit(item)}
                      />
                      <IconButton
                        aria-label={`Delete ${item.name}`}
                        title="Delete"
                        size="Small"
                        destructive
                        icon={
                          <Icon size="16" glyph={<TrashCanOutlineIcon />} />
                        }
                        onClick={() => {
                          // eslint-disable-next-line no-alert
                          if (
                            !window.confirm(
                              `Delete ${item.kind === 'secret' ? 'secret' : 'variable'} “${item.name}”? Workflows that reference it will break until updated.`,
                            )
                          ) {
                            return;
                          }
                          onRemove(item.name);
                          showToast('Deleted', 'Info');
                        }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ComposeModal
        key={
          composeOpen
            ? `${editing?.name ?? 'new'}-${composeKind}`
            : 'closed'
        }
        open={composeOpen}
        initialKind={composeKind}
        editing={editing}
        onClose={() => {
          setComposeOpen(false);
          setEditing(null);
        }}
        onSubmit={onAdd}
      />
    </div>
  );
}
