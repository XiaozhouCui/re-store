import { FormEvent, useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Container,
  Grid,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { Link } from 'react-router-dom';
import agent from '../../app/api/agent';

const Login = () => {
  const [values, setValues] = useState({
    username: '',
    password: '',
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    agent.Account.login(values);
  };

  const handleInputChange = (event: any) => {
    // name can be username or password
    const { name, value } = event.target;
    setValues({ ...values, [name]: value });
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
      <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
        <TextField
          margin="normal"
          fullWidth
          label="Username"
          name="username"
          autoFocus
          onChange={handleInputChange}
          value={values.username}
        />
        <TextField
          margin="normal"
          fullWidth
          name="password"
          label="Password"
          type="password"
          onChange={handleInputChange}
          value={values.password}
        />
        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
        >
          Sign In
        </Button>
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
