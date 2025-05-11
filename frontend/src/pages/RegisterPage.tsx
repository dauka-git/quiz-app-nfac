import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../components/UserContext';
import { Button, Box, Dialog, DialogTitle, DialogContent, TextField, DialogActions } from '@mui/material';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';

const RegisterPage = () => {
  const { isAuthenticated, login } = useUser();
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      const pendingPath = localStorage.getItem('pendingPath');
      if (pendingPath) {
        navigate(pendingPath);
        localStorage.removeItem('pendingPath');
      } else {
        navigate('/');
      }
    }
  }, [isAuthenticated, navigate]);

  const handleAuthSubmit = async (values: { username: string; password: string; email?: string }) => {
    try {
      const endpoint = isRegister ? '/api/register' : '/api/login';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify(values),
      });
      const data = await response.json();
      if (response.ok && (data.token || data.userId)) {
        localStorage.setItem('token', data.token);
        if (!isRegister) {
          await login(values.username, values.password);
        }
      } else {
        console.error('Authentication failed:', data.error);
      }
    } catch (err) {
      console.error(`${isRegister ? 'Registration' : 'Login'} failed:`, err);
    }
  };

  const validationSchema = Yup.object({
    username: Yup.string().required('Required'),
    password: Yup.string().min(6, 'Must be at least 6 characters').required('Required'),
    email: isRegister ? Yup.string().email('Invalid email').required('Required') : Yup.string(),
  });

  return (
    <Box sx={{ p: 3, maxWidth: 400, mx: 'auto', mt: 5 }}>
      <Dialog open={true} onClose={() => navigate('/')}>
        <DialogTitle>{isRegister ? 'Register' : 'Sign In'}</DialogTitle>
        <DialogContent>
          <Formik
            initialValues={{ username: '', password: '', email: '' }}
            validationSchema={validationSchema}
            onSubmit={handleAuthSubmit}
          >
            {({ errors, touched }) => (
              <Form>
                <Field
                  as={TextField}
                  name="username"
                  label="Username"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  error={touched.username && !!errors.username}
                  helperText={touched.username && errors.username}
                />
                <Field
                  as={TextField}
                  name="password"
                  label="Password"
                  type="password"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  error={touched.password && !!errors.password}
                  helperText={touched.password && errors.password}
                />
                {isRegister && (
                  <Field
                    as={TextField}
                    name="email"
                    label="Email"
                    type="email"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    error={touched.email && !!errors.email}
                    helperText={touched.email && errors.email}
                  />
                )}
                <DialogActions>
                  <Button onClick={() => setIsRegister(!isRegister)} color="primary">
                    {isRegister ? 'Switch to Sign In' : 'Switch to Register'}
                  </Button>
                  <Button type="submit" color="primary">
                    {isRegister ? 'Register' : 'Sign In'}
                  </Button>
                </DialogActions>
              </Form>
            )}
          </Formik>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default RegisterPage;