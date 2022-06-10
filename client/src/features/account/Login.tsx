import {
  Avatar,
  Box,
  Container,
  Grid,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { Link, useHistory } from 'react-router-dom';
import { FieldValues, useForm } from 'react-hook-form';
import { LoadingButton } from '@mui/lab';
import { useAppDispatch } from '../../app/store/configureStore';
import { signInUser } from './accountSlice';

const Login = () => {
  // use history obj to push user to new page after login
  const history = useHistory();
  const dispatch = useAppDispatch();
  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors, isValid },
  } = useForm({
    mode: 'all',
  });

  const submitForm = async (data: FieldValues) => {
    try {
      await dispatch(signInUser(data));
      // redirect user to catalog page after login
      history.push('/catalog');
    } catch (error) {
      console.log(error);
    }
  };

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
        Sign in
      </Typography>
      <Box
        component="form"
        onSubmit={handleSubmit(submitForm)}
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
          label="Password"
          type="password"
          {...register('password', { required: 'Password is required' })}
          error={!!errors.password}
          helperText={errors?.password?.message}
        />
        <LoadingButton
          disabled={!isValid}
          loading={isSubmitting}
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
        >
          Sign In
        </LoadingButton>
        <Grid container>
          <Grid item>
            <Link to="/register">{"Don't have an account? Sign Up"}</Link>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default Login;
