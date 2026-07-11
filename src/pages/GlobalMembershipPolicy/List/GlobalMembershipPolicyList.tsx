import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import SyncIcon from '@mattermost/compass-icons/components/sync';
import DotsVerticalIcon from '@mattermost/compass-icons/components/dots-vertical';
import ChevronLeftIcon from '@mattermost/compass-icons/components/chevron-left';
import ChevronRightIcon from '@mattermost/compass-icons/components/chevron-right';
import CloseIcon from '@mattermost/compass-icons/components/close';

import ConsoleSidebar from '@/components/ui/ConsoleSidebar/ConsoleSidebar';
import ConsolePageHeader from '@/components/ui/ConsolePageHeader/ConsolePageHeader';
import Button from '@/components/ui/Button/Button';
import IconButton from '@/components/ui/IconButton/IconButton';
import Icon from '@/components/ui/Icon/Icon';
import SearchInput from '@/components/ui/SearchInput/SearchInput';
import PopoverMenu from '@/components/ui/PopoverMenu/PopoverMenu';
import MenuItem from '@/components/ui/MenuItem/MenuItem';
import { useOutsideClose } from '@/hooks/useOutsideClose';

import avatarLeonard from '@/assets/avatars/Leonard Riley.png';

import {
  MEMBERSHIP_POLICY_LIST,
  MEMBERSHIP_SYNC_JOBS,
  type MembershipPolicyListItem,
  type MembershipSyncJob,
  type SyncJobStatus,
} from '@/pages/GlobalMembershipPolicy/gmpData';
import {
  editorHref,
  GMP_ROUTES,
  GMP_SIDEBAR_CATEGORIES,
} from '@/pages/GlobalMembershipPolicy/gmpConsole';
import WalkthroughFocusProvider from '@/components/walkthrough/WalkthroughFocusProvider';

import styles from './GlobalMembershipPolicyList.module.scss';

