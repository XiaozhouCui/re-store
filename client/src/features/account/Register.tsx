import {
  Alert,
  AlertTitle,
  Avatar,
  Box,
  Container,
  Grid,
  List,
  ListItem,
  ListItemText,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { Link, useHistory } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { LoadingButton } from '@mui/lab';
import agent from '../../app/api/agent';
import { useState } from 'react';

const Register = () => {
  // use history obj to push user to new page after login
  const history = useHistory();
  const [validationErrors, setValidationErrors] = useState([]);
  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors, isValid },
  } = useForm({
    mode: 'all',
  });

  return (
    <Container
      component={Paper}
      maxWidth="sm"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        p: 4,
      }}
    >
      <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
        <LockOutlinedIcon />
      </Avatar>
      <Typography component="h1" variant="h5">
        Register
      </Typography>
      <Box
        component="form"
        onSubmit={handleSubmit((data) =>
          agent.Account.register(data).catch((error) =>
            setValidationErrors(error)
          )
        )}
        noValidate
        sx={{ mt: 1 }}
      >
        <TextField
          margin="normal"
          fullWidth
          label="Username"
          autoFocus
          {...register('username', { required: 'Username is required' })}
          error={!!errors.username}
          helperText={errors?.username?.message}
        />
        <TextField
          margin="normal"
          fullWidth
          label="Email address"
          {...register('email', { required: 'Email is required' })}
          error={!!errors.email}
          helperText={errors?.email?.message}
        />
        <TextField
          margin="normal"
          fullWidth
          label="Password"
          type="password"
          {...register('password', { required: 'Password is required' })}
          error={!!errors.password}
          helperText={errors?.password?.message}
        />
        {validationErrors.length > 0 && (
          <Alert severity="error">
            <AlertTitle>Validatin Errors</AlertTitle>
            <List>
              {validationErrors.map((error) => (
                <ListItem key={error}>
                  <ListItemText>{error}</ListItemText>
                </ListItem>
              ))}
            </List>
          </Alert>
        )}
        <LoadingButton
          disabled={!isValid}
          loading={isSubmitting}
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
        >
          Register
        </LoadingButton>
        <Grid container>
          <Grid item>
            <Link to="/login">{'Already have an account? Sign In'}</Link>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default Register;
