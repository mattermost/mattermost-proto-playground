import { Routes, Route } from 'react-router-dom';
import AppShell from '@/components/layout/AppShell/AppShell';
import Home from '@/pages/Home/Home';
import Components from '@/pages/Components/Components';
import Foundations from '@/pages/Foundations/Foundations';
import Patterns from '@/pages/Patterns/Patterns';
import Layouts from '@/pages/Layouts/Layouts';
import ExternalCallParticipants from '@/pages/ExternalCallParticipants/ExternalCallParticipants';
import GuidelinesIndex from '@/pages/guidelines/GuidelinesIndex';
import GuidelineRoute from '@/pages/guidelines/GuidelineRoute';
import LibraryIndex from '@/pages/library/LibraryIndex';
import LibraryRoute from '@/pages/library/LibraryRoute';
import PrototypesIndex from '@/pages/prototypes/PrototypesIndex';

// Register prototype flows here.
// Each entry becomes a sidebar nav item and a route.
export const PROTOTYPES = [
  {
    id: 'external-call-participants',
    label: 'External Call Participants',
    path: '/prototypes/external-call-participants',
    component: ExternalCallParticipants,
  },
];

export default function AppRouter() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<Home />} />

        {/* New top-level destinations */}
        <Route path="/guidelines" element={<GuidelinesIndex />} />
        <Route path="/guidelines/:slug" element={<GuidelineRoute />} />
        <Route
          path="/guidelines/:category/:slug"
          element={<GuidelineRoute />}
        />

        <Route path="/library" element={<LibraryIndex />} />
        <Route path="/library/:category/:slug" element={<LibraryRoute />} />

        <Route path="/prototypes" element={<PrototypesIndex />} />

        {/* Legacy routes — kept functional during migration. */}
        <Route path="/components" element={<Components />} />
        <Route path="/foundations" element={<Foundations />} />
        <Route path="/patterns" element={<Patterns />} />
        <Route path="/layouts" element={<Layouts />} />

        {PROTOTYPES.map(({ id, path, component: Component }) => (
          <Route key={id} path={path} element={<Component />} />
        ))}
      </Route>
    </Routes>
  );
}
