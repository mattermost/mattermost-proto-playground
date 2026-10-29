import { Routes, Route, Navigate } from 'react-router-dom';
import AppShell from '@/components/layout/AppShell/AppShell';
import PrototypesIndex from '@/pages/prototypes/PrototypesIndex';
import { PROTOTYPES } from '@/manifests/prototypes';
import DocsPreviewPopout from '@/pages/prototypes/agents-docs/components/DocsPreviewPopout';

export { PROTOTYPES } from '@/manifests/prototypes';

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/agents-docs-preview" element={<DocsPreviewPopout />} />
      <Route element={<AppShell />}>
        <Route index element={<PrototypesIndex />} />
        {/* Old catalog path — keep working bookmarks */}
        <Route path="/prototypes" element={<Navigate to="/" replace />} />

        {PROTOTYPES.map(({ id, path, component: Component, nested }) => (
          <Route
            key={id}
            path={nested ? `${path}/*` : path}
            element={<Component />}
          />
        ))}
      </Route>
    </Routes>
  );
}
