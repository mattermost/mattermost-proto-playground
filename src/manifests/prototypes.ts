import type { ComponentType } from 'react';
import ExampleFlow from '@/pages/example-flow/ExampleFlow';
import ExternalCallParticipants from '@/pages/ExternalCallParticipants/ExternalCallParticipants';
import SimulateAccess from '@/pages/SimulateAccess/SimulateAccess';
import PBEFinalDesignV2 from '@/pages/PBEFinalDesignV2/PBEFinalDesignV2';
import A1 from '@/pages/dpc/a1/A1';
import A2 from '@/pages/dpc/a2/A2';
import A3 from '@/pages/dpc/a3/A3';
import A4 from '@/pages/dpc/a4/A4';
import A1V2 from '@/pages/dpc-v2/a1/A1';
import DPCComparison from '@/pages/dpc/comparison/Comparison';

export type PrototypeEntry = {
  id: string;
  label: string;
  path: string;
  component: ComponentType;
};

export const PROTOTYPES: PrototypeEntry[] = [
  {
    id: 'example-flow',
    label: 'Example Flow',
    path: '/prototypes/example-flow',
    component: ExampleFlow,
  },
  {
    id: 'external-call-participants',
    label: 'External Call Participants',
    path: '/prototypes/external-call-participants',
    component: ExternalCallParticipants,
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

export function getPrototypeByPath(pathname: string): PrototypeEntry | undefined {
  const normalized =
    pathname.length > 1 && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
  return PROTOTYPES.find((p) => p.path === normalized);
}
