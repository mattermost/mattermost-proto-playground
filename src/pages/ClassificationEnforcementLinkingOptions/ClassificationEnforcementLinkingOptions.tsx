import { useState } from 'react';
import ConsolePanel from '@/components/ui/ConsolePanel/ConsolePanel';
import ConsoleFooter from '@/components/ui/ConsoleFooter/ConsoleFooter';
import SectionNotice from '@/components/ui/SectionNotice/SectionNotice';
import Switch from '@/components/ui/Switch/Switch';
import Tabs from '@/components/ui/Tabs/Tabs';
import PageChrome from './shared/PageChrome';
import {
  PresetControl,
  BaselineClearanceControl,
  ClearanceLinkingControl,
} from './ClassificationControls';
import LinkedAttributeScene from './LinkedAttributeScene';
import type { ClearanceSourceMode, PresetId } from './shared/types';
import styles from './shared/shared.module.scss';

type SceneId =
  | 'baseline'
  | 'mockup-a-create'
  | 'mockup-a-existing'
  | 'mockup-b';

const SCENES: { key: SceneId; label: string }[] = [
  { key: 'baseline', label: 'Baseline (shipped)' },
  { key: 'mockup-a-create', label: 'Mockup A · Create new' },
  { key: 'mockup-a-existing', label: 'Mockup A · Use existing' },
  { key: 'mockup-b', label: 'Mockup B · Repositioned' },
];

const SCENE_CAPTION: Record<SceneId, string> = {
  baseline:
    'As shipped: a single checkbox, "Enable clearance attribute." Checking it always creates a brand-new Clearance attribute permanently linked to the preset above — there is no picker and no way to reuse an attribute the org already has.',
  'mockup-a-create':
    'Proposal — same section, same name, but the checkbox becomes a choice between creating a new attribute (this view) and linking an existing one. This view shows the create-new path, unchanged from today’s default behavior.',
  'mockup-a-existing':
    'Proposal, resolved design ("Reversed-Seeding Segmented Mode") — a segmented control replaces the radio pair. In "Link existing attribute" mode, Classification preset is removed from the page entirely (not disabled); the Classification Levels table reads rank and text directly from the linked attribute (locked, no mapping step) while color stays a live per-row picker. Toggle the demo switch below to see the no-eligible-attributes state.',
  'mockup-b':
    'Proposal — the enforcement control moves out of its own titled section and sits directly under "Classification preset," framed as one more property of how this page is configured rather than a separate feature area.',
};

function readSceneFromUrl(): SceneId {
  if (typeof window === 'undefined') return 'baseline';
  const params = new URLSearchParams(window.location.search);
  const scene = params.get('scene');
  return (SCENES.find((s) => s.key === scene)?.key as SceneId) ?? 'baseline';
}

function readCatalogEmptyFromUrl(): boolean {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  return params.get('linkAttrs') === 'empty';
}

export default function ClassificationEnforcementLinkingOptions() {
  const [scene, setScene] = useState<SceneId>(readSceneFromUrl());
  const [catalogEmpty, setCatalogEmpty] = useState<boolean>(
    readCatalogEmptyFromUrl(),
  );

  return (
    <PageChrome
      headerTitle="Classification Markings"
      demoBand={
        <div className={styles['demo-band']}>
          <Tabs
            tabs={SCENES.map((s) => ({ key: s.key, label: s.label }))}
            activeKey={scene}
            onChange={(key) => setScene(key as SceneId)}
          />
          <p className={styles['demo-band__caption']}>
            Discussion mockup for a design review of the shipped
            "Classification Enforcement" section — not a formal spec
            deliverable. Switch scenes above; every control is live.
          </p>
          {scene === 'mockup-a-existing' && (
            <div className={styles['demo-toggle']}>
              <Switch
                size="Small"
                checked={catalogEmpty}
                onChange={(e) => setCatalogEmpty(e.target.checked)}
              >
                <span className={styles['demo-toggle__label']}>
                  Demo: no eligible ranked attributes exist
                </span>
              </Switch>
            </div>
          )}
        </div>
      }
    >
      <SectionNotice type="Info" title="What you're looking at" description={SCENE_CAPTION[scene]} />

      {scene === 'baseline' && <BaselineScene />}
      {scene === 'mockup-a-create' && (
        <MockupAScene key="mockup-a-create" initialMode="create-new" />
      )}
      {scene === 'mockup-a-existing' && (
        <LinkedAttributeScene catalogEmpty={catalogEmpty} />
      )}
      {scene === 'mockup-b' && <MockupBScene />}
    </PageChrome>
  );
}

// ─── Baseline — shipped behavior ────────────────────────────────────────────

