// src/main.tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import theme from './theme';
import CssBaseline from '@mui/material/CssBaseline';
// import './styles/index.css';
import { ThemeProvider } from '@mui/material/styles';
import { UserProvider } from './components/UserContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <UserProvider>
        <App />
      </UserProvider>
    </ThemeProvider>
  </StrictMode>
);