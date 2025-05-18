import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';

import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Common components
import Header from './components/common/Header';

// Home page components
import Landing from './components/home-page/Landing';

// Responsable Formation layout and pages
import Layout from './components/responsable-formation/Layout';
import ResponsableFormationDashboard from './pages/responsable-formation/Dashboard';
import PlanifierSession from './pages/responsable-formation/PlanifierSession';
import SessionsList from './pages/responsable-formation/SessionsList';
import ValidationSessionsPage from './pages/responsable-formation/ValidationSessions';
import Absences from './pages/responsable-formation/Absences';
import Documents from './pages/responsable-formation/Documents';
import Logistics from './pages/responsable-formation/Logistics';
import ReportsPage from './pages/responsable-formation/Reports';
import LoginPage from './pages/login/LoginPage';
//responsable_cdc
import FormationPage from './pages/responsable-cdc/FormationPage';
import ResponsableCdcDashboard from './pages/responsable-cdc/ResponsableCdcDashboard';
import SideBar from './pages/responsable-cdc/SideBar';
import ResponsablePage from './pages/responsable-cdc/ResponsablePage';
import FormateursFormationPage from './pages/responsable-cdc/FormateursFormationPage';
import ParticipantsPage from './pages/responsable-cdc/ParticipantsPage';
import FormateurAnimateurPage from './pages/responsable-cdc/FormateurAnimateurPage';

// Responsable DR pages
import DashboardPage from './pages/responsable-dr/DashboardPage';
import AbsencesPage from './pages/responsable-dr/AbsencesPage';
import DrFormationPage from './pages/responsable-dr/FormationPage';
import RapportDr from './pages/responsable-dr/RapportDr';

// RequireAuth component
function RequireAuth({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  if (isLoading) return null; // Or a loading spinner
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Routes>
          {/* Home route with Header */}
          <Route path="/" element={
            <>
              <Header />
              <Landing />
            </>
          } />

          {/* Login route */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* Profile route - Main responsable formation dashboard */}
          <Route path="/profile/*" element={
            <RequireAuth>
              <Layout />
            </RequireAuth>
          }>
            <Route index element={<ResponsableFormationDashboard />} />
            <Route path="dashboard" element={<ResponsableFormationDashboard />} />
            <Route path="planifier" element={<PlanifierSession />} />
            <Route path="sessions" element={<SessionsList />} />
            <Route path="validation" element={<ValidationSessionsPage />} />
            <Route path="absences" element={<Absences />} />
            <Route path="documents" element={<Documents />} />
            <Route path="logistics" element={<Logistics />} />
            <Route path="rapports" element={<ReportsPage />} />
          </Route>
          
          {/* RP route alias for the responsable-formation */}
          <Route path="/rp/*" element={<Layout />}>
            <Route index element={<ResponsableFormationDashboard />} />
            <Route path="dashboard" element={<ResponsableFormationDashboard />} />
            <Route path="planifier" element={<PlanifierSession />} />
            <Route path="sessions" element={<SessionsList />} />
            <Route path="validation" element={<ValidationSessionsPage />} />
            <Route path="absences" element={<Absences />} />
            <Route path="documents" element={<Documents />} />
            <Route path="logistics" element={<Logistics />} />
            <Route path="rapports" element={<ReportsPage />} />
          </Route>
          {/* responsable_cdc */}
           <Route path="/responsable-cdc">
                <Route path="formation" element={<FormationPage />} />
                <Route path="dashboard" element={<ResponsableCdcDashboard />} />
                <Route path="sidebar" element={<SideBar />} />
                <Route path="responsable" element={< ResponsablePage/>} />
                <Route path="participants" element={< ParticipantsPage/>} />
                <Route path="formateurs-formation/:formationId" element={<FormateursFormationPage />} />
                <Route path="formateur_animateur" element={<FormateurAnimateurPage/>} />
            </Route>

          {/* Responsable DR routes */}
          <Route path="/responsable-dr">
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="absences" element={<AbsencesPage />} />
            <Route path="formation" element={<DrFormationPage />} />
            <Route path="rapports" element={<RapportDr />} />
            </Route>

        </Routes>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
