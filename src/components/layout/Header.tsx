import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Logout, Cloud } from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';

export const Header = () => {
  const { user, logout } = useAuth();

  return (
    <AppBar position="static">
      <Toolbar sx={{display:'flex',flexDirection:{xs:"column",md:'row'}}}>
        <Cloud sx={{ mr: 2 }} />
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Weather App
        </Typography>
        {user && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2">
              Welcome, {user.name}
            </Typography>
            <Button
              color="inherit"
              startIcon={<Logout />}
              onClick={logout}
            >
              Logout
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};
