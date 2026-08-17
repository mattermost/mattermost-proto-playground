import type { ReactNode } from 'react';
import { useId } from 'react';
import Select from '@/components/ui/Select/Select';
import Switch from '@/components/ui/Switch/Switch';
import Checkbox from '@/components/ui/Checkbox/Checkbox';
import Radio from '@/components/ui/Radio/Radio';
import InfoHint from '../InfoHint/InfoHint';
import WhoCanSetEditor from './WhoCanSetEditor';
import {
  assignableValuesForResource,
  applyDefaultToExistingLabel,
  channelDisplayIncludes,
  defaultValueHint,
  hasInheritanceParent,
  isChannelDisplayHidden,
  readIntoActive,
  readIntoForced,
  resolveInheritMode,
  supportsChannelBanner,
  supportsDefaultBackfill,
  takesValueList,
  unmarkedInstanceCount,
  unmarkedInstanceCountLabel,
  whoCanSetIsEditable,
  type HubAttribute,
  type InheritMode,
  type ResourceConfig,
  type UserProfileDisplay,
  type DisplayWhere,
} from '../../hubData';
import { inheritanceParentLabel } from '@/pages/AttributeHubMVP/_components/mvpTerms';
import styles from './ResourceConfigPanel.module.scss';

export interface ResourceConfigPanelProps {
  attribute: HubAttribute;
  config: ResourceConfig;
  onChange: (next: Partial<ResourceConfig>) => void;
  onReadIntoFilteringChange: (value: boolean) => void;
  /** Override the default WhoCanSetEditor (e.g. simplified hub variant). */
  whoCanSetSlot?: ReactNode;
  /** Simplified hub — Definition-aligned labels and spacing. */
  layout?: 'default' | 'simplified';
  /** Suppress the built-in inherit-from-parent field so the consumer can render
   *  its own inheritance control (e.g. the configurable ceiling) as a sibling. */
  suppressInheritance?: boolean;
  /** Override profile-display segmented options (default: Always show / Hide when empty). */
  userProfileDisplayOptions?: { key: UserProfileDisplay; label: string }[];
  /** Hint under the who-can-set field when `whoCanSetSlot` is provided. Pass `null` to suppress. */
  whoCanSetHint?: string | null;
  /** Channels/Posts — render Required immediately above Default value. */
  adjacentRequiredAndDefault?: boolean;
  /** When Required is on, Default value must be selected (inline error + no None). */
  requireDefaultWhenRequired?: boolean;
  /** Plugin name for read-in / source-controlled copy (MVP shows plugin, not system id). */
  managedByPluginName?: string;
  /**
   * Channel-attributes alignment (walkthrough 2026-08-06): the banner is no
   * longer classification-only, display location is a per-channel default
   * rather than a hard-code, and Required states its locking consequence.
   */
  channelAlignment?: boolean;
  /**
   * "Changing the value" rule for this binding. Rendered after who-can-set on
   * every resource except Users, whose values come from the source system.
   */
  valueEditabilitySlot?: ReactNode;
  /**
   * Inheritance rule for this binding, promoted out of Advanced to a primary
   * field. Renders directly ABOVE "Changing the value" (Design Crit 2026-08-10).
   */
  inheritanceSlot?: ReactNode;
}

interface FieldProps {
  label: string;
  hint?: ReactNode;
  children: ReactNode;
  layout?: 'default' | 'simplified';
  /** Walkthrough deep-link anchor — see `data-tour-focus` convention. */
  focusId?: string;
}

function Field({ label, hint, children, layout = 'default', focusId }: FieldProps) {
  if (layout === 'simplified') {
    return (
      <div
        className={[styles['field'], styles['field--simplified']]
          .filter(Boolean)
          .join(' ')}
        data-tour-focus={focusId}
      >
        <span className={styles['field__label']}>{label}</span>
        <div className={styles['field__control']}>
          {children}
          {hint != null && <div className={styles['field__hint']}>{hint}</div>}
        </div>
      </div>
    );
  }

  return (
    <div className={styles['field']} data-tour-focus={focusId}>
      <div className={styles['field__head']}>
        <span className={styles['field__label']}>{label}</span>
        {hint != null && <div className={styles['field__hint']}>{hint}</div>}
      </div>
      <div className={styles['field__control']}>{children}</div>
    </div>
  );
}

