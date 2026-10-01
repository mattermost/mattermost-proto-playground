import { useState } from 'react';
import type { ReactNode } from 'react';
import CheckIcon from '@mattermost/compass-icons/components/check';
import ChevronDownIcon from '@mattermost/compass-icons/components/chevron-down';
import ChevronLeftIcon from '@mattermost/compass-icons/components/chevron-left';
import EqualIcon from '@mattermost/compass-icons/components/equal';
import FilterVariantIcon from '@mattermost/compass-icons/components/filter-variant';
import InformationOutlineIcon from '@mattermost/compass-icons/components/information-outline';
import TextShortIcon from '@mattermost/compass-icons/components/text-short';
import TrashCanOutlineIcon from '@mattermost/compass-icons/components/trash-can-outline';
import { Button } from '@mattermost/compass-ui/components/button';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { IconButton } from '@mattermost/compass-ui/components/icon-button';
import { MenuItem } from '@mattermost/compass-ui/components/menu-item';
import { Modal } from '@mattermost/compass-ui/components/modal';
import { PopoverMenu } from '@mattermost/compass-ui/components/popover-menu';
import { TextInput } from '@mattermost/compass-ui/components/text-input';
import AcvcScreenNav from '../components/AcvcScreenNav';
import AcvcStage from '../components/AcvcStage';
import AcvcConsoleFrame from '../components/AcvcConsoleFrame';
import { AUTHORING_SCREENS } from '../actionControlsScenes';
import {
  PERMISSION_PICKER_ITEMS,
  POLICY_ATTRIBUTES,
  POLICY_NAME,
  POLICY_PERMISSIONS,
  ROLE_OPTIONS,
  SELECTED_ROLE,
} from '../adminData';
import styles from './AuthoringScene.module.scss';

/**
 * An "Admin inheritance" warning screen used to sit in this list. It was
 * dropped by designer decision: shipped
 * `admin.permission_policies.role.system_user.description` already discloses
 * the fallback in the role picker itself — "Applies to regular members. System
 * administrators also fall back to this rule if no admin-specific policy with
 * the same permissions exists." — which states the mechanic more precisely than
 * a post-hoc warning could. A "Simulate access" screen was dropped the same
 * way: nothing about that modal changes for Read Channel, so prototyping it
 * only invited review of a surface not under design. Both entries have since
 * been removed from `actionControlsScenes.ts`, so no filtering is needed here.
 */
const SCREENS = AUTHORING_SCREENS;

type ScreenId = (typeof AUTHORING_SCREENS)[number]['id'];

function PageHeader() {
  return (
    <header className={styles['authoring__page-header']}>
      <button type="button" className={styles['authoring__back']} aria-label="Back">
        <Icon glyph={<ChevronLeftIcon />} size="24" />
      </button>
      <h1 className={styles['authoring__page-title']}>Attribute Based Permission Policy</h1>
    </header>
  );
}

function InfoBanner() {
  return (
    <div className={styles['authoring__banner']}>
      <Icon glyph={<InformationOutlineIcon />} size="20" />
      <div>
        {/*
          Shipped `admin.permission_policies.edit.info_banner.title` is
          "…override the {link} when its conditions are met", where {link} is a
          BlockableLink to /admin_console/user_management/permissions carrying
          `admin.permission_policies.edit.info_banner.link` =
          "system permission schemes".
        */}
        <p className={styles['authoring__banner-title']}>
          The permissions defined in this policy override the{' '}
          <a className={styles['authoring__banner-link']} href="#permission-schemes">
            system permission schemes
          </a>{' '}
          when its conditions are met
        </p>
        <p className={styles['authoring__banner-body']}>
          Permissions evaluation order: Permission policies (evaluated first) → System scheme /
          Team override scheme (fallback when no policy applies).
        </p>
      </div>
    </div>
  );
}

function Card({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <section className={styles['authoring__card']}>
      <div className={styles['authoring__card-header']}>
        <div className={styles['authoring__card-heading']}>
          <h2 className={styles['authoring__card-title']}>{title}</h2>
          {subtitle ? <p className={styles['authoring__card-subtitle']}>{subtitle}</p> : null}
        </div>
        <IconButton
          size="small"
          icon={<Icon glyph={<ChevronDownIcon />} size="16" />}
          aria-label={`Collapse ${title}`}
        />
      </div>
      <div className={styles['authoring__card-body']}>{children}</div>
    </section>
  );
}

