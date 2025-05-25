import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';

const RessourceDialog = ({ open, onClose, onSubmit, data, setData }) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Ajouter Ressource</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth label="Titre"
          value={data.titre}
          onChange={(e) => setData({ ...data, titre: e.target.value })}
          sx={{ mt: 2 }}
        />
        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel>Type</InputLabel>
          <Select
            value={data.type}
            onChange={(e) => setData({ ...data, type: e.target.value })}
          >
            <MenuItem value="pdf">PDF</MenuItem>
            <MenuItem value="doc">Word</MenuItem>
            <MenuItem value="ppt">PowerPoint</MenuItem>
            <MenuItem value="autre">Autre</MenuItem>
          </Select>
        </FormControl>
        <TextField
          fullWidth label="Fichier"
          value={data.chemin_fichier}
          onChange={(e) => setData({ ...data, chemin_fichier: e.target.value })}
          sx={{ mt: 2 }}
        />
        <TextField
          fullWidth label="Description" multiline rows={3}
          value={data.description}
          onChange={(e) => setData({ ...data, description: e.target.value })}
          sx={{ mt: 2 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Annuler</Button>
        <Button onClick={onSubmit} variant="contained">Ajouter</Button>
      </DialogActions>
    </Dialog>
  );
};

export default RessourceDialog;
