// src/App.jsx
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import FormateurAnimateurPage from './pages/FormateurAnimateurPage';
import FormateurParticipantPage from './pages/FormateurParticipantPage';
import AbsencesPage from './pages/AbsencesPage';
import RessourcesPage from './pages/RessourcesPage';
import EvaluationList from './pages/EvaluationList';
import Planning from './pages/Planning';
import Parametres from './pages/Parametres';
import api from './api/axios';

const App = () => {
  const [apiStatus, setApiStatus] = useState(null);

  useEffect(() => {
    console.log("App component mounted");
    api.get('/test')
      .then(response => {
        console.log('API fonctionne:', response.data);
        setApiStatus({ success: true, data: response.data });
      })
      .catch(error => {
        console.error('Erreur API:', error);
        setApiStatus({ success: false, error: error.message });
      });
  }, []);

  // Dans un vrai projet, ce choix serait déterminé par l'authentification
  // Pour l'instant, nous simulons un formateur animateur pour la démo
  const userRole = 'animateur'; // ou 'participant'

  return (
    <Router>
      <div style={{ padding: '20px' }}>
        {apiStatus && apiStatus.success === false && (
          <div style={{ 
            margin: '20px 0', 
            padding: '10px', 
            backgroundColor: '#f8d7da', 
            borderRadius: '5px' 
          }}>
            <p>Erreur API: {apiStatus.error}</p>
          </div>
        )}
        
        <Routes>
          <Route path="/" element={
            userRole === 'animateur' 
              ? <Navigate to="/formateur-animateur" replace /> 
              : <Navigate to="/formateur-participant" replace />
          } />
          <Route path="/formateur-animateur" element={<FormateurAnimateurPage />} />
          <Route path="/formateur-participant" element={<FormateurParticipantPage />} />
          <Route path="/absences" element={<AbsencesPage />} />
          <Route path="/ressources" element={<RessourcesPage />} />
          <Route path="/evaluations" element={<EvaluationList />} />
          <Route path="/planning" element={<Planning />} />
          <Route path="/parametres" element={<Parametres />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
