import { useId } from 'react';
import avatarLeonard from '@/assets/avatars/Leonard Riley.png';
import { AdminPanelFooter } from '@mattermost/compass-ui';
import { AdminConsoleHeader } from '@mattermost/compass-ui';
import { AdminPanel } from '@mattermost/compass-ui';
import { AdminConsoleSidebar } from '@mattermost/compass-ui';
import { Radio } from '@mattermost/compass-ui';
import { Scrollbar } from '@mattermost/compass-ui';
import { Select } from '@mattermost/compass-ui';
import { TextInput } from '@mattermost/compass-ui';
import { defaultAdminConsoleSidebarGroups } from '@mattermost/compass-proto';
import styles from './admin-console.specimen.module.scss';

const DOC_PRIORITY =
  'https://docs.mattermost.com/configure/site-configuration-settings.html';

const postsSampleSidebarGroups = defaultAdminConsoleSidebarGroups.map(
  (group) => ({
    ...group,
    items: group.items.map((item) => ({
      ...item,
      active: item.name === 'Posts',
    })),
  }),
);

const THREAD_MODE_OPTIONS = [
  { value: 'default-off', label: 'Default off' },
  { value: 'default-on', label: 'Default on' },
  { value: 'always-on', label: 'Always On' },
];

export default function AdminConsoleLayout() {
  const radioNs = useId().replace(/\W/g, '');

  return (
    <div className={styles['admin-console-layout']}>
      <div className={styles['admin-console-layout__sidebar-mount']}>
        <AdminConsoleSidebar
          avatarSrc={avatarLeonard}
          avatarAlt="Leonard Riley"
          groups={postsSampleSidebarGroups}
        />
      </div>

      <div className={styles['admin-console-layout__main']}>
        <AdminConsoleHeader title="Posts" enterpriseBadge={false} />

        <div className={styles['admin-console-layout__scroll']}>
          <Scrollbar>
            <div className={styles['admin-console-layout__panels']}>
              <AdminPanel
                title="Threads"
                subtitle="Configure threaded discussions and auto-follow defaults."
              >
                <div className={styles['admin-console-layout__settings']}>
                  <div className={styles['admin-console-layout__setting']}>
                    <div className={styles['admin-console-layout__setting-label']}>
                      Automatically Follow Threads
                    </div>
                    <div className={styles['admin-console-layout__setting-fields']}>
                      <div className={styles['admin-console-layout__radio-row']}>
                        <Radio
                          name={`${radioNs}-auto-follow`}
                          value="true"
                          defaultChecked
                          size="Medium"
                        >
                          True
                        </Radio>
                        <Radio
                          name={`${radioNs}-auto-follow`}
                          value="false"
                          size="Medium"
                        >
                          False
                        </Radio>
                      </div>
                      <p className={styles['admin-console-layout__help']}>
                        This setting must be enabled in order to enable Threaded
                        Discussions. When enabled, threads a user starts,
                        participates in, or is mentioned in are automatically
                        followed. A new{' '}
                        <code className={styles['admin-console-layout__code']}>
                          Threads
                        </code>{' '}
                        table is added in the database that tracks threads and
                        thread participants, and a{' '}
                        <code className={styles['admin-console-layout__code']}>
                          ThreadMembership
                        </code>{' '}
                        table tracks followed threads for each user and the read or
                        unread state of each followed thread. When false, all
                        backend operations to support Threaded Discussions are
                        disabled.
                      </p>
                    </div>
                  </div>

                  <div className={styles['admin-console-layout__setting']}>
                    <div className={styles['admin-console-layout__setting-label']}>
                      Threaded Discussions
                    </div>
                    <div className={styles['admin-console-layout__setting-fields']}>
                      <div className={styles['admin-console-layout__select-wrap']}>
                        <Select
                          label="Mode"
                          size="Medium"
                          defaultValue="always-on"
                          options={THREAD_MODE_OPTIONS}
                          aria-label="Threaded discussions mode"
                        />
                      </div>
                      <p className={styles['admin-console-layout__help']}>
                        When enabled (default off), users have the option to enable
                        Threaded Discussions in Account Settings. When enabled
                        (default on), users see Threaded Discussions by default and
                        have the option to disable it in Account Settings. When
                        always on, users are required to use Threaded Discussions
                        and cannot disable it.
                      </p>
                    </div>
                  </div>
                </div>
              </AdminPanel>

              <AdminPanel
                title="Drafts and Scheduled Posts"
                subtitle="Control draft syncing and scheduled sending."
              >
                <div className={styles['admin-console-layout__settings']}>
                  <div className={styles['admin-console-layout__setting']}>
                    <div className={styles['admin-console-layout__setting-label']}>
                      Enable server syncing of message drafts
                    </div>
                    <div className={styles['admin-console-layout__setting-fields']}>
                      <div className={styles['admin-console-layout__radio-row']}>
                        <Radio
                          name={`${radioNs}-draft-sync`}
                          value="true"
                          defaultChecked
                          size="Medium"
                        >
                          True
                        </Radio>
                        <Radio
                          name={`${radioNs}-draft-sync`}
                          value="false"
                          size="Medium"
                        >
                          False
                        </Radio>
                      </div>
                      <p className={styles['admin-console-layout__help']}>
                        When enabled, users message drafts will sync with the server
                        so they can be accessed from any device. Users may opt out
                        of this behaviour in Account settings.
                      </p>
                    </div>
                  </div>

                  <div className={styles['admin-console-layout__setting']}>
                    <div className={styles['admin-console-layout__setting-label']}>
                      Scheduled Posts
                    </div>
                    <div className={styles['admin-console-layout__setting-fields']}>
                      <div className={styles['admin-console-layout__radio-row']}>
                        <Radio
                          name={`${radioNs}-scheduled`}
                          value="true"
                          defaultChecked
                          size="Medium"
                        >
                          True
                        </Radio>
                        <Radio
                          name={`${radioNs}-scheduled`}
                          value="false"
                          size="Medium"
                        >
                          False
                        </Radio>
                      </div>
                      <p className={styles['admin-console-layout__help']}>
                        When enabled, users can schedule and send messages in the
                        future.
                      </p>
                    </div>
                  </div>
                </div>
              </AdminPanel>

              <AdminPanel
                title="Priority & Urgent Notifications"
                subtitle="Set message priority and repeating notifications for urgent delivery."
              >
                <div className={styles['admin-console-layout__settings']}>
                  <div className={styles['admin-console-layout__setting']}>
                    <div className={styles['admin-console-layout__setting-label']}>
                      Message Priority
                    </div>
                    <div className={styles['admin-console-layout__setting-fields']}>
                      <div className={styles['admin-console-layout__radio-row']}>
                        <Radio
                          name={`${radioNs}-msg-priority`}
                          value="true"
                          defaultChecked
                          size="Medium"
                        >
                          True
                        </Radio>
                        <Radio
                          name={`${radioNs}-msg-priority`}
                          value="false"
                          size="Medium"
                        >
                          False
                        </Radio>
                      </div>
                      <p className={styles['admin-console-layout__help']}>
                        When enabled, users can configure a visual indicator to
                        communicate messages that are important or urgent. Learn
                        more about message priority in our{' '}
                        <a
                          className={styles['admin-console-layout__doc-link']}
                          href={DOC_PRIORITY}
                          target="_blank"
                          rel="noreferrer"
                        >
                          documentation
                        </a>
                        .
                      </p>
                    </div>
                  </div>

                  <div className={styles['admin-console-layout__setting']}>
                    <div className={styles['admin-console-layout__setting-label']}>
                      Persistent Notifications
                    </div>
                    <div className={styles['admin-console-layout__setting-fields']}>
                      <div className={styles['admin-console-layout__radio-row']}>
                        <Radio
                          name={`${radioNs}-persistent`}
                          value="true"
                          defaultChecked
                          size="Medium"
                        >
                          True
                        </Radio>
                        <Radio
                          name={`${radioNs}-persistent`}
                          value="false"
                          size="Medium"
                        >
                          False
                        </Radio>
                      </div>
                      <p className={styles['admin-console-layout__help']}>
                        When enabled, users can trigger repeating notifications for
                        the recipients of urgent messages. Learn more about message
                        priority and persistent notifications in our{' '}
                        <a
                          className={styles['admin-console-layout__doc-link']}
                          href={DOC_PRIORITY}
                          target="_blank"
                          rel="noreferrer"
                        >
                          documentation
                        </a>
                        .
                      </p>
                    </div>
                  </div>

                  <div className={styles['admin-console-layout__setting']}>
                    <div className={styles['admin-console-layout__setting-label']}>
                      Maximum number of recipients for persistent notifications
                    </div>
                    <div className={styles['admin-console-layout__setting-fields']}>
                      <div className={styles['admin-console-layout__input-wrap']}>
                        <TextInput
                          label="Value"
                          defaultValue="5"
                          size="Medium"
                          inputMode="numeric"
                          aria-label="Maximum number of recipients for persistent notifications"
                        />
                      </div>
                      <p className={styles['admin-console-layout__help']}>
                        Configure the maximum number of recipients to which users may
                        send persistent notifications. Learn more about message
                        priority and persistent notifications in our{' '}
                        <a
                          className={styles['admin-console-layout__doc-link']}
                          href={DOC_PRIORITY}
                          target="_blank"
                          rel="noreferrer"
                        >
                          documentation
                        </a>
                        .
                      </p>
                    </div>
                  </div>

                  <div className={styles['admin-console-layout__setting']}>
                    <div className={styles['admin-console-layout__setting-label']}>
                      Frequency of persistent notifications
                    </div>
                    <div className={styles['admin-console-layout__setting-fields']}>
                      <div className={styles['admin-console-layout__input-wrap']}>
                        <TextInput
                          label="Minutes between repeats"
                          defaultValue="5"
                          size="Medium"
                          inputMode="numeric"
                          aria-label="Frequency of persistent notifications in minutes"
                        />
                      </div>
                      <p className={styles['admin-console-layout__help']}>
                        Configure the number of minutes between repeated
                        notifications for urgent messages sent with persistent
                        notifications. Learn more about message priority and
                        persistent notifications in our{' '}
                        <a
                          className={styles['admin-console-layout__doc-link']}
                          href={DOC_PRIORITY}
                          target="_blank"
                          rel="noreferrer"
                        >
                          documentation
                        </a>
                        .
                      </p>
                    </div>
                  </div>

                  <div className={styles['admin-console-layout__setting']}>
                    <div className={styles['admin-console-layout__setting-label']}>
                      Total number of persistent notification per post
                    </div>
                    <div className={styles['admin-console-layout__setting-fields']}>
                      <div className={styles['admin-console-layout__input-wrap']}>
                        <TextInput
                          label="Value"
                          defaultValue="6"
                          size="Medium"
                          inputMode="numeric"
                          aria-label="Total number of persistent notifications per post"
                        />
                      </div>
                      <p className={styles['admin-console-layout__help']}>
                        Configure the maximum number of times users may receive
                        persistent notifications. Learn more about message priority
                        and persistent notifications in our{' '}
                        <a
                          className={styles['admin-console-layout__doc-link']}
                          href={DOC_PRIORITY}
                          target="_blank"
                          rel="noreferrer"
                        >
                          documentation
                        </a>
                        .
                      </p>
                    </div>
                  </div>

                  <div className={styles['admin-console-layout__setting']}>
                    <div className={styles['admin-console-layout__setting-label']}>
                      Allow guests to send persistent notifications
                    </div>
                    <div className={styles['admin-console-layout__setting-fields']}>
                      <div className={styles['admin-console-layout__radio-row']}>
                        <Radio
                          name={`${radioNs}-guest-persistent`}
                          value="true"
                          size="Medium"
                        >
                          True
                        </Radio>
                        <Radio
                          name={`${radioNs}-guest-persistent`}
                          value="false"
                          defaultChecked
                          size="Medium"
                        >
                          False
                        </Radio>
                      </div>
                      <p className={styles['admin-console-layout__help']}>
                        Whether a guest is able to require persistent notifications.
                        Learn more about message priority and persistent notifications
                        in our{' '}
                        <a
                          className={styles['admin-console-layout__doc-link']}
                          href={DOC_PRIORITY}
                          target="_blank"
                          rel="noreferrer"
                        >
                          documentation
                        </a>
                        .
                      </p>
                    </div>
                  </div>
                </div>
              </AdminPanel>
            </div>
          </Scrollbar>
        </div>

        <AdminPanelFooter saveDisabled={false} />
      </div>
    </div>
  );
}
