import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import './index.css';
import App from './App.tsx';
import ProjectNotice from './components/ProjectNotice.tsx';
import LeaderboardPage from './pages/LeaderboardPage.tsx';
import RetirementPage from './pages/RetirementPage.tsx';

const base = import.meta.env.BASE_URL || '/';

function HomePage() {
  const location = useLocation();

  if (new URLSearchParams(location.search).has('wallet')) {
    return <Navigate to={{ pathname: '/stats', search: location.search, hash: location.hash }} replace />;
  }

  return <RetirementPage />;
}

function LegacyStatsPage() {
  return (
    <>
      <ProjectNotice />
      <App />
    </>
  );
}

function LegacyLeaderboardPage() {
  return (
    <>
      <ProjectNotice />
      <LeaderboardPage />
    </>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename={base}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/stats" element={<LegacyStatsPage />} />
        <Route path="/leaderboard" element={<LegacyLeaderboardPage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
