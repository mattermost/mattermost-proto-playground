import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminPanel from '@/components/ui/AdminPanel/AdminPanel';
import ConsoleFooter from '@/components/ui/ConsoleFooter/ConsoleFooter';
import SectionNotice from '@/components/ui/SectionNotice/SectionNotice';
import ConsoleFrame from '../shared/ConsoleFrame';
import AttributeTable from '../shared/AttributeTable';
import ChipPopover from './ChipPopover';
import RankedSchemaModal from './RankedSchemaModal';
import useQuickSwitch from '../shared/useQuickSwitch';
import { ATTRIBUTE_ROWS } from '../shared/mockData';
import type {
  AttributeRow,
  AttributeType,
  AttributeVisibility,
} from '../shared/mockData';
import { nextRank } from '../shared/types';
import type { RankedSchema } from '../shared/types';
import styles from './D1.module.scss';

/**
 * D1 — System Console User Attributes (simplified post 2026-05-22 sync).
 *
 * Per the meeting decisions:
 *  - Color is descoped → ChipPopover edits label only.
 *  - Rank changes flow through the modal (drag-to-reorder).
 *  - Per-value remove and per-attribute delete are hard-blocked when policy
 *    references exist (AttributeTable + ChipPopover + RankedSchemaModal each
 *    enforce the gate at their layer).
 *
 * Round 6 additions:
 *  - 7-item row overflow (Edit ranking / Visibility / Editable / Link / Duplicate / Delete).
 *  - Inline + Add value affordance per Ordered row.
 *  - + Add property type chooser; new rows render with an inline name TextInput.
 */
