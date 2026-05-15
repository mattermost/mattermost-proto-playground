import { Routes, Route } from 'react-router-dom';
import AppShell from '@/components/layout/AppShell/AppShell';
import DocsLayout from '@/components/layout/DocsLayout/DocsLayout';
import Home from '@/pages/home/Home';
import ExampleFlow from '@/pages/example-flow/ExampleFlow';
import SimulateAccess from '@/pages/SimulateAccess/SimulateAccess';
import PBEFinalDesignV2 from '@/pages/PBEFinalDesignV2/PBEFinalDesignV2';
import A1 from '@/pages/dpc/a1/A1';
import A2 from '@/pages/dpc/a2/A2';
import A3 from '@/pages/dpc/a3/A3';
import A4 from '@/pages/dpc/a4/A4';
import A1V2 from '@/pages/dpc-v2/a1/A1';
import DPCComparison from '@/pages/dpc/comparison/Comparison';
import CategoryRoute from '@/pages/topics/CategoryRoute';
import TopicRoute from '@/pages/topics/TopicRoute';
import PrototypesIndex from '@/pages/prototypes/PrototypesIndex';
import ResourcesIndex from '@/pages/resources/ResourcesIndex';

// Register prototype flows here.
// Each entry becomes a sidebar nav item and a route.
export const PROTOTYPES = [
  {
    id: 'example-flow',
    label: 'Example Flow',
    path: '/prototypes/example-flow',
    component: ExampleFlow,
  },
  {
    id: 'simulate-access',
    label: 'Simulate access',
    path: '/prototypes/simulate-access',
    component: SimulateAccess,
  },
  {
    id: 'pbe-final-v2',
    label: 'PBE Final Design V2',
    path: '/prototypes/pbe-final-v2',
    component: PBEFinalDesignV2,
  },
  {
    id: 'dpc-comparison',
    label: 'DPC: Comparison',
    path: '/prototypes/dpc/comparison',
    component: DPCComparison,
  },
  {
    id: 'dpc-a1',
    label: 'DPC A1: Confirm-and-Commit',
    path: '/prototypes/dpc/a1',
    component: A1,
  },
  {
    id: 'dpc-v2-a1',
    label: 'DPC V2 A1: Revised (Phase 2-6 re-run)',
    path: '/prototypes/dpc-v2/a1',
    component: A1V2,
  },
  {
    id: 'dpc-a2',
    label: 'DPC A2: Intent-Wizard',
    path: '/prototypes/dpc/a2',
    component: A2,
  },
  {
    id: 'dpc-a3',
    label: 'DPC A3: Curated Directory',
    path: '/prototypes/dpc/a3',
    component: A3,
  },
  {
    id: 'dpc-a4',
    label: 'DPC A4: Knock-by-Reference',
    path: '/prototypes/dpc/a4',
    component: A4,
  },
];

export default function AppRouter() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<Home />} />

        {/* Docs surfaces — wrapped with the persistent sidebar. Flat URLs
            under each category resolve to the unified topic shell. */}
        <Route element={<DocsLayout />}>
          <Route path="/:category" element={<CategoryRoute />} />
          <Route path="/:category/:slug" element={<TopicRoute />} />
          <Route
            path="/:category/:slug/specimen"
            element={<TopicRoute />}
          />
        </Route>

        <Route path="/prototypes" element={<PrototypesIndex />} />
        <Route path="/resources" element={<ResourcesIndex />} />

        {PROTOTYPES.map(({ id, path, component: Component }) => (
          <Route key={id} path={path} element={<Component />} />
        ))}
      </Route>
    </Routes>
  );
}
