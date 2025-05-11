import { useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';

const Navbar = () => {
  const navigate = useNavigate();

  const handleNavClick = (path: string) => {
    navigate(path);
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" style={{ flexGrow: 1 }}>
          <Button color="inherit" onClick={() => handleNavClick('/')}>
            Home
          </Button>
        </Typography>
        <Button color="inherit" onClick={() => handleNavClick('/profile')}>
          Profile
        </Button>
        <Button color="inherit" onClick={() => handleNavClick('/register')}>
          Sign Up
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;