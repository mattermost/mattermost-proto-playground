import { Navigate, Route, Routes } from 'react-router-dom';
import AutomationsShell from './AutomationsShell';
import { AutomationsProvider } from './context/AutomationsContext';
import HomePage from './components/home/HomePage';
import FoldersPage from './components/folders/FoldersPage';
import TemplatesPage from './components/templates/TemplatesPage';
import SecretsPage from './components/secrets/SecretsPage';
import WorkflowEditor from './components/editor/WorkflowEditor';
import AllRunsPage from './components/history/AllRunsPage';
import RunsPage from './components/history/RunsPage';
import RunDetailPage from './components/history/RunDetailPage';
import ChangeHistoryPage from './components/history/ChangeHistoryPage';

/**
 * Automations product prototype — nested under `/prototypes/automations/*`.
 * A single shell wraps all child routes so the AI assistant persists.
 */
export default function Automations() {
  return (
    <AutomationsProvider>
      <Routes>
        <Route element={<AutomationsShell />}>
          <Route index element={<HomePage />} />
          <Route path="folders" element={<FoldersPage />} />
          <Route path="templates" element={<TemplatesPage />} />
          <Route path="secrets" element={<SecretsPage />} />
          <Route path="runs" element={<AllRunsPage />} />
          <Route path=":id/editor" element={<WorkflowEditor />} />
          <Route path=":id/runs" element={<RunsPage />} />
          <Route path=":id/runs/:runId" element={<RunDetailPage />} />
          <Route path=":id/history" element={<ChangeHistoryPage />} />
          <Route path="*" element={<Navigate to="." replace />} />
        </Route>
      </Routes>
    </AutomationsProvider>
  );
}