export default function D1() {
  useQuickSwitch();
  const navigate = useNavigate();

  const [rows, setRows] = useState<AttributeRow[]>(() =>
    ATTRIBUTE_ROWS.map((r) => ({ ...r })),
  );
  const [activeChip, setActiveChip] = useState<{
    attribute: string;
    valueId: string;
    anchor: HTMLElement;
  } | null>(null);
  const [modalAttribute, setModalAttribute] = useState<string | null>(null);
  const [pendingNewAttribute, setPendingNewAttribute] = useState<string | null>(
    null,
  );
  const [dirty, setDirty] = useState(false);

  const activeRow = useMemo(() => {
    if (!activeChip) return null;
    return rows.find((r) => r.attribute === activeChip.attribute) ?? null;
  }, [activeChip, rows]);

  const modalRow = useMemo(() => {
    if (!modalAttribute) return null;
    return rows.find((r) => r.attribute === modalAttribute) ?? null;
  }, [modalAttribute, rows]);

  function handleChipClick(
    attributeName: string,
    valueId: string,
    anchor: HTMLElement,
  ) {
    setActiveChip({ attribute: attributeName, valueId, anchor });
  }

  function handleLabelChange(valueId: string, nextLabel: string) {
    if (!activeChip) return;
    setRows((prev) =>
      prev.map((r) => {
        if (r.attribute !== activeChip.attribute || !r.schema) return r;
        return {
          ...r,
          schema: {
            ...r.schema,
            values: r.schema.values.map((v) =>
              v.id === valueId ? { ...v, label: nextLabel } : v,
            ),
          },
        };
      }),
    );
    setDirty(true);
  }

  function handleValueRemove(valueId: string) {
    if (!activeChip) return;
    setRows((prev) =>
      prev.map((r) => {
        if (r.attribute !== activeChip.attribute || !r.schema) return r;
        return {
          ...r,
          schema: {
            ...r.schema,
            values: r.schema.values.filter((v) => v.id !== valueId),
          },
        };
      }),
    );
    setActiveChip(null);
    setDirty(true);
  }

  function handleModalSave(next: RankedSchema) {
    setRows((prev) =>
      prev.map((r) =>
        r.attribute === next.attributeName ? { ...r, schema: next } : r,
      ),
    );
    setModalAttribute(null);
    setDirty(true);
  }

  function handleDeleteAttribute(attribute: string) {
    setRows((prev) => prev.filter((r) => r.attribute !== attribute));
    setDirty(true);
  }

  function handleDuplicateAttribute(attribute: string) {
    setRows((prev) => {
      const src = prev.find((r) => r.attribute === attribute);
      if (!src) return prev;
      const copyName = `${attribute} (copy)`;
      const copy: AttributeRow = {
        ...src,
        attribute: copyName,
        policyCount: 0,
        locked: false,
        schema: src.schema
          ? {
              ...src.schema,
              id: `${src.schema.id}-copy-${Date.now()}`,
              attributeName: copyName,
              version: 1,
            }
          : undefined,
      };
      return [...prev, copy];
    });
    setDirty(true);
  }

  function handleChangeVisibility(
    attribute: string,
    visibility: AttributeVisibility,
  ) {
    setRows((prev) =>
      prev.map((r) => (r.attribute === attribute ? { ...r, visibility } : r)),
    );
    setDirty(true);
  }

  function handleChangeEditable(attribute: string, editable: boolean) {
    setRows((prev) =>
      prev.map((r) =>
        r.attribute === attribute
          ? { ...r, editableByEndUsers: editable }
          : r,
      ),
    );
    setDirty(true);
  }

  function handleAddInlineValue(attribute: string, label: string) {
    setRows((prev) =>
      prev.map((r) => {
        if (r.attribute !== attribute || !r.schema) return r;
        const newRank = nextRank(r.schema.values);
        return {
          ...r,
          schema: {
            ...r.schema,
            values: [
              ...r.schema.values,
              {
                id: `new-${Date.now()}`,
                label,
                rank: newRank,
              },
            ],
          },
        };
      }),
    );
    setDirty(true);
  }

  function handleAddProperty(type: AttributeType) {
    // Generate a unique placeholder name. The row renders an inline editable
    // TextInput in its title cell until the admin commits a real name.
    const placeholder = `New ${type}`;
    const uniquePlaceholder = (() => {
      const existing = new Set(rows.map((r) => r.attribute));
      if (!existing.has(placeholder)) return placeholder;
      let i = 2;
      while (existing.has(`${placeholder} ${i}`)) i++;
      return `${placeholder} ${i}`;
    })();

    const base: AttributeRow = {
      attribute: uniquePlaceholder,
      type,
      source: 'Local',
      policyCount: 0,
      visibility: 'Hide when empty',
      editableByEndUsers: false,
    };

    if (type === 'Ordered') {
      base.schema = {
        id: `new-schema-${Date.now()}`,
        attributeName: uniquePlaceholder,
        version: 1,
        source: 'local',
        values: [],
      };
    } else if (type === 'Select') {
      base.selectValues = [];
    }

    setRows((prev) => [...prev, base]);
    setPendingNewAttribute(uniquePlaceholder);
    setDirty(true);
  }

  function handleCommitNewRowName(
    placeholderAttribute: string,
    nextName: string,
  ) {
    setRows((prev) =>
      prev.map((r) => {
        if (r.attribute !== placeholderAttribute) return r;
        return {
          ...r,
          attribute: nextName,
          schema: r.schema
            ? { ...r.schema, attributeName: nextName }
            : undefined,
        };
      }),
    );
    setPendingNewAttribute(null);
  }

  function handleFormSave() {
    // Prototype: pretend to persist; in real product this fires a server save.
    setDirty(false);
  }

  function handleFormCancel() {
    setRows(ATTRIBUTE_ROWS.map((r) => ({ ...r })));
    setPendingNewAttribute(null);
    setDirty(false);
  }

  return (
    <ConsoleFrame
      title="System Properties"
      activeItemId="user-attributes"
      onSidebarItemClick={(itemId) => {
        if (itemId === 'membership-policies') {
          navigate('/hierarchical-attributes/d1/policy-editor');
        }
      }}
      directionTag="D1 (leader)"
      banner={
        <SectionNotice
          type="Info"
          title="D1 prototype — Simplified ChipPopover + inline value-add"
          description='Click any Ordered-attribute chip to edit its label. Add new values inline via "+ Add value". Open the row "more" menu to access the schema modal, change visibility, duplicate, or delete. Delete is blocked when policies reference the attribute. Use \ (backslash) to quick-switch to D2.'
        />
      }
      footer={
        <ConsoleFooter
          saveDisabled={!dirty}
          onSave={handleFormSave}
          onCancel={handleFormCancel}
        />
      }
    >
      <AdminPanel
        title="User properties"
        subtitle="Customize the properties to show in user profiles"
        showEnterpriseLabel
        expandable
        defaultExpandedState="Expanded"
      >
        <AttributeTable
          rows={rows}
          variant="D1"
          activeChipId={activeChip?.valueId ?? null}
          pendingNewAttribute={pendingNewAttribute}
          onChipClick={handleChipClick}
          onRowClick={(attr) => setModalAttribute(attr)}
          onDeleteAttribute={handleDeleteAttribute}
          onDuplicateAttribute={handleDuplicateAttribute}
          onChangeVisibility={handleChangeVisibility}
          onChangeEditable={handleChangeEditable}
          onAddInlineValue={handleAddInlineValue}
          onAddProperty={handleAddProperty}
          onCommitNewRowName={handleCommitNewRowName}
        />
      </AdminPanel>

      <section id="policy-editor" className={styles['d1__editor']}>
        <h3 className={styles['d1__h3']}>
          Membership policy editor (Stories 3, 4)
        </h3>
        <p className={styles['d1__p']}>
          The policy editor is its own page under{' '}
          <code className={styles['d1__code']}>Membership Policies</code> in
          the sidebar — matching Figma 4208-27399. Click the sidebar item or
          the button below to open it.
        </p>
        <button
          type="button"
          className={styles['d1__view-uas']}
          onClick={() =>
            navigate('/hierarchical-attributes/d1/policy-editor')
          }
        >
          Open Membership Policy editor
        </button>
      </section>

      {activeChip && activeRow?.schema && (
        <ChipPopover
          schema={activeRow.schema}
          activeValueId={activeChip.valueId}
          anchor={activeChip.anchor}
          policyCount={activeRow.policyCount}
          onClose={() => setActiveChip(null)}
          onChangeLabel={handleLabelChange}
          onRemove={handleValueRemove}
        />
      )}

      {modalRow?.schema && (
        <RankedSchemaModal
          schema={modalRow.schema}
          policyCount={modalRow.policyCount}
          open
          onClose={() => setModalAttribute(null)}
          onSave={handleModalSave}
        />
      )}
    </ConsoleFrame>
  );
}
