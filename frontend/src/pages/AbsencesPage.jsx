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
  DialogContentText,
  DialogTitle,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import CheckIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Cancel';
import dayjs from 'dayjs';
import 'dayjs/locale/fr';
import api from '../api/axios';

const AbsencesPage = () => {
  const [absences, setAbsences] = useState([]);
  const [formations, setFormations] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedAbsence, setSelectedAbsence] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    id: null,
    formation_id: '',
    participant_id: '',
    date: '',
    statut: '',
    justifiee: false
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [absencesRes, formationsRes, participantsRes] = await Promise.all([
        api.get('/absences'),
        api.get('/formations'),
        api.get('/participants')
      ]);
      setAbsences(absencesRes.data);
      setFormations(formationsRes.data);
      setParticipants(participantsRes.data);
    } catch (error) {
      setError(error.response?.data?.message || "Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (absence = null) => {
    if (absence) {
      setIsEditing(true);
      setFormData({
        id: absence.id,
        formation_id: absence.formation?.id || absence.formation_id,
        participant_id: absence.participant?.id || absence.participant_id,
        date: absence.date,
        statut: absence.statut,
        justifiee: absence.justifiee
      });
    } else {
      setIsEditing(false);
      setFormData({
        id: null,
        formation_id: '',
        participant_id: '',
        date: '',
        statut: '',
        justifiee: false
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleDeleteClick = (absence) => {
    setSelectedAbsence(absence);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
  };

  const handleConfirmDelete = async () => {
    try {
      await api.delete(`/absences/${selectedAbsence.id}`);
      setAbsences(absences.filter(a => a.id !== selectedAbsence.id));
      setOpenDeleteDialog(false);
    } catch (error) {
      if (error.response?.status === 404) {
        setError("Cette absence n'existe plus ou a déjà été supprimée.");
        setAbsences(absences.filter(a => a.id !== selectedAbsence.id));
        setOpenDeleteDialog(false);
      } else {
        setError(error.response?.data?.message || "Erreur lors de la suppression");
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'justifiee') {
      setFormData(prev => ({ ...prev, [name]: value === 'true' }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        const response = await api.put(`/absences/${formData.id}`, formData);
        setAbsences(absences.map(a => a.id === formData.id ? response.data : a));
      } else {
        const response = await api.post('/absences', formData);
        setAbsences([...absences, response.data]);
      }
      setOpenDialog(false);
    } catch (error) {
      setError(error.response?.data?.message || "Erreur lors de l'enregistrement");
    }
  };

  // Fonction utilitaire pour formater la date en français
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return dayjs(dateStr).locale('fr').format('DD/MM/YYYY');
  };

  if (loading) return (
    <Box textAlign="center" mt={4}>
      <CircularProgress />
      <Typography mt={2}>Chargement des absences...</Typography>
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
          Gestion des absences
        </Typography>
      </Box>

      {/* Liste des absences */}
      <Box mb={4}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5" component="h2">
            Liste des absences
          </Typography>
          <Button 
            variant="contained" 
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Ajouter une absence
          </Button>
        </Box>

        {absences.length === 0 ? (
          <Alert severity="info">Aucune absence enregistrée.</Alert>
        ) : (
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="table des absences">
              <TableHead>
                <TableRow>
                  <TableCell>Formation</TableCell>
                  <TableCell>Participant</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Statut</TableCell>
                  <TableCell>Justifiée</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {absences.map((absence, idx) => (
                  <TableRow key={absence.id} sx={{ backgroundColor: idx % 2 === 0 ? '#f9f9f9' : 'white' }}>
                    <TableCell>{absence.formation?.titre}</TableCell>
                    <TableCell>{absence.participant?.nom} {absence.participant?.prenom}</TableCell>
                    <TableCell>{formatDate(absence.date)}</TableCell>
                    <TableCell>
                      <Chip
                        label={
                          absence.statut === 'present'
                            ? 'Présent'
                            : absence.statut === 'absent'
                            ? 'Absent'
                            : absence.statut === 'retard'
                            ? 'Retard'
                            : 'Non défini'
                        }
                        color={
                          absence.statut === 'present'
                            ? 'success'
                            : absence.statut === 'absent'
                            ? 'error'
                            : absence.statut === 'retard'
                            ? 'warning'
                            : 'default'
                        }
                        size="small"
                        variant={absence.statut ? 'filled' : 'outlined'}
                      />
                    </TableCell>
                    <TableCell>
                      {absence.justifiee ? (
                        <CheckIcon color="success" titleAccess="Justifiée" />
                      ) : (
                        <CloseIcon color="error" titleAccess="Non justifiée" />
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <IconButton 
                        color="secondary"
                        onClick={() => handleOpenDialog(absence)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        color="error"
                        onClick={() => handleDeleteClick(absence)}
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

      {/* Dialog pour ajouter/modifier une absence */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>{isEditing ? 'Modifier une absence' : 'Ajouter une absence'}</DialogTitle>
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
                <FormControl fullWidth>
                  <InputLabel id="participant-label">Participant</InputLabel>
                  <Select
                    labelId="participant-label"
                    name="participant_id"
                    value={formData.participant_id}
                    onChange={handleChange}
                    label="Participant"
                    required
                  >
                    {participants.map(participant => (
                      <MenuItem key={participant.id} value={participant.id}>
                        {participant.nom} {participant.prenom}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
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
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel id="statut-label">Statut</InputLabel>
                  <Select
                    labelId="statut-label"
                    name="statut"
                    value={formData.statut}
                    onChange={handleChange}
                    label="Statut"
                    required
                  >
                    <MenuItem value="present">Présent</MenuItem>
                    <MenuItem value="absent">Absent</MenuItem>
                    <MenuItem value="retard">Retard</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel id="justifiee-label">Justifiée</InputLabel>
                  <Select
                    labelId="justifiee-label"
                    name="justifiee"
                    value={formData.justifiee.toString()}
                    onChange={handleChange}
                    label="Justifiée"
                    required
                  >
                    <MenuItem value="true">Oui</MenuItem>
                    <MenuItem value="false">Non</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Annuler</Button>
            <Button type="submit" variant="contained" color="primary">
              {isEditing ? 'Enregistrer' : 'Ajouter'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Dialog de confirmation de suppression */}
      <Dialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
      >
        <DialogTitle>Confirmation de suppression</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Êtes-vous sûr de vouloir supprimer cette absence ? Cette action est irréversible.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} color="primary">
            Annuler
          </Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AbsencesPage; 