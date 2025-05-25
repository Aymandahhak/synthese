import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';

const PresenceDialog = ({ open, onClose, onSubmit, data, setData }) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Marquer Présence</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth label="Date" type="date"
          value={data.date}
          onChange={(e) => setData({ ...data, date: e.target.value })}
          sx={{ mt: 2 }}
          InputLabelProps={{ shrink: true }}
        />
        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel>Statut</InputLabel>
          <Select
            value={data.statut}
            onChange={(e) => setData({ ...data, statut: e.target.value })}
          >
            <MenuItem value="present">Présent</MenuItem>
            <MenuItem value="absent">Absent</MenuItem>
            <MenuItem value="retard">En retard</MenuItem>
          </Select>
        </FormControl>
        <TextField
          fullWidth label="Commentaire" multiline rows={3}
          value={data.commentaire}
          onChange={(e) => setData({ ...data, commentaire: e.target.value })}
          sx={{ mt: 2 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Annuler</Button>
        <Button onClick={onSubmit} variant="contained">Enregistrer</Button>
      </DialogActions>
    </Dialog>
  );
};

export default PresenceDialog;
