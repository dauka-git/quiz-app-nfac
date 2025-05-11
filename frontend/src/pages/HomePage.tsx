import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../components/UserContext';
import { Button, AppBar, Toolbar, Typography, Box } from '@mui/material';

const HomePage = () => {
  const { isAuthenticated, userId } = useUser();
  const navigate = useNavigate();
  const [hasClickedButton, setHasClickedButton] = useState(() => {
    return localStorage.getItem('hasClickedButton') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('hasClickedButton', hasClickedButton.toString());
  }, [hasClickedButton]);

  useEffect(() => {
    console.log('HomePage: Auth state', { isAuthenticated, userId });
  }, [isAuthenticated, userId]);

  const handleNavClick = (path: string) => {
    console.log('handleNavClick called:', { path, hasClickedButton, isAuthenticated });
    if (path === '/') {
      navigate(path);
      return;
    }

    if (!hasClickedButton) {
      setHasClickedButton(true);
      localStorage.setItem('pendingPath', path);
      navigate('/register');
    } else if (isAuthenticated) {
      navigate(path);
    } else {
      localStorage.setItem('pendingPath', path);
      navigate('/register');
    }
  };

  const goToRegister = () => {
    console.log('goToRegister called');
    navigate('/register');
  };

  return (
    <div>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" style={{ flexGrow: 1 }}>
            <Button color="inherit" onClick={() => handleNavClick('/')}>
              Home
            </Button>
          </Typography>
          
          <Button color="inherit" onClick={() => handleNavClick(`/profile/${userId || ''}`)}>
            Profile
          </Button>
          {!isAuthenticated && (
            <Button color="inherit" onClick={goToRegister}>
              Sign Up
            </Button>
          )}
        </Toolbar>
      </AppBar>
  
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 'calc(100vh - 64px)',
          textAlign: 'center',
          gap: 2,
        }}
      >
        <Typography variant="h4">Welcome to Quiz Maker</Typography>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleNavClick('/create')}
            sx={{ fontSize: '28px', padding: '10px 20px', width: '200px' }}
          >
            Create Quiz
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleNavClick('/quizzes')}
            sx={{ fontSize: '28px', padding: '10px 20px', width: '200px' }}
          >
            Quizzes
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleNavClick('/multiplayer')}
            sx={{ fontSize: '28px', padding: '10px 20px', width: '200px' }}
          >
            Multiplayer
          </Button>
        </Box>
      </Box>
    </div>
  );
};

export default HomePage;