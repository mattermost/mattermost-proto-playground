import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminPanel from '@/components/ui/AdminPanel/AdminPanel';
import ConsoleFooter from '@/components/ui/ConsoleFooter/ConsoleFooter';
import SectionNotice from '@/components/ui/SectionNotice/SectionNotice';
import ConsoleFrame from '../shared/ConsoleFrame';
import AttributeTable from '../shared/AttributeTable';
import AttributePopover from './AttributePopover';
import useQuickSwitch from '../shared/useQuickSwitch';
import { ATTRIBUTE_ROWS } from '../shared/mockData';
import type {
  AttributeRow,
  AttributeType,
  AttributeVisibility,
} from '../shared/mockData';
import { nextRank, sortByRankDesc } from '../shared/types';

/**
 * D3 — Inline + Per-attribute popover (no modal).
 *
 * All editing happens via the per-attribute popover triggered by the row's
 * "Edit ranking" overflow item. Chips inside the table are inert (no chip
 * popover). Inline + Add value works in the table cell as well as the
 * popover footer.
 */
export default function D3() {
  useQuickSwitch();
  const navigate = useNavigate();

  const [rows, setRows] = useState<AttributeRow[]>(() =>
    ATTRIBUTE_ROWS.map((r) => ({ ...r })),
  );
  const [popover, setPopover] = useState<{
    attribute: string;
    anchor: HTMLElement;
  } | null>(null);
  const [pendingNewAttribute, setPendingNewAttribute] = useState<string | null>(
    null,
  );
  const [dirty, setDirty] = useState(false);

  const popoverRow = useMemo(() => {
    if (!popover) return null;
    return rows.find((r) => r.attribute === popover.attribute) ?? null;
  }, [popover, rows]);

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
              { id: `new-${Date.now()}`, label, rank: newRank },
            ],
          },
        };
      }),
    );
    setDirty(true);
  }

  function handleAddProperty(type: AttributeType) {
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

  // -----  Popover-driven schema mutations  -------------------------------
  function handleChangeValueLabel(valueId: string, label: string) {
    if (!popover) return;
    setRows((prev) =>
      prev.map((r) => {
        if (r.attribute !== popover.attribute || !r.schema) return r;
        return {
          ...r,
          schema: {
            ...r.schema,
            values: r.schema.values.map((v) =>
              v.id === valueId ? { ...v, label } : v,
            ),
          },
        };
      }),
    );
    setDirty(true);
  }

  function handleChangeValueRank(valueId: string, nextRankValue: number) {
    if (!popover) return;
    setRows((prev) =>
      prev.map((r) => {
        if (r.attribute !== popover.attribute || !r.schema) return r;
        // Uniqueness: if another value already holds nextRankValue, swap.
        const conflict = r.schema.values.find(
          (v) => v.id !== valueId && v.rank === nextRankValue,
        );
        const target = r.schema.values.find((v) => v.id === valueId);
        if (!target) return r;
        const prevRank = target.rank ?? 0;
        return {
          ...r,
          schema: {
            ...r.schema,
            values: r.schema.values.map((v) => {
              if (v.id === valueId) return { ...v, rank: nextRankValue };
              if (conflict && v.id === conflict.id)
                return { ...v, rank: prevRank };
              return v;
            }),
          },
        };
      }),
    );
    setDirty(true);
  }

  function handleAddValueFromPopover(label: string) {
    if (!popover) return;
    handleAddInlineValue(popover.attribute, label);
  }

  function handleRemoveValue(valueId: string) {
    if (!popover) return;
    setRows((prev) =>
      prev.map((r) => {
        if (r.attribute !== popover.attribute || !r.schema) return r;
        return {
          ...r,
          schema: {
            ...r.schema,
            values: r.schema.values.filter((v) => v.id !== valueId),
          },
        };
      }),
    );
    setDirty(true);
  }

  /**
   * Stepper-driven reorder: swap with the neighbor in the visible (sorted
   * descending) order. Preserves uniqueness because we only swap ranks.
   */
  function handleReorder(valueId: string, direction: -1 | 1) {
    if (!popover) return;
    setRows((prev) =>
      prev.map((r) => {
        if (r.attribute !== popover.attribute || !r.schema) return r;
        const ordered = sortByRankDesc(r.schema.values);
        const idx = ordered.findIndex((v) => v.id === valueId);
        const targetIdx = idx + direction;
        if (idx < 0 || targetIdx < 0 || targetIdx >= ordered.length) return r;
        const a = ordered[idx];
        const b = ordered[targetIdx];
        return {
          ...r,
          schema: {
            ...r.schema,
            values: r.schema.values.map((v) => {
              if (v.id === a.id) return { ...v, rank: b.rank };
              if (v.id === b.id) return { ...v, rank: a.rank };
              return v;
            }),
          },
        };
      }),
    );
    setDirty(true);
  }

  function handleFormSave() {
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
      banner={
        <SectionNotice
          type="Info"
          title="D3 — Inline + per-attribute popover (no modal)"
          description="All editing happens via the row overflow → Edit ranking, which opens a per-attribute popover. Chips inside the table are inert. Inline + Add value still works directly in the row."
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
          variant="d3"
          pendingNewAttribute={pendingNewAttribute}
          onRowClick={(attr, anchor) => {
            if (!anchor) return;
            setPopover({ attribute: attr, anchor });
          }}
          onDeleteAttribute={handleDeleteAttribute}
          onDuplicateAttribute={handleDuplicateAttribute}
          onChangeVisibility={handleChangeVisibility}
          onChangeEditable={handleChangeEditable}
          onAddInlineValue={handleAddInlineValue}
          onAddProperty={handleAddProperty}
          onCommitNewRowName={handleCommitNewRowName}
        />
      </AdminPanel>

      {popover && popoverRow?.schema && (
        <AttributePopover
          schema={popoverRow.schema}
          anchor={popover.anchor}
          policyCount={popoverRow.policyCount}
          readOnly={popoverRow.source === 'UAS'}
          onClose={() => setPopover(null)}
          onChangeValueLabel={handleChangeValueLabel}
          onChangeRank={handleChangeValueRank}
          onAddValue={handleAddValueFromPopover}
          onRemoveValue={handleRemoveValue}
          onReorder={handleReorder}
        />
      )}
    </ConsoleFrame>
  );
}
