/**
 * DPC shared module barrel.
 * Stage 2 agents should import from `@/pages/dpc/shared` rather than
 * reaching into individual files.
 */
export {
  PERSONAS,
  PERSONA_ORDER,
  SUPPORTING_USERS,
  CHANNELS,
  ABAC_POLICIES,
  ABAC_POLICY_ORDER,
  SEED_AUDIT_EVENTS,
  APPROACH_SUMMARIES,
  makeAudit,
} from './fixtures';
export type {
  Persona,
  PersonaInfo,
  SupportingUser,
  ChannelKind,
  ChannelFixture,
  AbacRule,
  AbacPolicy,
  AuditOutcome,
  AuditEvent,
  AuditEventInput,
  ApproachId,
  ApproachSummary,
} from './fixtures';

export {
  PersonaProvider,
  usePersona,
} from './PersonaContext';
export type { PersonaProviderProps } from './PersonaContext';

export {
  ViewportProvider,
  useViewport,
  VIEWPORT_WIDTHS,
} from './ViewportContext';
export type { Viewport, ViewportProviderProps } from './ViewportContext';

export { default as ScenarioHeader } from './ScenarioHeader';
export type { ScenarioHeaderProps } from './ScenarioHeader';

export { default as PrototypeShell } from './PrototypeShell';
export type { PrototypeShellProps } from './PrototypeShell';
