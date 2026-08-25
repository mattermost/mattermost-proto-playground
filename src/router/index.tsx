import { Routes, Route, Navigate } from 'react-router-dom';
import AppShell from '@/components/layout/AppShell/AppShell';
import PrototypesIndex from '@/pages/prototypes/PrototypesIndex';
import { PROTOTYPES } from '@/manifests/prototypes';

export { PROTOTYPES } from '@/manifests/prototypes';

export default function AppRouter() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<Navigate to="/prototypes" replace />} />
        <Route path="/prototypes" element={<PrototypesIndex />} />

        {PROTOTYPES.map(({ id, path, component: Component }) => (
          <Route key={id} path={path} element={<Component />} />
        ))}
      </Route>
    </Routes>
  );
}
