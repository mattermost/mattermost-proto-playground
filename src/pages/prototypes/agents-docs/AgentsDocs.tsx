import { Navigate, Route, Routes } from 'react-router-dom';
import AgentChat from '../agents/products/agents-app/AgentChat';
import AgentsLanding from '../agents/products/agents-app/AgentsLanding';
import ChannelsAgentDm from '../agents/products/channels/ChannelsAgentDm';
import { AgentsProvider } from '../agents/context/AgentsContext';
import AgentsDocsShell from './AgentsDocsShell';

export default function AgentsDocs() {
  return (
    <AgentsProvider>
      <Routes>
        <Route element={<AgentsDocsShell />}>
          <Route index element={null} />
          <Route path="dm/:agentId" element={<ChannelsAgentDm />} />
          <Route path="channel/:channelId" element={null} />
          <Route path="agents/:agentId" element={<AgentChat />} />
          <Route path="agents" element={<AgentsLanding />} />
          <Route path="*" element={<Navigate to="." replace />} />
        </Route>
      </Routes>
    </AgentsProvider>
  );
}
