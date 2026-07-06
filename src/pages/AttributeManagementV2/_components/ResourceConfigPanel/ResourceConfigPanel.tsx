import { type ReactNode } from 'react';
import Switch from '@/components/ui/Switch/Switch';
import HelpPopover from '../HelpPopover/HelpPopover';
import DisabledControl from '../DisabledControl/DisabledControl';
import {
  type Attribute,
  type ResourceBinding,
  type DisplayLocationOption,
  type DisplayLocations,
  type InheritMode,
  type UserDisplay,
  DISABLED_REASONS,
  HELP_COPY,
  normalizeDisplayLocations,
  isDisplayHidden,
  displayIncludes,
  toggleDisplayLocation,
  setDisplayHidden,
  clearDisplayHidden,
} from '../../data';
import styles from './ResourceConfigPanel.module.scss';

export interface ResourceConfigPanelProps {
  attribute: Attribute;
  binding: ResourceBinding;
  /** Persist a change to this binding back into page state. */
  onChange?: (next: Partial<ResourceBinding>) => void;
}

interface FieldProps {
  label: string;
  hint?: ReactNode;
  children: ReactNode;
}

function Field({ label, hint, children }: FieldProps) {
  return (
    <div className={styles['field']}>
      <div className={styles['field__head']}>
        <span className={styles['field__label']}>{label}</span>
        {hint != null && <span className={styles['field__hint']}>{hint}</span>}
      </div>
      <div className={styles['field__control']}>{children}</div>
    </div>
  );
}

function ReadonlyPill({ children }: { children: ReactNode }) {
  return <span className={styles['pill']}>{children}</span>;
}

