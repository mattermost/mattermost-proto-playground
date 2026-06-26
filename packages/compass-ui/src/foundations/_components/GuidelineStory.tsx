import { MDXProvider } from '@mdx-js/react';
import type { ReactNode } from 'react';
import Divider from '../../components/Divider/Divider';
import {
  AspectRatios,
  BreakpointTable,
  GridAnatomy,
  GridOverlay,
  InteractionTargets,
  SidebarOffset,
} from '@/guidelines/_components/LayoutSamples';

const guidelineComponents = {
  Divider,
  GridOverlay,
  GridAnatomy,
  BreakpointTable,
  AspectRatios,
  InteractionTargets,
  SidebarOffset,
};

export function GuidelineStory({ children }: { children: ReactNode }) {
  return (
    <MDXProvider components={guidelineComponents}>{children}</MDXProvider>
  );
}
