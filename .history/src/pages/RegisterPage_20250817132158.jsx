import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
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
  FormLabel
} from '@mui/material';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#4CAF50',
    },
  },
});

export default function Register() {
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
    <ThemeProvider theme={theme}>
      <Container component="main" maxWidth="sm">
        <Box
          sx={{
            marginTop: 8,
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
                <Button 
                  onClick={() => navigate('/login')}
                  sx={{ textTransform: 'none' }}
                >
                  Déjà un compte? Se connecter
                </Button>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Container>
    </ThemeProvider>
  );
}