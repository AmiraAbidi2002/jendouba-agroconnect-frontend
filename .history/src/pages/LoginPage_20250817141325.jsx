import { Grid, Paper, useMediaQuery } from '@mui/material';
import PinterestInspiration from '../components/PinterestInspiration';

const LoginPage = () => {
  const isMobile = useMediaQuery(theme => theme.breakpoints.down('md'));

  return (
    <Grid container component="main" sx={{ minHeight: '100vh' }}>
      {/* Colonne formulaire */}
      <Grid 
        item 
        xs={12} 
        md={6} 
        sx={{ 
          display: 'flex',
          alignItems: 'center',
          p: isMobile ? 2 : 4
        }}
      >
        <Paper 
          elevation={3} 
          sx={{ 
            width: '100%',
            maxWidth: 500,
            mx: 'auto',
            p: 4
          }}
        >
          {/* Votre formulaire de connexion existant */}
          <form>{/* ... */}</form>
        </Paper>
      </Grid>

      {/* Colonne inspiration */}
      <Grid 
        item 
        xs={12} 
        md={6} 
        sx={{ 
          display: 'flex',
          alignItems: 'center',
          p: isMobile ? 2 : 4,
          bgcolor: 'background.default'
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 600, mx: 'auto' }}>
          <PinterestInspiration
            pinId="353954851968779024"
            title="Design de connexion moderne"
            description="Inspiration pour notre interface utilisateur"
          />
          
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ mt: 2, textAlign: 'center' }}
          >
            Ce design nous inspire pour créer une expérience utilisateur fluide
          </Typography>
        </Box>
      </Grid>
    </Grid>
  );
};