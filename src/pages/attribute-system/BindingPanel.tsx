import { Drawer, Field, ToggleField, SelectField, RadioField } from './controls';
import {
  INHERITANCE_MODE_DESC,
  INHERITANCE_MODE_LABEL,
  appliesToPostsAndChannels,
  MUTABILITY_LABEL,
  VOCABULARY_LABEL,
  WRITE_TIER_LABEL,
} from './data';
import type {
  AttrDef,
  Binding,
  EnforceAt,
  Mutability,
  PostInheritanceMode,
  RequiredMode,
  Vocabulary,
  WriteTier,
} from './data';
import styles from './AttributeSystem.module.scss';

export type Persona = 'sysadmin' | 'teamadmin';

interface BindingPanelProps {
  def: AttrDef;
  binding: Binding;
  persona: Persona;
  onChange: (next: Binding) => void;
  /** When configuring Channels for a channel+post attribute, mirror post inheritance. */
  postBinding?: Binding;
  onPostBindingChange?: (next: Binding) => void;
  onClose: () => void;
}

const MUTABILITY_OPTIONS = (Object.keys(MUTABILITY_LABEL) as Mutability[]).map(
  (v) => ({ value: v, label: MUTABILITY_LABEL[v] }),
);
const VOCAB_OPTIONS = (Object.keys(VOCABULARY_LABEL) as Vocabulary[]).map(
  (v) => ({ value: v, label: VOCABULARY_LABEL[v] }),
);
const WHO_OPTIONS: { value: WriteTier; label: string }[] = (
  ['sysadmin', 'admin', 'member', 'owner'] as WriteTier[]
).map((v) => ({ value: v, label: WRITE_TIER_LABEL[v] }));

/**
 * The "binding" drill-in — the net-new per-resource-type configuration surface
 * that the current mockups lack. Opened from "Applies to → {Resource}".
 */
