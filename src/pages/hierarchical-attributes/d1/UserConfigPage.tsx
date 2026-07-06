import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CheckIcon from '@mattermost/compass-icons/components/check';
import ChevronDownIcon from '@mattermost/compass-icons/components/chevron-down';
import EmailOutlineIcon from '@mattermost/compass-icons/components/email-outline';
import AccountIcon from '@mattermost/compass-icons/components/account-outline';
import DotsHorizontalIcon from '@mattermost/compass-icons/components/dots-horizontal';
import ChevronLeftIcon from '@mattermost/compass-icons/components/chevron-left';
import ChevronRightIcon from '@mattermost/compass-icons/components/chevron-right';

import AdminPanel from '@/components/ui/AdminPanel/AdminPanel';
import ConsoleFooter from '@/components/ui/ConsoleFooter/ConsoleFooter';
import ConsoleSetting from '@/components/ui/ConsoleSetting/ConsoleSetting';
import Icon from '@/components/ui/Icon/Icon';
import IconButton from '@/components/ui/IconButton/IconButton';
import LabelTag from '@/components/ui/LabelTag/LabelTag';
import MenuItem from '@/components/ui/MenuItem/MenuItem';
import PopoverMenu from '@/components/ui/PopoverMenu/PopoverMenu';
import SectionNotice from '@/components/ui/SectionNotice/SectionNotice';
import TextInput from '@/components/ui/TextInput/TextInput';
import UserAvatar from '@/components/ui/UserAvatar/UserAvatar';

import ConsoleFrame from '../shared/ConsoleFrame';
import { CLEARANCE_SCHEMA } from '../shared/mockData';
import type { RankedValue } from '../shared/types';
import useQuickSwitch from '../shared/useQuickSwitch';

import styles from './UserConfigPage.module.scss';

type RankDisplayMode = 'none' | 'subtle' | 'badge';
type VisibilityMode = 'user' | 'admin-full' | 'admin-capped';

/**
 * System Console → User Management → Users → [single user].
 *
 * Recreated from the user's screenshot (Maj. Anthony Walker). The Clearance
 * picker demonstrates the proposed v1.0 visibility rule:
 *   • A user can see values BELOW their own rank
 *   • A user cannot see values at the SAME rank (except the exact one they have)
 *   • A user cannot see values ABOVE their own rank
 *
 * Two in-page toggles let reviewers compare:
 *   1. Rank-display: none / subtle / LabelTag badge
 *   2. Visibility logic: user's view / admin's full view / admin capped
 */
