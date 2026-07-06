import { useRef, useState } from 'react';
import CheckCircleOutlineIcon from '@mattermost/compass-icons/components/check-circle-outline';
import AlertCircleOutlineIcon from '@mattermost/compass-icons/components/alert-circle-outline';
import ChevronDownIcon from '@mattermost/compass-icons/components/chevron-down';
import ChevronRightIcon from '@mattermost/compass-icons/components/chevron-right';
import TuneIcon from '@mattermost/compass-icons/components/tune';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import LockOutlineIcon from '@mattermost/compass-icons/components/lock-outline';
import Icon from '@/components/ui/Icon/Icon';
import Button from '@/components/ui/Button/Button';
import Chip from '@/components/ui/Chip/Chip';
import Switch from '@/components/ui/Switch/Switch';
import Select from '@/components/ui/Select/Select';
import TextInput from '@/components/ui/TextInput/TextInput';
import TextArea from '@/components/ui/TextArea/TextArea';
import ConsolePanel from '@/components/ui/ConsolePanel/ConsolePanel';
import LabelTag from '@/components/ui/LabelTag/LabelTag';
import PopoverMenu from '@/components/ui/PopoverMenu/PopoverMenu';
import MenuItem from '@/components/ui/MenuItem/MenuItem';
import { useOutsideClose } from '@/hooks/useOutsideClose';
import SyncPill from '../AttributeManagementHub/_components/SyncPill/SyncPill';
import ValuesBasicsEditor from './ValuesBasicsEditor';
import WhoSetsBasicsEditor from './WhoSetsBasicsEditor';
import {
  addableResources,
  basicsGuardrailPills,
  editAccessSummary,
  eligibilityLine,
  isSourceOwned,
  type HubAttribute,
  type ResourceConfig,
  type ResourceKind,
} from './basicsData';
import { type AttrType } from '../AttributeManagementHub/hubData';
import styles from './BasicsForm.module.scss';

const ATTR_TYPES: AttrType[] = [
  'Select',
  'Multiselect',
  'Ranked',
  'Ranked-hierarchical',
  'Text',
];

export interface BasicsFormProps {
  attribute: HubAttribute;
  onDefinitionChange: (
    next: Partial<Pick<HubAttribute, 'name' | 'type' | 'description'>>,
  ) => void;
  onAddValue: (label: string, asTier?: boolean) => void;
  onAddChild: (parentId: string, label: string) => void;
  onDeleteValue: (valueId: string) => void;
  onUseSharedScale: () => void;
  onUnlink: () => void;
  onBindingChange: (
    resource: ResourceKind,
    next: Partial<ResourceConfig>,
  ) => void;
  onAddResource: (resource: ResourceKind) => void;
  onRemoveResource: (resource: ResourceKind) => void;
  onOpenAdvanced: () => void;
}

/**
 * Approach B drill-in Basics form (spec 27 §2, §3). Answers "what is this and
 * where does it go." Everything advanced ("who exactly, under what conditions")
 * is behind the single Advanced settings door. Order: Values → Definition →
 * Applies to (spec 28 §2.1). Description is demoted to a "More" reveal
 * (spec 28 §2.4). Compliance guardrails stay visible as locked pills (§8 Risk 3).
 */
