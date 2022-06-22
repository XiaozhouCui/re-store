import { createAsyncThunk, createSlice, isAnyOf } from '@reduxjs/toolkit';
import { FieldValues } from 'react-hook-form';
import agent from '../../app/api/agent';
import { User } from '../../app/models/user';
import { history } from '../..';
import { toast } from 'react-toastify';
import { setBasket } from '../basket/basketSlice';

interface AccountState {
  user: User | null;
}

const initialState: AccountState = {
  user: null,
};

// thunk: login, pass in FieldValues and return User
export const signInUser = createAsyncThunk<User, FieldValues>(
  'account/signInUser',
  async (data, thunkAPI) => {
    try {
      // userDto is the response from API, it has email, token and basket (can be null)
      const userDto = await agent.Account.login(data);
      // user will have email and token, basket is destructured to update redux state
      const { basket, ...user } = userDto;
      // load basket (from API) into state
      if (basket) thunkAPI.dispatch(setBasket(basket));
      // save email and token into local storage
      localStorage.setItem('user', JSON.stringify(user));
      return user;
    } catch (error: any) {
      return thunkAPI.rejectWithValue({ error: error.data });
    }
  }
);

// thunk: get current user
export const fetchCurrentUser = createAsyncThunk<User>(
  'account/fetchCurrentUser',
  async (_, thunkAPI) => {
    // when refreshing the page, if the user is already in local storage, load it into redux
    thunkAPI.dispatch(setUser(JSON.parse(localStorage.getItem('user')!)));
    try {
      const userDto = await agent.Account.currentUser();
      // destructure basket and user
      const { basket, ...user } = userDto;
      // update basket in state
      if (basket) thunkAPI.dispatch(setBasket(basket));
      // store token into local storage
      localStorage.setItem('user', JSON.stringify(user));
      return user;
    } catch (error: any) {
      return thunkAPI.rejectWithValue({ error: error.data });
    }
  },
  {
    // if no user in local storage, do not make this request (fetchCurrentUser)
    condition: () => {
      if (!localStorage.getItem('user')) return false;
    },
  }
);

export const accountSlice = createSlice({
  name: 'account',
  initialState,
  reducers: {
    // signOut doesn't call API
    signOut: (state) => {
      state.user = null;
      localStorage.removeItem('user');
      history.push('/'); // browserHistory outside React
    },
    // add user to state (from local storage)
    setUser: (state, action) => {
      // use "atob" to get JWT payload (mid section) into JSON
      let claims = JSON.parse(atob(action.payload.token.split('.')[1]));
        // JWT payload object has a key "http://schemas..." for roles, it comes from .NET Identity
      let roles =
        claims['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
      state.user = {
        ...action.payload,
        // if a user has multiple roles they will come as an array, while single role comes as a string
        roles: typeof roles === 'string' ? [roles] : roles,
      };
    },
  },
  // using createAsyncThunk will require extra reducers
  extraReducers: (builder) => {
    // if token has expired, log out the current user
    builder.addCase(fetchCurrentUser.rejected, (state, action) => {
      state.user = null;
      localStorage.removeItem('user');
      toast.error('Session expired - please login again');
      history.push('/');
    });
    // handle 2 successful cases together: signInUser and fetchCurrentUser
    builder.addMatcher(
      isAnyOf(signInUser.fulfilled, fetchCurrentUser.fulfilled),
      (state, action) => {
        // use "atob" to get JWT payload (mid section) into JSON
        let claims = JSON.parse(atob(action.payload.token.split('.')[1]));
        // JWT payload object has a key "http://schemas..." for roles, it comes from .NET Identity
        let roles =
          claims[
            'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'
          ];
        state.user = {
          ...action.payload,
          // if a user has multiple roles they will come as an array, while single role comes as a string
          roles: typeof roles === 'string' ? [roles] : roles,
        };
      }
    );
    builder.addMatcher(isAnyOf(signInUser.rejected), (state, action) => {
      // throw the error so that it can be captured by axios interceptor
      throw action.payload; // axios interceptor will handle it by status code: toaster or server-error page
    });
  },
});

export const { signOut, setUser } = accountSlice.actions;
