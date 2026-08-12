import { useState } from 'react';
import AlertOutlineIcon from '@mattermost/compass-icons/components/alert-outline';
import ArrowRightIcon from '@mattermost/compass-icons/components/arrow-right';
import InformationOutlineIcon from '@mattermost/compass-icons/components/information-outline';
import LinkVariantIcon from '@mattermost/compass-icons/components/link-variant';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import ShieldOutlineIcon from '@mattermost/compass-icons/components/shield-outline';
import Button from '@/components/ui/Button/Button';
import Checkbox from '@/components/ui/Checkbox/Checkbox';
import ConsolePageHeader from '@/components/ui/ConsolePageHeader/ConsolePageHeader';
import ConsolePanel from '@/components/ui/ConsolePanel/ConsolePanel';
import ConsoleSidebar from '@/components/ui/ConsoleSidebar/ConsoleSidebar';
import sidebarStyles from '@/components/ui/ConsoleSidebar/ConsoleSidebar.module.scss';
import Icon from '@/components/ui/Icon/Icon';
import LabelTag from '@/components/ui/LabelTag/LabelTag';
import Radio from '@/components/ui/Radio/Radio';
import Scrollbars from '@/components/ui/Scrollbars/Scrollbars';
import SectionNotice from '@/components/ui/SectionNotice/SectionNotice';
import Switch from '@/components/ui/Switch/Switch';
import avatarLeonard from '@/assets/avatars/Leonard Riley.png';
import {
  HUB_ACTIVE_ITEM,
  HUB_SIDEBAR_CATEGORIES,
} from '@/pages/AttributeManagementHub/hubSidebar';
import type { DerivationMode, ValueScheme } from '../boundsModel';
import {
  BOUND_FAIL_CLOSED_NOTE,
  BOUND_SWITCH_LABEL,
  DERIVATION_NO_PROVENANCE_NOTE,
  DERIVATION_OPTIONS,
  LINKED_FIELD_BROKEN_TITLE,
  READ_BOUND_LEAF,
  SECOND_FIELD,
  WRITE_BOUND_LEAF,
  boundSwitchHelp,
  linkedFieldBrokenDetail,
  linkedFieldSummary,
  noun,
} from '../copy';
import type { StateKey } from '../urlState';
import ValueChip from './ValueChip';
import styles from './AttributeSetupSurface.module.scss';

export interface AttributeSetupSurfaceProps {
  scheme: ValueScheme;
  state: StateKey;
}

/** The list the linked field points at when the relationship is broken. */
const MISMATCHED_LIST = 'Legacy markings (imported)';

/**
 * Surface 3 — where an admin configures derivation and the bound on the field
 * itself, in System Console.
 *
 * Three things are invisible unless this page says them out loud:
 *
 *  1. Which LEAF the bound lands on. `write.value.bounds` is the guard;
 *     `read.option.bounds` is a picker convenience. They look like one setting
 *     and are not — one of them can be turned off without weakening anything.
 *  2. The LINKED-FIELD relationship. A cap is only meaningful when both fields
 *     draw from one shared value list; otherwise there is nothing to compare.
 *  3. That derivation CANNOT vary value by value. Wanting different inheritance
 *     for the same object type means a second field on the same list — a
 *     modelling consequence, not a support answer.
 */
