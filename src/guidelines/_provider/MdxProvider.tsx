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
import { AdminConsoleSidebarAnatomyStage } from '@/guidelines/_components/AdminConsoleSidebarGuidelineAnatomy';
import { MobileNavigationBarAnatomyStage } from '@/guidelines/_components/MobileNavigationBarGuidelineAnatomy';
import { MobileModalNavigationBarAnatomyStage } from '@/guidelines/_components/MobileModalNavigationBarGuidelineAnatomy';
import { MobileModalAnatomyStage } from '@/guidelines/_components/MobileModalGuidelineAnatomy';
import { MobileMessageInputAnatomyStage } from '@/guidelines/_components/MobileMessageInputGuidelineAnatomy';
import { MobileMessageAnatomyStage } from '@/guidelines/_components/MobileMessageGuidelineAnatomy';
import { MobileBottomSheetAnatomyStage } from '@/guidelines/_components/MobileBottomSheetGuidelineAnatomy';
import Num from '@/guidelines/_components/Num';
import MdxAnchor from '@/guidelines/_components/MdxAnchor';
import AnatomyStage from '@/guidelines/_components/AnatomyStage';
import { Divider } from '@mattermost/compass-ui';
import { Chip } from '@mattermost/compass-ui';
import { Combobox } from '@mattermost/compass-ui';
import GuidelineSampleRow from '@/guidelines/_components/GuidelineSampleRow';
import DocUiEmbed from '@/pages/_shell/DocUiEmbed';

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
  AdminConsoleSidebarAnatomyStage,
  MobileNavigationBarAnatomyStage,
  MobileModalNavigationBarAnatomyStage,
  MobileModalAnatomyStage,
  MobileMessageInputAnatomyStage,
  MobileMessageAnatomyStage,
  MobileBottomSheetAnatomyStage,
  Num,
  AnatomyStage,
  Divider,
  Chip,
  Combobox,
  DocUiEmbed,
  /** Horizontal flex row for guideline inline demos; use instead of raw `<div style={{display:'flex',…}}>`. */
  SampleRow: GuidelineSampleRow,
};

interface MdxProviderProps {
  children: ReactNode;
}

export default function MdxProvider({ children }: MdxProviderProps) {
  return <MDXProvider components={MDX_COMPONENTS}>{children}</MDXProvider>;
}
