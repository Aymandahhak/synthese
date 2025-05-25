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
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Badge,
  List,
  ListItem,
  ListItemText,
  Divider,
  Rating
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import MailIcon from '@mui/icons-material/Mail';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import api from '../api/axios';

const FormateurAnimateurPage = () => {
  const [formateur, setFormateur] = useState({
    id: 1,
    nom: 'Durand',
    prenom: 'Alex',
    email: 'alex@example.com',
    specialite: 'Pédagogie active',
    role: 'Animateur Formateur',
    photo: 'https://i.pravatar.cc/300'
  });
  
  const [formations, setFormations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // États pour la boîte de réception des retours
  const [feedbacks, setFeedbacks] = useState([]);
  const [openFeedbacksDialog, setOpenFeedbacksDialog] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [openFeedbackDetailDialog, setOpenFeedbackDetailDialog] = useState(false);

  useEffect(() => {
    fetchFormations();
    fetchFeedbacks();
  }, []);

  const fetchFormations = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/formateur/formations');
      
      // Utiliser des données factices si l'API ne retourne rien pour la démonstration
      if (!response.data || response.data.length === 0) {
        const mockData = [
          { 
            id: 1, 
            titre: 'Formation JavaScript', 
            description: 'Les fondamentaux de JavaScript',
            date_debut: '2023-10-01',
            date_fin: '2023-10-15',
            duree_heures: 30,
            lieu: 'Salle A'
          },
          { 
            id: 2, 
            titre: 'Formation React', 
            description: 'Développement d\'applications avec React',
            date_debut: '2023-11-05',
            date_fin: '2023-11-20',
            duree_heures: 40,
            lieu: 'Salle B'
          },
          { 
            id: 3, 
            titre: 'Architecture MVC', 
            description: 'Les principes de l\'architecture MVC',
            date_debut: '2023-12-10',
            date_fin: '2023-12-20',
            duree_heures: 25,
            lieu: 'Salle C'
          }
        ];
        setFormations(mockData);
      } else {
        setFormations(response.data);
      }
    } catch (error) {
      console.error("Error fetching formations:", error);
      setError(`Erreur: ${error.response?.data?.message || error.message}`);
      
      // Utiliser des données factices en cas d'erreur
      const mockData = [
        { 
          id: 1, 
          titre: 'Formation JavaScript', 
          description: 'Les fondamentaux de JavaScript',
          date_debut: '2023-10-01',
          date_fin: '2023-10-15',
          duree_heures: 30,
          lieu: 'Salle A'
        },
        { 
          id: 2, 
          titre: 'Formation React', 
          description: 'Développement d\'applications avec React',
          date_debut: '2023-11-05',
          date_fin: '2023-11-20',
          duree_heures: 40,
          lieu: 'Salle B'
        }
      ];
      setFormations(mockData);
    } finally {
      setLoading(false);
    }
  };

  const fetchFeedbacks = async () => {
    try {
      // Remplacer 1 par l'ID du formateur connecté si besoin
      const response = await api.get(`/feedbacks?formateur_id=${formateur.id}`);
      setFeedbacks(response.data);
    } catch (e) {
      setFeedbacks([]);
    }
  };

  const handleOpenFeedbacksDialog = () => {
    setOpenFeedbacksDialog(true);
  };

  const handleCloseFeedbacksDialog = () => {
    setOpenFeedbacksDialog(false);
  };

  const handleOpenFeedbackDetail = (feedback) => {
    setSelectedFeedback(feedback);
    
    // Marquer comme lu
    setFeedbacks(feedbacks.map(f => 
      f.id === feedback.id ? { ...f, lu: true } : f
    ));
    
    setOpenFeedbackDetailDialog(true);
  };

  const handleCloseFeedbackDetailDialog = () => {
    setOpenFeedbackDetailDialog(false);
  };

  const getUnreadFeedbacksCount = () => {
    return feedbacks.filter(f => !f.lu).length;
  };

  if (loading) return (
    <Box textAlign="center" mt={4}>
      <CircularProgress />
      <Typography mt={2}>Chargement du profil formateur...</Typography>
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
      {/* Profil du formateur */}
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
              Rôle : {formateur.role}
            </Typography>
            <Typography variant="body1" paragraph>
              {formateur.email}
            </Typography>
            <Typography variant="body1">
              Spécialité : {formateur.specialite}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Navigation */}
      <Paper elevation={3} sx={{ p: 2, mb: 4, borderRadius: 2 }}>
        <Grid container spacing={2} justifyContent="center">
          <Grid item>
            <Button variant="contained" component={Link} to="/formateur-animateur">
              Mes Formations
            </Button>
          </Grid>
          <Grid item>
            <Button variant="outlined" component={Link} to="/absences">
              Absences
            </Button>
          </Grid>
          <Grid item>
            <Button variant="outlined" component={Link} to="/ressources">
              Ressources
            </Button>
          </Grid>
          <Grid item>
            <Badge badgeContent={getUnreadFeedbacksCount()} color="error">
              <Button 
                variant="outlined" 
                onClick={handleOpenFeedbacksDialog}
                startIcon={<MailIcon />}
              >
                Retours
              </Button>
            </Badge>
          </Grid>
          <Grid item>
            <Button variant="outlined" component={Link} to="/evaluations">
              Évaluations
            </Button>
          </Grid>
          <Grid item>
            <Button variant="outlined" component={Link} to="/planning">
              Planning
            </Button>
          </Grid>
          <Grid item>
            <Button variant="outlined" component={Link} to="/hebergement">
              Hébergement
            </Button>
          </Grid>
          <Grid item>
            <Button variant="outlined" component={Link} to="/parametres">
              Paramètres
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Liste des formations en tableau */}
      <Box mb={4}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h4" component="h2">
            Mes formations
          </Typography>
        </Box>

        {formations.length === 0 ? (
          <Alert severity="info">Aucune formation trouvée.</Alert>
        ) : (
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="table des formations">
              <TableHead>
                <TableRow>
                  <TableCell>Titre</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Date début</TableCell>
                  <TableCell>Date fin</TableCell>
                  <TableCell>Durée (heures)</TableCell>
                  <TableCell>Lieu</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {formations.map((formation) => (
                  <TableRow key={formation.id}>
                    <TableCell component="th" scope="row">
                      {formation.titre}
                    </TableCell>
                    <TableCell>{formation.description}</TableCell>
                    <TableCell>{formation.date_debut}</TableCell>
                    <TableCell>{formation.date_fin}</TableCell>
                    <TableCell>{formation.duree_heures}</TableCell>
                    <TableCell>{formation.lieu}</TableCell>
                    <TableCell align="center">
                      <IconButton 
                        color="primary" 
                        component={Link} 
                        to={`/formations/${formation.id}`}
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      {/* Dialog pour afficher la liste des retours */}
      <Dialog
        open={openFeedbacksDialog}
        onClose={handleCloseFeedbacksDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Retours des participants</DialogTitle>
        <DialogContent>
          {feedbacks.length === 0 ? (
            <Alert severity="info">Aucun retour des participants pour le moment.</Alert>
          ) : (
            <List>
              {feedbacks.map((feedback, index) => (
                <React.Fragment key={feedback.id}>
                  <ListItem 
                    button 
                    onClick={() => handleOpenFeedbackDetail(feedback)}
                    sx={{ 
                      bgcolor: feedback.lu ? 'transparent' : 'rgba(0, 0, 0, 0.04)'
                    }}
                  >
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center">
                          {!feedback.lu && <MailIcon color="primary" sx={{ mr: 1 }} />}
                          {feedback.lu && <MarkEmailReadIcon sx={{ mr: 1 }} />}
                          <Typography component="span" fontWeight={!feedback.lu ? 'bold' : 'normal'}>
                            {feedback.formation_titre}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <>
                          <Typography component="span" variant="body2" color="text.primary">
                            De: {feedback.participant_nom}
                          </Typography>
                          <Typography component="span" variant="body2" display="block">
                            {new Date(feedback.date).toLocaleDateString()} - Note: {feedback.note}/5
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                  {index < feedbacks.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseFeedbacksDialog}>Fermer</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog pour afficher le détail d'un retour */}
      <Dialog
        open={openFeedbackDetailDialog}
        onClose={handleCloseFeedbackDetailDialog}
        maxWidth="sm"
        fullWidth
      >
        {selectedFeedback && (
          <>
            <DialogTitle>
              {selectedFeedback.formation_titre}
            </DialogTitle>
            <DialogContent>
              <Box mb={2}>
                <Typography variant="subtitle1">
                  De: {selectedFeedback.participant_nom}
                </Typography>
                <Typography variant="subtitle2" color="text.secondary">
                  Reçu le {new Date(selectedFeedback.date).toLocaleDateString()}
                </Typography>
              </Box>
              
              <Box mb={3} display="flex" alignItems="center">
                <Typography component="legend" mr={1}>Note:</Typography>
                <Rating
                  value={selectedFeedback.note}
                  precision={0.5}
                  readOnly
                />
                <Typography component="span" ml={1}>
                  {selectedFeedback.note}/5
                </Typography>
              </Box>
              
              <Typography variant="h6" gutterBottom>
                Commentaire:
              </Typography>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography>
                  {selectedFeedback.commentaire}
                </Typography>
              </Paper>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseFeedbackDetailDialog}>Fermer</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
};

export default FormateurAnimateurPage; 