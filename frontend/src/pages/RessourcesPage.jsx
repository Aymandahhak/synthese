import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  CircularProgress, 
  Alert,
  Container,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import api from '../api/axios';

const RessourcesPage = () => {
  const [ressources, setRessources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("Tentative de récupération des ressources...");
      
      // Appel API réel au backend - sans le préfixe /api qui est déjà dans baseURL
      const response = await api.get('/ressources');
      console.log("Ressources reçues:", response.data);
      setRessources(response.data);
      
    } catch (error) {
      console.error("Error fetching data:", error);
      setError(`Erreur: ${error.response?.data?.message || error.message}. Assurez-vous que le serveur backend est démarré sur http://localhost:8000.`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <Box textAlign="center" mt={4}>
      <CircularProgress />
      <Typography mt={2}>Chargement des ressources...</Typography>
    </Box>
  );
  
  if (error) return (
    <Box mt={4} p={2}>
      <Alert severity="error">{error}</Alert>
      <Button variant="contained" color="primary" onClick={fetchData} sx={{ mt: 2 }}>
        Réessayer
      </Button>
    </Box>
  );

  return (
    <Container maxWidth="lg">
      <Box mb={4} mt={2}>
        <Button 
          variant="outlined" 
          component={Link} 
          to="/formateur-animateur"
          sx={{ mb: 2 }}
        >
          Retour au profil
        </Button>
        
        <Typography variant="h4" component="h1" gutterBottom>
          Gestion des ressources pédagogiques
        </Typography>
      </Box>

      {/* Liste des ressources */}
      <Box mb={4}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5" component="h2">
            Ressources disponibles
          </Typography>
        </Box>

        {ressources.length === 0 ? (
          <Alert severity="info">Aucune ressource disponible.</Alert>
        ) : (
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="table des ressources">
              <TableHead>
                <TableRow>
                  <TableCell>Formation</TableCell>
                  <TableCell>Titre</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Date d'ajout</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {ressources.map((ressource) => (
                  <TableRow key={ressource.id}>
                    <TableCell>{ressource.formation_titre}</TableCell>
                    <TableCell>{ressource.titre}</TableCell>
                    <TableCell>{ressource.type}</TableCell>
                    <TableCell>{ressource.description}</TableCell>
                    <TableCell>{ressource.date_ajout}</TableCell>
                    <TableCell align="center">
                      <Button 
                        size="small" 
                        variant="outlined" 
                        href={ressource.lien} 
                        target="_blank"
                        color="primary"
                      >
                        Consulter
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    </Container>
  );
};

export default RessourcesPage; 