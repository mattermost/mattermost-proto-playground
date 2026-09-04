import { Navigate, Route, Routes } from 'react-router-dom';
import AgentsShell from './AgentsShell';
import { AgentsProvider } from './context/AgentsContext';
import AgentsLanding from './products/agents-app/AgentsLanding';
import ChannelsHome from './products/channels/ChannelsHome';

/**
 * Agents vision prototype — nested under `/prototypes/agents/*`.
 * Slice 1: Product Sidebar, Channels home, Meet your first agent, New agent modal.
 */
export default function Agents() {
  return (
    <AgentsProvider>
      <Routes>
        <Route element={<AgentsShell />}>
          <Route index element={<ChannelsHome />} />
          <Route path="agents" element={<AgentsLanding />} />
          <Route path="*" element={<Navigate to="." replace />} />
        </Route>
      </Routes>
    </AgentsProvider>
  );
}
