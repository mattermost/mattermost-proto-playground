import type { ReactNode } from 'react';
import { MDXProvider } from '@mdx-js/react';
import Preview from '@/guidelines/_components/Preview';
import Swatch, { SwatchGrid, SwatchRamp } from '@/guidelines/_components/Swatch';
import LayoutPreview, { LayoutPreviewGrid, SplitRow } from '@/guidelines/_components/LayoutPreview';
import {
  TypefaceCard,
  TypeStack,
  TypeSpecimen,
  ScaleTable,
  MarginTable,
} from '@/guidelines/_components/Type';
import {
  IconShowcase,
  IconSizeRamp,
  IconStyleCompare,
  FiletypeShowcase,
  Principle,
  PrincipleList,
} from '@/guidelines/_components/IconSamples';
import {
  CoreShapes,
  RadiusRamp,
  ShapeExamples,
} from '@/guidelines/_components/ShapeSamples';
import {
  ElevationScale,
  ElevationPopoverExample,
} from '@/guidelines/_components/ElevationSamples';
import {
  SpacingScale,
  PaddingExample,
  GridOverlay,
  GridAnatomy,
  BreakpointTable,
  AspectRatios,
  InteractionTargets,
  SidebarOffset,
  DensityCard,
} from '@/guidelines/_components/LayoutSamples';
import {
  MotionMatrix,
  PopoverPattern,
} from '@/guidelines/_components/AnimationSamples';
import {
  ButtonAnatomy,
  ButtonSizes,
  ButtonEmphasis,
  ButtonStates,
  ButtonInverted,
  ButtonDestructive,
  ButtonWidths,
  ButtonPositioning,
} from '@/guidelines/_components/ButtonSamples';
import { ModalAnatomy } from '@/guidelines/_components/ModalSamples';
import PopoverMenuMotion from '@/guidelines/_components/PopoverMenuMotion';
import { ChannelHeaderAnatomyStage } from '@/guidelines/_components/ChannelHeaderGuidelineAnatomy';
import { GlobalHeaderAnatomyStage } from '@/guidelines/_components/GlobalHeaderGuidelineAnatomy';
import { TeamSidebarAnatomyStage } from '@/guidelines/_components/TeamSidebarGuidelineAnatomy';
import { ChannelSidebarAnatomyStage } from '@/guidelines/_components/ChannelSidebarGuidelineAnatomy';
import Num from '@/guidelines/_components/Num';
import MdxAnchor from '@/guidelines/_components/MdxAnchor';
import AnatomyStage from '@/guidelines/_components/AnatomyStage';
import Divider from '@/components/ui/Divider/Divider';
import Chip from '@/components/ui/Chip/Chip';

/**
 * Components made globally available inside MDX guideline pages — no import
 * needed in the .mdx file. Add domain-specific helpers here.
 */
const MDX_COMPONENTS = {
  a: MdxAnchor,
  Preview,
  Swatch,
  SwatchGrid,
  SwatchRamp,
  LayoutPreview,
  LayoutPreviewGrid,
  SplitRow,
  TypefaceCard,
  TypeStack,
  TypeSpecimen,
  ScaleTable,
  MarginTable,
  IconShowcase,
  IconSizeRamp,
  IconStyleCompare,
  FiletypeShowcase,
  Principle,
  PrincipleList,
  CoreShapes,
  RadiusRamp,
  ShapeExamples,
  ElevationScale,
  ElevationPopoverExample,
  SpacingScale,
  PaddingExample,
  GridOverlay,
  GridAnatomy,
  BreakpointTable,
  AspectRatios,
  InteractionTargets,
  SidebarOffset,
  DensityCard,
  MotionMatrix,
  PopoverPattern,
  ButtonAnatomy,
  ButtonSizes,
  ButtonEmphasis,
  ButtonStates,
  ButtonInverted,
  ButtonDestructive,
  ButtonWidths,
  ButtonPositioning,
  ModalAnatomy,
  PopoverMenuMotion,
  ChannelHeaderAnatomyStage,
  GlobalHeaderAnatomyStage,
  TeamSidebarAnatomyStage,
  ChannelSidebarAnatomyStage,
  Num,
  AnatomyStage,
  Divider,
  Chip,
};

interface MdxProviderProps {
  children: ReactNode;
}

export default function MdxProvider({ children }: MdxProviderProps) {
  return <MDXProvider components={MDX_COMPONENTS}>{children}</MDXProvider>;
}
