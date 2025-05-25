import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  CircularProgress, 
  Alert,
  Container,
  Paper,
  Grid,
  Avatar,
  Card,
  CardContent,
  CardMedia,
  Button,
  Divider,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Rating,
  Snackbar
} from '@mui/material';
import api from '../api/axios';

const FormateurParticipantPage = () => {
  const [formateur, setFormateur] = useState({
    id: 2,
    nom: 'Dupont',
    prenom: 'Simon',
    email: 'simon.dupont@example.com',
    specialite: 'Développement Web',
    role: 'Participant',
    photo: 'https://i.pravatar.cc/300?img=70'
  });
  
  const [formations, setFormations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // États pour le système de feedback
  const [openFeedbackDialog, setOpenFeedbackDialog] = useState(false);
  const [selectedFormation, setSelectedFormation] = useState(null);
  const [feedbackData, setFeedbackData] = useState({
    note: 0,
    commentaire: '',
    formation_id: null,
    participant_id: 2, // ID du participant actuel
  });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    fetchFormations();
  }, []);

  const fetchFormations = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/formateur/formations');
      setFormations(response.data);
    } catch (error) {
      console.error("Error fetching formations:", error);
      setError(`Erreur: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Gestion du dialog de feedback
  const handleOpenFeedbackDialog = (formation) => {
    setSelectedFormation(formation);
    setFeedbackData({
      ...feedbackData,
      formation_id: formation.id
    });
    setOpenFeedbackDialog(true);
  };
  
  const handleCloseFeedbackDialog = () => {
    setOpenFeedbackDialog(false);
  };
  
  const handleFeedbackChange = (e) => {
    const { name, value } = e.target;
    setFeedbackData({
      ...feedbackData,
      [name]: value
    });
  };
  
  const handleRatingChange = (event, newValue) => {
    setFeedbackData({
      ...feedbackData,
      note: newValue
    });
  };
  
  const handleSubmitFeedback = async () => {
    try {
      await api.post('/feedbacks', feedbackData);
      setSnackbarMessage('Votre retour a été envoyé avec succès!');
      setSnackbarOpen(true);
      setOpenFeedbackDialog(false);
    } catch (error) {
      setSnackbarMessage("Une erreur s'est produite. Veuillez réessayer.");
      setSnackbarOpen(true);
    }
  };
  
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  if (loading) return (
    <Box textAlign="center" mt={4}>
      <CircularProgress />
      <Typography mt={2}>Chargement du profil participant...</Typography>
    </Box>
  );
  
  if (error) return (
    <Box mt={4} p={2}>
      <Alert severity="error">{error}</Alert>
      <Button variant="contained" color="primary" onClick={fetchFormations} sx={{ mt: 2 }}>
        Réessayer
      </Button>
    </Box>
  );

  return (
    <Container maxWidth="lg">
      {/* Profil du participant */}
      <Paper elevation={3} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={3}>
            <Avatar 
              src={formateur.photo} 
              alt={`${formateur.prenom} ${formateur.nom}`}
              sx={{ width: 120, height: 120, mb: 2 }}
            />
          </Grid>
          <Grid item xs={12} md={9}>
            <Typography variant="h3" component="h1" gutterBottom>
              {formateur.prenom} {formateur.nom}
            </Typography>
            <Typography variant="h5" color="textSecondary" gutterBottom>
              {formateur.role}
            </Typography>
            <Typography variant="body1" paragraph>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elementum dictum velit, vitae mollis dui accumsan eu.
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Navigation */}
      {/* <Box mb={4}>
        <Button 
          variant="contained" 
          component={Link} 
          to="/formateur-participant"
          sx={{ mr: 2 }}
        >
          Mes formations
        </Button>
      </Box> */}

      {/* Liste des formations */}
      <Typography variant="h4" component="h2" gutterBottom>
        Mes formations
      </Typography>

      {formations.length === 0 ? (
        <Alert severity="info">Aucune formation trouvée.</Alert>
      ) : (
        <Grid container spacing={3}>
          {formations.map((formation, index) => (
            <Grid item xs={12} md={4} key={formation.id || index}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardMedia
                  component="img"
                  height="140"
                  image={formation.photo ? `/formations/${formation.photo}` : '/formations/default.jpg'}
                  alt={formation.titre || `Formation ${index + 1}`}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h5" component="h3">
                    {formation.titre || `Formation ${index + 1}`}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formation.description || "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elementum dictum velit."}
                  </Typography>
                  <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                    <Button 
                      variant="contained" 
                      size="small"
                      component={Link}
                      to={`/formations/${formation.id || index + 1}`}
                    >
                      Consulter
                    </Button>
                    <Button 
                      variant="outlined" 
                      size="small"
                      onClick={() => handleOpenFeedbackDialog(formation)}
                      color="secondary"
                    >
                      Envoyer un retour
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      
      {/* Dialog pour envoyer un feedback */}
      <Dialog open={openFeedbackDialog} onClose={handleCloseFeedbackDialog} fullWidth maxWidth="sm">
        <DialogTitle>
          Envoyer un retour pour {selectedFormation?.titre}
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Partagez votre expérience et vos suggestions pour nous aider à améliorer cette formation.
          </DialogContentText>
          
          <Box sx={{ mb: 3 }}>
            <Typography component="legend">Note</Typography>
            <Rating
              name="note"
              value={feedbackData.note}
              onChange={handleRatingChange}
              precision={0.5}
              size="large"
            />
          </Box>
          
          <TextField
            autoFocus
            name="commentaire"
            label="Commentaire"
            fullWidth
            multiline
            rows={4}
            value={feedbackData.commentaire}
            onChange={handleFeedbackChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseFeedbackDialog}>Annuler</Button>
          <Button 
            onClick={handleSubmitFeedback} 
            variant="contained" 
            color="primary"
            disabled={feedbackData.note === 0}
          >
            Envoyer
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar pour les notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
        action={
          <Button color="secondary" size="small" onClick={handleSnackbarClose}>
            Fermer
          </Button>
        }
      />
    </Container>
  );
};

export default FormateurParticipantPage;
