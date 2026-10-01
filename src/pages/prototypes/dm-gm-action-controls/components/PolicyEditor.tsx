// [AI DRAFT] The Permission Policy editor with the DM/GM additions.
//
// Direction A is this editor on its own. Direction B places a summary strip
// above it and arrives here pre-filled from a starting rule. Layout, card order
// and shipped strings follow the Access Channel port's AuthoringScene
// (admin.permission_policies.edit.*); the DM/GM changes are:
//   - the acting-user table ("Acting user": user + session attributes);
//   - grouped "+ Add permission" menu with three DM/GM rows;
//   - a "Who they can message" card (other person, user attributes only) shown
//     once a DM/GM permission is in the policy;
//   - an inline block on adding non-DM/GM permissions while other-person
//     conditions exist;
//   - the missing-attribute note under the other-person table.
import {
  Fragment,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import AccountOutlineIcon from '@mattermost/compass-icons/components/account-outline';
import ChevronDownIcon from '@mattermost/compass-icons/components/chevron-down';
import ChevronLeftIcon from '@mattermost/compass-icons/components/chevron-left';
import InformationOutlineIcon from '@mattermost/compass-icons/components/information-outline';
import LaptopIcon from '@mattermost/compass-icons/components/laptop';
import TextShortIcon from '@mattermost/compass-icons/components/text-short';
import TrashCanOutlineIcon from '@mattermost/compass-icons/components/trash-can-outline';
import { Button } from '@mattermost/compass-ui/components/button';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { IconButton } from '@mattermost/compass-ui/components/icon-button';
import { MenuGroupHeading } from '@mattermost/compass-ui/components/menu-group-heading';
import { MenuItem } from '@mattermost/compass-ui/components/menu-item';
import { PopoverMenu } from '@mattermost/compass-ui/components/popover-menu';
import { SectionNotice } from '@mattermost/compass-ui/components/section-notice';
import { Select } from '@mattermost/compass-ui/components/select';
import { TextInput } from '@mattermost/compass-ui/components/text-input';
import { useOutsideClose } from '@/hooks/useOutsideClose';
import {
  SESSION_ATTRIBUTES,
  USER_ATTRIBUTES,
  isSessionAttribute,
  valuesFor,
  type AttributeKey,
  type UserAttributeKey,
} from '../dmgmData';
import {
  DM_PERMISSIONS,
  DM_PERMISSION_ORDER,
  CHANNEL_PERMISSIONS,
  FILE_PERMISSIONS,
  nextConditionId,
  type ActingCondition,
  type DmPermission,
  type DmPolicy,
  type Operator,
  type OtherCondition,
} from '../policyModel';
import {
  ACTING_LABEL,
  COMPARISON,
  EDITOR,
  MATCH,
  PICKER,
  TARGET_LABEL,
} from '../copy';
import MatchControl from './MatchControl';
import InlineConditions from './InlineConditions';
import styles from './PolicyEditor.module.scss';

const OPERATORS: Operator[] = ['is', 'is not'];
const SAME_VALUE = '__same__';

export interface PolicyEditorProps {
  policy: DmPolicy;
  onChange: (next: DmPolicy) => void;
  /** Direction B's summary strip, shown above the cards. */
  summary?: ReactNode;
  /** Open the "+ Add permission" menu on mount. */
  initialPickerOpen?: boolean;
  onSimulate?: () => void;
  /** Scroll the console to this section on mount, so the screen under review is in view. */
  scrollTo?: 'acting' | 'permissions' | 'other';
  /**
   * How other-person conditions are authored. `inline` (primary): rows in the
   * shipped requirements table. `card` (secondary): a separate "Who they can
   * message" card. The rest of the editor is identical.
   */
  variant?: EditorVariant;
  /** Inline variant only: open the requirements in Advanced mode. */
  initialAdvanced?: boolean;
}

export type EditorVariant = 'inline' | 'card';

function PageHeader() {
  return (
    <header className={styles['policy-editor__page-header']}>
      <button
        type="button"
        className={styles['policy-editor__back']}
        aria-label="Back"
      >
        <Icon glyph={<ChevronLeftIcon />} size="24" />
      </button>
      {/* Shipped admin.permission_policies.edit.title */}
      <h1 className={styles['policy-editor__page-title']}>
        Attribute Based Permission Policy
      </h1>
    </header>
  );
}

function InfoBanner() {
  return (
    <div className={styles['policy-editor__banner']}>
      <Icon glyph={<InformationOutlineIcon />} size="20" />
      <div>
        <p className={styles['policy-editor__banner-title']}>
          The permissions defined in this policy override the{' '}
          <a
            className={styles['policy-editor__banner-link']}
            href="#permission-schemes"
          >
            system permission schemes
          </a>{' '}
          when its conditions are met
        </p>
        <p className={styles['policy-editor__banner-body']}>
          Permissions evaluation order: Permission policies (evaluated first) →
          System scheme / Team override scheme (fallback when no policy
          applies).
        </p>
      </div>
    </div>
  );
}

function Card({
  title,
  subtitle,
  section,
  children,
}: {
  title: string;
  subtitle?: string;
  section?: string;
  children: ReactNode;
}) {
  return (
    <section
      className={styles['policy-editor__card']}
      data-dmgm-section={section}
    >
      <div className={styles['policy-editor__card-header']}>
        <div className={styles['policy-editor__card-heading']}>
          <h2 className={styles['policy-editor__card-title']}>{title}</h2>
          {subtitle ? (
            <p className={styles['policy-editor__card-subtitle']}>{subtitle}</p>
          ) : null}
        </div>
        <IconButton
          size="small"
          icon={<Icon glyph={<ChevronDownIcon />} size="16" />}
          aria-label={`Collapse ${title}`}
        />
      </div>
      <div className={styles['policy-editor__card-body']}>{children}</div>
    </section>
  );
}

function DeleteRowButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <IconButton
      size="small"
      destructive
      icon={<Icon glyph={<TrashCanOutlineIcon />} size="16" />}
      aria-label={label}
      onClick={onClick}
    />
  );
}