/** Segmented control. Each option becomes a radio-like button. */
function Segmented<T extends string>({
  value,
  options,
  ariaLabel,
  onChange,
  disabledKeys,
  disabledReason,
}: {
  value: T;
  options: { key: T; label: string; disabled?: boolean; reason?: string }[];
  ariaLabel: string;
  onChange: (next: T) => void;
  disabledKeys?: T[];
  disabledReason?: string;
}) {
  return (
    <div className={styles['seg']} role="radiogroup" aria-label={ariaLabel}>
      {options.map((opt) => {
        const isDisabled =
          opt.disabled || (disabledKeys?.includes(opt.key) ?? false);
        const active = value === opt.key;
        if (isDisabled) {
          return (
            <span key={opt.key} className={styles['seg__disabled']}>
              <DisabledControl
                reason={opt.reason ?? disabledReason ?? ''}
                glyph="info"
              >
                <span className={styles['seg__btn']}>{opt.label}</span>
              </DisabledControl>
            </span>
          );
        }
        return (
          <button
            key={opt.key}
            type="button"
            role="radio"
            aria-checked={active}
            className={`${styles['seg__btn']} ${active ? styles['seg__btn--active'] : ''}`}
            onClick={() => onChange(opt.key)}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

/** Multi-select segmented control for display locations. Sidebar is always on. */
function DisplayLocationMultiSelect({
  value,
  isClassificationType,
  onChange,
}: {
  value: DisplayLocations | undefined;
  isClassificationType: boolean;
  onChange: (next: DisplayLocations) => void;
}) {
  const hidden = isDisplayHidden(value);
  const normalized = normalizeDisplayLocations(value);

  const toggle = (loc: DisplayLocationOption) => {
    if (hidden) {
      onChange(toggleDisplayLocation(['Sidebar'], loc));
      return;
    }
    onChange(toggleDisplayLocation(normalized, loc));
  };

  return (
    <div className={styles['seg']} role="group" aria-label="Display location">
      <button
        type="button"
        role="checkbox"
        aria-checked={!hidden && displayIncludes(normalized, 'Header')}
        className={`${styles['seg__btn']} ${!hidden && displayIncludes(normalized, 'Header') ? styles['seg__btn--active'] : ''}`}
        onClick={() => toggle('Header')}
      >
        Header
      </button>
      <span className={styles['seg__locked']}>
        <DisabledControl reason="Sidebar is always shown. Turn on Hidden to suppress all display.">
          <span
            className={`${styles['seg__btn']} ${!hidden ? styles['seg__btn--active'] : ''} ${styles['seg__btn--locked']}`}
            aria-disabled
          >
            Sidebar
          </span>
        </DisabledControl>
      </span>
      {isClassificationType ? (
        <button
          type="button"
          role="checkbox"
          aria-checked={!hidden && displayIncludes(normalized, 'Banner')}
          className={`${styles['seg__btn']} ${!hidden && displayIncludes(normalized, 'Banner') ? styles['seg__btn--active'] : ''}`}
          onClick={() => toggle('Banner')}
        >
          Banner
        </button>
      ) : (
        <span className={styles['seg__disabled']}>
          <DisabledControl reason={DISABLED_REASONS.bannerClassificationOnly}>
            <span className={styles['seg__btn']}>Banner</span>
          </DisabledControl>
        </span>
      )}
      <button
        type="button"
        role="checkbox"
        aria-checked={hidden}
        className={`${styles['seg__btn']} ${hidden ? styles['seg__btn--active'] : ''}`}
        onClick={() =>
          onChange(hidden ? clearDisplayHidden(value) : setDisplayHidden())
        }
      >
        Hidden
      </button>
    </div>
  );
}

/**
 * Per-resource config matrix (§7). Renders ONLY the controls valid for the
 * resource, and they all WORK — changes persist in page state and show their
 * effect live (e.g. the Posts panel reflects the channel's inherit mode).
 */
export default function ResourceConfigPanel({
  attribute,
  binding,
  onChange,
}: ResourceConfigPanelProps) {
  const isUsers = binding.resource === 'Users';
  const isChannels = binding.resource === 'Channels';
  const isPosts = binding.resource === 'Posts';
  const isTeams = binding.resource === 'Teams';

  const canUseBanner = attribute.id === 'classification';

  // Posts read-only reflection is derived from the channel's inherit mode.
  const channelBinding = attribute.appliesTo.find(
    (b) => b.resource === 'Channels',
  );
  const channelInherit: InheritMode = channelBinding?.inheritMode ?? 'off';

  return (
    <div className={styles['panel']}>
      {/* Required — Channels / Posts / Teams */}
      {!isUsers && (
        <Field
          label="Required"
          hint="The resource must have a value before it can be created or saved."
        >
          <Switch
            checked={!!binding.required}
            onChange={(e) =>
              onChange?.({
                required: (e.target as HTMLInputElement).checked,
              })
            }
            semiBold
          >
            {binding.required ? 'On' : 'Off'}
          </Switch>
        </Field>
      )}

      {/* Users display — segmented, selectable */}
      {isUsers && (
        <Field label="Profile display">
          <Segmented<UserDisplay>
            value={binding.userDisplay ?? 'hide-empty'}
            ariaLabel="Profile display"
            options={[
              { key: 'show', label: 'Always show' },
              { key: 'hide-empty', label: 'Hide when empty' },
            ]}
            onChange={(next) => onChange?.({ userDisplay: next })}
          />
        </Field>
      )}

      {/* Channels display location — selectable; Banner gated to Ranked */}
      {isChannels && (
        <Field label="Display location">
          <DisplayLocationMultiSelect
            value={binding.displayLocations}
            isClassificationType={canUseBanner}
            onChange={(next) => onChange?.({ displayLocations: next })}
          />
          {!isDisplayHidden(binding.displayLocations) &&
            displayIncludes(binding.displayLocations, 'Banner') && (
            <p className={styles['note']}>
              Shown as a banner at the top of the channel.
            </p>
          )}
        </Field>
      )}

      {/* Channels → posts inheritance — 3-state with ceiling explanation */}
      {isChannels && (
        <Field
          label="Inherit to posts"
          hint={
            <span className={styles['field__hint-row']}>
              <span>
                Posts inherit the channel’s value and can’t be set higher than
                it.
              </span>
              <HelpPopover
                triggerLabel="What’s this?"
                title="The ceiling rule"
                body={HELP_COPY.ceiling}
                example="Example: a post in a Secret channel can be Secret or lower, never Top Secret."
              />
            </span>
          }
        >
          <Segmented<InheritMode>
            value={binding.inheritMode ?? 'off'}
            ariaLabel="Inherit to posts"
            options={[
              { key: 'off', label: 'Off' },
              { key: 'inherit', label: 'Inherit' },
              { key: 'inherit-lock', label: 'Inherit + lock' },
            ]}
            onChange={(next) => onChange?.({ inheritMode: next })}
          />
        </Field>
      )}

      {/* Posts inheritance — read-only reflection of the channel setting */}
      {isPosts && (
        <Field label="Inheritance from channel">
          <span className={styles['reflection']}>
            {channelInherit === 'inherit-lock'
              ? 'Locked to the channel’s value.'
              : channelInherit === 'inherit'
                ? 'Inherits from the channel. Authors can lower but not raise it.'
                : 'Not inherited. Set independently on each post.'}
          </span>
        </Field>
      )}

      {/* Who sets — read-only role chip for every resource */}
      <Field label="Who sets the value">
        <ReadonlyPill>{whoSets(binding, attribute, isUsers)}</ReadonlyPill>
      </Field>

      {/* Teams have no extra controls beyond required + who-sets */}
      {isTeams && null}
    </div>
  );
}

/** Users who-sets reflects the live self-edit state. */
function whoSets(
  binding: ResourceBinding,
  attribute: Attribute,
  isUsers: boolean,
): string {
  if (isUsers) {
    if (attribute.externallyOwned && binding.whoSets) return binding.whoSets;
    return attribute.selfEdit ? 'Members' : 'System admin';
  }
  return binding.whoSets;
}
