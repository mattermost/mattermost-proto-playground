import { useState } from 'react';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import Switch from '@/components/ui/Switch/Switch';
import Button from '@/components/ui/Button/Button';
import Icon from '@/components/ui/Icon/Icon';
import TextInput from '@/components/ui/TextInput/TextInput';
import SectionNotice from '@/components/ui/SectionNotice/SectionNotice';
import ConsolePropertyTable from '@/components/ui/ConsolePropertyTable/ConsolePropertyTable';
import RankedValueChip from '@/components/ui/RankedValueChip/RankedValueChip';
import {
  isPolicyLocked,
  isSourceOwned,
  listValuesForOverlay,
  takesValueList,
  visibleValues,
  type HubAttribute,
  type ResourceConfig,
} from '@/pages/AttributeManagementHub/hubData';
import {
  comparesRank,
  displayType,
  findValueByLabel,
  wasIntroducedOnResource,
} from './simplifiedModel';
import styles from './SimplifiedResourceValuesPanel.module.scss';

export interface SimplifiedResourceValuesPanelProps {
  attribute: HubAttribute;
  config: ResourceConfig;
  onChange: (next: Partial<ResourceConfig>) => void;
  onAddResourceValue: (label: string) => void;
  /** When true, always expanded inside Advanced — no Customize/Done toggle. */
  embedded?: boolean;
}

const VALUE_COLUMNS = [
  { key: 'value', label: 'Value', width: 240 },
  { key: 'allow', label: 'Allow assignment', width: 200 },
];

