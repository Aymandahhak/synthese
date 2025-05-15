import React from 'react';
import { Container, Card, Row, Col } from 'react-bootstrap';
import SideBar from './SideBar';
import { Routes, Route } from 'react-router-dom';
import ResponsableCdcDashboard from './ResponsableCdcDashboard';
import FormationPage from './FormationPage';
import ParticipantsPage from './ParticipantsPage';
import FormateurAnimateurPage from './FormateurAnimateurPage';
import FormateursFormationPage from './FormateursFormationPage';

const ResponsablePage = () => {
  return (
    <SideBar>
      <Routes>
        <Route path="dashboard" element={<ResponsableCdcDashboard />} />
        <Route path="formation" element={<FormationPage />} />
        <Route path="participants" element={<ParticipantsPage />} />
        <Route path="formateur_animateur" element={<FormateurAnimateurPage />} />
        <Route path="formateurs-formation" element={<FormateursFormationPage />} />
        <Route index element={<ResponsableCdcDashboard />} />
      </Routes>
    </SideBar>
  );
};

export default ResponsablePage;