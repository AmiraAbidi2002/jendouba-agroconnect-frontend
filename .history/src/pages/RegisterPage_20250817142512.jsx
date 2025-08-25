import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Grid,
  TextField, 
  Button, 
  Container, 
  Typography, 
  Box,
  Paper,
  Avatar,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel,
  useMediaQuery,
  useTheme
} from '@mui/material';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import PinterestInspiration from '../components/';

export default function Register() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    role: 'farmer'
  });

  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Logique d'inscription à implémenter
    navigate(`/${formData.role}-dashboard`);
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
        <Container maxWidth="sm">
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
              <HowToRegIcon />
            </Avatar>
            <Typography component="h1" variant="h5">
              Créer un compte
            </Typography>
            
            <Paper elevation={3} sx={{ p: 4, mt: 3, width: '100%', borderRadius: 2 }}>
              <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
                <FormLabel component="legend" sx={{ mb: 2 }}>Je suis:</FormLabel>
                <RadioGroup
                  row
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  sx={{ mb: 3 }}
                >
                  <FormControlLabel 
                    value="farmer" 
                    control={<Radio color="primary" />} 
                    label="Agriculteur" 
                  />
                  <FormControlLabel 
                    value="buyer" 
                    control={<Radio color="primary" />} 
                    label="Acheteur" 
                  />
                </RadioGroup>
                
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  label="Email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  sx={{ mb: 2 }}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  label="Mot de passe"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  sx={{ mb: 2 }}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  label="Confirmer le mot de passe"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  sx={{ mb: 3 }}
                />
                
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 2, mb: 2, py: 1.5 }}
                >
                  S'inscrire
                </Button>
                
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="body2">
                    Déjà un compte?{' '}
                    <Link to="/login" style={{ textDecoration: 'none' }}>
                      <Button variant="text" size="small">
                        Se connecter
                      </Button>
                    </Link>
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Box>
        </Container>
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
              pinId="782354190635421"
              title="Exemple de formulaire d'inscription"
              description="Bonnes pratiques UX pour l'inscription"
            />
            
            <Box sx={{ 
              p: 3,
              mt: 2,
              backgroundColor: 'background.paper',
              borderRadius: 2,
              boxShadow: theme.shadows[1]
            }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Conseils pour votre inscription:
              </Typography>
              <ul style={{ 
                paddingLeft: 24,
                margin: 0,
                color: theme.palette.text.secondary
              }}>
                <li><Typography variant="body2">Utilisez un email valide</Typography></li>
                <li><Typography variant="body2">Choisissez un mot de passe sécurisé</Typography></li>
                <li><Typography variant="body2">Sélectionnez le bon profil (agriculteur/acheteur)</Typography></li>
              </ul>
            </Box>
          </Box>
        </Grid>
      )}
    </Grid>
  );
}