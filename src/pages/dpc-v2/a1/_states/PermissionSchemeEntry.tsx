/**
 * DPC V2 A1 — PermissionSchemeEntry (NEW in V2; Wave 2D implementation).
 *
 * Mocks the §3.17 System Scheme entry and §3.18 Team Override Scheme
 * entry for the "Manage join requests for this channel" permission.
 *
 *   Option A — System Scheme entry
 *     Row with label, description, current value ("Channel Admins" by
 *     default). Expand → detail panel with two radios:
 *       (o) Channel Admins              [Default]
 *       ( ) Channel Admins + All Channel Members
 *     Selecting "All Channel Members" renders an inline AC-6
 *     SectionNotice (type=Warning) with the privilege-change copy.
 *
 *   Option B — Team Override Scheme entry
 *     Same row with an "Overrides system default" chip badge when team
 *     value diverges; otherwise "(inherits from System Scheme)" suffix.
 *
 * Both options are rendered stacked for reviewer comparison.
 */
import { useState } from 'react';
import Button from '@/components/ui/Button/Button';
import LabelTag from '@/components/ui/LabelTag/LabelTag';
import Radio from '@/components/ui/Radio/Radio';
import SectionNotice from '@/components/ui/SectionNotice/SectionNotice';
import type { A1V2StoreApi } from '../useA1V2Store';
import styles from './PermissionSchemeEntry.module.scss';

export interface PermissionSchemeEntryProps {
  store: A1V2StoreApi;
}

type RoleBinding = 'channel-admins' | 'channel-admins-plus-members';

export default function PermissionSchemeEntry({
  store,
}: PermissionSchemeEntryProps) {
  return (
    <section
      className={styles['v2-perm-scheme']}
      aria-label="Permission Scheme entry preview"
    >
      <header className={styles['v2-perm-scheme__header']}>
        <h3 className={styles['v2-perm-scheme__title']}>
          Permission Scheme entry
        </h3>
        <p className={styles['v2-perm-scheme__subtitle']}>
          §3.17 System Scheme + §3.18 Team Override Scheme — the new permission
          row &quot;Manage join requests for this channel&quot;. Default is{' '}
          <strong>Channel Admins</strong> (least privilege, AC-6). Broadening
          to <strong>All Channel Members</strong> triggers the inline AC-6
          warning (T-15 mitigation).
        </p>
      </header>

      <div className={styles['v2-perm-scheme__breadcrumb']}>
        System Console → User Management → Permissions → Channel Permissions →{' '}
        <strong>Discoverable Private Channels</strong>
      </div>

      <SystemSchemeEntry store={store} />
      <TeamOverrideEntry store={store} />
    </section>
  );
}

interface EntryProps {
  store: A1V2StoreApi;
}

