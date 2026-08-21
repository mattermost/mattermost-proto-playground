import DotsVerticalIcon from '@mattermost/compass-icons/components/dots-vertical';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import FolderOutlineIcon from '@mattermost/compass-icons/components/folder-outline';
import PencilOutlineIcon from '@mattermost/compass-icons/components/pencil-outline';
import TrashCanOutlineIcon from '@mattermost/compass-icons/components/trash-can-outline';
import {
  Button,
  EmptyState,
  Icon,
  IconButton,
  MenuItem,
  Modal,
  PopoverMenu,
  SearchInput,
  Select,
  Tag,
  TextInput,
  UserAvatar,
  useOutsideClose,
} from '@mattermost/compass-ui';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
} from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import type {
  Automation,
  AutomationFolder,
  FolderAdmin,
  FolderScope,
  RunStatus,
} from '../../data/types';
import {
  FOLDER_ADMIN_DIRECTORY,
  useAutomations,
} from '../../context/AutomationsContext';
import FolderOpenOutlineIcon from '../icons/FolderOpenOutlineIcon';
import dashboardStyles from '../RunsDashboard/RunsDashboard.module.scss';
import VariableSecretsManager from '../variables/VariableSecretsManager';
import styles from './FoldersPage.module.scss';

const BASE = '/prototypes/automations';

