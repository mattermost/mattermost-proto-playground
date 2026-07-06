import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ConsoleFooter from '@/components/ui/ConsoleFooter/ConsoleFooter';
import ConsoleFrame from '../shared/ConsoleFrame';
import PolicyEditor from '../shared/PolicyEditor';
import useQuickSwitch from '../shared/useQuickSwitch';

/**
 * Membership Policy editor — standalone page per Figma 4208-27399.
 *
 * Sidebar selection: `membership-policies` (under System Attributes).
 * Page header: "Edit membership policy" with back button.
 * Body: PolicyEditor (composes ConsolePropertyTable + Dropdown + Chip + ...).
 * Footer: ConsoleFooter (Save / Cancel).
 *
 * Promoted from an embedded section under `/d1` to its own route because the
 * Figma shows a distinct sidebar item highlight, distinct page title, and a
 * dedicated footer — URL-level separation matches design intent better than
 * visual separation inside the User Attributes page.
 */
export default function PolicyEditorPage() {
  useQuickSwitch();
  const navigate = useNavigate();
  const [dirty, setDirty] = useState(false);

  function handleSave() {
    setDirty(false);
  }

  function handleCancel() {
    navigate('/hierarchical-attributes/d1');
  }

  function handleSidebarClick(itemId: string) {
    if (itemId === 'user-attributes') {
      navigate('/hierarchical-attributes/d1');
    }
  }

  return (
    <ConsoleFrame
      title="Edit membership policy"
      activeItemId="membership-policies"
      onSidebarItemClick={handleSidebarClick}
      backButton
      onBack={() => navigate('/hierarchical-attributes/d1')}
      directionTag="D1 (leader)"
      footer={
        <ConsoleFooter
          saveDisabled={!dirty}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      }
    >
      <PolicyEditor onDirtyChange={setDirty} />
    </ConsoleFrame>
  );
}