/** Red row-level delete, right end of every attribute and permission row. */
function DeleteRowButton({ label }: { label: string }) {
  return (
    <IconButton
      size="small"
      destructive
      icon={<Icon glyph={<TrashCanOutlineIcon />} size="16" />}
      aria-label={label}
    />
  );
}

/**
 * Role picker. Compass `Select` cannot render two-line options with a selected
 * check, so the trigger and list are built here against the reference.
 */
function RoleField({ open = false }: { open?: boolean }) {
  return (
    <div className={styles['authoring__field']}>
      <button
        type="button"
        id="acvc-role"
        aria-haspopup="listbox"
        aria-expanded={open}
        className={[
          styles['authoring__role-trigger'],
          open ? styles['authoring__role-trigger--open'] : '',
        ]
          .join(' ')
          .trim()}
      >
        <span className={styles['authoring__role-value']}>{SELECTED_ROLE}</span>
        <Icon glyph={<ChevronDownIcon />} size="20" />
      </button>

      {open ? (
        <PopoverMenu className={styles['authoring__role-menu']} role="listbox">
          {ROLE_OPTIONS.map((option) => {
            const selected = option.value === SELECTED_ROLE;
            return (
              <MenuItem
                key={option.value}
                role="option"
                aria-selected={selected}
                label={option.value}
                secondaryLabel={option.description}
                leadingElement={false}
                trailingElement={selected}
                trailingVisual={
                  selected ? (
                    <span className={styles['authoring__check']}>
                      <Icon glyph={<CheckIcon />} size="16" />
                    </span>
                  ) : undefined
                }
              />
            );
          })}
        </PopoverMenu>
      ) : null}
    </div>
  );
}

