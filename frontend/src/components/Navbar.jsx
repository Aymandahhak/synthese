import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box,
  Container
} from '@mui/material';

const Navbar = () => {
  const location = useLocation();
  const isAnimateurActive = location.pathname === '/formateur-animateur';
  const isParticipantActive = location.pathname === '/formateur-participant';

  return (
    <AppBar position="static" color="primary" sx={{ mb: 4 }}>
      <Container maxWidth="lg">
        <Toolbar>
          <Typography variant="h6" component={Link} to="/" sx={{ flexGrow: 1, textDecoration: 'none', color: 'white' }}>
            OFPPT Gestion des Formations
          </Typography>
          <Box>
            <Button 
              component={Link} 
              to="/formateur-animateur"
              color="inherit"
              variant={isAnimateurActive ? "contained" : "text"}
              sx={{ 
                mr: 2, 
                backgroundColor: isAnimateurActive ? 'rgba(255, 255, 255, 0.15)' : 'transparent'
              }}
            >
              Formateur Animateur
            </Button>
            <Button 
              component={Link} 
              to="/formateur-participant"
              color="inherit"
              variant={isParticipantActive ? "contained" : "text"}
              sx={{ 
                backgroundColor: isParticipantActive ? 'rgba(255, 255, 255, 0.15)' : 'transparent'
              }}
            >
              Formateur Participant
            </Button>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar; 