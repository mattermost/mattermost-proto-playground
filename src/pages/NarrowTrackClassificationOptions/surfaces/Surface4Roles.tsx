// Surface 4 — Delegated Attribute Manager role surface (FR-6).
// Channel AM vs User AM vs read-only Security Officer, scoped at the platform
// level. Approach A renders a full delegation matrix; B a compact scoped
// summary; C the plain roles list. V-4 (role reconciliation) is carried as a
// neutral, product-plausible "role model under review" note.

import AccountMultipleOutlineIcon from '@mattermost/compass-icons/components/account-multiple-outline';

import ConsolePanel from '@/components/ui/ConsolePanel/ConsolePanel';
import ConsoleSetting from '@/components/ui/ConsoleSetting/ConsoleSetting';
import SectionNotice from '@/components/ui/SectionNotice/SectionNotice';
import UserAvatar from '@/components/ui/UserAvatar/UserAvatar';
import EmptyState from '@/components/ui/EmptyState/EmptyState';
import Icon from '@/components/ui/Icon/Icon';

import type { SurfaceScreenProps } from '../shared/types';
import { ROLE_DELEGATES } from '../shared/fixtures';
import shared from '../shared/shared.module.scss';

const CAPABILITIES: { role: string; can: string; cannot: string }[] = [
  {
    role: 'Channel Attribute Manager',
    can: 'Assign classification values to channels',
    cannot: 'Cannot edit user clearance, define levels, or author policies',
  },
  {
    role: 'User Attribute Manager',
    can: 'Assign clearance values to users',
    cannot: 'Cannot classify channels or author policies',
  },
  {
    role: 'Security Officer',
    can: 'Read all policies, ceilings, assignments, and audit logs',
    cannot: 'Read-only — cannot change any assignment',
  },
];

export default function Surface4Roles({ approach, state }: SurfaceScreenProps) {
  if (state === 'default') {
    return (
      <ConsolePanel
        title="Attribute management roles"
        subtitle="Delegate who can manage classification and clearance values, scoped by resource type."
      >
        <EmptyState
          title="No delegates assigned"
          description="Assign a Channel Attribute Manager, a User Attribute Manager, or a read-only Security Officer. Each role is scoped so a delegate only manages the values for its resource type."
          action={{ children: 'Assign a role', emphasis: 'Primary' }}
        />
      </ConsolePanel>
    );
  }

  const delegateRows = (
    <div className={shared['delegates']}>
      {ROLE_DELEGATES.map((d) => (
        <div key={d.id} className={shared['delegates__row']}>
          <span className={shared['delegates__who']}>
            <UserAvatar src={d.avatar} alt={d.name} name={d.name} size="24" />
            {d.name}
          </span>
          <span className={shared['delegates__role']}>{d.role}</span>
        </div>
      ))}
    </div>
  );

  return (
    <>
      <ConsolePanel
        title="Attribute management roles"
        subtitle="Each role is scoped by resource type and enforced on the server, not only hidden in the interface."
      >
        <ConsoleSetting
          label="Assigned delegates"
          helpText="A delegate can only manage the values for its resource type."
        >
          {delegateRows}
        </ConsoleSetting>

        {/* A — full capability matrix; B — compact scoped summary; C — omit. */}
        {approach !== 'c' && (
          <ConsoleSetting label="What each role can do">
            <div className={shared['delegates']}>
              {CAPABILITIES.map((c) => (
                <div key={c.role} className={shared['delegates__row']}>
                  <span className={shared['delegates__who']}>
                    <Icon size="16" glyph={<AccountMultipleOutlineIcon />} />
                    {c.role}
                  </span>
                  <span className={shared['delegates__role']}>
                    {approach === 'a' ? `${c.can}. ${c.cannot}.` : c.can}
                  </span>
                </div>
              ))}
            </div>
          </ConsoleSetting>
        )}
      </ConsolePanel>

      {/* V-4 neutral pending-reconciliation note as plausible product copy. */}
      {state === 'posture' && (
        <SectionNotice
          type="Info"
          title="Role model under review"
          description="These roles are being reconciled with the delegated attribute manager plugin. Capabilities may change before this configuration is finalized."
        />
      )}
    </>
  );
}