function PolicyRowMenu({
  policy,
  onEdit,
  onDelete,
}: {
  policy: MembershipPolicyListItem;
  onEdit: (policy: MembershipPolicyListItem) => void;
  onDelete: (policyId: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useOutsideClose(ref, open, () => setOpen(false));

  return (
    <div className={styles['gmp-list__row-menu']} ref={open ? ref : undefined}>
      <IconButton
        size="Small"
        aria-label={`Actions for ${policy.name}`}
        icon={<Icon size="16" glyph={<DotsVerticalIcon />} />}
        onClick={() => setOpen((value) => !value)}
      />
      {open && (
        <div className={styles['gmp-list__row-menu-pop']}>
          <PopoverMenu>
            <MenuItem
              label="Edit"
              onClick={() => {
                onEdit(policy);
                setOpen(false);
              }}
            />
            <MenuItem
              label="Delete"
              onClick={() => {
                onDelete(policy.id);
                setOpen(false);
              }}
            />
          </PopoverMenu>
        </div>
      )}
    </div>
  );
}

function SyncStatusBadge({ status }: { status: SyncJobStatus }) {
  const statusClass =
    status === 'Success'
      ? styles['gmp-list__status--success']
      : status === 'Pending'
        ? styles['gmp-list__status--pending']
        : styles['gmp-list__status--failure'];

  return (
    <span className={[styles['gmp-list__status'], statusClass].join(' ')}>
      {status}
    </span>
  );
}

export default function GlobalMembershipPolicyList() {
  const navigate = useNavigate();
  const [active, setActive] = useState('membership-policies');
  const [search, setSearch] = useState('');
  const [policies, setPolicies] = useState(MEMBERSHIP_POLICY_LIST);
  const [syncJobs, setSyncJobs] = useState(MEMBERSHIP_SYNC_JOBS);

  const filteredPolicies = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (query === '') {
      return policies;
    }
    return policies.filter(
      (policy) =>
        policy.name.toLowerCase().includes(query) ||
        policy.appliesTo.toLowerCase().includes(query),
    );
  }, [policies, search]);

  function openEditor(policyId?: string) {
    navigate(editorHref(policyId));
  }

  function handleSidebarClick(itemId: string) {
    setActive(itemId);
    if (itemId === 'membership-policies') {
      navigate(GMP_ROUTES.list);
    }
  }

  return (
    <WalkthroughFocusProvider>
    <div className={styles['gmp-list']}>
      <div data-tour-focus="sidebar-nav">
        <ConsoleSidebar
          avatarSrc={avatarLeonard}
          avatarAlt="Leonard Riley"
          username="leonard.riley"
          categories={GMP_SIDEBAR_CATEGORIES}
          activeItemId={active}
          onItemClick={handleSidebarClick}
        />
      </div>

      <div className={styles['gmp-list__center']}>
        <ConsolePageHeader title="Membership Policies" />

        <div className={styles['gmp-list__scroll']}>
          <div className={styles['gmp-list__page']}>
            <section className={styles['gmp-list__card']}>
              <div className={styles['gmp-list__card-head']}>
                <div>
                  <h2 className={styles['gmp-list__card-title']}>
                    Membership policies
                  </h2>
                  <p className={styles['gmp-list__card-subtitle']}>
                    Create policies containing attribute based access rules and
                    the resources they apply to
                  </p>
                </div>
                <Button
                  emphasis="Primary"
                  size="Small"
                  leadingIcon={<Icon size="12" glyph={<PlusIcon />} />}
                  onClick={() => openEditor('new')}
                  data-tour-focus="add-policy"
                >
                  Add policy
                </Button>
              </div>

              <div className={styles['gmp-list__card-body']}>
                <div className={styles['gmp-list__search']}>
                  <SearchInput
                    size="Small"
                    placeholder="Search by name or channels"
                    aria-label="Search policies"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                  />
                </div>

                <div
                  className={styles['gmp-list__table']}
                  data-tour-focus="policy-table"
                >
                  <div className={styles['gmp-list__table-head']}>
                    <div
                      className={styles['gmp-list__table-head-cell']}
                      style={{ flex: 1.2 }}
                    >
                      Name
                    </div>
                    <div
                      className={styles['gmp-list__table-head-cell']}
                      style={{ flex: 1.4 }}
                    >
                      Applies to
                    </div>
                    <div
                      className={styles['gmp-list__table-head-cell']}
                      style={{ flex: 0.5 }}
                    >
                      Actions
                    </div>
                  </div>

                  {filteredPolicies.length === 0 ? (
                    <div className={styles['gmp-list__empty']}>
                      No policies match your search.
                    </div>
                  ) : (
                    filteredPolicies.map((policy) => (
                      <div key={policy.id} className={styles['gmp-list__table-row']}>
                        <div
                          className={styles['gmp-list__table-cell']}
                          style={{ flex: 1.2 }}
                        >
                          <button
                            type="button"
                            className={styles['gmp-list__policy-link']}
                            onClick={() => openEditor(policy.id)}
                          >
                            {policy.name}
                          </button>
                        </div>
                        <div
                          className={styles['gmp-list__table-cell']}
                          style={{ flex: 1.4 }}
                        >
                          {policy.appliesTo}
                        </div>
                        <div
                          className={styles['gmp-list__table-cell']}
                          style={{ flex: 0.5 }}
                        >
                          <PolicyRowMenu
                            policy={policy}
                            onEdit={(row) => openEditor(row.id)}
                            onDelete={(policyId) =>
                              setPolicies((rows) =>
                                rows.filter((row) => row.id !== policyId),
                              )
                            }
                          />
                        </div>
                      </div>
                    ))
                  )}

                  <div className={styles['gmp-list__pagination']}>
                    <span className={styles['gmp-list__pagination-text']}>
                      1 - {filteredPolicies.length} of {filteredPolicies.length}
                    </span>
                    <IconButton
                      size="Small"
                      aria-label="Previous page"
                      disabled
                      icon={<Icon size="16" glyph={<ChevronLeftIcon />} />}
                    />
                    <IconButton
                      size="Small"
                      aria-label="Next page"
                      disabled
                      icon={<Icon size="16" glyph={<ChevronRightIcon />} />}
                    />
                  </div>
                </div>
              </div>
            </section>

            <section
              className={styles['gmp-list__card']}
              data-tour-focus="sync-jobs"
            >
              <div className={styles['gmp-list__card-head']}>
                <div>
                  <h2 className={styles['gmp-list__card-title']}>
                    Membership sync jobs
                  </h2>
                  <p className={styles['gmp-list__card-subtitle']}>
                    Synchronize membership policies to apply them to system
                    resources
                  </p>
                </div>
                <Button
                  emphasis="Primary"
                  size="Small"
                  leadingIcon={<Icon size="16" glyph={<SyncIcon />} />}
                  onClick={() =>
                    setSyncJobs((jobs) => [
                      {
                        id: `sync-${Date.now()}`,
                        status: 'Pending',
                        finishedAt: '—',
                        runTime: '—',
                      },
                      ...jobs,
                    ])
                  }
                >
                  Run sync job
                </Button>
              </div>

              <div className={styles['gmp-list__card-body']}>
                <div className={styles['gmp-list__table']}>
                  <div className={styles['gmp-list__table-head']}>
                    <div
                      className={styles['gmp-list__table-head-cell']}
                      style={{ flex: 0.8 }}
                    >
                      Status
                    </div>
                    <div
                      className={styles['gmp-list__table-head-cell']}
                      style={{ flex: 1.4 }}
                    >
                      Finished at
                    </div>
                    <div
                      className={styles['gmp-list__table-head-cell']}
                      style={{ flex: 0.8 }}
                    >
                      Run time
                    </div>
                    <div
                      className={styles['gmp-list__table-head-cell']}
                      style={{ flex: 0.8 }}
                    >
                      Actions
                    </div>
                  </div>

                  {syncJobs.map((job) => (
                    <SyncJobRow
                      key={job.id}
                      job={job}
                      onCancel={(jobId) =>
                        setSyncJobs((jobs) => jobs.filter((row) => row.id !== jobId))
                      }
                    />
                  ))}

                  <div className={styles['gmp-list__pagination']}>
                    <span className={styles['gmp-list__pagination-text']}>
                      1 - {syncJobs.length} of {syncJobs.length}
                    </span>
                    <IconButton
                      size="Small"
                      aria-label="Previous page"
                      disabled
                      icon={<Icon size="16" glyph={<ChevronLeftIcon />} />}
                    />
                    <IconButton
                      size="Small"
                      aria-label="Next page"
                      disabled
                      icon={<Icon size="16" glyph={<ChevronRightIcon />} />}
                    />
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
    </WalkthroughFocusProvider>
  );
}

function SyncJobRow({
  job,
  onCancel,
}: {
  job: MembershipSyncJob;
  onCancel: (jobId: string) => void;
}) {
  return (
    <div className={styles['gmp-list__table-row']}>
      <div className={styles['gmp-list__table-cell']} style={{ flex: 0.8 }}>
        <SyncStatusBadge status={job.status} />
      </div>
      <div className={styles['gmp-list__table-cell']} style={{ flex: 1.4 }}>
        {job.finishedAt}
      </div>
      <div className={styles['gmp-list__table-cell']} style={{ flex: 0.8 }}>
        {job.runTime}
      </div>
      <div className={styles['gmp-list__table-cell']} style={{ flex: 0.8 }}>
        {job.status === 'Pending' ? (
          <button
            type="button"
            className={styles['gmp-list__cancel-link']}
            onClick={() => onCancel(job.id)}
          >
            <Icon size="12" glyph={<CloseIcon />} />
            Cancel
          </button>
        ) : (
          <button type="button" className={styles['gmp-list__text-link']}>
            View details
          </button>
        )}
      </div>
    </div>
  );
}