export default function UserConfigPage() {
  useQuickSwitch();
  const navigate = useNavigate();

  const [clearance, setClearance] = useState<string>('secret');
  const [dirty, setDirty] = useState(false);
  // Per 2026-06-03 lock (Figma 4318-15053): defaults are badge display + admin-capped
  // visibility. The picker always filters to values at-or-below the SIGNED-IN admin's
  // clearance (System Console is always admin-only — there is no end-user surface here).
  // For the prototype, the signed-in admin "Leonard Riley" holds Secret (rank 3).
  const [rankDisplay, setRankDisplay] = useState<RankDisplayMode>('badge');
  const [visibility, setVisibility] = useState<VisibilityMode>('admin-capped');
  const [pickerOpen, setPickerOpen] = useState(false);

  // Demo: the signed-in admin's own clearance caps what they can assign.
  const SIGNED_IN_ADMIN_RANK = 3; // Secret

  const heldRank = useMemo(() => {
    const v = CLEARANCE_SCHEMA.values.find((x) => x.id === clearance);
    return v?.rank ?? 0;
  }, [clearance]);

  const visibleValues = useMemo(
    () =>
      computeVisibleValues(
        CLEARANCE_SCHEMA.values,
        heldRank,
        SIGNED_IN_ADMIN_RANK,
        visibility,
      ),
    [heldRank, visibility],
  );

  function handleSelect(id: string) {
    setClearance(id);
    setDirty(true);
    setPickerOpen(false);
  }

  function handleSave() {
    setDirty(false);
  }

  function handleCancel() {
    setClearance('secret');
    setDirty(false);
  }

  return (
    <ConsoleFrame
      title="User Configuration"
      activeItemId="users"
      onSidebarItemClick={(id) => {
        if (id === 'user-attributes') {
          navigate('/hierarchical-attributes/d1');
        } else if (id === 'membership-policies') {
          navigate('/hierarchical-attributes/d1/policy-editor');
        }
      }}
      backButton
      onBack={() => navigate('/hierarchical-attributes')}
      directionTag="D1 (leader)"
      footer={
        <ConsoleFooter
          saveDisabled={!dirty}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      }
    >
      <SectionNotice
        type="Info"
        title="Locked design: badge display + admin-capped visibility"
        description="Per Figma 4318-15053 (2026-06-03). The signed-in admin (Leonard Riley) holds Secret; the picker filters to Secret-or-below regardless of who they are configuring. Toggles below let you compare variants — production ships the defaults."
      />

      <ToggleStrip
        rankDisplay={rankDisplay}
        onRankDisplay={setRankDisplay}
        visibility={visibility}
        onVisibility={setVisibility}
      />

      <section className={styles['user-config__profile']} aria-label="User profile">
        <div className={styles['user-config__band']} aria-hidden="true" />
        <div className={styles['user-config__avatar']}>
          <UserAvatar
            alt="Maj. Anthony Walker"
            name="Anthony Walker"
            size="120"
            fallbackColor="Purple"
          />
        </div>
        <div className={styles['user-config__identity']}>
          <div className={styles['user-config__name']}>
            <span className={styles['user-config__name-primary']}>Maj. Anthony Walker</span>
            <span className={styles['user-config__name-sep']}>•</span>
            <span className={styles['user-config__name-secondary']}>Dabtype</span>
          </div>
          <div className={styles['user-config__userid']}>
            User ID: 5rwszpmmq7bn986ty3gdyjf3gw
          </div>
        </div>
        <div className={styles['user-config__role']}>Quality Control Specialist</div>
      </section>

      <section className={styles['user-config__fields']} aria-label="User attributes">
        <ConsoleSetting label="Username">
          <TextInput
            value="anthony.walker"
            leadingIcon={<Icon size="16" glyph={<AccountIcon />} />}
            disabled
            onChange={() => undefined}
          />
        </ConsoleSetting>

        <ConsoleSetting label="Authentication Method">
          <div className={styles['user-config__readonly']}>
            <Icon size="16" glyph={<EmailOutlineIcon />} />
            <span>Email</span>
          </div>
        </ConsoleSetting>

        <ConsoleSetting label="Email">
          <TextInput
            value="major.walker@acmecompany.com"
            onChange={() => setDirty(true)}
          />
        </ConsoleSetting>

        <ConsoleSetting
          label="Clearance"
          helpText={
            <span>
              Visibility:{' '}
              <code className={styles['user-config__code']}>{visibility}</code>{' '}
              · {visibleValues.length}{' '}
              {visibleValues.length === 1 ? 'value' : 'values'} shown of{' '}
              {CLEARANCE_SCHEMA.values.length}
            </span>
          }
        >
          <ClearancePicker
            values={visibleValues}
            selected={clearance}
            onSelect={handleSelect}
            open={pickerOpen}
            onOpenChange={setPickerOpen}
            rankDisplay={rankDisplay}
          />
        </ConsoleSetting>

        <ConsoleSetting label="Program">
          <TextInput value="Dragon Spacecraft" onChange={() => setDirty(true)} />
        </ConsoleSetting>

        <ConsoleSetting label="Rank">
          <TextInput value="Major" onChange={() => setDirty(true)} />
        </ConsoleSetting>
      </section>

      <AdminPanel
        title="Team Membership"
        subtitle="Teams to which this user belongs"
        showButton
        buttonLabel="Add Team"
        onButtonClick={() => undefined}
      >
        <TeamMembershipTable />
      </AdminPanel>
    </ConsoleFrame>
  );
}

