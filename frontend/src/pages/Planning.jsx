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
  List,
  ListItem,
  ListItemText,
  Divider,
  TextField,
  Card,
  CardContent,
  Grid
} from '@mui/material';
import { Timeline, TimelineItem, TimelineSeparator, TimelineConnector, TimelineContent, TimelineDot, TimelineOppositeContent } from '@mui/lab';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SchoolIcon from '@mui/icons-material/School';
import api from '../api/axios';

const Planning = () => {
  const [selectedDate, setSelectedDate] = useState(() => {
    // Initialiser avec la date d'aujourd'hui au format YYYY-MM-DD
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  
  const [formations, setFormations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFormations(selectedDate);
  }, [selectedDate]);

  const fetchFormations = async (date) => {
    try {
      setLoading(true);
      setError(null);
      
      // Dans un vrai projet, appel API avec la date sélectionnée
      // const response = await api.get(`/formateur/planning?date=${date}`);
      
      // Simulation des données pour la démo
      const mockData = [
        {
          id: 1,
          titre: "Introduction JavaScript",
          lieu: "Salle A",
          heure_debut: "09:00",
          heure_fin: "12:00",
          formation_id: 1
        },
        {
          id: 2,
          titre: "React Components",
          lieu: "Salle B",
          heure_debut: "14:00",
          heure_fin: "17:30",
          formation_id: 2
        },
        {
          id: 3,
          titre: "Architecture MVC",
          lieu: "Amphi C",
          heure_debut: "10:30",
          heure_fin: "12:30",
          formation_id: 3
        }
      ];
      
      // Tri par heure de début
      const sortedData = [...mockData].sort((a, b) => {
        return a.heure_debut.localeCompare(b.heure_debut);
      });
      
      setFormations(sortedData);
    } catch (error) {
      console.error("Error fetching planning:", error);
      setError(`Erreur: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  // Formatter l'heure pour affichage
  const formatTime = (time) => {
    return time.replace(":", "h");
  };

  if (loading) return (
    <Box textAlign="center" mt={4}>
      <CircularProgress />
      <Typography mt={2}>Chargement du planning...</Typography>
    </Box>
  );
  
  if (error) return (
    <Box mt={4} p={2}>
      <Alert severity="error">{error}</Alert>
      <Button variant="contained" color="primary" onClick={() => fetchFormations(selectedDate)} sx={{ mt: 2 }}>
        Réessayer
      </Button>
    </Box>
  );

  // Formatter la date pour l'affichage
  const formatDate = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  return (
    <Container maxWidth="lg">
      <Box mb={4} mt={2}>
        <Button 
          variant="outlined" 
          startIcon={<ArrowBackIcon />} 
          component={Link} 
          to="/formateur-animateur"
          sx={{ mb: 2 }}
        >
          Retour au profil
        </Button>
        
        <Typography variant="h4" component="h1" gutterBottom>
          Planning des formations
        </Typography>
      </Box>

      {/* Sélecteur de date */}
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Box display="flex" alignItems="center" flexWrap="wrap" gap={2}>
          <TextField
            id="date"
            label="Sélectionner une date"
            type="date"
            value={selectedDate}
            onChange={handleDateChange}
            InputLabelProps={{
              shrink: true,
            }}
            sx={{ minWidth: 200 }}
          />
          <Typography variant="h6" color="primary" sx={{ ml: 2 }}>
            {formatDate(selectedDate)}
          </Typography>
        </Box>
      </Paper>

      {/* Liste des formations */}
      <Box mb={4}>
        {formations.length === 0 ? (
          <Alert severity="info">
            Aucune formation programmée pour cette date.
          </Alert>
        ) : (
          <>
            <Typography variant="h5" component="h2" gutterBottom>
              Formations du jour
            </Typography>
            
            <Timeline position="alternate">
              {formations.map((formation) => (
                <TimelineItem key={formation.id}>
                  <TimelineOppositeContent color="text.secondary">
                    {formatTime(formation.heure_debut)} - {formatTime(formation.heure_fin)}
                  </TimelineOppositeContent>
                  <TimelineSeparator>
                    <TimelineDot color="primary">
                      <SchoolIcon />
                    </TimelineDot>
                    <TimelineConnector />
                  </TimelineSeparator>
                  <TimelineContent>
                    <Paper elevation={3} sx={{ p: 2, backgroundColor: 'rgba(0, 0, 0, 0.02)' }}>
                      <Typography variant="h6" component="h3">
                        {formation.titre}
                      </Typography>
                      <Box display="flex" alignItems="center" mt={1}>
                        <LocationOnIcon fontSize="small" color="action" />
                        <Typography variant="body2" sx={{ ml: 1 }}>
                          {formation.lieu}
                        </Typography>
                      </Box>
                    </Paper>
                  </TimelineContent>
                </TimelineItem>
              ))}
            </Timeline>

            {/* Vue alternative en cartes */}
            <Box mt={4}>
              <Typography variant="h6" gutterBottom>
                Vue détaillée
              </Typography>
              <Grid container spacing={2}>
                {formations.map((formation) => (
                  <Grid item xs={12} md={4} key={`card-${formation.id}`}>
                    <Card elevation={2}>
                      <CardContent>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                          <Typography variant="subtitle1" color="primary" fontWeight="bold">
                            {formatTime(formation.heure_debut)} - {formatTime(formation.heure_fin)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {Math.round((new Date(`2000-01-01T${formation.heure_fin}:00`) - new Date(`2000-01-01T${formation.heure_debut}:00`)) / (1000 * 60))} min
                          </Typography>
                        </Box>
                        <Typography variant="h6" gutterBottom>
                          {formation.titre}
                        </Typography>
                        <Box display="flex" alignItems="center">
                          <LocationOnIcon fontSize="small" color="action" />
                          <Typography variant="body2" sx={{ ml: 1 }}>
                            {formation.lieu}
                          </Typography>
                        </Box>
                        <Button
                          variant="outlined"
                          size="small"
                          component={Link}
                          to={`/formations/${formation.formation_id}`}
                          sx={{ mt: 2 }}
                        >
                          Détails
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </>
        )}
      </Box>
    </Container>
  );
};

export default Planning; 