function AttributeName({ attribute }: { attribute: AttributeKey }) {
  return (
    <span className={styles['policy-editor__cell-icon-text']}>
      <Icon
        glyph={
          isSessionAttribute(attribute) ? <LaptopIcon /> : <TextShortIcon />
        }
        size="16"
      />
      {attribute}
    </span>
  );
}

function useMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);
  useOutsideClose(ref, open, close);
  return { open, setOpen, ref, close };
}

/** "+ Add attribute" with grouped user and (acting user only) session attributes. */
function AddAttributeButton({
  includeSession,
  onAdd,
}: {
  includeSession: boolean;
  onAdd: (attribute: AttributeKey) => void;
}) {
  const menu = useMenu();
  const userKeys = Object.keys(USER_ATTRIBUTES) as UserAttributeKey[];
  const sessionKeys = Object.keys(SESSION_ATTRIBUTES) as AttributeKey[];
  return (
    <div className={styles['policy-editor__anchor']} ref={menu.ref}>
      <Button
        emphasis="tertiary"
        size="small"
        onClick={() => menu.setOpen((o) => !o)}
      >
        + Add attribute
      </Button>
      {menu.open ? (
        <PopoverMenu className={styles['policy-editor__add-menu']}>
          <MenuGroupHeading label="User attributes" />
          {userKeys.map((key) => (
            <MenuItem
              key={key}
              label={key}
              leadingVisual={<Icon glyph={<TextShortIcon />} />}
              onClick={() => {
                onAdd(key);
                menu.close();
              }}
            />
          ))}
          {includeSession ? (
            <>
              <MenuGroupHeading label="Session attributes" />
              {sessionKeys.map((key) => (
                <MenuItem
                  key={key}
                  label={key}
                  leadingVisual={<Icon glyph={<LaptopIcon />} />}
                  onClick={() => {
                    onAdd(key);
                    menu.close();
                  }}
                />
              ))}
            </>
          ) : null}
        </PopoverMenu>
      ) : null}
    </div>
  );
}