/**
 * Apply the v1.0 visibility rule (locked 2026-06-03, Figma 4318-15053).
 *
 * System Console is always admin. There is no end-user surface. The picker
 * always filters by the SIGNED-IN ADMIN's own clearance — an admin cannot
 * assign a clearance higher than their own.
 *
 *  - admin-capped (DEFAULT): Show values at-or-below the signed-in admin's rank.
 *                            This is the locked production behavior.
 *  - admin-full  : Show every value. Variant for prototype review only.
 *  - user        : Filter by the user-being-configured's current rank.
 *                  Useful for envisioning the visibility rule's effect on
 *                  the user themselves; not the v1 production behavior.
 *
 * Returns values in TOP-DOWN order (highest rank first) per Phase 1 Q6.
 */
function computeVisibleValues(
  all: RankedValue[],
  heldRank: number,
  signedInAdminRank: number,
  mode: VisibilityMode,
): RankedValue[] {
  const sorted = [...all].sort((a, b) => (b.rank ?? 0) - (a.rank ?? 0));
  if (mode === 'admin-full') {
    return sorted;
  }
  if (mode === 'user') {
    return sorted.filter((v) => (v.rank ?? 0) <= heldRank);
  }
  return sorted.filter((v) => (v.rank ?? 0) <= signedInAdminRank);
}

interface ClearancePickerProps {
  values: RankedValue[];
  selected: string;
  onSelect: (id: string) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rankDisplay: RankDisplayMode;
}

function ClearancePicker({
  values,
  selected,
  onSelect,
  open,
  onOpenChange,
  rankDisplay,
}: ClearancePickerProps) {
  const selectedLabel = values.find((v) => v.id === selected)?.label ?? '—';

  return (
    <div className={styles['user-config__picker']}>
      <button
        type="button"
        className={styles['user-config__picker-trigger']}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => onOpenChange(!open)}
      >
        <span className={styles['user-config__picker-value']}>{selectedLabel}</span>
        <Icon size="16" glyph={<ChevronDownIcon />} />
      </button>

      {open && (
        <div className={styles['user-config__picker-menu']}>
          <PopoverMenu>
            <div role="listbox" aria-label="Clearance">
              {values.map((v) => {
                const isSelected = v.id === selected;
                return (
                  <MenuItem
                    key={v.id}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => onSelect(v.id)}
                    label={pickerLabel(v, rankDisplay)}
                    leadingVisual={pickerLeading(v, rankDisplay)}
                    leadingElement={rankDisplay === 'badge'}
                    trailingVisual={pickerTrailing(v, rankDisplay, isSelected)}
                    trailingElement={
                      isSelected ||
                      (rankDisplay === 'subtle' && !isSelected)
                    }
                  />
                );
              })}
            </div>
          </PopoverMenu>
        </div>
      )}
    </div>
  );
}

function pickerLabel(value: RankedValue, _mode: RankDisplayMode): string {
  return value.label;
}

function pickerLeading(value: RankedValue, mode: RankDisplayMode) {
  if (mode === 'badge') {
    return <LabelTag label={String(value.rank ?? 0)} />;
  }
  return undefined;
}

function pickerTrailing(
  value: RankedValue,
  mode: RankDisplayMode,
  isSelected: boolean,
) {
  if (isSelected) {
    return <Icon size="16" glyph={<CheckIcon />} />;
  }
  if (mode === 'subtle') {
    return (
      <span className={styles['user-config__picker-rank']}>
        {value.rank ?? 0}
      </span>
    );
  }
  return undefined;
}

interface ToggleStripProps {
  rankDisplay: RankDisplayMode;
  onRankDisplay: (mode: RankDisplayMode) => void;
  visibility: VisibilityMode;
  onVisibility: (mode: VisibilityMode) => void;
}

