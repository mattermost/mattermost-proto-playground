import { Routes, Route } from 'react-router-dom';
import AppShell from '@/components/layout/AppShell/AppShell';
import Home from '@/pages/Home/Home';
import Components from '@/pages/Components/Components';
import Foundations from '@/pages/Foundations/Foundations';
import Patterns from '@/pages/Patterns/Patterns';
import Layouts from '@/pages/Layouts/Layouts';
import ExampleFlow from '@/pages/ExampleFlow/ExampleFlow';
import ProductSwitcher from '@/pages/ProductSwitcher/ProductSwitcher';

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
    id: 'product-switcher',
    label: 'Product Switcher',
    path: '/prototypes/product-switcher',
    component: ProductSwitcher,
  },
];

export default function AppRouter() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<Home />} />
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
