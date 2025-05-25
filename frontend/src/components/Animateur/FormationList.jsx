import React from 'react';
import { List, ListItem, ListItemText } from '@mui/material';

const FormationList = ({ formations, onSelect }) => {
  return (
    <List>
      {formations.map((f) => (
        <ListItem button key={f.id} onClick={() => onSelect(f.id)}>
          <ListItemText primary={f.titre} secondary={`${f.date_debut} - ${f.date_fin}`} />
        </ListItem>
      ))}
    </List>
  );
};

export default FormationList;
