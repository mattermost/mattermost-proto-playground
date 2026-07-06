import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminPanel from '@/components/ui/AdminPanel/AdminPanel';
import ConsoleFooter from '@/components/ui/ConsoleFooter/ConsoleFooter';
import SectionNotice from '@/components/ui/SectionNotice/SectionNotice';
import ConsoleFrame from '../shared/ConsoleFrame';
import AttributeTable from '../shared/AttributeTable';
import RankedSchemaModal from '../d1/RankedSchemaModal';
import useQuickSwitch from '../shared/useQuickSwitch';
import { ATTRIBUTE_ROWS } from '../shared/mockData';
import type {
  AttributeRow,
  AttributeType,
  AttributeVisibility,
} from '../shared/mockData';
import { nextRank } from '../shared/types';
import type { RankedSchema } from '../shared/types';

/**
 * Alternate D1 surface — Values cell behaves as a single button that opens
 * the modal directly. Round 6 keeps the new overflow menu + inline +
 * Add value + + Add property type chooser identical to /d1.
 */
export default function D1ModalOnly() {
  useQuickSwitch();
  const navigate = useNavigate();

  const [rows, setRows] = useState<AttributeRow[]>(() =>
    ATTRIBUTE_ROWS.map((r) => ({ ...r })),
  );
  const [modalAttribute, setModalAttribute] = useState<string | null>(null);
  const [pendingNewAttribute, setPendingNewAttribute] = useState<string | null>(
    null,
  );
  const [dirty, setDirty] = useState(false);

  const modalRow = useMemo(() => {
    if (!modalAttribute) return null;
    return rows.find((r) => r.attribute === modalAttribute) ?? null;
  }, [modalAttribute, rows]);

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
          title="D1 modal-only variant — A/B with the simplified popover (/d1)"
          description="Click any Ordered-attribute Values cell to open the schema modal directly. Inline + Add value remains available below the cell. Decision will be made at next week's kickoff."
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
          variant="cell-button"
          pendingNewAttribute={pendingNewAttribute}
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