function Segmented<T extends string>({
  value,
  options,
  ariaLabel,
  onChange,
}: {
  value: T;
  options: { key: T; label: string; disabled?: boolean }[];
  ariaLabel: string;
  onChange: (next: T) => void;
}) {
  return (
    <div className={styles['seg']} role="radiogroup" aria-label={ariaLabel}>
      {options.map((opt) => {
        const active = value === opt.key;
        const disabled = opt.disabled ?? false;
        return (
          <button
            key={opt.key}
            type="button"
            role="radio"
            aria-checked={active}
            disabled={disabled}
            className={[
              styles['seg__btn'],
              active ? styles['seg__btn--active'] : '',
              disabled ? styles['seg__btn--disabled'] : '',
            ]
              .filter(Boolean)
              .join(' ')}
            onClick={() => {
              if (!disabled) onChange(opt.key);
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

type ValueVisibility = 'show-all' | 'hide-not-read-in';

const VALUE_VISIBILITY_OPTIONS: { key: ValueVisibility; label: string }[] = [
  { key: 'show-all', label: 'Show all values' },
  {
    key: 'hide-not-read-in',
    label: 'Users only see values they hold themselves',
  },
];

function ValueVisibilityRadios({
  value,
  sourceControlled,
  onChange,
}: {
  value: ValueVisibility;
  sourceControlled: boolean;
  onChange: (next: ValueVisibility) => void;
}) {
  const groupName = useId();

  return (
    <div
      className={styles['value-visibility']}
      role="radiogroup"
      aria-label="Value visibility"
      aria-readonly={sourceControlled || undefined}
    >
      {VALUE_VISIBILITY_OPTIONS.map((opt) => (
        <Radio
          key={opt.key}
          className={styles['value-visibility__radio']}
          name={groupName}
          value={opt.key}
          size="Medium"
          checked={value === opt.key}
          disabled={sourceControlled}
          onChange={() => {
            if (!sourceControlled) onChange(opt.key);
          }}
        >
          {opt.label}
        </Radio>
      ))}
    </div>
  );
}

type ChannelDisplayLoc = 'Header' | 'Sidebar' | 'Banner';

function toggleChannelLocation(
  current: DisplayWhere[] | undefined,
  loc: ChannelDisplayLoc,
): DisplayWhere[] {
  const visible = isChannelDisplayHidden(current)
    ? ([] as DisplayWhere[])
    : (current ?? []).filter((entry) => entry !== 'Hidden');

  const has = visible.includes(loc);
  const next = has
    ? visible.filter((entry) => entry !== loc)
    : [...visible, loc];

  return next.length === 0 ? (['Hidden'] as DisplayWhere[]) : next;
}

function ChannelDisplaySelect({
  attribute,
  value,
  onChange,
  channelAlignment = false,
}: {
  attribute: HubAttribute;
  value: DisplayWhere[] | undefined;
  onChange: (next: DisplayWhere[]) => void;
  channelAlignment?: boolean;
}) {
  // Banner is no longer classification-only — any attribute can reach it.
  const bannerSupported = channelAlignment || supportsChannelBanner(attribute);

  return (
    <div
      className={styles['display-locations']}
      role="group"
      aria-label="Display locations"
    >
      <Checkbox
          checked={channelDisplayIncludes(value, 'Header')}
          onChange={() => onChange(toggleChannelLocation(value, 'Header'))}
        >
          Header
        </Checkbox>
        <Checkbox
          checked={channelDisplayIncludes(value, 'Sidebar')}
          onChange={() => onChange(toggleChannelLocation(value, 'Sidebar'))}
        >
          Sidebar
        </Checkbox>
        {bannerSupported && (
          <Checkbox
            checked={channelDisplayIncludes(value, 'Banner')}
            onChange={() => onChange(toggleChannelLocation(value, 'Banner'))}
          >
            Banner
          </Checkbox>
        )}
    </div>
  );
}

function InheritFromParentField({
  parentLabel,
  parentKind,
  mode,
  layout,
  onChange,
}: {
  parentLabel: string;
  parentKind: 'team' | 'channel';
  mode: InheritMode;
  layout: 'default' | 'simplified';
  onChange: (next: InheritMode) => void;
}) {
  const inheriting = mode !== 'off';
  const locked = mode === 'inherit-lock';
  const ceilingExample =
    parentKind === 'team'
      ? 'a channel in a Protected B team can be Protected B or lower, never higher'
      : 'a post in a Protected B channel can be Protected B or lower, never higher';

  return (
    <Field
      layout={layout}
      label={`Inherit from ${parentLabel}`}
      hint={
        <span className={styles['field__hint-row']}>
          <span>
            {parentKind === 'team'
              ? 'Each channel inherits the team’s value and can’t be set higher than it.'
              : 'Each post inherits the channel’s value and can’t be set higher than it.'}
          </span>
          <InfoHint
            label="The ceiling rule"
            hint={`Example: ${ceilingExample}.`}
          >
            <span className={styles['help-link']}>What’s this?</span>
          </InfoHint>
        </span>
      }
    >
      <div className={styles['inherit-control']}>
        <Segmented<'off' | 'inherit'>
          value={inheriting ? 'inherit' : 'off'}
          ariaLabel={`Inherit from ${parentLabel}`}
          options={[
            { key: 'off', label: 'Off' },
            { key: 'inherit', label: 'On' },
          ]}
          onChange={(next) => {
            if (next === 'off') {
              onChange('off');
              return;
            }
            onChange(locked ? 'inherit-lock' : 'inherit');
          }}
        />
        <Checkbox
          size="Small"
          checked={locked}
          disabled={!inheriting}
          onChange={() => onChange(locked ? 'inherit' : 'inherit-lock')}
        >
          Lock to {parentLabel}&apos;s value
        </Checkbox>
      </div>
    </Field>
  );
}

export default function ResourceConfigPanel({
  attribute,
  config,
  onChange,
  onReadIntoFilteringChange,
  whoCanSetSlot,
  layout = 'default',
  suppressInheritance = false,
  userProfileDisplayOptions,
  whoCanSetHint,
  adjacentRequiredAndDefault: _adjacentRequiredAndDefault = false,
  requireDefaultWhenRequired = false,
  managedByPluginName: managedByPluginNameProp,
  channelAlignment = false,
  valueEditabilitySlot,
  inheritanceSlot,
}: ResourceConfigPanelProps) {
  const profileDisplayOptions = userProfileDisplayOptions ?? [
    { key: 'always' as const, label: 'Always show' },
    { key: 'hide-empty' as const, label: 'Hide when empty' },
  ];
  const resolvedWhoCanSetHint =
    whoCanSetHint === null
      ? undefined
      : whoCanSetHint ?? (whoCanSetSlot ? 'Multiple roles can be selected.' : undefined);
  const isUsers = config.resource === 'Users';
  const isChannels = config.resource === 'Channels';
  const isPosts = config.resource === 'Posts';
  const readIntoSourceControlled = readIntoForced(attribute);
  const sourceControlledLabel =
    managedByPluginNameProp ?? attribute.source.system ?? 'the source';
  const showReadIntoReflection = !isUsers && readIntoActive(attribute);
  const showInheritFromTeam =
    isChannels && hasInheritanceParent(attribute, 'Channels');
  const showInheritFromChannel =
    isPosts && hasInheritanceParent(attribute, 'Posts');
  const assignableValues = takesValueList(attribute)
    ? assignableValuesForResource(attribute, config)
    : [];
  // Required Channels/Posts still need a default (and backfill) even when
  // who-can-set is locked by inheritance — otherwise Classification hides it.
  const showDefaultValue =
    assignableValues.length > 0 &&
    (whoCanSetIsEditable(attribute, config) ||
      (config.required && supportsDefaultBackfill(config.resource)));
  const currentDefaultId = assignableValues.some(
    (v) => v.id === config.defaultValueId,
  )
    ? (config.defaultValueId ?? '')
    : '';
  const defaultValueRequired =
    (requireDefaultWhenRequired || channelAlignment) &&
    config.required &&
    showDefaultValue;
  const defaultValueMissing = defaultValueRequired && !currentDefaultId;
  // Keep Required → Default → backfill together on Channels/Posts.
  const groupRequiredWithDefault = isChannels || isPosts;

  const requiredHint = channelAlignment
    ? isChannels
      ? config.required
        ? 'A value must be set on this channel.'
        : 'Optional — this attribute can still be added to this channel later.'
      : config.required
        ? `A value must be chosen when a ${config.resource.slice(0, -1).toLowerCase()} is created in this channel. Any that exist without one stay locked, and an admin is notified.`
        : `Optional — this attribute can still be added to a ${config.resource.slice(0, -1).toLowerCase()} after it is created.`
    : 'The resource must have a value before it can be created or saved.';

  const requiredField = !isUsers ? (
    <Field
      layout={layout}
      label="Required"
      hint={requiredHint}
      focusId={`${config.resource.toLowerCase()}-required`}
    >
      <Switch
        size="Small"
        checked={config.required}
        onChange={(e) =>
          onChange({
            required: e.target.checked,
            ...(e.target.checked ? {} : { applyDefaultToExisting: false }),
          })
        }
      >
        {config.required ? 'On' : 'Off'}
      </Switch>
    </Field>
  ) : null;

  // Channel settings configure a single channel — backfilling "existing
  // channels" does not apply. Posts-in-this-channel can still backfill.
  const showDefaultBackfill =
    supportsDefaultBackfill(config.resource) &&
    config.required &&
    assignableValues.length > 0 &&
    !(channelAlignment && isChannels);
  const unmarkedCount = showDefaultBackfill
    ? unmarkedInstanceCount(attribute.id, config.resource)
    : 0;
  const backfillEnabled = Boolean(currentDefaultId);
  const resourceNoun = config.resource.toLowerCase();

  const defaultValueField = showDefaultValue ? (
    <Field
      layout={layout}
      label="Default value"
      hint={
        channelAlignment && isChannels
          ? 'Used when this channel has no value set.'
          : showDefaultBackfill
            ? channelAlignment && isPosts
              ? 'Applies to newly created posts in this channel only.'
              : `Applies to newly created ${resourceNoun} only.`
            : defaultValueHint(config.resource)
      }
      focusId={`${config.resource.toLowerCase()}-default-value`}
    >
      <div className={styles['control-slot']}>
        <Select
          className={styles['default-value-select']}
          size="Medium"
          width="fit"
          value={currentDefaultId}
          invalid={defaultValueMissing}
          aria-label="Default value"
          aria-required={defaultValueRequired || undefined}
          onChange={(e) =>
            onChange({
              defaultValueId: e.target.value === '' ? null : e.target.value,
              ...(e.target.value === ''
                ? { applyDefaultToExisting: false }
                : {}),
            })
          }
        >
          {!defaultValueRequired && <option value="">None</option>}
          {defaultValueRequired && !currentDefaultId && (
            <option value="" disabled>
              Select a value…
            </option>
          )}
          {assignableValues.map((value) => (
            <option key={value.id} value={value.id}>
              {value.tier != null
                ? `${value.label} (Tier ${value.tier})`
                : value.label}
            </option>
          ))}
        </Select>
        {defaultValueMissing && (
          <p className={styles['field__error']}>
            Select a default value when Required is on.
          </p>
        )}
      </div>
    </Field>
  ) : null;

  const backfillField = showDefaultBackfill ? (
    <Field
      layout={layout}
      label={
        isChannels
          ? 'Existing channels'
          : channelAlignment
            ? 'Existing posts in this channel'
            : 'Existing posts'
      }
      hint={unmarkedInstanceCountLabel(
        unmarkedCount,
        config.resource,
        attribute.displayName?.trim() || attribute.name,
      )}
      focusId={`${config.resource.toLowerCase()}-apply-existing`}
    >
      <div className={styles['control-slot']}>
        <Checkbox
          size="Medium"
          checked={Boolean(config.applyDefaultToExisting)}
          disabled={!backfillEnabled}
          onChange={(e) =>
            onChange({ applyDefaultToExisting: e.target.checked })
          }
        >
          {channelAlignment && isPosts
            ? 'Apply to previously created posts in this channel'
            : applyDefaultToExistingLabel(config.resource)}
        </Checkbox>
      </div>
    </Field>
  ) : null;

  const whoCanSetField =
    whoCanSetSlot != null ? (
      <Field
        layout={layout}
        label="Who can set the value"
        hint={resolvedWhoCanSetHint}
        focusId={`${config.resource.toLowerCase()}-who-can-set`}
      >
        <div className={styles['combobox-slot']}>{whoCanSetSlot}</div>
      </Field>
    ) : (
      <WhoCanSetEditor
        attribute={attribute}
        config={config}
        onChange={onChange}
      />
    );

  return (
    <div
      className={[
        styles['panel'],
        layout === 'simplified' ? styles['panel--simplified'] : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {!groupRequiredWithDefault && requiredField}

      {groupRequiredWithDefault && (
        <>
          {requiredField}
          {defaultValueField}
          {backfillField}
        </>
      )}

      {isUsers && (
        <Field
          layout={layout}
          label="Profile display"
          focusId="users-profile-display"
        >
          <Segmented<UserProfileDisplay>
            value={config.userProfileDisplay ?? 'hide-empty'}
            ariaLabel="Profile display"
            options={profileDisplayOptions}
            onChange={(next) => onChange({ userProfileDisplay: next })}
          />
        </Field>
      )}

      {isUsers && (
        <Field
          layout={layout}
          label="Value visibility"
          focusId="users-value-visibility"
          hint={
            <>
              When restricted, users only see their own assigned value. Other
              values are hidden in profiles, pickers, and everywhere this
              attribute appears.
              {readIntoSourceControlled && (
                <p className={styles['note']}>
                  Value visibility is configured by {sourceControlledLabel} and
                  shown here for reference, not editable in Mattermost.
                </p>
              )}
            </>
          }
        >
          <ValueVisibilityRadios
            value={
              attribute.readIntoFiltering ? 'hide-not-read-in' : 'show-all'
            }
            sourceControlled={readIntoSourceControlled}
            onChange={(next) =>
              onReadIntoFilteringChange(next === 'hide-not-read-in')
            }
          />
        </Field>
      )}

      {showReadIntoReflection && (
        <Field layout={layout} label="Value visibility">
          <span className={styles['reflection']}>
            Users only see values they hold themselves — configured on the Users
            binding.
          </span>
        </Field>
      )}

      {showInheritFromTeam && !suppressInheritance && !inheritanceSlot && (
        <InheritFromParentField
          parentLabel="team"
          parentKind="team"
          mode={resolveInheritMode(config)}
          layout={layout}
          onChange={(next) =>
            onChange({ inheritMode: next, inheritToChild: undefined })
          }
        />
      )}

      {isChannels && (
        <Field
          layout={layout}
          label={channelAlignment ? 'Default display location' : 'Display location'}
          focusId="channels-display-location"
          hint={
            channelAlignment ? (
              <>
                Multiple locations can be selected. Uncheck all to hide.
                {channelDisplayIncludes(config.showWhere, 'Banner') && (
                  <p className={styles['note']}>
                    Banner attributes are concatenated into one strip at the top
                    of the channel. Channel admins can replace the generated
                    text.
                  </p>
                )}
              </>
            ) : layout === 'simplified' ? (
              'Multiple locations can be selected. Uncheck all to hide.'
            ) : (
              <>
                Multiple locations can be selected. Uncheck all to hide.
                {!isChannelDisplayHidden(config.showWhere) &&
                  channelDisplayIncludes(config.showWhere, 'Banner') && (
                    <p className={styles['note']}>
                      Shown as a banner at the top of the channel.
                    </p>
                  )}
              </>
            )
          }
        >
          <ChannelDisplaySelect
            attribute={attribute}
            value={config.showWhere}
            onChange={(next) => onChange({ showWhere: next })}
            channelAlignment={channelAlignment}
          />
        </Field>
      )}

      {showInheritFromChannel && !suppressInheritance && !inheritanceSlot && (
        <InheritFromParentField
          parentLabel="channel"
          parentKind="channel"
          mode={resolveInheritMode(config)}
          layout={layout}
          onChange={(next) =>
            onChange({ inheritMode: next, inheritToChild: undefined })
          }
        />
      )}

      {inheritanceSlot && !isUsers && (
        <Field
          layout={layout}
          label={`Inherit from ${
            inheritanceParentLabel(config.resource) ?? 'parent'
          }`}
          focusId={`${config.resource.toLowerCase()}-inheritance`}
        >
          <div className={styles['control-slot']}>{inheritanceSlot}</div>
        </Field>
      )}

      {whoCanSetField}

      {valueEditabilitySlot && !isUsers && (
        <Field
          layout={layout}
          label="Changing the value"
          focusId={`${config.resource.toLowerCase()}-value-editability`}
        >
          <div className={styles['control-slot']}>{valueEditabilitySlot}</div>
        </Field>
      )}

      {!groupRequiredWithDefault && defaultValueField}
      {!groupRequiredWithDefault && backfillField}
    </div>
  );
}
