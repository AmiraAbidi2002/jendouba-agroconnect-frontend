import { useState } from 'react';
import { 
  Grid, 
  Paper, 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Link, 
  useMediaQuery,
  useTheme
} from '@mui/material';
import { LockOutlined } from '@mui/icons-material';
import PinterestInspiration from '../components/PinterestInspiration';

const LoginPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Logique de connexion à implémenter
    console.log({ email, password });
  };

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
          p: isMobile ? 2 : 4,
          backgroundColor: theme.palette.background.paper
        }}
      >
        <Paper 
          elevation={isMobile ? 0 : 3} 
          sx={{ 
            width: '100%',
            maxWidth: 500,
            mx: 'auto',
            p: 4,
            border: isMobile ? 'none' : undefined,
            backgroundColor: isMobile ? 'transparent' : undefined
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <LockOutlined sx={{ fontSize: 40, color: theme.palette.primary.main }} />
            <Typography component="h1" variant="h5">
              Connexion
            </Typography>
          </Box>

          <form onSubmit={handleSubmit}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Adresse Email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              variant="outlined"
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Mot de passe"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              variant="outlined"
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, py: 1.5 }}
            >
              Se connecter
            </Button>
            <Grid container>
              <Grid item xs>
                <Link href="#" variant="body2">
                  Mot de passe oublié?
                </Link>
              </Grid>
              <Grid item>
                <Link href="/register" variant="body2">
                  Créer un compte
                </Link>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Grid>

      {/* Colonne inspiration - cachée sur mobile */}
      {!isMobile && (
        <Grid 
          item 
          xs={false} 
          md={6} 
          sx={{ 
            display: 'flex',
            alignItems: 'center',
            p: 4,
            backgroundColor: theme.palette.grey[100]
          }}
        >
          <Box sx={{ 
            width: '100%', 
            maxWidth: 600, 
            mx: 'auto',
            position: 'sticky',
            top: theme.spacing(4)
          }}>
            <PinterestInspiration
              pinId="353954851968779024"
              title="Design de connexion moderne"
              description="Inspiration pour notre interface utilisateur"
            />
            
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ 
                mt: 2, 
                textAlign: 'center',
                px: 4
              }}
            >
              Ce design nous inspire pour créer une expérience utilisateur fluide et intuitive,
              en harmonie avec les besoins de nos utilisateurs agriculteurs et acheteurs.
            </Typography>
          </Box>
        </Grid>
      )}
    </Grid>
  );
};

export default LoginPage;