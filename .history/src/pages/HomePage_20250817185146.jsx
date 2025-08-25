import { useNavigate } from 'react-router-dom';
import { 
  Button, 
  Container, 
  Typography, 
  Box,
  Paper,
  Grid
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2E7D32',
    },
    secondary: {
      main: '#388E3C',
    },
  },
});

export default function Home() {
  const navigate = useNavigate();

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="lg">
        <Box 
          sx={{ 
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            p: 4,
            borderRadius: 2
          }}
        >
          <Typography 
            variant="h2" 
            gutterBottom 
            sx={{ 
              fontWeight: 700,
              color: 'primary.main',
              textAlign: 'center',
              mb: 4
            }}
          >
            Bienvenue sur AgroConnect
          </Typography>
          
          <Typography 
            variant="h5" 
            sx={{ 
              mb: 6,
              color: 'text.secondary',
              textAlign: 'center',
              maxWidth: '600px'
            }}
          >
            La plateforme qui connecte directement les agriculteurs et les acheteurs de produits frais
          </Typography>
          
          <Paper elevation={3} sx={{ p: 4, borderRadius: 3, width: '100%', maxWidth: '500px' }}>
            <Typography variant="h6" sx={{ mb: 3, textAlign: 'center' }}>
              Je suis :
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Button 
                  fullWidth
                  variant="contained"
                  size="large"
                  sx={{ 
                    py: 2,
                    borderRadius: 2,
                    backgroundColor: 'primary.main',
                    '&:hover': {
                      backgroundColor: 'primary.dark'
                    }
                  }}
                  onClick={() => navigate('/auth?role=farmer')}
                >
                  Agriculteur
                </Button>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Button 
                  fullWidth
                  variant="contained"
                  size="large"
                  sx={{ 
                    py: 2,
                    borderRadius: 2,
                    backgroundColor: 'secondary.main',
                    '&:hover': {
                      backgroundColor: 'secondary.dark'
                    }
                  }}
                  onClick={() => navigate('/auth?role=buyer')}
                >
                  Acheteur
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Box>
      </Container>
    </ThemeProvider>
  );
}