function SystemSchemeEntry({ store }: EntryProps) {
  const [expanded, setExpanded] = useState(true);
  const binding: RoleBinding = store.state.systemSchemeDpcEnabled
    ? 'channel-admins-plus-members'
    : 'channel-admins';
  const broadened = binding === 'channel-admins-plus-members';

  return (
    <article
      className={styles['v2-perm-scheme__entry']}
      aria-label="System Scheme entry"
    >
      <header className={styles['v2-perm-scheme__entry-head']}>
        <LabelTag
          label="Option A · System Scheme"
          type="Default"
          size="X-Small"
          casing="Title Case"
        />
      </header>

      <div className={styles['v2-perm-scheme__row']}>
        <div className={styles['v2-perm-scheme__row-content']}>
          <h4 className={styles['v2-perm-scheme__row-label']}>
            Manage join requests for this channel
          </h4>
          <p className={styles['v2-perm-scheme__row-desc']}>
            Determines which roles can approve or decline join requests on
            discoverable private channels.
          </p>
          <p className={styles['v2-perm-scheme__row-value']}>
            <span className={styles['v2-perm-scheme__row-value-label']}>
              Current value:
            </span>{' '}
            {broadened
              ? 'Channel Admins + All Channel Members'
              : 'Channel Admins'}
          </p>
        </div>
        <div className={styles['v2-perm-scheme__row-actions']}>
          <Button
            emphasis="Tertiary"
            size="Small"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
          >
            {expanded ? 'Collapse' : 'Edit'}
          </Button>
        </div>
      </div>

      {expanded ? (
        <div className={styles['v2-perm-scheme__panel']}>
          <h5 className={styles['v2-perm-scheme__panel-label']}>
            Roles that can manage join requests:
          </h5>
          <div
            className={styles['v2-perm-scheme__radios']}
            role="radiogroup"
            aria-label="Roles that can manage join requests"
          >
            <div className={styles['v2-perm-scheme__radio']}>
              <Radio
                size="Medium"
                name="system-scheme-role"
                checked={!broadened}
                onChange={() => store.setSystemSchemeDpc(false)}
              >
                Channel Admins
              </Radio>
              <LabelTag
                label="Default"
                type="Info Dim"
                size="X-Small"
                casing="Title Case"
              />
            </div>
            <div className={styles['v2-perm-scheme__radio']}>
              <Radio
                size="Medium"
                name="system-scheme-role"
                checked={broadened}
                onChange={() => store.setSystemSchemeDpc(true)}
              >
                Channel Admins + All Channel Members
              </Radio>
            </div>
          </div>

          {broadened ? (
            <SectionNotice
              type="Warning"
              title="Privilege change"
              description={
                <>
                  Allowing all channel members to manage join requests can
                  lower the bar for adding new members. Verify this matches
                  your team&apos;s intent.{' '}
                  <strong>
                    This change applies to every team that uses the System
                    Scheme.
                  </strong>{' '}
                  Teams with their own Override Scheme are not affected. This
                  change is audit-logged.
                </>
              }
            />
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

function TeamOverrideEntry({ store }: EntryProps) {
  const [expanded, setExpanded] = useState(false);
  const overrideActive = store.state.teamOverrideActive;
  const teamBroadened = store.state.teamOverrideDpcEnabled;

  return (
    <article
      className={styles['v2-perm-scheme__entry']}
      aria-label="Team Override Scheme entry"
    >
      <header className={styles['v2-perm-scheme__entry-head']}>
        <LabelTag
          label="Option B · Team Override Scheme"
          type="Default"
          size="X-Small"
          casing="Title Case"
        />
        <span className={styles['v2-perm-scheme__entry-bound']}>
          Bound to: <strong>Engineering, Operations</strong>
        </span>
      </header>

      <div className={styles['v2-perm-scheme__row']}>
        <div className={styles['v2-perm-scheme__row-content']}>
          <div className={styles['v2-perm-scheme__row-label-row']}>
            <h4 className={styles['v2-perm-scheme__row-label']}>
              Manage join requests for this channel
            </h4>
            {overrideActive ? (
              <LabelTag
                label="Overrides system default"
                type="Warning"
                size="X-Small"
                casing="Title Case"
              />
            ) : null}
          </div>
          <p className={styles['v2-perm-scheme__row-desc']}>
            Determines which roles can approve or decline join requests on
            discoverable private channels.
          </p>
          <p className={styles['v2-perm-scheme__row-value']}>
            <span className={styles['v2-perm-scheme__row-value-label']}>
              Current value:
            </span>{' '}
            {overrideActive && teamBroadened
              ? 'Channel Admins + All Channel Members'
              : 'Channel Admins'}
            {!overrideActive ? (
              <span className={styles['v2-perm-scheme__row-inherit']}>
                {' '}
                (inherits from System Scheme)
              </span>
            ) : null}
          </p>
          {overrideActive ? (
            <p className={styles['v2-perm-scheme__row-system']}>
              System Scheme default: Channel Admins
            </p>
          ) : null}
        </div>
        <div className={styles['v2-perm-scheme__row-actions']}>
          <Button
            emphasis="Tertiary"
            size="Small"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
          >
            {expanded ? 'Collapse' : 'Edit'}
          </Button>
        </div>
      </div>

      {expanded ? (
        <div className={styles['v2-perm-scheme__panel']}>
          <div className={styles['v2-perm-scheme__override-toggle']}>
            <div className={styles['v2-perm-scheme__radio']}>
              <Radio
                size="Medium"
                name="team-override-active"
                checked={!overrideActive}
                onChange={() => store.setTeamOverrideActive(false)}
              >
                Inherit from System Scheme
              </Radio>
            </div>
            <div className={styles['v2-perm-scheme__radio']}>
              <Radio
                size="Medium"
                name="team-override-active"
                checked={overrideActive}
                onChange={() => store.setTeamOverrideActive(true)}
              >
                Override system default
              </Radio>
            </div>
          </div>

          {overrideActive ? (
            <>
              <h5 className={styles['v2-perm-scheme__panel-label']}>
                Roles that can manage join requests:
              </h5>
              <div
                className={styles['v2-perm-scheme__radios']}
                role="radiogroup"
                aria-label="Team-scoped roles"
              >
                <div className={styles['v2-perm-scheme__radio']}>
                  <Radio
                    size="Medium"
                    name="team-override-role"
                    checked={!teamBroadened}
                    onChange={() => store.setTeamOverrideDpc(false)}
                  >
                    Channel Admins
                  </Radio>
                  <LabelTag
                    label="System default"
                    type="Info Dim"
                    size="X-Small"
                    casing="Title Case"
                  />
                </div>
                <div className={styles['v2-perm-scheme__radio']}>
                  <Radio
                    size="Medium"
                    name="team-override-role"
                    checked={teamBroadened}
                    onChange={() => store.setTeamOverrideDpc(true)}
                  >
                    Channel Admins + All Channel Members
                  </Radio>
                </div>
              </div>

              {teamBroadened ? (
                <SectionNotice
                  type="Warning"
                  title="Privilege change"
                  description={
                    <>
                      Allowing all channel members to manage join requests can
                      lower the bar for adding new members. Verify this
                      matches your team&apos;s intent. This change applies
                      only to teams using <strong>this Team Override Scheme</strong>{' '}
                      (Engineering, Operations). It does not affect the System
                      Scheme or any other team&apos;s scheme. This change is
                      audit-logged.
                    </>
                  }
                />
              ) : null}
            </>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}