export default function AttributeSetupSurface({
  scheme,
  state,
}: AttributeSetupSurfaceProps) {
  const fieldNoun = noun(scheme);
  const fieldName = `Post ${fieldNoun}`;
  const linkedFieldName = `Channel ${fieldNoun}`;
  const linkedOk = state !== 'cap-unresolved';

  const [derivation, setDerivation] = useState<DerivationMode>(
    state === 'explicit' ? 'unset' : 'parent',
  );
  const [bounded, setBounded] = useState(true);
  const [readOptionBounds, setReadOptionBounds] = useState(
    state !== 'explicit',
  );

  const [seedKey, setSeedKey] = useState(`${state}:${scheme.key}`);
  if (seedKey !== `${state}:${scheme.key}`) {
    setSeedKey(`${state}:${scheme.key}`);
    setDerivation(state === 'explicit' ? 'unset' : 'parent');
    setBounded(true);
    setReadOptionBounds(state !== 'explicit');
  }

  return (
    <div className={styles['setup-surface']}>
      <ConsoleSidebar
        className={sidebarStyles['console-sidebar--product']}
        avatarSrc={avatarLeonard}
        avatarAlt="Leonard Riley"
        username="leonard.riley"
        categories={HUB_SIDEBAR_CATEGORIES}
        activeItemId={HUB_ACTIVE_ITEM}
      />
      <div className={styles['setup-surface__center']}>
        <ConsolePageHeader
          title={fieldName}
          subtitle={`${scheme.fieldType === 'rank' ? 'Ranked' : 'Hierarchical'} · applies to Posts · values from ${scheme.valueListName}`}
          tag={scheme.fieldType === 'rank' ? 'Ranked' : 'Hierarchical'}
          trailing={
            <Button emphasis="Primary" size="Medium" disabled={!linkedOk}>
              Save
            </Button>
          }
        />

        <div className={styles['setup-surface__scroll']}>
          <Scrollbars>
            <div className={styles['setup-surface__content']}>
              {/* ── 1. The linked-field relationship ─────────────────── */}
              <ConsolePanel
                title="Linked field"
                subtitle="A cap is read from another field on another object. Both sides must draw from one value list."
              >
                <div className={styles['setup-surface__link']}>
                  <div className={styles['setup-surface__link-card']}>
                    <span className={styles['setup-surface__link-role']}>
                      This field
                    </span>
                    <span className={styles['setup-surface__link-name']}>
                      {fieldName}
                    </span>
                    <span className={styles['setup-surface__link-meta']}>
                      Applies to Posts
                    </span>
                    <LabelTag
                      label={scheme.valueListName}
                      type="Default"
                      size="X-Small"
                    />
                  </div>

                  <div className={styles['setup-surface__link-arrow']}>
                    <Icon size="16" glyph={<ArrowRightIcon />} />
                    <span className={styles['setup-surface__link-arrow-text']}>
                      capped by
                    </span>
                  </div>

                  <div
                    className={[
                      styles['setup-surface__link-card'],
                      linkedOk
                        ? ''
                        : styles['setup-surface__link-card--broken'],
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    <span className={styles['setup-surface__link-role']}>
                      Reference
                    </span>
                    <span className={styles['setup-surface__link-name']}>
                      {linkedFieldName}
                    </span>
                    <span className={styles['setup-surface__link-meta']}>
                      Applies to Channels
                    </span>
                    <LabelTag
                      label={linkedOk ? scheme.valueListName : MISMATCHED_LIST}
                      type={linkedOk ? 'Default' : 'Danger'}
                      size="X-Small"
                    />
                  </div>
                </div>

                {linkedOk ? (
                  <>
                    <span className={styles['setup-surface__note']}>
                      {linkedFieldSummary(
                        fieldName,
                        linkedFieldName,
                        scheme.valueListName,
                      )}
                    </span>
                    <div className={styles['setup-surface__values']}>
                      <span className={styles['setup-surface__values-label']}>
                        {`${scheme.valueListName} — shared by both fields`}
                      </span>
                      <div className={styles['setup-surface__values-row']}>
                        {scheme.displayOrder.map((id) => (
                          <ValueChip
                            key={id}
                            scheme={scheme}
                            valueId={id}
                            size="Small"
                          />
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <SectionNotice
                    type="Danger"
                    icon={<Icon size="20" glyph={<AlertOutlineIcon />} />}
                    title={LINKED_FIELD_BROKEN_TITLE}
                    description={linkedFieldBrokenDetail(
                      fieldName,
                      linkedFieldName,
                    )}
                    secondaryButtonLabel="Point both fields at one list"
                  />
                )}
              </ConsolePanel>

              {/* ── 2. Derivation ───────────────────────────────────── */}
              <ConsolePanel
                title="Inheritance"
                subtitle="What an object shows when it stores no value of its own."
              >
                <div
                  className={styles['setup-surface__radios']}
                  role="radiogroup"
                  aria-label="Inheritance"
                >
                  {DERIVATION_OPTIONS.map((option) => (
                    <div
                      key={option.value}
                      className={[
                        styles['setup-surface__radio-row'],
                        derivation === option.value
                          ? styles['setup-surface__radio-row--active']
                          : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                    >
                      <Radio
                        name="derivation"
                        size="Medium"
                        value={option.value}
                        checked={derivation === option.value}
                        onChange={() => setDerivation(option.value)}
                      >
                        {option.label}
                      </Radio>
                      <span className={styles['setup-surface__radio-help']}>
                        {option.consequence}
                      </span>
                    </div>
                  ))}
                </div>

                <SectionNotice
                  type="Hint"
                  icon={<Icon size="20" glyph={<InformationOutlineIcon />} />}
                  title="Inheritance is read from the data, not from a flag"
                  description={DERIVATION_NO_PROVENANCE_NOTE}
                />
              </ConsolePanel>

              {/* ── 3. The bound and its two leaves ─────────────────── */}
              <ConsolePanel
                title="Cap by a linked field"
                subtitle="Two settings that look like one. Only the first is a control."
              >
                <Switch
                  size="Medium"
                  checked={bounded}
                  onChange={(e) => setBounded(e.target.checked)}
                  secondaryLabel={boundSwitchHelp(fieldName, linkedFieldName)}
                >
                  {BOUND_SWITCH_LABEL}
                </Switch>

                {bounded && (
                  <div className={styles['setup-surface__leaves']}>
                    <div
                      className={[
                        styles['setup-surface__leaf'],
                        styles['setup-surface__leaf--guard'],
                      ].join(' ')}
                    >
                      <div className={styles['setup-surface__leaf-head']}>
                        <Checkbox size="Medium" checked readOnly disabled>
                          {WRITE_BOUND_LEAF.label}
                        </Checkbox>
                        <LabelTag
                          label={WRITE_BOUND_LEAF.tag}
                          type="Danger"
                          size="X-Small"
                          leadingIcon={
                            <Icon size="10" glyph={<ShieldOutlineIcon />} />
                          }
                        />
                        <code className={styles['setup-surface__leaf-path']}>
                          {WRITE_BOUND_LEAF.path}
                        </code>
                      </div>
                      <span className={styles['setup-surface__leaf-help']}>
                        {WRITE_BOUND_LEAF.help}
                      </span>
                    </div>

                    <div className={styles['setup-surface__leaf']}>
                      <div className={styles['setup-surface__leaf-head']}>
                        <Checkbox
                          size="Medium"
                          checked={readOptionBounds}
                          onChange={(e) =>
                            setReadOptionBounds(e.target.checked)
                          }
                        >
                          {READ_BOUND_LEAF.label}
                        </Checkbox>
                        <LabelTag
                          label={READ_BOUND_LEAF.tag}
                          type="Info"
                          size="X-Small"
                          leadingIcon={
                            <Icon size="10" glyph={<LinkVariantIcon />} />
                          }
                        />
                        <code className={styles['setup-surface__leaf-path']}>
                          {READ_BOUND_LEAF.path}
                        </code>
                      </div>
                      <span className={styles['setup-surface__leaf-help']}>
                        {READ_BOUND_LEAF.help}
                      </span>
                    </div>

                    <SectionNotice
                      type="Warning"
                      icon={<Icon size="20" glyph={<AlertOutlineIcon />} />}
                      title="If the reference cannot be resolved, nothing is offered"
                      description={BOUND_FAIL_CLOSED_NOTE}
                    />
                  </div>
                )}
              </ConsolePanel>

              {/* ── 4. The second-field consequence ─────────────────── */}
              <ConsolePanel
                title={SECOND_FIELD.title}
                subtitle="Inheritance is set per field, so different behaviour needs a different field."
              >
                <span className={styles['setup-surface__note']}>
                  {SECOND_FIELD.body}
                </span>
                <Button
                  emphasis="Secondary"
                  size="Medium"
                  leadingIcon={<Icon size="16" glyph={<PlusIcon />} />}
                >
                  {SECOND_FIELD.action}
                </Button>
              </ConsolePanel>
            </div>
          </Scrollbars>
        </div>
      </div>
    </div>
  );
}
