import React from 'react';
import { Box, Typography, Button, List, ListItem, ListItemText } from '@mui/material';

const FormationDetails = ({ formation, onMarkPresence, onAddRessource }) => {
  return (
    <Box mt={3}>
      <Typography variant="h5">{formation.titre}</Typography>
      <Typography>{formation.description}</Typography>

      <Box mt={2}>
        <Button variant="contained" onClick={onMarkPresence} sx={{ mr: 2 }}>
          Marquer Présence
        </Button>
        <Button variant="contained" color="secondary" onClick={onAddRessource}>
          Ajouter Ressource
        </Button>
      </Box>

      <Typography variant="h6" mt={3}>Ressources</Typography>
      <List>
        {formation.ressources?.map((r) => (
          <ListItem key={r.id}>
            <ListItemText primary={r.titre} secondary={r.description} />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default FormationDetails;
