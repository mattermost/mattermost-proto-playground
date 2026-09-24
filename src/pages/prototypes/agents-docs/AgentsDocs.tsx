import { Navigate, Route, Routes } from 'react-router-dom';
import AgentChat from '../agents/products/agents-app/AgentChat';
import AgentsLanding from '../agents/products/agents-app/AgentsLanding';
import ChannelsAgentDm from '../agents/products/channels/ChannelsAgentDm';
import { AgentsProvider } from '../agents/context/AgentsContext';
import { MATTY, CODER, REVIEWER, WRITER, DOCS_WORKSPACE_AGENTS } from './agentsDocsData';
import { AGENTS_DOCS_BASE } from './agentsDocsScenes';
import AgentsDocsShell from './AgentsDocsShell';

const DOCS_FTE_AGENTS = [MATTY, WRITER, CODER, REVIEWER] as const;

export default function AgentsDocs() {
  return (
    <AgentsProvider initialAgents={DOCS_WORKSPACE_AGENTS}>
      <Routes>
        <Route element={<AgentsDocsShell />}>
          <Route index element={null} />
          <Route path="dm/:agentId" element={<ChannelsAgentDm basePath={AGENTS_DOCS_BASE} />} />
          <Route path="channel/:channelId" element={null} />
          <Route path="agents/:agentId" element={<AgentChat basePath={AGENTS_DOCS_BASE} />} />
          <Route path="agents" element={<AgentsLanding basePath={AGENTS_DOCS_BASE} fteAgents={DOCS_FTE_AGENTS} forceFte />} />
          <Route path="*" element={<Navigate to="." replace />} />
        </Route>
      </Routes>
    </AgentsProvider>
  );
}
