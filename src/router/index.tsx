import { Routes, Route } from 'react-router-dom';
import AppShell from '@/components/layout/AppShell/AppShell';
import DocsLayout from '@/components/layout/DocsLayout/DocsLayout';
import Home from '@/pages/Home/Home';
import OutboundCalls from '@/pages/OutboundCalls/OutboundCalls';
import GuidelinesIndex from '@/pages/guidelines/GuidelinesIndex';
import GuidelineRoute from '@/pages/guidelines/GuidelineRoute';
import LibraryIndex from '@/pages/library/LibraryIndex';
import LibraryRoute from '@/pages/library/LibraryRoute';
import PrototypesIndex from '@/pages/prototypes/PrototypesIndex';
import ResourcesIndex from '@/pages/resources/ResourcesIndex';

// Register prototype flows here.
// Each entry becomes a sidebar nav item and a route.
export const PROTOTYPES = [
  {
    id: 'outbound-calls',
    label: 'Outbound Calls',
    path: '/prototypes/outbound-calls',
    component: OutboundCalls,
  },
];

export default function AppRouter() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<Home />} />

        {/* Docs surfaces — wrapped with the persistent sidebar. */}
        <Route element={<DocsLayout />}>
          <Route path="/guidelines" element={<GuidelinesIndex />} />
          <Route
            path="/guidelines/:category/:slug"
            element={<GuidelineRoute />}
          />

          <Route path="/library" element={<LibraryIndex />} />
          <Route path="/library/:category/:slug" element={<LibraryRoute />} />
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