function ActingTable({
  policy,
  onChange,
  onSimulate,
}: {
  policy: DmPolicy;
  onChange: (next: DmPolicy) => void;
  onSimulate?: () => void;
}) {
  const setRow = (id: string, patch: Partial<ActingCondition>) =>
    onChange({
      ...policy,
      acting: policy.acting.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    });

  return (
    <>
      <div
        className={styles['policy-editor__table-head-row']}
        data-dmgm-section="acting"
      >
        <div className={styles['policy-editor__subhead-row']}>
          <h3 className={styles['policy-editor__subhead']}>
            {EDITOR.actingHeading}
          </h3>
          <span className={styles['policy-editor__subhead-hint']}>
            {EDITOR.actingHint}
          </span>
        </div>
        <Button emphasis="secondary" size="small">
          Switch to Advanced Mode
        </Button>
      </div>

      <div className={styles['policy-editor__table-wrap']}>
        <table className={styles['policy-editor__table']}>
          <thead>
            <tr>
              <th>Attribute</th>
              <th>Operator</th>
              <th>Values</th>
              <th className={styles['policy-editor__table-right']}>
                <MatchControl
                  value={policy.match}
                  onChange={(match) => onChange({ ...policy, match })}
                />
              </th>
            </tr>
          </thead>
          <tbody>
            {policy.acting.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className={styles['policy-editor__empty-other']}
                >
                  {EDITOR.actingEmpty}
                </td>
              </tr>
            ) : (
              policy.acting.map((row) => (
                <tr key={row.id}>
                  <td>
                    <AttributeName attribute={row.attribute} />
                  </td>
                  <td>
                    <Select
                      size="small"
                      className={styles['policy-editor__cell-select--narrow']}
                      aria-label={EDITOR.rowAria(
                        ACTING_LABEL,
                        row.attribute,
                        'operator',
                      )}
                      options={OPERATORS.map((o) => ({ value: o, label: o }))}
                      value={row.operator}
                      onChange={(v) =>
                        setRow(row.id, { operator: v as Operator })
                      }
                    />
                  </td>
                  <td>
                    <Select
                      size="small"
                      className={styles['policy-editor__cell-select']}
                      aria-label={EDITOR.rowAria(
                        ACTING_LABEL,
                        row.attribute,
                        'value',
                      )}
                      options={valuesFor(row.attribute).map((v) => ({
                        value: v,
                        label: v,
                      }))}
                      value={row.value}
                      onChange={(v) => setRow(row.id, { value: v })}
                    />
                  </td>
                  <td className={styles['policy-editor__table-right']}>
                    <DeleteRowButton
                      label={EDITOR.removeRowAria(ACTING_LABEL, row.attribute)}
                      onClick={() =>
                        onChange({
                          ...policy,
                          acting: policy.acting.filter((c) => c.id !== row.id),
                        })
                      }
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <div className={styles['policy-editor__table-footer']}>
          <AddAttributeButton
            includeSession
            onAdd={(attribute) =>
              onChange({
                ...policy,
                acting: [
                  ...policy.acting,
                  {
                    id: nextConditionId(),
                    attribute,
                    operator: 'is',
                    value: valuesFor(attribute)[0],
                  },
                ],
              })
            }
          />
        </div>
      </div>

      <div className={styles['policy-editor__table-caption-row']}>
        {/* Shipped admin.permission_policies.edit.who.attributes_subtitle */}
        <p className={styles['policy-editor__muted']}>
          Select attributes and values that users must have for this policy
        </p>
        {/* Shipped admin.permission_policies.editor.simulate_rules */}
        <Button emphasis="tertiary" size="small" onClick={onSimulate}>
          Simulate rules
        </Button>
      </div>
    </>
  );
}

function AudienceCard(props: {
  policy: DmPolicy;
  onChange: (next: DmPolicy) => void;
  onSimulate?: () => void;
  variant: EditorVariant;
  initialAdvanced: boolean;
}) {
  const { variant, initialAdvanced, ...tableProps } = props;
  return (
    <Card
      title="Who this policy applies to"
      subtitle="Define rules based on user attributes and values"
    >
      <label
        className={styles['policy-editor__field-label']}
        htmlFor="dmgm-role"
      >
        Select a role from the predefined list of system roles
      </label>
      <div className={styles['policy-editor__field']}>
        <button
          type="button"
          id="dmgm-role"
          aria-haspopup="listbox"
          aria-expanded={false}
          className={styles['policy-editor__role-trigger']}
        >
          <span className={styles['policy-editor__role-value']}>
            {props.policy.role}
          </span>
          <Icon glyph={<ChevronDownIcon />} size="20" />
        </button>
      </div>
      {variant === 'inline' ? (
        <InlineConditions {...tableProps} initialAdvanced={initialAdvanced} />
      ) : (
        <ActingTable {...tableProps} />
      )}
    </Card>
  );
}

function PermissionPickerMenu({
  policy,
  onAdd,
}: {
  policy: DmPolicy;
  onAdd: (p: DmPermission) => void;
}) {
  const hasOther = policy.other.length > 0;
  const available = DM_PERMISSION_ORDER.filter(
    (p) => !policy.permissions.includes(p),
  );
  return (
    <PopoverMenu
      className={[
        styles['policy-editor__picker-menu'],
        styles['policy-editor__picker-menu--tall'],
      ].join(' ')}
      aria-label="Add permission menu"
    >
      {[
        { key: 'files', heading: PICKER.files, items: FILE_PERMISSIONS },
        {
          key: 'channels',
          heading: PICKER.channels,
          items: CHANNEL_PERMISSIONS,
        },
      ].map((group) => (
        <Fragment key={group.key}>
          <MenuGroupHeading label={group.heading} />
          {hasOther ? (
            <p
              className={styles['policy-editor__menu-notice']}
              id={`dmgm-picker-block-${group.key}`}
            >
              <Icon glyph={<InformationOutlineIcon />} size="16" />
              {EDITOR.pickerBlocked}
            </p>
          ) : null}
          {group.items.map((item) => (
            <MenuItem
              key={item.label}
              label={item.label}
              disabled={hasOther}
              aria-describedby={
                hasOther ? `dmgm-picker-block-${group.key}` : undefined
              }
              secondaryLabel={item.description}
              leadingElement={false}
            />
          ))}
        </Fragment>
      ))}
      {available.length > 0 ? <MenuGroupHeading label={PICKER.dms} /> : null}
      {available.map((p) => (
        <MenuItem
          key={p}
          label={DM_PERMISSIONS[p].label}
          secondaryLabel={DM_PERMISSIONS[p].description}
          leadingElement={false}
          onClick={() => onAdd(p)}
        />
      ))}
    </PopoverMenu>
  );
}

function PermissionsCard({
  policy,
  onChange,
  initialPickerOpen,
}: {
  policy: DmPolicy;
  onChange: (next: DmPolicy) => void;
  initialPickerOpen: boolean;
}) {
  const [open, setOpen] = useState(initialPickerOpen);
  const ref = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);
  useOutsideClose(ref, open, close);
  const rows = DM_PERMISSION_ORDER.filter((p) =>
    policy.permissions.includes(p),
  );

  return (
    <>
      <Card
        section="permissions"
        title="What permissions are modified"
        subtitle="These permissions override the default system permission scheme when policy conditions are met"
      >
        <div className={styles['policy-editor__table-wrap']}>
          <table className={styles['policy-editor__table']}>
            <thead>
              <tr>
                <th>Permission</th>
                {rows.length === 0 ? null : <th>Description</th>}
                {rows.length === 0 ? null : (
                  <th className={styles['policy-editor__table-right']} />
                )}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td className={styles['policy-editor__empty-cell']}>
                    Add a permission to this policy
                  </td>
                </tr>
              ) : (
                rows.map((p) => (
                  <tr key={p}>
                    <td>
                      <span
                        className={styles['policy-editor__permission-name']}
                      >
                        {DM_PERMISSIONS[p].label}
                      </span>
                    </td>
                    <td className={styles['policy-editor__muted']}>
                      {DM_PERMISSIONS[p].description}
                    </td>
                    <td className={styles['policy-editor__table-right']}>
                      <DeleteRowButton
                        label={`Remove ${DM_PERMISSIONS[p].label}`}
                        onClick={() =>
                          onChange({
                            ...policy,
                            permissions: policy.permissions.filter(
                              (x) => x !== p,
                            ),
                          })
                        }
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <div className={styles['policy-editor__table-footer']}>
            <div className={styles['policy-editor__anchor']} ref={ref}>
              <Button
                emphasis="tertiary"
                size="small"
                aria-haspopup="menu"
                aria-expanded={open}
                onClick={() => setOpen((o) => !o)}
              >
                + Add permission
              </Button>
              {open ? (
                <PermissionPickerMenu
                  policy={policy}
                  onAdd={(p) => {
                    onChange({
                      ...policy,
                      permissions: [...policy.permissions, p],
                    });
                    setOpen(false);
                  }}
                />
              ) : null}
            </div>
          </div>
        </div>
      </Card>
      {/* Room for the open menu to scroll fully into view inside the console. */}
      {open ? (
        <div className={styles['policy-editor__menu-runway']} aria-hidden />
      ) : null}
    </>
  );
}

function OtherPersonCard({
  policy,
  onChange,
}: {
  policy: DmPolicy;
  onChange: (next: DmPolicy) => void;
}) {
  const setRow = (id: string, patch: Partial<OtherCondition>) =>
    onChange({
      ...policy,
      other: policy.other.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    });
  const missingAttrs = Array.from(
    new Set(policy.other.map((c) => c.attribute)),
  );

  return (
    <Card
      section="other"
      title={EDITOR.targetCardTitle}
      subtitle={EDITOR.targetCardSubtitle}
    >
      <div className={styles['policy-editor__table-head-row']}>
        <div className={styles['policy-editor__subhead-row']}>
          <h3 className={styles['policy-editor__subhead']}>
            {EDITOR.targetHeading}
          </h3>
          <span className={styles['policy-editor__subhead-hint']}>
            {EDITOR.targetHint}
          </span>
        </div>
      </div>
      {policy.other.length > 0 && policy.acting.length > 0 ? (
        <p className={styles['policy-editor__join-note']}>
          {EDITOR.combinedNote(MATCH[policy.match].toLowerCase())}
        </p>
      ) : null}

      <div className={styles['policy-editor__table-wrap']}>
        <table className={styles['policy-editor__table']}>
          <thead>
            <tr>
              <th>Attribute</th>
              <th>Operator</th>
              <th>Values</th>
              <th className={styles['policy-editor__table-right']} />
            </tr>
          </thead>
          <tbody>
            {policy.other.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className={styles['policy-editor__empty-other']}
                >
                  {EDITOR.targetEmpty}
                </td>
              </tr>
            ) : (
              policy.other.map((row) => (
                <tr key={row.id}>
                  <td>
                    <span className={styles['policy-editor__cell-icon-text']}>
                      <Icon glyph={<AccountOutlineIcon />} size="16" />
                      {row.attribute}
                    </span>
                  </td>
                  <td>
                    <Select
                      size="small"
                      className={styles['policy-editor__cell-select--narrow']}
                      aria-label={EDITOR.rowAria(
                        TARGET_LABEL,
                        row.attribute,
                        'operator',
                      )}
                      options={OPERATORS.map((o) => ({ value: o, label: o }))}
                      value={row.operator}
                      onChange={(v) =>
                        setRow(row.id, { operator: v as Operator })
                      }
                    />
                  </td>
                  <td>
                    <Select
                      size="small"
                      className={styles['policy-editor__cell-select']}
                      aria-label={EDITOR.rowAria(
                        TARGET_LABEL,
                        row.attribute,
                        'value',
                      )}
                      options={[
                        {
                          value: SAME_VALUE,
                          label: COMPARISON.sameAsOption(row.attribute),
                        },
                        ...USER_ATTRIBUTES[row.attribute].map((v) => ({
                          value: v,
                          label: v,
                        })),
                      ]}
                      value={
                        row.value.kind === 'same' ? SAME_VALUE : row.value.value
                      }
                      onChange={(v) =>
                        setRow(row.id, {
                          value:
                            v === SAME_VALUE
                              ? { kind: 'same' }
                              : { kind: 'fixed', value: v },
                        })
                      }
                    />
                  </td>
                  <td className={styles['policy-editor__table-right']}>
                    <DeleteRowButton
                      label={EDITOR.removeRowAria(TARGET_LABEL, row.attribute)}
                      onClick={() =>
                        onChange({
                          ...policy,
                          other: policy.other.filter((c) => c.id !== row.id),
                        })
                      }
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <div className={styles['policy-editor__table-footer']}>
          <AddAttributeButton
            includeSession={false}
            onAdd={(attribute) =>
              onChange({
                ...policy,
                other: [
                  ...policy.other,
                  {
                    id: nextConditionId(),
                    attribute: attribute as UserAttributeKey,
                    operator: 'is',
                    value: { kind: 'same' },
                  },
                ],
              })
            }
          />
        </div>
      </div>

      {missingAttrs.length > 0 ? (
        <div className={styles['policy-editor__missing-note']}>
          <SectionNotice
            type="info"
            title={EDITOR.missingAttribute(missingAttrs)}
          />
        </div>
      ) : null}
    </Card>
  );
}

export default function PolicyEditor({
  policy,
  onChange,
  summary,
  initialPickerOpen = false,
  onSimulate,
  scrollTo,
  variant = 'card',
  initialAdvanced = false,
}: PolicyEditorProps) {
  const hasDmPermission = policy.permissions.length > 0;
  const rootRef = useRef<HTMLDivElement>(null);
  const hasSummary = Boolean(summary);

  // Scroll only the console's own scroll region, never the page around the frame.
  useEffect(() => {
    if (!scrollTo) return;
    const root = rootRef.current;
    const target = root?.querySelector<HTMLElement>(
      `[data-dmgm-section="${scrollTo}"]`,
    );
    const scroller = root?.closest<HTMLElement>('[data-dmgm-scroll]');
    if (!target || !scroller) return;
    const strip = root?.querySelector<HTMLElement>('[data-dmgm-summary]');
    const offset = (strip?.offsetHeight ?? 0) + 24;
    scroller.scrollTop =
      target.getBoundingClientRect().top -
      scroller.getBoundingClientRect().top +
      scroller.scrollTop -
      offset;
  }, [scrollTo, hasSummary]);

  return (
    <div className={styles['policy-editor']} ref={rootRef}>
      <PageHeader />
      <div className={styles['policy-editor__body']}>
        <div className={styles['policy-editor__name-row']}>
          <label
            className={styles['policy-editor__name-label']}
            htmlFor="dmgm-name"
          >
            Access policy name:
          </label>
          <div className={styles['policy-editor__name-field']}>
            <TextInput
              id="dmgm-name"
              value={policy.name}
              placeholder="Add a unique policy name"
              onChange={(e) => onChange({ ...policy, name: e.target.value })}
            />
            <p className={styles['policy-editor__hint']}>
              Give your policy a name that will be used to identify it in the
              policies list.
            </p>
          </div>
        </div>

        {summary ? (
          <div
            className={styles['policy-editor__summary-slot']}
            data-dmgm-summary
          >
            {summary}
          </div>
        ) : null}

        <InfoBanner />
        <AudienceCard
          policy={policy}
          onChange={onChange}
          onSimulate={onSimulate}
          variant={variant}
          initialAdvanced={initialAdvanced}
        />
        <PermissionsCard
          policy={policy}
          onChange={onChange}
          initialPickerOpen={initialPickerOpen}
        />
        {hasDmPermission && variant === 'card' ? (
          <OtherPersonCard policy={policy} onChange={onChange} />
        ) : null}
      </div>
    </div>
  );
}