function ToggleStrip({
  rankDisplay,
  onRankDisplay,
  visibility,
  onVisibility,
}: ToggleStripProps) {
  return (
    <div className={styles['user-config__toggles']}>
      <div className={styles['user-config__toggle-group']} role="radiogroup" aria-label="Rank display">
        <span className={styles['user-config__toggle-label']}>Show rank:</span>
        <SegmentedButton
          active={rankDisplay === 'none'}
          onClick={() => onRankDisplay('none')}
          label="None"
        />
        <SegmentedButton
          active={rankDisplay === 'subtle'}
          onClick={() => onRankDisplay('subtle')}
          label="Subtle"
        />
        <SegmentedButton
          active={rankDisplay === 'badge'}
          onClick={() => onRankDisplay('badge')}
          label="Badge"
        />
      </div>
      <div className={styles['user-config__toggle-group']} role="radiogroup" aria-label="Visibility logic">
        <span className={styles['user-config__toggle-label']}>Visibility:</span>
        <SegmentedButton
          active={visibility === 'user'}
          onClick={() => onVisibility('user')}
          label="User's view"
        />
        <SegmentedButton
          active={visibility === 'admin-full'}
          onClick={() => onVisibility('admin-full')}
          label="Admin's full view"
        />
        <SegmentedButton
          active={visibility === 'admin-capped'}
          onClick={() => onVisibility('admin-capped')}
          label="Admin capped"
        />
      </div>
    </div>
  );
}

interface SegmentedButtonProps {
  active: boolean;
  label: string;
  onClick: () => void;
}

function SegmentedButton({ active, label, onClick }: SegmentedButtonProps) {
  const cls = [
    styles['user-config__segment'],
    active && styles['user-config__segment--active'],
  ]
    .filter(Boolean)
    .join(' ');
  return (
    <button type="button" className={cls} aria-pressed={active} onClick={onClick}>
      {label}
    </button>
  );
}

interface TeamRow {
  id: string;
  name: string;
  description: string;
  type: string;
  role: string;
  initials: string;
}

const TEAM_ROWS: TeamRow[] = [
  {
    id: 't1',
    name: 'eligendi',
    description: 'et iste illum reprehenderit aliquid in rem itaque in maxi…',
    type: 'Invite Only',
    role: 'Team Admin',
    initials: 'EL',
  },
  {
    id: 't2',
    name: 'minus',
    description: 'doloremque dignissimos velit eum quae non omnis. do…',
    type: 'Invite Only',
    role: 'Team Member',
    initials: 'MI',
  },
];

function TeamMembershipTable() {
  return (
    <div className={styles['user-config__teams']}>
      <div className={styles['user-config__teams-head']}>
        <div className={styles['user-config__teams-col-name']}>Name</div>
        <div className={styles['user-config__teams-col-type']}>Type</div>
        <div className={styles['user-config__teams-col-role']}>Role</div>
        <div className={styles['user-config__teams-col-actions']} aria-hidden="true" />
      </div>
      {TEAM_ROWS.map((t) => (
        <div key={t.id} className={styles['user-config__teams-row']} role="row">
          <div className={styles['user-config__teams-col-name']}>
            <span className={styles['user-config__teams-avatar']} aria-hidden="true">
              {t.initials}
            </span>
            <span className={styles['user-config__teams-name-block']}>
              <span className={styles['user-config__teams-name']}>{t.name}</span>
              <span className={styles['user-config__teams-desc']}>{t.description}</span>
            </span>
          </div>
          <div className={styles['user-config__teams-col-type']}>{t.type}</div>
          <div className={styles['user-config__teams-col-role']}>{t.role}</div>
          <div className={styles['user-config__teams-col-actions']}>
            <IconButton
              size="X-Small"
              aria-label="More actions"
              icon={<Icon size="16" glyph={<DotsHorizontalIcon />} />}
            />
          </div>
        </div>
      ))}
      <div className={styles['user-config__teams-pagination']}>
        <span className={styles['user-config__teams-count']}>1 - 2 of 2</span>
        <IconButton
          size="X-Small"
          aria-label="Previous page"
          disabled
          icon={<Icon size="16" glyph={<ChevronLeftIcon />} />}
        />
        <IconButton
          size="X-Small"
          aria-label="Next page"
          disabled
          icon={<Icon size="16" glyph={<ChevronRightIcon />} />}
        />
      </div>
    </div>
  );
}