function BaselineScene() {
  const [enableMarkings, setEnableMarkings] = useState(true);
  const [presetId, setPresetId] = useState<PresetId>('united-states');
  const [enableClearance, setEnableClearance] = useState(true);

  return (
    <>
      <ConsolePanel
        title="Classification Markings"
        subtitle="Configure classification levels for messages and channels in this workspace."
      >
        <PresetControl
          enableMarkings={enableMarkings}
          onToggleMarkings={setEnableMarkings}
          presetId={presetId}
          onChangePreset={setPresetId}
        />
      </ConsolePanel>

      <ConsolePanel
        title="Classification Enforcement"
        subtitle="Require a matching clearance attribute for users to access classified content."
      >
        <BaselineClearanceControl
          checked={enableClearance}
          onChange={setEnableClearance}
          presetId={presetId}
          disabled={!enableMarkings}
        />
      </ConsolePanel>

      <ConsoleFooter saveDisabled={false} onSave={() => undefined} onCancel={() => undefined} />
    </>
  );
}

// ─── Mockup A — link an existing ranked attribute ──────────────────────────

function MockupAScene({ initialMode }: { initialMode: ClearanceSourceMode }) {
  const [enableMarkings, setEnableMarkings] = useState(true);
  const [presetId, setPresetId] = useState<PresetId>('united-states');
  const [enableClearance, setEnableClearance] = useState(true);
  const [mode, setMode] = useState<ClearanceSourceMode>(initialMode);
  const [existingAttrId, setExistingAttrId] = useState(
    initialMode === 'use-existing' ? 'sensitivity' : 'clearance-existing',
  );

  return (
    <>
      <ConsolePanel
        title="Classification Markings"
        subtitle="Configure classification levels for messages and channels in this workspace."
      >
        <PresetControl
          enableMarkings={enableMarkings}
          onToggleMarkings={setEnableMarkings}
          presetId={presetId}
          onChangePreset={setPresetId}
          showLinkNote={enableClearance && mode === 'use-existing'}
        />
      </ConsolePanel>

      <ConsolePanel
        title="Classification Enforcement"
        subtitle="Require a matching clearance attribute for users to access classified content."
      >
        <ClearanceLinkingControl
          enabled={enableClearance}
          onToggleEnabled={setEnableClearance}
          mode={mode}
          onChangeMode={setMode}
          presetId={presetId}
          existingAttrId={existingAttrId}
          onChangeExistingAttr={setExistingAttrId}
          disabled={!enableMarkings}
        />
      </ConsolePanel>

      <ConsoleFooter saveDisabled={false} onSave={() => undefined} onCancel={() => undefined} />
    </>
  );
}

// ─── Mockup B — repositioned, renamed control ──────────────────────────────

// Suggested rename: "Classification Enforcement" reads like an internal
// feature-flag name. Framing it as "Require clearance to access" states the
// admin-facing consequence directly and matches the verb-first pattern of
// nearby controls ("Enable classification markings").
const MOCKUP_B_CONTROL_LABEL = 'Require clearance to access';

function MockupBScene() {
  const [enableMarkings, setEnableMarkings] = useState(true);
  const [presetId, setPresetId] = useState<PresetId>('united-states');
  const [enableClearance, setEnableClearance] = useState(true);
  const [mode, setMode] = useState<ClearanceSourceMode>('create-new');
  const [existingAttrId, setExistingAttrId] = useState('clearance-existing');

  return (
    <>
      <ConsolePanel
        title="Classification Markings"
        subtitle="Configure classification levels for messages and channels in this workspace."
      >
        <PresetControl
          enableMarkings={enableMarkings}
          onToggleMarkings={setEnableMarkings}
          presetId={presetId}
          onChangePreset={setPresetId}
          showLinkNote={enableClearance && mode === 'use-existing'}
        />

        {enableMarkings && (
          <div className={styles['inline-enforcement']}>
            <p className={styles['rename-hint']}>
              No separate "Classification Enforcement" section here — this is
              the same control, renamed and inlined directly under the preset
              it depends on.
            </p>
            <ClearanceLinkingControl
              enabled={enableClearance}
              onToggleEnabled={setEnableClearance}
              mode={mode}
              onChangeMode={setMode}
              presetId={presetId}
              existingAttrId={existingAttrId}
              onChangeExistingAttr={setExistingAttrId}
              controlLabel={MOCKUP_B_CONTROL_LABEL}
              disabled={!enableMarkings}
            />
          </div>
        )}
      </ConsolePanel>

      <ConsoleFooter saveDisabled={false} onSave={() => undefined} onCancel={() => undefined} />
    </>
  );
}
