import { useState } from 'react';
import { 
  Box, 
  Typography, 
  Skeleton, 
  useTheme,
  IconButton,
  Tooltip
} from '@mui/material';
import { InfoOutlined, OpenInNew } from '@mui/icons-material';

const PinterestInspiration = ({ pinId, title, description }) => {
  const theme = useTheme();
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <Box sx={{
      position: 'relative',
      mb: 4,
      borderRadius: theme.shape.borderRadius,
      overflow: 'hidden',
      boxShadow: theme.shadows[2],
      transition: 'transform 0.3s, box-shadow 0.3s',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: theme.shadows[6]
      }
    }}>
      {/* Chargement optimisé */}
      {!loaded && !error && (
        <Skeleton 
          variant="rectangular" 
          height={550}
          sx={{ bgcolor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.200' }}
        />
      )}

      {/* Conteneur iframe */}
      <Box
        sx={{
          display: loaded && !error ? 'block' : 'none',
          position: 'relative',
          paddingBottom: '91.66%', // Ratio 600x550
          height: 0,
          overflow: 'hidden',
          bgcolor: theme.palette.background.paper
        }}
      >
        <iframe
          src={`https://assets.pinterest.com/ext/embed.html?id=${pinId}`}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            border: 'none'
          }}
          title={`Inspiration design: ${title}`}
          allowFullScreen
        />
      </Box>

      {/* Fallback si erreur */}
      {error && (
        <Box sx={{ 
          p: 4,
          textAlign: 'center',
          bgcolor: theme.palette.background.default
        }}>
          <Typography color="text.secondary">
            Impossible de charger l'inspiration. Voir directement sur 
            <a 
              href={`https://pinterest.com/pin/${pinId}`} 
              target="_blank"
              rel="noopener noreferrer"
              style={{ marginLeft: 4 }}
            >
              Pinterest
            </a>
          </Typography>
        </Box>
      )}

      {/* Légende */}
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        p: 2,
        bgcolor: theme.palette.background.paper
      }}>
        <Box>
          <Typography variant="subtitle2">{title}</Typography>
          <Typography variant="caption" color="text.secondary">
            {description}
          </Typography>
        </Box>
        <Tooltip title="Voir sur Pinterest">
          <IconButton
            size="small"
            href={`https://pinterest.com/pin/${pinId}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <OpenInNew fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
};

export default PinterestInspiration;