export default function BindingPanel({
  def,
  binding,
  persona,
  onChange,
  postBinding,
  onPostBindingChange,
  onClose,
}: BindingPanelProps) {
  const set = (patch: Partial<Binding>) => onChange({ ...binding, ...patch });

  // Team admins consume restrictions; they may only tighten delegated bindings.
  const isTeam = persona === 'teamadmin';
  const lockGovernance = isTeam; // vocabulary / mutability / who / delegate
  const lockBehavior = isTeam && !binding.delegable; // required / display
  const dualChannelPost = appliesToPostsAndChannels(def);

  const valueOptions = [
    { value: '', label: 'No default' },
    ...def.values.map((v) => ({ value: v.id, label: v.label })),
  ];

  return (
    <Drawer
      eyebrow={`Binding · ${def.name} on ${binding.resource}`}
      title={`Configure on ${binding.resource}`}
      onClose={onClose}
      saveLabel="Done"
    >
      <SelectField<RequiredMode>
        label="Required"
        help={`Whether a ${binding.resource.toLowerCase().replace(/s$/, '')} must carry a value.`}
        mapNote="binding axis · not in tech spec — new"
        value={binding.required}
        locked={lockBehavior}
        options={[
          { value: 'Optional', label: 'Optional' },
          { value: 'Required', label: 'Required' },
        ]}
        onChange={(required) => set({ required })}
      />

      {binding.required === 'Required' && (
        <SelectField<EnforceAt>
          label="Enforce at"
          help="When the requirement is checked."
          value={binding.enforceAt}
          locked={lockBehavior}
          options={[
            { value: 'create', label: 'At creation — block save' },
            { value: 'before-use', label: 'Before first use — warn' },
          ]}
          onChange={(enforceAt) => set({ enforceAt })}
        />
      )}

      <SelectField
        label="Default value"
        help="Applied automatically to new resources."
        value={binding.defaultValueId ?? ''}
        locked={lockBehavior}
        options={valueOptions}
        onChange={(id) => set({ defaultValueId: id === '' ? null : id })}
      />

      <ToggleField
        label="Show value in channel header"
        help="Display the assigned value inline in the channel header."
        mapNote="binding axis · display — new"
        checked={binding.showInHeader}
        locked={lockBehavior}
        onChange={(showInHeader) => set({ showInHeader })}
      />

      <ToggleField
        label="Show when empty"
        help="Render a placeholder when no value is set (vs. hiding the field)."
        checked={binding.showWhenEmpty}
        locked={lockBehavior}
        onChange={(showWhenEmpty) => set({ showWhenEmpty })}
      />

      <SelectField<Vocabulary>
        label="Vocabulary"
        help="Whether resource admins may introduce new option values."
        mapNote="maps to write.option (closed = owner/sysadmin)"
        value={binding.vocabulary}
        locked={lockGovernance}
        options={VOCAB_OPTIONS}
        onChange={(vocabulary) => set({ vocabulary })}
      />

      <SelectField<Mutability>
        label="Value editability after set"
        help="Whether an assigned value may change, and how."
        mapNote="binding axis · new (write.value sets who)"
        value={binding.mutability}
        locked={lockGovernance}
        options={MUTABILITY_OPTIONS}
        onChange={(mutability) => set({ mutability })}
      />

      <SelectField<WriteTier>
        label="Who can set the value"
        help="Lowest human role permitted to assign a value on a resource."
        mapNote="maps to restrictions.write.value"
        value={binding.whoCanSet}
        locked={lockGovernance}
        options={WHO_OPTIONS}
        onChange={(whoCanSet) => set({ whoCanSet })}
      />

      <ToggleField
        label="Allow resource admins to configure this binding"
        help="Delegated admins may tighten (never loosen) the required & display settings."
        mapNote="delegation flag · new"
        checked={binding.delegable}
        locked={lockGovernance}
        onChange={(delegable) => set({ delegable })}
      />

      {binding.resource === 'Posts' && (
        <>
          <RadioField<PostInheritanceMode>
            label="Channel inheritance"
            help="How posts receive values from their parent channel at creation time."
            mapNote="binding axis · post inheritance"
            value={binding.inheritanceMode ?? 'none'}
            options={(
              Object.keys(INHERITANCE_MODE_LABEL) as PostInheritanceMode[]
            ).map((mode) => ({
              value: mode,
              title: INHERITANCE_MODE_LABEL[mode],
              desc: INHERITANCE_MODE_DESC[mode],
            }))}
            onChange={(mode) => set({ inheritanceMode: mode })}
          />
          <p className={styles.popHelp}>
            When the channel value changes, only new posts created after that
            change inherit the updated value. Existing posts keep their snapshot.
          </p>
        </>
      )}

      {binding.resource === 'Channels' && dualChannelPost && (
        <>
          <ToggleField
            label="New posts inherit this channel value"
            help="When enabled, new posts in this channel copy the channel's assigned value at creation (if the post binding allows inheritance)."
            mapNote="binding axis · propagateToPosts"
            checked={Boolean(binding.propagateToPosts)}
            locked={lockBehavior}
            onChange={(propagateToPosts) => set({ propagateToPosts })}
          />
          {postBinding && onPostBindingChange && (
            <RadioField<PostInheritanceMode>
              label="Post inheritance mode"
              help="Also editable from Post Attributes. Both settings must be enabled for inheritance to occur."
              value={postBinding.inheritanceMode ?? 'none'}
              options={(
                Object.keys(INHERITANCE_MODE_LABEL) as PostInheritanceMode[]
              ).map((mode) => ({
                value: mode,
                title: INHERITANCE_MODE_LABEL[mode],
                desc: INHERITANCE_MODE_DESC[mode],
              }))}
              onChange={(mode) =>
                onPostBindingChange({ ...postBinding, inheritanceMode: mode })
              }
            />
          )}
        </>
      )}

      {isTeam && (
        <Field
          label="Why are some controls locked?"
          help="Governance settings (vocabulary, editability, who-can-set, delegation) are authored by a system administrator. Team admins consume them and may only tighten delegated behaviors."
        />
      )}
    </Drawer>
  );
}