function AttributeRequirements() {
  return (
    <>
      <div className={styles['authoring__table-head-row']}>
        <h3 className={styles['authoring__subhead']}>User attribute requirements</h3>
        {/*
          DIVERGES FROM REFERENCE PNG BY DESIGNER RULING (shipped en.json is
          canonical): the PNG shows a two-segment "<> Advanced | ⊞ Simple"
          control, but shipped `permission_policy_details.tsx` renders ONE
          button via `TitleAndButtonCardHeader` carrying whichever of
          `admin.permission_policies.edit.switch_to_advanced` /
          `.switch_to_simple` applies to the current mode. The editor is in
          Simple (table) mode here, so the button offers Advanced.

          Two further shipped details: the button takes no icon, and shipped
          wraps it in a tooltip only when it is DISABLED — carrying a
          "why it's disabled" message, never the label. No tooltip here, since
          the label is already visible and duplicating it would be noise for
          screen-reader users.

          Rendered Secondary rather than shipped's Primary: this repo caps
          Primary emphasis at once per view (AGENTS.md), and that slot belongs
          to the save action.
        */}
        <Button emphasis="secondary" size="small">
          Switch to Advanced Mode
        </Button>
      </div>

      <div className={styles['authoring__table-wrap']}>
        <table className={styles['authoring__table']}>
          <thead>
            <tr>
              <th>Attribute</th>
              <th>Operator</th>
              <th>Values</th>
              <th className={styles['authoring__table-right']}>
                <button type="button" className={styles['authoring__head-control']}>
                  <Icon glyph={<FilterVariantIcon />} size="16" />
                  All attributes required
                  <Icon glyph={<ChevronDownIcon />} size="16" />
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {POLICY_ATTRIBUTES.map((row) => (
              <tr key={row.attribute}>
                <td>
                  <span className={styles['authoring__cell-icon-text']}>
                    <Icon glyph={<TextShortIcon />} size="16" />
                    {row.attribute}
                  </span>
                </td>
                <td className={styles['authoring__muted']}>
                  <span className={styles['authoring__cell-icon-text']}>
                    <Icon glyph={<EqualIcon />} size="16" />
                    {row.operator}
                  </span>
                </td>
                <td>{row.value}</td>
                <td className={styles['authoring__table-right']}>
                  <DeleteRowButton label={`Remove ${row.attribute} requirement`} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className={styles['authoring__table-footer']}>
          <Button emphasis="tertiary" size="small">
            + Add attribute
          </Button>
        </div>
      </div>

      <div className={styles['authoring__table-caption-row']}>
        <p className={styles['authoring__muted']}>
          Select attributes and values that users must have for this policy
        </p>
        {/*
          Shipped `permission_policy_details.tsx` routes this slot's test button
          through SimulateAccessModal and re-labels it
          `admin.permission_policies.editor.simulate_rules` = "Simulate rules".
          The reference PNG's "Test matching users" was the stale label for this
          same control and has been dropped — it has no key in shipped
          `admin.permission_policies.*`.

          The trigger stays but is inert: the Simulate access modal was dropped
          from the prototype by designer decision, since nothing about that
          surface changes for Read Channel and prototyping it invited review of
          a screen not under design. The button itself ships, so removing it
          would misstate the page.
        */}
        <Button emphasis="tertiary" size="small">
          Simulate rules
        </Button>
      </div>
    </>
  );
}

function AudienceCard({ roleMenuOpen = false }: { roleMenuOpen?: boolean }) {
  return (
    <Card
      title="Who this policy applies to"
      subtitle="Define rules based on user attributes and values"
    >
      <label className={styles['authoring__field-label']} htmlFor="acvc-role">
        Select a role from the predefined list of system roles
      </label>
      <RoleField open={roleMenuOpen} />
      <AttributeRequirements />
    </Card>
  );
}

/**
 * Floating list under "+ Add permission". Rows are name + description only —
 * no search, no group headings, no footer actions, no tags.
 */
function PermissionPickerMenu() {
  return (
    <PopoverMenu className={styles['authoring__picker-menu']}>
      {PERMISSION_PICKER_ITEMS.map((item) => (
        <MenuItem
          key={item.name}
          label={item.name}
          secondaryLabel={item.description}
          leadingElement={false}
        />
      ))}
    </PopoverMenu>
  );
}

function PermissionsCard({
  empty = false,
  menuOpen = false,
}: {
  empty?: boolean;
  menuOpen?: boolean;
}) {
  return (
    <Card
      title="What permissions are modified"
      subtitle="These permissions override the default system permission scheme when policy conditions are met"
    >
      {/*
        DIVERGES FROM SHIPPED CODE BY DESIGNER RULING. Three-way split: the
        reference PNG shows Permission + Description, shipped
        `permission_policy_details.tsx` renders each row as label + trash only
        (`admin.permission_policies.edit.permissions.column_header` =
        "Permission" is the only header key in that family), and the designer
        chose the PNG treatment — an admin configuring the policy should see
        what each permission grants without opening the add-permission menu.
        Descriptions come from POLICY_PERMISSIONS[].description, which carries
        the shipped strings.
      */}
      <div className={styles['authoring__table-wrap']}>
        <table className={styles['authoring__table']}>
          <thead>
            <tr>
              <th>Permission</th>
              {empty ? null : <th>Description</th>}
              {empty ? null : <th className={styles['authoring__table-right']} />}
            </tr>
          </thead>
          <tbody>
            {empty ? (
              <tr>
                <td className={styles['authoring__empty-cell']}>
                  Add a permission to this policy
                </td>
              </tr>
            ) : (
              POLICY_PERMISSIONS.map((row) => (
                <tr key={row.name}>
                  <td>
                    <span className={styles['authoring__permission-name']}>{row.name}</span>
                  </td>
                  <td className={styles['authoring__muted']}>{row.description}</td>
                  <td className={styles['authoring__table-right']}>
                    <DeleteRowButton label={`Remove ${row.name}`} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <div className={styles['authoring__table-footer']}>
          <div className={styles['authoring__anchor']}>
            <Button emphasis="tertiary" size="small">
              + Add permission
            </Button>
            {menuOpen ? <PermissionPickerMenu /> : null}
          </div>
        </div>
      </div>
    </Card>
  );
}

function PolicyDetail({
  children,
  permissionsEmpty = false,
  permissionMenuOpen = false,
  roleMenuOpen = false,
}: {
  children?: ReactNode;
  permissionsEmpty?: boolean;
  permissionMenuOpen?: boolean;
  roleMenuOpen?: boolean;
}) {
  return (
    <div className={styles['authoring']}>
      <PageHeader />
      <div className={styles['authoring__body']}>
        <div className={styles['authoring__name-row']}>
          <label className={styles['authoring__name-label']} htmlFor="acvc-name">
            Access policy name:
          </label>
          <div className={styles['authoring__name-field']}>
            <TextInput id="acvc-name" value={POLICY_NAME} readOnly />
            <p className={styles['authoring__hint']}>
              Give your policy a name that will be used to identify it in the policies list.
            </p>
          </div>
        </div>

        <InfoBanner />

        <AudienceCard roleMenuOpen={roleMenuOpen} />
        <PermissionsCard empty={permissionsEmpty} menuOpen={permissionMenuOpen} />
        {children}
      </div>
    </div>
  );
}

export default function AuthoringScene() {
  const [screen, setScreen] = useState<ScreenId>('configured');

  return (
    <div className={styles['authoring-scene']}>
      <AcvcScreenNav
        screens={SCREENS}
        activeId={screen}
        onChange={(id) => setScreen(id as ScreenId)}
        ariaLabel="Authoring flow screen"
      />

      {screen === 'picker' ? (
        <AcvcStage
          variant="console"
          title="Add permission — Read Channels and Write to Channels join the picker"
          note="Both dropdowns are shown open. The role list and the permission list are inherited surfaces; Read Channels and Write to Channels are two more rows, with no new control introduced. Write to Channels is a separate action — granting it without Read Channels does nothing."
        >
          <AcvcConsoleFrame>
            <PolicyDetail permissionsEmpty permissionMenuOpen roleMenuOpen />
          </AcvcConsoleFrame>
        </AcvcStage>
      ) : null}

      {screen === 'configured' ? (
        <AcvcStage
          variant="console"
          title="Policy configured — Read Channels and Write to Channels alongside the file actions"
          note="The whole authoring surface is inherited. Read Channels and Write to Channels are two more rows in a table that already exists. Write to Channels states the dependency in its description: it has no effect without Read Channels. Write to Channels saves with the generic file-policy dialog — denial is visible (read-only composer), so it does not get a blast-radius confirmation."
        >
          <AcvcConsoleFrame>
            <PolicyDetail />
          </AcvcConsoleFrame>
        </AcvcStage>
      ) : null}

      {/* Net-new design: no save confirmation states the blast radius today. */}
      {screen === 'confirm' ? (
        <AcvcStage
          variant="console"
          title="Save confirmation — blast radius stated plainly"
          note="A distinct confirmation for policies containing Read Channels. The generic file-policy save dialog is not enough here: this one hides content workspace-wide and the affected users are never told. REQUIREMENT, not current behaviour — neither shipped PR writes an audit record for a Read Channels denial, so 'recoverable from the audit log' is a dependency this design takes on, not a fact the dialog can state today."
        >
          <AcvcConsoleFrame>
            <div className={styles['authoring__overlay-host']}>
              <PolicyDetail />
              <div className={styles['authoring__overlay']}>
                <Modal
                  size="small"
                  title="Save this policy?"
                  footer={
                    <>
                      <Button emphasis="tertiary">Cancel</Button>
                      <Button emphasis="primary">Save policy</Button>
                    </>
                  }
                >
                  <div className={styles['authoring__confirm']}>
                    <p>
                      This policy controls <strong>Read Channels</strong> across every channel in the
                      workspace. Write to Channels on the same policy cannot restore access a session
                      does not have.
                    </p>
                    <ul>
                      <li>
                        Any session that does not meet the conditions will stop seeing channels
                        covered by this policy.
                      </li>
                      <li>
                        Affected users are not told why, and cannot report the problem themselves.
                      </li>
                      {/*
                        The bullet that used to read "Denials are recorded in the
                        audit log only" was removed: it stated audit logging as
                        fact, and neither shipped PR implements audit logging for
                        this action. The dependency now lives in the stage caption
                        outside the product surface, where unimplemented
                        requirements belong.
                      */}
                    </ul>
                    <p className={styles['authoring__muted']}>
                      {/* Points at the editor's real trigger, labelled
                          "Simulate rules" per shipped
                          admin.permission_policies.editor.simulate_rules. */}
                      Run Simulate rules first if you have not confirmed who this affects.
                    </p>
                  </div>
                </Modal>
              </div>
            </div>
          </AcvcConsoleFrame>
        </AcvcStage>
      ) : null}
    </div>
  );
}
