import React from 'react';
import { 
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  IconButton,
  FormControl,
  FormGroup,
  Link,
  Typography
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const useStyles = {
  button: {
    fontWeight: 700,
  },
  lightBulb: {
    verticalAlign: 'middle',
    marginRight: 1,
  },
  margin: {
    margin: 1,
  }
};

export default function Home() {
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div>
      <head>
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width" />
      </head>
      
      <div style={{ width: 300 }}>
        <Button sx={useStyles.button} variant="contained" color="primary" fullWidth>
          Зарегистрироваться
        </Button>
        <br />
        <br />
        <Button sx={useStyles.button} variant="outlined" color="primary" fullWidth>
          Войти
        </Button>
        <br />
        <br />
        <TextField
          label="Имя пользователя"
          InputLabelProps={{
            shrink: true,
          }}
          variant="filled"
          fullWidth
        />
        <br />
        <br />
        <Link href="#">Забыли пароль?</Link>
        <br />
        <br />
        <Button 
          variant="outlined" 
          color="primary" 
          onClick={handleClickOpen}
        >
          Открыть настройки
        </Button>
        
        <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
          <DialogTitle id="form-dialog-title">
            <IconButton
              onClick={handleClose}
              color="secondary"
              aria-label="close"
              sx={useStyles.margin}
            >
              <CloseIcon style={{ fontSize: 26 }} color="secondary" />
            </IconButton>
            Настройка поиска
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              To subscribe to this website, please enter your email updates occasionally.
            </DialogContentText>
            <FormControl component="fieldset" fullWidth>
              <FormGroup aria-label="position" row>
                <TextField
                  autoFocus
                  margin="dense"
                  id="name"
                  label="Email Address"
                  type="email"
                  fullWidth
                />
              </FormGroup>
            </FormControl>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}