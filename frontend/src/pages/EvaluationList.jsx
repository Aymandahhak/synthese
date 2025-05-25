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
  DialogTitle,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import api from '../api/axios';

const EvaluationList = () => {
  const [evaluations, setEvaluations] = useState([]);
  const [formations, setFormations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [evaluationToDelete, setEvaluationToDelete] = useState(null);
  
  const [formData, setFormData] = useState({
    id: null,
    formation_id: '',
    titre: '',
    type: '',
    date: '',
    duree: '',
    description: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Récupérer les formations
      const formationsResponse = await api.get('/formations');
      setFormations(formationsResponse.data);
      
      // Récupérer les évaluations
      const evaluationsResponse = await api.get('/evaluations');
      setEvaluations(evaluationsResponse.data.data);
      
    } catch (error) {
      console.error("Error fetching data:", error);
      setError(`Erreur: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (evaluation = null) => {
    if (evaluation) {
      setFormData({
        id: evaluation.id,
        formation_id: evaluation.formation_id,
        titre: evaluation.titre,
        type: evaluation.type,
        date: evaluation.date,
        duree: evaluation.duree,
        description: evaluation.description || ''
      });
    } else {
      setFormData({
        id: null,
        formation_id: '',
        titre: '',
        type: '',
        date: '',
        duree: '',
        description: ''
      });
    }
    setOpenDialog(true);
  };

  const handleEdit = (evaluation) => {
    handleOpenDialog(evaluation);
  };

  const handleDeleteClick = (evaluation) => {
    setEvaluationToDelete(evaluation);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!evaluationToDelete) return;
    try {
      await api.delete(`/evaluations/${evaluationToDelete.id}`);
      setEvaluations(evaluations.filter(e => e.id !== evaluationToDelete.id));
      setDeleteDialogOpen(false);
      setEvaluationToDelete(null);
    } catch (error) {
      setError(`Erreur lors de la suppression: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setEvaluationToDelete(null);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formData.id) {
        // Edition
        const response = await api.put(`/evaluations/${formData.id}`, formData);
        const updatedEval = response.data.data || response.data;
        setEvaluations(evaluations.map(e =>
          e.id === formData.id
            ? { ...updatedEval, formation: updatedEval.formation || null }
            : e
        ));
      } else {
        // Ajout
        const response = await api.post('/evaluations', formData);
        const newEval = response.data.data || response.data;
        setEvaluations([
          ...evaluations,
          {
            ...newEval,
            formation: newEval.formation || null
          }
        ]);
      }
      setOpenDialog(false);
    } catch (error) {
      setError(`Erreur lors de l'enregistrement: ${error.response?.data?.message || error.message}`);
    }
  };

  if (loading) return (
    <Box textAlign="center" mt={4}>
      <CircularProgress />
      <Typography mt={2}>Chargement des évaluations...</Typography>
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
          startIcon={<ArrowBackIcon />} 
          component={Link} 
          to="/formateur-animateur"
          sx={{ mb: 2 }}
        >
          Retour au profil
        </Button>
        
        <Typography variant="h4" component="h1" gutterBottom>
          Gestion des évaluations
        </Typography>
      </Box>

      {/* Liste des évaluations */}
      <Box mb={4}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5" component="h2">
            Liste des évaluations
          </Typography>
          <Button 
            variant="contained" 
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Ajouter une évaluation
          </Button>
        </Box>

        {evaluations.length === 0 ? (
          <Alert severity="info">Aucune évaluation enregistrée.</Alert>
        ) : (
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="table des évaluations">
              <TableHead>
                <TableRow>
                  <TableCell>Formation</TableCell>
                  <TableCell>Titre</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Durée (min)</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(evaluations || []).map((evaluation) => (
                  <TableRow key={evaluation?.id}>
                    <TableCell>
                      {evaluation && evaluation.formation && evaluation.formation.titre ? evaluation.formation.titre : ''}
                    </TableCell>
                    <TableCell>{evaluation?.titre || ''}</TableCell>
                    <TableCell>{evaluation?.type || ''}</TableCell>
                    <TableCell>{evaluation?.date || ''}</TableCell>
                    <TableCell>{evaluation?.duree || ''}</TableCell>
                    <TableCell align="center">
                      <IconButton 
                        color="primary"
                        component={Link}
                        to={`/evaluations/${evaluation?.id}`}
                      >
                        <VisibilityIcon />
                      </IconButton>
                      <IconButton 
                        color="secondary"
                        onClick={() => handleEdit(evaluation)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        color="error"
                        onClick={() => handleDeleteClick(evaluation)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      {/* Dialog pour ajouter une évaluation */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>Ajouter une évaluation</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel id="formation-label">Formation</InputLabel>
                  <Select
                    labelId="formation-label"
                    name="formation_id"
                    value={formData.formation_id}
                    onChange={handleChange}
                    label="Formation"
                    required
                  >
                    {formations.map(formation => (
                      <MenuItem key={formation.id} value={formation.id}>
                        {formation.titre}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  name="titre"
                  label="Titre"
                  value={formData.titre}
                  onChange={handleChange}
                  fullWidth
                  required
                />
              </Grid>
              
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel id="type-label">Type</InputLabel>
                  <Select
                    labelId="type-label"
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    label="Type"
                    required
                  >
                    <MenuItem value="Quiz">Quiz</MenuItem>
                    <MenuItem value="Activité">Activité</MenuItem>
                    <MenuItem value="Examen">Examen</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  name="date"
                  label="Date"
                  type="date"
                  value={formData.date}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  required
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  name="duree"
                  label="Durée (minutes)"
                  type="number"
                  value={formData.duree}
                  onChange={handleChange}
                  fullWidth
                  required
                  inputProps={{ min: 1 }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  name="description"
                  label="Description"
                  value={formData.description}
                  onChange={handleChange}
                  fullWidth
                  multiline
                  rows={3}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Annuler</Button>
            <Button type="submit" variant="contained" color="primary">
              Ajouter
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Dialog pour supprimer une évaluation */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Confirmer la suppression</DialogTitle>
        <DialogContent>
          <Typography>Voulez-vous vraiment supprimer cette évaluation ?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Annuler</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">Supprimer</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default EvaluationList; 