export default function SimplifiedResourceValuesPanel({
  attribute,
  config,
  onChange,
  onAddResourceValue,
  embedded = false,
}: SimplifiedResourceValuesPanelProps) {
  const locked = isPolicyLocked(attribute);
  const sourceOwned = isSourceOwned(attribute);
  const togglesLocked = locked || sourceOwned;
  const values = visibleValues(attribute, listValuesForOverlay(attribute));
  const disabledIds = config.disabledValueIds ?? [];
  const disabledCount = values.filter((value) => disabledIds.includes(value.id)).length;
  const hasOverrides = disabledCount > 0;
  const ranked = comparesRank(displayType(attribute));

  const [expanded, setExpanded] = useState(hasOverrides || embedded);
  const [draft, setDraft] = useState('');
  const [addNotice, setAddNotice] = useState<string | null>(null);

  if (!takesValueList(attribute) || attribute.values.length === 0) {
    return null;
  }

  const summary = hasOverrides
    ? `${values.length - disabledCount} of ${values.length} available · ${disabledCount} disabled`
    : `All ${values.length} options available`;

  const handleToggle = (valueId: string, enabled: boolean) => {
    if (togglesLocked) return;
    const next = new Set(disabledIds);
    if (enabled) {
      next.delete(valueId);
    } else {
      next.add(valueId);
    }
    onChange({
      disabledValueIds: next.size > 0 ? Array.from(next) : [],
      ...(valueId === config.defaultValueId ? { defaultValueId: null } : {}),
    });
  };

  const commitAdd = () => {
    const trimmed = draft.trim();
    if (!trimmed || togglesLocked) return;

    const existing = findValueByLabel(attribute.values, trimmed);
    const alreadyEnabled =
      existing != null && !disabledIds.includes(existing.id);

    onAddResourceValue(trimmed);
    setDraft('');

    if (alreadyEnabled) {
      setAddNotice(`“${existing?.label}” is already available on ${config.resource.toLowerCase()}.`);
    } else if (existing) {
      setAddNotice(
        `“${existing.label}” uses the shared catalog rank${existing.tier != null ? ` (tier ${existing.tier})` : ''} on every resource.`,
      );
    } else {
      setAddNotice(
        ranked
          ? `“${trimmed}” was added with the next rank in the shared scale. Enable it on other resources from their Allowed options.`
          : `“${trimmed}” was added here. Turn it on for other resources from their Allowed options.`,
      );
    }
  };

  const showTable = embedded || expanded;

  return (
    <section className={styles['values']}>
      <div className={styles['values__toolbar']}>
        <div className={styles['values__intro']}>
          <h4 className={styles['values__title']}>Allowed options</h4>
          <p className={styles['values__summary']}>{summary}</p>
        </div>
        {!embedded && (
          <Button
            emphasis="Tertiary"
            size="Small"
            aria-expanded={expanded}
            onClick={() => setExpanded((open) => !open)}
          >
            {expanded ? 'Done' : togglesLocked ? 'View' : 'Customize'}
          </Button>
        )}
      </div>

      {showTable && (
        <p className={styles['values__desc']}>
          Choose which options can be used on{' '}
          {config.resource.toLowerCase()}. Turning off blocks future assignments;
          existing ones stay in place. New options join the shared catalog — the
          same name keeps the same rank on every resource.
        </p>
      )}

      {showTable && ranked && (
        <div className={styles['values__notice']}>
          <SectionNotice
            type="Info"
            title="Shared rank scale"
            description="Ranked options compare using one scale across resources. Adding “Confidential” on channels uses the same rank as “Confidential” on users."
          />
        </div>
      )}

      {showTable && sourceOwned && (
        <div className={styles['values__notice']}>
          <SectionNotice
            type="Info"
            title="Externally owned options"
            description="Options sync from an external source and cannot be toggled here."
          />
        </div>
      )}

      {showTable && addNotice && (
        <div className={styles['values__notice']}>
          <SectionNotice
            type="Info"
            title="Option updated"
            description={addNotice}
          />
        </div>
      )}

      {showTable && (
        <ConsolePropertyTable
          className={styles['values__table']}
          sections={[
            {
              columns: VALUE_COLUMNS,
              rows: values.map((value) => {
                const disabledForNew = disabledIds.includes(value.id);
                const introducedHere = wasIntroducedOnResource(
                  attribute.id,
                  config.resource,
                  value.id,
                );
                return (
                  <div
                    key={value.id}
                    className={[
                      styles['values__row'],
                      disabledForNew ? styles['values__row--disabled'] : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    <div className={[styles['values__cell'], styles['values__cell--value']].join(' ')}>
                      {value.tier != null ? (
                        <RankedValueChip
                          label={value.label}
                          rank={(value.tier ?? 1) - 1}
                        />
                      ) : (
                        <span className={styles['values__label']}>{value.label}</span>
                      )}
                      {introducedHere && (
                        <span className={styles['values__badge']}>Added here</span>
                      )}
                    </div>
                    <div
                      className={[
                        styles['values__cell'],
                        styles['values__cell--allow'],
                      ].join(' ')}
                    >
                      <Switch
                        size="Small"
                        checked={!disabledForNew}
                        disabled={togglesLocked}
                        aria-label={`${value.label} allowed for assignment on ${config.resource}`}
                        onChange={(event) =>
                          handleToggle(value.id, event.target.checked)
                        }
                      >
                        {disabledForNew ? 'Off' : 'On'}
                      </Switch>
                      {disabledForNew &&
                        value.inUseCount != null &&
                        value.inUseCount > 0 && (
                          <span className={styles['values__meta']}>
                            {value.inUseCount} existing{' '}
                            {config.resource.toLowerCase()} still use this value
                          </span>
                        )}
                    </div>
                  </div>
                );
              }),
            },
          ]}
        />
      )}

      {showTable && !togglesLocked && (
        <div className={styles['values__add']}>
          <TextInput
            size="Small"
            placeholder={`Add an option for ${config.resource.toLowerCase()}`}
            value={draft}
            aria-label={`Add an option for ${config.resource}`}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                commitAdd();
              }
            }}
          />
          <Button
            emphasis="Secondary"
            size="Small"
            leadingIcon={<Icon size="16" glyph={<PlusIcon />} />}
            disabled={draft.trim().length === 0}
            onClick={commitAdd}
          >
            Add option
          </Button>
        </div>
      )}
    </section>
  );
}
