/**
 * Prototype flows registered for the playground router.
 * Each entry becomes a top-nav entry (via Prototypes index) and a route.
 */
import type { ComponentType } from 'react';
import ExampleFlow from '@/pages/example-flow/ExampleFlow';

export interface PrototypeEntry {
  id: string;
  label: string;
  path: string;
  component: ComponentType;
}

/** Prototype flows — each entry is a top-nav item and a route. */
export const PROTOTYPES: PrototypeEntry[] = [
  {
    id: 'example-flow',
    label: 'Example Flow',
    path: '/prototypes/example-flow',
    component: ExampleFlow,
  },
];
