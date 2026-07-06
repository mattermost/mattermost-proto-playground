import type { ReactNode } from 'react';
import { useId } from 'react';
import Switch from '@/components/ui/Switch/Switch';
import Checkbox from '@/components/ui/Checkbox/Checkbox';
import Radio from '@/components/ui/Radio/Radio';
import InfoHint from '../InfoHint/InfoHint';
import WhoCanSetEditor from './WhoCanSetEditor';
import {
  channelBinding,
  channelDisplayIncludes,
  isChannelDisplayHidden,
  isSourceOwned,
  postDisplayIncludes,
  postDisplayLabel,
  POST_DISPLAY_LOCATIONS,
  readIntoActive,
  readIntoForced,
  resolveInheritMode,
  supportsChannelBanner,
  teamBinding,
  type HubAttribute,
  type InheritMode,
  type ResourceConfig,
  type UserProfileDisplay,
  type DisplayWhere,
  type PostDisplayLoc,
} from '../../hubData';
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
}

interface FieldProps {
  label: string;
  hint?: ReactNode;
  children: ReactNode;
  layout?: 'default' | 'simplified';
}

function Field({ label, hint, children, layout = 'default' }: FieldProps) {
  const hintBelowControl = layout === 'simplified';

  return (
    <div className={styles['field']}>
      <div className={styles['field__head']}>
        <span className={styles['field__label']}>{label}</span>
        {hint != null && !hintBelowControl && (
          <div className={styles['field__hint']}>{hint}</div>
        )}
      </div>
      <div className={styles['field__control']}>
        {children}
        {hint != null && hintBelowControl && (
          <div className={styles['field__hint']}>{hint}</div>
        )}
      </div>
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
  readIntoLocked,
  onChange,
}: {
  value: ValueVisibility;
  readIntoLocked: boolean;
  onChange: (next: ValueVisibility) => void;
}) {
  const groupName = useId();

  return (
    <div
      className={styles['value-visibility']}
      role="radiogroup"
      aria-label="Value visibility"
    >
      {VALUE_VISIBILITY_OPTIONS.map((opt) => {
        const disabled = readIntoLocked && opt.key === 'show-all';
        return (
          <Radio
            key={opt.key}
            className={styles['value-visibility__radio']}
            name={groupName}
            value={opt.key}
            size="Medium"
            checked={value === opt.key}
            disabled={disabled}
            onChange={() => {
              if (!disabled) onChange(opt.key);
            }}
          >
            {opt.label}
          </Radio>
        );
      })}
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

function togglePostLocation(
  current: DisplayWhere[] | undefined,
  loc: PostDisplayLoc,
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
}: {
  attribute: HubAttribute;
  value: DisplayWhere[] | undefined;
  onChange: (next: DisplayWhere[]) => void;
}) {
  const bannerSupported = supportsChannelBanner(attribute);

  return (
    <div
      className={styles['display-locations']}
      role="group"
      aria-label="Display locations"
    >
      <Checkbox
          size="Small"
          checked={channelDisplayIncludes(value, 'Header')}
          onChange={() => onChange(toggleChannelLocation(value, 'Header'))}
        >
          Header
        </Checkbox>
        <Checkbox
          size="Small"
          checked={channelDisplayIncludes(value, 'Sidebar')}
          onChange={() => onChange(toggleChannelLocation(value, 'Sidebar'))}
        >
          Sidebar
        </Checkbox>
        {bannerSupported && (
          <Checkbox
            size="Small"
            checked={channelDisplayIncludes(value, 'Banner')}
            onChange={() => onChange(toggleChannelLocation(value, 'Banner'))}
          >
            Banner
          </Checkbox>
        )}
    </div>
  );
}

function PostDisplaySelect({
  value,
  onChange,
}: {
  value: DisplayWhere[] | undefined;
  onChange: (next: DisplayWhere[]) => void;
}) {
  return (
    <div
      className={styles['display-locations']}
      role="group"
      aria-label="Display locations"
    >
      {POST_DISPLAY_LOCATIONS.map((loc) => (
        <Checkbox
          key={loc}
          size="Small"
          checked={postDisplayIncludes(value, loc)}
          onChange={() => onChange(togglePostLocation(value, loc))}
        >
          {postDisplayLabel(loc)}
        </Checkbox>
      ))}
    </div>
  );
}

function postInheritFromChannelReflection(mode: InheritMode): string {
  switch (mode) {
    case 'inherit-lock':
      return 'Locked to the channel’s value.';
    case 'inherit':
      return 'Inherits from the channel. Authors can lower but not raise it.';
    default:
      return 'Not inherited. Set independently on each post.';
  }
}

function channelInheritFromTeamReflection(mode: InheritMode): string {
  switch (mode) {
    case 'inherit-lock':
      return 'Locked to the team’s value.';
    case 'inherit':
      return 'Inherits from the team. Channel admins can lower but not raise it.';
    default:
      return 'Not inherited. Set independently on each channel.';
  }
}

const INHERIT_MODE_OPTIONS: Array<{ key: InheritMode; label: string }> = [
  { key: 'off', label: 'Off' },
  { key: 'inherit', label: 'Inherit' },
  { key: 'inherit-lock', label: 'Inherit + lock' },
];

export default function ResourceConfigPanel({
  attribute,
  config,
  onChange,
  onReadIntoFilteringChange,
  whoCanSetSlot,
  layout = 'default',
}: ResourceConfigPanelProps) {
  const sourceOwned = isSourceOwned(attribute);
  const isUsers = config.resource === 'Users';
  const isChannels = config.resource === 'Channels';
  const isPosts = config.resource === 'Posts';
  const isTeams = config.resource === 'Teams';
  const channelCfg = channelBinding(attribute);
  const channelInherit: InheritMode = channelCfg
    ? resolveInheritMode(channelCfg)
    : 'off';
  const teamConfig = teamBinding(attribute);
  const teamInherit: InheritMode = teamConfig
    ? resolveInheritMode(teamConfig)
    : 'off';
  const readIntoLocked = readIntoForced(attribute);
  const showReadIntoReflection = !isUsers && readIntoActive(attribute);

  return (
    <div
      className={[
        styles['panel'],
        layout === 'simplified' ? styles['panel--simplified'] : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {!isUsers && (
        <Field
          layout={layout}
          label="Required"
          hint="The resource must have a value before it can be created or saved."
        >
          <Switch
            size="Small"
            checked={config.required}
            disabled={sourceOwned}
            onChange={(e) => onChange({ required: e.target.checked })}
          >
            {config.required ? 'On' : 'Off'}
          </Switch>
        </Field>
      )}

      {isUsers && (
        <Field layout={layout} label="Profile display">
          <Segmented<UserProfileDisplay>
            value={config.userProfileDisplay ?? 'hide-empty'}
            ariaLabel="Profile display"
            options={[
              { key: 'always', label: 'Always show' },
              { key: 'hide-empty', label: 'Hide when empty' },
            ]}
            onChange={(next) => onChange({ userProfileDisplay: next })}
          />
        </Field>
      )}

      {isUsers && (
        <Field
          layout={layout}
          label="Value visibility"
          hint={
            <>
              When restricted, users only see their own assigned value. Other
              values are hidden in profiles, pickers, and everywhere this
              attribute appears.
              {readIntoLocked && (
                <p className={styles['note']}>
                  Required for {attribute.source.system}-synced values — this
                  setting can&apos;t be turned off.
                </p>
              )}
            </>
          }
        >
          <ValueVisibilityRadios
            value={
              attribute.readIntoFiltering ? 'hide-not-read-in' : 'show-all'
            }
            readIntoLocked={readIntoLocked}
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

      {isChannels && teamConfig && (
        <Field layout={layout} label="Inheritance from team">
          <span className={styles['reflection']}>
            {channelInheritFromTeamReflection(teamInherit)}
          </span>
        </Field>
      )}

      {isChannels && (
        <Field
          layout={layout}
          label="Display location"
          hint={
            <>
              Multiple locations can be selected. Uncheck all to hide.
              {!isChannelDisplayHidden(config.showWhere) &&
                channelDisplayIncludes(config.showWhere, 'Banner') && (
                  <p className={styles['note']}>
                    Shown as a banner at the top of the channel.
                  </p>
                )}
            </>
          }
        >
          <ChannelDisplaySelect
            attribute={attribute}
            value={config.showWhere}
            onChange={(next) => onChange({ showWhere: next })}
          />
        </Field>
      )}

      {isChannels && (
        <Field
          layout={layout}
          label="Inherit to posts"
          hint={
            <span className={styles['field__hint-row']}>
              <span>
                Posts inherit the channel’s value and can’t be set higher than
                it.
              </span>
              <InfoHint
                label="The ceiling rule"
                hint="Example: a post in a Protected B channel can be Protected B or lower, never higher."
              >
                <span className={styles['help-link']}>What’s this?</span>
              </InfoHint>
            </span>
          }
        >
          <Segmented<InheritMode>
            value={resolveInheritMode(config)}
            ariaLabel="Inherit to posts"
            options={INHERIT_MODE_OPTIONS}
            onChange={(next) =>
              onChange({ inheritMode: next, inheritToChild: undefined })
            }
          />
        </Field>
      )}

      {isTeams && (
        <Field
          layout={layout}
          label="Inherit to channels"
          hint={
            <span className={styles['field__hint-row']}>
              <span>
                Channels inherit the team’s value and can’t be set higher than
                it.
              </span>
              <InfoHint
                label="The ceiling rule"
                hint="Example: a channel in a Protected B team can be Protected B or lower, never higher."
              >
                <span className={styles['help-link']}>What’s this?</span>
              </InfoHint>
            </span>
          }
        >
          <Segmented<InheritMode>
            value={resolveInheritMode(config)}
            ariaLabel="Inherit to channels"
            options={INHERIT_MODE_OPTIONS}
            onChange={(next) =>
              onChange({ inheritMode: next, inheritToChild: undefined })
            }
          />
        </Field>
      )}

      {isPosts && (
        <Field layout={layout} label="Inheritance from channel">
          <span className={styles['reflection']}>
            {postInheritFromChannelReflection(channelInherit)}
          </span>
        </Field>
      )}

      {isPosts && (
        <Field
          layout={layout}
          label="Display location"
          hint={
            <>
              Multiple locations can be selected. Uncheck all to hide.
              {!isChannelDisplayHidden(config.showWhere) &&
                postDisplayIncludes(config.showWhere, 'Composer') && (
                  <p className={styles['note']}>
                    Shown in the message input while composing a post.
                  </p>
                )}
              {!isChannelDisplayHidden(config.showWhere) &&
                postDisplayIncludes(config.showWhere, 'Header') && (
                  <p className={styles['note']}>
                    Shown on the message in the channel timeline.
                  </p>
                )}
            </>
          }
        >
          <PostDisplaySelect
            value={config.showWhere}
            onChange={(next) => onChange({ showWhere: next })}
          />
        </Field>
      )}

      {whoCanSetSlot != null ? (
        <Field
          layout={layout}
          label="Who can set the value"
          hint="Multiple roles can be selected."
        >
          <div className={styles['combobox-slot']}>{whoCanSetSlot}</div>
        </Field>
      ) : (
        <WhoCanSetEditor
          attribute={attribute}
          config={config}
          onChange={onChange}
        />
      )}
    </div>
  );
}