export default function BasicsForm({
  attribute,
  onDefinitionChange,
  onAddValue,
  onAddChild,
  onDeleteValue,
  onUseSharedScale,
  onUnlink,
  onBindingChange,
  onAddResource,
  onRemoveResource,
  onOpenAdvanced,
}: BasicsFormProps) {
  const [showMore, setShowMore] = useState(attribute.description.trim().length > 0);
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const addMenuRef = useRef<HTMLDivElement>(null);
  useOutsideClose(addMenuRef, addMenuOpen, () => setAddMenuOpen(false));

  const sourceOwned = isSourceOwned(attribute);
  const elig = eligibilityLine(attribute);
  const pills = basicsGuardrailPills(attribute);
  const addable = addableResources(attribute);
  const typeReadOnly = sourceOwned || !!attribute.valuesLink;

  return (
    <div className={styles['basics']}>
      {/* Compliance guardrail pills — enforced status, never hidden (§8 Risk 3). */}
      {pills.length > 0 && (
        <div className={styles['basics__guardrails']}>
          {pills.map((p) => (
            <div
              key={p.id}
              className={[
                styles['basics__guardrail'],
                p.tone === 'warning' && styles['basics__guardrail--warning'],
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <span className={styles['basics__guardrail-head']}>
                <Icon size="16" glyph={<LockOutlineIcon />} />
                <span className={styles['basics__guardrail-label']}>{p.label}</span>
              </span>
              <span className={styles['basics__guardrail-explain']}>{p.explain}</span>
            </div>
          ))}
        </div>
      )}

      {/* Values — the primary editing surface, first (spec 28 §2.1). */}
      <ConsolePanel title="Values">
        <ValuesBasicsEditor
          attribute={attribute}
          onAddValue={onAddValue}
          onAddChild={onAddChild}
          onDeleteValue={onDeleteValue}
          onUseSharedScale={onUseSharedScale}
          onUnlink={onUnlink}
        />
      </ConsolePanel>

      {/* Definition — name + type; description demoted to "More". */}
      <ConsolePanel title="Definition">
        <div className={styles['basics__def']}>
          <div className={styles['basics__field']}>
            <span className={styles['basics__field-label']}>Name</span>
            <TextInput
              size="Medium"
              value={attribute.name}
              readOnly={sourceOwned}
              aria-label="Attribute name"
              onChange={(e) => onDefinitionChange({ name: e.target.value })}
            />
          </div>
          <div className={styles['basics__field']}>
            <span className={styles['basics__field-label']}>Type</span>
            <Select
              size="Medium"
              value={attribute.type}
              disabled={typeReadOnly}
              aria-label="Attribute type"
              onChange={(e) =>
                onDefinitionChange({ type: e.target.value as AttrType })
              }
            >
              {ATTR_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </Select>
          </div>

          <button
            type="button"
            className={styles['basics__more']}
            onClick={() => setShowMore((v) => !v)}
          >
            <Icon
              size="16"
              glyph={showMore ? <ChevronDownIcon /> : <ChevronRightIcon />}
            />
            More
          </button>
          {showMore && (
            <div className={styles['basics__field']}>
              <span className={styles['basics__field-label']}>Description</span>
              <TextArea
                size="Medium"
                value={attribute.description}
                aria-label="Attribute description"
                placeholder="Optional — a short note for admins."
                onChange={(e) =>
                  onDefinitionChange({ description: e.target.value })
                }
              />
            </div>
          )}

          <div className={styles['basics__elig']}>
            <span
              className={[
                styles['basics__elig-badge'],
                elig.eligible
                  ? styles['basics__elig-badge--yes']
                  : styles['basics__elig-badge--no'],
              ].join(' ')}
            >
              <Icon
                size="16"
                glyph={
                  elig.eligible ? (
                    <CheckCircleOutlineIcon />
                  ) : (
                    <AlertCircleOutlineIcon />
                  )
                }
              />
              {elig.eligible
                ? 'Usable in access policies'
                : 'Not eligible for access policies'}
            </span>
            <span className={styles['basics__elig-why']}>{elig.why}</span>
          </div>
        </div>
      </ConsolePanel>

      {/* Applies to — resource multiselect + per-resource who-can-set + required. */}
      <ConsolePanel title="Applies to">
        <div className={styles['basics__applies']}>
          <div className={styles['basics__resource-strip']}>
            {attribute.appliesTo.map((c) => (
              <Chip
                key={c.resource}
                size="Medium"
                tone="info"
                onRemove={
                  attribute.appliesTo.length > 1
                    ? () => onRemoveResource(c.resource)
                    : undefined
                }
              >
                {c.resource}
              </Chip>
            ))}
            {addable.length > 0 && (
              <div className={styles['basics__add-wrap']} ref={addMenuRef}>
                <Button
                  emphasis="Tertiary"
                  size="Small"
                  leadingIcon={<Icon size="16" glyph={<PlusIcon />} />}
                  onClick={() => setAddMenuOpen((v) => !v)}
                >
                  Add resource
                </Button>
                {addMenuOpen && (
                  <div className={styles['basics__add-menu']}>
                    <PopoverMenu aria-label="Add resource">
                      {addable.map((r) => (
                        <MenuItem
                          key={r}
                          label={r}
                          onClick={() => {
                            onAddResource(r);
                            setAddMenuOpen(false);
                          }}
                        />
                      ))}
                    </PopoverMenu>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Per ENABLED resource: required toggle + who-can-set (one control each). */}
          <div className={styles['basics__bindings']}>
            {attribute.appliesTo.map((cfg) => (
              <div key={cfg.resource} className={styles['basics__binding']}>
                <div className={styles['basics__binding-head']}>
                  <span className={styles['basics__binding-name']}>
                    {cfg.resource}
                  </span>
                  <Switch
                    size="Small"
                    checked={cfg.required}
                    onChange={(e) =>
                      onBindingChange(cfg.resource, { required: e.target.checked })
                    }
                  >
                    Required
                  </Switch>
                </div>
                <WhoSetsBasicsEditor
                  attribute={attribute}
                  config={cfg}
                  onChange={(next) => onBindingChange(cfg.resource, next)}
                />
              </div>
            ))}
          </div>
        </div>
      </ConsolePanel>

      {/* Source health pill (synced attrs) — read-only status in Basics. */}
      {sourceOwned && attribute.source.state && (
        <ConsolePanel title="Source">
          <div className={styles['basics__source']}>
            <SyncPill
              state={attribute.source.state}
              system={attribute.source.system}
              size="Medium"
            />
            {attribute.source.cadence && (
              <Chip size="Small">{attribute.source.cadence}</Chip>
            )}
            {attribute.source.pastBudget && (
              <LabelTag label="Past freshness budget" type="Danger" size="Small" />
            )}
            <span className={styles['basics__source-status']}>
              {attribute.source.status}
            </span>
          </div>
        </ConsolePanel>
      )}

      {/* The single Advanced settings door (spec 27 §2, §3). */}
      <div className={styles['basics__advanced-door']}>
        <div className={styles['basics__advanced-copy']}>
          <span className={styles['basics__advanced-title']}>Advanced settings</span>
          <span className={styles['basics__advanced-sub']}>
            {editAccessSummary(attribute)} · value rules, inheritance, and source
            mapping.
          </span>
        </div>
        <Button
          emphasis="Secondary"
          leadingIcon={<Icon size="16" glyph={<TuneIcon />} />}
          onClick={onOpenAdvanced}
        >
          Open Advanced settings
        </Button>
      </div>
    </div>
  );
}
