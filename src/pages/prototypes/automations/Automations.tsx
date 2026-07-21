import { Navigate, Route, Routes } from 'react-router-dom';
import type { ReactNode } from 'react';
import AutomationsShell from './AutomationsShell';
import { AutomationsProvider } from './context/AutomationsContext';
import HomePage from './components/home/HomePage';
import TemplatesPage from './components/templates/TemplatesPage';
import WorkflowEditor from './components/editor/WorkflowEditor';
import RunsPage from './components/history/RunsPage';
import RunDetailPage from './components/history/RunDetailPage';
import ChangeHistoryPage from './components/history/ChangeHistoryPage';

function BrowseLayout({ children }: { children: ReactNode }) {
  return <AutomationsShell showProductNav>{children}</AutomationsShell>;
}

function FocusLayout({ children }: { children: ReactNode }) {
  return <AutomationsShell showProductNav={false}>{children}</AutomationsShell>;
}

/**
 * Automations product prototype — nested under `/prototypes/automations/*`.
 */
export default function Automations() {
  return (
    <AutomationsProvider>
      <Routes>
        <Route
          index
          element={
            <BrowseLayout>
              <HomePage />
            </BrowseLayout>
          }
        />
        <Route
          path="templates"
          element={
            <BrowseLayout>
              <TemplatesPage />
            </BrowseLayout>
          }
        />
        <Route
          path=":id/editor"
          element={
            <FocusLayout>
              <WorkflowEditor />
            </FocusLayout>
          }
        />
        <Route
          path=":id/runs"
          element={
            <FocusLayout>
              <RunsPage />
            </FocusLayout>
          }
        />
        <Route
          path=":id/runs/:runId"
          element={
            <FocusLayout>
              <RunDetailPage />
            </FocusLayout>
          }
        />
        <Route
          path=":id/history"
          element={
            <FocusLayout>
              <ChangeHistoryPage />
            </FocusLayout>
          }
        />
        <Route path="*" element={<Navigate to="." replace />} />
      </Routes>
    </AutomationsProvider>
  );
}
