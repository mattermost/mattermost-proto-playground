import { Routes, Route } from 'react-router-dom';
import AppShell from '@/components/layout/AppShell/AppShell';
import DocsLayout from '@/components/layout/DocsLayout/DocsLayout';
import Home from '@/pages/home/Home';
import CategoryRoute from '@/pages/topics/CategoryRoute';
import TopicRoute from '@/pages/topics/TopicRoute';
import PrototypesIndex from '@/pages/prototypes/PrototypesIndex';
import ResourcesIndex from '@/pages/resources/ResourcesIndex';
import { PROTOTYPES } from '@/router/prototypes';

export { PROTOTYPES } from '@/router/prototypes';

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