function formatWhen(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleString(undefined, {
    month: 'numeric',
    day: 'numeric',
    year: '2-digit',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function scopeLabel(scope: FolderScope) {
  return scope === 'global' ? 'Global' : 'Team';
}

type FolderWorkflowRow = {
  id: string;
  name: string;
  enabled: boolean;
  lastRunAt: string | null;
  lastRunStatus: RunStatus | null;
  runs: number;
};

function CreateFolderForm({
  onCreated,
  onCancel,
}: {
  onCreated: (id: string) => void;
  onCancel: () => void;
}) {
  const { createFolder } = useAutomations();
  const [name, setName] = useState('');
  const [scope, setScope] = useState<FolderScope>('team');

  const submit = () => {
    if (!name.trim()) return;
    const id = createFolder({ name, scope });
    onCreated(id);
  };

  return (
    <div className={styles.folders__create}>
      <p className={styles.folders__createTitle}>New folder</p>
      <TextInput
        label="Name"
        placeholder="Folder name"
        value={name}
        autoFocus
        onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') submit();
        }}
      />
      <Select
        label="Scope"
        value={scope}
        onChange={(e: ChangeEvent<HTMLSelectElement>) =>
          setScope(e.target.value as FolderScope)
        }
      >
        <option value="team">Team</option>
        <option value="global">Global (all teams)</option>
      </Select>
      <div className={styles.folders__createActions}>
        <Button emphasis="Tertiary" size="Small" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          emphasis="Primary"
          size="Small"
          disabled={!name.trim()}
          onClick={submit}
        >
          Create
        </Button>
      </div>
    </div>
  );
}

function WorkflowsTable({
  rows,
  onOpen,
}: {
  rows: FolderWorkflowRow[];
  onOpen: (id: string) => void;
}) {
  if (rows.length === 0) {
    return (
      <p className={styles.folders__muted}>
        This folder has no automations yet. Assign a folder in the editor, or
        create a new automation from Home.
      </p>
    );
  }

  return (
    <div className={styles.folders__tableWrap}>
      <table className={styles.folders__table}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Status</th>
            <th>Last run</th>
            <th className={styles.folders__num}>Runs</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((w) => (
            <tr key={w.id} onClick={() => onOpen(w.id)}>
              <td>
                <div className={styles.folders__workflowName}>
                  {w.name || 'Untitled automation'}
                </div>
              </td>
              <td>
                <span
                  className={[
                    styles.folders__wfStatus,
                    w.enabled ? styles['folders__wfStatus--on'] : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  <span className={styles.folders__wfDot} aria-hidden />
                  {w.enabled ? 'Enabled' : 'Disabled'}
                </span>
              </td>
              <td>
                {w.lastRunAt ? (
                  <span
                    className={styles.folders__runStat}
                    title={
                      w.lastRunStatus
                        ? `Last run ${w.lastRunStatus}`
                        : undefined
                    }
                  >
                    <span
                      className={[
                        styles.folders__runDot,
                        w.lastRunStatus
                          ? styles[`folders__runDot--${w.lastRunStatus}`]
                          : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      aria-hidden
                    />
                    {formatWhen(w.lastRunAt)}
                  </span>
                ) : (
                  <span className={styles.folders__mutedInline}>Never run</span>
                )}
              </td>
              <td className={styles.folders__num}>{w.runs}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FolderDetail({
  folder,
  workflows,
  onDeleted,
}: {
  folder: AutomationFolder;
  workflows: FolderWorkflowRow[];
  onDeleted: () => void;
}) {
  const navigate = useNavigate();
  const {
    renameFolder,
    deleteFolder,
    addFolderAdmin,
    removeFolderAdmin,
    addFolderVariable,
    removeFolderVariable,
    showToast,
    recordRecent,
  } = useAutomations();

  const [renaming, setRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(folder.name);
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [adminQuery, setAdminQuery] = useState('');
  const [actionsOpen, setActionsOpen] = useState(false);
  const actionsRef = useRef<HTMLDivElement>(null);
  const closeActions = useCallback(() => setActionsOpen(false), []);
  useOutsideClose(actionsRef, actionsOpen, closeActions);

  useEffect(() => {
    setRenaming(false);
    setRenameValue(folder.name);
    setAdminModalOpen(false);
    setAdminQuery('');
    setActionsOpen(false);
  }, [folder.id, folder.name]);

  const enabledCount = workflows.filter((w) => w.enabled).length;
  const runsTotal = workflows.reduce((sum, w) => sum + w.runs, 0);

  // Prototype fixture: derive success/fail from last-run status mix.
  const failedRuns = workflows.filter((w) => w.lastRunStatus === 'failed').length;
  const succeededRuns = Math.max(runsTotal - failedRuns, 0);
  const successRate =
    runsTotal > 0 ? Math.round((succeededRuns / runsTotal) * 100) : null;

  const adminCandidates = useMemo(() => {
    const existing = new Set(
      folder.admins.map((a) => a.username.toLowerCase()),
    );
    const q = adminQuery.trim().toLowerCase().replace(/^@/, '');
    return FOLDER_ADMIN_DIRECTORY.filter((user) => {
      if (existing.has(user.username.toLowerCase())) return false;
      if (!q) return true;
      return (
        user.username.toLowerCase().includes(q) ||
        user.displayName.toLowerCase().includes(q)
      );
    });
  }, [adminQuery, folder.admins]);

  const saveRename = () => {
    const next = renameValue.trim();
    if (!next || next === folder.name) {
      setRenaming(false);
      setRenameValue(folder.name);
      return;
    }
    renameFolder(folder.id, next);
    setRenaming(false);
    showToast('Folder renamed', 'Success');
  };

  const onDelete = () => {
    // eslint-disable-next-line no-alert
    if (
      !window.confirm(
        `Delete the folder "${folder.name}"? Its automations are kept but moved out of the folder.`,
      )
    ) {
      return;
    }
    deleteFolder(folder.id);
    showToast('Folder deleted', 'Info');
    onDeleted();
  };

  const closeAdminModal = () => {
    setAdminModalOpen(false);
    setAdminQuery('');
  };

  const onAddAdminUser = (user: FolderAdmin) => {
    const ok = addFolderAdmin(folder.id, user.username);
    if (!ok) {
      showToast('Could not add admin', 'Danger');
      return;
    }
    showToast(`Added @${user.username}`, 'Success');
  };
  return (
    <div className={styles.folders__detail}>
      <header className={styles.folders__detailHead}>
        <div className={styles.folders__detailTitle}>
          <div
            className={[
              styles.folders__nameRow,
              renaming ? styles['folders__nameRow--editing'] : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {renaming ? (
              <input
                className={[
                  styles.folders__detailName,
                  styles.folders__renameInput,
                ].join(' ')}
                value={renameValue}
                aria-label="Folder name"
                autoFocus
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setRenameValue(e.target.value)
                }
                onKeyDown={(e) => {
                  if (e.key === 'Enter') saveRename();
                  if (e.key === 'Escape') {
                    setRenaming(false);
                    setRenameValue(folder.name);
                  }
                }}
              />
            ) : (
              <h2
                className={styles.folders__detailName}
                onClick={() => {
                  setRenameValue(folder.name);
                  setRenaming(true);
                }}
              >
                {folder.name}
              </h2>
            )}
            {renaming ? (
              <div className={styles.folders__renameActions}>
                <Button
                  emphasis="Tertiary"
                  size="X-Small"
                  onClick={saveRename}
                >
                  Save
                </Button>
                <Button
                  emphasis="Quaternary"
                  size="X-Small"
                  onClick={() => {
                    setRenaming(false);
                    setRenameValue(folder.name);
                  }}
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <IconButton
                className={styles.folders__renameBtn}
                aria-label="Rename folder"
                size="X-Small"
                padding="Compact"
                icon={<Icon size="12" glyph={<PencilOutlineIcon />} />}
                onClick={() => {
                  setRenameValue(folder.name);
                  setRenaming(true);
                }}
              />
            )}
          </div>
          <div className={styles.folders__detailMeta}>
            <Tag
              label={scopeLabel(folder.scope)}
              size="X-Small"
              type="Default"
            />
            <p className={styles.folders__detailSub}>
              Created {formatWhen(folder.createdAt) ?? '—'}
            </p>
          </div>
        </div>
        <div className={styles.folders__detailActions} ref={actionsRef}>
          <IconButton
            aria-label={`Actions for ${folder.name}`}
            aria-expanded={actionsOpen}
            aria-haspopup="menu"
            size="Small"
            icon={<Icon size="16" glyph={<DotsVerticalIcon />} />}
            onClick={() => setActionsOpen((open) => !open)}
          />
          {actionsOpen ? (
            <div className={styles.folders__detailMenu}>
              <PopoverMenu>
                <MenuItem
                  label="Rename folder"
                  leadingVisual={
                    <Icon size="16" glyph={<PencilOutlineIcon />} />
                  }
                  onClick={() => {
                    setActionsOpen(false);
                    setRenameValue(folder.name);
                    setRenaming(true);
                  }}
                />
                <MenuItem
                  label="Delete folder"
                  destructive
                  leadingVisual={
                    <Icon size="16" glyph={<TrashCanOutlineIcon />} />
                  }
                  onClick={() => {
                    setActionsOpen(false);
                    onDelete();
                  }}
                />
              </PopoverMenu>
            </div>
          ) : null}
        </div>
      </header>

      <div className={dashboardStyles['runs-dashboard']}>
        <div className={dashboardStyles['runs-dashboard__metric']}>
          <p className={dashboardStyles['runs-dashboard__label']}>Workflows</p>
          <p className={dashboardStyles['runs-dashboard__value']}>
            {workflows.length}
            <span className={dashboardStyles['runs-dashboard__pct']}>
              {enabledCount === workflows.length
                ? 'enabled'
                : `${enabledCount} enabled`}
            </span>
          </p>
        </div>
        <div className={dashboardStyles['runs-dashboard__metric']}>
          <p className={dashboardStyles['runs-dashboard__label']}>Runs · 30d</p>
          <p className={dashboardStyles['runs-dashboard__value']}>
            {runsTotal}
            <span className={dashboardStyles['runs-dashboard__pct']}>
              {runsTotal === 0
                ? 'No runs yet'
                : succeededRuns === runsTotal
                  ? 'succeeded'
                  : `${succeededRuns} succeeded`}
            </span>
          </p>
        </div>
        <div className={dashboardStyles['runs-dashboard__metric']}>
          <p className={dashboardStyles['runs-dashboard__label']}>Success rate</p>
          <p className={dashboardStyles['runs-dashboard__value']}>
            {successRate === null ? '—' : `${successRate}%`}
          </p>
        </div>
        <div className={dashboardStyles['runs-dashboard__metric']}>
          <p className={dashboardStyles['runs-dashboard__label']}>Failed · 30d</p>
          <p className={dashboardStyles['runs-dashboard__value']}>
            {failedRuns}
            {runsTotal > 0 ? (
              <span className={dashboardStyles['runs-dashboard__pct']}>
                {`${((failedRuns / runsTotal) * 100).toFixed(1)}%`}
              </span>
            ) : null}
          </p>
        </div>
      </div>

      <section className={styles.folders__section}>
        <h3 className={styles.folders__sectionTitle}>Automations</h3>
        <WorkflowsTable
          rows={workflows}
          onOpen={(id) => {
            recordRecent(id);
            navigate(`${BASE}/${id}/editor`);
          }}
        />
      </section>

      <section className={styles.folders__section}>
        <div className={styles.folders__sectionHead}>
          <div className={styles.folders__sectionIntro}>
            <h3 className={styles.folders__sectionTitle}>Delegated admins</h3>
            <p className={styles.folders__muted}>
              Give admin rights to other users to manage this folder's
              automations, variables and secrets.
            </p>
          </div>
          <Button
            className={styles.folders__sectionAction}
            emphasis="Tertiary"
            size="Small"
            leadingIcon={<Icon size="16" glyph={<PlusIcon />} />}
            onClick={() => setAdminModalOpen(true)}
          >
            Add admin
          </Button>
        </div>
        {folder.admins.length > 0 ? (
          <ul className={styles.folders__admins}>
            {folder.admins.map((admin) => (
              <li key={admin.userId} className={styles.folders__admin}>
                <UserAvatar
                  size="24"
                  alt={admin.displayName}
                  name={admin.displayName}
                  src={admin.avatarSrc}
                />
                <span className={styles.folders__adminName}>
                  @{admin.username}
                </span>
                <IconButton
                  className={styles.folders__adminRemove}
                  aria-label={`Remove @${admin.username}`}
                  size="Small"
                  destructive
                  icon={<Icon size="16" glyph={<TrashCanOutlineIcon />} />}
                  onClick={() => {
                    removeFolderAdmin(folder.id, admin.userId);
                    showToast('Admin removed', 'Info');
                  }}
                />
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.folders__muted}>
            No delegated admins yet. Team and system admins can still manage this
            folder.
          </p>
        )}
      </section>

      {adminModalOpen ? (
        <div
          className={styles.folders__overlay}
          role="presentation"
          onClick={closeAdminModal}
        >
          <div
            className={styles.folders__dialog}
            role="presentation"
            onClick={(e) => e.stopPropagation()}
          >
            <Modal
              size="Small"
              title="Add delegated admin"
              subtitle="Find people on your team to manage this folder."
              onClose={closeAdminModal}
              footer={
                <Button emphasis="Tertiary" onClick={closeAdminModal}>
                  Done
                </Button>
              }
            >
              <div className={styles.folders__adminPicker}>
                <SearchInput
                  size="Small"
                  placeholder="Search by name or username…"
                  value={adminQuery}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setAdminQuery(e.target.value)
                  }
                  onClear={() => setAdminQuery('')}
                />
                {adminCandidates.length > 0 ? (
                  <ul className={styles.folders__adminResults}>
                    {adminCandidates.map((user) => (
                      <li key={user.userId}>
                        <button
                          type="button"
                          className={styles.folders__adminResult}
                          onClick={() => onAddAdminUser(user)}
                        >
                          <UserAvatar
                            size="32"
                            alt={user.displayName}
                            name={user.displayName}
                            src={user.avatarSrc}
                          />
                          <span className={styles.folders__adminResultText}>
                            <span className={styles.folders__adminResultName}>
                              {user.displayName}
                            </span>
                            <span className={styles.folders__adminResultHandle}>
                              @{user.username}
                            </span>
                          </span>
                          <span className={styles.folders__adminResultAdd}>
                            Add
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className={styles.folders__muted}>
                    {adminQuery.trim()
                      ? 'No matching people found.'
                      : 'Everyone in the directory is already an admin.'}
                  </p>
                )}
              </div>
            </Modal>
          </div>
        </div>
      ) : null}

      <section className={styles.folders__section}>
        <VariableSecretsManager
          items={folder.variables}
          onAdd={(input) => addFolderVariable(folder.id, input)}
          onRemove={(name) => removeFolderVariable(folder.id, name)}
          heading="Variables & secrets"
          description="Scoped to this folder — every automation inside can reference these values. Secrets stay encrypted and are never shown again after save."
          addLabel="Add"
        />
      </section>
    </div>
  );
}

function buildWorkflowRows(
  automations: Automation[],
  runs: { automationId: string }[],
  folderId: string,
): FolderWorkflowRow[] {
  return automations
    .filter((a) => a.folderId === folderId)
    .map((a) => ({
      id: a.id,
      name: a.name,
      enabled: a.status === 'enabled',
      lastRunAt: a.lastRunAt,
      lastRunStatus: a.lastRunStatus,
      runs: runs.filter((r) => r.automationId === a.id).length,
    }));
}

export default function FoldersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    automations: allAutomations,
    folders,
    runs,
    demoEmpty,
  } = useAutomations();
  const automations = demoEmpty ? [] : allAutomations;

  const initialId = searchParams.get('id');
  const [selectedId, setSelectedId] = useState<string | null>(
    () => initialId && folders.some((f) => f.id === initialId)
      ? initialId
      : folders[0]?.id ?? null,
  );
  const [creating, setCreating] = useState(
    () => searchParams.get('create') === '1',
  );

  useEffect(() => {
    if (searchParams.get('create') !== '1') return;
    setCreating(true);
    const next = new URLSearchParams(searchParams);
    next.delete('create');
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    if (selectedId && folders.some((f) => f.id === selectedId)) return;
    setSelectedId(folders[0]?.id ?? null);
  }, [folders, selectedId]);

  const selected = folders.find((f) => f.id === selectedId) ?? null;

  const workflowRows = useMemo(
    () =>
      selected
        ? buildWorkflowRows(automations, runs, selected.id)
        : [],
    [automations, runs, selected],
  );

  const selectFolder = (id: string) => {
    setCreating(false);
    setSelectedId(id);
    setSearchParams({ id }, { replace: true });
  };

  return (
    <div className={styles.folders}>
      <div className={styles.folders__scroll}>
        <div className={styles.folders__pagehead}>
          <h1 className={styles.folders__title}>Folders</h1>
          <p className={styles.folders__subtitle}>
            Automation folders group automations together, and share admin
            permissions, variables and secrets.
          </p>
        </div>

        <div className={styles.folders__layout}>
          <aside className={styles.folders__rail}>
            <div className={styles.folders__railHead}>
              <span className={styles.folders__railTitle}>Your folders</span>
              <IconButton
                className={styles.folders__railAdd}
                aria-label="New folder"
                size="X-Small"
                padding="Compact"
                icon={<Icon size="12" glyph={<PlusIcon />} />}
                onClick={() => setCreating(true)}
              />
            </div>
            {folders.length === 0 && !creating ? (
              <p className={styles.folders__muted}>No folders yet.</p>
            ) : null}
              <ul className={styles.folders__railList}>
                {folders.map((folder) => {
                  const active = folder.id === selectedId;
                  return (
                    <li key={folder.id}>
                      <MenuItem
                        className={styles.folders__railItem}
                        label={folder.name}
                        active={active}
                        leadingVisual={
                          <Icon
                            size="16"
                            glyph={
                              active ? (
                                <FolderOpenOutlineIcon />
                              ) : (
                                <FolderOutlineIcon />
                              )
                            }
                          />
                        }
                        onClick={() => selectFolder(folder.id)}
                      />
                    </li>
                  );
                })}
              </ul>
            {creating ? (
              <CreateFolderForm
                onCreated={(id) => {
                  setCreating(false);
                  selectFolder(id);
                }}
                onCancel={() => setCreating(false)}
              />
            ) : null}
          </aside>

          <div className={styles.folders__main}>
            {selected ? (
              <FolderDetail
                key={selected.id}
                folder={selected}
                workflows={workflowRows}
                onDeleted={() => {
                  const next = folders.find((f) => f.id !== selected.id);
                  if (next) selectFolder(next.id);
                  else {
                    setSelectedId(null);
                    setSearchParams({}, { replace: true });
                  }
                }}
              />
            ) : (
              <EmptyState
                title="No folder selected"
                description="Create a folder to group automations, delegate management to non-admins, and store variables and secrets that every automation inside can use."
                action={{
                  children: 'New folder',
                  onClick: () => setCreating(true),
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
