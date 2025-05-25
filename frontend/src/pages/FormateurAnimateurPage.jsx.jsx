// src/pages/FormateurDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, Alert, Button } from '@mui/material';
import FormationList from '../components/FormateurAnimateur/FormationList';
import FormationDetails from '../components/FormateurAnimateur/FormationDetails';
import PresenceDialog from '../components/FormateurAnimateur/PresenceDialog';
import RessourceDialog from '../components/FormateurAnimateur/RessourceDialog';
import api from '../api/axios';

const FormateurDashboard = () => {
  const [formations, setFormations] = useState([]);
  const [selectedFormation, setSelectedFormation] = useState(null);
  const [openPresenceDialog, setOpenPresenceDialog] = useState(false);
  const [openRessourceDialog, setOpenRessourceDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [presenceData, setPresenceData] = useState({ formateur_id: '', date: '', statut: 'present', commentaire: '' });
  const [ressourceData, setRessourceData] = useState({ titre: '', type: '', chemin_fichier: '', description: '' });

  useEffect(() => { 
    console.log("FormateurDashboard mounted");
    fetchFormations(); 
  }, []);

  const fetchFormations = async () => {
    console.log("Fetching formations...");
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/api/formateur/formations');
      console.log("API response:", response.data);
      setFormations(response.data);
    } catch (error) {
      console.error("Error fetching formations:", error);
      setError(`Erreur: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFormationClick = async (id) => {
    try {
      const res = await api.get(`/api/formateur/formations/${id}`);
      setSelectedFormation(res.data);
    } catch (e) { console.error(e); }
  };

  const handleMarquerPresence = async () => {
    try {
      await api.post(`/api/formateur/formations/${selectedFormation.id}/presences`, presenceData);
      setOpenPresenceDialog(false);
    } catch (e) { console.error(e); }
  };

  const handleAjouterRessource = async () => {
    try {
      await api.post(`/api/formateur/formations/${selectedFormation.id}/ressources`, ressourceData);
      setOpenRessourceDialog(false);
      handleFormationClick(selectedFormation.id);
    } catch (e) { console.error(e); }
  };

  const handleRetry = () => {
    fetchFormations();
  };

  if (loading) return (
    <Box textAlign="center" mt={4}>
      <CircularProgress />
      <Typography mt={2}>Chargement des formations...</Typography>
    </Box>
  );
  
  if (error) return (
    <Box mt={4} p={2}>
      <Alert severity="error">{error}</Alert>
      <Button variant="contained" color="primary" onClick={handleRetry} sx={{ mt: 2 }}>
        Réessayer
      </Button>
    </Box>
  );

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>Mes Formations</Typography>
      
      {formations.length === 0 ? (
        <Alert severity="info">Aucune formation trouvée.</Alert>
      ) : (
        <FormationList formations={formations} onSelect={handleFormationClick} />
      )}

      {selectedFormation && (
        <FormationDetails
          formation={selectedFormation}
          onMarkPresence={() => setOpenPresenceDialog(true)}
          onAddRessource={() => setOpenRessourceDialog(true)}
        />
      )}

      <PresenceDialog
        open={openPresenceDialog}
        onClose={() => setOpenPresenceDialog(false)}
        onSubmit={handleMarquerPresence}
        data={presenceData}
        setData={setPresenceData}
      />

      <RessourceDialog
        open={openRessourceDialog}
        onClose={() => setOpenRessourceDialog(false)}
        onSubmit={handleAjouterRessource}
        data={ressourceData}
        setData={setRessourceData}
      />
    </Box>
  );
};

export default FormateurDashboard;
